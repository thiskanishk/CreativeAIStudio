/**
 * Ad Types for the Facebook Ad Creator application
 */

// Ad styles
export type AdStyle = 
  'professional' |   // Clean, corporate look
  'vibrant' |        // Bold, colorful style
  'minimalist' |     // Simple, elegant design with whitespace
  'retro' |          // Vintage look
  'futuristic' |     // Modern, tech-inspired
  'premium' |        // Luxury, high-end aesthetic
  'playful' |        // Fun, energetic style
  'modern' |         // Contemporary design
  'urgent' |         // Attention-grabbing, promotional
  'seasonal' |       // Holiday or season-specific
  'comparison';      // For before/after, comparison layouts

// Ad formats supported by Facebook
export type AdFormat = 
  'square' |         // 1:1 (1080 x 1080px)
  'portrait' |       // 4:5 (1080 x 1350px)
  'landscape' |      // 16:9 (1920 x 1080px)
  'story';           // 9:16 (1080 x 1920px)

// Ad data interface
export interface AdData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  callToAction: string;
  adType: 'image' | 'video';
  adStyle: AdStyle;
  adFormat: AdFormat;
  primaryColor: string;
  status: 'draft' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  updatedAt: string;
  metrics?: AdMetrics;
}

// Ad creation input interface
export interface AdCreationInput {
  title: string;
  description: string;
  callToAction: string;
  adStyle: AdStyle;
  adFormat: AdFormat;
  primaryColor: string;
  isVideo: boolean;
  templateId?: string; // Reference to a template if used
  customPrompt?: string; // Additional instructions for AI
}

// Ad metrics interface
export interface AdMetrics {
  impressions?: number;
  clicks?: number;
  ctr?: number;
  conversions?: number;
  costPerClick?: number;
  reach?: number;
  engagement?: number;
  shareCount?: number;
  savedCount?: number;
}

// Template variable for placeholder text
export interface TemplateVariables {
  [key: string]: string;
}

// Function to replace template variables in text
export const applyTemplateVariables = (
  text: string, 
  variables: TemplateVariables
): string => {
  let result = text;
  
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  });
  
  return result;
}; 