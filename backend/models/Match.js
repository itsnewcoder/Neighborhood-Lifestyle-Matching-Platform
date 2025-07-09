const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  // Reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Reference to neighborhood
  neighborhoodId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Neighborhood',
    required: [true, 'Neighborhood ID is required']
  },
  
  // Match scores (0-100)
  scores: {
    overallScore: {
      type: Number,
      min: [0, 'Overall score cannot be negative'],
      max: [100, 'Overall score cannot exceed 100']
    },
    safetyScore: {
      type: Number,
      min: [0, 'Safety score cannot be negative'],
      max: [100, 'Safety score cannot exceed 100']
    },
    educationScore: {
      type: Number,
      min: [0, 'Education score cannot be negative'],
      max: [100, 'Education score cannot exceed 100']
    },
    walkabilityScore: {
      type: Number,
      min: [0, 'Walkability score cannot be negative'],
      max: [100, 'Walkability score cannot exceed 100']
    },
    budgetScore: {
      type: Number,
      min: [0, 'Budget score cannot be negative'],
      max: [100, 'Budget score cannot exceed 100']
    },
    lifestyleScore: {
      type: Number,
      min: [0, 'Lifestyle score cannot be negative'],
      max: [100, 'Lifestyle score cannot exceed 100']
    },
    amenityScore: {
      type: Number,
      min: [0, 'Amenity score cannot be negative'],
      max: [100, 'Amenity score cannot exceed 100']
    }
  },
  
  // Match details
  matchDetails: {
    isPerfectMatch: {
      type: Boolean,
      default: false
    },
    isGoodMatch: {
      type: Boolean,
      default: false
    },
    isAcceptableMatch: {
      type: Boolean,
      default: false
    },
    matchRank: {
      type: Number,
      min: [1, 'Match rank must be at least 1']
    }
  },
  
  // Reasons for match
  matchReasons: [{
    category: {
      type: String,
      enum: ['Safety', 'Education', 'Budget', 'Lifestyle', 'Amenities', 'Transportation', 'Demographics'],
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      min: [0, 'Reason score cannot be negative'],
      max: [100, 'Reason score cannot exceed 100']
    }
  }],
  
  // Potential concerns
  concerns: [{
    category: {
      type: String,
      enum: ['Safety', 'Education', 'Budget', 'Lifestyle', 'Amenities', 'Transportation', 'Demographics'],
      required: true
    },
    concern: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    }
  }],
  
  // User interaction
  userInteraction: {
    viewed: {
      type: Boolean,
      default: false
    },
    saved: {
      type: Boolean,
      default: false
    },
    contacted: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
matchSchema.index({ userId: 1, 'scores.overallScore': -1 });
matchSchema.index({ userId: 1, 'matchDetails.matchRank': 1 });
matchSchema.index({ neighborhoodId: 1 });

// Method to calculate match quality
matchSchema.methods.calculateMatchQuality = function() {
  const score = this.scores.overallScore;
  
  if (score >= 90) {
    this.matchDetails.isPerfectMatch = true;
    this.matchDetails.isGoodMatch = true;
    this.matchDetails.isAcceptableMatch = true;
  } else if (score >= 75) {
    this.matchDetails.isGoodMatch = true;
    this.matchDetails.isAcceptableMatch = true;
  } else if (score >= 60) {
    this.matchDetails.isAcceptableMatch = true;
  }
  
  return this.matchDetails;
};

// Method to get match summary
matchSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    neighborhoodId: this.neighborhoodId,
    overallScore: this.scores.overallScore,
    matchQuality: this.calculateMatchQuality(),
    rank: this.matchDetails.matchRank
  };
};

// Method to update user interaction
matchSchema.methods.updateInteraction = function(interaction) {
  this.userInteraction = { ...this.userInteraction, ...interaction };
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Match', matchSchema); 