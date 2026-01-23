import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contactMessages, InsertContactMessage, ContactMessage } from "../drizzle/schema";
import { desc } from "drizzle-orm";
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // Buscar e retornar o usuário criado/atualizado
    const [updatedUser] = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    return updatedUser ? { id: updatedUser.id } : undefined;
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get users:", error);
    throw error;
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserRole(id: number, role: "user" | "admin" | "partner" | "manager") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return null;
  }

  try {
    await db.update(users).set({ role }).where(eq(users.id, id));
    return await getUserById(id);
  } catch (error) {
    console.error("[Database] Failed to update user role:", error);
    throw error;
  }
}

export async function createUser(userData: { name: string; email: string; role: "user" | "admin" | "partner" | "manager" }) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user: database not available");
    return null;
  }

  try {
    // Gerar um openId temporário para usuários criados manualmente
    const openId = `manual_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const result = await db.insert(users).values({
      openId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      loginMethod: "manual",
    });
    
    const insertId = result[0].insertId;
    return await getUserById(insertId);
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
    const insertId = result[0].insertId;
    
    const [created] = await db.select().from(contactMessages).where(eq(contactMessages.id, insertId)).limit(1);
    return created || null;
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

export async function updateContactMessageStatus(id: number, status: "pending" | "read" | "replied"): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update contact message: database not available");
    return;
  }

  try {
    await db.update(contactMessages).set({ status }).where(eq(contactMessages.id, id));
  } catch (error) {
    console.error("[Database] Failed to update contact message status:", error);
    throw error;
  }
}

// ===== Service Orders =====

import { serviceOrders, InsertServiceOrder, ServiceOrder, osPayments, InsertOSPayment, OSPayment, partners, InsertPartner, Partner } from "../drizzle/schema";
import { and, gte, lte } from "drizzle-orm";

export async function createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create service order: database not available");
    return null;
  }

  try {
    const result = await db.insert(serviceOrders).values(order);
    const insertId = result[0].insertId;
    
    const [created] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, insertId)).limit(1);
    return created || null;
  } catch (error) {
    console.error("[Database] Failed to create service order:", error);
    throw error;
  }
}

export async function updateServiceOrder(id: number, data: Partial<InsertServiceOrder>): Promise<ServiceOrder | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update service order: database not available");
    return null;
  }

  try {
    await db.update(serviceOrders).set(data).where(eq(serviceOrders.id, id));
    const [updated] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1);
    return updated || null;
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
    const [order] = await db.select().from(serviceOrders).where(eq(serviceOrders.id, id)).limit(1);
    return order || null;
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
    console.warn("[Database] Cannot get service orders: database not available");
    return [];
  }

  try {
    return await db.select().from(serviceOrders).orderBy(desc(serviceOrders.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get service orders:", error);
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
    return await db.select().from(serviceOrders).where(eq(serviceOrders.status, status as any)).orderBy(desc(serviceOrders.createdAt));
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
    const insertId = result[0].insertId;
    
    const [created] = await db.select().from(osPayments).where(eq(osPayments.id, insertId)).limit(1);
    return created || null;
  } catch (error) {
    console.error("[Database] Failed to create OS payment:", error);
    throw error;
  }
}

export async function updateOSPayment(id: number, data: Partial<InsertOSPayment>): Promise<OSPayment | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update OS payment: database not available");
    return null;
  }

  try {
    await db.update(osPayments).set(data).where(eq(osPayments.id, id));
    const [updated] = await db.select().from(osPayments).where(eq(osPayments.id, id)).limit(1);
    return updated || null;
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

// ===== Partners =====

export async function createPartner(partner: InsertPartner): Promise<Partner | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create partner: database not available");
    return null;
  }

  try {
    const result = await db.insert(partners).values(partner);
    const insertId = result[0].insertId;
    
    const [created] = await db.select().from(partners).where(eq(partners.id, insertId)).limit(1);
    return created || null;
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
    const [partner] = await db.select().from(partners).where(eq(partners.userId, userId)).limit(1);
    return partner || null;
  } catch (error) {
    console.error("[Database] Failed to get partner:", error);
    throw error;
  }
}

export async function getAllPartners(): Promise<Partner[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get partners: database not available");
    return [];
  }

  try {
    return await db.select().from(partners).orderBy(desc(partners.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get partners:", error);
    throw error;
  }
}
