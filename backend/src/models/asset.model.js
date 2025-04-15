const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
    },
    publicId: {
      type: String, // Cloudinary public ID
    },
    originalImageUrls: {
      type: [String], // Original uploaded images
    },
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    resolution: {
      type: String,
      enum: ['sd', 'hd', 'fullhd'],
      default: 'sd',
    },
    generationConfig: {
      adText: {
        title: String,
        description: String,
        callToAction: String,
      },
      style: {
        type: String,
        enum: ['bold', 'minimal', 'festive', 'modern', 'classic'],
      },
      logo: {
        url: String,
        position: {
          type: String,
          enum: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
          default: 'bottom-right'
        }
      },
      brandColor: String,
      videoOptions: {
        hasMusic: {
          type: Boolean,
          default: false,
        },
        musicTrack: String,
        hasVoiceover: {
          type: Boolean,
          default: false,
        },
        voiceGender: {
          type: String,
          enum: ['male', 'female'],
        },
        voiceStyle: {
          type: String,
          enum: ['friendly', 'professional', 'energetic'],
        }
      }
    },
    errorMessage: String, // In case of failure
    jobId: String, // For async AI jobs
    shareableLink: String, // Generated when made public
    downloads: {
      type: Number,
      default: 0
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String
    }
  },
  { timestamps: true }
);

// Indexes
AssetSchema.index({ userId: 1 });
AssetSchema.index({ campaignId: 1 });
AssetSchema.index({ status: 1 });
AssetSchema.index({ type: 1 });

module.exports = mongoose.model('Asset', AssetSchema); 