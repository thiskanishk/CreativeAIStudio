# Creative AI Studio

A full-stack web application for creating AI-enhanced Facebook ads with image/video generation capabilities.

## Features

- **User Authentication**: Email/password and social login
- **Image Upload & AI Enhancement**: Background removal, color correction
- **Ad Text Context Entry**: Product description with AI-generated suggestions
- **Creative Type & Style Selection**: Image or Video ads with customizable styles
- **AI-Powered Creative Generation**: Image and video ad generation with effects
- **Campaign Management**: Create, edit, and organize ad campaigns
- **Creative Library**: Browse and manage generated assets
- **Sharing & Export**: Download and share ad creatives
- **Subscription Management**: Freemium model with Stripe/Razorpay integration
- **Feedback & Notification**: Get alerts and provide feedback

## Tech Stack

- **Frontend**: React.js (Next.js), TailwindCSS, Material UI
- **Backend**: Node.js + Express.js
- **AI Layer**: Modular orchestrator calling OpenAI, Replicate, Runway
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary or AWS S3
- **Auth**: JWT + OAuth
- **Payment**: Stripe or Razorpay
- **DevOps**: GitHub Actions, Vercel (frontend), Railway (backend), Cloudflare CDN

## Project Structure

```
facebook-ad-creator/
├── frontend/           # Next.js React app
├── backend/            # Express.js API server
├── ai-engine/          # AI orchestration layer
└── docs/               # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MongoDB
- Cloudinary/AWS S3 account
- OpenAI API key
- Replicate/Runway API key
- Stripe/Razorpay account

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file with your environment variables:
   ```
   PORT=3001
   NODE_ENV=development
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   OPENAI_API_KEY=your_openai_api_key
   REPLICATE_API_KEY=your_replicate_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:3000
   ```

4. Start the development server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env.local` file with environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:3000`

## Deployment

### Backend Deployment (Railway)

1. Create a new project on Railway
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel)

1. Create a new project on Vercel
2. Connect your GitHub repository
3. Add environment variables
4. Deploy

## License

MIT 
