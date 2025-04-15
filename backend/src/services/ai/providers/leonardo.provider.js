const axios = require('axios');
const { createLogger } = require('../../../utils/logger');
const logger = createLogger('leonardo-provider');

// API Configuration
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY;
const LEONARDO_API_URL = process.env.LEONARDO_API_URL || 'https://cloud.leonardo.ai/api/rest/v1';

/**
 * Provider for Leonardo.ai image generation services
 */
const leonardoProvider = {
  /**
   * Generate an image using Leonardo.ai
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    if (!LEONARDO_API_KEY) {
      logger.error('Leonardo API key is missing');
      throw new Error('Leonardo API key is required');
    }

    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      modelId = 'ac614f96-1082-45bf-be9d-757f2d31c174', // Default to DreamShaper v8
      numberOfImages = 1,
      seed = -1,
      userID
    } = options;

    logger.info('Generating image with Leonardo.ai', { 
      promptLength: prompt.length,
      width, 
      height,
      modelId,
      userID
    });

    try {
      // Step 1: Create a generation request
      const generationResponse = await axios({
        method: 'post',
        url: `${LEONARDO_API_URL}/generations`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        },
        data: {
          prompt,
          negative_prompt: negativePrompt,
          modelId,
          width,
          height,
          num_images: numberOfImages,
          seed: seed >= 0 ? seed : undefined,
          public: false,
          promptMagic: true
        }
      });

      const generationId = generationResponse.data.sdGenerationJob.generationId;
      logger.info('Leonardo generation request created', { generationId, userID });

      // Step 2: Poll for generation results
      const images = await this.pollGenerationResults(generationId, userID);

      return {
        images,
        generationId,
        model: 'leonardo'
      };
    } catch (error) {
      logger.error('Leonardo image generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Poll for generation results
   * @param {string} generationId - The generation ID to poll
   * @param {string} userID - User identifier
   * @returns {Promise<Array>} Array of generated images
   */
  async pollGenerationResults(generationId, userID) {
    const maxAttempts = 60; // Wait up to 5 minutes (60 * 5s)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios({
          method: 'get',
          url: `${LEONARDO_API_URL}/generations/${generationId}`,
          headers: {
            'Authorization': `Bearer ${LEONARDO_API_KEY}`
          }
        });
        
        const { generations, status } = response.data;
        
        if (status === 'COMPLETE') {
          logger.info('Leonardo generation complete', { 
            generationId,
            imagesCount: generations.length,
            userID
          });
          
          return generations.map((image, index) => ({
            url: image.url,
            id: `leonardo-${generationId}-${index}`,
            width: image.width,
            height: image.height
          }));
        }
        
        if (status === 'FAILED') {
          logger.error('Leonardo generation failed', { generationId, userID });
          throw new Error('Generation failed');
        }
        
        // Wait 5 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        logger.error('Error polling Leonardo generation', {
          error: error.message,
          generationId,
          userID
        });
        throw error;
      }
    }
    
    logger.error('Leonardo generation timeout', { generationId, userID });
    throw new Error('Generation timed out after 5 minutes');
  },

  /**
   * Generate variations of an image using Leonardo.ai
   * @param {Object} options - Variation options
   * @returns {Promise<Object>} Generated image variations
   */
  async generateImageVariations(options) {
    if (!LEONARDO_API_KEY) {
      logger.error('Leonardo API key is missing');
      throw new Error('Leonardo API key is required');
    }

    const {
      imageUrl,
      prompt = '',
      negativePrompt = '',
      modelId = 'ac614f96-1082-45bf-be9d-757f2d31c174', // Default to DreamShaper v8
      numberOfVariations = 4,
      strength = 0.7,
      userID
    } = options;

    logger.info('Generating image variations with Leonardo.ai', { 
      promptLength: prompt.length,
      modelId,
      strength,
      userID
    });

    try {
      // Helper function to fetch image as binary data
      const getImageBuffer = async (url) => {
        // Handle data URLs
        if (url.startsWith('data:')) {
          const matches = url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            return Buffer.from(matches[2], 'base64');
          }
          throw new Error('Invalid data URL');
        }
        
        // Fetch from URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
      };

      // Step 1: Upload the initial image
      const imageBuffer = await getImageBuffer(imageUrl);
      
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer]), 'image.png');

      const uploadResponse = await axios({
        method: 'post',
        url: `${LEONARDO_API_URL}/init-image`,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        },
        data: formData
      });

      const initImageId = uploadResponse.data.uploadInitImage.id;
      logger.info('Image uploaded to Leonardo', { initImageId, userID });

      // Step 2: Create a variation request
      const variationResponse = await axios({
        method: 'post',
        url: `${LEONARDO_API_URL}/variations`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        },
        data: {
          initImageId,
          prompt,
          negative_prompt: negativePrompt,
          modelId,
          strength,
          num_images: numberOfVariations,
          public: false
        }
      });

      const generationId = variationResponse.data.sdGenerationJob.generationId;
      logger.info('Leonardo variation request created', { generationId, userID });

      // Step 3: Poll for variation results
      const variations = await this.pollGenerationResults(generationId, userID);

      return {
        variations,
        generationId,
        model: 'leonardo'
      };
    } catch (error) {
      logger.error('Leonardo image variation generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Upscale an image using Leonardo.ai
   * @param {Object} options - Upscale options
   * @returns {Promise<Object>} Upscaled image result
   */
  async upscaleImage(options) {
    if (!LEONARDO_API_KEY) {
      logger.error('Leonardo API key is missing');
      throw new Error('Leonardo API key is required');
    }

    const {
      imageUrl,
      scale = 2,
      userID
    } = options;

    logger.info('Upscaling image with Leonardo.ai', { scale, userID });

    try {
      // Helper function to fetch image as binary data
      const getImageBuffer = async (url) => {
        // Handle data URLs
        if (url.startsWith('data:')) {
          const matches = url.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            return Buffer.from(matches[2], 'base64');
          }
          throw new Error('Invalid data URL');
        }
        
        // Fetch from URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data);
      };

      // Step 1: Upload the image to upscale
      const imageBuffer = await getImageBuffer(imageUrl);
      
      const formData = new FormData();
      formData.append('file', new Blob([imageBuffer]), 'image.png');

      const uploadResponse = await axios({
        method: 'post',
        url: `${LEONARDO_API_URL}/init-image`,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        },
        data: formData
      });

      const initImageId = uploadResponse.data.uploadInitImage.id;

      // Step 2: Request upscaling
      const upscaleResponse = await axios({
        method: 'post',
        url: `${LEONARDO_API_URL}/upscale`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${LEONARDO_API_KEY}`
        },
        data: {
          id: initImageId,
          scale
        }
      });

      const upscaleId = upscaleResponse.data.upscaleJob.id;
      logger.info('Leonardo upscale request created', { upscaleId, userID });

      // Step 3: Poll for upscale results
      const upscaledImage = await this.pollUpscaleResults(upscaleId, userID);

      return {
        upscaledImage,
        model: 'leonardo'
      };
    } catch (error) {
      logger.error('Leonardo image upscaling failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Poll for upscale results
   * @param {string} upscaleId - The upscale ID to poll
   * @param {string} userID - User identifier
   * @returns {Promise<Object>} Upscale result
   */
  async pollUpscaleResults(upscaleId, userID) {
    const maxAttempts = 30; // Wait up to 2.5 minutes (30 * 5s)
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const response = await axios({
          method: 'get',
          url: `${LEONARDO_API_URL}/upscale-results/${upscaleId}`,
          headers: {
            'Authorization': `Bearer ${LEONARDO_API_KEY}`
          }
        });
        
        if (response.data.upscaled_image) {
          const { upscaled_image, width, height } = response.data;
          
          logger.info('Leonardo upscaling complete', { upscaleId, width, height, userID });
          
          return {
            url: upscaled_image,
            id: `leonardo-upscale-${upscaleId}`,
            width,
            height
          };
        }
        
        // Wait 5 seconds before trying again
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      } catch (error) {
        logger.error('Error polling Leonardo upscale', {
          error: error.message,
          upscaleId,
          userID
        });
        throw error;
      }
    }
    
    logger.error('Leonardo upscale timeout', { upscaleId, userID });
    throw new Error('Upscale operation timed out after 2.5 minutes');
  }
};

module.exports = leonardoProvider; 