import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        {/* Logo/Brand */}
        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1, 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/')}
        >
          NeighborFit
        </Typography>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Home
          </Button>
          
          <Button
            color="inherit"
            onClick={() => navigate('/neighborhoods')}
          >
            Neighborhoods
          </Button>

          {isAuthenticated ? (
            <>
              <Button
                color="inherit"
                startIcon={<DashboardIcon />}
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate('/preferences')}
              >
                Preferences
              </Button>

              <Button
                color="inherit"
                onClick={() => navigate('/matches')}
              >
                Matches
              </Button>

              {/* User Menu */}
              <IconButton
                onClick={handleMenuOpen}
                sx={{ ml: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user?.firstName?.charAt(0) || 'U'}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleDashboard}>
                  <DashboardIcon sx={{ mr: 1 }} />
                  Dashboard
                </MenuItem>
                
                <MenuItem onClick={handleProfile}>
                  <PersonIcon sx={{ mr: 1 }} />
                  Profile
                </MenuItem>
                
                <MenuItem onClick={() => navigate('/preferences')}>
                  <SettingsIcon sx={{ mr: 1 }} />
                  Preferences
                </MenuItem>
                
                <Divider />
                
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate('/register')}
                sx={{ 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'secondary.dark'
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 