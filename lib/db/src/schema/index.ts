import { pgTable, serial, varchar, boolean, timestamp, decimal, integer, text, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  role: varchar("role", { length: 50 }).default("owner"),
  tenantId: varchar("tenant_id", { length: 255 }),
  isBanned: boolean("is_banned").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  storeName: varchar("store_name", { length: 255 }),
  businessType: varchar("business_type", { length: 100 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true });
export const insertSaleSchema = createInsertSchema(salesTable).omit({ id: true });
export const insertExpenseSchema = createInsertSchema(expensesTable).omit({ id: true });
export const insertAiMemorySchema = createInsertSchema(aiMemoriesTable).omit({ id: true });

export type User = typeof usersTable.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Settings = typeof settingsTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type Sale = typeof salesTable.$inferSelect;
export type Expense = typeof expensesTable.$inferSelect;
export type AiMemory = typeof aiMemoriesTable.$inferSelect;
