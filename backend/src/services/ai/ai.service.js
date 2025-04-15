const openaiProvider = require('./providers/openai.provider');
const stabilityProvider = require('./providers/stability.provider');
const logger = require('../../utils/logger');

/**
 * Service for handling AI-related operations across different providers
 */
class AIService {
  constructor() {
    this.providers = {
      openai: openaiProvider,
      stability: stabilityProvider,
    };
    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
  }

  /**
   * Generate an image using the specified or default AI provider
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Text prompt for image generation
   * @param {number} [options.width=1024] - Width of the generated image
   * @param {number} [options.height=1024] - Height of the generated image
   * @param {number} [options.numberOfImages=1] - Number of images to generate
   * @param {string} [options.provider] - Provider to use (openai, stability)
   * @returns {Promise<Array>} - Array of generated image URLs
   */
  async generateImage(options) {
    const { provider = this.defaultProvider, ...providerOptions } = options;
    
    logger.info(`Generating image using ${provider} provider: ${options.prompt}`);
    
    if (!this.providers[provider]) {
      throw new Error(`Unknown AI provider: ${provider}`);
    }
    
    try {
      return await this.providers[provider].generateImage(providerOptions);
    } catch (error) {
      logger.error(`Error generating image with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Generate variations of an existing image
   * @param {Object} options - Variation options
   * @param {string|Buffer} options.image - Image file path, URL or buffer
   * @param {string} [options.prompt=''] - Optional text prompt to guide variations (for providers that support it)
   * @param {number} [options.numberOfVariations=1] - Number of variations to generate
   * @param {string} [options.provider] - Provider to use (openai, stability)
   * @returns {Promise<Array>} - Array of variation image URLs
   */
  async generateImageVariations(options) {
    const { provider = this.defaultProvider, ...providerOptions } = options;
    
    logger.info(`Generating image variations using ${provider} provider`);
    
    if (!this.providers[provider]) {
      throw new Error(`Unknown AI provider: ${provider}`);
    }
    
    try {
      return await this.providers[provider].generateImageVariations(providerOptions);
    } catch (error) {
      logger.error(`Error generating image variations with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Upscale an image (only available with certain providers)
   * @param {Object} options - Upscale options
   * @param {string|Buffer} options.image - Image file path, URL or buffer
   * @param {number} [options.scale=2] - Upscale factor
   * @param {string} [options.provider='stability'] - Provider to use
   * @returns {Promise<string>} - Upscaled image URL or base64
   */
  async upscaleImage(options) {
    const { provider = 'stability', ...providerOptions } = options;
    
    logger.info(`Upscaling image using ${provider} provider`);
    
    if (!this.providers[provider]) {
      throw new Error(`Unknown AI provider: ${provider}`);
    }
    
    if (!this.providers[provider].upscaleImage) {
      throw new Error(`Provider ${provider} does not support image upscaling`);
    }
    
    try {
      return await this.providers[provider].upscaleImage(providerOptions);
    } catch (error) {
      logger.error(`Error upscaling image with ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get a list of available AI providers
   * @returns {Array<string>} - List of provider IDs
   */
  getAvailableProviders() {
    return Object.keys(this.providers);
  }

  /**
   * Check if a specific provider is available and properly configured
   * @param {string} providerId - The provider ID to check
   * @returns {boolean} - Whether the provider is available
   */
  isProviderAvailable(providerId) {
    return this.providers.hasOwnProperty(providerId);
  }
}

module.exports = new AIService(); 