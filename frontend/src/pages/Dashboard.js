import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Favorite as FavoriteIcon,
  Settings as SettingsIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'View Matches',
      description: 'See your personalized neighborhood matches',
      icon: <LocationIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      action: () => navigate('/matches'),
      color: 'primary'
    },
    {
      title: 'Set Preferences',
      description: 'Update your lifestyle preferences',
      icon: <SettingsIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      action: () => navigate('/preferences'),
      color: 'secondary'
    },
    {
      title: 'Browse Neighborhoods',
      description: 'Explore all available neighborhoods',
      icon: <SearchIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      action: () => navigate('/neighborhoods'),
      color: 'success'
    },
    {
      title: 'Saved Matches',
      description: 'View your saved neighborhood matches',
      icon: <FavoriteIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      action: () => navigate('/matches'),
      color: 'error'
    }
  ];

  return (
    <Box>
      {/* Welcome Section */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.firstName || 'User'}!
        </Typography>
        <Typography variant="body1">
          Ready to find your perfect neighborhood? Let's get started with your personalized recommendations.
        </Typography>
      </Paper>

      {/* Quick Actions */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  transition: 'transform 0.2s ease-in-out',
                  boxShadow: 3
                }
              }}
              onClick={action.action}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {action.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Recent Activity
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No recent activity to display. Start by setting your preferences or browsing neighborhoods!
        </Typography>
      </Paper>
    </Box>
  );
};

export default Dashboard; 