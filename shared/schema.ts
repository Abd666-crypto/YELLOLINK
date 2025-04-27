import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  status: text("status").notNull(),
  lastRun: timestamp("last_run"),
  dataPoints: integer("data_points").default(0),
  userId: integer("user_id").references(() => users.id),
});

export const dataSources = pgTable("data_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourceType: text("source_type").notNull(),
  configuration: jsonb("configuration").notNull(),
  projectId: integer("project_id").references(() => projects.id),
});

export const dataNodes = pgTable("data_nodes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  nodeType: text("node_type").notNull(),
  configuration: jsonb("configuration").notNull(),
  position: jsonb("position").notNull(),
  projectId: integer("project_id").references(() => projects.id),
});

export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  environment: text("environment").notNull(),
  userId: integer("user_id").references(() => users.id),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  type: true,
  status: true,
  userId: true,
});

export const insertDataSourceSchema = createInsertSchema(dataSources).pick({
  name: true,
  sourceType: true,
  configuration: true,
  projectId: true,
});

export const insertDataNodeSchema = createInsertSchema(dataNodes).pick({
  name: true,
  nodeType: true,
  configuration: true,
  position: true,
  projectId: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  key: true,
  name: true,
  environment: true,
  userId: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertDataSource = z.infer<typeof insertDataSourceSchema>;
export type DataSource = typeof dataSources.$inferSelect;

export type InsertDataNode = z.infer<typeof insertDataNodeSchema>;
export type DataNode = typeof dataNodes.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
