import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import {
  ShoppingCart,
  Co2Rounded,
  TrendingUp,
  Refresh
} from '@mui/icons-material';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getRecommendationsFromCart, getRecommendations, Recommendation } from '../services/api';

interface ProductRecommendationsProps {
  maxItems?: number;
  title?: string;
  showTitle?: boolean;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  maxItems = 5,
  title = "Recommended for You",
  showTitle = true
}) => {
  const { items, addToCart } = useCart();
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    if (items.length === 0) {
      setRecommendations([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (currentUser?.uid) {
        // Use user ID if available
        response = await getRecommendationsFromCart(currentUser.uid, maxItems);
      } else {
        // Use cart items directly
        const cartItemIds = items.map(item => parseInt(item.id));
        response = await getRecommendations(cartItemIds, maxItems);
      }

      if (response.success && response.recommendations) {
        setRecommendations(response.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [items, currentUser, maxItems]);

  const handleAddToCart = (product: Recommendation) => {
    addToCart({
      product_id: product.product_id,
      product_name: product.product_name,
      name: product.product_name,
      price: product.price,
      earth_score: product.earth_score,
      earthScore: product.earth_score,
      category: product.category,
      image_url: product.image_url,
      image: product.image_url
    });
  };

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

  if (items.length === 0) {
    return null; // Don't show recommendations if cart is empty
  }

  if (loading) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Finding perfect recommendations for you...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Alert 
          severity="warning" 
          action={
            <Button size="small" onClick={fetchRecommendations}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box sx={{ py: 3 }}>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp color="primary" />
            {title}
          </Typography>
          <Tooltip title="Refresh recommendations">
            <IconButton onClick={fetchRecommendations} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <Grid container spacing={2}>
        {recommendations.map((product) => (
          <Grid key={product.product_id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={product.image_url || getCategoryImage(product.category)}
                alt={product.product_name}
                sx={{
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h3" noWrap sx={{ mb: 1 }}>
                  {product.product_name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip
                    icon={<Co2Rounded />}
                    label={`EarthScore: ${product.earth_score}`}
                    color={product.earth_score >= 80 ? 'success' : product.earth_score >= 60 ? 'warning' : 'error'}
                    size="small"
                  />
                </Box>

                <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                  ${product.price.toFixed(2)}
                </Typography>

                {product.confidence > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {product.reason} ({(product.confidence * 100).toFixed(0)}% match)
                  </Typography>
                )}
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<ShoppingCart />}
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProductRecommendations;
