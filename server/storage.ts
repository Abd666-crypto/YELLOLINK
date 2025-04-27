import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  User, Driver, Ride, Payment, Project, ApiKey, Subscription,
  InsertUser, InsertDriver, InsertRide, InsertPayment, InsertProject, InsertApiKey, InsertSubscription,
  users, drivers, rides, payments, projects, apiKeys, subscriptions, SubscriptionTier
} from "../shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Driver methods
  getAllDrivers(): Promise<Driver[]>;
  getDriver(id: number): Promise<Driver | undefined>;
  getDriverByUserId(userId: number): Promise<Driver | undefined>;
  getDriverByWalletAddress(walletAddress: string): Promise<Driver | undefined>;
  getActiveDrivers(): Promise<Driver[]>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriverStatus(id: number, isActive: boolean): Promise<Driver | undefined>;
  updateDriverLocation(id: number, latitude: number, longitude: number): Promise<Driver | undefined>;
  
  // Ride methods
  getAllRides(): Promise<Ride[]>;
  getRide(id: number): Promise<Ride | undefined>;
  getRidesByRiderId(riderId: number): Promise<Ride[]>;
  getRidesByDriverId(driverId: number): Promise<Ride[]>;
  getActiveRideByRiderId(riderId: number): Promise<Ride | undefined>;
  getActiveRideByDriverId(driverId: number): Promise<Ride | undefined>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRideStatus(id: number, status: string): Promise<Ride | undefined>;
  assignDriver(id: number, driverId: number): Promise<Ride | undefined>;
  completeRide(id: number, rating: number): Promise<Ride | undefined>;
  
  // Payment methods
  getAllPayments(): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentByMomoTxId(momoTxId: string): Promise<Payment | undefined>;
  getPaymentsByRideId(rideId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string): Promise<Payment | undefined>;
  
  // Projects - legacy methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  // API Key methods
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  
  // Subscription methods
  getUserSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, tier: string, endDate: Date): Promise<Subscription | undefined>;
  cancelSubscription(id: number): Promise<Subscription | undefined>;
  isUserPremium(userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers);
  }

  async getDriver(id: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.id, id));
    return driver;
  }

  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.userId, userId));
    return driver;
  }

  async getDriverByWalletAddress(walletAddress: string): Promise<Driver | undefined> {
    const [driver] = await db.select().from(drivers).where(eq(drivers.walletAddress, walletAddress));
    return driver;
  }

  async getActiveDrivers(): Promise<Driver[]> {
    return await db.select().from(drivers).where(eq(drivers.isActive, true));
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const [driver] = await db.insert(drivers).values(insertDriver).returning();
    return driver;
  }

  async updateDriverStatus(id: number, isActive: boolean): Promise<Driver | undefined> {
    const [updatedDriver] = await db
      .update(drivers)
      .set({ isActive })
      .where(eq(drivers.id, id))
      .returning();
    return updatedDriver;
  }

  async updateDriverLocation(id: number, latitude: number, longitude: number): Promise<Driver | undefined> {
    const [updatedDriver] = await db
      .update(drivers)
      .set({ latitude, longitude })
      .where(eq(drivers.id, id))
      .returning();
    return updatedDriver;
  }

  async getAllRides(): Promise<Ride[]> {
    return await db.select().from(rides);
  }

  async getRide(id: number): Promise<Ride | undefined> {
    const [ride] = await db.select().from(rides).where(eq(rides.id, id));
    return ride;
  }

  async getRidesByRiderId(riderId: number): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.riderId, riderId));
  }

  async getRidesByDriverId(driverId: number): Promise<Ride[]> {
    return await db.select().from(rides).where(eq(rides.driverId, driverId));
  }

  async getActiveRideByRiderId(riderId: number): Promise<Ride | undefined> {
    const [ride] = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.riderId, riderId),
          sql`${rides.status} IN ('requested', 'assigned')`
        )
      );
    return ride;
  }

  async getActiveRideByDriverId(driverId: number): Promise<Ride | undefined> {
    const [ride] = await db
      .select()
      .from(rides)
      .where(
        and(
          eq(rides.driverId, driverId),
          eq(rides.status, 'assigned')
        )
      );
    return ride;
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const [ride] = await db.insert(rides).values(insertRide).returning();
    return ride;
  }

  async updateRideStatus(id: number, status: string): Promise<Ride | undefined> {
    const [updatedRide] = await db
      .update(rides)
      .set({ status })
      .where(eq(rides.id, id))
      .returning();
    return updatedRide;
  }

  async assignDriver(id: number, driverId: number): Promise<Ride | undefined> {
    const [updatedRide] = await db
      .update(rides)
      .set({
        driverId,
        status: 'assigned'
      })
      .where(eq(rides.id, id))
      .returning();
    return updatedRide;
  }

  async completeRide(id: number, rating: number): Promise<Ride | undefined> {
    const [updatedRide] = await db
      .update(rides)
      .set({
        rating,
        status: 'completed',
        completionTime: new Date()
      })
      .where(eq(rides.id, id))
      .returning();
    
    // Also update driver's total rides and rating
    if (updatedRide && updatedRide.driverId) {
      const driver = await this.getDriver(updatedRide.driverId);
      if (driver) {
        const totalRides = (driver.totalRides || 0) + 1;
        const totalRating = (driver.totalRating || 0) + rating;
        
        await db
          .update(drivers)
          .set({
            totalRides,
            totalRating
          })
          .where(eq(drivers.id, updatedRide.driverId));
      }
    }
    
    return updatedRide;
  }

  async getAllPayments(): Promise<Payment[]> {
    return await db.select().from(payments);
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPaymentByMomoTxId(momoTxId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.momoTxId, momoTxId));
    return payment;
  }

  async getPaymentsByRideId(rideId: number): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.rideId, rideId));
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const [updatedPayment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  // Legacy Project methods
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  // API Key methods
  async getAllApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys);
  }

  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return apiKey;
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const [apiKey] = await db.insert(apiKeys).values(insertApiKey).returning();
    return apiKey;
  }
  
  // Subscription methods
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.id))
      .limit(1);
    return subscription;
  }
  
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db
      .insert(subscriptions)
      .values(insertSubscription)
      .returning();
    return subscription;
  }
  
  async updateSubscription(id: number, tier: string, endDate: Date): Promise<Subscription | undefined> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({
        tier,
        endDate,
        isActive: true
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return updatedSubscription;
  }
  
  async cancelSubscription(id: number): Promise<Subscription | undefined> {
    const [canceledSubscription] = await db
      .update(subscriptions)
      .set({
        isActive: false,
        autoRenew: false
      })
      .where(eq(subscriptions.id, id))
      .returning();
    return canceledSubscription;
  }
  
  async isUserPremium(userId: number): Promise<boolean> {
    // Check if user has an active subscription that is not FREE tier and not expired
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, userId),
          eq(subscriptions.isActive, true),
          sql`${subscriptions.tier} != '${SubscriptionTier.FREE}'`,
          sql`(${subscriptions.endDate} IS NULL OR ${subscriptions.endDate} > NOW())`
        )
      )
      .limit(1);
    
    return !!subscription;
  }
}

export const storage = new DatabaseStorage();