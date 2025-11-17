// src/components/Profile.tsx

import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  GridLegacy as Grid,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Email,
  Phone,
  LocationOn,
  Edit,
  Co2Rounded as EcoRounded,
  Forest,
  Co2,
  Settings,
  Security,
  Language,
  ExitToApp,
  RecyclingRounded as Recycling,
  WaterDropRounded as WaterDrop,
  Group,
  TrendingDown
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ROUTES } from '../utils/constants';

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: currentUser?.displayName || 'Eco Warrior',
    email: currentUser?.email || '',
    phone: '+91 9876543210',
    address: '123 Green Street',
    city: 'Mumbai',
    pincode: '400001'
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    groupBuyAlerts: true,
    priceDropAlerts: false,
    sustainabilityTips: true
  });

  const sustainabilityStats = {
    totalCO2Saved: 45.8,
    treesEquivalent: 2,
    plasticBottlesSaved: 156,
    waterSaved: 2340,
    level: 3,
    levelName: 'Eco Enthusiast',
    nextLevelProgress: 75
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate(ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleSaveProfile = () => {
    // In prod, send profileData to backend
    setEditDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: 'green', color: 'white', borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 120, height: 120, bgcolor: 'white', color: 'green', fontSize: '3rem' }}>
              {profileData.displayName[0]}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h4">{profileData.displayName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
              <Chip
                icon={<EcoRounded />}
                label={`Level ${sustainabilityStats.level}: ${sustainabilityStats.levelName}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
              />
              <Typography>
                Member since{' '}
                {new Date(currentUser?.metadata?.creationTime || '').toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{ bgcolor: 'white', color: 'green' }}
              startIcon={<Edit />}
              onClick={() => setEditDialogOpen(true)}
            >
              Edit Profile
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Left: Contact & Account */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Contact Information</Typography>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemIcon><Email /></ListItemIcon>
                <ListItemText primary={profileData.email} secondary="Email" />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon><Phone /></ListItemIcon>
                <ListItemText primary={profileData.phone} secondary="Phone" />
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemIcon><LocationOn /></ListItemIcon>
                <ListItemText
                  primary={`${profileData.address}, ${profileData.city} - ${profileData.pincode}`}
                  secondary="Address"
                />
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Account Settings</Typography>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate(ROUTES.ORDERS)}>
                  <ListItemIcon><Settings /></ListItemIcon>
                  <ListItemText primary="Order History" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Security /></ListItemIcon>
                  <ListItemText primary="Privacy & Security" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Language /></ListItemIcon>
                  <ListItemText primary="Language" secondary="English" />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><ExitToApp /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Right: Stats & Preferences */}
        <Grid item xs={12} md={8}>
          {/* Impact Cards */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Your Environmental Impact</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
                  <CardContent>
                    <Co2 sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4">{sustainabilityStats.totalCO2Saved}kg</Typography>
                    <Typography>CO₂ Saved</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'success.light' }}>
                  <CardContent>
                    <Forest sx={{ fontSize: 40, mb: 1, color: 'success.dark' }} />
                    <Typography variant="h4">{sustainabilityStats.treesEquivalent}</Typography>
                    <Typography>Trees Equivalent</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'info.light' }}>
                  <CardContent>
                    <Recycling sx={{ fontSize: 40, mb: 1, color: 'info.dark' }} />
                    <Typography variant="h4">{sustainabilityStats.plasticBottlesSaved}</Typography>
                    <Typography>Bottles Saved</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card sx={{ textAlign: 'center', bgcolor: 'warning.light' }}>
                  <CardContent>
                    <WaterDrop sx={{ fontSize: 40, mb: 1, color: 'warning.dark' }} />
                    <Typography variant="h4">{sustainabilityStats.waterSaved}L</Typography>
                    <Typography>Water Saved</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Level Progress */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Level Progress</Typography>
                <Typography>{sustainabilityStats.nextLevelProgress}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={sustainabilityStats.nextLevelProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(76,175,80,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'success.main',
                    borderRadius: 5
                  }
                }}
              />
            </Box>
          </Paper>

          {/* Preferences */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Notification Preferences</Typography>
            <List disablePadding>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText primary="Email Notifications" secondary="Order updates" />
                  <Switch
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences(p => ({ ...p, emailNotifications: e.target.checked }))}
                    color="success"
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><Group /></ListItemIcon>
                  <ListItemText primary="Group Buy Alerts" secondary="New bundle matches" />
                  <Switch
                    checked={preferences.groupBuyAlerts}
                    onChange={(e) => setPreferences(p => ({ ...p, groupBuyAlerts: e.target.checked }))}
                    color="success"
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><TrendingDown /></ListItemIcon>
                  <ListItemText primary="Price Drop Alerts" secondary="Eco-products sales" />
                  <Switch
                    checked={preferences.priceDropAlerts}
                    onChange={(e) => setPreferences(p => ({ ...p, priceDropAlerts: e.target.checked }))}
                    color="success"
                  />
                </ListItemButton>
              </ListItem>
              <Divider />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon><EcoRounded /></ListItemIcon>
                  <ListItemText primary="Sustainability Tips" secondary="Weekly tips" />
                  <Switch
                    checked={preferences.sustainabilityTips}
                    onChange={(e) => setPreferences(p => ({ ...p, sustainabilityTips: e.target.checked }))}
                    color="success"
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2, '& .MuiTextField-root': { mb: 2 } }}>
            <TextField
              fullWidth
              label="Display Name"
              value={profileData.displayName}
              onChange={(e) => setProfileData(d => ({ ...d, displayName: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Phone"
              value={profileData.phone}
              onChange={(e) => setProfileData(d => ({ ...d, phone: e.target.value }))}
            />
            <TextField
              fullWidth
              label="Address"
              value={profileData.address}
              onChange={(e) => setProfileData(d => ({ ...d, address: e.target.value }))}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={profileData.city}
                  onChange={(e) => setProfileData(d => ({ ...d, city: e.target.value }))}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={profileData.pincode}
                  onChange={(e) => setProfileData(d => ({ ...d, pincode: e.target.value }))}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
