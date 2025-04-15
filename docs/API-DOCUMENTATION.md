# Creative AI Studio API Documentation

## Base URL
```
http://localhost:5000/api
```

For production:
```
https://api.yourdeployedapp.com/api
```

## Authentication
All API requests require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6151c2e68a8f890d12345678",
    "name": "John Doe",
    "email": "user@example.com",
    "subscriptionTier": "free",
    "planDetails": {
      "creditsRemaining": 5,
      "planStart": "2023-04-01T00:00:00Z",
      "planEnd": "2023-05-01T00:00:00Z"
    }
  }
}
```

#### POST /auth/login
Authenticate a user and retrieve a token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6151c2e68a8f890d12345678",
    "name": "John Doe",
    "email": "user@example.com",
    "subscriptionTier": "free",
    "planDetails": {
      "creditsRemaining": 5,
      "planStart": "2023-04-01T00:00:00Z",
      "planEnd": "2023-05-01T00:00:00Z"
    }
  }
}
```

#### POST /auth/social/google
Authenticate with Google.

**Request Body:**
```json
{
  "token": "google_id_token"
}
```

#### POST /auth/social/facebook
Authenticate with Facebook.

**Request Body:**
```json
{
  "token": "facebook_access_token"
}
```

#### POST /auth/forgot-password
Request a password reset.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newSecurePassword123"
}
```

### User Management

#### GET /users/me
Get current user profile.

**Response:**
```json
{
  "id": "6151c2e68a8f890d12345678",
  "name": "John Doe",
  "email": "user@example.com",
  "subscriptionTier": "free",
  "planDetails": {
    "creditsRemaining": 5,
    "planStart": "2023-01-15T10:30:45Z",
    "planEnd": "2023-05-10T14:22:18Z"
  },
  "profilePicture": "https://res.cloudinary.com/example/image/upload/profile.jpg",
  "lastLogin": "2023-05-10T14:22:18Z"
}
```

#### PUT /users/me
Update user profile.

**Request Body:**
```json
{
  "name": "John Smith",
  "profilePicture": "https://res.cloudinary.com/example/image/upload/new-profile.jpg"
}
```

#### GET /users/me/usage
Get current user usage statistics.

**Response:**
```json
{
  "creditsPurchased": 50,
  "creditsUsed": 45,
  "creditsRemaining": 5,
  "campaignsCreated": 10,
  "assetsGenerated": 42,
  "planLimits": {
    "maxCampaigns": 20,
    "maxAssetsPerCampaign": 10
  }
}
```

### Campaigns

#### GET /campaigns
List all campaigns for current user.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (draft, active, completed, archived)
- `sort` (optional): Sort field (createdAt, updatedAt, title)
- `order` (optional): Sort direction (asc, desc)

**Response:**
```json
{
  "campaigns": [
    {
      "_id": "6151c2e68a8f890d12345679",
      "title": "Summer Sale 2023",
      "description": "Promotion for summer products",
      "isPublic": false,
      "tags": ["summer", "sale", "promotion"],
      "status": "active",
      "lastEdited": "2023-04-15T11:20:45Z",
      "createdAt": "2023-04-10T08:15:30Z",
      "updatedAt": "2023-04-15T11:20:45Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 10,
    "totalPages": 1
  }
}
```

#### POST /campaigns
Create a new campaign.

**Request Body:**
```json
{
  "title": "Summer Sale 2023",
  "description": "Promotion for summer products",
  "isPublic": false,
  "tags": ["summer", "sale", "promotion"]
}
```

**Response:**
```json
{
  "_id": "6151c2e68a8f890d12345679",
  "title": "Summer Sale 2023",
  "description": "Promotion for summer products",
  "isPublic": false,
  "tags": ["summer", "sale", "promotion"],
  "status": "draft",
  "lastEdited": "2023-05-15T14:20:30Z",
  "createdAt": "2023-05-15T14:20:30Z",
  "updatedAt": "2023-05-15T14:20:30Z"
}
```

#### GET /campaigns/:id
Get campaign details.

**Response:**
```json
{
  "_id": "6151c2e68a8f890d12345679",
  "title": "Summer Sale 2023",
  "description": "Promotion for summer products",
  "isPublic": false,
  "tags": ["summer", "sale", "promotion"],
  "status": "active",
  "lastEdited": "2023-04-15T11:20:45Z",
  "createdAt": "2023-04-10T08:15:30Z",
  "updatedAt": "2023-04-15T11:20:45Z"
}
```

#### PUT /campaigns/:id
Update a campaign.

**Request Body:**
```json
{
  "title": "Updated Summer Sale 2023",
  "description": "Updated promotion for summer products",
  "status": "active"
}
```

#### DELETE /campaigns/:id
Delete a campaign.

#### GET /campaigns/search
Search campaigns.

**Query Parameters:**
- `q`: Search query

**Response:**
```json
{
  "campaigns": [
    {
      "_id": "6151c2e68a8f890d12345679",
      "title": "Summer Sale 2023",
      "description": "Promotion for summer products",
      "status": "active",
      "createdAt": "2023-04-10T08:15:30Z",
      "updatedAt": "2023-04-15T11:20:45Z"
    }
  ]
}
```

### Assets

#### GET /campaigns/:id/assets
List assets for a campaign.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (image, video)
- `status` (optional): Filter by status (processing, completed, failed)

**Response:**
```json
{
  "assets": [
    {
      "_id": "6151c2e68a8f890d12345680",
      "campaignId": "6151c2e68a8f890d12345679",
      "type": "image",
      "title": "Summer Sale Banner",
      "fileUrl": "https://res.cloudinary.com/example/image/upload/assets/image123.jpg",
      "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/assets/thumb_image123.jpg",
      "publicId": "assets/image123",
      "status": "completed",
      "isPublic": false,
      "resolution": "hd",
      "generationConfig": {
        "adText": {
          "title": "Summer Sale",
          "description": "Get 50% off on summer products",
          "callToAction": "Shop Now"
        },
        "style": "modern",
        "logo": {
          "url": "https://res.cloudinary.com/example/image/upload/logos/logo.png",
          "position": "bottom-right"
        },
        "brandColor": "#FF9E4D"
      },
      "shareableLink": null,
      "downloads": 0,
      "createdAt": "2023-04-12T09:30:15Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 8,
    "totalPages": 1
  }
}
```

#### POST /campaigns/:id/assets
Create a new asset.

**Request Body:**
```json
{
  "type": "image",
  "title": "Summer Sale Banner",
  "originalImageUrls": [
    "https://res.cloudinary.com/example/image/upload/v1/uploads/image1.jpg"
  ],
  "generationConfig": {
    "adText": {
      "title": "Summer Sale",
      "description": "Get 50% off on summer products", 
      "callToAction": "Shop Now"
    },
    "style": "modern",
    "logo": {
      "url": "https://res.cloudinary.com/example/image/upload/logos/logo.png",
      "position": "bottom-right"
    },
    "brandColor": "#FF9E4D"
  },
  "resolution": "hd"
}
```

**Response:**
```json
{
  "_id": "6151c2e68a8f890d12345680",
  "campaignId": "6151c2e68a8f890d12345679",
  "type": "image",
  "title": "Summer Sale Banner",
  "status": "processing",
  "jobId": "6151c2e68a8f890d12345690"
}
```

#### GET /assets/:id
Get asset details.

**Response:**
```json
{
  "_id": "6151c2e68a8f890d12345680",
  "campaignId": "6151c2e68a8f890d12345679",
  "type": "image",
  "title": "Summer Sale Banner",
  "fileUrl": "https://res.cloudinary.com/example/image/upload/assets/image123.jpg",
  "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/assets/thumb_image123.jpg",
  "publicId": "assets/image123",
  "originalImageUrls": [
    "https://res.cloudinary.com/example/image/upload/v1/uploads/image1.jpg"
  ],
  "status": "completed",
  "isPublic": false,
  "resolution": "hd",
  "generationConfig": {
    "adText": {
      "title": "Summer Sale",
      "description": "Get 50% off on summer products",
      "callToAction": "Shop Now"
    },
    "style": "modern",
    "logo": {
      "url": "https://res.cloudinary.com/example/image/upload/logos/logo.png",
      "position": "bottom-right"
    },
    "brandColor": "#FF9E4D"
  },
  "shareableLink": null,
  "downloads": 0,
  "createdAt": "2023-04-12T09:30:15Z",
  "updatedAt": "2023-04-12T10:45:30Z"
}
```

#### PUT /assets/:id
Update an asset.

**Request Body:**
```json
{
  "title": "Updated Summer Sale Banner",
  "isPublic": true
}
```

#### DELETE /assets/:id
Delete an asset.

#### POST /assets/:id/feedback
Submit feedback for an asset.

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great image quality but the text could be more visible"
}
```

#### POST /assets/:id/share
Generate a shareable link for an asset.

**Response:**
```json
{
  "shareableLink": "https://share.creativeaistudio.com/assets/abc123"
}
```

### Media

#### POST /media/upload
Upload a single image.

**Request Body:**
Multipart form data with `image` field containing the file.

**Response:**
```json
{
  "fileUrl": "https://res.cloudinary.com/example/image/upload/v1/uploads/image1.jpg",
  "publicId": "uploads/image1",
  "width": 1200,
  "height": 800,
  "format": "jpg",
  "size": 102400
}
```

#### POST /media/upload-multiple
Upload multiple images.

**Request Body:**
Multipart form data with `images` field containing multiple files.

**Response:**
```json
[
  {
    "fileUrl": "https://res.cloudinary.com/example/image/upload/v1/uploads/image1.jpg",
    "publicId": "uploads/image1",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "size": 102400
  },
  {
    "fileUrl": "https://res.cloudinary.com/example/image/upload/v1/uploads/image2.jpg",
    "publicId": "uploads/image2",
    "width": 1200,
    "height": 800,
    "format": "jpg",
    "size": 98304
  }
]
```

#### POST /media/upload-logo
Upload a logo.

**Request Body:**
Multipart form data with `logo` field containing the file.

**Response:**
```json
{
  "fileUrl": "https://res.cloudinary.com/example/image/upload/v1/logos/logo.png",
  "publicId": "logos/logo",
  "width": 300,
  "height": 300,
  "format": "png",
  "size": 20480
}
```

#### POST /media/enhance
Enhance an image.

**Request Body:**
```json
{
  "imageUrl": "https://res.cloudinary.com/example/image/upload/v1/uploads/image1.jpg"
}
```

**Response:**
```json
{
  "enhancedUrl": "https://res.cloudinary.com/example/image/upload/v1/enhanced/image1.jpg",
  "publicId": "enhanced/image1"
}
```

#### GET /media/download/:assetId
Download an asset file.

### Generation

#### POST /generate/ad-copy
Generate ad copy.

**Request Body:**
```json
{
  "productName": "Beach Umbrella",
  "productDescription": "Portable UV-protective beach umbrella with sand anchor",
  "tone": "casual",
  "maxLength": 150
}
```

**Response:**
```json
{
  "title": "Beat the Heat with Our Beach Umbrella",
  "description": "Stay cool and protected with our portable UV-blocking beach umbrella. Easy to set up with a secure sand anchor.",
  "callToAction": "Shop Now"
}
```

#### POST /generate/ad-copy-variations
Generate multiple ad copy variations.

**Request Body:**
```json
{
  "productName": "Beach Umbrella",
  "productDescription": "Portable UV-protective beach umbrella with sand anchor",
  "tone": "casual",
  "maxLength": 150,
  "count": 3
}
```

**Response:**
```json
[
  {
    "title": "Beat the Heat with Our Beach Umbrella",
    "description": "Stay cool and protected with our portable UV-blocking beach umbrella. Easy to set up with a secure sand anchor.",
    "callToAction": "Shop Now"
  },
  {
    "title": "Summer Shade: Beach Umbrella Sale",
    "description": "Enjoy your beach day worry-free with our UV-protective umbrella. Portable design with secure sand anchor.",
    "callToAction": "Get Yours Today"
  },
  {
    "title": "Perfect Beach Days Start with Perfect Shade",
    "description": "Our portable beach umbrella offers premium UV protection and easy setup with a built-in sand anchor.",
    "callToAction": "Buy Now"
  }
]
```

#### POST /generate/image-ad
Generate an image ad.

**Request Body:**
```json
{
  "imageUrls": [
    "https://res.cloudinary.com/example/image/upload/v1/uploads/beach.jpg"
  ],
  "adText": {
    "title": "Summer Sale: 50% Off Beach Gear",
    "description": "Get ready for summer with our premium beach accessories",
    "callToAction": "Shop Now"
  },
  "style": "vibrant",
  "logo": {
    "url": "https://res.cloudinary.com/example/image/upload/v1/logos/logo.png",
    "position": "bottom-right"
  },
  "brandColor": "#0088cc",
  "resolution": "hd"
}
```

**Response:**
```json
{
  "jobId": "6151c2e68a8f890d12345690",
  "assetId": "6151c2e68a8f890d12345680",
  "status": "processing",
  "estimatedTime": 30
}
```

#### POST /generate/video-ad
Generate a video ad.

**Request Body:**
```json
{
  "imageUrls": [
    "https://res.cloudinary.com/example/image/upload/v1/uploads/beach1.jpg",
    "https://res.cloudinary.com/example/image/upload/v1/uploads/beach2.jpg",
    "https://res.cloudinary.com/example/image/upload/v1/uploads/beach3.jpg"
  ],
  "adText": {
    "title": "Summer Sale: 50% Off Beach Gear",
    "description": "Get ready for summer with our premium beach accessories",
    "callToAction": "Shop Now"
  },
  "style": "dynamic",
  "logo": {
    "url": "https://res.cloudinary.com/example/image/upload/v1/logos/logo.png",
    "position": "bottom-right"
  },
  "brandColor": "#0088cc",
  "videoOptions": {
    "hasMusic": true,
    "musicTrack": "upbeat_summer",
    "hasVoiceover": true,
    "voiceGender": "female",
    "voiceStyle": "friendly"
  },
  "resolution": "hd"
}
```

**Response:**
```json
{
  "jobId": "6151c2e68a8f890d12345691",
  "assetId": "6151c2e68a8f890d12345681",
  "status": "processing",
  "estimatedTime": 120
}
```

#### GET /generate/job/:jobId
Check generation job status.

**Response:**
```json
{
  "jobId": "6151c2e68a8f890d12345690",
  "status": "completed",
  "progress": 100,
  "result": {
    "assetId": "6151c2e68a8f890d12345680",
    "fileUrl": "https://res.cloudinary.com/example/image/upload/v1/assets/ad123.jpg",
    "thumbnailUrl": "https://res.cloudinary.com/example/image/upload/v1/assets/thumb_ad123.jpg"
  }
}
```

#### GET /generate/style-presets
Get available style presets.

**Response:**
```json
[
  {
    "id": "vibrant",
    "name": "Vibrant",
    "description": "Bright and colorful style with bold elements",
    "thumbnail": "https://res.cloudinary.com/example/image/upload/presets/vibrant.jpg",
    "category": "modern"
  },
  {
    "id": "minimal",
    "name": "Minimal",
    "description": "Clean and simple style with lots of whitespace",
    "thumbnail": "https://res.cloudinary.com/example/image/upload/presets/minimal.jpg",
    "category": "modern"
  }
]
```

### Payment

#### GET /payment/plans
Get available subscription plans.

**Response:**
```json
{
  "plans": [
    {
      "id": "free",
      "name": "Free",
      "price": 0,
      "currency": "USD",
      "interval": "month",
      "features": [
        "5 credits per month",
        "Basic ad styles",
        "SD quality"
      ]
    },
    {
      "id": "pro",
      "name": "Pro",
      "price": 29.99,
      "currency": "USD",
      "interval": "month",
      "features": [
        "Unlimited ads",
        "All ad styles",
        "HD quality",
        "Video ads",
        "Priority support"
      ]
    }
  ]
}
```

#### POST /payment/subscribe
Subscribe to a plan.

**Request Body:**
```json
{
  "planId": "pro",
  "paymentMethodId": "pm_card_visa",
  "couponCode": "SUMMER10"
}
```

#### POST /payment/cancel-subscription
Cancel current subscription.

#### POST /payment/create-checkout-session
Create a checkout session for subscription.

**Request Body:**
```json
{
  "planId": "pro",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
  "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

#### POST /payment/buy-credits
Purchase additional credits.

**Request Body:**
```json
{
  "packageId": "credits_50",
  "paymentMethodId": "pm_card_visa"
}
```

### Feedback

#### POST /feedback
Submit general feedback.

**Request Body:**
```json
{
  "type": "feature_request",
  "subject": "Add Instagram ad support",
  "message": "It would be great if we could create Instagram ads as well.",
  "rating": 4
}
```

## Error Handling

All endpoints follow the same error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication failed or token expired
- `FORBIDDEN`: User does not have permission for this action
- `NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Invalid request parameters
- `INSUFFICIENT_CREDITS`: User does not have enough credits
- `RATE_LIMITED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Unexpected server error

## Health Check

#### GET /health
Check if the API is running.

**Response:**
```json
{
  "status": "ok"
}
``` 