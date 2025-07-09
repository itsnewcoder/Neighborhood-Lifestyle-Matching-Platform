import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Slider,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  DirectionsWalk as WalkIcon,
  LocalHospital as HospitalIcon,
  Restaurant as RestaurantIcon,
  School as SchoolIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const Preferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Form state
  const [preferences, setPreferences] = useState({
    budget: {
      minHomePrice: '',
      maxHomePrice: '',
      minRent: '',
      maxRent: ''
    },
    location: {
      preferredCities: [],
      preferredStates: [],
      preferredCitiesInput: '',
      preferredStatesInput: '',
      maxCommuteTime: 30,
      preferUrban: false,
      preferSuburban: false,
      preferRural: false
    },
    lifestyle: {
      safetyImportance: 8,
      educationImportance: 7,
      walkabilityImportance: 6,
      nightlifeImportance: 5,
      familyFriendlyImportance: 6,
      diversityImportance: 5
    },
    amenities: {
      restaurantsImportance: 6,
      groceryStoresImportance: 8,
      parksImportance: 6,
      hospitalsImportance: 7,
      shoppingImportance: 5
    },
    transportation: {
      publicTransitImportance: 6,
      bikeFriendlyImportance: 4,
      carDependency: 5
    },
    demographics: {
      preferredAgeRange: {
        min: 25,
        max: 65
      },
      preferredIncomeRange: {
        min: 30000,
        max: 150000
      },
      educationLevelImportance: 5
    },
    additional: {
      petFriendly: false,
      quietNeighborhood: false,
      communityEvents: false,
      outdoorActivities: false
    }
  });

  // Load existing preferences
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const response = await apiService.preferences.get(user._id || user.id);
        if (response.data.success && response.data.preferences) {
          setPreferences(response.data.preferences);
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Don't show error if preferences don't exist yet
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  const handleInputChange = (section, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, subsection, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleArrayChange = (section, field, value) => {
    // Allow spaces and commas, split by comma and trim each item
    // Only process when user finishes typing (not on every keystroke)
    const array = value.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(section, field, array);
  };

  const handleArrayInput = (section, field, value) => {
    // Store the raw input value for display
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [`${field}Input`]: value
      }
    }));
  };

  const handleArrayBlur = (section, field) => {
    // Process the array when user finishes editing
    const inputValue = preferences[section][`${field}Input`] || '';
    const array = inputValue.split(',').map(item => item.trim()).filter(item => item.length > 0);
    handleInputChange(section, field, array);
  };

  const handleSave = async () => {
    if (!user) return;

    // Basic validation
    const hasLocationPreferences = preferences.location.preferredCities.length > 0 || 
                                 preferences.location.preferredStates.length > 0;
    
    if (!hasLocationPreferences) {
      setError('Please add at least one preferred city or state');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = await apiService.preferences.save(preferences);
      if (response.data.success) {
        setMessage('Preferences saved successfully!');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const importanceMarks = [
    { value: 1, label: '1' },
    { value: 5, label: '5' },
    { value: 10, label: '10' }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Neighborhood Preferences
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Set your preferences to help us find the perfect neighborhood match for you.
        </Typography>
      </Paper>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {message}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Budget Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Budget Preferences</Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Home Price ($)"
                    type="number"
                    value={preferences.budget.minHomePrice}
                    onChange={(e) => handleInputChange('budget', 'minHomePrice', e.target.value)}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Home Price ($)"
                    type="number"
                    value={preferences.budget.maxHomePrice}
                    onChange={(e) => handleInputChange('budget', 'maxHomePrice', e.target.value)}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Rent ($)"
                    type="number"
                    value={preferences.budget.minRent}
                    onChange={(e) => handleInputChange('budget', 'minRent', e.target.value)}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Rent ($)"
                    type="number"
                    value={preferences.budget.maxRent}
                    onChange={(e) => handleInputChange('budget', 'maxRent', e.target.value)}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Location Preferences</Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Preferred Cities (comma-separated)"
                value={preferences.location.preferredCitiesInput || preferences.location.preferredCities.join(', ')}
                onChange={(e) => handleArrayInput('location', 'preferredCities', e.target.value)}
                onBlur={() => handleArrayBlur('location', 'preferredCities')}
                placeholder="e.g., New York, San Francisco, Boston"
                helperText="Enter city names separated by commas"
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Preferred States (comma-separated)"
                value={preferences.location.preferredStatesInput || preferences.location.preferredStates.join(', ')}
                onChange={(e) => handleArrayInput('location', 'preferredStates', e.target.value)}
                onBlur={() => handleArrayBlur('location', 'preferredStates')}
                placeholder="e.g., NY, CA, MA"
                helperText="Enter state abbreviations separated by commas"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Typography gutterBottom>
                  Max Commute Time: {preferences.location.maxCommuteTime} minutes
                </Typography>
                <Slider
                  value={preferences.location.maxCommuteTime}
                  onChange={(e, value) => handleInputChange('location', 'maxCommuteTime', value)}
                  min={5}
                  max={120}
                  marks={[
                    { value: 5, label: '5m' },
                    { value: 30, label: '30m' },
                    { value: 60, label: '60m' },
                    { value: 120, label: '120m' }
                  ]}
                  valueLabelDisplay="auto"
                  sx={{ mb: 1 }}
                />
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.location.preferUrban}
                        onChange={(e) => handleInputChange('location', 'preferUrban', e.target.checked)}
                      />
                    }
                    label="Urban"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.location.preferSuburban}
                        onChange={(e) => handleInputChange('location', 'preferSuburban', e.target.checked)}
                      />
                    }
                    label="Suburban"
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.location.preferRural}
                        onChange={(e) => handleInputChange('location', 'preferRural', e.target.checked)}
                      />
                    }
                    label="Rural"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Lifestyle Preferences */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Lifestyle Preferences</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Safety Importance: {preferences.lifestyle.safetyImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.safetyImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'safetyImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography gutterBottom>Education Importance: {preferences.lifestyle.educationImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.educationImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'educationImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography gutterBottom>Walkability Importance: {preferences.lifestyle.walkabilityImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.walkabilityImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'walkabilityImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography gutterBottom>Nightlife Importance: {preferences.lifestyle.nightlifeImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.nightlifeImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'nightlifeImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography gutterBottom>Family Friendly Importance: {preferences.lifestyle.familyFriendlyImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.familyFriendlyImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'familyFriendlyImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography gutterBottom>Diversity Importance: {preferences.lifestyle.diversityImportance}/10</Typography>
                  <Slider
                    value={preferences.lifestyle.diversityImportance}
                    onChange={(e, value) => handleInputChange('lifestyle', 'diversityImportance', value)}
                    min={1}
                    max={10}
                    marks={importanceMarks}
                    valueLabelDisplay="auto"
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Amenities Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <RestaurantIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Amenities Preferences</Typography>
              </Box>
              
              <Typography gutterBottom>Restaurants Importance: {preferences.amenities.restaurantsImportance}/10</Typography>
              <Slider
                value={preferences.amenities.restaurantsImportance}
                onChange={(e, value) => handleInputChange('amenities', 'restaurantsImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Grocery Stores Importance: {preferences.amenities.groceryStoresImportance}/10</Typography>
              <Slider
                value={preferences.amenities.groceryStoresImportance}
                onChange={(e, value) => handleInputChange('amenities', 'groceryStoresImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Parks Importance: {preferences.amenities.parksImportance}/10</Typography>
              <Slider
                value={preferences.amenities.parksImportance}
                onChange={(e, value) => handleInputChange('amenities', 'parksImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Hospitals Importance: {preferences.amenities.hospitalsImportance}/10</Typography>
              <Slider
                value={preferences.amenities.hospitalsImportance}
                onChange={(e, value) => handleInputChange('amenities', 'hospitalsImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Shopping Importance: {preferences.amenities.shoppingImportance}/10</Typography>
              <Slider
                value={preferences.amenities.shoppingImportance}
                onChange={(e, value) => handleInputChange('amenities', 'shoppingImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Transportation Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <WalkIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Transportation Preferences</Typography>
              </Box>
              
              <Typography gutterBottom>Public Transit Importance: {preferences.transportation.publicTransitImportance}/10</Typography>
              <Slider
                value={preferences.transportation.publicTransitImportance}
                onChange={(e, value) => handleInputChange('transportation', 'publicTransitImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Bike Friendly Importance: {preferences.transportation.bikeFriendlyImportance}/10</Typography>
              <Slider
                value={preferences.transportation.bikeFriendlyImportance}
                onChange={(e, value) => handleInputChange('transportation', 'bikeFriendlyImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              <Typography gutterBottom>Car Dependency: {preferences.transportation.carDependency}/10</Typography>
              <Slider
                value={preferences.transportation.carDependency}
                onChange={(e, value) => handleInputChange('transportation', 'carDependency', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Demographics Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Demographics Preferences</Typography>
              </Box>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Age"
                    type="number"
                    value={preferences.demographics.preferredAgeRange.min}
                    onChange={(e) => handleNestedChange('demographics', 'preferredAgeRange', 'min', parseInt(e.target.value))}
                    inputProps={{ min: 18, max: 120 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Age"
                    type="number"
                    value={preferences.demographics.preferredAgeRange.max}
                    onChange={(e) => handleNestedChange('demographics', 'preferredAgeRange', 'max', parseInt(e.target.value))}
                    inputProps={{ min: 18, max: 120 }}
                  />
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Min Income ($)"
                    type="number"
                    value={preferences.demographics.preferredIncomeRange.min}
                    onChange={(e) => handleNestedChange('demographics', 'preferredIncomeRange', 'min', parseInt(e.target.value))}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Max Income ($)"
                    type="number"
                    value={preferences.demographics.preferredIncomeRange.max}
                    onChange={(e) => handleNestedChange('demographics', 'preferredIncomeRange', 'max', parseInt(e.target.value))}
                    InputProps={{ startAdornment: '$' }}
                  />
                </Grid>
              </Grid>
              
              <Typography gutterBottom>Education Level Importance</Typography>
              <Slider
                value={preferences.demographics.educationLevelImportance}
                onChange={(e, value) => handleInputChange('demographics', 'educationLevelImportance', value)}
                min={1}
                max={10}
                marks={importanceMarks}
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Preferences */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Additional Preferences</Typography>
              </Box>
              
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.additional.petFriendly}
                        onChange={(e) => handleNestedChange('additional', 'petFriendly', 'petFriendly', e.target.checked)}
                      />
                    }
                    label="Pet Friendly"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.additional.quietNeighborhood}
                        onChange={(e) => handleNestedChange('additional', 'quietNeighborhood', 'quietNeighborhood', e.target.checked)}
                      />
                    }
                    label="Quiet Neighborhood"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.additional.communityEvents}
                        onChange={(e) => handleNestedChange('additional', 'communityEvents', 'communityEvents', e.target.checked)}
                      />
                    }
                    label="Community Events"
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={preferences.additional.outdoorActivities}
                        onChange={(e) => handleNestedChange('additional', 'outdoorActivities', 'outdoorActivities', e.target.checked)}
                      />
                    }
                    label="Outdoor Activities"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ minWidth: 200 }}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Preferences'}
        </Button>
      </Box>
    </Box>
  );
};

export default Preferences; 