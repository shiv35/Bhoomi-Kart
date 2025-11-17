// src/components/ProductDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, getRecommendations, Product } from '../services/api';
import {
  GridLegacy as Grid,  // <-- use the legacy Grid so <Grid item xs=…> works
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from '@mui/material';

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const productData = await getProductById(parseInt(productId, 10));
        setProduct(productData);

        const recommendationData = await getRecommendations(parseInt(productId, 10));
        setRecommendations(recommendationData);

        setError(null);
      } catch (err) {
        setError('Failed to fetch product details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return <Alert severity="error">{error || 'Product not found.'}</Alert>;
  }

  return (
    <Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box
            sx={{
              height: 400,
              backgroundColor: '#f5f5f5',
              borderRadius: 2
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h4" component="h1" gutterBottom>
            {product.product_name}
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            ${product.price.toFixed(2)}
          </Typography>
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: '#e6f4ea',
              borderRadius: 2,
              textAlign: 'center',
              maxWidth: '200px'
            }}
          >
            <Typography
              variant="h3"
              component="p"
              sx={{ fontWeight: 'bold', color: '#2e7d32' }}
            >
              {product.earth_score}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              EarthScore
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Greener Alternatives
        </Typography>
        <Grid container spacing={4}>
          {recommendations.map((rec) => (
            <Grid item key={rec.product_id} xs={12} sm={6} md={4}>
              <Card
                component={Link}
                to={`/products/${rec.product_id}`}
                sx={{ textDecoration: 'none' }}
              >
                <CardContent>
                  <Typography variant="h6">{rec.product_name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    EarthScore: {rec.earth_score}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductDetail;
