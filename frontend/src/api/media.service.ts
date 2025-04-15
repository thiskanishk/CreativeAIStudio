import api from './axios';

export interface UploadedFile {
  fileUrl: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Service for handling media operations
 */
const MediaService = {
  /**
   * Upload a single image file
   * @param file - Image file to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Uploaded file information
   */
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadedFile>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Upload multiple image files
   * @param files - Array of image files to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Array of uploaded file information
   */
  async uploadMultipleImages(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<UploadedFile[]> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    const response = await api.post<UploadedFile[]>('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Upload a logo image
   * @param file - Logo file to upload
   * @param onProgress - Optional callback for upload progress
   * @returns Uploaded file information
   */
  async uploadLogo(file: File, onProgress?: (progress: number) => void): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await api.post<UploadedFile>('/media/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },

  /**
   * Enhance an image
   * @param imageUrl - URL of the image to enhance
   * @returns Enhanced image information
   */
  async enhanceImage(imageUrl: string): Promise<{ enhancedUrl: string; publicId: string }> {
    const response = await api.post<{ enhancedUrl: string; publicId: string }>(
      '/media/enhance',
      { imageUrl }
    );
    return response.data;
  },

  /**
   * Download a media file
   * @param assetId - Asset ID
   * @returns Download URL
   */
  getDownloadUrl(assetId: string): string {
    return `${api.defaults.baseURL}/media/download/${assetId}`;
  }
};

export default MediaService; 