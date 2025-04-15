// Import Jest DOM extensions
import '@testing-library/jest-dom';

// Mock global objects that may not be available in the test environment
global.URL.createObjectURL = jest.fn();
global.URL.revokeObjectURL = jest.fn();

// Mock canvas-related functions used in image processing
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  fillStyle: '',
  drawImage: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
}));

HTMLCanvasElement.prototype.toBlob = jest.fn((callback) => {
  callback(new Blob(['mock-image-data']));
});

// Mock for FileReader
class MockFileReader {
  onload;
  onerror;
  readAsDataURL = jest.fn(function() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({ target: { result: 'data:image/png;base64,mockBase64Data' } });
      }
    }, 0);
  });
  
  readAsArrayBuffer = jest.fn(function() {
    setTimeout(() => {
      if (this.onload) {
        const buffer = new ArrayBuffer(10);
        const view = new Uint8Array(buffer);
        // Set mock file signature bytes for PNG
        view[0] = 0x89;
        view[1] = 0x50;
        view[2] = 0x4E;
        view[3] = 0x47;
        this.onload({ target: { result: buffer } });
      }
    }, 0);
  });
}

// Mock Image constructor
class MockImage {
  onload;
  onerror;
  src = '';
  width = 100;
  height = 100;
  crossOrigin = null;
  
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 10);
  }
}

// Assign mocks to global objects
global.FileReader = MockFileReader;
global.Image = MockImage;

// For testing security-related features like DOMPurify
jest.mock('dompurify', () => ({
  sanitize: jest.fn((content) => content),
}));

// Mock fetch for API tests
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    blob: () => Promise.resolve(new Blob()),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Log errors more verbosely during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  // Fail tests on console errors if they contain specific phrases
  if (
    args[0] && 
    typeof args[0] === 'string' && 
    (args[0].includes('Warning:') || args[0].includes('Error:'))
  ) {
    // Uncomment the following line to make tests fail on console errors:
    // throw new Error(args[0]);
  }
}; 