import { 
  users, 
  projects, 
  apiKeys,
  drivers,
  rides,
  payments,
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type ApiKey,
  type InsertApiKey,
  type Driver,
  type InsertDriver,
  type Ride,
  type InsertRide,
  type Payment,
  type InsertPayment
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drivers: Map<number, Driver>;
  private rides: Map<number, Ride>;
  private payments: Map<number, Payment>;
  private projects: Map<number, Project>;
  private apiKeys: Map<number, ApiKey>;
  
  private userIdCounter: number;
  private driverIdCounter: number;
  private rideIdCounter: number;
  private paymentIdCounter: number;
  private projectIdCounter: number;
  private apiKeyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.drivers = new Map();
    this.rides = new Map();
    this.payments = new Map();
    this.projects = new Map();
    this.apiKeys = new Map();
    
    this.userIdCounter = 1;
    this.driverIdCounter = 1;
    this.rideIdCounter = 1;
    this.paymentIdCounter = 1;
    this.projectIdCounter = 1;
    this.apiKeyIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress === walletAddress,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      walletAddress: insertUser.walletAddress || null,
      phoneNumber: insertUser.phoneNumber || null,
      role: insertUser.role || "user"
    };
    this.users.set(id, user);
    return user;
  }
  
  // Driver methods
  async getAllDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }
  
  async getDriver(id: number): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }
  
  async getDriverByUserId(userId: number): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(
      (driver) => driver.userId === userId,
    );
  }
  
  async getDriverByWalletAddress(walletAddress: string): Promise<Driver | undefined> {
    return Array.from(this.drivers.values()).find(
      (driver) => driver.walletAddress === walletAddress,
    );
  }
  
  async getActiveDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values()).filter(
      (driver) => driver.isActive && !driver.isSuspended,
    );
  }
  
  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = this.driverIdCounter++;
    const driver: Driver = { 
      ...insertDriver, 
      id,
      totalRides: 0,
      totalRating: 0,
      isSuspended: false,
      latitude: insertDriver.latitude || null,
      longitude: insertDriver.longitude || null,
      isActive: insertDriver.isActive || false
    };
    this.drivers.set(id, driver);
    return driver;
  }
  
  async updateDriverStatus(id: number, isActive: boolean): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver = { ...driver, isActive };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }
  
  async updateDriverLocation(id: number, latitude: number, longitude: number): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;
    
    const updatedDriver = { ...driver, latitude, longitude };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }
  
  // Ride methods
  async getAllRides(): Promise<Ride[]> {
    return Array.from(this.rides.values());
  }
  
  async getRide(id: number): Promise<Ride | undefined> {
    return this.rides.get(id);
  }
  
  async getRidesByRiderId(riderId: number): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(
      (ride) => ride.riderId === riderId,
    );
  }
  
  async getRidesByDriverId(driverId: number): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(
      (ride) => ride.driverId === driverId,
    );
  }
  
  async getActiveRideByRiderId(riderId: number): Promise<Ride | undefined> {
    return Array.from(this.rides.values()).find(
      (ride) => ride.riderId === riderId && (ride.status === "requested" || ride.status === "assigned"),
    );
  }
  
  async getActiveRideByDriverId(driverId: number): Promise<Ride | undefined> {
    return Array.from(this.rides.values()).find(
      (ride) => ride.driverId === driverId && ride.status === "assigned",
    );
  }
  
  async createRide(insertRide: InsertRide): Promise<Ride> {
    const id = this.rideIdCounter++;
    const ride: Ride = { 
      ...insertRide, 
      id, 
      driverId: insertRide.driverId || null,
      dropoffLocation: insertRide.dropoffLocation || null,
      status: insertRide.status || "requested",
      requestTime: new Date(),
      completionTime: null,
      rating: null
    };
    this.rides.set(id, ride);
    return ride;
  }
  
  async updateRideStatus(id: number, status: string): Promise<Ride | undefined> {
    const ride = this.rides.get(id);
    if (!ride) return undefined;
    
    const updatedRide = { ...ride, status };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }
  
  async assignDriver(id: number, driverId: number): Promise<Ride | undefined> {
    const ride = this.rides.get(id);
    if (!ride) return undefined;
    
    const updatedRide = { ...ride, driverId, status: "assigned" };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }
  
  async completeRide(id: number, rating: number): Promise<Ride | undefined> {
    const ride = this.rides.get(id);
    if (!ride || !ride.driverId) return undefined;
    
    // Update ride
    const updatedRide = { 
      ...ride, 
      status: "completed", 
      rating, 
      completionTime: new Date() 
    };
    this.rides.set(id, updatedRide);
    
    // Update driver stats
    const driver = this.drivers.get(ride.driverId);
    if (driver) {
      const updatedDriver = { 
        ...driver, 
        totalRides: driver.totalRides + 1,
        totalRating: driver.totalRating + rating 
      };
      this.drivers.set(driver.id, updatedDriver);
    }
    
    return updatedRide;
  }
  
  // Payment methods
  async getAllPayments(): Promise<Payment[]> {
    return Array.from(this.payments.values());
  }
  
  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }
  
  async getPaymentByMomoTxId(momoTxId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.momoTxId === momoTxId,
    );
  }
  
  async getPaymentsByRideId(rideId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.rideId === rideId,
    );
  }
  
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const payment: Payment = { 
      ...insertPayment, 
      id,
      status: insertPayment.status || "pending",
      timestamp: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }
  
  async updatePaymentStatus(id: number, status: string): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Project methods - legacy
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }
  
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const project: Project = { 
      ...insertProject, 
      id,
      lastRun: insertProject.lastRun || null,
      dataPoints: insertProject.dataPoints || 0
    };
    this.projects.set(id, project);
    return project;
  }
  
  // ApiKey methods
  async getAllApiKeys(): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values());
  }
  
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyIdCounter++;
    const apiKey: ApiKey = { ...insertApiKey, id };
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
}

export const storage = new MemStorage();
