import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db";
import { serviceOrders, clients, partners, osPayments } from "../drizzle/schema";

export interface ServiceReportData {
  clientId: number;
  clientName: string;
  clientEmail: string;
  paymentType: "fixed" | "hourly";
  chargedValue: string;
  periodStart: Date;
  periodEnd: Date;
  orders: {
    osNumber: string;
    serviceType: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    description: string;
    status: string;
  }[];
  totalHours: number;
  totalAmount: string;
  generatedAt: Date;
}

export interface PartnerPaymentReport {
  partnerId: number;
  partnerName: string;
  partnerEmail: string;
  paymentType: "fixed" | "hourly";
  paidValue: string;
  periodStart: Date;
  periodEnd: Date;
  orders: {
    osNumber: string;
    clientName: string;
    serviceType: string;
    totalHours: string;
    status: string;
  }[];
  totalHours: number;
  totalAmount: string;
  generatedAt: Date;
}

/**
 * Gera relatório de prestação de serviço para um cliente em um período específico
 */
export async function generateClientServiceReport(
  clientId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<ServiceReportData | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar dados do cliente
    const clientData = await db
      .select()
      .from(clients)
      .where(eq(clients.id, clientId))
      .limit(1);

    if (!clientData.length) return null;

    const client = clientData[0];

    // Buscar ordens de serviço do cliente no período
    const orders = await db
      .select()
      .from(serviceOrders)
      .where(
        and(
          eq(serviceOrders.clientId, clientId),
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    // Calcular total de horas e valor
    let totalHours = 0;
    let totalAmount = "0.00";

    const formattedOrders = orders.map((order) => {
      const hours = parseFloat(order.totalHours || "0");
      totalHours += hours;

      return {
        osNumber: order.osNumber,
        serviceType: order.serviceType,
        startDate: order.startDateTime?.toLocaleDateString("pt-BR") || "",
        endDate: order.endDateTime?.toLocaleDateString("pt-BR") || "",
        totalHours: order.totalHours || "0",
        description: order.description || "",
        status: order.status,
      };
    });

    // Calcular valor total
    if (client.paymentType === "hourly" && client.chargedValue) {
      const hourlyRate = parseFloat(client.chargedValue);
      totalAmount = (totalHours * hourlyRate).toFixed(2);
    } else if (client.paymentType === "fixed" && client.chargedValue) {
      totalAmount = client.chargedValue;
    }

    return {
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      paymentType: client.paymentType,
      chargedValue: client.chargedValue || "0.00",
      periodStart,
      periodEnd,
      orders: formattedOrders,
      totalHours,
      totalAmount,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Service Report] Error generating client report:", error);
    return null;
  }
}

/**
 * Gera relatório de pagamento para um parceiro em um período específico
 */
export async function generatePartnerPaymentReport(
  partnerId: number,
  periodStart: Date,
  periodEnd: Date
): Promise<PartnerPaymentReport | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar dados do parceiro
    const partnerData = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (!partnerData.length) return null;

    const partner = partnerData[0];

    // Buscar ordens de serviço do parceiro no período
    const orders = await db
      .select()
      .from(serviceOrders)
      .where(
        and(
          eq(serviceOrders.partnerId, partnerId),
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    // Calcular total de horas e valor
    let totalHours = 0;
    let totalAmount = "0.00";

    const formattedOrders = orders.map((order) => {
      const hours = parseFloat(order.totalHours || "0");
      totalHours += hours;

      return {
        osNumber: order.osNumber,
        clientName: order.clientName,
        serviceType: order.serviceType,
        totalHours: order.totalHours || "0",
        status: order.status,
      };
    });

    // Calcular valor total
    if (partner.paymentType === "hourly" && partner.paidValue) {
      const hourlyRate = parseFloat(partner.paidValue);
      totalAmount = (totalHours * hourlyRate).toFixed(2);
    } else if (partner.paymentType === "fixed" && partner.paidValue) {
      totalAmount = partner.paidValue;
    }

    return {
      partnerId: partner.id,
      partnerName: partner.companyName,
      partnerEmail: partner.email,
      paymentType: partner.paymentType,
      paidValue: partner.paidValue || "0.00",
      periodStart,
      periodEnd,
      orders: formattedOrders,
      totalHours,
      totalAmount,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error("[Service Report] Error generating partner report:", error);
    return null;
  }
}

/**
 * Lista todos os clientes com ordens de serviço em um período
 */
export async function getClientsWithOrdersInPeriod(
  periodStart: Date,
  periodEnd: Date
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const orders = await db
      .select({
        clientId: serviceOrders.clientId,
        clientName: serviceOrders.clientName,
        clientEmail: serviceOrders.clientEmail,
      })
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.startDateTime, periodStart),
          lte(serviceOrders.startDateTime, periodEnd),
          eq(serviceOrders.status, "closed")
        )
      );

    // Remover duplicatas
    const uniqueClients = Array.from(
      new Map(
        orders.map((order) => [order.clientId, order])
      ).values()
    );

    return uniqueClients;
  } catch (error) {
    console.error("[Service Report] Error getting clients:", error);
    return [];
  }
}
