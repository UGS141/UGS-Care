const { createClient } = require('redis');

let redisClient = null;

function initRedis() {
  if (process.env.REDIS_DISABLED === 'true') {
    console.warn('Redis is disabled via REDIS_DISABLED=true');
    return null;
  }

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  redisClient = createClient({ url });

  redisClient.on('error', (err) => {
    // don't throw — log and allow app to continue
    console.warn('Redis client error:', err && err.message ? err.message : err);
  });

  // connect but swallow connect errors
  redisClient.connect().catch((err) => {
    console.warn('Redis connect failed:', err && err.message ? err.message : err);
  });

  return redisClient;
}

module.exports = {
  get client() {
    if (!redisClient) initRedis();
    return redisClient;
  },
  initRedis,
};

// docker run -d --name redis -p 6379:6379 redis:7