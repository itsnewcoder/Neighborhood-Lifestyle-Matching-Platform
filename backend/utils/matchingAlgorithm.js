const Neighborhood = require('../models/Neighborhood');
const Preference = require('../models/Preference');

/**
 * Advanced Neighborhood Matching Algorithm
 * 
 * This algorithm implements a weighted scoring system that considers:
 * 1. Budget compatibility (30% weight)
 * 2. Lifestyle preferences (25% weight)
 * 3. Location preferences (20% weight)
 * 4. Amenities and transportation (15% weight)
 * 5. Safety and demographics (10% weight)
 * 
 * The algorithm uses real-world data processing and handles edge cases
 * like missing data, outliers, and data inconsistencies.
 */

class NeighborhoodMatchingAlgorithm {
  constructor() {
    this.weights = {
      budget: 0.30,
      lifestyle: 0.25,
      location: 0.20,
      amenities: 0.15,
      safety: 0.10
    };
  }

  /**
   * Calculate budget compatibility score
   * Handles edge cases like missing price data and outliers
   */
  calculateBudgetScore(neighborhood, preferences) {
    const { budget } = preferences;
    const { housing } = neighborhood;
    
    let score = 0;
    let factors = 0;

    // Home price compatibility
    if (housing.medianHomePrice && budget.maxHomePrice) {
      const priceRatio = housing.medianHomePrice / budget.maxHomePrice;
      if (priceRatio <= 1.0) {
        score += Math.max(0, 1 - priceRatio * 0.5); // Prefer neighborhoods within budget
      } else {
        score += Math.max(0, 1 - (priceRatio - 1) * 0.3); // Penalty for over-budget
      }
      factors++;
    }

    // Rent compatibility
    if (housing.medianRent && budget.maxRent) {
      const rentRatio = housing.medianRent / budget.maxRent;
      if (rentRatio <= 1.0) {
        score += Math.max(0, 1 - rentRatio * 0.5);
      } else {
        score += Math.max(0, 1 - (rentRatio - 1) * 0.3);
      }
      factors++;
    }

    // Cost of living consideration
    if (neighborhood.costOfLiving?.overallIndex) {
      const costScore = Math.max(0, 1 - (neighborhood.costOfLiving.overallIndex / 150));
      score += costScore;
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Calculate lifestyle compatibility score
   * Uses weighted scoring based on user preferences
   */
  calculateLifestyleScore(neighborhood, preferences) {
    const { lifestyle } = preferences;
    const { lifestyle: neighborhoodLifestyle } = neighborhood;
    
    let score = 0;
    let totalWeight = 0;

    // Safety importance
    if (lifestyle.safetyImportance && neighborhood.safety?.safetyRating) {
      const safetyScore = neighborhood.safety.safetyRating / 10;
      score += safetyScore * lifestyle.safetyImportance;
      totalWeight += lifestyle.safetyImportance;
    }

    // Education importance
    if (lifestyle.educationImportance && neighborhood.education?.schoolRating) {
      const educationScore = neighborhood.education.schoolRating / 10;
      score += educationScore * lifestyle.educationImportance;
      totalWeight += lifestyle.educationImportance;
    }

    // Walkability importance
    if (lifestyle.walkabilityImportance && neighborhood.transportation?.walkabilityScore) {
      const walkabilityScore = neighborhood.transportation.walkabilityScore / 10;
      score += walkabilityScore * lifestyle.walkabilityImportance;
      totalWeight += lifestyle.walkabilityImportance;
    }

    // Nightlife importance
    if (lifestyle.nightlifeImportance && neighborhoodLifestyle?.nightlifeScore) {
      const nightlifeScore = neighborhoodLifestyle.nightlifeScore / 10;
      score += nightlifeScore * lifestyle.nightlifeImportance;
      totalWeight += lifestyle.nightlifeImportance;
    }

    // Family friendly importance
    if (lifestyle.familyFriendlyImportance && neighborhoodLifestyle?.familyFriendlyScore) {
      const familyScore = neighborhoodLifestyle.familyFriendlyScore / 10;
      score += familyScore * lifestyle.familyFriendlyImportance;
      totalWeight += lifestyle.familyFriendlyImportance;
    }

    // Diversity importance
    if (lifestyle.diversityImportance && neighborhoodLifestyle?.diversityScore) {
      const diversityScore = neighborhoodLifestyle.diversityScore / 10;
      score += diversityScore * lifestyle.diversityImportance;
      totalWeight += lifestyle.diversityImportance;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Calculate location compatibility score
   * Handles geographic preferences and commute considerations
   */
  calculateLocationScore(neighborhood, preferences) {
    const { location } = preferences;
    let score = 0;
    let factors = 0;

    // Preferred cities
    if (location.preferredCities && location.preferredCities.length > 0) {
      const cityMatch = location.preferredCities.some(city => 
        neighborhood.city.toLowerCase().includes(city.toLowerCase())
      );
      score += cityMatch ? 1 : 0.3; // Bonus for preferred cities
      factors++;
    }

    // Preferred states
    if (location.preferredStates && location.preferredStates.length > 0) {
      const stateMatch = location.preferredStates.some(state => 
        neighborhood.state.toLowerCase().includes(state.toLowerCase())
      );
      score += stateMatch ? 1 : 0.3;
      factors++;
    }

    // Urban/Suburban/Rural preferences
    if (location.preferUrban || location.preferSuburban || location.preferRural) {
      // Simple heuristic based on population density
      const populationDensity = neighborhood.demographics?.totalPopulation || 0;
      
      if (location.preferUrban && populationDensity > 50000) {
        score += 1;
      } else if (location.preferSuburban && populationDensity > 10000 && populationDensity <= 50000) {
        score += 1;
      } else if (location.preferRural && populationDensity <= 10000) {
        score += 1;
      }
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Calculate amenities and transportation score
   * Considers proximity to essential services
   */
  calculateAmenitiesScore(neighborhood, preferences) {
    const { amenities, transportation } = preferences;
    const { amenities: neighborhoodAmenities, transportation: neighborhoodTransportation } = neighborhood;
    
    let score = 0;
    let totalWeight = 0;

    // Restaurant importance
    if (amenities.restaurantsImportance && neighborhoodAmenities?.restaurants) {
      const restaurantScore = Math.min(1, neighborhoodAmenities.restaurants / 50);
      score += restaurantScore * amenities.restaurantsImportance;
      totalWeight += amenities.restaurantsImportance;
    }

    // Grocery stores importance
    if (amenities.groceryStoresImportance && neighborhoodAmenities?.groceryStores) {
      const groceryScore = Math.min(1, neighborhoodAmenities.groceryStores / 10);
      score += groceryScore * amenities.groceryStoresImportance;
      totalWeight += amenities.groceryStoresImportance;
    }

    // Parks importance
    if (amenities.parksImportance && neighborhoodAmenities?.parks) {
      const parkScore = Math.min(1, neighborhoodAmenities.parks / 5);
      score += parkScore * amenities.parksImportance;
      totalWeight += amenities.parksImportance;
    }

    // Public transit importance
    if (transportation.publicTransitImportance && neighborhoodTransportation?.publicTransitScore) {
      const transitScore = neighborhoodTransportation.publicTransitScore / 10;
      score += transitScore * transportation.publicTransitImportance;
      totalWeight += transportation.publicTransitImportance;
    }

    // Bike friendly importance
    if (transportation.bikeFriendlyImportance && neighborhoodTransportation?.bikeScore) {
      const bikeScore = neighborhoodTransportation.bikeScore / 10;
      score += bikeScore * transportation.bikeFriendlyImportance;
      totalWeight += transportation.bikeFriendlyImportance;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Calculate safety and demographics score
   * Considers crime rates and demographic compatibility
   */
  calculateSafetyScore(neighborhood, preferences) {
    const { demographics } = preferences;
    let score = 0;
    let factors = 0;

    // Safety rating
    if (neighborhood.safety?.safetyRating) {
      score += neighborhood.safety.safetyRating / 10;
      factors++;
    }

    // Crime rate (inverse relationship)
    if (neighborhood.safety?.crimeRate) {
      const crimeScore = Math.max(0, 1 - (neighborhood.safety.crimeRate / 100));
      score += crimeScore;
      factors++;
    }

    // Age compatibility
    if (demographics?.preferredAgeRange && neighborhood.demographics?.medianAge) {
      const { min, max } = demographics.preferredAgeRange;
      const medianAge = neighborhood.demographics.medianAge;
      
      if (medianAge >= min && medianAge <= max) {
        score += 1;
      } else {
        const distance = Math.min(Math.abs(medianAge - min), Math.abs(medianAge - max));
        score += Math.max(0, 1 - distance / 20);
      }
      factors++;
    }

    // Income compatibility
    if (demographics?.preferredIncomeRange && neighborhood.demographics?.medianIncome) {
      const { min, max } = demographics.preferredIncomeRange;
      const medianIncome = neighborhood.demographics.medianIncome;
      
      if (medianIncome >= min && medianIncome <= max) {
        score += 1;
      } else {
        const distance = Math.min(Math.abs(medianIncome - min), Math.abs(medianIncome - max));
        score += Math.max(0, 1 - distance / 50000);
      }
      factors++;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Main matching function
   * Combines all scores with weighted algorithm
   */
  async findMatches(userId, limit = 10) {
    try {
      // Get user preferences
      const preferences = await Preference.findOne({ userId });
      if (!preferences) {
        throw new Error('User preferences not found');
      }

      // Get all neighborhoods
      const neighborhoods = await Neighborhood.find({});

      // Calculate scores for each neighborhood
      const scoredNeighborhoods = neighborhoods.map(neighborhood => {
        const budgetScore = this.calculateBudgetScore(neighborhood, preferences);
        const lifestyleScore = this.calculateLifestyleScore(neighborhood, preferences);
        const locationScore = this.calculateLocationScore(neighborhood, preferences);
        const amenitiesScore = this.calculateAmenitiesScore(neighborhood, preferences);
        const safetyScore = this.calculateSafetyScore(neighborhood, preferences);

        // Calculate weighted total score
        const totalScore = 
          budgetScore * this.weights.budget +
          lifestyleScore * this.weights.lifestyle +
          locationScore * this.weights.location +
          amenitiesScore * this.weights.amenities +
          safetyScore * this.weights.safety;

        return {
          neighborhood,
          scores: {
            total: totalScore,
            budget: budgetScore,
            lifestyle: lifestyleScore,
            location: locationScore,
            amenities: amenitiesScore,
            safety: safetyScore
          }
        };
      });

      // Sort by total score and return top matches
      const sortedMatches = scoredNeighborhoods
        .sort((a, b) => b.scores.total - a.scores.total)
        .slice(0, limit)
        .map((match, index) => ({
          rank: index + 1,
          neighborhood: match.neighborhood,
          scores: match.scores,
          compatibility: Math.round(match.scores.total * 100)
        }));

      return {
        success: true,
        matches: sortedMatches,
        algorithm: {
          weights: this.weights,
          totalNeighborhoods: neighborhoods.length,
          processedNeighborhoods: scoredNeighborhoods.length
        }
      };

    } catch (error) {
      console.error('Matching algorithm error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get detailed match analysis for a specific neighborhood
   */
  async getMatchAnalysis(userId, neighborhoodId) {
    try {
      const preferences = await Preference.findOne({ userId });
      const neighborhood = await Neighborhood.findById(neighborhoodId);

      if (!preferences || !neighborhood) {
        throw new Error('Preferences or neighborhood not found');
      }

      const budgetScore = this.calculateBudgetScore(neighborhood, preferences);
      const lifestyleScore = this.calculateLifestyleScore(neighborhood, preferences);
      const locationScore = this.calculateLocationScore(neighborhood, preferences);
      const amenitiesScore = this.calculateAmenitiesScore(neighborhood, preferences);
      const safetyScore = this.calculateSafetyScore(neighborhood, preferences);

      const totalScore = 
        budgetScore * this.weights.budget +
        lifestyleScore * this.weights.lifestyle +
        locationScore * this.weights.location +
        amenitiesScore * this.weights.amenities +
        safetyScore * this.weights.safety;

      return {
        success: true,
        analysis: {
          neighborhood,
          scores: {
            total: totalScore,
            budget: budgetScore,
            lifestyle: lifestyleScore,
            location: locationScore,
            amenities: amenitiesScore,
            safety: safetyScore
          },
          weights: this.weights,
          compatibility: Math.round(totalScore * 100),
          recommendations: this.generateRecommendations({
            budget: budgetScore,
            lifestyle: lifestyleScore,
            location: locationScore,
            amenities: amenitiesScore,
            safety: safetyScore
          })
        }
      };

    } catch (error) {
      console.error('Match analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate personalized recommendations based on scores
   */
  generateRecommendations(scores) {
    const recommendations = [];

    if (scores.budget < 0.5) {
      recommendations.push('Consider neighborhoods with lower housing costs');
    }

    if (scores.lifestyle < 0.5) {
      recommendations.push('Look for areas that better match your lifestyle preferences');
    }

    if (scores.location < 0.5) {
      recommendations.push('Expand your location preferences to find better matches');
    }

    if (scores.amenities < 0.5) {
      recommendations.push('Consider areas with more amenities and better transportation');
    }

    if (scores.safety < 0.5) {
      recommendations.push('Prioritize neighborhoods with better safety ratings');
    }

    return recommendations;
  }
}

module.exports = new NeighborhoodMatchingAlgorithm(); 