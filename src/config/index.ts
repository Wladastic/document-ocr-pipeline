export const env = {
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    PORT: Number(process.env.PORT || 3002),
    STORAGE_DIR: process.env.STORAGE_DIR || "./storage",
    WORKER_TIMEOUT: process.env.WORKER_TIMEOUT || "5000",
};
