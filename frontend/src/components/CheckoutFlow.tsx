// src/components/CheckoutFlow.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  GridLegacy as Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Badge,
  IconButton,
  Tooltip,
  Switch,
  InputLabel,
  Select,
  MenuItem,
  CardMedia,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  FormGroup
} from '@mui/material';
import {
  CheckCircle,
  Email,
  LocalShipping,
  Payment,
  Co2,
  Celebration,
  Nature,
  Recycling,
  Inventory2Rounded,
  Group,
  GroupAdd,
  TrendingDown,
  Timer,
  LocationOn,
  People,
  Info,
  ArrowForward,
  Person,
  Phone,
  CreditCard,
  AccountBalance,
  ShoppingCart,
  Forest
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import GroupBuyingStep from './checkout/GroupBuyingStep';
import { ROUTES } from '../utils/constants';

interface OrderConfirmation {
  orderId: string;
  estimatedDelivery: string;
  co2Saved: number;
  impactPoints: number;
  emailSent: boolean;
  groupBuy?: {
    name: string;
    saved: number;
  } | null;
  status: 'available' | 'almost-full' | 'full';
}

interface PackagingOption {
  id: string;
  name: string;
  description: string;
  impactScore: number;
  co2Difference: number;
  priceAdjustment: number;
  features: string[];
}

interface GroupBuyOption {
  id: string;
  name: string;
  matchingProducts: string[];
  participants: {
    name: string;
    pincode: string;
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
}

const CheckoutFlow: React.FC = () => {
  const { items, getTotalPrice, getAverageEarthScore, clearCart } = useCart();
  console.log('=== CHECKOUT FLOW DEBUG ===');
  console.log('Cart items passed to checkout:', items);
  console.log('Item categories:', items.map(item => ({
    name: item.name,
    category: item.category || 'MISSING CATEGORY!'
  })));
  console.log('=========================');
  const navigate = useNavigate();
  const location = useLocation();
  const cartState = location.state as {
    packaging?: string;
    shipping?: string;
    total?: string;
    co2Impact?: string;
  } | undefined;

  // Use these values in your checkout flow
  const selectedShipping = cartState?.shipping || 'carbon-neutral';
  const cartTotal = cartState?.total || '0.00';
  const totalCO2Impact = cartState?.co2Impact || '0.0';

  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);

  // New state for group buying
  const [skipGroupBuy, setSkipGroupBuy] = useState(false);
  const [selectedGroupBuy, setSelectedGroupBuy] = useState<string | null>(null);
  const [groupBuyOptions, setGroupBuyOptions] = useState<GroupBuyOption[]>([]);
  const [createNewGroup, setCreateNewGroup] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    pincode: '',
    phone: ''
  });
  const [shippingMethod, setShippingMethod] = useState('carbon-neutral');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [selectedPackaging, setSelectedPackaging] = useState('eco-hero');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Updated steps to include group buying
  const steps = ['Group Buying', 'Shipping & Packaging', 'Payment', 'Review', 'Confirmation'];

  useEffect(() => {
    // Fetch group buy options based on cart items and user location
    fetchGroupBuyOptions();
  }, []);

  const fetchGroupBuyOptions = async () => {
    // Mock data - in production, this would call your clustering API
    const mockOptions: GroupBuyOption[] = [
      {
        id: 'gb1',
        name: 'Mumbai Central Eco Group',
        matchingProducts: items.slice(0, 2).map(item => item.name),
        participants: [
          { name: 'Priya S.', pincode: '400705', avatar: '👩' },
          { name: 'Rahul M.', pincode: '400703', avatar: '👨' },
          { name: 'Amit K.', pincode: '400706', avatar: '🧑' }
        ],
        savings: {
          cost: 25.50,
          co2: 4.2,
          percentage: 20
        },
        minParticipants: 5,
        currentParticipants: 3,
        deadline: '2025-06-23',
        estimatedDelivery: '2025-06-26',
        status: 'available'
      },
      {
        id: 'gb2',
        name: 'Andheri West Green Collective',
        matchingProducts: items.map(item => item.name),
        participants: [
          { name: 'Sneha P.', pincode: '400701', avatar: '👩' },
          { name: 'Vikram R.', pincode: '400702', avatar: '👨' },
          { name: 'Neha S.', pincode: '400704', avatar: '👩' },
          { name: 'Arjun D.', pincode: '400705', avatar: '👨' }
        ],
        savings: {
          cost: 32.75,
          co2: 5.8,
          percentage: 25
        },
        minParticipants: 5,
        currentParticipants: 4,
        deadline: '2025-06-22',
        estimatedDelivery: '2025-06-25',
        status: 'almost-full'
      }
    ];
    setGroupBuyOptions(mockOptions);
  };

  const packagingOptions: PackagingOption[] = [
    {
      id: 'eco-hero',
      name: 'Eco Hero Package',
      description: '100% compostable materials, zero plastic',
      impactScore: 95,
      co2Difference: -2.5,
      priceAdjustment: 0,
      features: ['Compostable', 'Plant-based ink', 'Minimal material']
    },
    {
      id: 'carbon-neutral',
      name: 'Carbon Neutral Box',
      description: 'Recycled materials with carbon offset',
      impactScore: 80,
      co2Difference: -1.5,
      priceAdjustment: -0.50,
      features: ['100% Recycled', 'Carbon offset', 'Reusable']
    },
    {
      id: 'standard-green',
      name: 'Standard Green',
      description: 'Recyclable materials, reduced packaging',
      impactScore: 65,
      co2Difference: -0.5,
      priceAdjustment: -1.00,
      features: ['Recyclable', 'Reduced size', 'Eco-friendly tape']
    }
  ];

  const handleNext = () => {
    if (activeStep === 0 && skipGroupBuy) {
      // Skip group buying step
      setActiveStep(1);
    } else if (activeStep === steps.length - 2) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const groupSavings = selectedGroupBuy
        ? groupBuyOptions.find(g => g.id === selectedGroupBuy)?.savings
        : null;

      const confirmation: OrderConfirmation = {
        orderId: `ORD-${Date.now()}`,
        estimatedDelivery: '3-5 business days',
        co2Saved: (getShippingImpact(shippingMethod).co2 || 0) + (groupSavings?.co2 || 0),
        impactPoints: Math.round(getAverageEarthScore() / 10),
        emailSent: emailNotifications,
        groupBuy: selectedGroupBuy ? {
          name: groupBuyOptions.find(g => g.id === selectedGroupBuy)?.name || '',
          saved: groupSavings?.cost || 0
        } : null,
        status: 'available'
      };

      setOrderConfirmation(confirmation);
      setActiveStep(steps.length - 1);

      setTimeout(() => {
        clearCart();
      }, 3000);

    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getShippingImpact = (method: string) => {
    switch (method) {
      case 'carbon-neutral':
        return { co2: 0.5, days: 5, label: 'Carbon Neutral (EV)' };
      case 'standard':
        return { co2: 2.0, days: 3, label: 'Standard Delivery' };
      case 'express':
        return { co2: 4.5, days: 1, label: 'Express Delivery' };
      default:
        return { co2: 2.0, days: 3, label: 'Standard' };
    }
  };

  // Group Buying Step
  const renderGroupBuyingStep = () => (
    <GroupBuyingStep
      cartItems={items}
      userPincode={shippingAddress.pincode || '400705'}
      selectedGroupBuy={selectedGroupBuy}
      onSelectGroup={setSelectedGroupBuy}
      skipGroupBuy={skipGroupBuy}
      onSkipChange={setSkipGroupBuy}
      onPincodeChange={(pincode) => setShippingAddress({ ...shippingAddress, pincode })}
    />
  );

  const renderShippingStep = () => (
    <Box>
      {selectedGroupBuy && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body1">
            🎉 You're part of the "{groupBuyOptions.find(g => g.id === selectedGroupBuy)?.name}" group buy!
            Your order will be combined with {groupBuyOptions.find(g => g.id === selectedGroupBuy)?.currentParticipants} other participants.
          </Typography>
        </Alert>
      )}

      <Typography variant="h6" gutterBottom>
        Shipping Information
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Full Name"
            value={shippingAddress.fullName}
            onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={shippingAddress.address}
            onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="City"
            value={shippingAddress.city}
            onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pincode"
            value={shippingAddress.pincode}
            onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Phone Number"
            value={shippingAddress.phone}
            onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
            required
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      {/* Packaging Options Section */}
      <Typography variant="h6" gutterBottom>
        Choose Your Packaging
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select sustainable packaging that aligns with your values
      </Typography>

      <RadioGroup
        value={selectedPackaging}
        onChange={(e) => setSelectedPackaging(e.target.value)}
      >
        <Grid container spacing={2}>
          {packagingOptions.map((option) => (
            <Grid item xs={12} md={4} key={option.id}>
              <Card
                sx={{
                  border: selectedPackaging === option.id ? '2px solid' : '1px solid',
                  borderColor: selectedPackaging === option.id ? 'success.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': { boxShadow: 3 }
                }}
                onClick={() => setSelectedPackaging(option.id)}
              >
                <CardContent>
                  <FormControlLabel
                    value={option.id}
                    control={<Radio color="success" />}
                    label={
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {option.id === 'eco-hero' && <Nature sx={{ color: 'success.main', mr: 1 }} />}
                          {option.id === 'carbon-neutral' && <Co2 sx={{ color: 'primary.main', mr: 1 }} />}
                          {option.id === 'standard-green' && <Recycling sx={{ color: 'warning.main', mr: 1 }} />}
                          <Typography variant="subtitle1">{option.name}</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {option.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Chip
                            label={`Impact Score: ${option.impactScore}`}
                            size="small"
                            color="success"
                            sx={{ mr: 1 }}
                          />
                          <Chip
                            label={`${option.co2Difference}kg CO2`}
                            size="small"
                            variant="outlined"
                          />
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
                        {option.priceAdjustment !== 0 && (
                          <Typography variant="subtitle2" color="success.main" sx={{ mt: 1 }}>
                            {option.priceAdjustment < 0 ? `Save $${Math.abs(option.priceAdjustment)}` : `+$${option.priceAdjustment}`}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </RadioGroup>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" gutterBottom>
        Shipping Method
      </Typography>
      <FormControl>
        <RadioGroup
          value={shippingMethod}
          onChange={(e) => setShippingMethod(e.target.value)}
        >
          <FormControlLabel
            value="carbon-neutral"
            control={<Radio color="success" />}
            label={
              <Box>
                <Typography>Carbon Neutral (EV)</Typography>
                <Typography variant="body2" color="text.secondary">
                  5 days • 0.5kg CO2 • Recommended
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="standard"
            control={<Radio />}
            label={
              <Box>
                <Typography>Standard Delivery</Typography>
                <Typography variant="body2" color="text.secondary">
                  3 days • 2kg CO2
                </Typography>
              </Box>
            }
          />
          <FormControlLabel
            value="express"
            control={<Radio />}
            label={
              <Box>
                <Typography>Express Delivery</Typography>
                <Typography variant="body2" color="text.secondary">
                  1 day • 4.5kg CO2
                </Typography>
              </Box>
            }
          />
        </RadioGroup>
      </FormControl>

      <FormControlLabel
        control={
          <Switch
            checked={emailNotifications}
            onChange={(e) => setEmailNotifications(e.target.checked)}
            color="success"
          />
        }
        label="Send order confirmation and tracking updates via email"
        sx={{ mt: 2 }}
      />
    </Box>
  );

  const renderPaymentStep = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Payment Method
      </Typography>
      <FormControl component="fieldset">
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <FormControlLabel
            value="card"
            control={<Radio color="success" />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 1 }} />
                Credit/Debit Card
              </Box>
            }
          />
          <FormControlLabel
            value="upi"
            control={<Radio color="success" />}
            label="UPI"
          />
          <FormControlLabel
            value="netbanking"
            control={<Radio color="success" />}
            label="Net Banking"
          />
          <FormControlLabel
            value="cod"
            control={<Radio color="success" />}
            label="Cash on Delivery (+₹50)"
          />
        </RadioGroup>
      </FormControl>
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💚 Tip: Use digital payment methods to reduce paper waste and carbon footprint!
        </Typography>
      </Alert>
    </Box>
  );

  const renderReviewStep = () => {
    const pkgOpt = packagingOptions.find(p => p.id === selectedPackaging);
    const priceAdj = pkgOpt?.priceAdjustment ?? 0;
    const shippingImp = getShippingImpact(shippingMethod);
    const subtotal = getTotalPrice();
    const groupBuy = selectedGroupBuy ? groupBuyOptions.find(g => g.id === selectedGroupBuy) : null;
    const groupDiscount = groupBuy ? groupBuy.savings.cost : 0;
    const totalWithShipping = subtotal + 4.99 + priceAdj - groupDiscount;
    const avgScore = getAverageEarthScore();

    return (
      <Box>
        <Typography variant="h5" gutterBottom>Review Your Order</Typography>

        {/* Group Buy Info */}
        {groupBuy && (
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
            <Typography variant="subtitle1" gutterBottom>
              🎉 Group Buy Benefits Applied!
            </Typography>
            <Typography variant="body2">
              You're saving ${groupBuy.savings.cost} and {groupBuy.savings.co2}kg CO2 by joining "{groupBuy.name}"
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
              <AvatarGroup max={4} sx={{ mr: 2 }}>
                {groupBuy.participants.map((p, i) => (
                  <Avatar key={i} sx={{ width: 32, height: 32 }}>
                    {p.avatar}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="body2">
                Shopping together with {groupBuy.participants.length} neighbors
              </Typography>
            </Box>
          </Paper>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>Order Summary</Typography>
              {items.map(i => (
                <Box key={i.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{i.name} x{i.quantity}</Typography>
                  <Typography variant="body2">${(i.price * i.quantity).toFixed(2)}</Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography variant="body2">${subtotal.toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Shipping</Typography>
                <Typography variant="body2">$4.99</Typography>
              </Box>
              {priceAdj !== 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Packaging Adjustment</Typography>
                  <Typography variant="body2" color={priceAdj < 0 ? 'success.main' : 'text.primary'}>
                    {priceAdj < 0 ? '-' : '+'}${Math.abs(priceAdj).toFixed(2)}
                  </Typography>
                </Box>
              )}
              {groupBuy && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, color: 'success.main' }}>
                  <Typography>Group Buy Discount</Typography>
                  <Typography variant="body2">-${groupDiscount.toFixed(2)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">${totalWithShipping.toFixed(2)}</Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, mb: 3, bgcolor: 'success.light' }}>
              <Typography variant="h6" gutterBottom>Environmental Impact</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Average EarthScore:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{avgScore}/100</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Shipping CO2:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{shippingImp.co2}kg</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Packaging CO2:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{pkgOpt?.co2Difference ?? 0}kg</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Group Buy CO2 Saved:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{groupBuy?.savings.co2 ?? 0}kg</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Impact Points Earned:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  +{items.length * 10 + (pkgOpt?.impactScore ?? 0) + (groupBuy ? 20 : 0)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Packaging Information */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Selected Packaging: {pkgOpt?.name || 'Standard'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {pkgOpt?.description || 'Standard packaging'}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {pkgOpt?.features?.map((feature, i) => (
              <Chip key={i} label={feature} size="small" variant="outlined" />
            )) || []}
          </Box>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Shipping Address
          </Typography>
          <Typography variant="body2">
            {shippingAddress.fullName}
            <br />
            {shippingAddress.address}
            <br />
            {shippingAddress.city}, {shippingAddress.pincode}
            <br />
            Phone: {shippingAddress.phone}
          </Typography>
        </Paper>
      </Box>
    );
  };

  const renderConfirmationStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Celebration sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
      <Typography variant="h4" gutterBottom>Order Placed Successfully!</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Order ID: {orderConfirmation?.orderId}
      </Typography>

      {orderConfirmation?.groupBuy && (
        <Alert severity="success" sx={{ mb: 3, display: 'inline-flex' }}>
          <Group sx={{ mr: 1 }} />
          You saved ${orderConfirmation.groupBuy.saved} by joining "{orderConfirmation.groupBuy.name}" group buy!
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 4, justifyContent: 'center' }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <LocalShipping sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
            <Typography variant="body1">Estimated Delivery</Typography>
            <Typography variant="h6">{orderConfirmation?.estimatedDelivery}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Co2 sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
            <Typography variant="body1">CO2 Saved</Typography>
            <Typography variant="h6">{orderConfirmation?.co2Saved.toFixed(1)}kg</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
            <Typography variant="body1">Impact Points</Typography>
            <Typography variant="h6">+{orderConfirmation?.impactPoints}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {orderConfirmation?.emailSent && (
        <Alert severity="success" sx={{ mt: 4, display: 'inline-flex' }}>
          <Email sx={{ mr: 1 }} />
          Order confirmation sent to {currentUser?.email}
        </Alert>
      )}

      <Box sx={{ mt: 4 }}>
        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={() => navigate(ROUTES.DASHBOARD)}
          sx={{ mr: 2 }}
        >
          View Dashboard
        </Button>
        <Button variant="outlined" size="large" onClick={() => navigate(ROUTES.HOME)}>
          Continue Shopping
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderGroupBuyingStep();
      case 1:
        return renderShippingStep();
      case 2:
        return renderPaymentStep();
      case 3:
        return renderReviewStep();
      case 4:
        return renderConfirmationStep();
      default:
        return 'Unknown step';
    }
  };

  if (items.length === 0 && activeStep !== steps.length - 1) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">
          Your cart is empty. Add some products to checkout.
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(ROUTES.HOME)}
          sx={{ mt: 2 }}
        >
          Continue Shopping
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>Checkout</Typography>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Box sx={{ mt: 4 }}>
        {getStepContent(activeStep)}
        {activeStep < steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>Back</Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleNext}
              disabled={loading || (activeStep === 0 && !skipGroupBuy && !selectedGroupBuy)}
            >
              {loading
                ? <CircularProgress size={24} color="inherit" />
                : activeStep === steps.length - 2 ? 'Place Order' : 'Next'
              }
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default CheckoutFlow;
