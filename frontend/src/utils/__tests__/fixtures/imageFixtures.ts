/**
 * Image fixtures for testing
 * 
 * This file contains test data for image-related tests including
 * sample base64 images, mock file objects, and test cases for
 * security validations.
 */

// Sample base64 image strings for testing (small 1x1 pixel images)
export const sampleBase64Images = {
  // Valid tiny PNG image (1x1 pixel, transparent)
  validPng: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  
  // Valid tiny JPEG image (1x1 pixel, white)
  validJpeg: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKAP/2Q==',
  
  // Valid tiny GIF image (1x1 pixel, black)
  validGif: 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=',
  
  // Valid tiny WebP image (1x1 pixel, red)
  validWebp: 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==',
  
  // Malicious SVG with XSS attack
  maliciousSvg: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgb25sb2FkPSJhbGVydCgnWFNTJykiPjwvc3ZnPg==',
  
  // Malicious base64 with embedded HTML
  maliciousHtml: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==<html><script>alert("xss")</script></html>',
};

// Helper to create mock files for testing
export const createMockFile = (
  name: string, 
  type: string, 
  size: number = 1024, 
  content: string = 'test-content'
): File => {
  const file = new File([content], name, { type });
  
  // Mock the size property since we can't directly set it
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  });
  
  return file;
};

// Test file objects with different properties
export const mockFiles = {
  // Valid image files
  validJpeg: createMockFile('test.jpg', 'image/jpeg'),
  validPng: createMockFile('test.png', 'image/png'),
  validGif: createMockFile('test.gif', 'image/gif'),
  validWebp: createMockFile('test.webp', 'image/webp'),
  
  // Invalid image files
  emptyFile: createMockFile('empty.png', 'image/png', 0),
  tooLarge: createMockFile('large.png', 'image/png', 10 * 1024 * 1024), // 10MB
  invalidType: createMockFile('document.pdf', 'application/pdf'),
  textFile: createMockFile('script.js', 'text/javascript'),
  
  // Suspicious file names
  pathTraversal: createMockFile('../../../etc/passwd.jpg', 'image/jpeg'),
  suspiciousName: createMockFile('<script>alert(1)</script>.png', 'image/png'),
  noExtension: createMockFile('image', 'image/png'),
  
  // SVG with potential XSS
  svgXss: createMockFile(
    'xss.svg', 
    'image/svg+xml', 
    512, 
    '<svg width="100" height="100" onload="alert(\'XSS\')"></svg>'
  ),
};

// Test cases for security validation
export const securityTestCases = [
  {
    name: 'Valid JPEG image',
    file: mockFiles.validJpeg,
    expectedValid: true,
  },
  {
    name: 'Valid PNG image',
    file: mockFiles.validPng,
    expectedValid: true,
  },
  {
    name: 'File too large',
    file: mockFiles.tooLarge,
    expectedValid: false,
    expectedIssue: 'exceeds maximum allowed',
  },
  {
    name: 'Invalid file type',
    file: mockFiles.invalidType,
    expectedValid: false,
    expectedIssue: 'Invalid file type',
  },
  {
    name: 'Empty file',
    file: mockFiles.emptyFile,
    expectedValid: false,
    expectedIssue: 'empty',
  },
  {
    name: 'SVG with XSS payload',
    file: mockFiles.svgXss,
    expectedValid: false,
    expectedIssue: 'potentially malicious content',
  },
]; 