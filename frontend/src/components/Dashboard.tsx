import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  GridLegacy as Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Badge,
  Tooltip
} from '@mui/material';
import {
  Co2Rounded as EcoRounded,
  TrendingUp,
  LocalShipping,
  EmojiEvents,
  Star,
  Group,
  Timeline,
  Redeem,
  WorkspacePremium,
  Forest,
  Co2,
  WaterDrop,
  CheckCircle,
  Lock,
  Share,
  MoreVert
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Achievement data
const achievements = [
  { id: 1, name: 'First Green Purchase', description: 'Made your first EarthScore 70+ purchase', icon: <EcoRounded />, earned: true, color: '#4caf50' },
  { id: 2, name: 'Carbon Warrior', description: 'Saved 10kg of CO2', icon: <Co2 />, earned: true, color: '#2196f3' },
  { id: 3, name: 'Community Leader', description: 'Started 3 group buys', icon: <Group />, earned: false, color: '#ff9800' },
  { id: 4, name: 'Eco Champion', description: 'Reached 100 EarthScore average', icon: <EmojiEvents />, earned: false, color: '#9c27b0' },
  { id: 5, name: 'Tree Hugger', description: 'Saved equivalent of 5 trees', icon: <Forest />, earned: false, color: '#4caf50' },
  { id: 6, name: 'Water Guardian', description: 'Saved 1000L of water', icon: <WaterDrop />, earned: false, color: '#03a9f4' }
];

// Dummy user data for leaderboard
const leaderboardData = [
  { name: 'You', score: 820, avatar: '👤', rank: 3 },
  { name: 'EcoWarrior23', score: 1250, avatar: '🌿', rank: 1 },
  { name: 'GreenThumb', score: 980, avatar: '🌱', rank: 2 },
  { name: 'SustainableSteve', score: 750, avatar: '♻️', rank: 4 },
  { name: 'CarbonCutter', score: 690, avatar: '🌍', rank: 5 }
];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [userLevel, setUserLevel] = useState({ level: 2, name: 'Eco Enthusiast', progress: 65 });
  
  // Mock data - in production, fetch from backend
  const impactData = {
    co2Saved: 12.5,
    avgEarthScore: 82,
    sustainablePurchases: 5,
    impactPoints: 50,
    monthlyGoal: 20,
    monthlyProgress: 62.5
  };

  const recentPurchases = [
    { id: 1, name: 'Organic Cotton T-Shirt', earthScore: 85, co2Saved: 2.3, date: '2 days ago' },
    { id: 2, name: 'Bamboo Toothbrush Set', earthScore: 92, co2Saved: 0.8, date: '5 days ago' },
    { id: 3, name: 'Recycled Notebook', earthScore: 78, co2Saved: 1.2, date: '1 week ago' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper 
        sx={{ 
          p: 4, 
          mb: 4, 
          background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
          color: 'white',
          borderRadius: 3
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Welcome back, {currentUser?.displayName || 'Eco Warrior'}!
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              You're making a real difference. Keep up the sustainable shopping!
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <Avatar 
                sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'white',
                  color: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {currentUser?.displayName?.[0] || '🌿'}
              </Avatar>
              <Badge 
                badgeContent={
                  <Chip 
                    label={`Level ${userLevel.level}`} 
                    size="small" 
                    sx={{ bgcolor: 'secondary.main', color: 'white' }}
                  />
                }
                sx={{ position: 'absolute', bottom: 0, right: 0 }}
              />
            </Box>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {userLevel.name}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Impact Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Co2 sx={{ color: '#1976d2', mr: 1 }} />
                <Typography color="text.secondary">CO2 Saved</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#1976d2">
                {impactData.co2Saved} kg
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EcoRounded sx={{ color: '#388e3c', mr: 1 }} />
                <Typography color="text.secondary">Avg EarthScore</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#388e3c">
                {impactData.avgEarthScore}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={impactData.avgEarthScore} 
                sx={{ 
                  mt: 1,
                  bgcolor: 'rgba(56, 142, 60, 0.1)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#388e3c' }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ color: '#f57c00', mr: 1 }} />
                <Typography color="text.secondary">Green Orders</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#f57c00">
                {impactData.sustainablePurchases}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total sustainable purchases
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Star sx={{ color: '#7b1fa2', mr: 1 }} />
                <Typography color="text.secondary">Impact Points</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" color="#7b1fa2">
                {impactData.impactPoints}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Keep earning!
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Level Progress */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Your Sustainability Journey
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ minWidth: 120 }}>
            Level {userLevel.level}: {userLevel.name}
          </Typography>
          <Box sx={{ flex: 1, mx: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={userLevel.progress} 
              sx={{ 
                height: 10, 
                borderRadius: 5,
                bgcolor: 'rgba(76, 175, 80, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #66bb6a 0%, #43a047 100%)',
                  borderRadius: 5
                }
              }}
            />
          </Box>
          <Typography variant="body2">
            Level {userLevel.level + 1}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {100 - userLevel.progress} more impact points to reach the next level!
        </Typography>
      </Paper>

      {/* Tabbed Content */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Achievements" icon={<EmojiEvents />} iconPosition="start" />
          <Tab label="Leaderboard" icon={<Timeline />} iconPosition="start" />
          <Tab label="Recent Activity" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            {achievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card 
                  sx={{ 
                    opacity: achievement.earned ? 1 : 0.6,
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 3 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: achievement.color, mr: 2 }}>
                        {achievement.earned ? achievement.icon : <Lock />}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {achievement.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievement.description}
                        </Typography>
                      </Box>
                    </Box>
                    {achievement.earned && (
                      <Chip 
                        label="Earned!" 
                        size="small" 
                        color="success" 
                        icon={<CheckCircle />}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <List>
            {leaderboardData.sort((a, b) => b.score - a.score).map((user, index) => (
              <React.Fragment key={user.name}>
                <ListItem
                  sx={{
                    bgcolor: user.name === 'You' ? 'action.selected' : 'transparent',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'grey.400' }}>
                      {user.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography fontWeight={user.name === 'You' ? 'bold' : 'normal'}>
                          {user.name}
                        </Typography>
                        {index < 3 && (
                          <Chip 
                            label={`#${index + 1}`} 
                            size="small" 
                            sx={{ ml: 1, height: 20 }}
                            color={index === 0 ? 'warning' : 'default'}
                          />
                        )}
                      </Box>
                    }
                    secondary={`${user.score} Impact Points`}
                  />
                  <ListItemSecondaryAction>
                    <Typography variant="h6" color="primary">
                      {user.score}
                    </Typography>
                  </ListItemSecondaryAction>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <List>
            {recentPurchases.map((purchase, index) => (
              <React.Fragment key={purchase.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.light' }}>
                      <EcoRounded color="success" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={purchase.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip 
                          label={`EarthScore: ${purchase.earthScore}`} 
                          size="small" 
                          color="success" 
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {purchase.co2Saved}kg CO2 saved • {purchase.date}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < recentPurchases.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>
      </Paper>

      {/* Monthly Goal */}
      <Paper sx={{ p: 3, mt: 4, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
        <Typography variant="h6" gutterBottom>
          Monthly Sustainability Goal
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress 
              variant="determinate" 
              value={impactData.monthlyProgress} 
              sx={{ 
                height: 20, 
                borderRadius: 10,
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #66bb6a 0%, #43a047 100%)',
                  borderRadius: 10
                }
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {impactData.monthlyProgress}%
          </Typography>
        </Box>
        <Typography variant="body2">
          Save {impactData.monthlyGoal}kg of CO2 this month - You're {impactData.monthlyProgress}% there!
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button 
          variant="contained" 
          color="success" 
          size="large"
          startIcon={<Share />}
        >
          Share Your Impact
        </Button>
        <Button 
          variant="outlined" 
          color="success" 
          size="large"
          startIcon={<Redeem />}
        >
          Redeem Rewards
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;