import Redis from 'ioredis';

import env from '../config/environment.js';

let redisClient = null;

if (env.redis.url) {
  redisClient = new Redis(env.redis.url, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false
  });

  redisClient.on('error', (error) => {
    process.stderr.write(`Redis error: ${error.message}\n`);
  });
}

export const getRedisClient = async () => {
  if (!redisClient) return null;

  try {
    if (redisClient.status === 'wait') {
      await redisClient.connect();
    }

    return redisClient.status === 'ready' ? redisClient : null;
  } catch (error) {
    process.stderr.write(`Unable to connect to Redis: ${error.message}\n`);
    return null;
  }
};
