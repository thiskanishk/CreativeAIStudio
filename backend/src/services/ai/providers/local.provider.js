const { createLogger } = require('../../../utils/logger');
const logger = createLogger('local-provider');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

// Local LLM API endpoints (if available)
const LOCAL_LLM_API = process.env.LOCAL_LLM_API || null;
const LOCAL_IMAGE_API = process.env.LOCAL_IMAGE_API || null;

/**
 * Local provider for AI generation tasks
 * Uses local resources when available, otherwise provides deterministic outputs
 */
const localProvider = {
  /**
   * Generate an image using local resources or templates
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    const {
      prompt,
      width = 1024,
      height = 1024,
      style = 'realistic',
      userID
    } = options;

    logger.info('Generating image locally', { 
      promptLength: prompt.length, 
      width, 
      height,
      style,
      userID
    });

    try {
      // If local image API is available, use it
      if (LOCAL_IMAGE_API) {
        logger.info('Using local image generation API');
        const response = await axios.post(`${LOCAL_IMAGE_API}/generate`, {
          prompt,
          width,
          height,
          style
        });

        return {
          images: response.data.images.map(image => ({
            url: image.url,
            data: image.base64 // May include base64 data directly
          })),
          model: 'local'
        };
      }

      // Fallback to template-based image (deterministic based on prompt)
      logger.info('Using template-based image generation');
      const templateImage = await this._getTemplateImage(prompt, style);
      
      return {
        images: [{ url: templateImage }],
        model: 'template'
      };
    } catch (error) {
      logger.error('Local image generation failed', { 
        error: error.message,
        userID
      });
      throw error;
    }
  },

  /**
   * Generate ad copy using local LLM or templates
   * @param {Object} options - Ad copy generation options
   * @returns {Promise<Object|Array>} Generated ad copy
   */
  async generateAdCopy(options) {
    const {
      productName,
      productDescription,
      tone = 'professional',
      maxLength = 150,
      count = 1,
      userID
    } = options;

    logger.info('Generating ad copy locally', { 
      productName, 
      tone, 
      count,
      userID
    });

    try {
      // If local LLM API is available, use it
      if (LOCAL_LLM_API) {
        logger.info('Using local LLM API');
        const response = await axios.post(`${LOCAL_LLM_API}/generate`, {
          prompt: `Create ${count} ad copy variations for this product:
Product Name: ${productName}
Product Description: ${productDescription}
Tone: ${tone}
Max Length: ${maxLength} characters
Format: JSON array with title, description, and callToAction fields`,
          max_tokens: 1000,
          temperature: 0.7
        });

        try {
          const content = response.data.text;
          const adCopyVariations = JSON.parse(content);
          return Array.isArray(adCopyVariations) ? adCopyVariations : [adCopyVariations];
        } catch (parseError) {
          logger.warn('Failed to parse LLM response as JSON, using template fallback');
          return this._getTemplateAdCopy(productName, productDescription, tone, count);
        }
      }

      // Fallback to template-based ad copy
      logger.info('Using template-based ad copy generation');
      return this._getTemplateAdCopy(productName, productDescription, tone, count);
    } catch (error) {
      logger.error('Local ad copy generation failed', { 
        error: error.message,
        userID
      });
      throw error;
    }
  },

  /**
   * Get a template image based on prompt and style
   * @param {string} prompt - The generation prompt
   * @param {string} style - The desired style
   * @returns {Promise<string>} Image URL
   * @private
   */
  async _getTemplateImage(prompt, style) {
    // Simple deterministic image selection based on prompt and style
    // In a real implementation, this would select from a library of template images
    const baseUrl = process.env.APP_URL || 'http://localhost:3000';
    
    // Get first word of prompt for deterministic selection
    const firstWord = prompt.split(' ')[0].toLowerCase();
    const hash = this._simpleHash(prompt);
    
    // Select style folder
    const styleMap = {
      'realistic': 'photos',
      'artistic': 'paintings',
      'anime': 'illustrations',
      'modern': 'graphics'
    };
    
    const styleFolder = styleMap[style] || 'photos';
    
    // Select image index based on hash
    const imageIndex = (hash % 10) + 1; // 1-10
    
    return `${baseUrl}/templates/${styleFolder}/${imageIndex}.jpg`;
  },

  /**
   * Get template-based ad copy
   * @param {string} productName - Name of the product
   * @param {string} productDescription - Product description
   * @param {string} tone - Desired tone
   * @param {number} count - Number of variations
   * @returns {Promise<Array>} Ad copy variations
   * @private
   */
  async _getTemplateAdCopy(productName, productDescription, tone, count) {
    // Template patterns for different tones
    const templates = {
      professional: [
        { 
          title: "Introducing {product}",
          description: "Experience the power of {product}. {firstSentence}",
          callToAction: "Learn More"
        },
        {
          title: "{product}: A Professional Choice",
          description: "Choose excellence with {product}. {firstSentence}",
          callToAction: "Discover Now"
        },
        {
          title: "Transform with {product}",
          description: "Elevate your experience with {product}. {firstSentence}",
          callToAction: "See Details"
        }
      ],
      casual: [
        {
          title: "Hey, Check Out {product}!",
          description: "You'll love what {product} can do for you! {firstSentence}",
          callToAction: "Shop Now"
        },
        {
          title: "{product} - Just What You Need",
          description: "Make life easier with {product}. {firstSentence}",
          callToAction: "Get Yours"
        },
        {
          title: "Meet {product}",
          description: "Say hello to your new favorite. {firstSentence}",
          callToAction: "Buy Today"
        }
      ],
      enthusiastic: [
        {
          title: "Wow! {product} Is Amazing!",
          description: "You won't believe how incredible {product} is! {firstSentence}",
          callToAction: "Get Excited!"
        },
        {
          title: "Absolutely Love {product}!",
          description: "Join thousands who can't stop raving about {product}! {firstSentence}",
          callToAction: "See Why!"
        },
        {
          title: "{product} - A Game Changer!",
          description: "Prepare to be amazed by {product}! {firstSentence}",
          callToAction: "Change Your Life!"
        }
      ]
    };
    
    // Select relevant templates
    const relevantTemplates = templates[tone] || templates.professional;
    
    // Get first sentence of product description
    let firstSentence = productDescription.split('. ')[0];
    if (firstSentence.length > 100) {
      firstSentence = firstSentence.substring(0, 97) + '...';
    }
    
    // Generate variations
    const variations = [];
    for (let i = 0; i < count; i++) {
      const template = relevantTemplates[i % relevantTemplates.length];
      variations.push({
        title: template.title.replace('{product}', productName).substring(0, 40),
        description: template.description
          .replace('{product}', productName)
          .replace('{firstSentence}', firstSentence)
          .substring(0, 150),
        callToAction: template.callToAction
      });
    }
    
    return variations;
  },

  /**
   * Simple hash function for deterministic selection
   * @param {string} str - String to hash
   * @returns {number} Hash value
   * @private
   */
  _simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
};

module.exports = localProvider; 