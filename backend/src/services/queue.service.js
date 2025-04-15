const Queue = require('bull');
const { createLogger } = require('../utils/logger');

// Create logger
const logger = createLogger('queue-service');

// Redis connection config
const redisConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
  }
};

// Create queues
const imageGenerationQueue = new Queue('image-generation', redisConfig);
const videoGenerationQueue = new Queue('video-generation', redisConfig);
const adCopyGenerationQueue = new Queue('ad-copy-generation', redisConfig);
const emailQueue = new Queue('email', redisConfig);

// Set up queue event handlers
const setupQueueEvents = (queue) => {
  queue.on('completed', (job, result) => {
    logger.info(`Job #${job.id} completed in queue ${queue.name}`, { jobId: job.id, result });
  });

  queue.on('failed', (job, error) => {
    logger.error(`Job #${job.id} failed in queue ${queue.name}`, { jobId: job.id, error: error.message });
  });

  queue.on('stalled', (job) => {
    logger.warn(`Job #${job.id} stalled in queue ${queue.name}`, { jobId: job.id });
  });

  queue.on('error', (error) => {
    logger.error(`Queue ${queue.name} encountered an error`, { error: error.message });
  });
};

// Set up events for all queues
setupQueueEvents(imageGenerationQueue);
setupQueueEvents(videoGenerationQueue);
setupQueueEvents(adCopyGenerationQueue);
setupQueueEvents(emailQueue);

/**
 * Add a job to generate an image
 * @param {Object} data - Data for the image generation job
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job object
 */
const addImageGenerationJob = async (data, options = {}) => {
  const defaultOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: false, // Keep failed jobs
  };

  const jobOptions = { ...defaultOptions, ...options };
  return imageGenerationQueue.add(data, jobOptions);
};

/**
 * Add a job to generate a video
 * @param {Object} data - Data for the video generation job
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job object
 */
const addVideoGenerationJob = async (data, options = {}) => {
  const defaultOptions = {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 10000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 100,
    },
    removeOnFail: false,
  };

  const jobOptions = { ...defaultOptions, ...options };
  return videoGenerationQueue.add(data, jobOptions);
};

/**
 * Add a job to generate ad copy
 * @param {Object} data - Data for the ad copy generation job
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job object
 */
const addAdCopyGenerationJob = async (data, options = {}) => {
  const defaultOptions = {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600,
      count: 1000,
    },
    removeOnFail: false,
  };

  const jobOptions = { ...defaultOptions, ...options };
  return adCopyGenerationQueue.add(data, jobOptions);
};

/**
 * Add a job to send an email
 * @param {Object} data - Data for the email job
 * @param {Object} options - Job options
 * @returns {Promise<Object>} Job object
 */
const addEmailJob = async (data, options = {}) => {
  const defaultOptions = {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: {
      age: 7 * 24 * 3600, // Keep for a week
      count: 1000,
    },
    removeOnFail: false,
  };

  const jobOptions = { ...defaultOptions, ...options };
  return emailQueue.add(data, jobOptions);
};

/**
 * Get a job by ID
 * @param {string} queueName - Name of the queue
 * @param {string} jobId - ID of the job
 * @returns {Promise<Object>} Job object
 */
const getJob = async (queueName, jobId) => {
  let queue;
  
  switch (queueName) {
    case 'image-generation':
      queue = imageGenerationQueue;
      break;
    case 'video-generation':
      queue = videoGenerationQueue;
      break;
    case 'ad-copy-generation':
      queue = adCopyGenerationQueue;
      break;
    case 'email':
      queue = emailQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }
  
  return queue.getJob(jobId);
};

/**
 * Close all queues
 * @returns {Promise<void>}
 */
const closeQueues = async () => {
  await Promise.all([
    imageGenerationQueue.close(),
    videoGenerationQueue.close(),
    adCopyGenerationQueue.close(),
    emailQueue.close(),
  ]);
};

// Export the queues and methods
module.exports = {
  imageGenerationQueue,
  videoGenerationQueue,
  adCopyGenerationQueue,
  emailQueue,
  addImageGenerationJob,
  addVideoGenerationJob,
  addAdCopyGenerationJob,
  addEmailJob,
  getJob,
  closeQueues,
}; 