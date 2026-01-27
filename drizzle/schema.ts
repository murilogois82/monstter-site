import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "partner", "manager"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar mensagens enviadas pelo formulário de contato.
 */
export const contactMessages = mysqlTable("contact_messages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  company: varchar("company", { length: 255 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["pending", "read", "replied"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * Tabela para armazenar clientes da empresa.
 */
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  company: varchar("company", { length: 255 }),
  document: varchar("document", { length: 50 }), // CPF ou CNPJ
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 20 }),
  paymentType: mysqlEnum("paymentType", ["fixed", "hourly"]).default("hourly").notNull(),
  chargedValue: decimal("chargedValue", { precision: 12, scale: 2 }), // Valor cobrado do cliente
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

/**
 * Tabela para armazenar parceiros/consultores que criam ordens de serviço.
 */
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  paymentType: mysqlEnum("paymentType", ["fixed", "hourly"]).default("hourly").notNull(),
  paidValue: decimal("paidValue", { precision: 12, scale: 2 }), // Valor pago ao consultor
  role: mysqlEnum("role", ["partner", "manager", "admin"]).default("partner").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

/**
 * Tabela para armazenar ordens de serviço.
 */
export const serviceOrders = mysqlTable("service_orders", {
  id: int("id").autoincrement().primaryKey(),
  osNumber: varchar("osNumber", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["draft", "sent", "in_progress", "completed", "closed"]).default("draft").notNull(),
  partnerId: int("partnerId").notNull(),
  clientId: int("clientId"),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  serviceType: varchar("serviceType", { length: 255 }).notNull(),
  startDateTime: datetime("startDateTime").notNull(),
  interval: int("interval"), // em minutos
  endDateTime: datetime("endDateTime"),
  totalHours: decimal("totalHours", { precision: 10, scale: 2 }),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;

/**
 * Tabela para armazenar informações de pagamento das ordens de serviço.
 */
export const osPayments = mysqlTable("os_payments", {
  id: int("id").autoincrement().primaryKey(),
  osId: int("osId").notNull(),
  partnerId: int("partnerId").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "scheduled", "completed"]).default("pending").notNull(),
  paymentDate: datetime("paymentDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OSPayment = typeof osPayments.$inferSelect;
export type InsertOSPayment = typeof osPayments.$inferInsert;

/**
 * Relações entre tabelas
 */
export const partnersRelations = relations(partners, ({ many }) => ({
  serviceOrders: many(serviceOrders),
  payments: many(osPayments),
}));

export const serviceOrdersRelations = relations(serviceOrders, ({ one, many }) => ({
  partner: one(partners, {
    fields: [serviceOrders.partnerId],
    references: [partners.id],
  }),
  payments: many(osPayments),
}));

export const osPaymentsRelations = relations(osPayments, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [osPayments.osId],
    references: [serviceOrders.id],
  }),
  partner: one(partners, {
    fields: [osPayments.partnerId],
    references: [partners.id],
  }),
}));

/**
 * Tabela para armazenar agendamentos de envio de relatórios financeiros.
 */
export const reportSchedules = mysqlTable("report_schedules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "biweekly", "monthly"]).default("monthly").notNull(),
  dayOfWeek: int("dayOfWeek"), // 0-6 para weekly
  dayOfMonth: int("dayOfMonth"), // 1-31 para monthly
  time: varchar("time", { length: 5 }), // HH:mm
  reportType: mysqlEnum("reportType", ["financial", "service_orders", "payments", "all"]).default("financial").notNull(),
  includeCharts: mysqlEnum("includeCharts", ["yes", "no"]).default("yes").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  lastSentAt: datetime("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReportSchedule = typeof reportSchedules.$inferSelect;
export type InsertReportSchedule = typeof reportSchedules.$inferInsert;

export const clientsRelations = relations(clients, ({ many }) => ({
  serviceOrders: many(serviceOrders),
}));
