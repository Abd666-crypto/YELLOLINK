import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, 
  insertDataSourceSchema, 
  insertDataNodeSchema,
  insertApiKeySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Data sources routes
  app.get("/api/data-sources", async (req, res) => {
    try {
      const dataSources = await storage.getAllDataSources();
      res.json(dataSources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data sources" });
    }
  });

  app.post("/api/data-sources", async (req, res) => {
    try {
      const validation = insertDataSourceSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data source", errors: validation.error.format() });
      }

      const newDataSource = await storage.createDataSource(validation.data);
      res.status(201).json(newDataSource);
    } catch (error) {
      res.status(500).json({ message: "Failed to create data source" });
    }
  });

  // Data nodes routes
  app.get("/api/data-nodes", async (req, res) => {
    try {
      const dataNodes = await storage.getAllDataNodes();
      res.json(dataNodes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch data nodes" });
    }
  });

  app.post("/api/data-nodes", async (req, res) => {
    try {
      const validation = insertDataNodeSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data node", errors: validation.error.format() });
      }

      const newDataNode = await storage.createDataNode(validation.data);
      res.status(201).json(newDataNode);
    } catch (error) {
      res.status(500).json({ message: "Failed to create data node" });
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
