import { RedisPersistence } from "./redis";

// For now using Redis for both persistence and queuing as suggested in task
export const persistence = new RedisPersistence();

// Export types for testing
export type { DocumentPersistence, DocumentData } from "./types";
export { RedisPersistence } from "./redis";