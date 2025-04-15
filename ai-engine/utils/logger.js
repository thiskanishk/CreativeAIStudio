const winston = require('winston');

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Create a custom Winston format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let metaString = '';
    if (Object.keys(meta).length > 0) {
      metaString = ` ${JSON.stringify(meta)}`;
    }
    return `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}${metaString}`;
  })
);

// Get the desired log level from environment or default to 'info'
const logLevel = process.env.LOG_LEVEL || 'info';

// Create the logger
const logger = winston.createLogger({
  levels: logLevels,
  level: logLevel,
  format: customFormat,
  transports: [
    // Log to the console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      ),
    }),
    // Log to a file (rotate daily)
    new winston.transports.File({
      filename: 'logs/ai-engine-error.log',
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/ai-engine.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
});

// Add a simple wrapper method to ensure consistent naming
const loggerWrapper = {
  error: (message, meta = {}) => logger.error(message, meta),
  warn: (message, meta = {}) => logger.warn(message, meta),
  info: (message, meta = {}) => logger.info(message, meta),
  debug: (message, meta = {}) => logger.debug(message, meta),
};

module.exports = loggerWrapper; 