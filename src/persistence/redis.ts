import IORedis from "ioredis";
import { env } from "../config/index";
import type { DocumentPersistence, DocumentData } from "./types";
import type { DocumentStatus } from "../types/index";

// Redis-based document persistence - stores documents as JSON at keys `doc:<id>`
// As the task gives Redis as an example option, it was chosen for both db and queue
export class RedisPersistence implements DocumentPersistence {
  private redis: IORedis;

  constructor() {
    this.redis = new IORedis(env.REDIS_URL);
  }

  async createDocument(data: { filename: string; dtype: 'invoice' | 'receipt' | 'contract'; status: DocumentStatus }): Promise<DocumentData> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const doc: DocumentData = {
      id,
      filename: data.filename,
      dtype: data.dtype,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    };

    await this.redis.set(`doc:${id}`, JSON.stringify(doc));
    return doc;
  }

  async getDocument(id: string): Promise<DocumentData | null> {
    const result = await this.redis.get(`doc:${id}`);
    if (!result) return null;
    
    try {
      return JSON.parse(result) as DocumentData;
    } catch {
      return null;
    }
  }

  async updateDocument(id: string, updates: Partial<Pick<DocumentData, 'status' | 'ocrText' | 'metadata'>>): Promise<void> {
    const existing = await this.getDocument(id);
    if (!existing) throw new Error(`Document ${id} not found`);

    const updated: DocumentData = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.redis.set(`doc:${id}`, JSON.stringify(updated));
  }
}