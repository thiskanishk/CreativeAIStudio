const OpenAIAdapter = require('../adapters/openai.adapter');
const CohereLLMAdapter = require('../adapters/cohere.adapter');
const logger = require('../utils/logger');

class TextGenerationService {
  constructor(provider = 'openai', config = {}) {
    this.provider = provider;
    this.config = config;
    this.adapter = this.initializeAdapter(provider, config);
  }

  initializeAdapter(provider, config) {
    logger.info(`Initializing text generation adapter: ${provider}`);
    
    switch (provider.toLowerCase()) {
      case 'openai':
        return new OpenAIAdapter(config);
      case 'cohere':
        return new CohereLLMAdapter(config);
      default:
        logger.warn(`Unknown provider: ${provider}, falling back to OpenAI`);
        return new OpenAIAdapter(config);
    }
  }

  /**
   * Generate ad copy based on product information
   * 
   * @param {Object} params - Parameters for ad copy generation
   * @returns {Promise<Object>} Generated ad copy
   */
  async generateAdCopy(params) {
    logger.info('Generating ad copy', { provider: this.provider });
    
    try {
      const { productName, productDescription, tone, maxLength = 200 } = params;
      
      // Define a clear prompt for ad copy generation
      const prompt = `
        Create a compelling Facebook ad copy for the following product:
        Product Name: ${productName}
        Product Description: ${productDescription}
        
        The ad copy should be:
        - In a ${tone || 'friendly'} tone
        - Engaging and persuasive
        - Include a clear call-to-action
        - Maximum length: ${maxLength} characters
        
        Return the content in JSON format with the following structure:
        {
          "title": "catchy headline",
          "description": "main ad copy",
          "callToAction": "action phrase"
        }
      `;
      
      const result = await this.adapter.generateText({ prompt, maxTokens: maxLength });
      
      // Process the result
      let adCopy;
      
      try {
        // Try to parse the response as JSON
        adCopy = JSON.parse(result.text);
      } catch (e) {
        // If parsing fails, extract text using regex or simple string parsing
        logger.warn('Failed to parse JSON response, extracting text manually');
        
        const titleMatch = result.text.match(/title["\s:]+([^"]+)/i);
        const descMatch = result.text.match(/description["\s:]+([^"]+)/i);
        const ctaMatch = result.text.match(/callToAction["\s:]+([^"]+)/i);
        
        adCopy = {
          title: titleMatch ? titleMatch[1] : 'Check out this amazing product!',
          description: descMatch ? descMatch[1] : result.text.substring(0, 100),
          callToAction: ctaMatch ? ctaMatch[1] : 'Shop Now'
        };
      }
      
      return {
        success: true,
        adCopy,
        provider: this.provider,
        usage: result.usage || {}
      };
    } catch (error) {
      logger.error('Error generating ad copy', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Generate multiple ad copy variations
   * 
   * @param {Object} params - Parameters for ad copy generation
   * @param {number} count - Number of variations to generate
   * @returns {Promise<Array<Object>>} Generated ad copy variations
   */
  async generateAdCopyVariations(params, count = 3) {
    logger.info(`Generating ${count} ad copy variations`);
    
    try {
      const results = [];
      
      for (let i = 0; i < count; i++) {
        const variation = await this.generateAdCopy({
          ...params,
          variationIndex: i
        });
        
        results.push(variation.adCopy);
      }
      
      return {
        success: true,
        variations: results,
        provider: this.provider
      };
    } catch (error) {
      logger.error('Error generating ad copy variations', { error: error.message });
      throw error;
    }
  }
}

module.exports = TextGenerationService; 