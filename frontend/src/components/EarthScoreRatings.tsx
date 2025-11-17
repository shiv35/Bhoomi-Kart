import React from 'react';
import { Container, Typography, Box, Paper, GridLegacy as Grid, Card, CardContent } from '@mui/material';
import { Leaf, Award, TrendingUp, BarChart3 } from 'lucide-react';

const EarthScoreRatings: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Leaf className="text-green-600 mx-auto mb-4" size={64} />
        <Typography variant="h3" component="h1" gutterBottom>
          EarthScore Ratings
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Every product rated for environmental impact with detailed sustainability metrics
        </Typography>
      </Box>

      {/* What is EarthScore Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #e6f4ea 0%, #f1f8f4 100%)' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32' }}>
          What is EarthScore?
        </Typography>
        <Typography variant="body1" paragraph>
          EarthScore is our proprietary AI-powered rating system that evaluates products across multiple 
          environmental dimensions. Each product receives a score from 0-100, where higher scores indicate 
          better environmental performance.
        </Typography>
        <Typography variant="body1">
          Our algorithm considers factors like carbon footprint, recyclability, ethical sourcing, 
          and product longevity to provide you with a comprehensive sustainability assessment at a glance.
        </Typography>
      </Paper>

      {/* How We Calculate Section */}
      <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
        How We Calculate EarthScore
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', background: '#f0f4ff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChart3 className="text-blue-600 mr-2" size={32} />
                <Typography variant="h6">Carbon Footprint (30%)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Manufacturing emissions and transportation distance are analyzed to calculate 
                the total carbon impact of each product.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', background: '#f0fff4' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Leaf className="text-green-600 mr-2" size={32} />
                <Typography variant="h6">Materials & Packaging (25%)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Recyclability percentage and biodegradability scores determine how well 
                the product returns to nature.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', background: '#fff4f0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Award className="text-orange-600 mr-2" size={32} />
                <Typography variant="h6">Ethical Sourcing (25%)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Fair trade certification and supply chain transparency ensure products 
                are ethically produced.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Card sx={{ height: '100%', background: '#f4f0ff' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUp className="text-purple-600 mr-2" size={32} />
                <Typography variant="h6">Product Longevity (20%)</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Durability ratings and repairability index show how long products last, 
                reducing waste over time.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Score Ranges Section */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Understanding Score Ranges
        </Typography>
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#4caf50', color: 'white' }}>
              <Typography variant="h4">80-100</Typography>
              <Typography variant="body1">Excellent</Typography>
              <Typography variant="body2">Leading sustainability</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#81c784', color: 'white' }}>
              <Typography variant="h4">60-79</Typography>
              <Typography variant="body1">Good</Typography>
              <Typography variant="body2">Above average</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#ffb74d', color: 'white' }}>
              <Typography variant="h4">40-59</Typography>
              <Typography variant="body1">Fair</Typography>
              <Typography variant="body2">Room for improvement</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: '#ff7043', color: 'white' }}>
              <Typography variant="h4">0-39</Typography>
              <Typography variant="body1">Poor</Typography>
              <Typography variant="body2">Significant impact</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Benefits Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Why EarthScore Matters
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              For Consumers
            </Typography>
            <Typography variant="body1">
              Make informed purchasing decisions aligned with your values. 
              See the environmental impact before you buy.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              For the Planet
            </Typography>
            <Typography variant="body1">
              Drive demand for sustainable products and encourage manufacturers 
              to improve their environmental practices.
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom color="primary">
              For Businesses
            </Typography>
            <Typography variant="body1">
              Showcase your commitment to sustainability and differentiate 
              your products in the growing eco-conscious market.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default EarthScoreRatings;