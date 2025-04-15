import { useState, useCallback } from 'react';
import { validateImageSecurity, fileToBase64, resizeImage } from '../utils/image';
import { validateImage } from '../utils/imageSecurityUtils';

interface ImageUploadOptions {
  resize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  format?: string;
  quality?: number;
}

interface ImageUploadState {
  imageUrl: string | null;
  file: File | null;
  error: string | null;
  loading: boolean;
}

/**
 * Custom hook for secure image upload with validation
 * 
 * This hook handles:
 * - Image security validation
 * - File to base64 conversion
 * - Optional image resizing
 * - Error handling
 */
function useImageUpload() {
  const [state, setState] = useState<ImageUploadState>({
    imageUrl: null,
    file: null,
    error: null,
    loading: false
  });

  /**
   * Upload and process an image with security validation
   */
  const uploadImage = useCallback(async (file: File, options?: ImageUploadOptions) => {
    if (!file) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // First security check with comprehensive validation
      const securityResult = await validateImage(file);
      
      if (!securityResult.isValid) {
        const errorMessage = `File validation failed: ${securityResult.issues?.[0] || securityResult.message || 'Unknown error'}`;
        setState(prev => ({ ...prev, error: errorMessage, loading: false }));
        return;
      }
      
      // Second check with basic security validation
      const validationResult = await validateImageSecurity(file);
      if (!validationResult.valid) {
        setState(prev => ({ ...prev, error: validationResult.reason || 'Invalid image', loading: false }));
        return;
      }
      
      let processedFile = file;
      
      // Resize the image if requested
      if (options?.resize) {
        const resizedImage = await resizeImage(
          file, 
          options.maxWidth || 1200, 
          options.maxHeight || 1200,
          options.format || file.type,
          options.quality || 0.8
        );
        processedFile = new File([resizedImage], file.name, { type: file.type });
      }
      
      // Convert to base64 for display or storage
      const base64 = await fileToBase64(processedFile);
      
      setState({
        imageUrl: base64,
        file: processedFile,
        error: null,
        loading: false
      });
      
      return base64;
    } catch (error) {
      const errorMessage = `Error processing image: ${error instanceof Error ? error.message : String(error)}`;
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false 
      }));
    }
  }, []);

  /**
   * Reset the image upload state
   */
  const resetImage = useCallback(() => {
    setState({
      imageUrl: null,
      file: null,
      error: null,
      loading: false
    });
  }, []);

  return {
    ...state,
    uploadImage,
    resetImage
  };
}

export default useImageUpload; 