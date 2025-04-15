const Replicate = require('replicate');
const axios = require('axios');
const { createLogger } = require('../../../utils/logger');
const logger = createLogger('replicate-provider');

// Initialize Replicate client with API token from environment variables
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

/**
 * Replicate provider for AI generation tasks
 */
const replicateProvider = {
  /**
   * Generate image using various Replicate models
   * @param {Object} options - Image generation options
   * @returns {Promise<Object>} Generated image result
   */
  async generateImage(options) {
    const {
      prompt,
      negativePrompt = '',
      width = 1024,
      height = 1024,
      seed = Math.floor(Math.random() * 1000000),
      numberOfImages = 1,
      style = 'realistic',
      userID
    } = options;

    logger.info('Generating image with Replicate', { 
      promptLength: prompt.length, 
      width, 
      height,
      style,
      userID
    });

    // Select model based on style
    let model, modelVersion, input;
    
    if (style === 'realistic' || style === 'photographic') {
      // Use Stable Diffusion XL for realistic images
      model = 'stability-ai/sdxl';
      modelVersion = '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      input = {
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        num_outputs: numberOfImages,
        scheduler: "K_EULER_ANCESTRAL",
        num_inference_steps: 40,
        guidance_scale: 7.5,
        seed
      };
    } else if (style === 'anime' || style === 'illustration') {
      // Use Anything V5 for anime style
      model = 'cjwbw/anything-v5';
      modelVersion = '3b5c0399e6e994efa17c3748b1c10f6bb73c3626c4256266d3ed1e958b23c9cd';
      input = {
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        num_outputs: numberOfImages,
        scheduler: "DPMSolverMultistep",
        num_inference_steps: 30,
        guidance_scale: 7,
        seed
      };
    } else if (style === 'painting' || style === 'artistic') {
      // Use OpenJourney for artistic styles
      model = 'prompthero/openjourney';
      modelVersion = '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb';
      input = {
        prompt: `mdjrny-v4 style ${prompt}`,
        negative_prompt: negativePrompt,
        width,
        height,
        num_outputs: numberOfImages,
        num_inference_steps: 50,
        guidance_scale: 7,
        seed
      };
    } else {
      // Default to SDXL Turbo for fast generation
      model = 'stability-ai/sdxl-turbo';
      modelVersion = '1e7b342eba42822999c507e32c4c2ee804be4a0313e5240f66fed630b39334e4';
      input = {
        prompt,
        negative_prompt: negativePrompt,
        width,
        height,
        num_outputs: numberOfImages,
        num_inference_steps: 4, // Turbo uses fewer steps
        guidance_scale: 0,
        seed
      };
    }

    try {
      // Run the prediction
      const output = await replicate.run(`${model}:${modelVersion}`, { input });
      
      logger.info('Replicate image generation successful', {
        model,
        images: output.length,
        userID
      });

      // Format the response
      return {
        images: output.map(url => ({ url })),
        model: model.split('/')[1]
      };
    } catch (error) {
      logger.error('Replicate image generation failed', { 
        error: error.message,
        model,
        userID
      });
      throw error;
    }
  },

  /**
   * Generate video based on input images
   * @param {Object} options - Video generation options
   * @returns {Promise<Object>} Generated video result
   */
  async generateVideo(options) {
    const {
      imageUrls = [],
      prompt = '',
      videoOptions = {
        duration: 15,
        fps: 30,
        hasMusic: false,
        musicTrack: null,
        hasVoiceover: false,
        voiceGender: 'female',
        voiceStyle: 'friendly'
      },
      userID
    } = options;

    logger.info('Generating video with Replicate', { 
      imageCount: imageUrls.length, 
      hasPrompt: !!prompt,
      userID
    });

    // Check if we have images
    if (imageUrls.length === 0 && !prompt) {
      throw new Error('Video generation requires at least one image or a prompt');
    }

    try {
      let output;
      
      if (imageUrls.length > 1) {
        // Use Animatediff for image-to-video if we have multiple images
        output = await replicate.run(
          "lucataco/animatediff:0f1bfd6ad77e5fe05d48ef5a51ab1503aa620742ad59a4f1f66a959e344528e0",
          {
            input: {
              input_images: imageUrls,
              motion_scale: 1.5,
              guidance_scale: 7.5,
              fps: videoOptions.fps,
              num_frames: Math.min(videoOptions.fps * videoOptions.duration, 120) // Cap at 120 frames
            }
          }
        );
      } else if (imageUrls.length === 1) {
        // Use Gen-1 for image-to-video with motion
        output = await replicate.run(
          "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb472816fd4af51f9e029d7ddc6a72a6b9de7a3e15",
          {
            input: {
              image: imageUrls[0],
              motion_bucket_id: 40,  // Higher values = more motion
              cond_aug: 0.02,
              fps: videoOptions.fps,
              noise_aug_strength: 0.1,
              num_frames: Math.min(videoOptions.fps * videoOptions.duration, 50) // Cap at 50 frames
            }
          }
        );
      } else {
        // Use Zeroscope for text-to-video
        output = await replicate.run(
          "cjwbw/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351",
          {
            input: {
              prompt: prompt,
              negative_prompt: "low quality, blurry, text, watermark",
              fps: videoOptions.fps,
              num_frames: Math.min(videoOptions.fps * videoOptions.duration, 120),
              width: 1024,
              height: 576
            }
          }
        );
      }
      
      // Check if we need to add music
      let finalVideoUrl = output;
      if (typeof output === 'object' && output.video) {
        finalVideoUrl = output.video;
      }
      
      if (videoOptions.hasMusic && videoOptions.musicTrack) {
        finalVideoUrl = await this._addMusicToVideo(finalVideoUrl, videoOptions.musicTrack, userID);
      }
      
      // Format the response
      return {
        videoUrl: finalVideoUrl,
        thumbnailUrl: imageUrls[0] || null,
        duration: videoOptions.duration
      };
    } catch (error) {
      logger.error('Replicate video generation failed', { 
        error: error.message,
        userID
      });
      throw error;
    }
  },

  /**
   * Generate speech from text using bark-gui
   * @param {Object} options - Speech generation options
   * @returns {Promise<Object>} Generated audio result
   */
  async generateSpeech(options) {
    const {
      text,
      voice = 'v2/en_speaker_6',
      speed = 1.0,
      userID
    } = options;

    logger.info('Generating speech with Replicate Bark', { 
      textLength: text.length, 
      voice,
      userID
    });

    try {
      const output = await replicate.run(
        "suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787",
        {
          input: {
            prompt: text,
            voice_preset: voice,
            text_temp: 0.7,
            waveform_temp: 0.7
          }
        }
      );

      logger.info('Replicate speech generation successful', {
        audioUrl: output.audio_out,
        userID
      });

      // Download the audio file
      const response = await axios({
        url: output.audio_out,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      
      return {
        audio: response.data,
        format: 'wav',
        url: output.audio_out
      };
    } catch (error) {
      logger.error('Replicate speech generation failed', { 
        error: error.message,
        userID
      });
      throw error;
    }
  },

  /**
   * Add music to a video
   * @param {string} videoUrl - URL of the video
   * @param {string} musicTrack - Music track identifier
   * @param {string} userID - User ID
   * @returns {Promise<string>} URL of the video with music
   * @private
   */
  async _addMusicToVideo(videoUrl, musicTrack, userID) {
    // This would be implemented to download the video, add music, and upload it back
    // For now, we'll just return the original video URL
    logger.info('Adding music to video not implemented yet, returning original video', {
      videoUrl,
      musicTrack,
      userID
    });
    return videoUrl;
  }
};

module.exports = replicateProvider; 