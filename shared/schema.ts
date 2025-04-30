import { pgTable, text, serial, integer, boolean, jsonb, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define subscription tiers
export enum SubscriptionTier {
  FREE = "free",
  BASIC = "basic", 
  PREMIUM = "premium",
  BUSINESS = "business"
}

// User table - base users for the application
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  phoneNumber: text("phone_number"),
  role: text("role").default("user"), // user, driver, admin
});

// Drivers table - users who are registered as drivers
export const drivers = pgTable("drivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  licensePlate: text("license_plate").notNull(),
  walletAddress: text("wallet_address").notNull(),
  totalRides: integer("total_rides").default(0),
  totalRating: integer("total_rating").default(0),
  isSuspended: boolean("is_suspended").default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  isActive: boolean("is_active").default(false),
  tokens: integer("tokens").default(0), // Reward tokens earned
  lastTokenUpdate: timestamp("last_token_update"),
});

// Rides table - ride requests and details
export const rides = pgTable("rides", {
  id: serial("id").primaryKey(),
  riderId: integer("rider_id").references(() => users.id).notNull(),
  driverId: integer("driver_id").references(() => drivers.id),
  pickupLocation: text("pickup_location").notNull(),
  pickupLatitude: doublePrecision("pickup_latitude"),
  pickupLongitude: doublePrecision("pickup_longitude"),
  dropoffLocation: text("dropoff_location"),
  dropoffLatitude: doublePrecision("dropoff_latitude"),
  dropoffLongitude: doublePrecision("dropoff_longitude"),
  status: text("status").notNull().default("requested"), // requested, assigned, completed, cancelled
  fare: integer("fare").notNull(),
  discountApplied: integer("discount_applied").default(0), // discount amount in percentage
  cancellationPenalty: integer("cancellation_penalty").default(0), // penalty in percentage if cancelled
  cancellationReason: text("cancellation_reason"), // reason for cancellation if provided
  momoTxId: text("momo_tx_id").notNull(),
  rating: integer("rating"),
  requestTime: timestamp("request_time").defaultNow(),
  assignmentTime: timestamp("assignment_time"), // when driver was assigned
  completionTime: timestamp("completion_time"),
  cancellationTime: timestamp("cancellation_time"), // when ride was cancelled
});

// Payments table - record of payments made through MoMo
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  rideId: integer("ride_id").references(() => rides.id).notNull(),
  momoTxId: text("momo_tx_id").notNull().unique(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, refunded
  timestamp: timestamp("timestamp").defaultNow(),
});

// Projects table - keeping this for backward compatibility
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

// API Keys table - for accessing the YeloLink API
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  environment: text("environment").notNull(),
  userId: integer("user_id").references(() => users.id),
});

// Subscriptions table - for premium features
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  tier: text("tier").notNull().default(SubscriptionTier.FREE),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  autoRenew: boolean("auto_renew").default(false),
  lastPaymentId: text("last_payment_id"),
  lastPaymentDate: timestamp("last_payment_date"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  phoneNumber: true,
  role: true,
});

export const insertDriverSchema = createInsertSchema(drivers).pick({
  userId: true,
  licensePlate: true,
  walletAddress: true,
  latitude: true,
  longitude: true,
  isActive: true,
});

export const insertRideSchema = createInsertSchema(rides).pick({
  riderId: true,
  driverId: true,
  pickupLocation: true,
  pickupLatitude: true,
  pickupLongitude: true,
  dropoffLocation: true,
  dropoffLatitude: true,
  dropoffLongitude: true,
  status: true,
  fare: true,
  discountApplied: true,
  cancellationPenalty: true,
  cancellationReason: true,
  momoTxId: true,
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  rideId: true,
  momoTxId: true,
  amount: true,
  status: true,
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  type: true,
  status: true,
  userId: true,
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  key: true,
  name: true,
  environment: true,
  userId: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  tier: true,
  endDate: true,
  autoRenew: true,
  lastPaymentId: true,
  lastPaymentDate: true,
});

// Type exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export type InsertRide = z.infer<typeof insertRideSchema>;
export type Ride = typeof rides.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
