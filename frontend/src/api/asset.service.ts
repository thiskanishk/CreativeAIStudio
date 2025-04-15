import api from './axios';

export interface Asset {
  _id: string;
  campaignId: string;
  type: 'image' | 'video';
  title?: string;
  fileUrl: string;
  thumbnailUrl?: string;
  publicId?: string;
  originalImageUrls?: string[];
  status: 'processing' | 'completed' | 'failed';
  isPublic: boolean;
  resolution: 'sd' | 'hd' | 'fullhd';
  generationConfig: {
    adText?: {
      title?: string;
      description?: string;
      callToAction?: string;
    };
    style?: string;
    logo?: {
      url?: string;
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    brandColor?: string;
    videoOptions?: {
      hasMusic?: boolean;
      musicTrack?: string;
      hasVoiceover?: boolean;
      voiceGender?: string;
      voiceStyle?: string;
    };
  };
  errorMessage?: string;
  jobId?: string;
  shareableLink?: string;
  downloads: number;
  feedback?: {
    rating?: number;
    comment?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssetInput {
  campaignId: string;
  type: 'image' | 'video';
  title?: string;
  originalImageUrls: string[];
  generationConfig: {
    adText?: {
      title?: string;
      description?: string;
      callToAction?: string;
    };
    style?: string;
    logo?: {
      url?: string;
      position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    };
    brandColor?: string;
    videoOptions?: {
      hasMusic?: boolean;
      musicTrack?: string;
      hasVoiceover?: boolean;
      voiceGender?: string;
      voiceStyle?: string;
    };
  };
  resolution?: 'sd' | 'hd' | 'fullhd';
}

export interface UpdateAssetInput {
  title?: string;
  isPublic?: boolean;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
  progress?: number;
  result?: {
    fileUrl?: string;
    thumbnailUrl?: string;
  };
  error?: string;
}

/**
 * Service for handling asset operations
 */
const AssetService = {
  /**
   * Get all assets for a campaign
   * @param campaignId - Campaign ID
   * @returns List of assets
   */
  async getAssets(campaignId: string): Promise<Asset[]> {
    const response = await api.get<Asset[]>(`/campaigns/${campaignId}/assets`);
    return response.data;
  },

  /**
   * Get all assets for the current user
   * @returns List of assets
   */
  async getAllUserAssets(): Promise<Asset[]> {
    const response = await api.get<Asset[]>('/assets');
    return response.data;
  },

  /**
   * Get asset by ID
   * @param id - Asset ID
   * @returns Asset
   */
  async getAsset(id: string): Promise<Asset> {
    const response = await api.get<Asset>(`/assets/${id}`);
    return response.data;
  },

  /**
   * Create a new asset
   * @param data - Asset data
   * @returns Created asset
   */
  async createAsset(data: CreateAssetInput): Promise<Asset> {
    const response = await api.post<Asset>('/assets', data);
    return response.data;
  },

  /**
   * Update an asset
   * @param id - Asset ID
   * @param data - Updated asset data
   * @returns Updated asset
   */
  async updateAsset(id: string, data: UpdateAssetInput): Promise<Asset> {
    const response = await api.put<Asset>(`/assets/${id}`, data);
    return response.data;
  },

  /**
   * Delete an asset
   * @param id - Asset ID
   * @returns Success message
   */
  async deleteAsset(id: string) {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },

  /**
   * Check job status
   * @param jobId - Job ID
   * @returns Job status
   */
  async checkJobStatus(jobId: string): Promise<JobStatusResponse> {
    const response = await api.get<JobStatusResponse>(`/generate/status/${jobId}`);
    return response.data;
  },

  /**
   * Generate shareable link
   * @param id - Asset ID
   * @returns Updated asset with shareable link
   */
  async generateShareableLink(id: string): Promise<Asset> {
    const response = await api.post<Asset>(`/assets/${id}/share`);
    return response.data;
  },

  /**
   * Submit feedback for an asset
   * @param id - Asset ID
   * @param rating - Rating (1-5)
   * @param comment - Optional comment
   * @returns Updated asset
   */
  async submitFeedback(id: string, rating: number, comment?: string): Promise<Asset> {
    const response = await api.post<Asset>(`/assets/${id}/feedback`, {
      rating,
      comment
    });
    return response.data;
  },

  /**
   * Increment download count
   * @param id - Asset ID
   * @returns Updated asset
   */
  async trackDownload(id: string): Promise<Asset> {
    const response = await api.post<Asset>(`/assets/${id}/download`);
    return response.data;
  }
};

export default AssetService; 