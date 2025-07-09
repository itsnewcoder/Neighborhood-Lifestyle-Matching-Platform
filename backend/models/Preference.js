const mongoose = require('mongoose');

const preferenceSchema = new mongoose.Schema({
  // Reference to user
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  
  // Budget preferences
  budget: {
    minHomePrice: {
      type: Number,
      min: [0, 'Minimum home price cannot be negative']
    },
    maxHomePrice: {
      type: Number,
      min: [0, 'Maximum home price cannot be negative']
    },
    minRent: {
      type: Number,
      min: [0, 'Minimum rent cannot be negative']
    },
    maxRent: {
      type: Number,
      min: [0, 'Maximum rent cannot be negative']
    }
  },
  
  // Location preferences
  location: {
    preferredCities: [{
      type: String,
      trim: true
    }],
    preferredStates: [{
      type: String,
      trim: true
    }],
    maxCommuteTime: {
      type: Number,
      min: [0, 'Maximum commute time cannot be negative']
    },
    preferUrban: {
      type: Boolean,
      default: false
    },
    preferSuburban: {
      type: Boolean,
      default: false
    },
    preferRural: {
      type: Boolean,
      default: false
    }
  },
  
  // Lifestyle preferences (1-10 scale)
  lifestyle: {
    safetyImportance: {
      type: Number,
      min: [1, 'Safety importance must be at least 1'],
      max: [10, 'Safety importance cannot exceed 10'],
      default: 8
    },
    educationImportance: {
      type: Number,
      min: [1, 'Education importance must be at least 1'],
      max: [10, 'Education importance cannot exceed 10'],
      default: 7
    },
    walkabilityImportance: {
      type: Number,
      min: [1, 'Walkability importance must be at least 1'],
      max: [10, 'Walkability importance cannot exceed 10'],
      default: 6
    },
    nightlifeImportance: {
      type: Number,
      min: [1, 'Nightlife importance must be at least 1'],
      max: [10, 'Nightlife importance cannot exceed 10'],
      default: 5
    },
    familyFriendlyImportance: {
      type: Number,
      min: [1, 'Family friendly importance must be at least 1'],
      max: [10, 'Family friendly importance cannot exceed 10'],
      default: 6
    },
    diversityImportance: {
      type: Number,
      min: [1, 'Diversity importance must be at least 1'],
      max: [10, 'Diversity importance cannot exceed 10'],
      default: 5
    }
  },
  
  // Amenity preferences
  amenities: {
    restaurantsImportance: {
      type: Number,
      min: [1, 'Restaurants importance must be at least 1'],
      max: [10, 'Restaurants importance cannot exceed 10'],
      default: 6
    },
    groceryStoresImportance: {
      type: Number,
      min: [1, 'Grocery stores importance must be at least 1'],
      max: [10, 'Grocery stores importance cannot exceed 10'],
      default: 8
    },
    parksImportance: {
      type: Number,
      min: [1, 'Parks importance must be at least 1'],
      max: [10, 'Parks importance cannot exceed 10'],
      default: 6
    },
    hospitalsImportance: {
      type: Number,
      min: [1, 'Hospitals importance must be at least 1'],
      max: [10, 'Hospitals importance cannot exceed 10'],
      default: 7
    },
    shoppingImportance: {
      type: Number,
      min: [1, 'Shopping importance must be at least 1'],
      max: [10, 'Shopping importance cannot exceed 10'],
      default: 5
    }
  },
  
  // Transportation preferences
  transportation: {
    publicTransitImportance: {
      type: Number,
      min: [1, 'Public transit importance must be at least 1'],
      max: [10, 'Public transit importance cannot exceed 10'],
      default: 6
    },
    bikeFriendlyImportance: {
      type: Number,
      min: [1, 'Bike friendly importance must be at least 1'],
      max: [10, 'Bike friendly importance cannot exceed 10'],
      default: 4
    },
    carDependency: {
      type: Number,
      min: [1, 'Car dependency must be at least 1'],
      max: [10, 'Car dependency cannot exceed 10'],
      default: 5
    }
  },
  
  // Demographics preferences
  demographics: {
    preferredAgeRange: {
      min: {
        type: Number,
        min: [18, 'Minimum age must be at least 18']
      },
      max: {
        type: Number,
        max: [120, 'Maximum age cannot exceed 120']
      }
    },
    preferredIncomeRange: {
      min: {
        type: Number,
        min: [0, 'Minimum income cannot be negative']
      },
      max: {
        type: Number,
        min: [0, 'Maximum income cannot be negative']
      }
    },
    educationLevelImportance: {
      type: Number,
      min: [1, 'Education level importance must be at least 1'],
      max: [10, 'Education level importance cannot exceed 10'],
      default: 5
    }
  },
  
  // Additional preferences
  additional: {
    petFriendly: {
      type: Boolean,
      default: false
    },
    quietNeighborhood: {
      type: Boolean,
      default: false
    },
    communityEvents: {
      type: Boolean,
      default: false
    },
    outdoorActivities: {
      type: Boolean,
      default: false
    },
    culturalDiversity: {
      type: Boolean,
      default: false
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

// Index for efficient user preference lookups
preferenceSchema.index({ userId: 1 });

// Method to calculate total preference score
preferenceSchema.methods.calculateTotalScore = function() {
  const scores = [
    this.lifestyle.safetyImportance,
    this.lifestyle.educationImportance,
    this.lifestyle.walkabilityImportance,
    this.lifestyle.familyFriendlyImportance,
    this.amenities.groceryStoresImportance,
    this.amenities.hospitalsImportance
  ];
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Method to get preference summary
preferenceSchema.methods.getSummary = function() {
  return {
    id: this._id,
    userId: this.userId,
    budget: this.budget,
    location: this.location,
    lifestyle: this.lifestyle,
    totalScore: this.calculateTotalScore()
  };
};

module.exports = mongoose.model('Preference', preferenceSchema); 