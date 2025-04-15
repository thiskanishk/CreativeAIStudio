import { 
  detectMaliciousSvg, 
  sanitizeImageFilename, 
  detectSuspiciousImageManipulation,
  validateImage
} from '../imageSecurityUtils';

// Mock implementation for File/Blob for testing
class MockFile extends Blob {
  name: string;
  type: string;
  
  constructor(parts: BlobPart[], name: string, options?: BlobPropertyBag) {
    super(parts, options);
    this.name = name;
    this.type = options?.type || '';
  }
}

describe('Image Security Utilities', () => {
  describe('detectMaliciousSvg', () => {
    it('should detect script tags in SVG', () => {
      const maliciousSvg = '<svg><script>alert("XSS")</script></svg>';
      expect(detectMaliciousSvg(maliciousSvg)).toBe(true);
    });

    it('should detect event handlers in SVG', () => {
      const maliciousSvg = '<svg onload="alert(\'XSS\')"></svg>';
      expect(detectMaliciousSvg(maliciousSvg)).toBe(true);
    });

    it('should detect javascript: protocol in SVG', () => {
      const maliciousSvg = '<svg><a xlink:href="javascript:alert(\'XSS\')">Click me</a></svg>';
      expect(detectMaliciousSvg(maliciousSvg)).toBe(true);
    });

    it('should detect data:text/html in SVG', () => {
      const maliciousSvg = '<svg><a xlink:href="data:text/html,<script>alert(\'XSS\')</script>">Click me</a></svg>';
      expect(detectMaliciousSvg(maliciousSvg)).toBe(true);
    });

    it('should return false for safe SVG', () => {
      const safeSvg = '<svg width="100" height="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" /></svg>';
      expect(detectMaliciousSvg(safeSvg)).toBe(false);
    });
  });

  describe('sanitizeImageFilename', () => {
    it('should remove path traversal characters', () => {
      expect(sanitizeImageFilename('../../../etc/passwd')).toBe('etcpasswd');
    });

    it('should remove Windows reserved characters', () => {
      expect(sanitizeImageFilename('image<>:"|?*.jpg')).toBe('image.jpg');
    });

    it('should add extension if missing', () => {
      expect(sanitizeImageFilename('image')).toBe('image.png');
    });

    it('should preserve existing extension', () => {
      expect(sanitizeImageFilename('image.jpg')).toBe('image.jpg');
    });

    it('should return a default name for empty input', () => {
      expect(sanitizeImageFilename('')).toBe('image.png');
    });

    it('should handle non-string input', () => {
      // @ts-ignore: Testing with invalid input
      expect(sanitizeImageFilename(null)).toBe('image');
    });
  });

  describe('detectSuspiciousImageManipulation', () => {
    it('should detect embedded SVG content', () => {
      const base64WithSvg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==<svg onload="alert(\'test\')">';
      expect(detectSuspiciousImageManipulation(base64WithSvg)).toBe(true);
    });

    it('should detect embedded HTML content', () => {
      const base64WithHtml = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==<html><body><script>alert("xss")</script></body></html>';
      expect(detectSuspiciousImageManipulation(base64WithHtml)).toBe(true);
    });

    it('should return false for clean base64 image data', () => {
      const cleanBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      expect(detectSuspiciousImageManipulation(cleanBase64)).toBe(false);
    });

    it('should handle non-string input', () => {
      // @ts-ignore: Testing with invalid input
      expect(detectSuspiciousImageManipulation(null)).toBe(true);
    });
  });

  describe('validateImage', () => {
    it('should validate a good image file', async () => {
      // Create a mock PNG file with valid type and size
      const mockArrayBuffer = new ArrayBuffer(100);
      const mockView = new Uint8Array(mockArrayBuffer);
      
      // Set PNG signature
      mockView[0] = 0x89;
      mockView[1] = 0x50; // P
      mockView[2] = 0x4E; // N
      mockView[3] = 0x47; // G
      mockView[4] = 0x0D;
      mockView[5] = 0x0A;
      mockView[6] = 0x1A;
      mockView[7] = 0x0A;
      
      const mockFile = new MockFile([mockArrayBuffer], 'test.png', { type: 'image/png' });
      
      // Mock the internal functions that would normally read the file
      jest.spyOn(global, 'FileReader').mockImplementation(() => {
        const reader = {
          onload: null,
          onerror: null,
          readAsArrayBuffer: jest.fn(function() {
            // @ts-ignore: Mocking
            setTimeout(() => this.onload({ target: { result: mockArrayBuffer } }), 0);
          }),
          result: mockArrayBuffer
        };
        return reader as unknown as FileReader;
      });
      
      const result = await validateImage(mockFile);
      expect(result.isValid).toBe(true);
    });

    it('should reject files that are too large', async () => {
      const mockFile = new MockFile(['dummy content'], 'large.png', { 
        type: 'image/png',
        // @ts-ignore: Adding size property for testing
        size: 10 * 1024 * 1024 // 10MB (exceeds limit)
      });
      
      // Mock the size property
      Object.defineProperty(mockFile, 'size', {
        value: 10 * 1024 * 1024,
        writable: false
      });
      
      const result = await validateImage(mockFile);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(expect.stringContaining('exceeds maximum allowed'));
    });

    it('should reject files with invalid MIME types', async () => {
      const mockFile = new MockFile(['dummy content'], 'document.pdf', { type: 'application/pdf' });
      
      const result = await validateImage(mockFile);
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain(expect.stringContaining('Invalid file type'));
    });
  });
}); 