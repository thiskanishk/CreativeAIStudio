const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const logger = require('../../../utils/logger');
const { isBase64Image, downloadImage, imageToBase64 } = require('../../../utils/image');

class StabilityProvider {
  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
    this.baseUrl = 'https://api.stability.ai';
    this.defaultEngine = 'stable-diffusion-xl-1024-v1-0';
  }

  /**
   * Generate images based on text prompt
   * @param {Object} options - Generation options
   * @param {string} options.prompt - Text prompt for image generation
   * @param {string} [options.negativePrompt=''] - What to avoid in the image
   * @param {number} [options.width=1024] - Width of generated image
   * @param {number} [options.height=1024] - Height of generated image
   * @param {number} [options.numberOfImages=1] - Number of images to generate
   * @param {string} [options.engine='stable-diffusion-xl-1024-v1-0'] - Stability AI engine to use
   * @param {number} [options.cfgScale=7] - How strictly to follow the prompt (1-35)
   * @param {number} [options.steps=30] - Number of diffusion steps (10-50)
   * @returns {Promise<Array>} - Array of base64 encoded images
   */
  async generateImage({
    prompt,
    negativePrompt = '',
    width = 1024,
    height = 1024,
    numberOfImages = 1,
    engine = this.defaultEngine,
    cfgScale = 7,
    steps = 30
  }) {
    logger.info(`Generating image with Stability AI: ${prompt}`);

    if (!this.apiKey) {
      throw new Error('Stability AI API key not found');
    }

    // Validate dimensions based on the engine
    const validatedDimensions = this.validateDimensions(width, height, engine);
    
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/generation/${engine}/text-to-image`,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            ...(negativePrompt ? [{
              text: negativePrompt,
              weight: -1
            }] : [])
          ],
          cfg_scale: cfgScale,
          height: validatedDimensions.height,
          width: validatedDimensions.width,
          samples: numberOfImages,
          steps: steps
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.artifacts.map(image => ({
        imageData: `data:image/png;base64,${image.base64}`,
        seed: image.seed,
        finishReason: image.finishReason
      }));
    } catch (error) {
      logger.error('Error generating image with Stability AI:', error.response?.data || error.message);
      throw new Error(`Stability AI image generation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Generate variations of an existing image
   * @param {Object} options - Variation options
   * @param {string|Buffer} options.image - Image file path, URL or base64
   * @param {string} [options.prompt=''] - Optional text prompt to guide variations
   * @param {string} [options.negativePrompt=''] - What to avoid in the image
   * @param {number} [options.numberOfVariations=1] - Number of variations
   * @param {string} [options.engine='stable-diffusion-xl-1024-v1-0'] - Stability AI engine to use
   * @param {number} [options.imageStrength=0.35] - How much to preserve the original image (0-1)
   * @returns {Promise<Array>} - Array of base64 encoded variation images
   */
  async generateImageVariations({
    image,
    prompt = '',
    negativePrompt = '',
    numberOfVariations = 1,
    engine = this.defaultEngine,
    imageStrength = 0.35
  }) {
    logger.info('Generating image variations with Stability AI');

    if (!this.apiKey) {
      throw new Error('Stability AI API key not found');
    }

    try {
      // Handle different image input types (URL, data URL, file path)
      let imageBuffer;
      let imageBase64;
      
      if (typeof image === 'string') {
        if (image.startsWith('http')) {
          // Download image from URL
          imageBuffer = await downloadImage(image);
          imageBase64 = imageBuffer.toString('base64');
        } else if (isBase64Image(image)) {
          // Extract base64 data from data URL
          imageBase64 = image.split(';base64,').pop();
        } else if (fs.existsSync(image)) {
          // Read from file path
          imageBuffer = fs.readFileSync(image);
          imageBase64 = imageBuffer.toString('base64');
        } else {
          throw new Error('Invalid image input: must be URL, base64, or file path');
        }
      } else if (Buffer.isBuffer(image)) {
        imageBase64 = image.toString('base64');
      } else {
        throw new Error('Image must be a string (URL, base64, file path) or a Buffer');
      }

      const response = await axios.post(
        `${this.baseUrl}/v1/generation/${engine}/image-to-image`,
        {
          text_prompts: [
            {
              text: prompt,
              weight: 1
            },
            ...(negativePrompt ? [{
              text: negativePrompt,
              weight: -1
            }] : [])
          ],
          init_image: imageBase64,
          init_image_mode: 'IMAGE_STRENGTH',
          image_strength: imageStrength,
          samples: numberOfVariations
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data.artifacts.map(image => ({
        imageData: `data:image/png;base64,${image.base64}`,
        seed: image.seed,
        finishReason: image.finishReason
      }));
    } catch (error) {
      logger.error('Error generating image variations with Stability AI:', error.response?.data || error.message);
      throw new Error(`Stability AI image variation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Upscale an image to higher resolution
   * @param {Object} options - Upscale options
   * @param {string|Buffer} options.image - Image file path, URL or base64
   * @param {number} [options.scale=2] - Scale factor (2 or 4)
   * @param {string} [options.engine='esrgan-v1'] - Upscaling engine
   * @returns {Promise<Object>} - Upscaled image data
   */
  async upscaleImage({
    image,
    scale = 2,
    engine = 'esrgan-v1'
  }) {
    logger.info(`Upscaling image with Stability AI, scale: ${scale}x`);

    if (!this.apiKey) {
      throw new Error('Stability AI API key not found');
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

      // Prepare form data
      const formData = new FormData();
      formData.append('image', imageBuffer, { filename: 'image.png' });
      formData.append('width', scale === 4 ? 4 : 2);

      const response = await axios.post(
        `${this.baseUrl}/v1/generation/${engine}/image-to-image/upscale`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            ...formData.getHeaders()
          }
        }
      );

      return {
        imageData: `data:image/png;base64,${response.data.artifacts[0].base64}`,
        finishReason: response.data.artifacts[0].finishReason
      };
    } catch (error) {
      logger.error('Error upscaling image with Stability AI:', error.response?.data || error.message);
      throw new Error(`Stability AI image upscaling failed: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Validate and adjust dimensions for the selected engine
   * @private
   * @param {number} width - Requested width
   * @param {number} height - Requested height
   * @param {string} engine - Engine ID
   * @returns {Object} - Validated width and height
   */
  validateDimensions(width, height, engine) {
    // Default to 1024x1024 if the engine is not recognized
    if (engine.includes('xl-1024')) {
      // SDXL supports multiples of 8, with recommended sizes
      const validSizes = [
        { width: 1024, height: 1024 },
        { width: 1152, height: 896 },
        { width: 896, height: 1152 },
        { width: 1216, height: 832 },
        { width: 832, height: 1216 },
        { width: 1344, height: 768 },
        { width: 768, height: 1344 },
        { width: 1536, height: 640 },
        { width: 640, height: 1536 }
      ];

      // Find the closest valid size
      let closestSize = validSizes[0];
      let minDifference = Math.abs(width - validSizes[0].width) + Math.abs(height - validSizes[0].height);

      for (const size of validSizes) {
        const difference = Math.abs(width - size.width) + Math.abs(height - size.height);
        if (difference < minDifference) {
          closestSize = size;
          minDifference = difference;
        }
      }

      return closestSize;
    } else if (engine.includes('512')) {
      // SD 1.5 supports multiples of 64, with max 512x512
      return {
        width: Math.min(512, Math.round(width / 64) * 64),
        height: Math.min(512, Math.round(height / 64) * 64)
      };
    } else {
      // Default case, assume 1024x1024 support
      return {
        width: 1024,
        height: 1024
      };
    }
  }
}

module.exports = new StabilityProvider(); 