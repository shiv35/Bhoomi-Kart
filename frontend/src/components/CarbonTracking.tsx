import React from 'react';
import { Container, Typography, Box, Paper, GridLegacy as Grid, Card, CardContent, LinearProgress } from '@mui/material';
import { Activity, TreePine, Calculator, Globe, TrendingDown, Award } from 'lucide-react';

const CarbonTracking: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Activity className="text-green-600 mx-auto mb-4" size={64} />
        <Typography variant="h3" component="h1" gutterBottom>
          Carbon Tracking
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Real-time CO2 calculations for your purchases and shipping methods
        </Typography>
      </Box>

      {/* What is Carbon Tracking Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #e8f5e9 0%, #f1f8f1 100%)' }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#2e7d32' }}>
          Track Your Environmental Impact
        </Typography>
        <Typography variant="body1" paragraph>
          Our advanced carbon tracking system calculates the precise environmental impact of every 
          purchase, from manufacturing to delivery. See exactly how your shopping choices affect 
          the planet and discover ways to reduce your carbon footprint.
        </Typography>
        <Typography variant="body1">
          Every action counts. With real-time tracking, you can make informed decisions that align 
          with your environmental values and contribute to a sustainable future.
        </Typography>
      </Paper>

      {/* How We Calculate Carbon */}
      <Typography variant="h4" gutterBottom sx={{ mt: 6, mb: 3 }}>
        How We Calculate Your Carbon Footprint
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Calculator className="text-blue-600 mr-2" size={32} />
                <Typography variant="h6">Manufacturing Emissions</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                We track CO2 emissions from the entire production process, including raw materials, 
                energy consumption, and factory operations.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Average: 5-20 kg CO2e per product</Typography>
                <LinearProgress variant="determinate" value={65} sx={{ mt: 1 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Globe className="text-orange-600 mr-2" size={32} />
                <Typography variant="h6">Transportation Impact</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Distance traveled and transportation method significantly affect carbon output. 
                We calculate emissions for air, sea, rail, and road transport.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Average: 2-10 kg CO2e per delivery</Typography>
                <LinearProgress variant="determinate" value={45} sx={{ mt: 1, bgcolor: '#ffb74d' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TreePine className="text-green-600 mr-2" size={32} />
                <Typography variant="h6">Packaging & End-of-Life</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                From packaging materials to product disposal, we account for the complete 
                lifecycle environmental impact.
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">Average: 1-5 kg CO2e per product</Typography>
                <LinearProgress variant="determinate" value={25} sx={{ mt: 1, bgcolor: '#81c784' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real-Time Tracking Features */}
      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Real-Time Tracking Features
        </Typography>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Activity className="text-green-600 mr-3 mt-1" size={24} />
              <Box>
                <Typography variant="h6" gutterBottom>Live Carbon Calculator</Typography>
                <Typography variant="body2" color="text.secondary">
                  See the environmental impact of products before you buy. Our calculator updates 
                  in real-time as you modify your cart, showing total CO2 emissions.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TrendingDown className="text-blue-600 mr-3 mt-1" size={24} />
              <Box>
                <Typography variant="h6" gutterBottom>Shipping Method Comparison</Typography>
                <Typography variant="body2" color="text.secondary">
                  Compare carbon emissions across different shipping options. Choose slower 
                  shipping to reduce your impact by up to 30%.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <Award className="text-orange-600 mr-3 mt-1" size={24} />
              <Box>
                <Typography variant="h6" gutterBottom>Personal Impact Dashboard</Typography>
                <Typography variant="body2" color="text.secondary">
                  Track your cumulative carbon savings over time. Set goals and earn rewards 
                  for reducing your environmental footprint.
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <TreePine className="text-green-600 mr-3 mt-1" size={24} />
              <Box>
                <Typography variant="h6" gutterBottom>Offset Opportunities</Typography>
                <Typography variant="body2" color="text.secondary">
                  Can't avoid emissions? We partner with verified carbon offset projects 
                  to help you neutralize your impact.
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Impact Visualization */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Your Impact in Perspective
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="h3" color="success.dark">1 kg</Typography>
              <Typography variant="body2">CO2 saved equals</Typography>
              <Typography variant="h6">4.5 miles</Typography>
              <Typography variant="body2" color="text.secondary">not driven</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#e3f2fd' }}>
              <Typography variant="h3" color="primary.dark">10 kg</Typography>
              <Typography variant="body2">CO2 saved equals</Typography>
              <Typography variant="h6">1 tree</Typography>
              <Typography variant="body2" color="text.secondary">planted</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="h3" sx={{ color: '#ef6c00' }}>50 kg</Typography>
              <Typography variant="body2">CO2 saved equals</Typography>
              <Typography variant="h6">2 weeks</Typography>
              <Typography variant="body2" color="text.secondary">of home energy</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: '#f3e5f5' }}>
              <Typography variant="h3" sx={{ color: '#6a1b9a' }}>100 kg</Typography>
              <Typography variant="body2">CO2 saved equals</Typography>
              <Typography variant="h6">1 flight</Typography>
              <Typography variant="body2" color="text.secondary">short-haul offset</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Call to Action */}
      <Paper elevation={3} sx={{ 
        p: 4, 
        mt: 6, 
        background: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
        color: 'white',
        textAlign: 'center'
      }}>
        <Typography variant="h5" gutterBottom>
          Start Tracking Your Carbon Impact Today
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Every purchase is an opportunity to make a difference. Join thousands of conscious 
          consumers who are actively reducing their carbon footprint.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            px: 3, 
            py: 1, 
            borderRadius: 2 
          }}>
            🌍 5M kg CO2 saved
          </Typography>
          <Typography variant="h6" sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            px: 3, 
            py: 1, 
            borderRadius: 2 
          }}>
            🌱 50K trees equivalent
          </Typography>
          <Typography variant="h6" sx={{ 
            bgcolor: 'rgba(255,255,255,0.2)', 
            px: 3, 
            py: 1, 
            borderRadius: 2 
          }}>
            👥 10K active trackers
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default CarbonTracking;