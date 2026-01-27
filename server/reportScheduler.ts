import { getDb } from "./db";
import { reportSchedules, serviceOrders, osPayments, partners, clients } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendEmail } from "./email";

/**
 * Calcula as métricas financeiras para um período específico
 */
export async function calculateFinancialMetrics(
  startDate: Date,
  endDate: Date,
  partnerId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const query = db
    .select()
    .from(serviceOrders)
    .where(
      and(
        gte(serviceOrders.startDateTime, startDate),
        lte(serviceOrders.startDateTime, endDate),
        partnerId ? eq(serviceOrders.partnerId, partnerId) : undefined
      )
    );

  const orders = await query;

  let totalRevenue = 0;
  let totalCost = 0;
  let totalHours = 0;

  for (const order of orders) {
    if (!order.clientId || !order.totalHours) continue;

    const client = await db
      .select()
      .from(clients)
      .where(eq(clients.id, order.clientId))
      .limit(1);

    const partner = await db
      .select()
      .from(partners)
      .where(eq(partners.id, order.partnerId))
      .limit(1);

    if (client.length > 0 && partner.length > 0) {
      const hours = parseFloat(order.totalHours.toString());
      totalHours += hours;

      // Calcula receita (valor cobrado do cliente)
      if (client[0].paymentType === "hourly" && client[0].chargedValue) {
        totalRevenue += hours * parseFloat(client[0].chargedValue.toString());
      } else if (client[0].paymentType === "fixed" && client[0].chargedValue) {
        totalRevenue += parseFloat(client[0].chargedValue.toString());
      }

      // Calcula custo (valor pago ao consultor)
      if (partner[0].paymentType === "hourly" && partner[0].paidValue) {
        totalCost += hours * parseFloat(partner[0].paidValue.toString());
      } else if (partner[0].paymentType === "fixed" && partner[0].paidValue) {
        totalCost += parseFloat(partner[0].paidValue.toString());
      }
    }
  }

  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalCost,
    profit,
    margin,
    totalHours,
    ordersCount: orders.length,
  };
}

/**
 * Envia relatório financeiro por e-mail
 */
export async function sendFinancialReport(
  recipientEmail: string,
  startDate: Date,
  endDate: Date,
  includeCharts: boolean = true
) {
  try {
    const metrics = await calculateFinancialMetrics(startDate, endDate);

    const subject = `Relatório Financeiro - ${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}`;

    const htmlContent = `
      <h2>Relatório Financeiro</h2>
      <p>Período: ${startDate.toLocaleDateString("pt-BR")} a ${endDate.toLocaleDateString("pt-BR")}</p>
      
      <h3>Resumo Financeiro</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px;">Métrica</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Valor</th>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Receita Total</td>
          <td style="border: 1px solid #ddd; padding: 8px;">R$ ${metrics.totalRevenue.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Custo Total</td>
          <td style="border: 1px solid #ddd; padding: 8px;">R$ ${metrics.totalCost.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Lucro Bruto</td>
          <td style="border: 1px solid #ddd; padding: 8px;">R$ ${metrics.profit.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Margem de Lucro</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${metrics.margin.toFixed(2)}%</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Total de Horas</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${metrics.totalHours.toFixed(2)}h</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">Ordens de Serviço</td>
          <td style="border: 1px solid #ddd; padding: 8px;">${metrics.ordersCount}</td>
        </tr>
      </table>

      <p style="margin-top: 20px; color: #666; font-size: 12px;">
        Este é um relatório automático. Para mais detalhes, acesse o painel administrativo.
      </p>
    `;

    await sendEmail({
      to: recipientEmail,
      subject,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error("Erro ao enviar relatório financeiro:", error);
    return false;
  }
}

/**
 * Processa agendamentos de relatórios que devem ser enviados
 */
export async function processScheduledReports() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  try {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = now.getMinutes().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}`;
    const dayOfMonth = now.getDate();
    const dayOfWeek = now.getDay();

    // Busca agendamentos que devem ser enviados agora
    const schedules = await db
      .select()
      .from(reportSchedules)
      .where(eq(reportSchedules.status, "active"));

    for (const schedule of schedules) {
      let shouldSend = false;

      if (schedule.frequency === "daily" && schedule.time === currentTime) {
        shouldSend = true;
      } else if (
        schedule.frequency === "weekly" &&
        schedule.dayOfWeek === dayOfWeek &&
        schedule.time === currentTime
      ) {
        shouldSend = true;
      } else if (
        schedule.frequency === "biweekly" &&
        schedule.dayOfMonth &&
        dayOfMonth % 14 === schedule.dayOfMonth % 14 &&
        schedule.time === currentTime
      ) {
        shouldSend = true;
      } else if (
        schedule.frequency === "monthly" &&
        schedule.dayOfMonth === dayOfMonth &&
        schedule.time === currentTime
      ) {
        shouldSend = true;
      }

      if (shouldSend) {
        // Calcula período (últimos 30 dias por padrão)
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const success = await sendFinancialReport(
          schedule.recipientEmail,
          startDate,
          endDate,
          schedule.includeCharts === "yes"
        );

        if (success) {
          // Atualiza lastSentAt
          await db
            .update(reportSchedules)
            .set({ lastSentAt: new Date() })
            .where(eq(reportSchedules.id, schedule.id));
        }
      }
    }
  } catch (error) {
    console.error("Erro ao processar agendamentos de relatórios:", error);
  }
}

/**
 * Inicia o job de processamento de relatórios agendados
 * Executa a cada minuto
 */
export function startReportSchedulerJob() {
  setInterval(() => {
    processScheduledReports().catch(console.error);
  }, 60 * 1000); // A cada minuto

  console.log("[Report Scheduler] Job iniciado - processando agendamentos a cada minuto");
}
