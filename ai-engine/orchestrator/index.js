const logger = require('../utils/logger');
const TextGenerationService = require('../services/textGeneration.service');
const ImageGenerationService = require('../services/imageGeneration.service');
const VideoGenerationService = require('../services/videoGeneration.service');
const VoiceGenerationService = require('../services/voiceGeneration.service');

class AIOrchestrator {
  constructor() {
    this.config = null;
    this.textGenService = null;
    this.imageGenService = null;
    this.videoGenService = null;
    this.voiceGenService = null;
    this.initialized = false;
  }
  
  initialize(config) {
    logger.info('Initializing AI Orchestrator...');
    
    if (!config.openAIKey && !process.env.OPENAI_API_KEY) {
      logger.warn('No OpenAI API key provided. Text generation may not work.');
    }
    
    if (!config.replicateKey && !process.env.REPLICATE_API_KEY) {
      logger.warn('No Replicate API key provided. Image/video generation may not work.');
    }
    
    this.config = config;
    
    // Initialize services with appropriate adapters
    this.textGenService = new TextGenerationService(config.textProvider, config);
    this.imageGenService = new ImageGenerationService(config.imageProvider, config);
    this.videoGenService = new VideoGenerationService(config.videoProvider, config);
    this.voiceGenService = new VoiceGenerationService(config.voiceProvider, config);
    
    this.initialized = true;
    logger.info('AI Orchestrator initialized successfully');
    
    return this;
  }
  
  async checkInitialized() {
    if (!this.initialized) {
      throw new Error('AI Orchestrator is not initialized. Call initialize() first.');
    }
  }
  
  /**
   * Generate ad copy based on product information
   * 
   * @param {Object} params - Ad copy parameters
   * @param {string} params.productName - Name of the product
   * @param {string} params.productDescription - Description of the product
   * @param {string} params.tone - Tone of the ad copy (friendly, professional, etc.)
   * @param {number} params.maxLength - Maximum length of the ad copy
   * @returns {Promise<Object>} Generated ad copy
   */
  async generateAdCopy(params) {
    await this.checkInitialized();
    logger.info('Generating ad copy', { params });
    
    try {
      return await this.textGenService.generateAdCopy(params);
    } catch (error) {
      logger.error('Error generating ad copy', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Generate image ad based on input images and configuration
   * 
   * @param {Object} params - Image generation parameters
   * @param {Array<string>} params.imageUrls - Array of input image URLs
   * @param {Object} params.adText - Ad text configuration
   * @param {Object} params.style - Style configuration
   * @param {Object} params.logo - Logo configuration (optional)
   * @param {string} params.resolution - Resolution of output image
   * @returns {Promise<Object>} Generated image information
   */
  async generateImageAd(params) {
    await this.checkInitialized();
    logger.info('Generating image ad', { type: 'image' });
    
    try {
      return await this.imageGenService.generateAd(params);
    } catch (error) {
      logger.error('Error generating image ad', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Generate video ad based on input images and configuration
   * 
   * @param {Object} params - Video generation parameters
   * @param {Array<string>} params.imageUrls - Array of input image URLs
   * @param {Object} params.adText - Ad text configuration
   * @param {Object} params.style - Style configuration
   * @param {Object} params.videoOptions - Video-specific options
   * @param {boolean} params.videoOptions.hasMusic - Whether to include background music
   * @param {boolean} params.videoOptions.hasVoiceover - Whether to include voiceover
   * @returns {Promise<Object>} Generated video information
   */
  async generateVideoAd(params) {
    await this.checkInitialized();
    logger.info('Generating video ad', { type: 'video' });
    
    try {
      // If voiceover is requested, generate it first
      if (params.videoOptions?.hasVoiceover) {
        const scriptText = params.adText.description || params.adText.title;
        const voiceOptions = {
          text: scriptText,
          gender: params.videoOptions.voiceGender || 'male',
          style: params.videoOptions.voiceStyle || 'friendly'
        };
        
        const voiceResult = await this.voiceGenService.generateVoiceover(voiceOptions);
        params.voiceoverUrl = voiceResult.audioUrl;
      }
      
      // Generate the video with the video service
      return await this.videoGenService.generateAd(params);
    } catch (error) {
      logger.error('Error generating video ad', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Check the status of an asynchronous job
   * 
   * @param {string} jobId - ID of the job to check
   * @param {string} type - Type of job (image, video, text)
   * @returns {Promise<Object>} Job status information
   */
  async checkJobStatus(jobId, type) {
    await this.checkInitialized();
    logger.info(`Checking job status: ${jobId}`, { type });
    
    try {
      let service;
      
      switch (type) {
        case 'image':
          service = this.imageGenService;
          break;
        case 'video':
          service = this.videoGenService;
          break;
        case 'voice':
          service = this.voiceGenService;
          break;
        default:
          throw new Error(`Unknown job type: ${type}`);
      }
      
      return await service.checkJobStatus(jobId);
    } catch (error) {
      logger.error(`Error checking job status: ${jobId}`, { error: error.message });
      throw error;
    }
  }
}

module.exports = AIOrchestrator; 