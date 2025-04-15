import api from './axios';

export interface AdCopy {
  title: string;
  description: string;
  callToAction: string;
}

export interface AdCopyInput {
  productName: string;
  productDescription: string;
  tone?: string;
  maxLength?: number;
}

export interface ImageAdInput {
  imageUrls: string[];
  adText: {
    title: string;
    description: string;
    callToAction?: string;
  };
  style: string;
  logo?: {
    url: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  brandColor?: string;
  resolution?: 'sd' | 'hd' | 'fullhd';
}

export interface VideoAdInput {
  imageUrls: string[];
  adText: {
    title: string;
    description: string;
    callToAction?: string;
  };
  style: string;
  logo?: {
    url: string;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  brandColor?: string;
  videoOptions: {
    hasMusic?: boolean;
    musicTrack?: string;
    hasVoiceover?: boolean;
    voiceGender?: 'male' | 'female';
    voiceStyle?: 'friendly' | 'professional' | 'energetic';
  };
  resolution?: 'sd' | 'hd' | 'fullhd';
}

export interface GenerationResponse {
  jobId: string;
  assetId?: string;
  status: 'processing' | 'completed' | 'failed';
  estimatedTime?: number; // in seconds
}

/**
 * Service for handling AI generation operations
 */
const GenerationService = {
  /**
   * Generate ad copy suggestions based on product information
   * @param input - Ad copy generation input
   * @returns Generated ad copy suggestions
   */
  async generateAdCopy(input: AdCopyInput): Promise<AdCopy> {
    const response = await api.post<{ success: boolean; adCopy: AdCopy }>(
      '/generate/ad-copy',
      input
    );
    return response.data.adCopy;
  },

  /**
   * Generate multiple ad copy variations
   * @param input - Ad copy generation input
   * @param count - Number of variations to generate
   * @returns Array of generated ad copy suggestions
   */
  async generateAdCopyVariations(
    input: AdCopyInput,
    count: number = 3
  ): Promise<AdCopy[]> {
    const response = await api.post<{ success: boolean; variations: AdCopy[] }>(
      '/generate/ad-copy-variations',
      { ...input, count }
    );
    return response.data.variations;
  },

  /**
   * Generate an image ad
   * @param input - Image ad generation input
   * @returns Generation job information
   */
  async generateImageAd(input: ImageAdInput): Promise<GenerationResponse> {
    const response = await api.post<GenerationResponse>(
      '/generate/image',
      input
    );
    return response.data;
  },

  /**
   * Generate a video ad
   * @param input - Video ad generation input
   * @returns Generation job information
   */
  async generateVideoAd(input: VideoAdInput): Promise<GenerationResponse> {
    const response = await api.post<GenerationResponse>(
      '/generate/video',
      input
    );
    return response.data;
  },

  /**
   * Check the status of a generation job
   * @param jobId - Job ID
   * @returns Job status information
   */
  async checkJobStatus(jobId: string): Promise<{
    jobId: string;
    status: 'processing' | 'completed' | 'failed';
    progress?: number;
    result?: any;
    error?: string;
  }> {
    const response = await api.get(`/generate/status/${jobId}`);
    return response.data;
  },

  /**
   * Get available style presets
   * @returns List of available style presets
   */
  async getStylePresets(): Promise<
    Array<{
      id: string;
      name: string;
      description: string;
      thumbnail: string;
      category: string;
    }>
  > {
    const response = await api.get('/generate/styles');
    return response.data;
  }
};

export default GenerationService; 