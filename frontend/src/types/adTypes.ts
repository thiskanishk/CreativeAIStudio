export type AdStyle = 'minimal' | 'bold' | 'elegant' | 'vibrant' | 'trustworthy' | 'modern' | 'professional' | 'playful';

export type AdFormat = 'single-image' | 'carousel' | 'video' | 'collection' | 'slideshow';

export interface AdCreationInput {
  title: string;
  description: string;
  callToAction: string;
  adFormat: AdFormat;
  adStyle: AdStyle;
  targetUrl: string;
  brandName?: string;
  primaryColor?: string;
  image?: File;
  images?: File[];
  video?: File;
  templateId?: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  callToAction: string;
  adFormat: AdFormat;
  adStyle: AdStyle;
  targetUrl: string;
  brandName?: string;
  primaryColor?: string;
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'pending' | 'active' | 'paused' | 'rejected';
  performance?: AdPerformance;
  templateId?: string;
}

export interface AdPerformance {
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  cpc: number;
  costPerConversion: number;
  roi: number;
}

export interface AdFilter {
  status?: string;
  adFormat?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  searchTerm?: string;
}

export enum ProcessingState {
  Initial = 'initial',
  UploadingImage = 'uploading_image',
  GeneratingAd = 'generating_ad',
  Completed = 'completed',
  Error = 'error'
} 