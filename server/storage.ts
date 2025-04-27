import { 
  users, 
  projects, 
  dataSources, 
  dataNodes, 
  apiKeys,
  type User, 
  type InsertUser, 
  type Project, 
  type InsertProject,
  type DataSource,
  type InsertDataSource,
  type DataNode,
  type InsertDataNode,
  type ApiKey,
  type InsertApiKey
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  
  getAllDataSources(): Promise<DataSource[]>;
  getDataSource(id: number): Promise<DataSource | undefined>;
  createDataSource(dataSource: InsertDataSource): Promise<DataSource>;
  
  getAllDataNodes(): Promise<DataNode[]>;
  getDataNode(id: number): Promise<DataNode | undefined>;
  createDataNode(dataNode: InsertDataNode): Promise<DataNode>;
  
  getAllApiKeys(): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private dataSources: Map<number, DataSource>;
  private dataNodes: Map<number, DataNode>;
  private apiKeys: Map<number, ApiKey>;
  
  private userIdCounter: number;
  private projectIdCounter: number;
  private dataSourceIdCounter: number;
  private dataNodeIdCounter: number;
  private apiKeyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.dataSources = new Map();
    this.dataNodes = new Map();
    this.apiKeys = new Map();
    
    this.userIdCounter = 1;
    this.projectIdCounter = 1;
    this.dataSourceIdCounter = 1;
    this.dataNodeIdCounter = 1;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Project methods
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
  
  // DataSource methods
  async getAllDataSources(): Promise<DataSource[]> {
    return Array.from(this.dataSources.values());
  }
  
  async getDataSource(id: number): Promise<DataSource | undefined> {
    return this.dataSources.get(id);
  }
  
  async createDataSource(insertDataSource: InsertDataSource): Promise<DataSource> {
    const id = this.dataSourceIdCounter++;
    const dataSource: DataSource = { ...insertDataSource, id };
    this.dataSources.set(id, dataSource);
    return dataSource;
  }
  
  // DataNode methods
  async getAllDataNodes(): Promise<DataNode[]> {
    return Array.from(this.dataNodes.values());
  }
  
  async getDataNode(id: number): Promise<DataNode | undefined> {
    return this.dataNodes.get(id);
  }
  
  async createDataNode(insertDataNode: InsertDataNode): Promise<DataNode> {
    const id = this.dataNodeIdCounter++;
    const dataNode: DataNode = { ...insertDataNode, id };
    this.dataNodes.set(id, dataNode);
    return dataNode;
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
