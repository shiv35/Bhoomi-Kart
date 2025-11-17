import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  GridLegacy as Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  Payment,
  CheckCircle,
  FlashOn
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { ExpressCheckoutItem, ShippingAddress } from '../types/checkout.types';
import { api } from '../services/api';

interface ExpressCheckoutModalProps {
  open: boolean;
  onClose: () => void;
  item: ExpressCheckoutItem;
  onSuccess: (orderId: string) => void;
}

const ExpressCheckoutModal: React.FC<ExpressCheckoutModalProps> = ({
  open,
  onClose,
  item,
  onSuccess
}) => {
  const { currentUser } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const steps = ['Shipping Info', 'Payment', 'Confirm'];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleCheckout();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/express-checkout', {
        user_id: currentUser?.uid || 'guest',
        items: [{ ...item, quantity: 1 }],
        shipping_address: shippingAddress,
        payment_method: 'credit_card'
      });

      if (response.data.success) {
        onSuccess(response.data.order_id);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <LocalShipping sx={{ mr: 1, verticalAlign: 'middle' }} />
              Shipping Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={shippingAddress.name}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    name: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={shippingAddress.street}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    street: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    city: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    state: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Pincode"
                  value={shippingAddress.pincode}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    pincode: e.target.value
                  })}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone (Optional)"
                  value={shippingAddress.phone}
                  onChange={(e) => setShippingAddress({
                    ...shippingAddress,
                    phone: e.target.value
                  })}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <Payment sx={{ mr: 1, verticalAlign: 'middle' }} />
              Payment Method
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              This is a demo. No real payment will be processed.
            </Alert>
            <TextField
              fullWidth
              label="Card Number"
              placeholder="4242 4242 4242 4242"
              sx={{ mb: 2 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Expiry Date"
                  placeholder="MM/YY"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="CVV"
                  placeholder="123"
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <CheckCircle sx={{ mr: 1, verticalAlign: 'middle', color: 'success.main' }} />
              Order Summary
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {item.product_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quantity: 1
                </Typography>
                <Typography variant="body2" color="success.main">
                  EarthScore: {item.earth_score}/100
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6">
                  Total: ${item.price.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>

            <Typography variant="subtitle2" gutterBottom>
              Shipping to:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {shippingAddress.name}<br />
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <FlashOn color="primary" sx={{ mr: 1 }} />
          Express Checkout
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {activeStep === steps.length - 1 ? 'Complete Order' : 'Next'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpressCheckoutModal;