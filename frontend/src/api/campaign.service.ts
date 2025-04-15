import api from './axios';

export interface Campaign {
  _id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  tags?: string[];
  status: 'draft' | 'active' | 'completed' | 'archived';
  lastEdited: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  title: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface UpdateCampaignInput {
  title?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

/**
 * Service for handling campaign operations
 */
const CampaignService = {
  /**
   * Get all campaigns for the current user
   * @returns List of campaigns
   */
  async getCampaigns(): Promise<Campaign[]> {
    const response = await api.get<Campaign[]>('/campaigns');
    return response.data;
  },

  /**
   * Get campaign by ID
   * @param id - Campaign ID
   * @returns Campaign
   */
  async getCampaign(id: string): Promise<Campaign> {
    const response = await api.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  },

  /**
   * Create a new campaign
   * @param data - Campaign data
   * @returns Created campaign
   */
  async createCampaign(data: CreateCampaignInput): Promise<Campaign> {
    const response = await api.post<Campaign>('/campaigns', data);
    return response.data;
  },

  /**
   * Update a campaign
   * @param id - Campaign ID
   * @param data - Updated campaign data
   * @returns Updated campaign
   */
  async updateCampaign(id: string, data: UpdateCampaignInput): Promise<Campaign> {
    const response = await api.put<Campaign>(`/campaigns/${id}`, data);
    return response.data;
  },

  /**
   * Delete a campaign
   * @param id - Campaign ID
   * @returns Success message
   */
  async deleteCampaign(id: string) {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },

  /**
   * Search campaigns by query
   * @param query - Search query
   * @returns List of matching campaigns
   */
  async searchCampaigns(query: string): Promise<Campaign[]> {
    const response = await api.get<Campaign[]>(`/campaigns/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Get public campaigns
   * @returns List of public campaigns
   */
  async getPublicCampaigns(): Promise<Campaign[]> {
    const response = await api.get<Campaign[]>('/campaigns/public');
    return response.data;
  }
};

export default CampaignService; 