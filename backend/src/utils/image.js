const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { createLogger } = require('./logger');
const logger = createLogger('image-utils');

/**
 * Check if a string is a base64 encoded image
 * @param {string} str - The string to check
 * @returns {boolean} - Whether the string is a base64 encoded image
 */
function isBase64Image(str) {
  if (typeof str !== 'string') return false;
  
  // Check if it's a data URL with base64 encoding
  const dataUrlRegex = /^data:image\/([a-zA-Z]*);base64,([^\s]*)$/;
  return dataUrlRegex.test(str);
}

/**
 * Download an image from a URL and return it as a Buffer
 * @param {string} url - The URL of the image to download
 * @returns {Promise<Buffer>} - The downloaded image as a Buffer
 */
async function downloadImage(url) {
  try {
    logger.info(`Downloading image from: ${url}`);
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'arraybuffer'
    });
    
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    logger.error(`Error downloading image: ${error.message}`);
    throw new Error(`Failed to download image: ${error.message}`);
  }
}

/**
 * Convert an image to base64 string
 * @param {string|Buffer} image - Image file path or Buffer
 * @returns {Promise<string>} - Base64 encoded image string with data URL prefix
 */
async function imageToBase64(image) {
  try {
    let buffer;
    
    if (Buffer.isBuffer(image)) {
      // If already a buffer, use it directly
      buffer = image;
    } else if (typeof image === 'string') {
      if (image.startsWith('http')) {
        // It's a URL, download it
        buffer = await downloadImage(image);
      } else if (fs.existsSync(image)) {
        // It's a file path, read it
        buffer = fs.readFileSync(image);
      } else if (isBase64Image(image)) {
        // It's already a base64 data URL, return it as is
        return image;
      } else {
        throw new Error('Invalid image input: must be a URL, file path, or base64 string');
      }
    } else {
      throw new Error('Image must be a string (URL, file path, base64) or a Buffer');
    }
    
    // Determine content type (simple approach based on file extension)
    let contentType = 'image/png'; // default
    if (typeof image === 'string' && !image.startsWith('http')) {
      const ext = path.extname(image).toLowerCase();
      if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.webp') contentType = 'image/webp';
    }
    
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch (error) {
    logger.error(`Error converting image to base64: ${error.message}`);
    throw error;
  }
}

module.exports = {
  isBase64Image,
  downloadImage,
  imageToBase64
}; 