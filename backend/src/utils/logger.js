const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Creates a logger instance for a specific module
 * @param {string} moduleName - Name of the module using the logger
 * @returns {winston.Logger} Winston logger instance
 */
const createLogger = (moduleName) => {
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.metadata({ fillExcept: ['timestamp', 'level', 'message'] }),
    winston.format.printf(({ timestamp, level, message, metadata }) => {
      return `${timestamp} [${level.toUpperCase()}] [${moduleName}] ${message} ${
        Object.keys(metadata).length ? JSON.stringify(metadata) : ''
      }`;
    })
  );

  const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, metadata }) => {
      return `${timestamp} [${level}] [${moduleName}] ${message} ${
        Object.keys(metadata).length ? JSON.stringify(metadata) : ''
      }`;
    })
  );

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'creative-ai-studio-backend' },
    transports: [
      // Write all logs with level 'error' and below to error.log
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
      }),
      // Write all logs to combined.log
      new winston.transports.File({
        filename: path.join(logsDir, 'combined.log'),
      }),
    ],
  });

  // Add console transport in development
  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: consoleFormat,
        level: 'debug',
      })
    );
  } else {
    // Add console transport for info and above in production
    logger.add(
      new winston.transports.Console({
        format: consoleFormat,
        level: 'info',
      })
    );
  }

  return logger;
};

// Create a default logger
const defaultLogger = createLogger('app');

/**
 * Express middleware to log HTTP requests
 * @returns {Function} Express middleware
 */
const requestLogger = () => {
  const logger = createLogger('http');
  
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    logger.info(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    
    // Override end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Restore original end
      res.end = originalEnd;
      // Call original end
      res.end(chunk, encoding);
      
      // Log response
      const responseTime = Date.now() - startTime;
      logger.info(`${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`, {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime,
      });
    };
    
    next();
  };
};

module.exports = {
  createLogger,
  defaultLogger,
  requestLogger,
}; 