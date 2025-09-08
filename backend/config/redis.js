import { createClient } from 'redis';
import winston from 'winston';
  

// --------------------
// Setup Winston Logger
// --------------------
const logger = winston.createLogger({
  level: 'warn',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// --------------------
// Redis Client
// --------------------
let redisClient = null; // RedisClientType | null

export function initRedis() { // Returns RedisClientType | null
  if (redisClient) return redisClient;

  if (process.env.REDIS_DISABLED === 'true') {
    logger.warn('Redis is disabled via REDIS_DISABLED=true');
    return null;
  }

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  redisClient = createClient({ url });

  redisClient.on('error', (err) => {
    logger.warn(`Redis client error: ${err?.message ?? err}`);
  });

  redisClient.connect().catch((err) => {
    logger.warn(`Redis connect failed: ${err?.message ?? err}`);
  });

  return redisClient;
}

// --------------------
// Export Client Getter
// --------------------
export const client = {
  get instance() {
    if (!redisClient) initRedis();
    return redisClient;
  },
};

// Optional: graceful shutdown
process.on('exit', async () => {
  if (redisClient) await redisClient.quit();
});
