import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
  Paper,
  Stack
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  School as SchoolIcon,
  DirectionsWalk as WalkIcon,
  Restaurant as RestaurantIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Smart Matching',
      description: 'Our advanced algorithm matches you with neighborhoods based on your lifestyle preferences and requirements.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Safety First',
      description: 'Comprehensive safety ratings and crime statistics to help you make informed decisions.'
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Education Quality',
      description: 'Detailed school ratings and educational opportunities for families with children.'
    },
    {
      icon: <WalkIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Walkability Score',
      description: 'Evaluate neighborhoods based on walkability, public transit, and bike-friendliness.'
    },
    {
      icon: <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Amenities',
      description: 'Find neighborhoods with the amenities that matter most to you - restaurants, parks, shopping, and more.'
    },
    {
      icon: <HomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Housing Data',
      description: 'Comprehensive housing information including prices, rental rates, and market trends.'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                Find Your Perfect Neighborhood
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
                Discover neighborhoods that match your lifestyle, preferences, and budget using our advanced matching algorithm.
              </Typography>
              <Stack direction="row" spacing={2}>
                {isAuthenticated ? (
                  <Button
                    variant="contained"
                    size="large"
                    color="secondary"
                    onClick={() => navigate('/dashboard')}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Go to Dashboard
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      color="secondary"
                      onClick={() => navigate('/register')}
                      sx={{ 
                        bgcolor: 'white', 
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/neighborhoods')}
                      sx={{ 
                        borderColor: 'white', 
                        color: 'white',
                        '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
                      }}
                    >
                      Browse Neighborhoods
                    </Button>
                  </>
                )}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  p: 3,
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Typography variant="h6" gutterBottom>
                  How it works:
                </Typography>
                <Box component="ul" sx={{ pl: 2 }}>
                  <Typography component="li" sx={{ mb: 1 }}>
                    Create your profile and set your preferences
                  </Typography>
                  <Typography component="li" sx={{ mb: 1 }}>
                    Our algorithm analyzes thousands of neighborhoods
                  </Typography>
                  <Typography component="li" sx={{ mb: 1 }}>
                    Get personalized matches with detailed insights
                  </Typography>
                  <Typography component="li">
                    Make informed decisions about your next home
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose NeighborFit?
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          We use data-driven insights to help you find the perfect neighborhood match
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Paper sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="md">
          <Box textAlign="center">
            <Typography variant="h4" component="h2" gutterBottom>
              Ready to Find Your Perfect Neighborhood?
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
              Join thousands of users who have found their ideal neighborhood match
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              {isAuthenticated ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/matches')}
                >
                  View Your Matches
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Sign Up Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/login')}
                  >
                    Already have an account?
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Container>
      </Paper>
    </Box>
  );
};

export default Home; 