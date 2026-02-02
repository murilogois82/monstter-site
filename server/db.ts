
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contactMessages, InsertContactMessage, ContactMessage } from "../drizzle/schema";
import { desc, gte, lte, and, eq } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<{ id: number } | undefined> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    const result = await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({ set: updateSet });

    return { id: Number(result.insertId) };
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<InsertUser[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all users: database not available");
    return [];
  }

  try {
    return await db.select().from(users);
  } catch (error) {
    console.error("[Database] Failed to get all users:", error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<InsertUser | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return;
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<InsertUser | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by openId: database not available");
    return;
  }

  try {
    const result = await db.select().from(users).where(eq(users.openId, openId));
    return result[0];
  } catch (error) {
    console.error("[Database] Failed to get user by openId:", error);
    throw error;
  }
}

export async function updateUserRole(userId: number, role: "admin" | "user" | "manager" | "partner"): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user role: database not available");
    return false;
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    throw error;
  }
}

export async function createUser(user: InsertUser): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return null;
  }

  try {
    const result = await db.insert(users).values(user);
    return { id: Number(result.insertId) };
  } catch (error) {
    console.error("[Database] Failed to create user:", error);
    throw error;
  }
}

// ===== Contact Messages =====

export async function createContactMessage(message: InsertContactMessage): Promise<ContactMessage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create contact message: database not available");
    return null;
  }

  try {
    const result = await db.insert(contactMessages).values(message);
    return { ...message, id: Number(result.insertId) } as ContactMessage;
  } catch (error) {
    console.error("[Database] Failed to create contact message:", error);
    throw error;
  }
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contact messages: database not available");
    return [];
  }

  try {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get contact messages:", error);
    throw error;
  }
}

export async function updateContactMessageStatus(id: number, status: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update contact message: database not available");
    return false;
  }

  try {
    await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to update contact message:", error);
    throw error;
  }
}

// ===== Service Orders =====

import { serviceOrders, InsertServiceOrder, ServiceOrder, osPayments, InsertOSPayment, OSPayment, partners, InsertPartner, Partner } from "../drizzle/schema";


export async function createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create service order: database not available");
    return null;
  }

  try {
    const result = await db.insert(serviceOrders).values(order);
    return { ...order, id: Number(result.insertId) } as ServiceOrder;
  } catch (error) {
    console.error("[Database] Failed to create service order:", error);
    throw error;
  }
}

export async function updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update service order: database not available");
    return null;
  }

  try {
    await db.update(serviceOrders).set(order).where(eq(serviceOrders.id, id));
    const result = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update service order:", error);
    throw error;
  }
}

export async function getServiceOrderById(id: number): Promise<ServiceOrder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get service order: database not available");
    return null;
  }

  try {
    const result = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get service order:", error);
    throw error;
  }
}

export async function getServiceOrdersByPartnerId(partnerId: number): Promise<ServiceOrder[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get service orders: database not available");
    return [];
  }

  try {
    return await db.select().from(serviceOrders).where(eq(serviceOrders.partnerId, partnerId)).orderBy(desc(serviceOrders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get service orders:", error);
    throw error;
  }
}

export async function getAllServiceOrders(): Promise<ServiceOrder[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all service orders: database not available");
    return [];
  }

  try {
    return await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all service orders:", error);
    throw error;
  }
}

export async function getServiceOrdersByStatus(status: string): Promise<ServiceOrder[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get service orders: database not available");
    return [];
  }

  try {
    return await db.select().from(serviceOrders).where(eq(serviceOrders.status, status)).orderBy(desc(serviceOrders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get service orders:", error);
    throw error;
  }
}

// ===== OS Payments =====

export async function createOSPayment(payment: InsertOSPayment): Promise<OSPayment | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create OS payment: database not available");
    return null;
  }

  try {
    const result = await db.insert(osPayments).values(payment);
    return { ...payment, id: Number(result.insertId) } as OSPayment;
  } catch (error) {
    console.error("[Database] Failed to create OS payment:", error);
    throw error;
  }
}

export async function updateOSPayment(id: number, payment: Partial<InsertOSPayment>): Promise<OSPayment | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update OS payment: database not available");
    return null;
  }

  try {
    await db.update(osPayments).set(payment).where(eq(osPayments.id, id));
    const result = await db.select().from(osPayments).where(eq(osPayments.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update OS payment:", error);
    throw error;
  }
}

export async function getPaymentsByPartnerId(partnerId: number): Promise<OSPayment[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payments: database not available");
    return [];
  }

  try {
    return await db.select().from(osPayments).where(eq(osPayments.partnerId, partnerId)).orderBy(desc(osPayments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get payments:", error);
    throw error;
  }
}

export async function getPendingPayments(options?: { startDate?: Date; endDate?: Date }): Promise<OSPayment[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pending payments: database not available");
    return [];
  }

  try {
    const conditions = [eq(osPayments.paymentStatus, "pending")];
    
    if (options?.startDate) {
      conditions.push(gte(osPayments.createdAt, options.startDate));
    }
    if (options?.endDate) {
      conditions.push(lte(osPayments.createdAt, options.endDate));
    }
    
    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];
    return await db.select().from(osPayments).where(whereClause).orderBy(desc(osPayments.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get pending payments:", error);
    throw error;
  }
}

// ===== Partners =====

export async function createPartner(partner: InsertPartner): Promise<Partner | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create partner: database not available");
    return null;
  }

  try {
    const result = await db.insert(partners).values(partner);
    return { ...partner, id: Number(result.insertId) } as Partner;
  } catch (error) {
    console.error("[Database] Failed to create partner:", error);
    throw error;
  }
}

export async function getPartnerByUserId(userId: number): Promise<Partner | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get partner: database not available");
    return null;
  }

  try {
    const result = await db.select().from(partners).where(eq(partners.userId, userId));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get partner:", error);
    throw error;
  }
}

export async function getAllPartners(): Promise<Partner[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get all partners: database not available");
    return [];
  }

  try {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get all partners:", error);
    throw error;
  }
}

export async function updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update partner: database not available");
    return null;
  }

  try {
    await db.update(partners).set(partner).where(eq(partners.id, id));
    const result = await db.select().from(partners).where(eq(partners.id, id));
    return result[0] || null;
  } catch (error) {
    console.error("[Database] Failed to update partner:", error);
    throw error;
  }
}

export async function deletePartner(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete partner: database not available");
    return false;
  }

  try {
    await db.delete(partners).where(eq(partners.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete partner:", error);
    throw error;
  }
}
