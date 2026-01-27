// Redis Setup Guide for OnelastAI
// This script provides the foundation for Redis integration

import { createClient } from 'redis';

class RedisCache {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      // Use environment variable for Redis URL
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 60000,
          lazyConnect: true,
        },
        retry_strategy: (options) => {
          if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('❌ Redis connection refused');
            return new Error('Redis server connection refused');
          }
          if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('❌ Redis retry time exhausted');
            return new Error('Retry time exhausted');
          }
          if (options.attempt > 10) {
            console.error('❌ Redis max retries reached');
            return undefined;
          }
          // Exponential backoff
          return Math.min(options.attempt * 100, 3000);
        },
      });

      this.client.on('error', (err) => {
        console.error('❌ Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('✅ Connected to Redis');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('🚀 Redis client ready');
      });

      this.client.on('end', () => {
        console.log('🔌 Redis connection ended');
        this.isConnected = false;
      });

      await this.client.connect();
    } catch (error) {
      console.error('❌ Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.disconnect();
    }
  }

  // Cache user data
  async setUser(userId, userData, ttlSeconds = 3600) {
    if (!this.isConnected) return false;

    try {
      const key = `user:${userId}`;
      await this.client.setEx(key, ttlSeconds, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('❌ Error caching user data:', error);
      return false;
    }
  }

  // Get cached user data
  async getUser(userId) {
    if (!this.isConnected) return null;

    try {
      const key = `user:${userId}`;
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('❌ Error getting cached user data:', error);
      return null;
    }
  }

  // Cache agent data
  async setAgent(agentId, agentData, ttlSeconds = 1800) {
    if (!this.isConnected) return false;

    try {
      const key = `agent:${agentId}`;
      await this.client.setEx(key, ttlSeconds, JSON.stringify(agentData));
      return true;
    } catch (error) {
      console.error('❌ Error caching agent data:', error);
      return false;
    }
  }

  // Cache session data
  async setSession(sessionId, sessionData, ttlSeconds = 3600) {
    if (!this.isConnected) return false;

    try {
      const key = `session:${sessionId}`;
      await this.client.setEx(key, ttlSeconds, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('❌ Error caching session data:', error);
      return false;
    }
  }

  // Rate limiting
  async checkRateLimit(identifier, windowSeconds = 60, maxRequests = 100) {
    if (!this.isConnected) return true; // Allow if Redis is down

    try {
      const key = `ratelimit:${identifier}`;
      const current = await this.client.incr(key);

      if (current === 1) {
        await this.client.expire(key, windowSeconds);
      }

      return current <= maxRequests;
    } catch (error) {
      console.error('❌ Error checking rate limit:', error);
      return true; // Allow on error
    }
  }

  // Health check
  async ping() {
    if (!this.client) return false;

    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const redisCache = new RedisCache();

export default RedisCache;

// Usage example:
/*
import { redisCache } from './redis-cache.js';

// Initialize
await redisCache.connect();

// Cache user data
await redisCache.setUser('user123', { name: 'John', email: 'john@example.com' });

// Get cached data
const user = await redisCache.getUser('user123');

// Rate limiting
const allowed = await redisCache.checkRateLimit('api:user123', 60, 100);

// Cleanup
await redisCache.disconnect();
*/
