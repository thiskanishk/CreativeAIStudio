// Simple in-memory cache store
const cache = {};

/**
 * Creates a caching middleware
 * @param {number} duration - Cache duration in seconds
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (duration = 60) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cachedResponse = cache[key];

    // If cache hit and not expired, return cached response
    if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
      return res.json(cachedResponse.data);
    }

    // Store original res.json method
    const originalJson = res.json;

    // Override res.json method to cache the response
    res.json = function(data) {
      // Store response in cache
      cache[key] = {
        data,
        expiresAt: Date.now() + (duration * 1000)
      };

      // Call the original json method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Helper to clear cache
const clearCache = (key) => {
  if (key) {
    delete cache[key];
  } else {
    Object.keys(cache).forEach(k => {
      delete cache[k];
    });
  }
};

module.exports = {
  cacheMiddleware,
  clearCache
}; 