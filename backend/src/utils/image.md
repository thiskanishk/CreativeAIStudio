# Image Utilities API Documentation

This module provides utility functions for working with images in various formats (URL, file path, Buffer, base64).

## Functions

### isBase64Image(str)

Checks if a string is a base64 encoded image (in data URL format).

**Parameters:**
- `str` (string): The string to check

**Returns:**
- `boolean`: Whether the string is a base64 encoded image

**Example:**
```javascript
const { isBase64Image } = require('../utils/image');

// Check if a string is a base64 image
const isBase64 = isBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...');
console.log(isBase64); // true

const isNotBase64 = isBase64Image('https://example.com/image.png');
console.log(isNotBase64); // false
```

### downloadImage(url)

Downloads an image from a URL and returns it as a Buffer.

**Parameters:**
- `url` (string): The URL of the image to download

**Returns:**
- `Promise<Buffer>`: The downloaded image as a Buffer

**Example:**
```javascript
const { downloadImage } = require('../utils/image');

// Download an image from a URL
async function example() {
  try {
    const imageBuffer = await downloadImage('https://example.com/image.png');
    console.log('Image downloaded successfully, buffer size:', imageBuffer.length);
    // Use the buffer for further processing
  } catch (error) {
    console.error('Failed to download image:', error.message);
  }
}
```

### imageToBase64(image)

Converts an image (URL, file path, or Buffer) to a base64 encoded string with a data URL prefix.

**Parameters:**
- `image` (string|Buffer): Image file path, URL, or Buffer

**Returns:**
- `Promise<string>`: Base64 encoded image string with data URL prefix

**Example:**
```javascript
const { imageToBase64 } = require('../utils/image');

// Convert various image formats to base64
async function example() {
  try {
    // From a URL
    const base64FromUrl = await imageToBase64('https://example.com/image.png');
    console.log('Base64 from URL:', base64FromUrl.substring(0, 50) + '...');
    
    // From a file path
    const base64FromFile = await imageToBase64('/path/to/local/image.jpg');
    console.log('Base64 from file:', base64FromFile.substring(0, 50) + '...');
    
    // From a buffer (assuming you have an image buffer)
    const fs = require('fs');
    const imageBuffer = fs.readFileSync('/path/to/local/image.jpg');
    const base64FromBuffer = await imageToBase64(imageBuffer);
    console.log('Base64 from buffer:', base64FromBuffer.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error converting to base64:', error.message);
  }
}
```

## Integration with AI Providers

These utility functions are used by various AI service providers in the application to handle image processing:

- Converting between different image formats
- Downloading images from external URLs
- Checking if image data is in base64 format
- Preparing images for API requests to services like OpenAI, Stability AI, etc.

## Error Handling

All functions include appropriate error handling and logging. Errors are logged using the application's logger module and are propagated to the caller.

## Dependencies

- `axios`: For downloading images from URLs
- `fs`: For reading files from the filesystem
- `path`: For determining file extensions 