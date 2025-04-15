const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: function() {
        // Password is required only if authProvider is 'email'
        return this.authProvider === 'email';
      },
      minlength: 6,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google', 'facebook'],
      default: 'email',
    },
    providerId: {
      type: String,
      sparse: true,
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    planDetails: {
      creditsRemaining: {
        type: Number,
        default: 5, // Free tier gets 5 credits by default
      },
      planStart: {
        type: Date,
        default: Date.now,
      },
      planEnd: {
        type: Date,
        default: function() {
          const now = new Date();
          return new Date(now.setMonth(now.getMonth() + 1)); // 1 month from now
        },
      },
      stripeCustomerId: String,
      stripeSubscriptionId: String,
      razorpayCustomerId: String,
    },
    profilePicture: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre('save', async function(next) {
  const user = this;
  
  // Only hash the password if it's modified or new
  if (!user.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);
    user.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user has sufficient credits
UserSchema.methods.hasSufficientCredits = function(requiredCredits = 1) {
  return this.subscriptionTier === 'pro' || this.planDetails.creditsRemaining >= requiredCredits;
};

// Method to deduct credits
UserSchema.methods.deductCredits = async function(amount = 1) {
  if (this.subscriptionTier === 'pro') return true; // Pro users don't use credits
  
  if (this.planDetails.creditsRemaining >= amount) {
    this.planDetails.creditsRemaining -= amount;
    await this.save();
    return true;
  }
  
  return false;
};

module.exports = mongoose.model('User', UserSchema); 