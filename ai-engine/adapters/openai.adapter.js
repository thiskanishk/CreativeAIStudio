const { Configuration, OpenAIApi } = require('openai');
const logger = require('../utils/logger');

class OpenAIAdapter {
  constructor(config) {
    const apiKey = config.openAIKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      const error = 'OpenAI API key not provided';
      logger.error(error);
      throw new Error(error);
    }
    
    const configuration = new Configuration({ apiKey });
    this.openai = new OpenAIApi(configuration);
    this.model = config.openAIModel || 'gpt-4'; // Default to GPT-4
    logger.info(`OpenAI adapter initialized with model: ${this.model}`);
  }
  
  /**
   * Generate text using OpenAI model
   * 
   * @param {Object} params - Parameters for text generation
   * @param {string} params.prompt - Text prompt
   * @param {number} params.maxTokens - Maximum tokens to generate
   * @param {number} params.temperature - Randomness of generation (0-1)
   * @returns {Promise<Object>} Generated text and metadata
   */
  async generateText(params) {
    const { prompt, maxTokens = 500, temperature = 0.7 } = params;
    
    try {
      logger.info('Generating text with OpenAI', { model: this.model });
      
      const response = await this.openai.createCompletion({
        model: this.model,
        prompt,
        max_tokens: maxTokens,
        temperature,
        n: 1,
        stop: null
      });
      
      const result = response.data;
      const text = result.choices[0].text.trim();
      
      return {
        text,
        usage: result.usage,
        model: this.model
      };
    } catch (error) {
      logger.error('OpenAI text generation error', { 
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(`OpenAI Error: ${error.message}`);
    }
  }
  
  /**
   * Generate an image using DALL-E
   * 
   * @param {Object} params - Parameters for image generation
   * @param {string} params.prompt - Image description
   * @param {string} params.size - Image size (256x256, 512x512, 1024x1024)
   * @returns {Promise<Object>} Generated image URL and metadata
   */
  async generateImage(params) {
    const { prompt, size = '1024x1024' } = params;
    
    try {
      logger.info('Generating image with DALL-E', { size });
      
      const response = await this.openai.createImage({
        prompt,
        n: 1,
        size
      });
      
      return {
        imageUrl: response.data.data[0].url,
        model: 'dall-e'
      };
    } catch (error) {
      logger.error('OpenAI image generation error', { 
        error: error.message,
        response: error.response?.data
      });
      
      throw new Error(`OpenAI Image Error: ${error.message}`);
    }
  }
}

module.exports = OpenAIAdapter; 