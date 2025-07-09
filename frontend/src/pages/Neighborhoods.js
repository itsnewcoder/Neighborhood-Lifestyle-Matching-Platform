import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  DirectionsWalk as WalkIcon,
  LocalHospital as HospitalIcon,
  Restaurant as RestaurantIcon,
  AttachMoney as MoneyIcon,
  TrendingUp as TrendingUpIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Neighborhoods = () => {
  const { user } = useAuth();
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [safetyRange, setSafetyRange] = useState([1, 10]);
  const [schoolRange, setSchoolRange] = useState([1, 10]);
  
  // Load neighborhoods
  useEffect(() => {
    loadNeighborhoods();
  }, []);

  const loadNeighborhoods = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get('/neighborhoods');
      if (response.data.success) {
        setNeighborhoods(response.data.neighborhoods);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load neighborhoods');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {};
      if (searchQuery) params.query = searchQuery;
      if (selectedCity) params.city = selectedCity;
      if (selectedState) params.state = selectedState;
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 1000000) params.maxPrice = priceRange[1];
      if (safetyRange[0] > 1) params.minSafety = safetyRange[0];
      if (safetyRange[1] < 10) params.maxSafety = safetyRange[1];
      if (schoolRange[0] > 1) params.minSchool = schoolRange[0];
      if (schoolRange[1] < 10) params.maxSchool = schoolRange[1];

      const response = await api.get('/neighborhoods', { params });
      if (response.data.success) {
        setNeighborhoods(response.data.neighborhoods);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to search neighborhoods');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setDetailDialog(true);
  };

  const handleSaveNeighborhood = async (neighborhoodId) => {
    if (!user) return;
    
    try {
      await api.put(`/matches/${neighborhoodId}/interaction`, { action: 'saved' });
      // Update local state to reflect the change
      setNeighborhoods(prev => prev.map(n => 
        n._id === neighborhoodId 
          ? { ...n, saved: true }
          : n
      ));
    } catch (error) {
      console.error('Failed to save neighborhood:', error);
    }
  };

  const getSafetyColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'warning';
    return 'error';
  };

  const getSchoolColor = (rating) => {
    if (rating >= 8) return 'success';
    if (rating >= 6) return 'warning';
    return 'error';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Get unique cities and states for filters
  const cities = [...new Set(neighborhoods.map(n => n.city))].sort();
  const states = [...new Set(neighborhoods.map(n => n.state))].sort();

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
          <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            Browse Neighborhoods
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Explore neighborhoods and find the perfect place for you.
        </Typography>
      </Paper>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search & Filter
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search neighborhoods"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>City</InputLabel>
              <Select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                label="City"
              >
                <MenuItem value="">All Cities</MenuItem>
                {cities.map(city => (
                  <MenuItem key={city} value={city}>{city}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>State</InputLabel>
              <Select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                label="State"
              >
                <MenuItem value="">All States</MenuItem>
                {states.map(state => (
                  <MenuItem key={state} value={state}>{state}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={(e, value) => setPriceRange(value)}
              min={0}
              max={1000000}
              step={50000}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatCurrency(value)}
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>Safety Rating</Typography>
            <Slider
              value={safetyRange}
              onChange={(e, value) => setSafetyRange(value)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Typography gutterBottom>School Rating</Typography>
            <Slider
              value={schoolRange}
              onChange={(e, value) => setSchoolRange(value)}
              min={1}
              max={10}
              step={1}
              valueLabelDisplay="auto"
            />
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<FilterIcon />}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Neighborhoods Grid */}
      {neighborhoods.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No neighborhoods found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try adjusting your search criteria.
          </Typography>
          <Button variant="contained" onClick={loadNeighborhoods}>
            Reset Search
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {neighborhoods.map((neighborhood) => (
            <Grid item xs={12} md={6} lg={4} key={neighborhood._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    transition: 'transform 0.2s ease-in-out',
                    boxShadow: 3
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {neighborhood.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {neighborhood.city}, {neighborhood.state}
                      </Typography>
                    </Box>
                    <Tooltip title="Save Neighborhood">
                      <IconButton
                        size="small"
                        onClick={() => handleSaveNeighborhood(neighborhood._id)}
                        color={neighborhood.saved ? 'primary' : 'default'}
                      >
                        {neighborhood.saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {/* Key Metrics */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {neighborhood.housing?.medianHomePrice && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <HomeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(neighborhood.housing.medianHomePrice)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {neighborhood.safety?.safetyRating && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <SecurityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Safety: {neighborhood.safety.safetyRating}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {neighborhood.education?.schoolRating && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Schools: {neighborhood.education.schoolRating}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {neighborhood.transportation?.walkabilityScore && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <WalkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Walk: {neighborhood.transportation.walkabilityScore}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Safety and School Ratings */}
                  {neighborhood.safety?.safetyRating && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Safety Rating
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={neighborhood.safety.safetyRating * 10}
                        color={getSafetyColor(neighborhood.safety.safetyRating)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}
                  
                  {neighborhood.education?.schoolRating && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        School Rating
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={neighborhood.education.schoolRating * 10}
                        color={getSchoolColor(neighborhood.education.schoolRating)}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  )}

                  {/* Demographics */}
                  {neighborhood.demographics?.totalPopulation && (
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Population: {formatNumber(neighborhood.demographics.totalPopulation)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>

                <CardActions>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewDetails(neighborhood)}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Neighborhood Details Dialog */}
      <Dialog 
        open={detailDialog} 
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 1, color: 'primary.main' }} />
            Neighborhood Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedNeighborhood && (
            <Box>
              <Typography variant="h5" gutterBottom>
                {selectedNeighborhood.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {selectedNeighborhood.city}, {selectedNeighborhood.state}
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Housing Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Housing
                  </Typography>
                  <List dense>
                    {selectedNeighborhood.housing?.medianHomePrice && (
                      <ListItem>
                        <ListItemText 
                          primary="Median Home Price"
                          secondary={formatCurrency(selectedNeighborhood.housing.medianHomePrice)}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.housing?.medianRent && (
                      <ListItem>
                        <ListItemText 
                          primary="Median Rent"
                          secondary={formatCurrency(selectedNeighborhood.housing.medianRent)}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.housing?.homeOwnershipRate && (
                      <ListItem>
                        <ListItemText 
                          primary="Home Ownership Rate"
                          secondary={`${selectedNeighborhood.housing.homeOwnershipRate}%`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {/* Safety Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Safety & Crime
                  </Typography>
                  <List dense>
                    {selectedNeighborhood.safety?.safetyRating && (
                      <ListItem>
                        <ListItemText 
                          primary="Safety Rating"
                          secondary={`${selectedNeighborhood.safety.safetyRating}/10`}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.safety?.crimeRate && (
                      <ListItem>
                        <ListItemText 
                          primary="Crime Rate"
                          secondary={`${selectedNeighborhood.safety.crimeRate} per 1000 residents`}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.safety?.policeStations && (
                      <ListItem>
                        <ListItemText 
                          primary="Police Stations"
                          secondary={selectedNeighborhood.safety.policeStations}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {/* Education Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Education
                  </Typography>
                  <List dense>
                    {selectedNeighborhood.education?.schoolRating && (
                      <ListItem>
                        <ListItemText 
                          primary="School Rating"
                          secondary={`${selectedNeighborhood.education.schoolRating}/10`}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.education?.schoolsNearby && (
                      <ListItem>
                        <ListItemText 
                          primary="Schools Nearby"
                          secondary={selectedNeighborhood.education.schoolsNearby}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.education?.universitiesNearby && (
                      <ListItem>
                        <ListItemText 
                          primary="Universities Nearby"
                          secondary={selectedNeighborhood.education.universitiesNearby}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {/* Transportation Information */}
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Transportation
                  </Typography>
                  <List dense>
                    {selectedNeighborhood.transportation?.publicTransitScore && (
                      <ListItem>
                        <ListItemText 
                          primary="Public Transit Score"
                          secondary={`${selectedNeighborhood.transportation.publicTransitScore}/10`}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.transportation?.walkabilityScore && (
                      <ListItem>
                        <ListItemText 
                          primary="Walkability Score"
                          secondary={`${selectedNeighborhood.transportation.walkabilityScore}/10`}
                        />
                      </ListItem>
                    )}
                    {selectedNeighborhood.transportation?.bikeScore && (
                      <ListItem>
                        <ListItemText 
                          primary="Bike Score"
                          secondary={`${selectedNeighborhood.transportation.bikeScore}/10`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                {/* Amenities Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedNeighborhood.amenities?.restaurants && (
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {selectedNeighborhood.amenities.restaurants} Restaurants
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedNeighborhood.amenities?.groceryStores && (
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <HospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {selectedNeighborhood.amenities.groceryStores} Grocery Stores
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedNeighborhood.amenities?.parks && (
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {selectedNeighborhood.amenities.parks} Parks
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {selectedNeighborhood.amenities?.hospitals && (
                      <Grid item xs={6} md={3}>
                        <Box textAlign="center">
                          <HospitalIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                          <Typography variant="body2">
                            {selectedNeighborhood.amenities.hospitals} Hospitals
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Neighborhoods; 