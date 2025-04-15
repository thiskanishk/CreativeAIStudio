const axios = require('axios');
const { createLogger } = require('../../../utils/logger');
const logger = createLogger('midjourney-provider');

// API Configuration
const MIDJOURNEY_API_KEY = process.env.MIDJOURNEY_API_KEY;
const MIDJOURNEY_API_URL = process.env.MIDJOURNEY_API_URL || 'https://api.mymidjourney.ai/api';

/**
 * Provider for Midjourney generation services through a proxy service
 */
const midjourneyProvider = {
  /**
   * Generate an image using Midjourney
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    if (!MIDJOURNEY_API_KEY) {
      logger.error('Midjourney API key is missing');
      throw new Error('Midjourney API key is required');
    }

    const {
      prompt,
      negativePrompt = 'low quality, blurry, distorted',
      width = 1024,
      height = 1024,
      style = 'realistic',
      numberOfImages = 1,
      userID
    } = options;

    // Prepare aspect ratio
    let aspectRatio = "1:1";
    if (width > height) {
      aspectRatio = "16:9";
    } else if (height > width) {
      aspectRatio = "9:16";
    }

    // Add style parameters to prompt
    let enhancedPrompt = prompt;
    if (style === 'realistic' || style === 'photographic') {
      enhancedPrompt = `${prompt} --v 5.2 --style raw`;
    } else if (style === 'artistic') {
      enhancedPrompt = `${prompt} --v 5.2 --stylize 100`;
    } else if (style === 'anime') {
      enhancedPrompt = `${prompt} --niji 5`;
    } else if (style === 'painting') {
      enhancedPrompt = `${prompt} --v 5.2 --style scenic`;
    }

    // Add negative prompt if provided
    if (negativePrompt) {
      enhancedPrompt = `${enhancedPrompt} --no ${negativePrompt}`;
    }

    // Add aspect ratio
    enhancedPrompt = `${enhancedPrompt} --ar ${aspectRatio}`;

    logger.info('Generating image with Midjourney', { 
      promptLength: prompt.length,
      enhancedPromptLength: enhancedPrompt.length,
      style,
      aspectRatio,
      userID
    });

    try {
      // Initiate the generation
      const response = await axios({
        method: 'post',
        url: `${MIDJOURNEY_API_URL}/imagine`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MIDJOURNEY_API_KEY
        },
        data: {
          prompt: enhancedPrompt,
          process_mode: 'fast'
        }
      });

      const taskId = response.data.taskId;
      
      // Poll for results
      let complete = false;
      let images = [];
      let attempts = 0;
      const maxAttempts = 60; // Midjourney can take longer
      const delayMs = 5000;

      while (!complete && attempts < maxAttempts) {
        attempts++;
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        const statusResponse = await axios({
          method: 'get',
          url: `${MIDJOURNEY_API_URL}/task/${taskId}`,
          headers: {
            'x-api-key': MIDJOURNEY_API_KEY
          }
        });
        
        const status = statusResponse.data.status;
        
        if (status === 'SUCCESS') {
          complete = true;
          
          // Format the results - Midjourney returns a grid of 4 images by default
          const imageUrls = statusResponse.data.imageUrls || [];
          const finalImageUrl = statusResponse.data.imageUrl;
          
          if (finalImageUrl) {
            // If we have a single final image
            images.push({
              url: finalImageUrl,
              id: taskId,
              width: width,
              height: height
            });
          } else if (imageUrls && imageUrls.length > 0) {
            // If we have a grid of images
            imageUrls.slice(0, numberOfImages).forEach((url, index) => {
              images.push({
                url,
                id: `${taskId}-${index}`,
                width: width,
                height: height
              });
            });
          }
        } else if (status === 'FAILED') {
          throw new Error('Midjourney generation failed: ' + (statusResponse.data.error || 'Unknown error'));
        }
        // If pending or in progress, continue polling
      }
      
      if (images.length === 0) {
        throw new Error('Midjourney generation timed out or returned no images');
      }

      return {
        images,
        model: 'Midjourney'
      };
    } catch (error) {
      logger.error('Midjourney image generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Generate variations of an image using Midjourney
   * @param {Object} options - Variation options
   * @returns {Promise<Object>} Generated image variations
   */
  async generateImageVariations(options) {
    if (!MIDJOURNEY_API_KEY) {
      logger.error('Midjourney API key is missing');
      throw new Error('Midjourney API key is required');
    }

    const {
      imageUrl,
      prompt = '',
      numberOfVariations = 4,
      userID
    } = options;

    logger.info('Generating image variations with Midjourney', { 
      promptLength: prompt?.length || 0,
      userID
    });

    try {
      // Initiate variation generation
      const response = await axios({
        method: 'post',
        url: `${MIDJOURNEY_API_URL}/variation`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MIDJOURNEY_API_KEY
        },
        data: {
          imageUrl,
          prompt: prompt || undefined,  // Only include if non-empty
          process_mode: 'fast'
        }
      });

      const taskId = response.data.taskId;
      
      // Poll for results
      let complete = false;
      let variations = [];
      let attempts = 0;
      const maxAttempts = 60;
      const delayMs = 5000;

      while (!complete && attempts < maxAttempts) {
        attempts++;
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        const statusResponse = await axios({
          method: 'get',
          url: `${MIDJOURNEY_API_URL}/task/${taskId}`,
          headers: {
            'x-api-key': MIDJOURNEY_API_KEY
          }
        });
        
        const status = statusResponse.data.status;
        
        if (status === 'SUCCESS') {
          complete = true;
          
          // Midjourney typically returns a grid of 4 variations
          const imageUrls = statusResponse.data.imageUrls || [];
          
          if (imageUrls && imageUrls.length > 0) {
            imageUrls.slice(0, numberOfVariations).forEach((url, index) => {
              variations.push({
                url,
                id: `${taskId}-${index}`
              });
            });
          }
        } else if (status === 'FAILED') {
          throw new Error('Midjourney variation generation failed: ' + (statusResponse.data.error || 'Unknown error'));
        }
        // If pending or in progress, continue polling
      }
      
      if (variations.length === 0) {
        throw new Error('Midjourney variation generation timed out or returned no images');
      }

      return {
        variations,
        model: 'Midjourney'
      };
    } catch (error) {
      logger.error('Midjourney image variation generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Upscale an image using Midjourney
   * @param {Object} options - Upscale options
   * @returns {Promise<Object>} Upscaled image result
   */
  async upscaleImage(options) {
    if (!MIDJOURNEY_API_KEY) {
      logger.error('Midjourney API key is missing');
      throw new Error('Midjourney API key is required');
    }

    const {
      imageUrl,
      userID
    } = options;

    logger.info('Upscaling image with Midjourney', { userID });

    try {
      // Initiate upscale process
      const response = await axios({
        method: 'post',
        url: `${MIDJOURNEY_API_URL}/upscale`,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': MIDJOURNEY_API_KEY
        },
        data: {
          imageUrl,
          process_mode: 'fast'
        }
      });

      const taskId = response.data.taskId;
      
      // Poll for results
      let complete = false;
      let upscaledUrl = null;
      let attempts = 0;
      const maxAttempts = 30;
      const delayMs = 3000;

      while (!complete && attempts < maxAttempts) {
        attempts++;
        
        // Wait before polling
        await new Promise(resolve => setTimeout(resolve, delayMs));
        
        const statusResponse = await axios({
          method: 'get',
          url: `${MIDJOURNEY_API_URL}/task/${taskId}`,
          headers: {
            'x-api-key': MIDJOURNEY_API_KEY
          }
        });
        
        const status = statusResponse.data.status;
        
        if (status === 'SUCCESS') {
          complete = true;
          upscaledUrl = statusResponse.data.imageUrl;
        } else if (status === 'FAILED') {
          throw new Error('Midjourney upscale failed: ' + (statusResponse.data.error || 'Unknown error'));
        }
        // If pending or in progress, continue polling
      }
      
      if (!upscaledUrl) {
        throw new Error('Midjourney upscale timed out or returned no image');
      }

      return {
        url: upscaledUrl
      };
    } catch (error) {
      logger.error('Midjourney image upscaling failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  }
};

module.exports = midjourneyProvider; 