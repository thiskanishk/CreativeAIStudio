const { createLogger } = require('../../utils/logger');
const logger = createLogger('ai-service');

// Import AI providers
const openaiProvider = require('./providers/openai.provider');
const replicateProvider = require('./providers/replicate.provider');
const stabilityProvider = require('./providers/stability.provider');
const localProvider = require('./providers/local.provider');

/**
 * AI Service class to manage various AI capabilities
 */
class AIService {
  constructor() {
    this.providers = {
      openai: openaiProvider,
      replicate: replicateProvider, 
      stability: stabilityProvider,
      local: localProvider
    };
    
    // Default provider preferences by task
    this.defaultProviders = {
      imageGeneration: ['replicate', 'stability', 'openai'],
      videoGeneration: ['replicate'],
      textGeneration: ['openai', 'local'],
      imageTransformation: ['replicate', 'stability'],
      textToSpeech: ['openai', 'replicate']
    };
    
    logger.info('AI Service initialized');
  }
  
  /**
   * Generate image based on text prompt
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Text prompt
   * @param {string} options.style - Style to apply
   * @param {Object} options.dimensions - Image dimensions
   * @param {string} options.provider - Specific provider to use
   * @param {Array<string>} options.providers - Ordered list of providers to try
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    const {
      prompt,
      style = 'realistic',
      dimensions = { width: 1024, height: 1024 },
      provider,
      providers = this.defaultProviders.imageGeneration,
      negativePrompt = '',
      seed = Math.floor(Math.random() * 1000000),
      numberOfImages = 1,
      enhancedPrompt = true,
      userID
    } = options;
    
    logger.info(`Starting image generation`, { prompt, style, provider, userID });
    
    // Process the prompt if enhanced prompt engineering is enabled
    let finalPrompt = prompt;
    if (enhancedPrompt) {
      finalPrompt = await this.enhancePrompt(prompt, style, 'image');
      logger.info('Enhanced prompt', { originalPrompt: prompt, enhancedPrompt: finalPrompt });
    }
    
    // Build generation parameters
    const generationParams = {
      prompt: finalPrompt,
      negativePrompt,
      width: dimensions.width,
      height: dimensions.height,
      seed,
      numberOfImages,
      style,
      userID
    };
    
    // If specific provider is requested, use only that
    const providersToTry = provider ? [provider] : providers;
    
    // Try providers in order until one succeeds
    let lastError = null;
    for (const providerName of providersToTry) {
      try {
        const providerInstance = this.providers[providerName];
        if (!providerInstance) {
          logger.warn(`Provider ${providerName} not found, skipping`);
          continue;
        }
        
        logger.info(`Attempting image generation with provider: ${providerName}`);
        const result = await providerInstance.generateImage(generationParams);
        logger.info(`Image generation successful with ${providerName}`);
        
        // Add metadata about which provider was used
        result.provider = providerName;
        return result;
      } catch (error) {
        logger.error(`Error generating image with provider ${providerName}`, { error: error.message });
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If all providers failed, throw error
    throw lastError || new Error('All providers failed to generate image');
  }
  
  /**
   * Generate video based on input
   * @param {Object} options - Generation options
   * @param {Array<string>} options.imageUrls - Input image URLs
   * @param {string} options.prompt - Text prompt
   * @param {Object} options.videoOptions - Video generation options
   * @param {string} options.provider - Specific provider to use
   * @returns {Promise<Object>} Generated video result
   */
  async generateVideo(options) {
    const {
      imageUrls = [],
      prompt,
      videoOptions = {
        duration: 15,
        fps: 30,
        hasMusic: false,
        musicTrack: null,
        hasVoiceover: false,
        voiceGender: 'female',
        voiceStyle: 'friendly'
      },
      provider,
      providers = this.defaultProviders.videoGeneration,
      enhancedPrompt = true,
      userID
    } = options;
    
    logger.info(`Starting video generation`, { 
      imageCount: imageUrls.length, 
      prompt, 
      provider,
      userID
    });
    
    // Process the prompt if enhanced prompt engineering is enabled
    let finalPrompt = prompt;
    if (enhancedPrompt && prompt) {
      finalPrompt = await this.enhancePrompt(prompt, 'dynamic', 'video');
      logger.info('Enhanced prompt', { originalPrompt: prompt, enhancedPrompt: finalPrompt });
    }
    
    // Build generation parameters
    const generationParams = {
      imageUrls,
      prompt: finalPrompt,
      videoOptions,
      userID
    };
    
    // If specific provider is requested, use only that
    const providersToTry = provider ? [provider] : providers;
    
    // Try providers in order until one succeeds
    let lastError = null;
    for (const providerName of providersToTry) {
      try {
        const providerInstance = this.providers[providerName];
        if (!providerInstance) {
          logger.warn(`Provider ${providerName} not found, skipping`);
          continue;
        }
        
        logger.info(`Attempting video generation with provider: ${providerName}`);
        const result = await providerInstance.generateVideo(generationParams);
        logger.info(`Video generation successful with ${providerName}`);
        
        // Add metadata about which provider was used
        result.provider = providerName;
        return result;
      } catch (error) {
        logger.error(`Error generating video with provider ${providerName}`, { error: error.message });
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If all providers failed, throw error
    throw lastError || new Error('All providers failed to generate video');
  }
  
  /**
   * Generate ad copy based on product information
   * @param {Object} options - Generation options
   * @param {string} options.productName - Name of the product
   * @param {string} options.productDescription - Product description
   * @param {string} options.tone - Tone of the ad copy
   * @param {number} options.maxLength - Maximum length of the ad copy
   * @param {number} options.count - Number of variations to generate
   * @returns {Promise<Object|Array>} Generated ad copy
   */
  async generateAdCopy(options) {
    const {
      productName,
      productDescription,
      tone = 'professional',
      maxLength = 150,
      count = 1,
      provider,
      providers = this.defaultProviders.textGeneration,
      audience = 'general',
      platform = 'facebook',
      callToAction = true,
      userID
    } = options;
    
    logger.info(`Starting ad copy generation`, { productName, tone, count, userID });
    
    // Build generation parameters
    const generationParams = {
      productName,
      productDescription,
      tone,
      maxLength,
      count,
      audience,
      platform,
      callToAction,
      userID
    };
    
    // If specific provider is requested, use only that
    const providersToTry = provider ? [provider] : providers;
    
    // Try providers in order until one succeeds
    let lastError = null;
    for (const providerName of providersToTry) {
      try {
        const providerInstance = this.providers[providerName];
        if (!providerInstance) {
          logger.warn(`Provider ${providerName} not found, skipping`);
          continue;
        }
        
        logger.info(`Attempting ad copy generation with provider: ${providerName}`);
        const result = await providerInstance.generateAdCopy(generationParams);
        logger.info(`Ad copy generation successful with ${providerName}`);
        
        // Add metadata about which provider was used
        if (Array.isArray(result)) {
          result.forEach(item => item.provider = providerName);
        } else {
          result.provider = providerName;
        }
        
        return result;
      } catch (error) {
        logger.error(`Error generating ad copy with provider ${providerName}`, { error: error.message });
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If all providers failed, throw error
    throw lastError || new Error('All providers failed to generate ad copy');
  }
  
  /**
   * Generate speech from text
   * @param {Object} options - Generation options
   * @param {string} options.text - Text to convert to speech
   * @param {string} options.voice - Voice ID or characteristics
   * @returns {Promise<Object>} Generated audio result
   */
  async generateSpeech(options) {
    const {
      text,
      voice = 'female',
      provider,
      providers = this.defaultProviders.textToSpeech,
      speed = 1.0,
      format = 'mp3',
      userID
    } = options;
    
    logger.info(`Starting speech generation`, { textLength: text.length, voice, userID });
    
    // Build generation parameters
    const generationParams = {
      text,
      voice,
      speed,
      format,
      userID
    };
    
    // If specific provider is requested, use only that
    const providersToTry = provider ? [provider] : providers;
    
    // Try providers in order until one succeeds
    let lastError = null;
    for (const providerName of providersToTry) {
      try {
        const providerInstance = this.providers[providerName];
        if (!providerInstance) {
          logger.warn(`Provider ${providerName} not found, skipping`);
          continue;
        }
        
        logger.info(`Attempting speech generation with provider: ${providerName}`);
        const result = await providerInstance.generateSpeech(generationParams);
        logger.info(`Speech generation successful with ${providerName}`);
        
        // Add metadata about which provider was used
        result.provider = providerName;
        return result;
      } catch (error) {
        logger.error(`Error generating speech with provider ${providerName}`, { error: error.message });
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If all providers failed, throw error
    throw lastError || new Error('All providers failed to generate speech');
  }
  
  /**
   * Enhance a prompt using AI techniques
   * @param {string} prompt - Original user prompt
   * @param {string} style - Desired style
   * @param {string} medium - Target medium (image, video, etc.)
   * @returns {Promise<string>} Enhanced prompt
   */
  async enhancePrompt(prompt, style, medium) {
    try {
      logger.info('Enhancing prompt', { prompt, style, medium });
      
      // Try to use OpenAI for prompt enhancement
      const enhancedPrompt = await this.providers.openai.enhancePrompt({
        prompt,
        style,
        medium
      });
      
      return enhancedPrompt || prompt;
    } catch (error) {
      logger.warn('Failed to enhance prompt, using original', { error: error.message });
      return prompt;
    }
  }
  
  /**
   * Check if content complies with content policy
   * @param {Object} options - Content check options
   * @param {string} options.type - Content type (text, image)
   * @param {string} options.content - Content to check
   * @returns {Promise<Object>} Content check result
   */
  async checkContentPolicy(options) {
    const { type, content, provider = 'openai' } = options;
    
    try {
      logger.info(`Checking content policy compliance for ${type}`);
      
      const providerInstance = this.providers[provider];
      if (!providerInstance || !providerInstance.checkContentPolicy) {
        logger.warn(`Provider ${provider} doesn't support content policy checking`);
        return { compliant: true, confidence: 0.5 };
      }
      
      const result = await providerInstance.checkContentPolicy({ type, content });
      return result;
    } catch (error) {
      logger.error('Error checking content policy', { error: error.message });
      // Default to allowing content if check fails
      return { compliant: true, confidence: 0.5, error: error.message };
    }
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = aiService; 