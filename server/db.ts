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

export async function upsertUser(user: InsertUser): Promise<void> {
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
