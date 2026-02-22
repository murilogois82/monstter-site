
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, contactMessages, InsertContactMessage, ContactMessage } from "../drizzle/schema";
import { desc, gte, lte, and, eq } from "drizzle-orm";
import { ENV } from './_core/env';
import * as bcrypt from 'bcrypt';

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


// ==================== AUDIT LOG FUNCTIONS ====================

export interface AuditLogEntry {
  id?: number;
  userId: number;
  actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE' | 'ACCESS_DENIED';
  targetUserId?: number | null;
  targetUserName?: string | null;
  actionDetails?: Record<string, unknown> | null;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  errorMessage?: string | null;
  createdAt?: Date;
}

export async function logAuditEvent(entry: AuditLogEntry): Promise<number | null> {
  try {
    const pool = require('mysql2/promise').createPool(process.env.DATABASE_URL);
    const conn = await pool.getConnection();
    
    const [result] = await conn.execute(
      `INSERT INTO audit_logs (
        userId, actionType, targetUserId, targetUserName, 
        actionDetails, oldValues, newValues, ipAddress, userAgent, 
        status, errorMessage, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        entry.userId,
        entry.actionType,
        entry.targetUserId || null,
        entry.targetUserName || null,
        entry.actionDetails ? JSON.stringify(entry.actionDetails) : null,
        entry.oldValues ? JSON.stringify(entry.oldValues) : null,
        entry.newValues ? JSON.stringify(entry.newValues) : null,
        entry.ipAddress || null,
        entry.userAgent || null,
        entry.status,
        entry.errorMessage || null,
      ]
    );
    
    conn.release();
    return (result as any).insertId || null;
  } catch (error) {
    console.error("[Audit] Failed to log event:", error);
    return null;
  }
}

export async function getAuditLogs(
  filters?: {
    userId?: number;
    targetUserId?: number;
    actionType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<AuditLogEntry[]> {
  try {
    const pool = require('mysql2/promise').createPool(process.env.DATABASE_URL);
    const conn = await pool.getConnection();
    
    let query = `SELECT * FROM audit_logs WHERE 1=1`;
    const params: unknown[] = [];

    if (filters?.userId) {
      query += ` AND userId = ?`;
      params.push(filters.userId);
    }

    if (filters?.targetUserId) {
      query += ` AND targetUserId = ?`;
      params.push(filters.targetUserId);
    }

    if (filters?.actionType) {
      query += ` AND actionType = ?`;
      params.push(filters.actionType);
    }

    if (filters?.startDate) {
      query += ` AND createdAt >= ?`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND createdAt <= ?`;
      params.push(filters.endDate);
    }

    query += ` ORDER BY createdAt DESC`;

    if (filters?.limit) {
      query += ` LIMIT ?`;
      params.push(filters.limit);

      if (filters?.offset) {
        query += ` OFFSET ?`;
        params.push(filters.offset);
      }
    }

    const [rows] = await conn.execute(query, params);
    conn.release();
    return (rows as any) || [];
  } catch (error) {
    console.error("[Audit] Failed to get logs:", error);
    return [];
  }
}

export async function getAuditLogsByUser(userId: number, limit: number = 100): Promise<AuditLogEntry[]> {
  return getAuditLogs({ userId, limit });
}

export async function getAuditLogsByTargetUser(targetUserId: number, limit: number = 100): Promise<AuditLogEntry[]> {
  return getAuditLogs({ targetUserId, limit });
}

export async function getAuditLogsByActionType(actionType: string, limit: number = 100): Promise<AuditLogEntry[]> {
  return getAuditLogs({ actionType, limit });
}

export async function getAuditLogCount(filters?: {
  userId?: number;
  targetUserId?: number;
  actionType?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<number> {
  try {
    const pool = require('mysql2/promise').createPool(process.env.DATABASE_URL);
    const conn = await pool.getConnection();
    
    let query = `SELECT COUNT(*) as count FROM audit_logs WHERE 1=1`;
    const params: unknown[] = [];

    if (filters?.userId) {
      query += ` AND userId = ?`;
      params.push(filters.userId);
    }

    if (filters?.targetUserId) {
      query += ` AND targetUserId = ?`;
      params.push(filters.targetUserId);
    }

    if (filters?.actionType) {
      query += ` AND actionType = ?`;
      params.push(filters.actionType);
    }

    if (filters?.startDate) {
      query += ` AND createdAt >= ?`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND createdAt <= ?`;
      params.push(filters.endDate);
    }

    const [rows] = await conn.execute(query, params);
    conn.release();
    return (rows as any)?.[0]?.count || 0;
  } catch (error) {
    console.error("[Audit] Failed to get count:", error);
    return 0;
  }
}

export async function deleteOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const pool = require('mysql2/promise').createPool(process.env.DATABASE_URL);
    const conn = await pool.getConnection();
    
    const [result] = await conn.execute(
      `DELETE FROM audit_logs WHERE createdAt < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [daysToKeep]
    );
    
    conn.release();
    return (result as any).affectedRows || 0;
  } catch (error) {
    console.error("[Audit] Failed to delete old logs:", error);
    return 0;
  }
}


// ==================== SIMPLE AUTHENTICATION ====================

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with its hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Login user with username and password
 */
export async function loginUser(username: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Find user by username using raw SQL
    const conn = await (db as any).client.getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    conn.release();

    const user = (rows as any[])[0];
    if (!user) {
      throw new Error("Invalid username or password");
    }

    if (!user.passwordHash) {
      throw new Error("User does not have a password set");
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid username or password");
    }

    // Return user without password
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("[Auth] Login failed:", error);
    throw error;
  }
}

/**
 * Create a new user with username and password
 */
export async function createUserWithPassword(
  username: string,
  password: string,
  name?: string | null,
  email?: string | null,
  role: "user" | "admin" | "manager" | "partner" = "user"
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Check if username already exists
    const conn = await (db as any).client.getConnection();
    const [existingRows] = await conn.execute(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if ((existingRows as any[]).length > 0) {
      conn.release();
      throw new Error("Username already exists");
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await conn.execute(
      "INSERT INTO users (username, passwordHash, name, email, role, loginMethod, lastSignedIn) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [username, passwordHash, name || null, email || null, role, "local", new Date()]
    );

    // Get the created user
    const [newUserRows] = await conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    conn.release();

    const newUser = (newUserRows as any[])[0];
    if (!newUser) {
      throw new Error("Failed to create user");
    }

    const { passwordHash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error("[Auth] Create user failed:", error);
    throw error;
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(userId: number, newPassword: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    const conn = await (db as any).client.getConnection();
    await conn.execute(
      "UPDATE users SET passwordHash = ? WHERE id = ?",
      [passwordHash, userId]
    );
    conn.release();

    return { success: true };
  } catch (error) {
    console.error("[Auth] Update password failed:", error);
    throw error;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const conn = await (db as any).client.getConnection();
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );
    conn.release();

    const user = (rows as any[])[0];
    if (!user) {
      return null;
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error("[Auth] Get user by username failed:", error);
    throw error;
  }
}
