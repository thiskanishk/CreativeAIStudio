const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 300 }); // Default TTL: 5 minutes

/**
 * Middleware for caching API responses
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests or authenticated routes that are user-specific
    if (req.method !== 'GET' || req.path.includes('/users/me')) {
      return next();
    }

    // Create a cache key based on the request path and query parameters
    const cacheKey = `${req.originalUrl || req.url}`;
    
    // Check if data exists in cache
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      // Add cache-specific headers
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Store the original send function
    const originalSend = res.json;
    
    // Override the send function to cache the response before sending
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode < 400) {
        cache.set(cacheKey, data, ttl);
      }
      // Add cache-specific headers
      res.set('X-Cache', 'MISS');
      // Call the original send function
      originalSend.call(this, data);
    };
    
    next();
  };
};

/**
 * Clear cache for a specific key pattern
 * @param {string} pattern - Key pattern to match
 */
const clearCache = (pattern) => {
  if (!pattern) return;
  
  const keys = cache.keys();
  
  keys.forEach(key => {
    if (key.includes(pattern)) {
      cache.del(key);
    }
  });
};

module.exports = {
  cacheMiddleware,
  clearCache
}; 