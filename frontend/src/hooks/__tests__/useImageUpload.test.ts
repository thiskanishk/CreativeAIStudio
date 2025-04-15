/**
 * Tests for useImageUpload hook
 */
import { renderHook, act } from '@testing-library/react';
import { mockFiles } from '../../utils/__tests__/fixtures/imageFixtures';
import useImageUpload from '../useImageUpload';
import * as imageUtils from '../../utils/image';
import * as imageSecurityUtils from '../../utils/imageSecurityUtils';

// Mock the image utilities
jest.mock('../../utils/image', () => ({
  ...jest.requireActual('../../utils/image'),
  validateImageSecurity: jest.fn().mockResolvedValue({ valid: true }),
  fileToBase64: jest.fn().mockResolvedValue('data:image/png;base64,mockBase64'),
  resizeImage: jest.fn().mockImplementation(() => Promise.resolve(new Blob())),
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,
  VALID_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}));

jest.mock('../../utils/imageSecurityUtils', () => ({
  ...jest.requireActual('../../utils/imageSecurityUtils'),
  validateImage: jest.fn().mockResolvedValue({ isValid: true, message: 'File is valid' }),
  verifyFileSignature: jest.fn().mockResolvedValue(true),
  detectMaliciousSvg: jest.fn().mockReturnValue(false),
}));

describe('useImageUpload Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle valid image upload', async () => {
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.validPng);
    });
    
    expect(imageSecurityUtils.validateImage).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.validateImageSecurity).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.fileToBase64).toHaveBeenCalled();
    expect(result.current.imageUrl).toBe('data:image/png;base64,mockBase64');
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
  
  test('should handle validation failure', async () => {
    // Mock security validation to fail
    (imageSecurityUtils.validateImage as jest.Mock).mockResolvedValueOnce({
      isValid: false,
      message: 'File validation failed',
      issues: ['File size exceeds maximum allowed']
    });
    
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.tooLarge);
    });
    
    expect(imageSecurityUtils.validateImage).toHaveBeenCalledWith(mockFiles.tooLarge);
    expect(imageUtils.validateImageSecurity).not.toHaveBeenCalled();
    expect(imageUtils.fileToBase64).not.toHaveBeenCalled();
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.error).toBe('File validation failed: File size exceeds maximum allowed');
    expect(result.current.loading).toBe(false);
  });
  
  test('should handle basic security validation failure', async () => {
    // Mock security validation to pass in first phase but fail in second
    (imageSecurityUtils.validateImage as jest.Mock).mockResolvedValueOnce({
      isValid: true,
      message: 'File is valid'
    });
    
    (imageUtils.validateImageSecurity as jest.Mock).mockResolvedValueOnce({
      valid: false,
      reason: 'Image dimensions are too large'
    });
    
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.validPng);
    });
    
    expect(imageSecurityUtils.validateImage).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.validateImageSecurity).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.fileToBase64).not.toHaveBeenCalled();
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.error).toBe('Image dimensions are too large');
    expect(result.current.loading).toBe(false);
  });
  
  test('should handle error during file processing', async () => {
    // Simulate error during file conversion
    (imageUtils.fileToBase64 as jest.Mock).mockRejectedValueOnce(new Error('Conversion error'));
    
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.validPng);
    });
    
    expect(imageSecurityUtils.validateImage).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.validateImageSecurity).toHaveBeenCalledWith(mockFiles.validPng);
    expect(imageUtils.fileToBase64).toHaveBeenCalled();
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.error).toBe('Error processing image: Conversion error');
    expect(result.current.loading).toBe(false);
  });
  
  test('should resize the image if requested', async () => {
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.validPng, { resize: true, maxWidth: 800, maxHeight: 600 });
    });
    
    expect(imageUtils.resizeImage).toHaveBeenCalledWith(
      mockFiles.validPng,
      800,
      600,
      'image/png',
      0.8
    );
  });
  
  test('should clear image data when reset is called', async () => {
    const { result } = renderHook(() => useImageUpload());
    
    await act(async () => {
      await result.current.uploadImage(mockFiles.validPng);
    });
    
    expect(result.current.imageUrl).toBe('data:image/png;base64,mockBase64');
    
    act(() => {
      result.current.resetImage();
    });
    
    expect(result.current.imageUrl).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
}); 