const rateLimit = require('express-rate-limit');

// Create a rate limiter middleware
const createRateLimiter = () => {
  return rateLimit({
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000, // 1 minute
    max: process.env.RATE_LIMIT_MAX || 60, // limit each IP to 60 requests per windowMs
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for internal health checks
    skip: (req) => req.path === '/health'
  });
};

module.exports = createRateLimiter; 