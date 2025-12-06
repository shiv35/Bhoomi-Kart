import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GridLegacy as Grid } from '@mui/material';
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
  console.log('[ProductRecommendations] Component initialized with props:', { maxItems, title, showTitle });

  const { items, addToCart } = useCart();
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('[ProductRecommendations] Current state:', {
    cartItemsCount: items.length,
    cartItems: items,
    currentUser: currentUser ? { uid: currentUser.uid, email: currentUser.email } : null,
    recommendationsCount: recommendations.length,
    loading,
    error
  });

  const fetchRecommendations = async () => {
    console.log('[ProductRecommendations] fetchRecommendations called');
    console.log('[ProductRecommendations] Cart items:', items);
    console.log('[ProductRecommendations] Current user:', currentUser);

    if (items.length === 0) {
      console.log('[ProductRecommendations] Cart is empty, skipping fetch');
      setRecommendations([]);
      return;
    }

    console.log('[ProductRecommendations] Starting to fetch recommendations...');
    setLoading(true);
    setError(null);

    try {
      let response;

      // if (currentUser?.uid) {
      //   console.log('[ProductRecommendations] Using user-based recommendations API with uid:', currentUser.uid, 'maxItems:', maxItems);
      //   // Use user ID if available
      //   response = await getRecommendationsFromCart(currentUser.uid, maxItems);
      // } else {
      // Use cart items directly
      const cartItemIds = items.map(item => parseInt(item.id));
      console.log('[ProductRecommendations] Using cart-based recommendations API with itemIds:', cartItemIds, 'maxItems:', maxItems);
      response = await getRecommendations(cartItemIds, maxItems);
      // }

      console.log('[ProductRecommendations] API Response received:', response);

      if (response.success && response.recommendations) {
        console.log('[ProductRecommendations] Setting recommendations:', response.recommendations);
        setRecommendations(response.recommendations);
      } else {
        console.log('[ProductRecommendations] Response was not successful or no recommendations:', response);
        setRecommendations([]);
      }
    } catch (err: any) {
      console.error('[ProductRecommendations] Error fetching recommendations:', err);
      setError(err.message || 'Failed to load recommendations');
      setRecommendations([]);
    } finally {
      console.log('[ProductRecommendations] Fetch completed, setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[ProductRecommendations] useEffect triggered - dependencies changed:', {
      itemsCount: items.length,
      currentUserChanged: currentUser ? { uid: currentUser.uid } : null,
      maxItems
    });
    fetchRecommendations();
  }, [items, currentUser, maxItems]);

  const handleAddToCart = (product: Recommendation) => {
    console.log('[ProductRecommendations] handleAddToCart called with product:', product);
    const cartItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      name: product.product_name,
      price: product.price,
      earth_score: product.earth_score,
      earthScore: product.earth_score,
      category: product.category,
      image_url: product.image_url,
      image: product.image_url
    };
    console.log('[ProductRecommendations] Adding to cart:', cartItem);
    addToCart(cartItem);
    console.log('[ProductRecommendations] Item added to cart successfully');
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
    console.log('[ProductRecommendations] Rendering: Cart is empty, returning null');
    return null; // Don't show recommendations if cart is empty
  }

  if (loading) {
    console.log('[ProductRecommendations] Rendering: Loading state');
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
          Finding perfect recommendations for you...
        </Typography>
      </Box>
    );
  }

  if (error) {
    console.log('[ProductRecommendations] Rendering: Error state:', error);
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
    console.log('[ProductRecommendations] Rendering: No recommendations available, returning null');
    return null;
  }

  console.log('[ProductRecommendations] Rendering: Recommendations list with', recommendations.length, 'items');
  return (
    <Box sx={{ py: 2 }}>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            <TrendingUp color="primary" sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            {title}
          </Typography>
          <Tooltip title="Refresh recommendations">
            <IconButton onClick={fetchRecommendations} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Grid container spacing={1.5}>
        {recommendations.map((product) => (
          <Grid
            item
            xs={6}
            sm={4}
            md={4}
            lg={4}
            key={product.product_id}
            sx={{
              display: 'flex'
            }}
          >
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
                height="140"
                image={product.image_url || getCategoryImage(product.category)}
                alt={product.product_name}
                sx={{
                  objectFit: 'cover',
                  backgroundColor: '#f5f5f5'
                }}
              />
              <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Typography
                  variant="body2"
                  component="h3"
                  sx={{
                    mb: 0.5,
                    fontWeight: 600,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    minHeight: '2.5em'
                  }}
                >
                  {product.product_name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Chip
                    icon={<Co2Rounded sx={{ fontSize: '14px !important' }} />}
                    label={`${product.earth_score}`}
                    color={product.earth_score >= 80 ? 'success' : product.earth_score >= 60 ? 'warning' : 'error'}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      '& .MuiChip-label': { px: 0.75 }
                    }}
                  />
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5, fontWeight: 600 }}>
                  ${product.price.toFixed(2)}
                </Typography>

                {product.confidence > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontSize: '0.65rem',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {(product.confidence * 100).toFixed(0)}% match
                  </Typography>
                )}
              </CardContent>

              <CardActions sx={{ p: 1, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="small"
                  startIcon={<ShoppingCart sx={{ fontSize: '16px' }} />}
                  onClick={() => handleAddToCart(product)}
                  sx={{
                    fontSize: '0.75rem',
                    py: 0.5
                  }}
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
