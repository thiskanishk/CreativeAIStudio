# Database Schema

This document outlines the database schema for the Facebook Ad Creator application. We use MongoDB as our primary database.

## Collections

### Users

This collection stores user account information.

```javascript
{
  _id: ObjectId,
  email: String,                // Unique email for the user
  password: String,             // Hashed password
  firstName: String,
  lastName: String,
  profilePicture: String,       // URL to profile image
  company: String,              // Optional company name
  role: String,                 // "user", "admin"
  plan: String,                 // "free", "basic", "premium"
  credits: Number,              // Available credits for AI generations
  apiKey: String,               // API key for programmatic access
  googleId: String,             // For Google OAuth
  facebookId: String,           // For Facebook OAuth
  isVerified: Boolean,          // Email verification status
  verificationToken: String,    // Email verification token
  resetPasswordToken: String,   // Password reset token
  resetPasswordExpires: Date,   // Token expiration
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Campaigns

Represents marketing campaigns created by users.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to user
  name: String,                 // Campaign name
  description: String,          // Campaign description
  objective: String,            // Marketing objective
  target: {                     // Target audience
    age: {
      min: Number,
      max: Number
    },
    gender: String,
    location: [String],
    interests: [String],
    customAudience: String
  },
  budget: {
    amount: Number,
    currency: String,
    duration: String           // "daily", "lifetime"
  },
  status: String,               // "draft", "active", "paused", "completed"
  dateRange: {
    startDate: Date,
    endDate: Date
  },
  platform: [String],           // "facebook", "instagram"
  isPublic: Boolean,            // Whether campaign is visible to other users
  tags: [String],               // For categorization
  industry: String,             // Industry category
  createdAt: Date,
  updatedAt: Date
}
```

### Assets

Stores generated ad assets related to campaigns.

```javascript
{
  _id: ObjectId,
  campaignId: ObjectId,         // Reference to campaign
  userId: ObjectId,             // Reference to user
  name: String,                 // Asset name
  type: String,                 // "image", "video", "text"
  subtype: String,              // "carousel", "single", "story", etc.
  status: String,               // "draft", "ready", "published", "archived"
  content: {
    // For text assets
    headline: String,
    description: String,
    callToAction: String,
    
    // For image/video assets
    url: String,                // URL to stored file
    thumbnailUrl: String,       // URL to thumbnail
    aspectRatio: String,        // "1:1", "16:9", etc.
    width: Number,
    height: Number,
    format: String,             // "jpg", "mp4", etc.
    size: Number,               // File size in bytes
    duration: Number,           // For videos, in seconds
    
    // Metadata
    publicId: String,           // Cloudinary public ID
    prompt: String,             // Original generation prompt
    variations: [ObjectId]      // References to variations
  },
  generationParams: {           // Parameters used to generate the asset
    prompt: String,
    style: String,
    tone: String,
    colors: [String],
    model: String,              // AI model used
    seed: Number                // For reproducibility
  },
  metrics: {
    impressions: Number,
    clicks: Number,
    conversions: Number,
    ctr: Number,
    shareCount: Number,
    downloadCount: Number
  },
  feedback: {
    rating: Number,             // 1-5 star rating
    comments: String
  },
  shareableLink: String,        // Public sharing link
  jobId: String,                // Reference to generation job
  published: {
    date: Date,
    platform: String,
    postId: String              // ID on the social platform
  },
  createdAt: Date,
  updatedAt: Date
}
```

### GenerationJobs

Tracks the status of asynchronous generation jobs.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to user
  campaignId: ObjectId,         // Optional reference to campaign
  type: String,                 // "text", "image", "video", "enhancement"
  status: String,               // "queued", "processing", "completed", "failed"
  progress: Number,             // 0-100
  input: Object,                // Input parameters
  result: {
    assetId: ObjectId,          // Reference to created asset
    output: Object,             // Raw output from AI provider
    urls: [String]              // URLs to generated files
  },
  error: {
    message: String,
    code: String,
    details: Object
  },
  provider: String,             // "openai", "replicate", etc.
  model: String,                // Model name/version
  creditsCost: Number,          // Credits used for this job
  startTime: Date,
  endTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriptions

Stores user subscription information.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to user
  plan: String,                 // "basic", "premium"
  status: String,               // "active", "canceled", "expired"
  startDate: Date,
  endDate: Date,                // Renewal or expiration date
  renewalStatus: String,        // "auto", "manual", "none"
  paymentMethod: {
    type: String,               // "card", "paypal"
    last4: String,              // Last 4 digits for cards
    expiryMonth: Number,
    expiryYear: Number
  },
  billingCycle: String,         // "monthly", "annual"
  amount: Number,
  currency: String,
  paymentProvider: {
    name: String,               // "stripe", "paypal"
    customerId: String,         // ID in payment provider system
    subscriptionId: String      // Subscription ID in payment provider system
  },
  features: {                   // Features included in subscription
    maxCampaigns: Number,
    maxAssetsPerCampaign: Number,
    availableProviders: [String],
    priorityGeneration: Boolean,
    advancedAnalytics: Boolean
  },
  invoices: [{
    invoiceId: String,
    date: Date,
    amount: Number,
    paidStatus: Boolean,
    downloadUrl: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Transactions

Tracks credit purchases and usage.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to user
  type: String,                 // "purchase", "consumption", "refund", "gift"
  amount: Number,               // Credits amount (positive or negative)
  balance: Number,              // Credits balance after transaction
  description: String,          // Transaction details
  paymentDetails: {
    provider: String,           // "stripe", "paypal"
    transactionId: String,
    amount: Number,             // Monetary amount
    currency: String
  },
  relatedEntity: {              // Optional reference to related entity
    type: String,               // "asset", "job", "subscription"
    id: ObjectId
  },
  createdAt: Date
}
```

### StylePresets

Pre-defined style templates for generation.

```javascript
{
  _id: ObjectId,
  name: String,                 // Style name
  category: String,             // "minimalist", "corporate", "bold", etc.
  description: String,
  preview: {
    imageUrl: String,
    videoUrl: String
  },
  params: {
    prompt: String,
    negativePrompt: String,
    colors: [String],
    fonts: [String],
    layouts: [String],
    models: {
      image: String,
      video: String
    }
  },
  compatibleWith: [String],     // "image", "video"
  isPublic: Boolean,
  isDefault: Boolean,
  createdBy: ObjectId,          // Admin user who created it
  createdAt: Date,
  updatedAt: Date
}
```

### Templates

Pre-built ad templates.

```javascript
{
  _id: ObjectId,
  name: String,
  category: String,             // "product", "service", "event", etc.
  description: String,
  type: String,                 // "image", "video", "carousel"
  preview: {
    imageUrl: String,
    videoUrl: String
  },
  structure: {
    headline: String,           // Template with variables
    description: String,
    callToAction: String,
    layout: String,
    placeholders: [{
      type: String,             // "text", "image", "video"
      position: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      required: Boolean
    }]
  },
  variables: [{
    name: String,
    description: String,
    type: String,               // "text", "color", "image"
    defaultValue: String
  }],
  industry: [String],           // Relevant industries
  isPublic: Boolean,
  isDefault: Boolean,
  createdBy: ObjectId,          // Admin user who created it
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics

Aggregated analytics data.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to user
  entityType: String,           // "campaign", "asset", "user"
  entityId: ObjectId,           // ID of the entity
  period: String,               // "daily", "weekly", "monthly"
  date: Date,                   // Period start date
  metrics: {
    // Campaign/Asset performance
    impressions: Number,
    clicks: Number,
    ctr: Number,
    conversions: Number,
    costPerClick: Number,
    costPerConversion: Number,
    engagement: Number,
    
    // Generation metrics
    generationCount: Number,
    creditUsage: Number,
    averageGenerationTime: Number,
    successRate: Number,
    feedbackScore: Number
  },
  dimensions: {                 // Optional grouping dimensions
    platform: String,
    adType: String,
    region: String,
    device: String,
    audienceSegment: String
  },
  createdAt: Date
}
```

## Indexes

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ googleId: 1 }, { sparse: true })
db.users.createIndex({ facebookId: 1 }, { sparse: true })
db.users.createIndex({ apiKey: 1 }, { sparse: true, unique: true })

// Campaigns collection
db.campaigns.createIndex({ userId: 1 })
db.campaigns.createIndex({ isPublic: 1 })
db.campaigns.createIndex({ "tags": 1 })
db.campaigns.createIndex({ name: "text", description: "text" })

// Assets collection
db.assets.createIndex({ campaignId: 1 })
db.assets.createIndex({ userId: 1 })
db.assets.createIndex({ "content.publicId": 1 })
db.assets.createIndex({ shareableLink: 1 }, { sparse: true })
db.assets.createIndex({ jobId: 1 }, { sparse: true })
db.assets.createIndex({ name: "text", "content.headline": "text", "content.description": "text" })

// GenerationJobs collection
db.generationJobs.createIndex({ userId: 1 })
db.generationJobs.createIndex({ status: 1 })
db.generationJobs.createIndex({ campaignId: 1 })

// Transactions collection
db.transactions.createIndex({ userId: 1 })
db.transactions.createIndex({ "relatedEntity.id": 1 })

// StylePresets collection
db.stylePresets.createIndex({ category: 1 })
db.stylePresets.createIndex({ isPublic: 1 })
db.stylePresets.createIndex({ compatibleWith: 1 })

// Analytics collection
db.analytics.createIndex({ userId: 1 })
db.analytics.createIndex({ entityType: 1, entityId: 1 })
db.analytics.createIndex({ date: 1 })
```

## Relationships

- **One-to-Many**:
  - User → Campaigns
  - User → Assets
  - Campaign → Assets
  - User → GenerationJobs
  - User → Transactions

- **One-to-One**:
  - User → Subscription
  - GenerationJob → Asset

## Schema Validation

MongoDB schema validation rules ensure data integrity. Example for the Users collection:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["email", "role", "createdAt"],
      properties: {
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["user", "admin"]
        },
        plan: {
          enum: ["free", "basic", "premium"]
        }
        // Additional validation rules...
      }
    }
  }
}) 