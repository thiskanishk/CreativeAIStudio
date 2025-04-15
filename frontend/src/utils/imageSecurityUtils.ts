/**
 * Image Security Utilities
 * 
 * This file contains security-focused utilities for handling images
 * to prevent common image-based attacks and ensure proper image validation.
 */
import { MAX_IMAGE_SIZE, VALID_IMAGE_TYPES, formatFileSize } from './image';

// Type definition for file signatures
type Byte = number | null;
type FileSignature = Byte[][];
interface FileSignatures {
  [key: string]: FileSignature;
}

// Magic numbers (file signatures) for different image formats
const FILE_SIGNATURES: FileSignatures = {
  // JPEG signatures (SOI marker + APP0 marker)
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0xFF, 0xD8, 0xFF, 0xE1],
    [0xFF, 0xD8, 0xFF, 0xE2],
    [0xFF, 0xD8, 0xFF, 0xE3]
  ],
  // PNG signature
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  // GIF signatures
  'image/gif': [
    [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], // GIF87a
    [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]  // GIF89a
  ],
  // WEBP signature (RIFF + filesize + WEBP)
  'image/webp': [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]]
};

/**
 * Performs comprehensive security validation for image files
 * @param {File|Blob} file - The image file to validate
 * @returns {Promise<{isValid: boolean, message?: string, issues?: string[]}>}
 */
export async function validateImage(file: File | Blob): Promise<{
  isValid: boolean;
  message?: string;
  issues?: string[];
}> {
  const issues: string[] = [];

  // Basic validation
  if (!file) {
    return { isValid: false, message: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    issues.push(`File size exceeds maximum allowed (${formatFileSize(MAX_IMAGE_SIZE)})`);
  } else if (file.size === 0) {
    issues.push('File is empty');
  }

  // Check MIME type
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    issues.push(`Invalid file type: ${file.type}. Allowed types: ${VALID_IMAGE_TYPES.join(', ')}`);
  }

  // More advanced validations
  try {
    // Verify file signature (magic numbers)
    const isSignatureValid = await verifyFileSignature(file);
    if (!isSignatureValid) {
      issues.push('File signature does not match declared content type');
    }

    // Additional advanced checks could be added here
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    isValid: issues.length === 0,
    message: issues.length === 0 ? 'File is valid' : 'File validation failed',
    issues: issues.length > 0 ? issues : undefined
  };
}

/**
 * Verifies that a file's signature (magic numbers) matches its content type
 * @param {File|Blob} file - The file to verify
 * @returns {Promise<boolean>} - Whether the file signature is valid
 */
export async function verifyFileSignature(file: File | Blob): Promise<boolean> {
  // Skip validation if file type is not recognized or if we don't have signatures for it
  if (!file.type || !VALID_IMAGE_TYPES.includes(file.type) || !FILE_SIGNATURES[file.type]) {
    return false;
  }

  try {
    // Read the first 12 bytes of the file (enough for all our signatures)
    const buffer = await readFileHeader(file, 12);
    const bytes = new Uint8Array(buffer);
    
    // Get the signatures for this file type
    const signaturesForType = FILE_SIGNATURES[file.type];
    
    // Check if any signature matches
    return signaturesForType.some((signature: Byte[]) => {
      return signature.every((byte: Byte, index: number) => {
        // null in signature means "any byte" (wildcard)
        return byte === null || byte === bytes[index];
      });
    });
  } catch (error) {
    console.error('Error verifying file signature:', error);
    return false;
  }
}

/**
 * Reads the first N bytes of a file
 * @param {File|Blob} file - The file to read
 * @param {number} byteCount - Number of bytes to read
 * @returns {Promise<ArrayBuffer>} - The bytes read
 */
function readFileHeader(file: File | Blob, byteCount: number): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Error reading file header'));
    reader.readAsArrayBuffer(file.slice(0, byteCount));
  });
}

/**
 * Checks for potential SVG-based XSS attacks
 * @param {string} svgContent - The SVG content to check
 * @returns {boolean} - True if the SVG is potentially malicious
 */
export function detectMaliciousSvg(svgContent: string): boolean {
  if (typeof svgContent !== 'string') return true;
  
  // Check for script tags, event handlers, and other potentially dangerous content
  const dangerousPatterns = [
    /<script\b/i,                      // <script> tags
    /on\w+\s*=/i,                     // Event handlers (onclick, onload, etc.)
    /javascript\s*:/i,                // JavaScript protocol
    /<iframe\b/i,                      // <iframe> tags
    /<embed\b/i,                       // <embed> tags
    /<object\b/i,                      // <object> tags
    /data\s*:\s*text\/html/i,          // data:text/html protocol
    /xlink:href\s*=\s*["']?data:text/i // xlink:href with data protocol
  ];
  
  // Return true if any dangerous pattern is found
  return dangerousPatterns.some(pattern => pattern.test(svgContent));
}

/**
 * Sanitizes filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export function sanitizeImageFilename(filename: string): string {
  if (typeof filename !== 'string') return 'image';
  
  // Replace directory traversal characters, quotes, and special characters
  const sanitized = filename
    .replace(/[\/\\]/g, '') // Remove path traversal
    .replace(/[<>:"|?*]/g, '') // Remove Windows reserved characters
    .replace(/\.\./g, '') // Remove relative path indicators
    .trim();
  
  // If sanitization emptied the string, return a default
  if (!sanitized) return 'image';
  
  // Ensure file has an extension
  const hasExtension = /\.(jpe?g|png|gif|webp)$/i.test(sanitized);
  if (!hasExtension) return sanitized + '.png';
  
  return sanitized;
}

/**
 * Detects potentially suspicious image manipulation attempts
 * @param {string} base64Data - Base64 image data to analyze
 * @returns {boolean} True if potential manipulation is detected
 */
export function detectSuspiciousImageManipulation(base64Data: string): boolean {
  if (typeof base64Data !== 'string') return true;
  
  // Check for unusually long data that could be hiding malicious content
  if (base64Data.length > 10 * 1024 * 1024) { // 10MB in base64 is suspicious
    return true;
  }
  
  // Check for embedded content or polyglot files
  const suspiciousPatterns = [
    /<svg/i,       // SVG content embedded in image
    /<html/i,      // HTML content
    /<body/i,      // HTML body
    /<script/i,    // Script tags
    /<\/script/i,  // Closing script tags
    /eval\(/i,     // eval() function
    /<%/i,         // Server-side code indicators
    /%>/i,
    /PK\x03\x04/   // ZIP file signature (could be hiding content)
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(base64Data));
} 