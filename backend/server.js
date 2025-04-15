const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const passport = require('passport');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const campaignRoutes = require('./src/routes/campaign.routes');
const assetRoutes = require('./src/routes/asset.routes');
const mediaRoutes = require('./src/routes/media.routes');
const generateRoutes = require('./src/routes/generate.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const feedbackRoutes = require('./src/routes/feedback.routes');

// Import middlewares
const createRateLimiter = require('./src/middlewares/rateLimit.middleware');
const { cacheMiddleware } = require('./src/middlewares/cache.middleware');

// Create Express app
const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Passport middleware
app.use(passport.initialize());
require('./src/config/passport')(passport);

// Apply rate limiting to all routes
app.use(createRateLimiter());

// API Routes with appropriate middleware
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Apply caching to read-heavy routes
app.use('/api/campaigns', cacheMiddleware(300), campaignRoutes);
app.use('/api/assets', cacheMiddleware(300), assetRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Format error response consistently
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Something went wrong!',
      details: process.env.NODE_ENV === 'development' ? err : {}
    }
  });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Perform graceful shutdown
  process.exit(1);
});

module.exports = app; 