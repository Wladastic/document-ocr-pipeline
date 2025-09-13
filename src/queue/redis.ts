
import IORedis from "ioredis";
import { env } from "../config/index"; 

export type ProcessJobData = {
  documentId: string;
  dtype: 'invoice'|'receipt'|'contract';
};

// Simple Redis-based queue for document processing, can be swapped out for RabbitMQ, Kafka, etc.
class RedisQueue {
  private readonly redis: IORedis;
  private readonly queueKey = "document-processing-queue";
  private readonly processingKey = "document-processing-active";

  constructor() {
    this.redis = new IORedis(env.REDIS_URL);
  }

  async enqueue(data: ProcessJobData): Promise<void> {
    await this.redis.lpush(this.queueKey, JSON.stringify(data));
  }

  async dequeue(): Promise<ProcessJobData | null> {
    // Use BRPOPLPUSH for reliable processing (moves from queue to processing list)
    // It also blocks the call if no item is available, to let the first free worker pickup the next job
    const result = await this.redis.brpoplpush(this.queueKey, this.processingKey, 5);
    if (!result) return null;
    
    try {
      return JSON.parse(result) as ProcessJobData;
    } catch {
      console.error("Failed to parse job data:", result);
      return null;
    }
  }

  async markCompleted(data: ProcessJobData): Promise<void> {
    await this.redis.lrem(this.processingKey, 1, JSON.stringify(data));
  }

  async markFailed(data: ProcessJobData): Promise<void> {
    // Remove from processing and optionally add to failed queue for later inspection
    await this.redis.lrem(this.processingKey, 1, JSON.stringify(data));
    await this.redis.lpush("document-processing-failed", JSON.stringify({
      ...data,
      failedAt: new Date().toISOString()
    }));
  }
}

export const queue = new RedisQueue();