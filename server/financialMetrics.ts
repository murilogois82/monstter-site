import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { serviceOrders, clients, partners } from "../drizzle/schema";

export interface FinancialMetrics {
  totalRevenue: string;
  totalCost: string;
  grossProfit: string;
  profitMargin: string;
  totalBillableHours: number;
  totalNonBillableHours: number;
  averageHourlyRate: string;
  consultantCount: number;
  clientCount: number;
  completedOrders: number;
}

export interface MonthlyComparison {
  month: string;
  revenue: string;
  cost: string;
  profit: string;
  billableHours: number;
  orders: number;
}

export interface ConsultantMetrics {
  consultantId: number;
  consultantName: string;
  totalHours: number;
  totalEarnings: string;
  ordersCompleted: number;
  averageOrderValue: string;
}

/**
 * Calcula métricas financeiras gerais para um período
 */
export async function calculateFinancialMetrics(
  periodStart: Date,
  periodEnd: Date
): Promise<FinancialMetrics | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar todas as ordens fechadas no período
    const orders = await db
      .select()
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    if (orders.length === 0) {
      return {
        totalRevenue: "0.00",
        totalCost: "0.00",
        grossProfit: "0.00",
        profitMargin: "0.00",
        totalBillableHours: 0,
        totalNonBillableHours: 0,
        averageHourlyRate: "0.00",
        consultantCount: 0,
        clientCount: 0,
        completedOrders: 0,
      };
    }

    // Calcular receita total (baseado no valor cobrado do cliente)
    let totalRevenue = 0;
    let totalCost = 0;
    let totalBillableHours = 0;
    let totalNonBillableHours = 0;
    const consultants = new Set<number>();
    const clientsSet = new Set<number>();

    for (const order of orders) {
      const hours = parseFloat(order.totalHours || "0");

      // Buscar dados do cliente para valor cobrado
      const clientData = await db
        .select()
        .from(clients)
        .where(eq(clients.id, order.clientId as number))
        .limit(1);

      if (clientData.length > 0) {
        const client = clientData[0];
        if (client.paymentType === "hourly" && client.chargedValue) {
          const hourlyRate = parseFloat(client.chargedValue);
          totalRevenue += hours * hourlyRate;
        } else if (client.paymentType === "fixed" && client.chargedValue) {
          totalRevenue += parseFloat(client.chargedValue);
        }
        clientsSet.add(client.id);
      }

      // Buscar dados do parceiro para valor pago
      if (order.partnerId) {
        const partnerData = await db
          .select()
          .from(partners)
          .where(eq(partners.id, order.partnerId as number))
          .limit(1);

        if (partnerData.length > 0) {
          const partner = partnerData[0];
          if (partner.paymentType === "hourly" && partner.paidValue) {
            const hourlyRate = parseFloat(partner.paidValue);
            totalCost += hours * hourlyRate;
          } else if (partner.paymentType === "fixed" && partner.paidValue) {
            totalCost += parseFloat(partner.paidValue);
          }
          consultants.add(partner.id);
        }
      }

      totalBillableHours += hours;
    }

    const grossProfit = totalRevenue - totalCost;
    const profitMargin =
      totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(2) : "0.00";
    const averageHourlyRate =
      totalBillableHours > 0
        ? (totalRevenue / totalBillableHours).toFixed(2)
        : "0.00";

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalCost: totalCost.toFixed(2),
      grossProfit: grossProfit.toFixed(2),
      profitMargin,
      totalBillableHours,
      totalNonBillableHours: 0,
      averageHourlyRate,
      consultantCount: consultants.size,
      clientCount: clientsSet.size,
      completedOrders: orders.length,
    };
  } catch (error) {
    console.error("[Financial Metrics] Error calculating metrics:", error);
    return null;
  }
}

/**
 * Compara métricas financeiras mês a mês
 */
export async function getMonthlyComparison(year: number): Promise<MonthlyComparison[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const monthlyData: MonthlyComparison[] = [];

    for (let month = 1; month <= 12; month++) {
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0);

      const metrics = await calculateFinancialMetrics(periodStart, periodEnd);

      if (metrics) {
        monthlyData.push({
          month: new Date(year, month - 1).toLocaleDateString("pt-BR", {
            month: "long",
          }),
          revenue: metrics.totalRevenue,
          cost: metrics.totalCost,
          profit: metrics.grossProfit,
          billableHours: metrics.totalBillableHours,
          orders: metrics.completedOrders,
        });
      }
    }

    return monthlyData;
  } catch (error) {
    console.error("[Financial Metrics] Error getting monthly comparison:", error);
    return [];
  }
}

/**
 * Calcula métricas por consultor
 */
export async function getConsultantMetrics(
  periodStart: Date,
  periodEnd: Date
): Promise<ConsultantMetrics[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const orders = await db
      .select()
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    const consultantMap = new Map<number, ConsultantMetrics>();

    for (const order of orders) {
      if (!order.partnerId) continue;

      const hours = parseFloat(order.totalHours || "0");

      // Buscar dados do parceiro
      const partnerData = await db
        .select()
        .from(partners)
        .where(eq(partners.id, order.partnerId as number))
        .limit(1);

      if (partnerData.length === 0) continue;

      const partner = partnerData[0];
      let earnings = 0;

      if (partner.paymentType === "hourly" && partner.paidValue) {
        const hourlyRate = parseFloat(partner.paidValue);
        earnings = hours * hourlyRate;
      } else if (partner.paymentType === "fixed" && partner.paidValue) {
        earnings = parseFloat(partner.paidValue);
      }

      if (!consultantMap.has(partner.id)) {
        consultantMap.set(partner.id, {
          consultantId: partner.id,
          consultantName: partner.companyName,
          totalHours: 0,
          totalEarnings: "0.00",
          ordersCompleted: 0,
          averageOrderValue: "0.00",
        });
      }

      const metrics = consultantMap.get(partner.id)!;
      metrics.totalHours += hours;
      metrics.totalEarnings = (
        parseFloat(metrics.totalEarnings) + earnings
      ).toFixed(2);
      metrics.ordersCompleted += 1;
      metrics.averageOrderValue = (
        parseFloat(metrics.totalEarnings) / metrics.ordersCompleted
      ).toFixed(2);
    }

    return Array.from(consultantMap.values());
  } catch (error) {
    console.error("[Financial Metrics] Error getting consultant metrics:", error);
    return [];
  }
}

/**
 * Calcula taxa de utilização (horas faturáveis vs total disponível)
 */
export async function getUtilizationRate(
  periodStart: Date,
  periodEnd: Date
): Promise<{
  utilizationRate: string;
  billableHours: number;
  totalAvailableHours: number;
}> {
  const db = await getDb();
  if (!db)
    return {
      utilizationRate: "0.00",
      billableHours: 0,
      totalAvailableHours: 0,
    };

  try {
    const orders = await db
      .select()
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    let billableHours = 0;
    orders.forEach((order) => {
      billableHours += parseFloat(order.totalHours || "0");
    });

    // Calcular horas disponíveis (considerando 8 horas/dia, 5 dias/semana)
    const days =
      Math.ceil(
        (periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const weeks = Math.ceil(days / 7);
    const totalAvailableHours = weeks * 5 * 8;

    const utilizationRate =
      totalAvailableHours > 0
        ? ((billableHours / totalAvailableHours) * 100).toFixed(2)
        : "0.00";

    return {
      utilizationRate,
      billableHours,
      totalAvailableHours,
    };
  } catch (error) {
    console.error("[Financial Metrics] Error calculating utilization rate:", error);
    return {
      utilizationRate: "0.00",
      billableHours: 0,
      totalAvailableHours: 0,
    };
  }
}
