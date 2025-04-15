import axios from '../axios';

export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  callToAction: string;
  adType: 'image' | 'video';
  adStyle: string;
  adFormat: string;
  primaryColor: string;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface AdCreationInput {
  title: string;
  description: string;
  callToAction: string;
  adStyle: string;
  adFormat: string;
  primaryColor: string;
  isVideo: boolean;
  templateId?: string;
}

class AdService {
  /**
   * Get all ads
   */
  async getAds(): Promise<AdData[]> {
    try {
      const response = await axios.get('/api/ads');
      return response.data;
    } catch (error) {
      console.error('Error fetching ads:', error);
      throw error;
    }
  }

  /**
   * Get a single ad by ID
   */
  async getAd(id: string): Promise<AdData> {
    try {
      const response = await axios.get(`/api/ads/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching ad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new ad
   */
  async createAd(data: AdCreationInput, mediaFile: File): Promise<AdData> {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Append the media file
      formData.append('media', mediaFile);
      
      // Append the JSON data
      formData.append('data', JSON.stringify(data));
      
      const response = await axios.post('/api/ads', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating ad:', error);
      throw error;
    }
  }

  /**
   * Update an existing ad
   */
  async updateAd(id: string, data: Partial<AdCreationInput>, mediaFile?: File): Promise<AdData> {
    try {
      // Create FormData for file upload if there's a media file
      const formData = new FormData();
      
      // Append the media file if provided
      if (mediaFile) {
        formData.append('media', mediaFile);
      }
      
      // Append the JSON data
      formData.append('data', JSON.stringify(data));
      
      const response = await axios.put(`/api/ads/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error updating ad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete an ad
   */
  async deleteAd(id: string): Promise<void> {
    try {
      await axios.delete(`/api/ads/${id}`);
    } catch (error) {
      console.error(`Error deleting ad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Generate ad variations
   */
  async generateVariations(id: string, count: number = 3): Promise<AdData[]> {
    try {
      const response = await axios.post(`/api/ads/${id}/variations`, { count });
      return response.data;
    } catch (error) {
      console.error(`Error generating variations for ad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Download ad media
   */
  async downloadAd(id: string): Promise<Blob> {
    try {
      const response = await axios.get(`/api/ads/${id}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error(`Error downloading ad ${id}:`, error);
      throw error;
    }
  }

  /**
   * Share ad (generates a public sharing link)
   */
  async shareAd(id: string): Promise<{ shareUrl: string }> {
    try {
      const response = await axios.post(`/api/ads/${id}/share`);
      return response.data;
    } catch (error) {
      console.error(`Error sharing ad ${id}:`, error);
      throw error;
    }
  }
}

export default new AdService(); 