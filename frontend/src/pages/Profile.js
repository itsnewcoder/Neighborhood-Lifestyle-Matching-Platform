import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your account information and settings
      </Typography>
      
      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          Profile Feature Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          This feature will allow you to view and edit your profile information, 
          change your password, and manage your account settings.
        </Typography>
        
        {user && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Current User Information:
            </Typography>
            <Typography variant="body2">
              Name: {user.firstName} {user.lastName}
            </Typography>
            <Typography variant="body2">
              Email: {user.email}
            </Typography>
            {user.age && (
              <Typography variant="body2">
                Age: {user.age}
              </Typography>
            )}
            {user.occupation && (
              <Typography variant="body2">
                Occupation: {user.occupation}
              </Typography>
            )}
          </Box>
        )}
        
        <Button 
          variant="contained" 
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Profile; 