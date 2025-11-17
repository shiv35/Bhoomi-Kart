import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  GridLegacy as Grid, 
  Card, 
  CardContent,
  Button,
  IconButton,
  Divider,
  Alert
} from '@mui/material';
import { Trash2, Plus, Minus, ShoppingBag, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../utils/constants';

const CartPage: React.FC = () => {
  const { items, removeFromCart, updateQuantity, getTotalPrice, getAverageEarthScore, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);

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

  const handleCheckout = () => {
    if (!currentUser) {
      alert('Please login to proceed with checkout');
      navigate(ROUTES.LOGIN);
      return;
    }

    console.log('Cart items being sent to checkout:', items);

    // Navigate to the new checkout flow
    navigate(ROUTES.CHECKOUT);
  };

  const getEarthScoreColor = (score: number) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#81c784';
    if (score >= 40) return '#ffb74d';
    return '#ff7043';
  };

  if (orderPlaced) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box sx={{ fontSize: 80, mb: 3 }}>🎉</Box>
          <Typography variant="h3" gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Thank you for shopping sustainably. Redirecting to your dashboard...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 24px',
              backgroundColor: '#f0f4f8',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ShoppingBag size={60} className="text-gray-300" />
          </Box>
          <Typography variant="h4" gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Start adding sustainable products to make a positive impact!
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<Leaf />}
              onClick={() => navigate('/greencart')}
              sx={{ minWidth: 200 }}
            >
              Shop Sustainable Products
            </Button>
            <Button
              variant="outlined"
              color="success"
              size="large"
              onClick={() => navigate('/greencart/calculator')}
              sx={{ minWidth: 300 }}
            >
              Calculate Impact of a product via EarthScore Intelligence
            </Button>
          </Box>
          
          {/* Browse by Category Section */}
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
        </Box>
      </Container>
    );
  }

  const avgEarthScore = getAverageEarthScore();
  const totalCO2Saved = items.reduce((total, item) => {
    // Mock calculation: higher EarthScore = more CO2 saved
    return total + (item.earthScore / 20) * item.quantity;
  }, 0);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <Card key={item.id} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2}>
                    <Box
                      component="img"
                      src={item.image || getCategoryImage(item.category)}
                      alt={item.name}
                      sx={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover',
                        borderRadius: 1,
                        backgroundColor: '#f5f5f5'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="h6">{item.name}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Leaf size={16} className="text-green-500" />
                      <Typography variant="body2" color="text.secondary">
                        EarthScore: {item.earthScore}/100
                      </Typography>
                    </Box>
                    {item.category && (
                      <Typography variant="caption" color="text.secondary">
                        Category: {item.category}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Typography variant="body1">${item.price.toFixed(2)}</Typography>
                  </Grid>
                  <Grid item xs={4} sm={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} />
                      </IconButton>
                      <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                      <IconButton 
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </IconButton>
                    </Box>
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <Typography variant="h6">
                      ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <IconButton 
                      color="error"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={20} />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>
              Order Summary
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Subtotal</Typography>
                <Typography>${getTotalPrice().toFixed(2)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Eco Packaging</Typography>
                <Typography color="success.main">FREE</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Green Delivery</Typography>
                <Typography>$4.99</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  ${(getTotalPrice() + 4.99).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            <Paper sx={{ p: 2, mb: 3, bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
              <Typography variant="subtitle2" gutterBottom color="success.dark">
                Environmental Impact
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Avg EarthScore</Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: getEarthScoreColor(avgEarthScore), fontWeight: 'bold' }}
                >
                  {avgEarthScore}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">CO2 Saved</Typography>
                <Typography variant="body2" color="success.dark">
                  {totalCO2Saved.toFixed(1)} kg
                </Typography>
              </Box>
            </Paper>

            <Button 
              variant="contained" 
              color="success"
              fullWidth
              size="large"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Join a group buy to save an additional 15% and reduce packaging by 60%!
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CartPage;