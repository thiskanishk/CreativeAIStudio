const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const User = require('../models/user.model');

/**
 * Creates a rate limiter middleware with tier-based limits
 * @param {Object} options - Rate limiting options
 * @returns {Function} Express middleware
 */
const createRateLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 60 * 1000, // 1 minute window
    standardLimit: 60,    // 60 requests per minute for regular users
    premiumLimit: 120,    // 120 requests per minute for premium users
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later.'
      }
    }
  };

  const config = { ...defaultOptions, ...options };

  return rateLimit({
    windowMs: config.windowMs,
    max: async (req, res) => {
      // Default to standard limit if not authenticated
      if (!req.user) {
        return config.standardLimit;
      }

      try {
        // Find user and check their subscription tier
        const user = await User.findById(req.user.id).select('subscriptionTier');
        
        if (!user) {
          return config.standardLimit;
        }

        // Apply different rate limits based on subscription tier
        if (user.subscriptionTier === 'premium' || user.subscriptionTier === 'pro') {
          return config.premiumLimit;
        }
        
        return config.standardLimit;
      } catch (error) {
        console.error('Error determining rate limit:', error);
        return config.standardLimit;
      }
    },
    message: config.message,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    skip: (req, res) => req.path === '/health', // Skip rate limiting for health checks
    keyGenerator: (req) => {
      // Use IP if user not authenticated, otherwise use user ID
      return req.user ? req.user.id : req.ip;
    },
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    }
  });
};

module.exports = createRateLimiter; 