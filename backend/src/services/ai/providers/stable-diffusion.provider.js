const axios = require('axios');
const FormData = require('form-data');
const { createLogger } = require('../../../utils/logger');
const logger = createLogger('stable-diffusion-provider');

// API Configuration
const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_API_URL = process.env.STABILITY_API_URL || 'https://api.stability.ai/v1';

/**
 * Provider for Stable Diffusion generation services
 */
const stableDiffusionProvider = {
  /**
   * Generate an image using Stable Diffusion
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    if (!STABILITY_API_KEY) {
      logger.error('Stability API key is missing');
      throw new Error('Stability API key is required');
    }

    const {
      prompt,
      negativePrompt = 'low quality, blurry, distorted',
      width = 1024,
      height = 1024,
      style = 'photographic',
      numberOfImages = 1,
      seed = Math.floor(Math.random() * 2147483647),
      userID
    } = options;

    // Map style to engine ID (model)
    let engineId = 'stable-diffusion-xl-1024-v1-0';
    if (style === 'anime') {
      engineId = 'stable-diffusion-anime-v2-0';
    } else if (style === 'artistic') {
      engineId = 'stable-diffusion-xl-v1-0';
    }

    logger.info('Generating image with Stable Diffusion', { 
      promptLength: prompt.length,
      engineId,
      width,
      height,
      userID
    });

    try {
      const response = await axios({
        method: 'post',
        url: `${STABILITY_API_URL}/generation/${engineId}/text-to-image`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${STABILITY_API_KEY}`
        },
        data: {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            {
              text: negativePrompt,
              weight: -1
            }
          ],
          cfg_scale: 7,
          clip_guidance_preset: 'FAST_BLUE',
          height,
          width,
          samples: numberOfImages,
          steps: 30,
          seed
        }
      });

      const images = response.data.artifacts.map((artifact, index) => {
        return {
          url: `data:image/png;base64,${artifact.base64}`,
          id: `${artifact.seed}-${index}`,
          width,
          height
        };
      });

      return {
        images,
        model: engineId
      };
    } catch (error) {
      logger.error('Stable Diffusion image generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Generate variations of an image using Stable Diffusion
   * @param {Object} options - Variation options
   * @returns {Promise<Object>} Generated image variations
   */
  async generateImageVariations(options) {
    if (!STABILITY_API_KEY) {
      logger.error('Stability API key is missing');
      throw new Error('Stability API key is required');
    }

    const {
      imageUrl,
      prompt = '',
      numberOfVariations = 4,
      userID
    } = options;

    logger.info('Generating image variations with Stable Diffusion', { 
      promptLength: prompt?.length || 0,
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

      // Get image buffer
      const imageBuffer = await getImageBuffer(imageUrl);
      
      // Create form data
      const formData = new FormData();
      formData.append('init_image', imageBuffer, { filename: 'image.png' });
      
      if (prompt) {
        formData.append('text_prompts[0][text]', prompt);
        formData.append('text_prompts[0][weight]', '1');
      }
      
      formData.append('init_image_mode', 'IMAGE_STRENGTH');
      formData.append('image_strength', '0.35');
      formData.append('cfg_scale', '7');
      formData.append('samples', numberOfVariations.toString());
      formData.append('steps', '30');

      // API call
      const response = await axios({
        method: 'post',
        url: `${STABILITY_API_URL}/generation/stable-diffusion-xl-1024-v1-0/image-to-image`,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        },
        data: formData
      });

      // Process results
      const variations = response.data.artifacts.map((artifact, index) => {
        return {
          url: `data:image/png;base64,${artifact.base64}`,
          id: `${artifact.seed}-${index}`
        };
      });

      return {
        variations,
        model: 'stable-diffusion-xl-1024-v1-0'
      };
    } catch (error) {
      logger.error('Stable Diffusion image variation generation failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  },

  /**
   * Upscale an image using Stable Diffusion
   * @param {Object} options - Upscale options
   * @returns {Promise<Object>} Upscaled image result
   */
  async upscaleImage(options) {
    if (!STABILITY_API_KEY) {
      logger.error('Stability API key is missing');
      throw new Error('Stability API key is required');
    }

    const {
      imageUrl,
      scale = 2,
      userID
    } = options;

    logger.info('Upscaling image with Stable Diffusion', { scale, userID });

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

      // Get image buffer
      const imageBuffer = await getImageBuffer(imageUrl);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: 'image.png' });
      formData.append('width', scale.toString());
      formData.append('height', scale.toString());

      // API call
      const response = await axios({
        method: 'post',
        url: `${STABILITY_API_URL}/generation/esrgan-v1/image-to-image/upscale`,
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${STABILITY_API_KEY}`,
          'Accept': 'application/json'
        },
        data: formData
      });

      return {
        url: `data:image/png;base64,${response.data.artifacts[0].base64}`
      };
    } catch (error) {
      logger.error('Stable Diffusion image upscaling failed', { 
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
        userID
      });
      throw error;
    }
  }
};

module.exports = stableDiffusionProvider; 