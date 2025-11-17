import React from 'react';
import { Container, Typography, Box, Paper, GridLegacy as Grid, Card, CardContent, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Brain, Package, Users, TrendingDown, Zap, Target } from 'lucide-react';

const AIOptimization: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Brain className="text-blue-600 mx-auto mb-4" size={64} />
        <Typography variant="h3" component="h1" gutterBottom>
          AI Optimization
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Smart algorithms group orders to minimize carbon footprint and maximize efficiency
        </Typography>
      </Box>

      {/* How It Works Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #e3f2fd 0%, #f3f4f6 100%)' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2' }}>
          How AI Optimization Works
        </Typography>
        <Typography variant="body1" paragraph>
          Our advanced AI algorithms continuously analyze order patterns, delivery routes, and customer 
          preferences to create the most efficient and sustainable shopping experience possible.
        </Typography>
        <Typography variant="body1">
          By intelligently grouping orders and optimizing logistics, we reduce carbon emissions by up to 
          40% while maintaining fast delivery times and reducing costs for everyone.
        </Typography>
      </Paper>

      {/* Key Features */}
      <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
        Key Optimization Features
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Users className="text-green-600 mr-2" size={32} />
                <Typography variant="h6">Smart Group Buying</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                AI identifies products frequently bought together and automatically suggests group 
                buys to neighbors, reducing individual packaging and delivery trips.
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Zap size={20} className="text-yellow-600" /></ListItemIcon>
                  <ListItemText primary="Up to 30% cost savings" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TrendingDown size={20} className="text-green-600" /></ListItemIcon>
                  <ListItemText primary="60% less packaging waste" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Target size={20} className="text-blue-600" /></ListItemIcon>
                  <ListItemText primary="Automated matching with neighbors" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Package className="text-purple-600 mr-2" size={32} />
                <Typography variant="h6">Intelligent Packaging</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Machine learning predicts optimal packaging sizes and materials based on order 
                contents, minimizing waste while ensuring product safety.
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><Zap size={20} className="text-yellow-600" /></ListItemIcon>
                  <ListItemText primary="Right-sized packaging every time" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><TrendingDown size={20} className="text-green-600" /></ListItemIcon>
                  <ListItemText primary="Biodegradable materials prioritized" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><Target size={20} className="text-blue-600" /></ListItemIcon>
                  <ListItemText primary="Zero-waste packaging options" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Optimization Process */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          The Optimization Process
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#e3f2fd', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" color="primary">1</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Data Collection</Typography>
              <Typography variant="body2" color="text.secondary">
                AI analyzes purchase patterns, location data, and product characteristics
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#e8f5e9', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" color="success">2</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Pattern Recognition</Typography>
              <Typography variant="body2" color="text.secondary">
                Machine learning identifies opportunities for grouping and optimization
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#fff3e0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" sx={{ color: '#f57c00' }}>3</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Route Planning</Typography>
              <Typography variant="body2" color="text.secondary">
                Algorithms calculate the most efficient delivery routes and schedules
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: '#f3e5f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}>
                <Typography variant="h4" sx={{ color: '#7b1fa2' }}>4</Typography>
              </Box>
              <Typography variant="h6" gutterBottom>Continuous Learning</Typography>
              <Typography variant="body2" color="text.secondary">
                System improves with each order, becoming smarter over time
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Benefits Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Benefits of AI Optimization
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: '#e8f5e9' }}>
              <Typography variant="h6" gutterBottom color="success.dark">
                Environmental Impact
              </Typography>
              <Typography variant="body1">
                • 40% reduction in carbon emissions<br/>
                • 60% less packaging waste<br/>
                • Fewer delivery vehicles on roads<br/>
                • Optimized warehouse energy usage
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: '#e3f2fd' }}>
              <Typography variant="h6" gutterBottom color="primary.dark">
                Cost Savings
              </Typography>
              <Typography variant="body1">
                • Group buying discounts up to 30%<br/>
                • Reduced shipping costs<br/>
                • Lower packaging expenses<br/>
                • Bulk purchase advantages
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', bgcolor: '#fff3e0' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#e65100' }}>
                Customer Experience
              </Typography>
              <Typography variant="body1">
                • Faster delivery times<br/>
                • Personalized recommendations<br/>
                • Automated group buy matching<br/>
                • Real-time optimization updates
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AIOptimization;