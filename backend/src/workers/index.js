require('dotenv').config();
const { defaultLogger: logger } = require('../utils/logger');
const {
  imageGenerationQueue,
  videoGenerationQueue,
  adCopyGenerationQueue,
  emailQueue
} = require('../services/queue.service');

// Import processors
const processImageGeneration = require('./processors/imageGeneration.processor');
const processVideoGeneration = require('./processors/videoGeneration.processor');
const processAdCopyGeneration = require('./processors/adCopyGeneration.processor');
const processEmail = require('./processors/email.processor');

// Set concurrency for each queue
const CONCURRENCY = {
  imageGeneration: process.env.IMAGE_GENERATION_CONCURRENCY || 3,
  videoGeneration: process.env.VIDEO_GENERATION_CONCURRENCY || 2,
  adCopyGeneration: process.env.AD_COPY_GENERATION_CONCURRENCY || 5,
  email: process.env.EMAIL_CONCURRENCY || 10
};

// Register processors with their respective queues
logger.info('Starting workers...');

// Image generation processor
imageGenerationQueue.process(CONCURRENCY.imageGeneration, async (job) => {
  logger.info(`Processing image generation job #${job.id}`, { jobId: job.id });
  try {
    const result = await processImageGeneration(job.data);
    logger.info(`Completed image generation job #${job.id}`, { jobId: job.id });
    return result;
  } catch (error) {
    logger.error(`Failed to process image generation job #${job.id}`, { 
      jobId: job.id, 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

// Video generation processor
videoGenerationQueue.process(CONCURRENCY.videoGeneration, async (job) => {
  logger.info(`Processing video generation job #${job.id}`, { jobId: job.id });
  try {
    const result = await processVideoGeneration(job.data);
    logger.info(`Completed video generation job #${job.id}`, { jobId: job.id });
    return result;
  } catch (error) {
    logger.error(`Failed to process video generation job #${job.id}`, { 
      jobId: job.id, 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

// Ad copy generation processor
adCopyGenerationQueue.process(CONCURRENCY.adCopyGeneration, async (job) => {
  logger.info(`Processing ad copy generation job #${job.id}`, { jobId: job.id });
  try {
    const result = await processAdCopyGeneration(job.data);
    logger.info(`Completed ad copy generation job #${job.id}`, { jobId: job.id });
    return result;
  } catch (error) {
    logger.error(`Failed to process ad copy generation job #${job.id}`, { 
      jobId: job.id, 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

// Email processor
emailQueue.process(CONCURRENCY.email, async (job) => {
  logger.info(`Processing email job #${job.id}`, { jobId: job.id });
  try {
    const result = await processEmail(job.data);
    logger.info(`Completed email job #${job.id}`, { jobId: job.id });
    return result;
  } catch (error) {
    logger.error(`Failed to process email job #${job.id}`, { 
      jobId: job.id, 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
});

// Log when workers are ready
logger.info('All workers started successfully');

// Handle graceful shutdown
const gracefulShutdown = async () => {
  logger.info('Gracefully shutting down workers...');
  
  // Close all queues
  await Promise.all([
    imageGenerationQueue.close(),
    videoGenerationQueue.close(),
    adCopyGenerationQueue.close(),
    emailQueue.close()
  ]);
  
  logger.info('Workers shut down successfully');
  process.exit(0);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Create placeholder processor files
const fs = require('fs');
const path = require('path');

const processorsDir = path.join(__dirname, 'processors');
if (!fs.existsSync(processorsDir)) {
  fs.mkdirSync(processorsDir, { recursive: true });
}

// Create placeholder processor files (these would be implemented with actual logic)
const createPlaceholderProcessor = (filename, processorName) => {
  const filePath = path.join(processorsDir, filename);
  if (!fs.existsSync(filePath)) {
    const content = `
/**
 * ${processorName} background job processor
 * @param {Object} data - Job data
 * @returns {Promise<Object>} Job result
 */
module.exports = async (data) => {
  // TODO: Implement ${processorName} logic
  console.log('Processing ${processorName} job with data:', data);
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    message: '${processorName} completed successfully',
    // Add relevant result data here
  };
};
`;
    fs.writeFileSync(filePath, content.trim());
  }
};

createPlaceholderProcessor('imageGeneration.processor.js', 'Image Generation');
createPlaceholderProcessor('videoGeneration.processor.js', 'Video Generation');
createPlaceholderProcessor('adCopyGeneration.processor.js', 'Ad Copy Generation');
createPlaceholderProcessor('email.processor.js', 'Email'); 