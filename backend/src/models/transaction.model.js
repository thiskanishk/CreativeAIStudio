const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Transaction schema for tracking credit usage and purchases
 */
const transactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['purchase', 'usage', 'refund', 'bonus'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      // Positive for purchases/bonuses, negative for usage
    },
    balance: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    paymentId: {
      type: String,
      // Present for purchases
    },
    metadata: {
      // Additional data specific to transaction type
      operationType: String,
      campaignId: Schema.Types.ObjectId,
      assetId: Schema.Types.ObjectId,
      originalTransactionId: Schema.Types.ObjectId,
      requestBody: String,
      packageId: String
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for common queries
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, createdAt: -1 });

/**
 * Static method to get credit balance for a user
 */
transactionSchema.statics.getCurrentBalance = async function(userId) {
  const Transaction = this;
  
  // Find the most recent transaction for this user to get current balance
  const latestTransaction = await Transaction
    .findOne({ userId })
    .sort({ createdAt: -1 })
    .limit(1);
    
  return latestTransaction ? latestTransaction.balance : 0;
};

/**
 * Static method to get credit usage summary for a time period
 */
transactionSchema.statics.getUsageSummary = async function(userId, startDate, endDate) {
  const Transaction = this;
  
  // Calculate totals by transaction type
  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  // Format the results
  const result = {
    purchased: 0,
    used: 0,
    refunded: 0,
    bonus: 0
  };
  
  summary.forEach(item => {
    if (item._id === 'purchase') {
      result.purchased = item.total;
    } else if (item._id === 'usage') {
      result.used = Math.abs(item.total);
    } else if (item._id === 'refund') {
      result.refunded = item.total;
    } else if (item._id === 'bonus') {
      result.bonus = item.total;
    }
  });
  
  return result;
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 