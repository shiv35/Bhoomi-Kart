import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  GridLegacy as Grid,
  Card,
  CardContent,
  Radio,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  Paper,
  Button,
  Alert,
  FormControlLabel,
  Switch,
  Skeleton,
  Badge,
  Tooltip,
  TextField,
  InputAdornment,
  Zoom
} from '@mui/material';
import {
  People,
  TrendingDown,
  Co2,
  LocalShipping,
  Timer,
  LocationOn,
  GroupAdd,
  Stars,
  EmojiEvents,
  Search,
  MyLocation
} from '@mui/icons-material';
import axios from 'axios';
// Add this import at the top with other imports
import { MockGroupBuyingService } from '../../services/mockGroupBuyingData';

interface GroupBuyOption {
  id: string;
  name: string;
  matchingProducts: string[];
  participants: {
    name: string;
    pincode ?: string ; 
    avatar?: string;
  }[];
  savings: {
    cost: number;
    co2: number;
    percentage: number;
  };
  minParticipants: number;
  currentParticipants: number;
  deadline: string;
  estimatedDelivery: string;
  status: 'available' | 'almost-full' | 'full';
  avgDistance?: number;
  commonCategories?: string[];
}

interface GroupBuyingStepProps {
  cartItems: any[];
  userPincode: string;
  selectedGroupBuy: string | null;
  onSelectGroup: (groupId: string | null) => void;
  skipGroupBuy: boolean;
  onSkipChange: (skip: boolean) => void;
  onPincodeChange?: (pincode: string) => void;
}

const GroupBuyingStep: React.FC<GroupBuyingStepProps> = ({
  cartItems,
  userPincode,
  selectedGroupBuy,
  onSelectGroup,
  skipGroupBuy,
  onSkipChange,
  onPincodeChange
}) => {
  const [groupOptions, setGroupOptions] = useState<GroupBuyOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // Pincode input states
  const [showPincodeInput, setShowPincodeInput] = useState(!userPincode);
  const [tempPincode, setTempPincode] = useState(userPincode || '');
  const [pincodeError, setPincodeError] = useState('');
  const [searchedPincode, setSearchedPincode] = useState('');

  const USE_MOCK_DATA = true; // Toggle this to switch between mock and real API

  // ADD THIS useEffect to automatically fetch when component mounts with a pincode
  useEffect(() => {
    // If we have a pincode and haven't searched yet, fetch automatically
    if (userPincode && userPincode.length === 6 && !searchedPincode && !skipGroupBuy) {
      console.log('Auto-fetching groups for pincode:', userPincode);
      setSearchedPincode(userPincode);
      setShowPincodeInput(false);
      fetchGroupSuggestions(userPincode);
    }
  }, [userPincode]); // Trigger when userPincode changes

  // Validate pincode format (Indian pincode: 6 digits, not starting with 0)
  const validatePincode = (pincode: string): boolean => {
    return /^[1-9][0-9]{5}$/.test(pincode);
  };

  const handlePincodeSubmit = () => {
    setPincodeError('');

    if (!validatePincode(tempPincode)) {
      setPincodeError('Please enter a valid 6-digit pincode');
      return;
    }

    setSearchedPincode(tempPincode);
    setShowPincodeInput(false);
    if (onPincodeChange) {
      onPincodeChange(tempPincode);
    }
    fetchGroupSuggestions(tempPincode);
  };

  const handleChangePincode = () => {
    setShowPincodeInput(true);
    setGroupOptions([]);
    setError('');
  };

  const fetchGroupSuggestions = async (pincode: string) => {
    setLoading(true);
    setError('');

    console.log('Fetching group suggestions for pincode:', pincode);

    try {
      let response: { success: boolean, suggestions: GroupBuyOption[] };

      if (USE_MOCK_DATA) {
        console.log('Using mock data...');
        // Use mock data
        response = await MockGroupBuyingService.getMockGroups(pincode, cartItems);
      } else {
        console.log('Using real API...');
        // Use real API
        const apiResponse = await axios.post('http://localhost:8000/api/group-buy/suggestions', {
          pincode: pincode,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category || 'general',
            price: item.price,
            quantity: item.quantity
          })),
          radius: 5.0
        });
        response = apiResponse.data;
      }

      console.log('API Response:', response);

      if (response.success && response.suggestions.length > 0) {
        setGroupOptions(response.suggestions);

        // Auto-select the best option if only one exists
        if (response.suggestions.length === 1) {
          onSelectGroup(response.suggestions[0].id);
        }
      } else {
        setError('No group buying options found in your area. You can create a new group or proceed with individual shipping.');
        setGroupOptions([]);
      }
    } catch (err: any) {
      console.error('Error fetching group suggestions:', err);
      setError('Failed to load group buying suggestions. Please try again.');
      setGroupOptions([]);
    } finally {
      setLoading(false);
    }
  };

  // Main toggle handler
  const handleEnableToggle = (checked: boolean) => {
    onSkipChange(!checked);
    if (checked && !searchedPincode) {
      setShowPincodeInput(true);
    }
  };

  const getOptimalBadge = (option: GroupBuyOption, index: number) => {
    if (index === 0 && option.savings.percentage >= 20) {
      return (
        <Tooltip title="Best savings and environmental impact">
          <Chip
            icon={<EmojiEvents />}
            label="Optimal Choice"
            color="success"
            size="small"
            sx={{ position: 'absolute', top: 10, left: 10 }}
          />
        </Tooltip>
      );
    }
    return null;
  };

  const getDistanceColor = (distance?: number) => {
    if (!distance) return 'text.secondary';
    if (distance < 2) return 'success.main';
    if (distance < 4) return 'warning.main';
    return 'error.main';
  };

  // Skip state - show simple message
  if (skipGroupBuy) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Group Buying 🌿
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join neighbors to save money and reduce environmental impact
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={false}
                onChange={(e) => handleEnableToggle(e.target.checked)}
                color="success"
              />
            }
            label="Enable Group Buying"
          />
        </Box>

        <Alert severity="info">
          <Typography variant="body1">
            You've chosen to proceed with individual shipping. Enable group buying above to unlock savings and reduce packaging waste!
          </Typography>
        </Alert>
      </Box>
    );
  }

  // Pincode input state
  if (showPincodeInput) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Join a Group Buy & Save More! 🌿
            </Typography>
            <Typography variant="body2" color="text.secondary">
              AI-powered clustering finds the best group buying options near you
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={true}
                onChange={(e) => handleEnableToggle(e.target.checked)}
                color="success"
              />
            }
            label="Enable Group Buying"
          />
        </Box>

        <Zoom in={true}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 500,
              mx: 'auto',
              background: 'linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%)'
            }}
          >
            <LocationOn sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Enter your pincode to find nearby group buys
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We'll search for active groups within 5km of your location
            </Typography>

            <TextField
              fullWidth
              label="Pincode"
              value={tempPincode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setTempPincode(value);
                setPincodeError('');
              }}
              error={!!pincodeError}
              helperText={pincodeError || 'Enter your 6-digit pincode'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MyLocation />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              startIcon={<Search />}
              onClick={handlePincodeSubmit}
              disabled={tempPincode.length !== 6}
            >
              Find Groups Near Me
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
              Your location helps us connect you with neighbors for combined deliveries
            </Typography>
          </Paper>
        </Zoom>
      </Box>
    );
  }

  // Main content - show results or loading
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Group Buying Options Near {searchedPincode} 🌿
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-optimized groups based on location and shopping preferences
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            size="small"
            startIcon={<LocationOn />}
            onClick={handleChangePincode}
          >
            Change Pincode
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              console.log('Debug: Testing fetch with pincode 400705');
              console.log('Current cart items:', cartItems);
              fetchGroupSuggestions('400705');
            }}
          >
            DEBUG: Test API
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={true}
                onChange={(e) => handleEnableToggle(e.target.checked)}
                color="success"
              />
            }
            label="Enabled"
          />
        </Box>
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Box>
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              color="success"
              startIcon={<GroupAdd />}
              onClick={() => setShowCreateGroup(true)}
            >
              Create a New Group Buy
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Start your own group and invite neighbors to join
            </Typography>
          </Box>
        </Box>
      ) : groupOptions.length > 0 ? (
        <>
          <Grid container spacing={3}>
            {groupOptions.map((group, index) => (
              <Grid item xs={12} md={6} key={group.id}>
                <Card
                  sx={{
                    border: selectedGroupBuy === group.id ? '2px solid' : '1px solid',
                    borderColor: selectedGroupBuy === group.id ? 'success.main' : 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)'
                    },
                    position: 'relative',
                    background: index === 0 ? 'linear-gradient(to bottom right, #f1f8f4, #ffffff)' : 'white'
                  }}
                  onClick={() => onSelectGroup(group.id)}
                >
                  {getOptimalBadge(group, index)}

                  {group.status === 'almost-full' && (
                    <Chip
                      label="Almost Full!"
                      color="warning"
                      size="small"
                      sx={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  )}

                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Radio
                        checked={selectedGroupBuy === group.id}
                        color="success"
                      />
                      <Typography variant="h6" sx={{ ml: 1, flex: 1 }}>
                        {group.name}
                      </Typography>
                      {group.avgDistance && (
                        <Tooltip title="Average distance between group members">
                          <Chip
                            icon={<LocationOn />}
                            label={`~${group.avgDistance}km`}
                            size="small"
                            sx={{ color: getDistanceColor(group.avgDistance) }}
                          />
                        </Tooltip>
                      )}
                    </Box>

                    {/* Participants */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <People sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          {group.currentParticipants}/{group.minParticipants} participants
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(group.currentParticipants / group.minParticipants) * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'grey.200',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: group.status === 'almost-full' ? 'warning.main' : 'success.main'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <AvatarGroup max={4} sx={{ mr: 1 }}>
                          {group.participants.map((p, i) => (
                            <Tooltip key={i} title={`${p.name} (${p.pincode})`}>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {p.avatar}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </AvatarGroup>
                        <Typography variant="caption" color="text.secondary">
                          Pincodes: {
                            group.participants
                              .map(p => p.pincode)
                              .filter((pin, i, arr) => arr.indexOf(pin) === i)
                              .join(', ')
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {/* Matching Products */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Matching items ({group.matchingProducts.length}):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {group.matchingProducts.slice(0, 3).map((product, i) => (
                          <Chip
                            key={i}
                            label={product}
                            size="small"
                            variant="outlined"
                            sx={{ maxWidth: 150, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                          />
                        ))}
                        {group.matchingProducts.length > 3 && (
                          <Chip
                            label={`+${group.matchingProducts.length - 3} more`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>

                    {/* Savings */}
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: index === 0 ? 'success.light' : 'grey.50',
                        border: '1px solid',
                        borderColor: index === 0 ? 'success.main' : 'grey.200'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        Your Savings:
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <TrendingDown sx={{ color: index === 0 ? 'success.dark' : 'success.main' }} />
                            <Typography variant="h6" fontWeight="bold">
                              ${group.savings.cost}
                            </Typography>
                            <Typography variant="caption">Saved</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Co2 sx={{ color: index === 0 ? 'success.dark' : 'success.main' }} />
                            <Typography variant="h6" fontWeight="bold">
                              {group.savings.co2}kg
                            </Typography>
                            <Typography variant="caption">CO2</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={4}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Badge
                              badgeContent={`${group.savings.percentage}%`}
                              color={index === 0 ? "success" : "default"}
                            >
                              <LocalShipping sx={{ color: index === 0 ? 'success.dark' : 'success.main' }} />
                            </Badge>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                              Less Pack
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Timing */}
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Timer sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="caption">
                          Closes: {new Date(group.deadline).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocalShipping sx={{ mr: 0.5, fontSize: 16 }} />
                        <Typography variant="caption">
                          Delivery: {new Date(group.estimatedDelivery).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Alert severity="info" icon={<Stars />} sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>AI Optimization:</strong> Groups are formed using DBSCAN clustering based on location proximity
              and shopping preferences. The optimal choice maximizes both savings and environmental impact.
            </Typography>
          </Alert>
        </>
      ) : null}
    </Box>
  );
};

export default GroupBuyingStep;