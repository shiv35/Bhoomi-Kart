import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  GridLegacy as Grid, 
  Typography, 
  CircularProgress, 
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Avatar,
  AvatarGroup,
  Divider,
  Paper,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Inventory2Rounded, 
  LocalShipping, 
  AccessTime, 
  Co2Rounded as EcoRounded, 
  TrendingDown, 
  Settings, 
  CheckCircle,
  People,
  LocalOffer,
  ExpandMore,
  ExpandLess,
  Savings,
  Co2,
  AttachMoney,
  GroupAdd,
  GroupRemove,
  Visibility,
  Calculate,
  Timer,
  Share
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

interface GroupBuyOption {
  bundle_id: string;
  name: string;
  num_other_customers: number;
  co2_saved_kg: number;
  estimated_delivery: string;
  progress?: number;
  products?: string[];
  savings_percent?: number;
  cost_savings?: number;
  min_participants?: number;
  max_participants?: number;
  current_participants?: number;
  deadline?: string;
  status?: 'active' | 'completed' | 'failed';
  user_joined?: boolean;
}

interface PackagingOption {
  name: string;
  impact_points: number;
  message?: string;
  icon?: string;
}

interface GroupDetails {
  bundle_id: string;
  name: string;
  participants: { name: string; joined_date: string; avatar?: string }[];
  products: { name: string; quantity: number; earthScore: number; price: number }[];
  environmental_impact: {
    co2_saved: number;
    packaging_reduced: number;
    transport_optimized: boolean;
  };
  delivery_details: {
    estimated_date: string;
    delivery_method: string;
    carbon_neutral: boolean;
  };
  cost_breakdown: {
    original_total: number;
    group_discount: number;
    final_total: number;
    your_savings: number;
  };
}

const OrderGrouping: React.FC = () => {
  const { currentUser } = useAuth();
  const [groupOptions, setGroupOptions] = useState<GroupBuyOption[]>([]);
  const [packagingOptions, setPackagingOptions] = useState<PackagingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupDetails | null>(null);
  const [autoGroupingEnabled, setAutoGroupingEnabled] = useState(false);
  const [autoGroupingDialogOpen, setAutoGroupingDialogOpen] = useState(false);
  const [expandedSavings, setExpandedSavings] = useState<{ [key: string]: boolean }>({});
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGroupBuyOptions();
  }, [currentUser]);

  const fetchGroupBuyOptions = async () => {
    if (!currentUser) {
      setError("Please log in to see group buying options.");
      setLoading(false);
      return;
    }

    try {
      // Mock data with enhanced fields
      const mockGroupOptions: GroupBuyOption[] = [
        {
          bundle_id: 'gb001',
          name: 'Eco Kitchen Essentials Bundle',
          num_other_customers: 3,
          co2_saved_kg: 8.5,
          estimated_delivery: '2025-06-28',
          progress: 75,
          products: ['Bamboo Utensils', 'Reusable Food Wraps', 'Compost Bin'],
          savings_percent: 25,
          cost_savings: 15.99,
          min_participants: 4,
          max_participants: 8,
          current_participants: 3,
          deadline: '2025-06-25',
          status: 'active',
          user_joined: false
        },
        {
          bundle_id: 'gb002',
          name: 'Zero Waste Bathroom Set',
          num_other_customers: 5,
          co2_saved_kg: 12.3,
          estimated_delivery: '2025-06-30',
          progress: 100,
          products: ['Bamboo Toothbrush', 'Shampoo Bars', 'Loofah Sponges'],
          savings_percent: 30,
          cost_savings: 22.50,
          min_participants: 5,
          max_participants: 10,
          current_participants: 5,
          deadline: '2025-06-24',
          status: 'completed',
          user_joined: true
        },
        {
          bundle_id: 'gb003',
          name: 'Sustainable Office Pack',
          num_other_customers: 2,
          co2_saved_kg: 5.2,
          estimated_delivery: '2025-07-02',
          progress: 40,
          products: ['Recycled Notebooks', 'Plant-based Pens', 'Desk Organizer'],
          savings_percent: 20,
          cost_savings: 12.00,
          min_participants: 5,
          max_participants: 12,
          current_participants: 2,
          deadline: '2025-06-26',
          status: 'active',
          user_joined: false
        }
      ];

      // Initialize joined groups based on mock data
      const joined = new Set(mockGroupOptions.filter(g => g.user_joined).map(g => g.bundle_id));
      setJoinedGroups(joined);

      const mockPackagingOptions: PackagingOption[] = [
        {
          name: 'Eco Hero Package',
          impact_points: 20,
          message: '100% compostable packaging, zero plastic!',
          icon: 'recycle'
        },
        {
          name: 'Carbon Neutral Box',
          impact_points: 15,
          message: 'Recycled materials with carbon offset shipping',
          icon: 'nature'
        },
        {
          name: 'Minimal Impact Wrap',
          impact_points: 10,
          message: 'Reduced packaging, maximum protection',
          icon: 'minimize'
        }
      ];

      setGroupOptions(mockGroupOptions);
      setPackagingOptions(mockPackagingOptions);
      setLoading(false);
    } catch (err) {
      setError('Failed to load group buying options. Please try again later.');
      setLoading(false);
    }
  };

  const handleJoinGroup = async (bundleId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJoinedGroups(prev => new Set(prev).add(bundleId));
      setGroupOptions(prev => prev.map(g => 
        g.bundle_id === bundleId 
          ? { ...g, user_joined: true, current_participants: (g.current_participants || 0) + 1 }
          : g
      ));
      
      setSelectedOption(`Successfully joined the group buy!`);
    } catch (err) {
      setError('Failed to join group. Please try again.');
    }
  };

  const handleLeaveGroup = async (bundleId: string) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setJoinedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(bundleId);
        return newSet;
      });
      
      setGroupOptions(prev => prev.map(g => 
        g.bundle_id === bundleId 
          ? { ...g, user_joined: false, current_participants: Math.max((g.current_participants || 0) - 1, 0) }
          : g
      ));
      
      setSelectedOption(`You have left the group buy.`);
    } catch (err) {
      setError('Failed to leave group. Please try again.');
    }
  };

  const handleViewDetails = async (bundleId: string) => {
    // Mock detailed data
    const mockDetails: GroupDetails = {
      bundle_id: bundleId,
      name: groupOptions.find(g => g.bundle_id === bundleId)?.name || '',
      participants: [
        { name: 'You', joined_date: 'Just now', avatar: '👤' },
        { name: 'EcoShopper42', joined_date: '2 hours ago', avatar: '🌱' },
        { name: 'GreenLiving', joined_date: '5 hours ago', avatar: '🌿' },
        { name: 'SustainableLife', joined_date: '1 day ago', avatar: '♻️' }
      ],
      products: [
        { name: 'Bamboo Utensil Set', quantity: 1, earthScore: 85, price: 15.99 },
        { name: 'Beeswax Food Wraps', quantity: 3, earthScore: 92, price: 24.99 },
        { name: 'Compost Bin', quantity: 1, earthScore: 88, price: 45.99 }
      ],
      environmental_impact: {
        co2_saved: 8.5,
        packaging_reduced: 60,
        transport_optimized: true
      },
      delivery_details: {
        estimated_date: '2025-06-28',
        delivery_method: 'Carbon-neutral shipping',
        carbon_neutral: true
      },
      cost_breakdown: {
        original_total: 86.97,
        group_discount: 21.74,
        final_total: 65.23,
        your_savings: 21.74
      }
    };

    setSelectedGroup(mockDetails);
    setDetailsDialogOpen(true);
  };

  const toggleSavingsExpansion = (bundleId: string) => {
    setExpandedSavings(prev => ({
      ...prev,
      [bundleId]: !prev[bundleId]
    }));
  };

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    if (hours > 0) return `${hours} hours left`;
    return 'Ending soon';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom>
          Group Buying Hub
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Join forces with your neighbors to reduce packaging waste and carbon emissions while saving money
        </Typography>
      </Box>

      {selectedOption && (
        <Alert severity="success" sx={{ mb: 4 }} onClose={() => setSelectedOption(null)}>
          {selectedOption}
        </Alert>
      )}

      {/* Active Group Buys */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <People sx={{ mr: 2 }} />
        Active Group Buys Near You
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {groupOptions.map(option => (
          <Grid item key={option.bundle_id} xs={12} md={6} lg={4}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                border: joinedGroups.has(option.bundle_id) ? '2px solid #4caf50' : '1px solid #e0e0e0',
                position: 'relative'
              }}
            >
              {joinedGroups.has(option.bundle_id) && (
                <Chip 
                  label="You're In!" 
                  color="success" 
                  size="small"
                  icon={<CheckCircle />}
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                />
              )}
              
              <CardContent sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" sx={{ flex: 1, pr: 2 }}>
                    {option.name}
                  </Typography>
                  <Chip 
                    label={getStatusColor(option.status) === 'success' ? 'Ready!' : `${option.savings_percent}% OFF`} 
                    color={getStatusColor(option.status)} 
                    size="small"
                  />
                </Box>

                {/* Progress Bar */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Group Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {option.current_participants}/{option.min_participants} min
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={((option.current_participants || 0) / (option.min_participants || 1)) * 100} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: 'rgba(76, 175, 80, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: option.status === 'completed' ? 'success.main' : 'warning.main',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>

                {/* Participants */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AvatarGroup max={4} sx={{ mr: 2 }}>
                    {[...Array(option.current_participants || 0)].map((_, i) => (
                      <Avatar key={i} sx={{ width: 32, height: 32, bgcolor: 'success.light' }}>
                        {i === 0 && joinedGroups.has(option.bundle_id) ? '👤' : ''}
                      </Avatar>
                    ))}
                  </AvatarGroup>
                  <Typography variant="body2" color="text.secondary">
                    {option.current_participants} participants
                  </Typography>
                </Box>

                {/* Savings Calculator */}
                <Paper 
                  sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: 'success.light', 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'success.main', color: 'white' }
                  }}
                  onClick={() => toggleSavingsExpansion(option.bundle_id)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Calculate sx={{ mr: 1 }} />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Savings Calculator
                      </Typography>
                    </Box>
                    {expandedSavings[option.bundle_id] ? <ExpandLess /> : <ExpandMore />}
                  </Box>
                  
                  <Collapse in={expandedSavings[option.bundle_id]}>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <AttachMoney sx={{ mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body2">Cost Savings:</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">${option.cost_savings}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Co2 sx={{ mr: 0.5, fontSize: 20 }} />
                          <Typography variant="body2">CO2 Saved:</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold">{option.co2_saved_kg}kg</Typography>
                      </Box>
                    </Box>
                  </Collapse>
                </Paper>

                {/* Products Preview */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Products in bundle:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {option.products?.slice(0, 3).map((product, i) => (
                      <Chip key={i} label={product} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>

                {/* Time & Delivery */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Timer sx={{ mr: 0.5, fontSize: 20 }} />
                    <Typography variant="body2">
                      {calculateTimeRemaining(option.deadline || '')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocalShipping sx={{ mr: 0.5, fontSize: 20 }} />
                    <Typography variant="body2">
                      {new Date(option.estimated_delivery).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              {/* Actions */}
              <Box sx={{ p: 2, pt: 0 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      startIcon={<Visibility />}
                      onClick={() => handleViewDetails(option.bundle_id)}
                    >
                      Details
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    {joinedGroups.has(option.bundle_id) ? (
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="error"
                        startIcon={<GroupRemove />}
                        onClick={() => handleLeaveGroup(option.bundle_id)}
                      >
                        Leave
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        fullWidth
                        color="success"
                        startIcon={<GroupAdd />}
                        onClick={() => handleJoinGroup(option.bundle_id)}
                        disabled={option.status === 'completed'}
                      >
                        Join
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 6 }} />

      {/* Packaging Options */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <Inventory2Rounded sx={{ mr: 2 }} />
        Choose Your Packaging
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {packagingOptions.map(option => (
          <Grid item key={option.name} xs={12} md={4}>
            <Card 
              sx={{ 
                cursor: 'pointer', 
                transition: 'all 0.3s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'success.light', 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}>
                  {option.icon === 'recycle' && <EcoRounded sx={{ fontSize: 40, color: 'success.dark' }} />}
                  {option.icon === 'nature' && <EcoRounded sx={{ fontSize: 40, color: 'success.dark' }} />}
                  {option.icon === 'minimize' && <Inventory2Rounded sx={{ fontSize: 40, color: 'success.dark' }} />}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {option.name}
                </Typography>
                <Chip 
                  label={`+${option.impact_points} Impact Points`} 
                  color="success" 
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {option.message}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Auto Grouping Feature */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" gutterBottom>
          Never Miss a Group Buy Opportunity
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enable auto-grouping to automatically join the best group buys based on your shopping habits and location
        </Typography>
        <FormControlLabel
          control={
            <Switch 
              checked={autoGroupingEnabled} 
              onChange={() => setAutoGroupingDialogOpen(true)}
              color="success"
            />
          }
          label={
            <Typography variant="body1" sx={{ fontWeight: autoGroupingEnabled ? 'bold' : 'normal' }}>
              Auto-Grouping {autoGroupingEnabled ? 'Enabled' : 'Disabled'}
            </Typography>
          }
        />
        {autoGroupingEnabled && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              icon={<CheckCircle />} 
              label="You'll be notified when we find perfect group buy matches" 
              color="success"
            />
          </Box>
        )}
      </Paper>

      {/* Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Group Buy Details</Typography>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <Share />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedGroup && (
            <Box>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                {selectedGroup.name}
              </Typography>
              
              {/* Cost Breakdown */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  💰 Your Savings Breakdown
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Original Total:</Typography>
                    <Typography variant="h6">${selectedGroup.cost_breakdown.original_total}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Group Discount:</Typography>
                    <Typography variant="h6" color="error">-${selectedGroup.cost_breakdown.group_discount}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Final Price:</Typography>
                    <Typography variant="h5" color="success.dark" fontWeight="bold">
                      ${selectedGroup.cost_breakdown.final_total}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">You Save:</Typography>
                    <Typography variant="h5" color="success.dark" fontWeight="bold">
                      ${selectedGroup.cost_breakdown.your_savings}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Environmental Impact */}
              <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  🌍 Environmental Impact
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Co2 sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4">{selectedGroup.environmental_impact.co2_saved}kg</Typography>
                      <Typography variant="body2">CO2 Saved</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Inventory2Rounded sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4">{selectedGroup.environmental_impact.packaging_reduced}%</Typography>
                      <Typography variant="body2">Less Packaging</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <LocalShipping sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4">✓</Typography>
                      <Typography variant="body2">Optimized Delivery</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
              
              {/* Participants */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  👥 Group Members ({selectedGroup.participants.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedGroup.participants.map((participant, i) => (
                    <Chip 
                      key={i}
                      avatar={<Avatar>{participant.avatar}</Avatar>}
                      label={`${participant.name} • ${participant.joined_date}`}
                      variant={participant.name === 'You' ? 'filled' : 'outlined'}
                      color={participant.name === 'You' ? 'success' : 'default'}
                    />
                  ))}
                </Box>
              </Box>

              {/* Products */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  📦 Products in Bundle
                </Typography>
                <List>
                  {selectedGroup.products.map((product, i) => (
                    <ListItem key={i} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Badge badgeContent={`x${product.quantity}`} color="primary">
                          <Inventory2Rounded />
                        </Badge>
                      </ListItemIcon>
                      <ListItemText 
                        primary={product.name}
                        secondary={`$${product.price} • EarthScore: ${product.earthScore}`}
                      />
                      <Chip 
                        label={`Score: ${product.earthScore}`} 
                        size="small" 
                        color="success" 
                        variant="outlined"
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Delivery Details */}
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="subtitle2" gutterBottom>
                  🚚 Delivery Information
                </Typography>
                <Typography variant="body2">
                  • Estimated Delivery: {new Date(selectedGroup.delivery_details.estimated_date).toLocaleDateString()}<br/>
                  • Method: {selectedGroup.delivery_details.delivery_method}<br/>
                  • Carbon Neutral: {selectedGroup.delivery_details.carbon_neutral ? '✅ Yes' : '❌ No'}
                </Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button variant="contained" color="success" startIcon={<Share />}>
            Share This Deal
          </Button>
        </DialogActions>
      </Dialog>

      {/* Auto-grouping Dialog */}
      <Dialog 
        open={autoGroupingDialogOpen} 
        onClose={() => setAutoGroupingDialogOpen(false)}
      >
        <DialogTitle>Auto-Grouping Settings</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            When enabled, we'll automatically match you with group buys based on:
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Your past purchases" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Your location" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Your sustainability preferences" />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAutoGroupingDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={() => {
              setAutoGroupingEnabled(!autoGroupingEnabled);
              setAutoGroupingDialogOpen(false);
              setSelectedOption(autoGroupingEnabled ? 'Auto-grouping disabled' : 'Auto-grouping enabled! We\'ll notify you of new opportunities.');
            }}
          >
            {autoGroupingEnabled ? 'Disable' : 'Enable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OrderGrouping;