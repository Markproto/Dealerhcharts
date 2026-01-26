const env = require('../config/env');

class CacheManager {
  constructor(ttl = env.CACHE_TTL) {
    this.cache = new Map();
    this.ttl = ttl;
    this.lastFullRefresh = null;
  }

  get(metal) {
    const entry = this.cache.get(metal);
    if (!entry) return null;
    return { ...entry, age: Date.now() - entry.fetchedAt };
  }

  set(metal, priceData) {
    this.cache.set(metal, {
      ...priceData,
      fetchedAt: Date.now(),
    });
  }

  getAll() {
    const result = {};
    for (const [metal, entry] of this.cache) {
      result[metal] = { ...entry, age: Date.now() - entry.fetchedAt };
    }
    return result;
  }

  isStale(metal) {
    const entry = this.cache.get(metal);
    if (!entry) return true;
    return Date.now() - entry.fetchedAt > this.ttl;
  }

  hasAnyData() {
    return this.cache.size > 0;
  }

  markRefresh() {
    this.lastFullRefresh = Date.now();
  }

  getStatus() {
    const entries = {};
    for (const [metal, entry] of this.cache) {
      entries[metal] = {
        source: entry.source,
        age: Date.now() - entry.fetchedAt,
        stale: Date.now() - entry.fetchedAt > this.ttl,
      };
    }
    return {
      size: this.cache.size,
      lastRefresh: this.lastFullRefresh,
      ttl: this.ttl,
      entries,
    };
  }
}

// Singleton
const cache = new CacheManager();

module.exports = cache;
