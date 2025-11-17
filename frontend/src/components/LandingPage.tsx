// src/components/LandingPage.tsx
import React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  GridLegacy as Grid,  // ← use legacy Grid so `item`/`xs`/`sm` works
  Typography, 
  Paper 
} from '@mui/material';
import { Spa, ShutterSpeed, TrackChanges } from '@mui/icons-material';

const features = [
  {
    icon: <Spa sx={{ fontSize: 40 }} />,
    title: 'EarthScore Ratings',
    description: 'Every product rated for environmental impact with detailed sustainability metrics.',
  },
  {
    icon: <ShutterSpeed sx={{ fontSize: 40 }} />,
    title: 'AI Optimization',
    description: 'Smart algorithms group orders to minimize carbon footprint and maximize efficiency.',
  },
  {
    icon: <TrackChanges sx={{ fontSize: 40 }} />,
    title: 'Carbon Tracking',
    description: 'Real-time CO2 calculations for your purchases and shipping methods.',
  },
];

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'rgba(230, 244, 234, 0.5)', pt: 8, pb: 6 }}>
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Shop Sustainably with EarthScore Intelligence
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          paragraph
        >
          Our AI-powered platform groups your orders by environmental impact, calculates CO2 footprints, and helps you make eco-friendly choices.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button variant="contained" color="success" size="large">
            Start Shopping Green
          </Button>
        </Box>
      </Container>

      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid item key={feature.title} xs={12} sm={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                {feature.icon}
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mt: 1, fontWeight: 'medium' }}
                >
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
