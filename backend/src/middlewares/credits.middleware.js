const User = require('../models/user.model');
const Transaction = require('../models/transaction.model');
const mongoose = require('mongoose');

/**
 * Credit cost constants for different operations
 */
const CREDIT_COSTS = {
  IMAGE_GENERATION: 1,
  VIDEO_GENERATION: 3,
  ENHANCE_IMAGE: 1,
  AD_COPY_GENERATION: 1,
  AD_COPY_VARIATIONS: 2
};

/**
 * Middleware to check if user has enough credits and deduct them
 * @param {string} operationType - Type of operation requiring credits
 * @param {Object} options - Additional options
 * @returns {Function} Express middleware
 */
const checkCredits = (operationType, options = {}) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    const creditCost = CREDIT_COSTS[operationType] || 1;
    
    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Find user with their credit information
      const user = await User.findById(req.user.id).session(session);
      
      if (!user) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'User not found'
          }
        });
      }

      // Check if subscription is unlimited (no need to check credits)
      if (user.subscriptionTier === 'pro' && options.isUnlimitedForPro) {
        // Add metadata to request for controller use
        req.creditInfo = {
          cost: 0,
          isUnlimited: true
        };
        await session.commitTransaction();
        session.endSession();
        return next();
      }

      // Check if user has enough credits
      const creditsRemaining = user.planDetails?.creditsRemaining || 0;
      
      if (creditsRemaining < creditCost) {
        await session.abortTransaction();
        session.endSession();
        return res.status(402).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_CREDITS',
            message: 'Not enough credits',
            details: {
              required: creditCost,
              available: creditsRemaining
            }
          }
        });
      }

      // Deduct credits
      user.planDetails.creditsRemaining = creditsRemaining - creditCost;
      await user.save({ session });

      // Create transaction record
      const metadata = {
        operationType,
        campaignId: req.params.id || req.body.campaignId,
        requestBody: JSON.stringify(req.body)
      };
      
      const transaction = new Transaction({
        userId: user._id,
        type: 'usage',
        amount: -creditCost,
        balance: user.planDetails.creditsRemaining,
        description: `Credit usage for ${operationType.toLowerCase().replace(/_/g, ' ')}`,
        metadata
      });
      
      await transaction.save({ session });

      // Add metadata to request for controller use
      req.creditInfo = {
        cost: creditCost,
        transactionId: transaction._id,
        remainingCredits: user.planDetails.creditsRemaining
      };

      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      next();
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      
      console.error('Error in credit check middleware:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process credits'
        }
      });
    }
  };
};

/**
 * Middleware to refund credits if operation fails
 * @returns {Function} Express middleware
 */
const refundOnFailure = () => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.json;
    
    // Override the send function to refund credits if operation fails
    res.json = async function(data) {
      if (req.creditInfo && req.creditInfo.cost > 0 && res.statusCode >= 400) {
        try {
          // Start a session for transaction
          const session = await mongoose.startSession();
          session.startTransaction();
          
          // Find user with their credit information
          const user = await User.findById(req.user.id).session(session);
          
          if (user) {
            // Refund credits
            user.planDetails.creditsRemaining += req.creditInfo.cost;
            await user.save({ session });
            
            // Create refund transaction record
            const transaction = new Transaction({
              userId: user._id,
              type: 'refund',
              amount: req.creditInfo.cost,
              balance: user.planDetails.creditsRemaining,
              description: 'Refund for failed operation',
              metadata: {
                originalTransactionId: req.creditInfo.transactionId
              }
            });
            
            await transaction.save({ session });
            
            // Update the response data with refund information
            if (data.error && data.error.details) {
              data.error.details.creditRefunded = req.creditInfo.cost;
            }
          }
          
          // Commit the transaction
          await session.commitTransaction();
          session.endSession();
        } catch (error) {
          console.error('Error refunding credits:', error);
          // Don't block the response even if refund fails
        }
      }
      
      // Call the original send function
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  CREDIT_COSTS,
  checkCredits,
  refundOnFailure
}; 