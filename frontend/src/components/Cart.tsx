import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  GridLegacy as Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Badge,
  Tooltip,
  Alert,
  LinearProgress,
  Collapse,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  ShoppingCart,
  Delete,
  Add,
  Remove,
  Co2Rounded as EcoRounded,
  LocalShipping,
  Inventory2Rounded,
  GroupAdd,
  Calculate,
  Co2,
  Nature,
  Recycling,
  Forest,
  WaterDrop,
  TrendingDown,
  ChevronRight,
  Info,
  CheckCircle,
  Close,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { ShoppingBag, Leaf } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  earthScore: number;
  image?: string;
  co2Impact: number;
  recyclable: boolean;
  category: string;
}

interface GroupBuySuggestion {
  id: string;
  name: string;
  matchingProducts: string[];
  savings: number;
  co2Reduction: number;
  participantsNeeded: number;
  deadline: string;
}

interface PackagingOption {
  id: string;
  name: string;
  description: string;
  impactScore: number;
  co2Difference: number;
  priceAdjustment: number;
  features: string[];
  icon: React.ReactNode;
}

interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  days: string;
  carbonNeutral: boolean;
  co2Impact: number;
}

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { items, updateQuantity, removeItem, getTotalPrice, getAverageEarthScore } = useCart();
  
  const [selectedPackaging, setSelectedPackaging] = useState('eco-hero');
  const [selectedShipping, setSelectedShipping] = useState('carbon-neutral');
  const [groupBuySuggestions, setGroupBuySuggestions] = useState<GroupBuySuggestion[]>([]);
  const [showImpactDetails, setShowImpactDetails] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  // Mock cart items - in production, this would come from context
  const mockItems = (items.length > 0 ? items : [
    {
      id: '1',
      name: 'Bamboo Utensil Set',
      price: 15.99,
      quantity: 2,
      earthScore: 85,
      co2Impact: 0.8,
      recyclable: true,
      category: 'kitchen'
    },
    {
      id: '2',
      name: 'Organic Cotton T-Shirt',
      price: 24.99,
      quantity: 1,
      earthScore: 78,
      co2Impact: 2.3,
      recyclable: true,
      category: 'clothing'
    },
    {
      id: '3',
      name: 'Reusable Water Bottle',
      price: 19.99,
      quantity: 1,
      earthScore: 92,
      co2Impact: 0.5,
      recyclable: true,
      category: 'accessories'
    }
  ]) as CartItem[];

  const packagingOptions: PackagingOption[] = [
    {
      id: 'eco-hero',
      name: 'Eco Hero Package',
      description: '100% compostable materials, zero plastic',
      impactScore: 95,
      co2Difference: -2.5,
      priceAdjustment: 0,
      features: ['Compostable', 'Plant-based ink', 'Minimal material'],
      icon: <Nature sx={{ color: 'success.main' }} />
    },
    {
      id: 'carbon-neutral',
      name: 'Carbon Neutral Box',
      description: 'Recycled materials with carbon offset',
      impactScore: 80,
      co2Difference: -1.5,
      priceAdjustment: -0.50,
      features: ['100% Recycled', 'Carbon offset', 'Reusable'],
      icon: <Co2 sx={{ color: 'primary.main' }} />
    },
    {
      id: 'standard-green',
      name: 'Standard Green',
      description: 'Recyclable materials, reduced packaging',
      impactScore: 65,
      co2Difference: -0.5,
      priceAdjustment: -1.00,
      features: ['Recyclable', 'Reduced size', 'Eco-friendly tape'],
      icon: <Recycling sx={{ color: 'warning.main' }} />
    },
    {
      id: 'regular',
      name: 'Regular Package',
      description: 'Standard packaging materials',
      impactScore: 30,
      co2Difference: 0,
      priceAdjustment: -1.50,
      features: ['Standard materials', 'Basic protection'],
      icon: <Inventory2Rounded sx={{ color: 'text.secondary' }} />
    }
  ];

  const shippingOptions: ShippingOption[] = [
    {
      id: 'carbon-neutral',
      name: 'Carbon Neutral Shipping',
      description: 'Offset emissions with verified projects',
      price: 5.99,
      days: '5-7 business days',
      carbonNeutral: true,
      co2Impact: 0
    },
    {
      id: 'express-green',
      name: 'Express Green',
      description: 'Fast delivery with partial offset',
      price: 12.99,
      days: '2-3 business days',
      carbonNeutral: false,
      co2Impact: 2.5
    },
    {
      id: 'standard',
      name: 'Standard Shipping',
      description: 'Regular delivery service',
      price: 3.99,
      days: '7-10 business days',
      carbonNeutral: false,
      co2Impact: 3.8
    }
  ];

  useEffect(() => {
    // Mock group buy suggestions based on cart items
    const suggestions: GroupBuySuggestion[] = [
      {
        id: 'gb1',
        name: 'Eco Kitchen Bundle',
        matchingProducts: ['Bamboo Utensil Set'],
        savings: 12.50,
        co2Reduction: 3.2,
        participantsNeeded: 3,
        deadline: '2025-06-25'
      },
      {
        id: 'gb2',
        name: 'Sustainable Living Pack',
        matchingProducts: ['Reusable Water Bottle', 'Bamboo Utensil Set'],
        savings: 18.75,
        co2Reduction: 5.8,
        participantsNeeded: 2,
        deadline: '2025-06-24'
      }
    ];
    setGroupBuySuggestions(suggestions);
  }, []);

  const calculateTotalCO2 = () => {
    const itemsCO2 = mockItems.reduce((total, item) => total + (item.co2Impact * item.quantity), 0);
    const packagingCO2 = packagingOptions.find(p => p.id === selectedPackaging)?.co2Difference || 0;
    const shippingCO2 = shippingOptions.find(s => s.id === selectedShipping)?.co2Impact || 0;
    return Math.max(0, itemsCO2 + packagingCO2 + shippingCO2).toFixed(1);
  };

  const calculateTotal = () => {
    const subtotal = mockItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const packagingAdjustment = packagingOptions.find(p => p.id === selectedPackaging)?.priceAdjustment || 0;
    const shippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 0;
    const discount = promoApplied ? subtotal * 0.1 : 0;
    return (subtotal + packagingAdjustment + shippingCost - discount).toFixed(2);
  };

  const getAverageScore = () => {
    if (mockItems.length === 0) return 0;
    const totalScore = mockItems.reduce((sum, item) => sum + item.earthScore, 0);
    return Math.round(totalScore / mockItems.length);
  };

  const handleApplyPromo = () => {
    if (promoCode.toLowerCase() === 'green10') {
      setPromoApplied(true);
    }
  };

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      // Show auth modal or redirect to login
      navigate(ROUTES.LOGIN);
    } else {
      navigate(ROUTES.CHECKOUT, {
        state: {
          packaging: selectedPackaging,
          shipping: selectedShipping,
          total: calculateTotal(),
          co2Impact: calculateTotalCO2()
        }
      });
    }
  };

  // Helper function to get category image (add this near the top of the component)
  const getCategoryImage = (category?: string): string => {
    const categoryImages: { [key: string]: string } = {
      home: "/images/home.png",
      kitchen: "/images/kitchen.png", 
      electronics: "/images/electronics.png",
      beauty: "/images/beauty.png",
      clothing: "/images/clothing.png",
    };
    
    const categoryKey = category?.toLowerCase() || 'home';
    return categoryImages[categoryKey] || "/images/home.png";
  };

  // Add this section where cart items are displayed (around line 200-250)
  const renderCartItems = () => (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} key={item.id}>
          <Card elevation={2} sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Product Image */}
              <Grid item xs={12} sm={2}>
                <Box
                  component="img"
                  src={item.image || getCategoryImage(item.category)}
                  alt={item.name}
                  sx={{
                    width: '100%',
                    height: 100,
                    objectFit: 'cover',
                    borderRadius: 2,
                    backgroundColor: '#f5f5f5'
                  }}
                />
              </Grid>
              
              {/* Product Details */}
              <Grid item xs={12} sm={4}>
                <Typography variant="h6" gutterBottom>
                  {item.name}
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    icon={<EcoRounded />}
                    label={`EarthScore: ${item.earthScore}/100`}
                    color={item.earthScore >= 80 ? 'success' : item.earthScore >= 60 ? 'warning' : 'error'}
                    size="small"
                  />
                  {item.recyclable && (
                    <Chip
                      icon={<Recycling />}
                      label="Recyclable"
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Category: {item.category}
                </Typography>
              </Grid>
              
              {/* Price */}
              <Grid item xs={6} sm={2}>
                <Typography variant="h6" color="primary">
                  ${item.price.toFixed(2)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  per unit
                </Typography>
              </Grid>
              
              {/* Quantity Controls */}
              <Grid item xs={6} sm={2}>
                <Box display="flex" alignItems="center" justifyContent="center">
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Remove />
                  </IconButton>
                  <Typography sx={{ mx: 2, minWidth: 30, textAlign: 'center' }}>
                    {item.quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Grid>
              
              {/* Subtotal & Remove */}
              <Grid item xs={12} sm={2}>
                <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                  <Typography variant="h6">
                    ${(item.price * item.quantity).toFixed(2)}
                  </Typography>
                  <Button
                    startIcon={<Delete />}
                    color="error"
                    size="small"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (mockItems.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingCart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start shopping for sustainable products!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<Nature />}
              onClick={() => navigate('/greencart')}
              sx={{ minWidth: 200 }}
            >
              Shop Sustainable Products
            </Button>
            <Button
              variant="outlined"
              color="success"
              size="large"
              startIcon={<Calculate />}
              onClick={() => navigate('/greencart/calculator')}
              sx={{ minWidth: 300 }}
            >
              Calculate Impact of a product via EarthScore Intelligence
            </Button>
          </Box>
          
          {/* Browse by Category */}
          <Box sx={{ mt: 6 }}>
            <Typography variant="h6" gutterBottom>
              Browse by Category
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              {['Kitchen', 'Electronics', 'Home', 'Beauty', 'Clothing'].map((category) => (
                <Grid item key={category}>
                  <Paper
                    sx={{
                      p: 3,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: 120,
                      textAlign: 'center',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        bgcolor: 'action.hover'
                      }
                    }}
                    onClick={() => navigate(`/greencart?category=${category.toLowerCase()}`)}
                  >
                    <Box
                      component="img"
                      src={`/images/${category.toLowerCase()}.png`}
                      alt={category}
                      sx={{
                        width: 60,
                        height: 60,
                        objectFit: 'cover',
                        borderRadius: 1,
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      {category}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Your Sustainable Cart
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cart Items ({mockItems.length})
            </Typography>
            
            {renderCartItems()}
          </Paper>

          {/* Group Buy Suggestions */}
          <Paper sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <GroupAdd sx={{ mr: 1 }} />
              Join a Group Buy & Save More!
            </Typography>
            
            <Grid container spacing={2}>
              {groupBuySuggestions.map((suggestion) => (
                <Grid item xs={12} md={6} key={suggestion.id}>
                  <Card sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 }
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {suggestion.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Includes: {suggestion.matchingProducts.join(', ')}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Chip 
                          label={`Save $${suggestion.savings}`} 
                          size="small" 
                          color="success"
                          icon={<TrendingDown />}
                        />
                        <Chip 
                          label={`-${suggestion.co2Reduction}kg CO2`} 
                          size="small" 
                          color="primary"
                          icon={<Co2 />}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption">
                          {suggestion.participantsNeeded} more needed
                        </Typography>
                        <Button size="small" endIcon={<ChevronRight />}>
                          Join Group
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Packaging Options */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Inventory2Rounded sx={{ mr: 1 }} />
              Choose Your Packaging
            </Typography>
            
            <RadioGroup
              value={selectedPackaging}
              onChange={(e) => setSelectedPackaging(e.target.value)}
            >
              <Grid container spacing={2}>
                {packagingOptions.map((option) => (
                  <Grid item xs={12} sm={6} key={option.id}>
                    <Card 
                      sx={{ 
                        border: selectedPackaging === option.id ? '2px solid' : '1px solid',
                        borderColor: selectedPackaging === option.id ? 'success.main' : 'divider',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => setSelectedPackaging(option.id)}
                    >
                      <CardContent>
                        <FormControlLabel
                          value={option.id}
                          control={<Radio color="success" />}
                          label={
                            <Box sx={{ width: '100%' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                {option.icon}
                                <Typography variant="subtitle1" sx={{ ml: 1, flex: 1 }}>
                                  {option.name}
                                </Typography>
                                <Chip 
                                  label={`Score: ${option.impactScore}`} 
                                  size="small" 
                                  color={option.impactScore > 80 ? 'success' : option.impactScore > 50 ? 'warning' : 'default'}
                                />
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {option.description}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Chip 
                                  label={`${option.co2Difference}kg CO2`} 
                                  size="small" 
                                  variant="outlined"
                                  color={option.co2Difference < 0 ? 'success' : 'default'}
                                />
                                {option.priceAdjustment !== 0 && (
                                  <Chip 
                                    label={option.priceAdjustment > 0 ? `+$${option.priceAdjustment}` : `-$${Math.abs(option.priceAdjustment)}`} 
                                    size="small" 
                                    variant="outlined"
                                    color={option.priceAdjustment < 0 ? 'success' : 'error'}
                                  />
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {option.features.map((feature, i) => (
                                  <Typography key={i} variant="caption" sx={{ 
                                    bgcolor: 'action.hover', 
                                    px: 1, 
                                    py: 0.5, 
                                    borderRadius: 1 
                                  }}>
                                    {feature}
                                  </Typography>
                                ))}
                              </Box>
                            </Box>
                          }
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </RadioGroup>
          </Paper>

          {/* Shipping Options */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalShipping sx={{ mr: 1 }} />
              Select Shipping Method
            </Typography>
            
            <RadioGroup
              value={selectedShipping}
              onChange={(e) => setSelectedShipping(e.target.value)}
            >
              {shippingOptions.map((option) => (
                <Card 
                  key={option.id}
                  sx={{ 
                    mb: 2,
                    border: selectedShipping === option.id ? '2px solid' : '1px solid',
                    borderColor: selectedShipping === option.id ? 'success.main' : 'divider',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedShipping(option.id)}
                >
                  <CardContent>
                    <FormControlLabel
                      value={option.id}
                      control={<Radio color="success" />}
                      label={
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ flex: 1 }}>
                              {option.name}
                              {option.carbonNeutral && (
                                <Chip 
                                  label="Carbon Neutral" 
                                  size="small" 
                                  color="success" 
                                  sx={{ ml: 1 }}
                                  icon={<CheckCircle />}
                                />
                              )}
                            </Typography>
                            <Typography variant="h6">
                              ${option.price}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {option.description} • {option.days}
                          </Typography>
                          {option.co2Impact > 0 && (
                            <Typography variant="caption" color="warning.main">
                              +{option.co2Impact}kg CO2 emissions
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </Paper>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            
            {/* Carbon Impact Visualization */}
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                cursor: 'pointer'
              }}
              onClick={() => setShowImpactDetails(!showImpactDetails)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Co2 sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle1">
                    Carbon Impact
                  </Typography>
                </Box>
                {showImpactDetails ? <ExpandLess /> : <ExpandMore />}
              </Box>
              
              <Typography variant="h4" sx={{ mt: 1, color: 'primary.main' }}>
                {calculateTotalCO2()}kg CO2
              </Typography>
              
              <Collapse in={showImpactDetails}>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Products: {mockItems.reduce((sum, item) => sum + item.co2Impact * item.quantity, 0).toFixed(1)}kg
                  </Typography>
                  <Typography variant="body2">
                    Packaging: {packagingOptions.find(p => p.id === selectedPackaging)?.co2Difference || 0}kg
                  </Typography>
                  <Typography variant="body2">
                    Shipping: +{shippingOptions.find(s => s.id === selectedShipping)?.co2Impact || 0}kg
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    🌳 Equivalent to planting {Math.ceil(parseFloat(calculateTotalCO2()) / 20)} trees
                  </Typography>
                </Box>
              </Collapse>
            </Paper>

            {/* EarthScore Average */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Average EarthScore
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', mt: 1 }}>
                <CircularProgress
                  variant="determinate"
                  value={getAverageScore()}
                  size={100}
                  thickness={4}
                  sx={{
                    color: getAverageScore() > 80 ? 'success.main' : getAverageScore() > 60 ? 'warning.main' : 'error.main'
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h4" component="div" color="text.secondary">
                    {getAverageScore()}
                  </Typography>
                </Box>
              </Box>
              {getAverageScore() < 70 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    💡 Tip: Choose products with higher EarthScores to reduce your environmental impact!
                  </Typography>
                </Alert>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Price Breakdown */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>${mockItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Packaging</Typography>
                <Typography>
                  {packagingOptions.find(p => p.id === selectedPackaging)?.priceAdjustment! > 0 ? '+' : ''}
                  ${packagingOptions.find(p => p.id === selectedPackaging)?.priceAdjustment?.toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography>${shippingOptions.find(s => s.id === selectedShipping)?.price.toFixed(2)}</Typography>
              </Box>
              {promoApplied && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography>Promo (GREEN10)</Typography>
                  <Typography>-10%</Typography>
                </Box>
              )}
            </Box>

            {/* Promo Code */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  size="small"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  disabled={promoApplied}
                />
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={handleApplyPromo}
                  disabled={promoApplied}
                >
                  Apply
                </Button>
              </Box>
              {!promoApplied && (
                <Typography variant="caption" color="text.secondary">
                  Try: GREEN10 for 10% off
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6">Total</Typography>
              <Typography variant="h6">${calculateTotal()}</Typography>
            </Box>

            {/* Make Cart Greener Suggestion */}
            <Alert severity="success" sx={{ mb: 3 }}>
              <Typography variant="body2" fontWeight="bold">
                🌱 Make your cart greener!
              </Typography>
              <Typography variant="body2">
                Switch to Eco Hero packaging to save an additional 1kg of CO2
              </Typography>
            </Alert>

            {/* Checkout Button */}
            <Button
              variant="contained"
              color="success"
              size="large"
              fullWidth
              onClick={handleProceedToCheckout}
              startIcon={<CheckCircle />}
            >
              Proceed to Checkout
            </Button>

            {/* Trust Badges */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                🔒 Secure Checkout • 🌿 100% Eco-Friendly
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Cart;