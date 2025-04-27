import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertDriverSchema,
  insertRideSchema,
  insertPaymentSchema,
  insertProjectSchema,
  insertApiKeySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // ======= YeloLink API Routes =======
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validation = insertUserSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid user data", errors: validation.error.format() });
      }

      const newUser = await storage.createUser(validation.data);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/users/wallet/:walletAddress", async (req, res) => {
    try {
      const user = await storage.getUserByWalletAddress(req.params.walletAddress);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user by wallet address" });
    }
  });

  // Driver routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getAllDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch drivers" });
    }
  });

  app.get("/api/drivers/active", async (req, res) => {
    try {
      const activeDrivers = await storage.getActiveDrivers();
      res.json(activeDrivers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active drivers" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(parseInt(req.params.id));
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const validation = insertDriverSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid driver data", errors: validation.error.format() });
      }

      const newDriver = await storage.createDriver(validation.data);
      res.status(201).json(newDriver);
    } catch (error) {
      res.status(500).json({ message: "Failed to register driver" });
    }
  });

  app.put("/api/drivers/:id/status", async (req, res) => {
    try {
      const { isActive } = req.body;
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Invalid status data" });
      }

      const updatedDriver = await storage.updateDriverStatus(parseInt(req.params.id), isActive);
      if (!updatedDriver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(updatedDriver);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  app.put("/api/drivers/:id/location", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ message: "Invalid location data" });
      }

      const updatedDriver = await storage.updateDriverLocation(parseInt(req.params.id), latitude, longitude);
      if (!updatedDriver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      res.json(updatedDriver);
    } catch (error) {
      res.status(500).json({ message: "Failed to update driver location" });
    }
  });

  // Ride routes
  app.get("/api/rides", async (req, res) => {
    try {
      const rides = await storage.getAllRides();
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rides" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRide(parseInt(req.params.id));
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride" });
    }
  });

  app.get("/api/rides/rider/:riderId", async (req, res) => {
    try {
      const rides = await storage.getRidesByRiderId(parseInt(req.params.riderId));
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rider's rides" });
    }
  });

  app.get("/api/rides/rider/:riderId/active", async (req, res) => {
    try {
      const ride = await storage.getActiveRideByRiderId(parseInt(req.params.riderId));
      if (!ride) {
        return res.status(404).json({ message: "No active ride found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active ride" });
    }
  });

  app.get("/api/rides/driver/:driverId", async (req, res) => {
    try {
      const rides = await storage.getRidesByDriverId(parseInt(req.params.driverId));
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch driver's rides" });
    }
  });

  app.get("/api/rides/driver/:driverId/active", async (req, res) => {
    try {
      const ride = await storage.getActiveRideByDriverId(parseInt(req.params.driverId));
      if (!ride) {
        return res.status(404).json({ message: "No active ride found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active ride" });
    }
  });

  app.post("/api/rides", async (req, res) => {
    try {
      const validation = insertRideSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid ride data", errors: validation.error.format() });
      }

      const newRide = await storage.createRide(validation.data);
      
      // Create payment record
      await storage.createPayment({
        rideId: newRide.id,
        momoTxId: newRide.momoTxId,
        amount: newRide.fare,
        status: "pending"
      });
      
      res.status(201).json(newRide);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ride request" });
    }
  });

  app.put("/api/rides/:id/assign", async (req, res) => {
    try {
      const { driverId } = req.body;
      if (!driverId) {
        return res.status(400).json({ message: "Driver ID is required" });
      }

      const updatedRide = await storage.assignDriver(parseInt(req.params.id), driverId);
      if (!updatedRide) {
        return res.status(404).json({ message: "Ride not found" });
      }
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ message: "Failed to assign driver" });
    }
  });

  app.put("/api/rides/:id/complete", async (req, res) => {
    try {
      const { rating } = req.body;
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Valid rating (1-5) is required" });
      }

      const updatedRide = await storage.completeRide(parseInt(req.params.id), rating);
      if (!updatedRide) {
        return res.status(404).json({ message: "Ride not found or no driver assigned" });
      }
      
      // Update payment status
      const payments = await storage.getPaymentsByRideId(updatedRide.id);
      if (payments.length > 0) {
        await storage.updatePaymentStatus(payments[0].id, "completed");
      }
      
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ message: "Failed to complete ride" });
    }
  });

  app.put("/api/rides/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedRide = await storage.updateRideStatus(parseInt(req.params.id), status);
      if (!updatedRide) {
        return res.status(404).json({ message: "Ride not found" });
      }
      res.json(updatedRide);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ride status" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      const payments = await storage.getAllPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.get("/api/payments/:id", async (req, res) => {
    try {
      const payment = await storage.getPayment(parseInt(req.params.id));
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment" });
    }
  });

  app.get("/api/payments/momo/:momoTxId", async (req, res) => {
    try {
      const payment = await storage.getPaymentByMomoTxId(req.params.momoTxId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(payment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment by MoMo transaction ID" });
    }
  });

  app.get("/api/payments/ride/:rideId", async (req, res) => {
    try {
      const payments = await storage.getPaymentsByRideId(parseInt(req.params.rideId));
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validation = insertPaymentSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid payment data", errors: validation.error.format() });
      }

      const newPayment = await storage.createPayment(validation.data);
      res.status(201).json(newPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.put("/api/payments/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const updatedPayment = await storage.updatePaymentStatus(parseInt(req.params.id), status);
      if (!updatedPayment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      res.json(updatedPayment);
    } catch (error) {
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // ======= Legacy API Routes =======
  
  // Projects routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validation = insertProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid project data", errors: validation.error.format() });
      }

      const newProject = await storage.createProject(validation.data);
      res.status(201).json(newProject);
    } catch (error) {
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // API Keys routes
  app.get("/api/api-keys", async (req, res) => {
    try {
      const apiKeys = await storage.getAllApiKeys();
      res.json(apiKeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post("/api/api-keys", async (req, res) => {
    try {
      const validation = insertApiKeySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid API key data", errors: validation.error.format() });
      }

      const newApiKey = await storage.createApiKey(validation.data);
      res.status(201).json(newApiKey);
    } catch (error) {
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
