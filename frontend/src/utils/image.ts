/**
 * Image utility functions for the frontend
 * Browser-compatible versions of the backend image utilities
 */

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
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Release the object URL
      URL.revokeObjectURL(img.src);
      
      // Calculate new dimensions maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round(height * (maxWidth / width));
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round(width * (maxHeight / height));
          height = maxHeight;
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
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
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