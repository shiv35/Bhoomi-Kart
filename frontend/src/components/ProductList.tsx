// src/components/ProductList.tsx
import React, { useEffect, useState } from 'react';
import { getAllProducts, Product } from '../services/api';
import { Link } from 'react-router-dom';
import LandingPage from './LandingPage';

// Import the legacy Grid API so `item`, `xs`, `sm`, `md` all work as before:
import {
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Container
} from '@mui/material';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await getAllProducts();
        // Sort by earth_score descending
        const sortedData = data.sort((a, b) => b.earth_score - a.earth_score);
        setProducts(sortedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch products. Is the backend server running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <LandingPage />
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Shop Sustainably with EarthScore Intelligence
        </Typography>

        <Grid container spacing={4}>
          {products.map((product) => (
            <Grid item key={product.product_id} xs={12} sm={6} md={4}>
              <Link to={`/products/${product.product_id}`}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  <Box sx={{ height: 180, backgroundColor: '#f5f5f5' }} />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {product.product_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${product.price.toFixed(2)}
                    </Typography>
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        backgroundColor: '#e6f4ea',
                        borderRadius: 2,
                        textAlign: 'center'
                      }}
                    >
                      <Typography
                        variant="h5"
                        component="p"
                        sx={{ fontWeight: 'bold', color: '#2e7d32' }}
                      >
                        {product.earth_score}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        EarthScore
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default ProductList;
