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
  Chip,
  LinearProgress,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  DirectionsWalk as WalkIcon,
  LocalHospital as HospitalIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Matches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [analysisDialog, setAnalysisDialog] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Load matches
  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await api.get(`/matches/${user.id}?recalculate=true`);
      if (response.data.success) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const refreshMatches = async () => {
    if (!user) return;
    
    setRefreshing(true);
    setError('');
    
    try {
      const response = await api.post('/matches/calculate', { limit: 10 });
      if (response.data.success) {
        setMatches(response.data.matches);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to refresh matches');
    } finally {
      setRefreshing(false);
    }
  };

  const handleMatchInteraction = async (matchId, action) => {
    try {
      await api.put(`/matches/${matchId}/interaction`, { action });
      // Update local state to reflect the change
      setMatches(prev => prev.map(match => 
        match.neighborhood._id === matchId 
          ? { ...match, interaction: action }
          : match
      ));
    } catch (error) {
      console.error('Failed to update match interaction:', error);
    }
  };

  const handleViewAnalysis = async (neighborhoodId) => {
    if (!user) return;
    
    setAnalyzing(true);
    try {
      const response = await api.get(`/matches/${user.id}/analysis/${neighborhoodId}`);
      if (response.data.success) {
        setAnalysisData(response.data.analysis);
        setAnalysisDialog(true);
      }
    } catch (error) {
      console.error('Failed to load analysis:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getCompatibilityColor = (score) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'success';
    if (score >= 0.6) return 'warning';
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
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Your Neighborhood Matches
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshMatches}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Matches'}
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Based on your preferences, here are the best neighborhood matches for you.
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {matches.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No matches found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Try updating your preferences to get better matches.
          </Typography>
          <Button variant="contained" href="/preferences">
            Update Preferences
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {matches.map((match, index) => (
            <Grid item xs={12} md={6} lg={4} key={match.neighborhood._id}>
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
                        {match.neighborhood.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.neighborhood.city}, {match.neighborhood.state}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`#${match.rank}`}
                      color="primary"
                      size="small"
                    />
                  </Box>

                  {/* Compatibility Score */}
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" fontWeight="bold">
                        Compatibility
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color={`${getCompatibilityColor(match.compatibility)}.main`}>
                        {match.compatibility}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={match.compatibility}
                      color={getCompatibilityColor(match.compatibility)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>

                  {/* Key Metrics */}
                  <Grid container spacing={1} sx={{ mb: 2 }}>
                    {match.neighborhood.housing?.medianHomePrice && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <HomeIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(match.neighborhood.housing.medianHomePrice)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {match.neighborhood.safety?.safetyRating && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <SecurityIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Safety: {match.neighborhood.safety.safetyRating}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {match.neighborhood.education?.schoolRating && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <SchoolIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Schools: {match.neighborhood.education.schoolRating}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    
                    {match.neighborhood.transportation?.walkabilityScore && (
                      <Grid item xs={6}>
                        <Box display="flex" alignItems="center">
                          <WalkIcon sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Walk: {match.neighborhood.transportation.walkabilityScore}/10
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>

                  {/* Score Breakdown */}
                  <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="body2" fontWeight="bold">
                        Score Breakdown
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Budget: {Math.round(match.scores.budget * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={match.scores.budget * 100}
                            color={getScoreColor(match.scores.budget)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Lifestyle: {Math.round(match.scores.lifestyle * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={match.scores.lifestyle * 100}
                            color={getScoreColor(match.scores.lifestyle)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Location: {Math.round(match.scores.location * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={match.scores.location * 100}
                            color={getScoreColor(match.scores.location)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Amenities: {Math.round(match.scores.amenities * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={match.scores.amenities * 100}
                            color={getScoreColor(match.scores.amenities)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Safety: {Math.round(match.scores.safety * 100)}%
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={match.scores.safety * 100}
                            color={getScoreColor(match.scores.safety)}
                            sx={{ height: 4, borderRadius: 2 }}
                          />
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Tooltip title="Save Match">
                      <IconButton
                        size="small"
                        onClick={() => handleMatchInteraction(match.neighborhood._id, 'saved')}
                        color={match.interaction === 'saved' ? 'primary' : 'default'}
                      >
                        {match.interaction === 'saved' ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="View Analysis">
                      <IconButton
                        size="small"
                        onClick={() => handleViewAnalysis(match.neighborhood._id)}
                        disabled={analyzing}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleViewAnalysis(match.neighborhood._id)}
                    disabled={analyzing}
                  >
                    Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Analysis Dialog */}
      <Dialog 
        open={analysisDialog} 
        onClose={() => setAnalysisDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
            Detailed Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          {analysisData && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {analysisData.neighborhood.name}
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Compatibility Analysis
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Overall Compatibility"
                        secondary={`${analysisData.compatibility}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Budget Score"
                        secondary={`${Math.round(analysisData.scores.budget * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Lifestyle Score"
                        secondary={`${Math.round(analysisData.scores.lifestyle * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Location Score"
                        secondary={`${Math.round(analysisData.scores.location * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Amenities Score"
                        secondary={`${Math.round(analysisData.scores.amenities * 100)}%`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Safety Score"
                        secondary={`${Math.round(analysisData.scores.safety * 100)}%`}
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Recommendations
                  </Typography>
                  {analysisData.recommendations.length > 0 ? (
                    <List dense>
                      {analysisData.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      This neighborhood matches your preferences well!
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalysisDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Matches; 