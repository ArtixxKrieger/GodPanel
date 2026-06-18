import { pgTable, serial, varchar, boolean, timestamp, decimal, integer, text, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 50 }).default("owner"),
  tenantId: varchar("tenant_id", { length: 255 }).unique(),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userSettingsTable = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }).unique(),
  storeName: varchar("store_name", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tenantSubscriptionsTable = pgTable("tenant_subscriptions", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }).notNull().unique(),
  plan: varchar("plan", { length: 50 }).default("free"),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionPaymentsTable = pgTable("subscription_payments", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("pending"),
  plan: varchar("plan", { length: 50 }),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 100 }),
  stock: integer("stock").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const salesTable = pgTable("sales", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  total: decimal("total", { precision: 10, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  items: jsonb("items").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const expensesTable = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiMemoriesTable = pgTable("ai_memories", {
  id: serial("id").primaryKey(),
  tenantId: varchar("tenant_id", { length: 255 }),
  content: text("content"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export const insertUserSettingsSchema = createInsertSchema(userSettingsTable).omit({ id: true });
export const insertTenantSubscriptionSchema = createInsertSchema(tenantSubscriptionsTable).omit({ id: true });
export const insertSubscriptionPaymentSchema = createInsertSchema(subscriptionPaymentsTable).omit({ id: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true });
export const insertAiMemorySchema = createInsertSchema(aiMemoriesTable).omit({ id: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserSettings = typeof userSettingsTable.$inferSelect;
export type TenantSubscription = typeof tenantSubscriptionsTable.$inferSelect;
export type SubscriptionPayment = typeof subscriptionPaymentsTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type Sale = typeof salesTable.$inferSelect;
export type Expense = typeof expensesTable.$inferSelect;
export type AiMemory = typeof aiMemoriesTable.$inferSelect;
