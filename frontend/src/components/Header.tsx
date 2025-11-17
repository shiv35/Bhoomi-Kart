import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button,
  styled
} from '@mui/material';
import {
  ShoppingCart,
  Search,
  Person,
  Dashboard,
  Receipt,
  Logout,
  Settings,
  Spa as SpaIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ROUTES } from '../utils/constants';

// Amazon-style search bar component
const AmazonSearchBar = styled('div')(({ theme }) => ({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  
  '& .search-input': {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '4px 0 0 4px',
    fontSize: '14px',
    '&:focus': {
      outline: 'none',
      boxShadow: '0 0 0 3px #FF9900',
    },
  },
  
  '& .search-button': {
    backgroundColor: '#FEBD69',
    border: 'none',
    padding: '10px 15px',
    borderRadius: '0 4px 4px 0',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: '#F3A847',
    },
  },
}));

// make sure this file lives at public/images/amazon-logo.png
// or adjust the src path below accordingly
const AMAZON_LOGO_SRC = '/images/amazon_black.jpg';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(ROUTES.LOGIN);
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const cartItemsCount = items.reduce((total: number, item: any) => total + item.quantity, 0);

  return (
    <AppBar position="sticky" sx={{ bgcolor: 'white', color: 'text.primary' }}>
      <Toolbar>
        {/* Logo (with Amazon icon added) */}
        <Box
          component={Link}
          to="/greencart"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            mr: 4
          }}
        >
          {/* 1) Amazon logo on the far left */}
          <Box
            component="img"
            src={AMAZON_LOGO_SRC}
            alt="Amazon"
            sx={{ width: 48, height: 'auto', mr: 2 }}
          />
          <SpaIcon sx={{ color: 'success.main', mr: 1, fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            GreenCart
          </Typography>
          <Typography variant="body2" sx={{ ml: 1, color: 'text.secondary' }}>
            by EarthScore
          </Typography>
        </Box>

        {/* Search Bar */}
        <AmazonSearchBar>
          <input
            type="text"
            className="search-input"
            placeholder="Search sustainable products..."
          />
          <button className="search-button">
            <Search sx={{ fontSize: 20 }} />
          </button>
        </AmazonSearchBar>

        {/* Navigation Links */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 4 }}>
          {/* 2) Green “capsule” nav buttons */}
          <Button
            component={Link}
            to="/greencart/group-buy"
            variant="contained"
            color="success"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              mx: 1,
            }}
          >
            Group Buys
          </Button>
          <Button
            component={Link}
            to="/greencart/calculator"
            variant="contained"
            color="success"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              mx: 1,
            }}
          >
            Calculator
          </Button>
          <Button
            component={Link}
            to="/greencart/dashboard"
            variant="contained"
            color="success"
            sx={{
              borderRadius: '999px',
              textTransform: 'none',
              mx: 1,
            }}
          >
            Dashboard
          </Button>

          {/* Cart Icon */}
          <IconButton
            component={Link}
            to="/greencart/cart"
            sx={{ mx: 1 }}
          >
            <Badge badgeContent={cartItemsCount} color="success">
              <ShoppingCart />
            </Badge>
          </IconButton>

          {/* User Menu */}
          {currentUser ? (
            <>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleMenuOpen}
                  size="small"
                  sx={{ ml: 2 }}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <Avatar sx={{ width: 36, height: 36, bgcolor: 'success.main' }}>
                    {currentUser.displayName?.[0] || currentUser.email?.[0] || 'U'}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1,
                    },
                    '&:before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => navigate(ROUTES.PROFILE)}>
                  <ListItemIcon>
                    <Person fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => navigate(ROUTES.ORDERS)}>
                  <ListItemIcon>
                    <Receipt fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>My Orders</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => navigate(ROUTES.DASHBOARD)}>
                  <ListItemIcon>
                    <Dashboard fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Dashboard</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate(ROUTES.SETTINGS)}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="success"
              onClick={() => navigate(ROUTES.LOGIN)}
              sx={{ ml: 2 }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;