import { AdStyle, AdFormat } from '../types/adTypes';

export interface AdTemplateSettings {
  adStyle: AdStyle;
  adFormat: AdFormat;
  primaryColor: string;
  fontFamily?: string;
  titleSuggestions?: string[];
  descriptionSuggestions?: string[];
  descriptionTips?: string[];
  callToAction?: string;
  callToActionOptions?: string[];
  tags?: string[];
  aiPrompt?: string;
}

export interface AdTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  previewImage?: string;
  category: 'promotion' | 'awareness' | 'conversion' | 'engagement' | 'other';
  isPremium: boolean;
  settings?: AdTemplateSettings;
  tags: string[];
}

// Sample templates
export const templates: AdTemplate[] = [
  {
    id: 'template-1',
    name: 'Modern Business',
    description: 'A clean, professional template ideal for business services',
    thumbnail: '/templates/modern-business.jpg',
    previewImage: '/templates/modern-business.jpg',
    category: 'awareness',
    isPremium: false,
    tags: ['business', 'professional', 'services', 'consulting'],
    settings: {
      adStyle: 'modern',
      adFormat: 'single-image',
      primaryColor: '#2563EB',
      titleSuggestions: [
        'Elevate Your Business Strategy',
        'Professional Solutions for Growth',
        'Transform Your Business Today'
      ],
      descriptionSuggestions: [
        'Our expert consultants help you navigate challenges and seize opportunities for sustainable growth.',
        'Proven strategies tailored to your industry needs with measurable results.',
        'Join hundreds of successful businesses who have partnered with us to achieve their goals.'
      ],
      callToAction: 'Learn More',
    }
  },
  {
    id: 'template-2',
    name: 'Bold Product Launch',
    description: 'High-impact template for new product announcements',
    thumbnail: '/templates/bold-product.jpg',
    previewImage: '/templates/bold-product.jpg',
    category: 'awareness',
    isPremium: false,
    tags: ['product', 'launch', 'new', 'innovative'],
    settings: {
      adStyle: 'bold',
      adFormat: 'single-image',
      primaryColor: '#DC2626',
      titleSuggestions: [
        'Introducing Our Revolutionary Product',
        'The Wait Is Over: Discover the New [Product]',
        'Change the Way You [Activity] Forever'
      ],
      descriptionSuggestions: [
        'Engineered for performance, designed for convenience. See why customers can\'t stop talking about it.',
        'The future of [industry] is here. Be among the first to experience the difference.',
        'Combining cutting-edge technology with sleek design. Limited quantities available.'
      ],
      callToAction: 'Shop Now',
    }
  },
  {
    id: 'template-3',
    name: 'Elegant Lifestyle',
    description: 'Sophisticated template for luxury and lifestyle brands',
    thumbnail: '/templates/elegant-lifestyle.jpg',
    previewImage: '/templates/elegant-lifestyle.jpg',
    category: 'engagement',
    isPremium: true,
    tags: ['luxury', 'lifestyle', 'premium', 'exclusive'],
    settings: {
      adStyle: 'elegant',
      adFormat: 'carousel',
      primaryColor: '#8B5CF6',
      titleSuggestions: [
        'Elevate Your Everyday Experience',
        'Discover Curated Luxury For You',
        'The Art of Refined Living'
      ],
      descriptionSuggestions: [
        'Thoughtfully designed products that blend seamlessly into your sophisticated lifestyle.',
        'Exclusive collections crafted for those who appreciate the finer details.',
        'Experience luxury reimagined for modern living.'
      ],
      callToAction: 'Discover More',
    }
  },
  {
    id: 'template-4',
    name: 'Vibrant Promotion',
    description: 'Eye-catching template for sales and special offers',
    thumbnail: '/templates/vibrant-promotion.jpg',
    previewImage: '/templates/vibrant-promotion.jpg',
    category: 'promotion',
    isPremium: false,
    tags: ['sale', 'promotion', 'discount', 'limited-time'],
    settings: {
      adStyle: 'vibrant',
      adFormat: 'single-image',
      primaryColor: '#F59E0B',
      titleSuggestions: [
        'Limited Time Offer: Save 40% Today!',
        'Flash Sale: Don\'t Miss These Deals!',
        'Exclusive Weekend Promotion'
      ],
      descriptionSuggestions: [
        'Our biggest sale of the season. Use code FLASH40 at checkout for extra savings!',
        'Limited quantities available. Shop now before your favorites sell out!',
        'Members get early access! Sign up now to unlock special offers.'
      ],
      callToAction: 'Shop Sale',
    }
  },
  {
    id: 'template-5',
    name: 'Trustworthy Service',
    description: 'Reliable template for service-based businesses',
    thumbnail: '/templates/trustworthy-service.jpg',
    previewImage: '/templates/trustworthy-service.jpg',
    category: 'conversion',
    isPremium: false,
    tags: ['service', 'reliable', 'professional', 'local'],
    settings: {
      adStyle: 'trustworthy',
      adFormat: 'video',
      primaryColor: '#10B981',
      titleSuggestions: [
        'Service You Can Count On',
        'Trusted by Thousands of Customers',
        'Professional [Service] with Guaranteed Results'
      ],
      descriptionSuggestions: [
        '5-star rated service with over 1,000 satisfied customers in [location].',
        'Our certified professionals deliver exceptional results, backed by our satisfaction guarantee.',
        'Fast, reliable, and professional. See why customers choose us year after year.'
      ],
      callToAction: 'Book Now',
    }
  },
  {
    id: 'template-6',
    name: 'Playful Collection',
    description: 'Fun and engaging template for product collections',
    thumbnail: '/templates/playful-collection.jpg',
    previewImage: '/templates/playful-collection.jpg',
    category: 'engagement',
    isPremium: true,
    tags: ['collection', 'fun', 'colorful', 'creative'],
    settings: {
      adStyle: 'playful',
      adFormat: 'collection',
      primaryColor: '#EC4899',
      titleSuggestions: [
        'Discover Our Colorful Collection',
        'Fun Products for Every Occasion',
        'Express Yourself with Our New Line'
      ],
      descriptionSuggestions: [
        'Brighten your day with our vibrant collection designed to bring joy to everyday moments.',
        'Playfully designed, seriously functional. Find your favorite in our new collection.',
        'Limited edition items that celebrate creativity and self-expression.'
      ],
      callToAction: 'Explore Collection',
    }
  }
];

// Get a template by ID
export const getTemplateById = (id: string): AdTemplate | undefined => {
  return templates.find(template => template.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): AdTemplate[] => {
  return templates.filter(template => template.category === category);
};

// Filter templates by premium status
export const getTemplatesByPremium = (isPremium: boolean): AdTemplate[] => {
  return templates.filter(template => template.isPremium === isPremium);
};

// Search templates by name or description
export const searchTemplates = (query: string): AdTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return templates.filter(
    template => 
      template.name.toLowerCase().includes(lowercaseQuery) || 
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export default templates; 