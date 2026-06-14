import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "edusync_v4";

// Extend global namespace to maintain a cached connection across hot reloads in development
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

class Database {
  private static client: MongoClient;
  private static db: Db;
  private static isConnecting = false;
  private static connectionPromise: Promise<MongoClient> | null = null;

  static async connect(): Promise<{ client: MongoClient; db: Db }> {
    if (this.db && this.client) {
      return { client: this.client, db: this.db };
    }

    if (this.isConnecting && this.connectionPromise) {
      this.client = await this.connectionPromise;
      this.db = this.client.db(MONGODB_DB);
      return { client: this.client, db: this.db };
    }

    this.isConnecting = true;

    try {
      if (process.env.NODE_ENV === 'development') {
        // In development mode, use a global variable so that the value
        // is preserved across module reloads caused by HMR (Hot Module Replacement).
        if (!global._mongoClientPromise) {
          const client = new MongoClient(MONGODB_URI, {
            maxPoolSize: 100,
            minPoolSize: 10,
          });
          global._mongoClientPromise = client.connect();
        }
        this.connectionPromise = global._mongoClientPromise;
        this.client = await this.connectionPromise;
      } else {
        // In production mode, it's best to not use a global variable.
        const client = new MongoClient(MONGODB_URI, {
          maxPoolSize: 100,
          minPoolSize: 10,
        });
        this.connectionPromise = client.connect();
        this.client = await this.connectionPromise;
      }

      this.db = this.client.db(MONGODB_DB);
      console.log("✅ MongoDB connected successfully");
      return { client: this.client, db: this.db };
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  static async getDb(): Promise<Db> {
    const { db } = await this.connect();
    return db;
  }
}

// Export the connect function and db getter
export const connectToDatabase = () => Database.connect();
export const getDb = () => Database.getDb();
