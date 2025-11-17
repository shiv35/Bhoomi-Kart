// src/components/Calculator.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  GridLegacy as Grid,
  Paper,
  Slider,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Chip
} from '@mui/material';
import {
  RecyclingRounded as Recycle,
  TimerRounded as Timer,
  LocalShippingRounded as LocalShipping,
  NatureRounded as Nature,
  BuildRounded as Build,
  CalculateRounded as Calculate,
  Info as InfoIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Calculator: React.FC = () => {
  const [formState, setFormState] = useState({
    recyclability_percent: 50,
    durability_rating: 3,
    transport_distance_km: 100,
    biodegradability_score: 3,
    repairability_index: 3,
    manufacturing_emissions_gco2e: 5000,
    is_fair_trade: 1,
    supply_chain_transparency_score: 3
  });
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setScore(null);
    try {
      const response = await axios.post('http://localhost:8000/api/predict', formState);
      setScore(response.data.earth_score);
    } catch {
      setError('Failed to calculate score. Please check all inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSliderChange = (name: string, value: number | number[]) => {
    setFormState((prev) => ({ ...prev, [name]: value as number }));
  };

  const handleTextFieldChange = (name: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setFormState((prev) => ({ ...prev, [name]: numValue }));
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return '#4caf50';
    if (s >= 60) return '#81c784';
    if (s >= 40) return '#ffb74d';
    return '#ff7043';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Poor';
  };

  const sliderMarks = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button 
        variant="outlined" 
        startIcon={<InfoIcon />}
        onClick={() => navigate('/greencart/product-parameters')}
        sx={{ mb: 2 }}
      >
        View Product Database
      </Button>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          EarthScore Calculator
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Calculate the environmental impact score of any product by adjusting the sustainability metrics below
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <form onSubmit={handleSubmit}>
              <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                <Calculate sx={{ mr: 1 }} />
                Product Sustainability Metrics
              </Typography>

              {/* Materials & Packaging */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                  Materials & Packaging
                </Typography>
                <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Recycle sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        Recyclability (%)
                      </Typography>
                      <Chip label={`${formState.recyclability_percent}%`} color="success" />
                    </Box>
                    <Slider
                      value={formState.recyclability_percent}
                      onChange={(e, v) => handleSliderChange('recyclability_percent', v)}
                      sx={{ color: 'success.main' }}
                    />
                  </CardContent>
                </Card>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Nature sx={{ mr: 2, color: 'success.main' }} />
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        Biodegradability Score
                      </Typography>
                      <Chip label={`${formState.biodegradability_score}/5`} color="success" />
                    </Box>
                    <Slider
                      value={formState.biodegradability_score}
                      min={1}
                      max={5}
                      step={1}
                      marks={sliderMarks}
                      onChange={(e, v) => handleSliderChange('biodegradability_score', v)}
                      sx={{ color: 'success.main' }}
                    />
                  </CardContent>
                </Card>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Longevity */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                  Product Longevity
                </Typography>
                <Card sx={{ mb: 3, bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Timer sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        Durability Rating
                      </Typography>
                      <Chip label={`${formState.durability_rating}/5`} color="primary" />
                    </Box>
                    <Slider
                      value={formState.durability_rating}
                      min={1}
                      max={5}
                      step={1}
                      marks={sliderMarks}
                      onChange={(e, v) => handleSliderChange('durability_rating', v)}
                    />
                  </CardContent>
                </Card>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Build sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        Repairability Index
                      </Typography>
                      <Chip label={`${formState.repairability_index}/5`} color="primary" />
                    </Box>
                    <Slider
                      value={formState.repairability_index}
                      min={1}
                      max={5}
                      step={1}
                      marks={sliderMarks}
                      onChange={(e, v) => handleSliderChange('repairability_index', v)}
                    />
                  </CardContent>
                </Card>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Carbon Footprint */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 3 }}>
                  Carbon Footprint
                </Typography>
                <Card sx={{ bgcolor: '#f5f5f5' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocalShipping sx={{ mr: 2, color: 'warning.main' }} />
                      <Typography variant="subtitle1" sx={{ flex: 1 }}>
                        Transport Distance
                      </Typography>
                    </Box>
                    <TextField
                      type="number"
                      fullWidth
                      label="Distance in kilometers"
                      value={formState.transport_distance_km}
                      onChange={(e) =>
                        handleTextFieldChange('transport_distance_km', e.target.value)
                      }
                      InputProps={{
                        endAdornment: (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            km
                          </Typography>
                        )
                      }}
                    />
                  </CardContent>
                </Card>
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  background: 'linear-gradient(45deg, #2e7d32 30%, #43a047 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate EarthScore'}
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 4, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Nature sx={{ mr: 1, color: 'success.main' }} />
              Results
            </Typography>

            {score !== null ? (
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    background: `conic-gradient(${getScoreColor(score)} ${
                      score * 3.6
                    }deg, #e0e0e0 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      width: 130,
                      height: 130,
                      borderRadius: '50%',
                      bgcolor: 'white',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography
                      variant="h2"
                      sx={{ fontWeight: 'bold', color: getScoreColor(score) }}
                    >
                      {score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      out of 100
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={getScoreLabel(score)}
                  sx={{
                    bgcolor: getScoreColor(score),
                    color: 'white',
                    fontSize: '1.1rem',
                    py: 2,
                    px: 3
                  }}
                />

                <Typography variant="body1" sx={{ mt: 3, color: 'text.secondary' }}>
                  {score >= 80 && "Excellent! This product has minimal environmental impact."}
                  {score >= 60 && score < 80 && "Good choice! This product is fairly sustainable."}
                  {score >= 40 && score < 60 && "Fair. Consider more sustainable alternatives."}
                  {score < 40 && "Poor sustainability score. Look for greener options."}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  Adjust the metrics and click calculate to see the EarthScore
                </Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Calculator;
