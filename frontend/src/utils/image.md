# Frontend Image Utilities API Documentation

This module provides browser-compatible utility functions for working with images in various formats (File, Blob, base64 strings).

## Functions

### isBase64Image(str)

Checks if a string is a base64 encoded image (in data URL format).

**Parameters:**
- `str` (string): The string to check

**Returns:**
- `boolean`: Whether the string is a base64 encoded image

**Example:**
```typescript
import { isBase64Image } from '../utils/image';

// Check if a string is a base64 image
const isBase64 = isBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...');
console.log(isBase64); // true

const isNotBase64 = isBase64Image('https://example.com/image.png');
console.log(isNotBase64); // false
```

### fileToBase64(file)

Converts a File or Blob to a base64 encoded string with data URL prefix.

**Parameters:**
- `file` (File|Blob): The file to convert

**Returns:**
- `Promise<string>`: Base64 encoded string with data URL prefix

**Example:**
```typescript
import { fileToBase64 } from '../utils/image';

// Convert a file to base64
async function example() {
  // Assuming you have a file from an input element
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput?.files?.[0]) {
    try {
      const base64 = await fileToBase64(fileInput.files[0]);
      console.log('Base64 result:', base64.substring(0, 50) + '...');
      // Use the base64 string for further processing
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
  }
}
```

### base64ToBlob(base64, mimeType)

Converts a base64 encoded string to a Blob.

**Parameters:**
- `base64` (string): The base64 string to convert
- `mimeType` (string, optional): The MIME type of the blob (default: 'image/png')

**Returns:**
- `Blob`: The converted Blob

**Example:**
```typescript
import { base64ToBlob } from '../utils/image';

// Convert base64 to a blob
function example() {
  const base64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...';
  const blob = base64ToBlob(base64, 'image/png');
  
  // Use the blob, for example to create an object URL
  const objectUrl = URL.createObjectURL(blob);
  const img = document.createElement('img');
  img.src = objectUrl;
  document.body.appendChild(img);
  
  // Don't forget to revoke the URL when done
  setTimeout(() => URL.revokeObjectURL(objectUrl), 5000);
}
```

### resizeImage(file, maxWidth, maxHeight, format, quality)

Resizes an image file to specified dimensions while maintaining aspect ratio.

**Parameters:**
- `file` (File|Blob): The image file to resize
- `maxWidth` (number): The maximum width of the resized image
- `maxHeight` (number): The maximum height of the resized image
- `format` (string, optional): The image format to output (default: 'image/jpeg')
- `quality` (number, optional): The quality of the output image for lossy formats (0-1, default: 0.8)

**Returns:**
- `Promise<Blob>`: The resized image as a Blob

**Example:**
```typescript
import { resizeImage } from '../utils/image';

// Resize an image to a maximum width and height
async function example() {
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput?.files?.[0]) {
    try {
      // Resize to maximum dimensions of 800x600 as JPEG with 90% quality
      const resizedImage = await resizeImage(
        fileInput.files[0], 
        800, 
        600, 
        'image/jpeg', 
        0.9
      );
      
      console.log('Resized image size:', resizedImage.size, 'bytes');
      
      // Create a preview
      const previewUrl = URL.createObjectURL(resizedImage);
      const img = document.createElement('img');
      img.src = previewUrl;
      document.body.appendChild(img);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(previewUrl), 5000);
    } catch (error) {
      console.error('Error resizing image:', error);
    }
  }
}
```

### getImageDimensions(file)

Gets the width and height of an image file.

**Parameters:**
- `file` (File|Blob): The image file

**Returns:**
- `Promise<{width: number, height: number}>`: The dimensions of the image

**Example:**
```typescript
import { getImageDimensions } from '../utils/image';

// Get the dimensions of an image file
async function example() {
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput?.files?.[0]) {
    try {
      const dimensions = await getImageDimensions(fileInput.files[0]);
      console.log(`Image dimensions: ${dimensions.width}x${dimensions.height}`);
    } catch (error) {
      console.error('Error getting image dimensions:', error);
    }
  }
}
```

### isValidImage(file)

Checks if a file is a valid image by examining its MIME type.

**Parameters:**
- `file` (File): The file to check

**Returns:**
- `boolean`: Whether the file is a valid image

**Example:**
```typescript
import { isValidImage } from '../utils/image';

// Check if a file is a valid image
function example() {
  const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
  if (fileInput?.files?.[0]) {
    const isValid = isValidImage(fileInput.files[0]);
    if (isValid) {
      console.log('File is a valid image');
    } else {
      console.log('File is not a valid image');
    }
  }
}
```

### formatFileSize(bytes, decimals)

Formats a number of bytes to a human-readable string.

**Parameters:**
- `bytes` (number): The number of bytes
- `decimals` (number, optional): The number of decimal places to show (default: 2)

**Returns:**
- `string`: Formatted string (e.g., "1.5 MB")

**Example:**
```typescript
import { formatFileSize } from '../utils/image';

// Format file sizes
function example() {
  console.log(formatFileSize(1024)); // "1 KB"
  console.log(formatFileSize(1536, 1)); // "1.5 KB"
  console.log(formatFileSize(1048576)); // "1 MB"
  console.log(formatFileSize(1073741824)); // "1 GB"
}
```

## Integration with Components

These utility functions can be used in various components in the application:

- Image upload components
- Ad creation forms that require image processing
- Preview components that need to resize images
- Profile picture editors
- Gallery components

## Error Handling

All async functions include proper error handling with meaningful error messages. Make sure to use try/catch blocks when calling these functions to handle potential errors gracefully. 