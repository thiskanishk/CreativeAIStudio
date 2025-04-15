const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('../../../utils/logger');
const { isBase64Image, downloadImage, imageToBase64 } = require('../../../utils/image');

/**
 * OpenAI Provider for image generation
 */
class OpenAIProvider {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = 'https://api.openai.com/v1';
    this.defaultModel = 'dall-e-3';
  }

  /**
   * Generate images based on text prompt
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Text prompt for image generation
   * @param {string} [options.negativePrompt=''] - What to avoid in the image
   * @param {number} [options.width=1024] - Width of generated image
   * @param {number} [options.height=1024] - Height of generated image
   * @param {number} [options.numberOfImages=1] - Number of images to generate
   * @param {string} [options.model='dall-e-3'] - Model to use (dall-e-2 or dall-e-3)
   * @param {string} [options.quality='standard'] - Image quality (standard or hd)
   * @param {string} [options.style='vivid'] - Image style (vivid or natural)
   * @returns {Promise<Array>} - Array of base64 encoded images
   */
  async generateImage({
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    numberOfImages = 1,
    model = this.defaultModel,
    quality = 'standard',
    style = 'vivid'
  }) {
    logger.info(`Generating image with OpenAI: ${prompt}`);

    if (!this.apiKey) {
      throw new Error('OpenAI API key not found');
    }

    // Add negative prompt if provided
    const fullPrompt = negativePrompt 
      ? `${prompt}. Avoid: ${negativePrompt}`
      : prompt;

    // Ensure size is valid for the selected model
    const size = this.getValidSize(width, height, model);

    try {
      const response = await axios.post(
        `${this.baseUrl}/images/generations`,
        {
          prompt: fullPrompt,
          model,
          n: Math.min(numberOfImages, model === 'dall-e-3' ? 1 : 10), // DALL-E 3 max is 1, DALL-E 2 max is 10
          size,
          quality: model === 'dall-e-3' ? quality : undefined, // Quality only available on DALL-E 3
          style: model === 'dall-e-3' ? style : undefined,     // Style only available on DALL-E 3
          response_format: 'b64_json'
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.data.map(image => ({
        imageData: `data:image/png;base64,${image.b64_json}`,
        revisedPrompt: image.revised_prompt || prompt
      }));
    } catch (error) {
      logger.error('Error generating image with OpenAI:', error.response?.data || error.message);
      throw new Error(`OpenAI image generation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Generate variations of an existing image
   * @param {Object} options - Variation options
   * @param {string|Buffer} options.image - Image file path, URL or base64
   * @param {number} [options.numberOfVariations=1] - Number of variations
   * @param {number} [options.width=1024] - Width of output image
   * @param {number} [options.height=1024] - Height of output image
   * @returns {Promise<Array>} - Array of base64 encoded variation images
   */
  async generateImageVariations({
    image,
    numberOfVariations = 1,
    width = 1024,
    height = 1024
  }) {
    logger.info('Generating image variations with OpenAI');

    if (!this.apiKey) {
      throw new Error('OpenAI API key not found');
    }

    try {
      // Handle different image input types (URL, data URL, file path)
      let imageBuffer;
      
      if (typeof image === 'string') {
        if (image.startsWith('http')) {
          // Download image from URL
          imageBuffer = await downloadImage(image);
        } else if (isBase64Image(image)) {
          // Convert base64 to buffer
          const base64Data = image.split(';base64,').pop();
          imageBuffer = Buffer.from(base64Data, 'base64');
        } else if (fs.existsSync(image)) {
          // Read from file path
          imageBuffer = fs.readFileSync(image);
        } else {
          throw new Error('Invalid image input: must be URL, base64, or file path');
        }
      } else if (Buffer.isBuffer(image)) {
        imageBuffer = image;
      } else {
        throw new Error('Image must be a string (URL, base64, file path) or a Buffer');
      }

      // Prepare form data for the API request
      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: 'image.png' });
      formData.append('n', Math.min(numberOfVariations, 4)); // Maximum 4 for OpenAI variations
      
      // Determine size based on dimensions
      const size = this.getValidSize(width, height, 'dall-e-2'); // Only DALL-E 2 supports variations
      formData.append('size', size);
      formData.append('response_format', 'b64_json');

      const response = await axios.post(
        `${this.baseUrl}/images/variations`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          }
        }
      );

      return response.data.data.map(image => ({
        imageData: `data:image/png;base64,${image.b64_json}`
      }));
    } catch (error) {
      logger.error('Error generating image variations with OpenAI:', error.response?.data || error.message);
      throw new Error(`OpenAI image variation failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  /**
   * Get a valid size string for OpenAI based on width and height
   * @private
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @param {string} model - Model name
   * @returns {string} - Size string in OpenAI format
   */
  getValidSize(width, height, model) {
    const validSizes = {
      'dall-e-2': ['256x256', '512x512', '1024x1024'],
      'dall-e-3': ['1024x1024', '1792x1024', '1024x1792']
    };

    // Default to square format if model not recognized
    const modelSizes = validSizes[model] || validSizes['dall-e-2'];
    
    if (width === height) {
      // Square image
      if (model === 'dall-e-3') return '1024x1024';
      if (width <= 256) return '256x256';
      if (width <= 512) return '512x512';
      return '1024x1024';
    } else if (width > height) {
      // Landscape
      return model === 'dall-e-3' ? '1792x1024' : '1024x1024';
    } else {
      // Portrait
      return model === 'dall-e-3' ? '1024x1792' : '1024x1024';
    }
  }
}

module.exports = new OpenAIProvider(); 