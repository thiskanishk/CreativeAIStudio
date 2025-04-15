/**
 * Image utility functions for the frontend
 * Browser-compatible versions of the backend image utilities
 */
import { security } from './security';

// Maximum file size in bytes (5MB)
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Valid image MIME types
export const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Check if a string is a base64 encoded image
 * @param {string} str - The string to check
 * @returns {boolean} - Whether the string is a base64 encoded image
 */
export function isBase64Image(str: string): boolean {
  if (typeof str !== 'string') return false;
  
  // Check if it's a data URL with base64 encoding
  const dataUrlRegex = /^data:image\/([a-zA-Z]*);base64,([^\s]*)$/;
  return dataUrlRegex.test(str);
}

/**
 * Validate image security
 * @param {File|Blob} file - The image file to validate
 * @returns {Promise<{valid: boolean, reason?: string}>} - Validation result
 */
export async function validateImageSecurity(file: File | Blob): Promise<{valid: boolean, reason?: string}> {
  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return { 
      valid: false, 
      reason: `File size exceeds maximum allowed (${formatFileSize(MAX_IMAGE_SIZE)})` 
    };
  }

  // Check MIME type
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      reason: `Invalid file type. Allowed types: ${VALID_IMAGE_TYPES.join(', ')}` 
    };
  }

  try {
    // Check image dimensions to prevent DoS attacks with large images
    const dimensions = await getImageDimensions(file);
    if (dimensions.width > 5000 || dimensions.height > 5000) {
      return {
        valid: false,
        reason: 'Image dimensions are too large'
      };
    }
    
    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      reason: 'Failed to validate image: ' + (error instanceof Error ? error.message : String(error))
    };
  }
}

/**
 * Convert a File or Blob to a base64 string
 * @param {File|Blob} file - The file to convert
 * @returns {Promise<string>} - Base64 encoded string with data URL prefix
 */
export function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a base64 string to a Blob
 * @param {string} base64 - The base64 string to convert
 * @param {string} mimeType - The MIME type of the blob (default: 'image/png')
 * @returns {Blob} - The converted Blob
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/png'): Blob {
  // Validate MIME type for security
  if (!VALID_IMAGE_TYPES.includes(mimeType)) {
    throw new Error(`Invalid MIME type: ${mimeType}. Allowed types: ${VALID_IMAGE_TYPES.join(', ')}`);
  }

  // Remove the data URL prefix if present
  const base64Data = base64.includes('base64,') 
    ? base64.split('base64,')[1] 
    : base64;
  
  // Convert base64 to binary
  const byteCharacters = atob(base64Data);
  const byteArrays: Uint8Array[] = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
    const slice = byteCharacters.slice(offset, offset + 1024);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
}

/**
 * Resize an image file to specified dimensions
 * @param {File|Blob} file - The image file to resize
 * @param {number} maxWidth - The maximum width of the resized image
 * @param {number} maxHeight - The maximum height of the resized image
 * @param {string} format - The image format to output (default: 'image/jpeg')
 * @param {number} quality - The quality of the output image for lossy formats (0-1, default: 0.8)
 * @returns {Promise<Blob>} - The resized image as a Blob
 */
export async function resizeImage(
  file: File | Blob, 
  maxWidth: number, 
  maxHeight: number, 
  format: string = 'image/jpeg',
  quality: number = 0.8
): Promise<Blob> {
  // Validate format for security
  if (!VALID_IMAGE_TYPES.includes(format)) {
    throw new Error(`Invalid format: ${format}. Allowed formats: ${VALID_IMAGE_TYPES.join(', ')}`);
  }

  // Limit dimensions to prevent DoS
  const safeMaxWidth = Math.min(maxWidth, 5000);
  const safeMaxHeight = Math.min(maxHeight, 5000);
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set cross-origin to anonymous to handle CORS issues
    img.crossOrigin = 'anonymous';
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release the object URL
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > safeMaxWidth) {
          height = Math.round(height * (safeMaxWidth / width));
          width = safeMaxWidth;
        }
      } else {
        if (height > safeMaxHeight) {
          width = Math.round(width * (safeMaxHeight / height));
          height = safeMaxHeight;
        }
      }
      
      // Create a canvas and draw the resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Fill with white background to prevent transparency issues
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        format,
        quality
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error loading image'));
    };
  });
}

/**
 * Get dimensions of an image file
 * @param {File|Blob} file - The image file
 * @returns {Promise<{width: number, height: number}>} - The dimensions of the image
 */
export function getImageDimensions(file: File | Blob): Promise<{width: number, height: number}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Set cross-origin to anonymous to handle CORS issues
    img.crossOrigin = 'anonymous';
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release the object URL
      URL.revokeObjectURL(img.src);
      resolve({
        width: img.width,
        height: img.height
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error loading image'));
    };
  });
}

/**
 * Check if file is a valid image
 * @param {File} file - The file to check
 * @returns {boolean} - Whether the file is a valid image
 */
export function isValidImage(file: File): boolean {
  return VALID_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
}

/**
 * Format bytes to a human-readable string
 * @param {number} bytes - The number of bytes
 * @param {number} decimals - The number of decimal places to show
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Creates a secure filename from potentially unsafe user input
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  // Remove path traversal characters and sanitize
  return security.sanitizeInput(filename)
    .replace(/[/\\?%*:|"<>]/g, '-')
    .replace(/\s+/g, '_');
}

/**
 * Extract MIME type from a data URL
 * @param {string} dataUrl - The data URL
 * @returns {string|null} - The MIME type or null if invalid
 */
export function getMimeTypeFromDataUrl(dataUrl: string): string | null {
  if (!isBase64Image(dataUrl)) return null;
  
  const match = dataUrl.match(/^data:([^;]+);/);
  return match ? match[1] : null;
}

/**
 * Validates if an image URL is from a trusted domain
 * @param {string} url - The URL to check
 * @returns {boolean} - Whether the URL is from a trusted domain
 */
export function isTrustedImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    
    // List of trusted domains for images
    const trustedDomains = [
      'facebook.com',
      'fbcdn.net',
      'instagram.com',
      'cdninstagram.com',
      // Add your application's domains
      window.location.hostname
    ];
    
    return trustedDomains.some(domain => 
      parsedUrl.hostname === domain || 
      parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch (e) {
    return false;
  }
} 