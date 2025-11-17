import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  GridLegacy as Grid,
  Box,
  Divider,
  useTheme,
  Chip
} from '@mui/material';

interface ProductDetailDialogProps {
  open: boolean;
  onClose: () => void;
  product: {
    product_name: string;
    category: string;
    price: number;
    manufacturing_emissions_gco2e: number;
    transport_distance_km: number;
    recyclability_percent: number;
    biodegradability_score: number;
    is_fair_trade: boolean;
    supply_chain_transparency_score: number;
    durability_rating: number;
    repairability_index: number;
    earth_score: number;
  };
}

export default function ProductDetailDialog({
  open,
  onClose,
  product,
}: ProductDetailDialogProps) {
  const theme = useTheme();

  const rows: [string, string | number][] = [
    ['Category', product.category],
    ['Price', `$${product.price.toFixed(2)}`],
    ['CO₂ Emissions', `${product.manufacturing_emissions_gco2e.toLocaleString()} g`],
    ['Transport Distance', `${product.transport_distance_km.toLocaleString()} km`],
    ['Recyclability', `${product.recyclability_percent}%`],
    ['Biodegradability', `${product.biodegradability_score}/5`],
    ['Fair Trade', product.is_fair_trade ? 'Yes' : 'No'],
    ['Transparency', `${product.supply_chain_transparency_score}/5`],
    ['Durability', `${product.durability_rating}/5`],
    ['Repairability', `${product.repairability_index}/5`],
    ['EarthScore', `${product.earth_score}/100`],
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {/* Header with green background */}
      <DialogTitle
        sx={{
          bgcolor: theme.palette.success.main,
          color: theme.palette.common.white,
          fontWeight: 'bold',
          fontSize: '1.25rem'
        }}
      >
        {product.product_name}
      </DialogTitle>
      <Divider />

      {/* Content with alternating row backgrounds */}
      <DialogContent dividers>
        {rows.map(([label, value], idx) => {
          // Only for EarthScore, render a colored pill
          const isScore = label === 'EarthScore';
          // derive numeric score for coloring
          const score = isScore ? Number(product.earth_score) : 0;
          let chipColor: 'error' | 'warning' | 'success' = 'success';
          if (score < 50) chipColor = 'error';
          else if (score < 75) chipColor = 'warning';

          return (
            <Box
              key={label}
              sx={{
                bgcolor: idx % 2 === 0 ? 'background.paper' : theme.palette.grey[100],
                px: 2,
                py: 1.5,
              }}
            >
              <Grid container alignItems="center">
                <Grid item xs={5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {label}
                  </Typography>
                </Grid>
                <Grid item xs={7}>
                  {isScore ? (
                    <Chip
                      label={`${value}`}
                      color={chipColor}
                      sx={{
                        color: 'common.white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                      }}
                    />
                  ) : (
                    <Typography variant="body1" color="text.primary">
                      {value}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </DialogContent>
      <Divider />

      {/* Close button in green pill style */}
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="success" sx={{ textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
