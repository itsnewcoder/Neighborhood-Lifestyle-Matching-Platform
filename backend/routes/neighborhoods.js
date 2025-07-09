const express = require('express');
const { query, validationResult } = require('express-validator');
const Neighborhood = require('../models/Neighborhood');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all neighborhoods (with optional filtering)
router.get('/', [
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('minSafety').optional().isFloat({ min: 1, max: 10 }),
  query('maxSafety').optional().isFloat({ min: 1, max: 10 }),
  query('minHomePrice').optional().isFloat({ min: 0 }),
  query('maxHomePrice').optional().isFloat({ min: 0 }),
  query('minSchoolRating').optional().isFloat({ min: 1, max: 10 }),
  query('maxSchoolRating').optional().isFloat({ min: 1, max: 10 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['name', 'safety', 'price', 'schools', 'walkability'])
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { 
      city, 
      state, 
      minSafety, 
      maxSafety, 
      minHomePrice, 
      maxHomePrice, 
      minSchoolRating, 
      maxSchoolRating,
      limit = 20,
      sort = 'name'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (city) {
      filter.city = { $regex: city, $options: 'i' };
    }
    
    if (state) {
      filter.state = { $regex: state, $options: 'i' };
    }
    
    if (minSafety || maxSafety) {
      filter['safety.safetyRating'] = {};
      if (minSafety) filter['safety.safetyRating'].$gte = parseFloat(minSafety);
      if (maxSafety) filter['safety.safetyRating'].$lte = parseFloat(maxSafety);
    }
    
    if (minHomePrice || maxHomePrice) {
      filter['housing.medianHomePrice'] = {};
      if (minHomePrice) filter['housing.medianHomePrice'].$gte = parseFloat(minHomePrice);
      if (maxHomePrice) filter['housing.medianHomePrice'].$lte = parseFloat(maxHomePrice);
    }
    
    if (minSchoolRating || maxSchoolRating) {
      filter['education.schoolRating'] = {};
      if (minSchoolRating) filter['education.schoolRating'].$gte = parseFloat(minSchoolRating);
      if (maxSchoolRating) filter['education.schoolRating'].$lte = parseFloat(maxSchoolRating);
    }

    // Build sort object
    let sortObject = {};
    switch (sort) {
      case 'safety':
        sortObject = { 'safety.safetyRating': -1 };
        break;
      case 'price':
        sortObject = { 'housing.medianHomePrice': 1 };
        break;
      case 'schools':
        sortObject = { 'education.schoolRating': -1 };
        break;
      case 'walkability':
        sortObject = { 'transportation.walkabilityScore': -1 };
        break;
      default:
        sortObject = { name: 1 };
    }

    // Execute query
    const neighborhoods = await Neighborhood.find(filter)
      .sort(sortObject)
      .limit(parseInt(limit))
      .select('name city state zipCode safety education housing transportation amenities lifestyle costOfLiving description');

    // Calculate overall scores for each neighborhood
    const neighborhoodsWithScores = neighborhoods.map(neighborhood => {
      const summary = neighborhood.getSummary();
      return {
        ...summary,
        description: neighborhood.description,
        costOfLiving: neighborhood.costOfLiving
      };
    });

    res.json({
      count: neighborhoodsWithScores.length,
      neighborhoods: neighborhoodsWithScores
    });

  } catch (error) {
    console.error('Get neighborhoods error:', error);
    res.status(500).json({ 
      error: 'Failed to get neighborhoods' 
    });
  }
});

// Get specific neighborhood by ID
router.get('/:id', async (req, res) => {
  try {
    const neighborhood = await Neighborhood.findById(req.params.id);
    
    if (!neighborhood) {
      return res.status(404).json({ 
        error: 'Neighborhood not found' 
      });
    }

    res.json({
      neighborhood: neighborhood
    });

  } catch (error) {
    console.error('Get neighborhood error:', error);
    res.status(500).json({ 
      error: 'Failed to get neighborhood' 
    });
  }
});

// Search neighborhoods (protected route)
router.post('/search', authenticateToken, [
  query('query').notEmpty().withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { query: searchQuery, limit = 10 } = req.query;

    // Build search filter
    const searchFilter = {
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { city: { $regex: searchQuery, $options: 'i' } },
        { state: { $regex: searchQuery, $options: 'i' } },
        { zipCode: { $regex: searchQuery, $options: 'i' } }
      ]
    };

    // Execute search
    const neighborhoods = await Neighborhood.find(searchFilter)
      .limit(parseInt(limit))
      .select('name city state zipCode safety education housing transportation amenities lifestyle costOfLiving description');

    // Calculate overall scores for each neighborhood
    const neighborhoodsWithScores = neighborhoods.map(neighborhood => {
      const summary = neighborhood.getSummary();
      return {
        ...summary,
        description: neighborhood.description,
        costOfLiving: neighborhood.costOfLiving
      };
    });

    res.json({
      query: searchQuery,
      count: neighborhoodsWithScores.length,
      neighborhoods: neighborhoodsWithScores
    });

  } catch (error) {
    console.error('Search neighborhoods error:', error);
    res.status(500).json({ 
      error: 'Failed to search neighborhoods' 
    });
  }
});

// Get neighborhoods by city and state
router.get('/location/:city/:state', async (req, res) => {
  try {
    const { city, state } = req.params;
    const { limit = 20 } = req.query;

    const neighborhoods = await Neighborhood.find({
      city: { $regex: city, $options: 'i' },
      state: { $regex: state, $options: 'i' }
    })
    .limit(parseInt(limit))
    .select('name city state zipCode safety education housing transportation amenities lifestyle costOfLiving description');

    // Calculate overall scores for each neighborhood
    const neighborhoodsWithScores = neighborhoods.map(neighborhood => {
      const summary = neighborhood.getSummary();
      return {
        ...summary,
        description: neighborhood.description,
        costOfLiving: neighborhood.costOfLiving
      };
    });

    res.json({
      city,
      state,
      count: neighborhoodsWithScores.length,
      neighborhoods: neighborhoodsWithScores
    });

  } catch (error) {
    console.error('Get neighborhoods by location error:', error);
    res.status(500).json({ 
      error: 'Failed to get neighborhoods by location' 
    });
  }
});

// Get top neighborhoods by category
router.get('/top/:category', [
  query('limit').optional().isInt({ min: 1, max: 20 })
], async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    let sortField = '';
    let categoryName = '';

    // Determine sort field based on category
    switch (category) {
      case 'safety':
        sortField = 'safety.safetyRating';
        categoryName = 'Safety';
        break;
      case 'schools':
        sortField = 'education.schoolRating';
        categoryName = 'Education';
        break;
      case 'walkability':
        sortField = 'transportation.walkabilityScore';
        categoryName = 'Walkability';
        break;
      case 'affordable':
        sortField = 'housing.medianHomePrice';
        categoryName = 'Affordability';
        break;
      case 'family-friendly':
        sortField = 'lifestyle.familyFriendlyScore';
        categoryName = 'Family-Friendly';
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid category. Use: safety, schools, walkability, affordable, family-friendly' 
        });
    }

    const neighborhoods = await Neighborhood.find()
      .sort(category === 'affordable' ? { [sortField]: 1 } : { [sortField]: -1 })
      .limit(parseInt(limit))
      .select('name city state zipCode safety education housing transportation amenities lifestyle costOfLiving description');

    // Calculate overall scores for each neighborhood
    const neighborhoodsWithScores = neighborhoods.map(neighborhood => {
      const summary = neighborhood.getSummary();
      return {
        ...summary,
        description: neighborhood.description,
        costOfLiving: neighborhood.costOfLiving
      };
    });

    res.json({
      category: categoryName,
      count: neighborhoodsWithScores.length,
      neighborhoods: neighborhoodsWithScores
    });

  } catch (error) {
    console.error('Get top neighborhoods error:', error);
    res.status(500).json({ 
      error: 'Failed to get top neighborhoods' 
    });
  }
});

module.exports = router; 