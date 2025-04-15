/**
 * Integration tests for image utilities
 * 
 * These tests validate how image utilities work with React components
 * and handle image-related operations in the context of the application.
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockFiles, sampleBase64Images } from './fixtures/imageFixtures';
import * as imageUtils from '../image';
import * as imageSecurityUtils from '../imageSecurityUtils';

// Mock image security utils
jest.mock('../imageSecurityUtils', () => {
  const originalModule = jest.requireActual('../imageSecurityUtils');
  return {
    ...originalModule,
    validateImage: jest.fn().mockImplementation(async (file) => {
      if (file.size > imageUtils.MAX_IMAGE_SIZE) {
        return { 
          isValid: false, 
          message: 'File validation failed',
          issues: ['File size exceeds maximum allowed'] 
        };
      }
      if (!imageUtils.VALID_IMAGE_TYPES.includes(file.type)) {
        return { 
          isValid: false, 
          message: 'File validation failed',
          issues: ['Invalid file type'] 
        };
      }
      return { isValid: true, message: 'File is valid' };
    }),
    detectMaliciousSvg: jest.fn().mockImplementation((content) => {
      return content.includes('script') || content.includes('onload');
    }),
  };
});

// Simple image upload component for testing
function ImageUploader({ onUpload }: { onUpload: (file: File, securityResult: any) => void }) {
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate the file security
      const securityResult = await imageSecurityUtils.validateImage(file);
      
      // Process the image if valid
      if (securityResult.isValid) {
        try {
          // Basic security validation
          const validationResult = await imageUtils.validateImageSecurity(file);
          if (!validationResult.valid) {
            console.error(validationResult.reason);
            return;
          }
          
          onUpload(file, securityResult);
        } catch (error) {
          console.error('Error processing image:', error);
        }
      } else {
        console.error('Image security validation failed:', securityResult.issues);
      }
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        data-testid="file-upload" 
      />
      <p data-testid="upload-instructions">Upload an image</p>
    </div>
  );
}

// Image preview component for testing
function ImagePreview({ file }: { file: File | null }) {
  const [preview, setPreview] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    
    const loadPreview = async () => {
      try {
        // Convert file to base64
        const base64 = await imageUtils.fileToBase64(file);
        setPreview(base64);
      } catch (error) {
        console.error('Error creating preview:', error);
      }
    };
    
    loadPreview();
  }, [file]);
  
  if (!preview) {
    return <p data-testid="no-preview">No image to preview</p>;
  }
  
  return (
    <div>
      <p data-testid="has-preview">Image Preview</p>
      <img 
        src={preview} 
        alt="Preview" 
        style={{ maxWidth: '100%', maxHeight: '300px' }} 
        data-testid="preview-image"
      />
    </div>
  );
}

describe('Image Utilities Integration Tests', () => {
  // Test image upload with valid image
  test('successfully uploads and processes a valid image', async () => {
    const handleUpload = jest.fn();
    
    render(
      <ImageUploader onUpload={handleUpload} />
    );
    
    // Simulate file upload
    const input = screen.getByTestId('file-upload');
    fireEvent.change(input, { target: { files: [mockFiles.validPng] } });
    
    // Verify handleUpload was called with the file
    await waitFor(() => {
      expect(handleUpload).toHaveBeenCalledWith(
        mockFiles.validPng, 
        expect.objectContaining({ isValid: true })
      );
    });
    
    // Verify security validation was called
    expect(imageSecurityUtils.validateImage).toHaveBeenCalledWith(mockFiles.validPng);
  });
  
  // Test image upload with invalid file type
  test('rejects upload of invalid file type', async () => {
    const handleUpload = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ImageUploader onUpload={handleUpload} />
    );
    
    // Simulate file upload with invalid type
    const input = screen.getByTestId('file-upload');
    fireEvent.change(input, { target: { files: [mockFiles.invalidType] } });
    
    // Verify handleUpload was not called
    await waitFor(() => {
      expect(handleUpload).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Image security validation failed:',
        ['Invalid file type']
      );
    });
    
    consoleSpy.mockRestore();
  });
  
  // Test image upload with file too large
  test('rejects upload of file that is too large', async () => {
    const handleUpload = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(
      <ImageUploader onUpload={handleUpload} />
    );
    
    // Simulate file upload with large file
    const input = screen.getByTestId('file-upload');
    fireEvent.change(input, { target: { files: [mockFiles.tooLarge] } });
    
    // Verify handleUpload was not called
    await waitFor(() => {
      expect(handleUpload).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Image security validation failed:',
        ['File size exceeds maximum allowed']
      );
    });
    
    consoleSpy.mockRestore();
  });
  
  // Test image preview component
  test('displays image preview for valid image', async () => {
    render(<ImagePreview file={mockFiles.validPng} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('has-preview')).toBeInTheDocument();
      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });
  });
  
  // Test full upload and preview flow
  test('full flow: upload, validate, and preview image', async () => {
    const TestComponent = () => {
      const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
      
      const handleUpload = (file: File, securityResult: any) => {
        if (securityResult.isValid) {
          setUploadedFile(file);
        }
      };
      
      return (
        <div>
          <ImageUploader onUpload={handleUpload} />
          <ImagePreview file={uploadedFile} />
        </div>
      );
    };
    
    render(<TestComponent />);
    
    // Initial state - no preview
    expect(screen.getByTestId('no-preview')).toBeInTheDocument();
    
    // Simulate file upload
    const input = screen.getByTestId('file-upload');
    fireEvent.change(input, { target: { files: [mockFiles.validPng] } });
    
    // Check that preview is displayed
    await waitFor(() => {
      expect(screen.getByTestId('has-preview')).toBeInTheDocument();
      expect(screen.getByTestId('preview-image')).toBeInTheDocument();
    });
  });
}); 