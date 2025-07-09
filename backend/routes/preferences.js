const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Preference = require('../models/Preference');
const { body, validationResult } = require('express-validator');

/**
 * @route   POST /api/preferences
 * @desc    Save user preferences
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const preferenceData = req.body;
    
    // Debug: Log the incoming data
    console.log('Received preference data:', JSON.stringify(preferenceData, null, 2));

    // Clean and preprocess data
    if (preferenceData.budget) {
      if (preferenceData.budget.minHomePrice === '' || preferenceData.budget.minHomePrice === null) preferenceData.budget.minHomePrice = null;
      if (preferenceData.budget.maxHomePrice === '' || preferenceData.budget.maxHomePrice === null) preferenceData.budget.maxHomePrice = null;
      if (preferenceData.budget.minRent === '' || preferenceData.budget.minRent === null) preferenceData.budget.minRent = null;
      if (preferenceData.budget.maxRent === '' || preferenceData.budget.maxRent === null) preferenceData.budget.maxRent = null;
    }
    
    // Clean location arrays
    if (preferenceData.location) {
      if (!Array.isArray(preferenceData.location.preferredCities)) {
        preferenceData.location.preferredCities = [];
      }
      if (!Array.isArray(preferenceData.location.preferredStates)) {
        preferenceData.location.preferredStates = [];
      }
    }
    
    // Convert string numbers to actual numbers for all importance fields
    if (preferenceData.lifestyle) {
      Object.keys(preferenceData.lifestyle).forEach(key => {
        if (typeof preferenceData.lifestyle[key] === 'string') {
          preferenceData.lifestyle[key] = parseInt(preferenceData.lifestyle[key]) || 5;
        }
      });
    }
    
    if (preferenceData.amenities) {
      Object.keys(preferenceData.amenities).forEach(key => {
        if (typeof preferenceData.amenities[key] === 'string') {
          preferenceData.amenities[key] = parseInt(preferenceData.amenities[key]) || 5;
        }
      });
    }
    
    if (preferenceData.transportation) {
      Object.keys(preferenceData.transportation).forEach(key => {
        if (typeof preferenceData.transportation[key] === 'string') {
          preferenceData.transportation[key] = parseInt(preferenceData.transportation[key]) || 5;
        }
      });
    }
    
    if (preferenceData.demographics?.educationLevelImportance) {
      if (typeof preferenceData.demographics.educationLevelImportance === 'string') {
        preferenceData.demographics.educationLevelImportance = parseInt(preferenceData.demographics.educationLevelImportance) || 5;
      }
    }
    
    if (preferenceData.demographics?.preferredAgeRange) {
      if (preferenceData.demographics.preferredAgeRange.min === '') preferenceData.demographics.preferredAgeRange.min = null;
      if (preferenceData.demographics.preferredAgeRange.max === '') preferenceData.demographics.preferredAgeRange.max = null;
    }
    
    if (preferenceData.demographics?.preferredIncomeRange) {
      if (preferenceData.demographics.preferredIncomeRange.min === '') preferenceData.demographics.preferredIncomeRange.min = null;
      if (preferenceData.demographics.preferredIncomeRange.max === '') preferenceData.demographics.preferredIncomeRange.max = null;
    }
    
    // Preprocess boolean values
    if (preferenceData.additional) {
      if (preferenceData.additional.petFriendly === 'true') preferenceData.additional.petFriendly = true;
      if (preferenceData.additional.petFriendly === 'false') preferenceData.additional.petFriendly = false;
      if (preferenceData.additional.quietNeighborhood === 'true') preferenceData.additional.quietNeighborhood = true;
      if (preferenceData.additional.quietNeighborhood === 'false') preferenceData.additional.quietNeighborhood = false;
      if (preferenceData.additional.communityEvents === 'true') preferenceData.additional.communityEvents = true;
      if (preferenceData.additional.communityEvents === 'false') preferenceData.additional.communityEvents = false;
      if (preferenceData.additional.outdoorActivities === 'true') preferenceData.additional.outdoorActivities = true;
      if (preferenceData.additional.outdoorActivities === 'false') preferenceData.additional.outdoorActivities = false;
    }
    
    // Also handle location boolean values
    if (preferenceData.location) {
      if (preferenceData.location.preferUrban === 'true') preferenceData.location.preferUrban = true;
      if (preferenceData.location.preferUrban === 'false') preferenceData.location.preferUrban = false;
      if (preferenceData.location.preferSuburban === 'true') preferenceData.location.preferSuburban = true;
      if (preferenceData.location.preferSuburban === 'false') preferenceData.location.preferSuburban = false;
      if (preferenceData.location.preferRural === 'true') preferenceData.location.preferRural = true;
      if (preferenceData.location.preferRural === 'false') preferenceData.location.preferRural = false;
    }

    // Check if user already has preferences
    let preferences = await Preference.findOne({ userId });

    if (preferences) {
      // Update existing preferences
      Object.assign(preferences, preferenceData);
      await preferences.save();
    } else {
      // Create new preferences
      try {
        preferences = new Preference({
          userId,
          ...preferenceData
        });
        await preferences.save();
      } catch (saveError) {
        console.error('Error saving preferences:', saveError);
        return res.status(400).json({ 
          error: 'Failed to save preferences', 
          details: saveError.message 
        });
      }
    }

    res.json({
      success: true,
      preferences,
      message: 'Preferences saved successfully'
    });

  } catch (error) {
    console.error('Save preferences error:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

/**
 * @route   GET /api/preferences/:userId
 * @desc    Get user preferences
 * @access  Private
 */
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is requesting their own preferences or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view these preferences' });
    }

    const preferences = await Preference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    res.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * @route   PUT /api/preferences/:userId
 * @desc    Update user preferences
 * @access  Private
 */
router.put('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // Clean and preprocess data
    if (updateData.budget) {
      if (updateData.budget.minHomePrice === '' || updateData.budget.minHomePrice === null) updateData.budget.minHomePrice = null;
      if (updateData.budget.maxHomePrice === '' || updateData.budget.maxHomePrice === null) updateData.budget.maxHomePrice = null;
      if (updateData.budget.minRent === '' || updateData.budget.minRent === null) updateData.budget.minRent = null;
      if (updateData.budget.maxRent === '' || updateData.budget.maxRent === null) updateData.budget.maxRent = null;
    }
    
    // Clean location arrays
    if (updateData.location) {
      if (!Array.isArray(updateData.location.preferredCities)) {
        updateData.location.preferredCities = [];
      }
      if (!Array.isArray(updateData.location.preferredStates)) {
        updateData.location.preferredStates = [];
      }
    }
    
    // Convert string numbers to actual numbers for all importance fields
    if (updateData.lifestyle) {
      Object.keys(updateData.lifestyle).forEach(key => {
        if (typeof updateData.lifestyle[key] === 'string') {
          updateData.lifestyle[key] = parseInt(updateData.lifestyle[key]) || 5;
        }
      });
    }
    
    if (updateData.amenities) {
      Object.keys(updateData.amenities).forEach(key => {
        if (typeof updateData.amenities[key] === 'string') {
          updateData.amenities[key] = parseInt(updateData.amenities[key]) || 5;
        }
      });
    }
    
    if (updateData.transportation) {
      Object.keys(updateData.transportation).forEach(key => {
        if (typeof updateData.transportation[key] === 'string') {
          updateData.transportation[key] = parseInt(updateData.transportation[key]) || 5;
        }
      });
    }
    
    if (updateData.demographics?.educationLevelImportance) {
      if (typeof updateData.demographics.educationLevelImportance === 'string') {
        updateData.demographics.educationLevelImportance = parseInt(updateData.demographics.educationLevelImportance) || 5;
      }
    }
    
    if (updateData.demographics?.preferredAgeRange) {
      if (updateData.demographics.preferredAgeRange.min === '') updateData.demographics.preferredAgeRange.min = null;
      if (updateData.demographics.preferredAgeRange.max === '') updateData.demographics.preferredAgeRange.max = null;
    }
    
    if (updateData.demographics?.preferredIncomeRange) {
      if (updateData.demographics.preferredIncomeRange.min === '') updateData.demographics.preferredIncomeRange.min = null;
      if (updateData.demographics.preferredIncomeRange.max === '') updateData.demographics.preferredIncomeRange.max = null;
    }

    // Preprocess boolean values
    if (updateData.additional) {
      if (updateData.additional.petFriendly === 'true') updateData.additional.petFriendly = true;
      if (updateData.additional.petFriendly === 'false') updateData.additional.petFriendly = false;
      if (updateData.additional.quietNeighborhood === 'true') updateData.additional.quietNeighborhood = true;
      if (updateData.additional.quietNeighborhood === 'false') updateData.additional.quietNeighborhood = false;
      if (updateData.additional.communityEvents === 'true') updateData.additional.communityEvents = true;
      if (updateData.additional.communityEvents === 'false') updateData.additional.communityEvents = false;
      if (updateData.additional.outdoorActivities === 'true') updateData.additional.outdoorActivities = true;
      if (updateData.additional.outdoorActivities === 'false') updateData.additional.outdoorActivities = false;
    }
    
    // Also handle location boolean values
    if (updateData.location) {
      if (updateData.location.preferUrban === 'true') updateData.location.preferUrban = true;
      if (updateData.location.preferUrban === 'false') updateData.location.preferUrban = false;
      if (updateData.location.preferSuburban === 'true') updateData.location.preferSuburban = true;
      if (updateData.location.preferSuburban === 'false') updateData.location.preferSuburban = false;
      if (updateData.location.preferRural === 'true') updateData.location.preferRural = true;
      if (updateData.location.preferRural === 'false') updateData.location.preferRural = false;
    }

    // Check if user is updating their own preferences or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update these preferences' });
    }

    const preferences = await Preference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    // Update preferences
    Object.assign(preferences, updateData);
    await preferences.save();

    res.json({
      success: true,
      preferences,
      message: 'Preferences updated successfully'
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

/**
 * @route   GET /api/preferences/:userId/summary
 * @desc    Get preference summary for matching algorithm
 * @access  Private
 */
router.get('/:userId/summary', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check authorization
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const preferences = await Preference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    // Create summary for matching algorithm
    const summary = {
      budget: {
        hasBudget: !!(preferences.budget?.maxHomePrice || preferences.budget?.maxRent),
        maxHomePrice: preferences.budget?.maxHomePrice,
        maxRent: preferences.budget?.maxRent
      },
      location: {
        hasLocationPreferences: !!(preferences.location?.preferredCities?.length || 
                                 preferences.location?.preferredStates?.length),
        preferredCities: preferences.location?.preferredCities || [],
        preferredStates: preferences.location?.preferredStates || []
      },
      lifestyle: {
        topPriorities: this.getTopPriorities(preferences.lifestyle),
        averageImportance: this.calculateAverageImportance(preferences.lifestyle)
      },
      amenities: {
        topPriorities: this.getTopPriorities(preferences.amenities),
        averageImportance: this.calculateAverageImportance(preferences.amenities)
      },
      transportation: {
        topPriorities: this.getTopPriorities(preferences.transportation),
        averageImportance: this.calculateAverageImportance(preferences.transportation)
      },
      demographics: {
        hasAgeRange: !!(preferences.demographics?.preferredAgeRange?.min || 
                       preferences.demographics?.preferredAgeRange?.max),
        hasIncomeRange: !!(preferences.demographics?.preferredIncomeRange?.min || 
                          preferences.demographics?.preferredIncomeRange?.max)
      }
    };

    res.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Get preference summary error:', error);
    res.status(500).json({ error: 'Failed to get preference summary' });
  }
});

/**
 * @route   DELETE /api/preferences/:userId
 * @desc    Delete user preferences
 * @access  Private
 */
router.delete('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user is deleting their own preferences or is admin
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete these preferences' });
    }

    const preferences = await Preference.findOne({ userId });

    if (!preferences) {
      return res.status(404).json({ error: 'Preferences not found' });
    }

    await Preference.findByIdAndDelete(preferences._id);

    res.json({
      success: true,
      message: 'Preferences deleted successfully'
    });

  } catch (error) {
    console.error('Delete preferences error:', error);
    res.status(500).json({ error: 'Failed to delete preferences' });
  }
});

// Helper functions
function getTopPriorities(preferences, limit = 3) {
  if (!preferences) return [];
  
  const priorities = Object.entries(preferences)
    .filter(([key, value]) => key.includes('Importance') && typeof value === 'number')
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([key]) => key.replace('Importance', ''));

  return priorities;
}

function calculateAverageImportance(preferences) {
  if (!preferences) return 0;
  
  const importanceValues = Object.values(preferences)
    .filter(value => typeof value === 'number' && value > 0);
  
  if (importanceValues.length === 0) return 0;
  
  return importanceValues.reduce((sum, value) => sum + value, 0) / importanceValues.length;
}

module.exports = router; 