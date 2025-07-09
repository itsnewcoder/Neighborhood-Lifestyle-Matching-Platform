const mongoose = require('mongoose');

const neighborhoodSchema = new mongoose.Schema({
  // Basic neighborhood information
  name: {
    type: String,
    required: [true, 'Neighborhood name is required'],
    trim: true,
    maxlength: [100, 'Neighborhood name cannot exceed 100 characters']
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  
  // Geographic information
  coordinates: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required']
    }
  },
  
  // Demographics
  demographics: {
    totalPopulation: {
      type: Number,
      min: [0, 'Population cannot be negative']
    },
    medianAge: {
      type: Number,
      min: [0, 'Median age cannot be negative']
    },
    medianIncome: {
      type: Number,
      min: [0, 'Median income cannot be negative']
    },
    educationLevel: {
      type: String,
      enum: ['High School', 'Some College', 'Bachelors', 'Graduate', 'Unknown'],
      default: 'Unknown'
    },
    familyHouseholds: {
      type: Number,
      min: [0, 'Family households cannot be negative']
    }
  },
  
  // Safety and crime data
  safety: {
    crimeRate: {
      type: Number,
      min: [0, 'Crime rate cannot be negative']
    },
    safetyRating: {
      type: Number,
      min: [1, 'Safety rating must be at least 1'],
      max: [10, 'Safety rating cannot exceed 10']
    },
    policeStations: {
      type: Number,
      min: [0, 'Police stations cannot be negative']
    }
  },
  
  // Housing information
  housing: {
    medianHomePrice: {
      type: Number,
      min: [0, 'Median home price cannot be negative']
    },
    medianRent: {
      type: Number,
      min: [0, 'Median rent cannot be negative']
    },
    homeOwnershipRate: {
      type: Number,
      min: [0, 'Home ownership rate cannot be negative'],
      max: [100, 'Home ownership rate cannot exceed 100']
    }
  },
  
  // Education
  education: {
    schoolRating: {
      type: Number,
      min: [1, 'School rating must be at least 1'],
      max: [10, 'School rating cannot exceed 10']
    },
    schoolsNearby: {
      type: Number,
      min: [0, 'Schools nearby cannot be negative']
    },
    universitiesNearby: {
      type: Number,
      min: [0, 'Universities nearby cannot be negative']
    }
  },
  
  // Transportation
  transportation: {
    publicTransitScore: {
      type: Number,
      min: [1, 'Public transit score must be at least 1'],
      max: [10, 'Public transit score cannot exceed 10']
    },
    walkabilityScore: {
      type: Number,
      min: [1, 'Walkability score must be at least 1'],
      max: [10, 'Walkability score cannot exceed 10']
    },
    bikeScore: {
      type: Number,
      min: [1, 'Bike score must be at least 1'],
      max: [10, 'Bike score cannot exceed 10']
    }
  },
  
  // Amenities
  amenities: {
    restaurants: {
      type: Number,
      min: [0, 'Restaurants cannot be negative']
    },
    groceryStores: {
      type: Number,
      min: [0, 'Grocery stores cannot be negative']
    },
    parks: {
      type: Number,
      min: [0, 'Parks cannot be negative']
    },
    hospitals: {
      type: Number,
      min: [0, 'Hospitals cannot be negative']
    },
    shoppingCenters: {
      type: Number,
      min: [0, 'Shopping centers cannot be negative']
    }
  },
  
  // Lifestyle factors
  lifestyle: {
    nightlifeScore: {
      type: Number,
      min: [1, 'Nightlife score must be at least 1'],
      max: [10, 'Nightlife score cannot exceed 10']
    },
    familyFriendlyScore: {
      type: Number,
      min: [1, 'Family friendly score must be at least 1'],
      max: [10, 'Family friendly score cannot exceed 10']
    },
    diversityScore: {
      type: Number,
      min: [1, 'Diversity score must be at least 1'],
      max: [10, 'Diversity score cannot exceed 10']
    }
  },
  
  // Cost of living
  costOfLiving: {
    overallIndex: {
      type: Number,
      min: [0, 'Cost of living index cannot be negative']
    },
    groceryIndex: {
      type: Number,
      min: [0, 'Grocery index cannot be negative']
    },
    housingIndex: {
      type: Number,
      min: [0, 'Housing index cannot be negative']
    },
    utilitiesIndex: {
      type: Number,
      min: [0, 'Utilities index cannot be negative']
    }
  },
  
  // Additional information
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Images and media
  images: [{
    url: String,
    caption: String
  }],
  
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
neighborhoodSchema.index({ city: 1, state: 1 });
neighborhoodSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
neighborhoodSchema.index({ 'safety.safetyRating': -1 });
neighborhoodSchema.index({ 'housing.medianHomePrice': 1 });

// Method to calculate overall score based on various factors
neighborhoodSchema.methods.calculateOverallScore = function() {
  const scores = [
    this.safety.safetyRating,
    this.education.schoolRating,
    this.transportation.walkabilityScore,
    this.lifestyle.familyFriendlyScore
  ];
  
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
};

// Method to get neighborhood summary
neighborhoodSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    city: this.city,
    state: this.state,
    safetyRating: this.safety.safetyRating,
    medianHomePrice: this.housing.medianHomePrice,
    schoolRating: this.education.schoolRating,
    walkabilityScore: this.transportation.walkabilityScore,
    overallScore: this.calculateOverallScore()
  };
};

module.exports = mongoose.model('Neighborhood', neighborhoodSchema); 