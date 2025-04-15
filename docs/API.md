# API Documentation for AI-Powered Facebook Ad Creator

This document outlines the API endpoints available in the AI-Powered Facebook Ad Creator application.

## Base URL

All API endpoints are prefixed with:

```
http://localhost:5000/api
```

For production, this will be your deployed backend URL.

## Authentication

Most endpoints require authentication using JWT (JSON Web Token). Include the token in the Authorization header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Authentication

#### Register a new user

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "subscriptionTier": "free",
      "planDetails": {
        "creditsRemaining": 5,
        "planStart": "2023-05-15T00:00:00.000Z",
        "planEnd": "2023-06-15T00:00:00.000Z"
      }
    }
  }
  ```

#### Login

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: Same as register

#### Google OAuth Login

- **URL**: `/auth/google`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Redirects to Google for authentication

#### Facebook OAuth Login

- **URL**: `/auth/facebook`
- **Method**: `GET`
- **Auth Required**: No
- **Description**: Redirects to Facebook for authentication

#### Get Current User

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "subscriptionTier": "free",
    "planDetails": {
      "creditsRemaining": 5,
      "planStart": "2023-05-15T00:00:00.000Z",
      "planEnd": "2023-06-15T00:00:00.000Z"
    },
    "profilePicture": "https://example.com/profile.jpg"
  }
  ```

### Campaigns

#### Get All Campaigns

- **URL**: `/campaigns`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "_id": "campaign_id_1",
      "title": "Summer Sale",
      "description": "Summer collection promotion",
      "isPublic": false,
      "tags": ["summer", "sale"],
      "status": "active",
      "lastEdited": "2023-05-15T00:00:00.000Z",
      "createdAt": "2023-05-10T00:00:00.000Z",
      "updatedAt": "2023-05-15T00:00:00.000Z"
    },
    {
      "_id": "campaign_id_2",
      "title": "New Product Launch",
      "description": "Launching our new product",
      "isPublic": true,
      "tags": ["new", "product"],
      "status": "draft",
      "lastEdited": "2023-05-14T00:00:00.000Z",
      "createdAt": "2023-05-14T00:00:00.000Z",
      "updatedAt": "2023-05-14T00:00:00.000Z"
    }
  ]
  ```

#### Get Campaign by ID

- **URL**: `/campaigns/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Single campaign object

#### Create Campaign

- **URL**: `/campaigns`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "title": "Holiday Promotion",
    "description": "Winter holiday special offers",
    "isPublic": false,
    "tags": ["holiday", "winter", "promotion"]
  }
  ```
- **Response**: Created campaign object

#### Update Campaign

- **URL**: `/campaigns/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "title": "Updated Campaign Title",
    "description": "Updated description",
    "isPublic": true,
    "status": "active"
  }
  ```
- **Response**: Updated campaign object

#### Delete Campaign

- **URL**: `/campaigns/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "Campaign deleted successfully"
  }
  ```

#### Search Campaigns

- **URL**: `/campaigns/search?q=query`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Array of matching campaigns

### Assets

#### Get Assets for Campaign

- **URL**: `/campaigns/:campaignId/assets`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Array of assets

#### Get All User Assets

- **URL**: `/assets`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Array of all user assets

#### Get Asset by ID

- **URL**: `/assets/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Single asset object

#### Create Asset

- **URL**: `/assets`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "campaignId": "campaign_id",
    "type": "image",
    "title": "Product Showcase",
    "originalImageUrls": ["https://example.com/image1.jpg"],
    "generationConfig": {
      "adText": {
        "title": "Amazing Product",
        "description": "Check out our amazing product",
        "callToAction": "Shop Now"
      },
      "style": "bold",
      "logo": {
        "url": "https://example.com/logo.png",
        "position": "bottom-right"
      },
      "brandColor": "#FF5733"
    },
    "resolution": "hd"
  }
  ```
- **Response**: Created asset object with jobId for generation

#### Update Asset

- **URL**: `/assets/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "title": "Updated Asset Title",
    "isPublic": true
  }
  ```
- **Response**: Updated asset object

#### Delete Asset

- **URL**: `/assets/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "message": "Asset deleted successfully"
  }
  ```

#### Generate Shareable Link

- **URL**: `/assets/:id/share`
- **Method**: `POST`
- **Auth Required**: Yes
- **Response**: Updated asset with shareableLink

#### Submit Feedback

- **URL**: `/assets/:id/feedback`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "rating": 4,
    "comment": "Great result, but could use more contrast"
  }
  ```
- **Response**: Updated asset with feedback

#### Track Download

- **URL**: `/assets/:id/download`
- **Method**: `POST`
- **Auth Required**: Yes
- **Response**: Updated asset with incremented download count

### Media

#### Upload Image

- **URL**: `/media/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with 'image' field
- **Response**: 
  ```json
  {
    "fileUrl": "https://example.com/uploaded-image.jpg",
    "publicId": "image_public_id",
    "width": 800,
    "height": 600,
    "format": "jpg",
    "size": 102400
  }
  ```

#### Upload Multiple Images

- **URL**: `/media/upload-multiple`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with 'images' fields
- **Response**: Array of uploaded file information

#### Upload Logo

- **URL**: `/media/upload-logo`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Body**: Form data with 'logo' field
- **Response**: Uploaded file information

#### Enhance Image

- **URL**: `/media/enhance`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "imageUrl": "https://example.com/image.jpg"
  }
  ```
- **Response**:
  ```json
  {
    "enhancedUrl": "https://example.com/enhanced-image.jpg",
    "publicId": "enhanced_image_public_id"
  }
  ```

#### Download Asset

- **URL**: `/media/download/:assetId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: File download

### Generation

#### Generate Ad Copy

- **URL**: `/generate/ad-copy`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "productName": "Eco-Friendly Water Bottle",
    "productDescription": "Insulated stainless steel bottle that keeps drinks hot or cold for 24 hours",
    "tone": "friendly",
    "maxLength": 200
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "adCopy": {
      "title": "Stay Hydrated in Style",
      "description": "Keep your drinks hot or cold for 24 hours with our eco-friendly insulated water bottle. Perfect for hiking, office, or everyday use!",
      "callToAction": "Shop Now"
    }
  }
  ```

#### Generate Ad Copy Variations

- **URL**: `/generate/ad-copy-variations`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "productName": "Eco-Friendly Water Bottle",
    "productDescription": "Insulated stainless steel bottle that keeps drinks hot or cold for 24 hours",
    "tone": "friendly",
    "maxLength": 200,
    "count": 3
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "variations": [
      {
        "title": "Stay Hydrated in Style",
        "description": "Keep your drinks hot or cold for 24 hours with our eco-friendly insulated water bottle.",
        "callToAction": "Shop Now"
      },
      {
        "title": "24 Hours of Perfect Temperature",
        "description": "Our stainless steel water bottle keeps your beverages at the ideal temperature all day long.",
        "callToAction": "Get Yours Today"
      },
      {
        "title": "Eco-Friendly Hydration Solution",
        "description": "Reduce plastic waste while enjoying perfectly hot or cold drinks with our insulated water bottle.",
        "callToAction": "Save the Planet, Stay Hydrated"
      }
    ]
  }
  ```

#### Generate Image Ad

- **URL**: `/generate/image`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "imageUrls": ["https://example.com/image1.jpg"],
    "adText": {
      "title": "Amazing Product",
      "description": "Check out our amazing product",
      "callToAction": "Shop Now"
    },
    "style": "bold",
    "logo": {
      "url": "https://example.com/logo.png",
      "position": "bottom-right"
    },
    "brandColor": "#FF5733",
    "resolution": "hd"
  }
  ```
- **Response**:
  ```json
  {
    "jobId": "generation_job_id",
    "assetId": "asset_id",
    "status": "processing",
    "estimatedTime": 15
  }
  ```

#### Generate Video Ad

- **URL**: `/generate/video`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    "adText": {
      "title": "Amazing Product",
      "description": "Check out our amazing product",
      "callToAction": "Shop Now"
    },
    "style": "bold",
    "logo": {
      "url": "https://example.com/logo.png",
      "position": "bottom-right"
    },
    "brandColor": "#FF5733",
    "videoOptions": {
      "hasMusic": true,
      "musicTrack": "upbeat",
      "hasVoiceover": true,
      "voiceGender": "female",
      "voiceStyle": "friendly"
    },
    "resolution": "hd"
  }
  ```
- **Response**:
  ```json
  {
    "jobId": "generation_job_id",
    "assetId": "asset_id",
    "status": "processing",
    "estimatedTime": 45
  }
  ```

#### Check Job Status

- **URL**: `/generate/status/:jobId`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "jobId": "generation_job_id",
    "status": "completed",
    "progress": 100,
    "result": {
      "fileUrl": "https://example.com/generated-file.jpg",
      "thumbnailUrl": "https://example.com/thumbnail.jpg"
    }
  }
  ```

#### Get Style Presets

- **URL**: `/generate/styles`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  [
    {
      "id": "bold",
      "name": "Bold",
      "description": "High contrast, strong text emphasis",
      "thumbnail": "https://example.com/bold-thumbnail.jpg",
      "category": "general"
    },
    {
      "id": "minimal",
      "name": "Minimal",
      "description": "Clean, simple design with plenty of whitespace",
      "thumbnail": "https://example.com/minimal-thumbnail.jpg",
      "category": "general"
    },
    {
      "id": "festive",
      "name": "Festive",
      "description": "Colorful and celebratory style",
      "thumbnail": "https://example.com/festive-thumbnail.jpg",
      "category": "seasonal"
    }
  ]
  ```

### Payment

#### Create Subscription

- **URL**: `/payment/create-subscription`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "planId": "pro_monthly"
  }
  ```
- **Response**:
  ```json
  {
    "clientSecret": "stripe_client_secret",
    "subscriptionId": "subscription_id"
  }
  ```

#### Get Portal Link

- **URL**: `/payment/portal`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "url": "https://billing.stripe.com/session/portal_url"
  }
  ```

#### Get Usage

- **URL**: `/payment/usage`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**:
  ```json
  {
    "creditsUsed": 15,
    "creditsRemaining": 35,
    "totalCredits": 50,
    "currentPlan": "pro",
    "renewDate": "2023-06-15T00:00:00.000Z",
    "history": [
      {
        "date": "2023-05-14T00:00:00.000Z",
        "creditsUsed": 3,
        "description": "Video generation"
      },
      {
        "date": "2023-05-13T00:00:00.000Z",
        "creditsUsed": 1,
        "description": "Image generation"
      }
    ]
  }
  ```

#### Buy Credits

- **URL**: `/payment/buy-credits`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**:
  ```json
  {
    "amount": 10
  }
  ```
- **Response**:
  ```json
  {
    "clientSecret": "stripe_client_secret",
    "paymentIntentId": "payment_intent_id"
  }
  ``` 