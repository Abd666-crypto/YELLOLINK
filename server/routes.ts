import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema,
  insertDriverSchema,
  insertRideSchema,
  insertPaymentSchema,
  insertProjectSchema,
  insertApiKeySchema,
  insertSubscriptionSchema,
  SubscriptionTier
} from "@shared/schema";
import { AIService } from "./ai-service";

import { WebSocketServer, WebSocket } from 'ws';

// Store active connections by user type and ID
const connections: {
  [key: string]: WebSocket
} = {};

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
  
  // Subscription routes
  app.get("/api/users/:userId/subscription", async (req, res) => {
    try {
      const subscription = await storage.getUserSubscription(parseInt(req.params.userId));
      if (!subscription) {
        return res.status(404).json({ message: "No subscription found for this user" });
      }
      res.json(subscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user subscription" });
    }
  });
  
  app.post("/api/subscriptions", async (req, res) => {
    try {
      const validation = insertSubscriptionSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid subscription data", errors: validation.error.format() });
      }

      const newSubscription = await storage.createSubscription(validation.data);
      res.status(201).json(newSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });
  
  app.put("/api/subscriptions/:id", async (req, res) => {
    try {
      const { tier, endDate } = req.body;
      if (!tier || !endDate) {
        return res.status(400).json({ message: "Tier and end date are required" });
      }

      const updatedSubscription = await storage.updateSubscription(
        parseInt(req.params.id), 
        tier, 
        new Date(endDate)
      );
      
      if (!updatedSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      
      res.json(updatedSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });
  
  app.delete("/api/subscriptions/:id", async (req, res) => {
    try {
      const canceledSubscription = await storage.cancelSubscription(parseInt(req.params.id));
      if (!canceledSubscription) {
        return res.status(404).json({ message: "Subscription not found" });
      }
      res.json(canceledSubscription);
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });
  
  app.get("/api/users/:userId/premium-status", async (req, res) => {
    try {
      const isPremium = await storage.isUserPremium(parseInt(req.params.userId));
      res.json({ isPremium });
    } catch (error) {
      res.status(500).json({ message: "Failed to check premium status" });
    }
  });
  
  // ======= AI Feature Routes =======
  
  // AI Ride Prediction for drivers
  app.get("/api/ai/predict-rides/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const driver = await storage.getDriver(driverId);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      
      if (!driver.latitude || !driver.longitude) {
        return res.status(400).json({ message: "Driver location not available" });
      }
      
      const hotspots = await AIService.predictRides(driverId, {
        latitude: driver.latitude,
        longitude: driver.longitude
      });
      
      res.json({ hotspots });
    } catch (error) {
      console.error("Error predicting rides:", error);
      res.status(500).json({ message: "Failed to predict rides" });
    }
  });
  
  // Calculate driver tokens
  app.get("/api/ai/driver-tokens/:driverId", async (req, res) => {
    try {
      const driverId = parseInt(req.params.driverId);
      const driver = await storage.getDriver(driverId);
      
      if (!driver) {
        return res.status(404).json({ message: "Driver not found" });
      }
      
      // Get all completed rides for this driver
      const rides = await storage.getRidesByDriverId(driverId);
      const completedRides = rides.filter(r => r.status === "completed");
      
      // Calculate tokens based on driver performance
      const tokens = AIService.calculateTokens(driver, completedRides);
      
      // Update driver tokens in database
      // This would be handled by a separate process in production
      // For demo purposes, we're doing it synchronously
      
      res.json({ 
        driverId,
        tokensPrevious: driver.tokens || 0,
        tokensEarned: tokens,
        tokensTotal: (driver.tokens || 0) + tokens
      });
    } catch (error) {
      console.error("Error calculating tokens:", error);
      res.status(500).json({ message: "Failed to calculate tokens" });
    }
  });
  
  // Calculate ride discount
  app.get("/api/ai/calculate-discount/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's ride history
      const rides = await storage.getRidesByRiderId(userId);
      
      // Check if user has premium subscription
      const isPremium = await storage.isUserPremium(userId);
      
      // Calculate discount based on user history and premium status
      const discount = AIService.calculateDiscount(userId, rides.length, isPremium);
      
      res.json({ 
        userId,
        rideCount: rides.length,
        isPremium,
        discountPercentage: discount
      });
    } catch (error) {
      console.error("Error calculating discount:", error);
      res.status(500).json({ message: "Failed to calculate discount" });
    }
  });
  
  // Calculate affordable fare based on distance
  app.post("/api/ai/calculate-fare", async (req, res) => {
    try {
      const { 
        pickupLatitude, 
        pickupLongitude, 
        dropoffLatitude, 
        dropoffLongitude,
        userId 
      } = req.body;
      
      // Validate coordinates
      if (
        typeof pickupLatitude !== 'number' || 
        typeof pickupLongitude !== 'number' || 
        typeof dropoffLatitude !== 'number' || 
        typeof dropoffLongitude !== 'number'
      ) {
        return res.status(400).json({ 
          message: "Invalid coordinates. All latitude/longitude values must be numbers." 
        });
      }
      
      let isPremium = false;
      let rideCount = 0;
      
      // If userId is provided, get additional information for better pricing
      if (userId) {
        try {
          // Check premium status
          isPremium = await storage.isUserPremium(userId);
          
          // Get ride count
          const rides = await storage.getRidesByRiderId(userId);
          rideCount = rides.length;
        } catch (error) {
          console.warn("Could not fetch user data for fare calculation:", error);
          // Continue with default values
        }
      }
      
      // Calculate the fare
      const fareDetails = AIService.calculateAffordableFare(
        pickupLatitude,
        pickupLongitude,
        dropoffLatitude,
        dropoffLongitude,
        isPremium,
        rideCount
      );
      
      // Return fare details
      res.json({
        ...fareDetails,
        currency: "GHS",
        isPremium,
        rideCount,
        discountPercentage: AIService.calculateDiscount(userId || 0, rideCount, isPremium)
      });
    } catch (error) {
      console.error("Error calculating fare:", error);
      res.status(500).json({ message: "Failed to calculate fare" });
    }
  });
  
  // Calculate ride cancellation penalty
  app.post("/api/rides/:id/cancel", async (req, res) => {
    try {
      const rideId = parseInt(req.params.id);
      const { reason } = req.body;
      
      const ride = await storage.getRide(rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      
      if (ride.status === "completed" || ride.status === "cancelled") {
        return res.status(400).json({ message: "Cannot cancel a completed or already cancelled ride" });
      }
      
      // Calculate time elapsed since ride request
      const requestTime = ride.requestTime ? new Date(ride.requestTime) : new Date();
      const currentTime = new Date();
      const elapsedMinutes = (currentTime.getTime() - requestTime.getTime()) / (1000 * 60);
      
      // Check if driver has been assigned
      const isDriverAssigned = ride.driverId !== null;
      
      // Calculate penalty
      const penalty = AIService.calculateCancellationPenalty(rideId, elapsedMinutes, isDriverAssigned);
      
      // Update ride in database with cancellation details
      const updatedRide = await storage.cancelRide(rideId, reason, penalty);
      
      // Notify the driver if one was assigned
      if (isDriverAssigned && ride.driverId) {
        const driverConnectionId = `driver:${ride.driverId}`;
        const driverWs = connections[driverConnectionId];
        
        if (driverWs && driverWs.readyState === WebSocket.OPEN) {
          driverWs.send(JSON.stringify({
            type: 'ride_cancelled',
            rideId,
            cancellationReason: reason,
            timestamp: new Date().toISOString()
          }));
        }
      }
      
      res.json({
        rideId,
        status: "cancelled",
        timeSinceRequest: Math.round(elapsedMinutes),
        cancellationPenalty: penalty,
        cancellationReason: reason
      });
    } catch (error) {
      console.error("Error cancelling ride:", error);
      res.status(500).json({ message: "Failed to cancel ride" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize WebSocket server for real-time location updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    // Register connection type (rider or driver)
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Register the connection
        if (data.type === 'register') {
          const connectionId = `${data.userType}:${data.userId}`;
          connections[connectionId] = ws;
          console.log(`Registered ${connectionId}`);
          
          ws.send(JSON.stringify({ type: 'register_success' }));
        }
        
        // Handle location updates from driver
        if (data.type === 'location_update' && data.userType === 'driver') {
          const driverId = data.userId;
          const { latitude, longitude } = data;
          
          // Save location to database
          storage.updateDriverLocation(driverId, latitude, longitude)
            .then(driver => {
              console.log(`Updated location for driver ${driverId}`);
              
              // Forward location update to all active riders for this driver
              storage.getAllRides().then(rides => {
                const activeRides = rides.filter(ride => 
                  ride.status === 'assigned' && ride.driverId === driverId
                );
                
                activeRides.forEach(ride => {
                  const riderConnectionId = `rider:${ride.riderId}`;
                  const riderWs = connections[riderConnectionId];
                  
                  if (riderWs && riderWs.readyState === WebSocket.OPEN) {
                    riderWs.send(JSON.stringify({
                      type: 'driver_location',
                      driverId,
                      latitude,
                      longitude,
                      rideId: ride.id
                    }));
                  }
                });
              });
            })
            .catch(err => {
              console.error('Error updating driver location:', err);
            });
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
    
    // Handle disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed');
      // Remove connection from the connections object
      Object.keys(connections).forEach(key => {
        if (connections[key] === ws) {
          delete connections[key];
          console.log(`Unregistered ${key}`);
        }
      });
    });
  });
  
  return httpServer;
}
