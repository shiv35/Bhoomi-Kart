import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  Card,
  CardContent,
  GridLegacy as Grid,
  Chip,
  Button,
  Divider,
  IconButton,
  Collapse,
  LinearProgress,
  Avatar,
  Rating
} from '@mui/material';
import {
  LocalShipping,
  CheckCircle,
  Schedule,
  ExpandMore,
  ExpandLess,
  Receipt,
  Replay,
  RateReview,
  Co2Rounded as EcoRounded,
  Co2,
  Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

interface Order {
  id: string;
  date: string;
  status: 'delivered' | 'in-transit' | 'processing' | 'group-buy';
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    earthScore: number;
    image?: string;
  }[];
  total: number;
  co2Saved: number;
  packaging: string;
  groupBuy?: {
    name: string;
    participants: number;
    savings: number;
  };
  deliveryDate?: string;
  trackingNumber?: string;
}

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
  // Mock orders data
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ORD001',
      date: '2025-06-15',
      status: 'delivered',
      items: [
        { id: '1', name: 'Bamboo Utensil Set', price: 15.99, quantity: 2, earthScore: 85 },
        { id: '2', name: 'Organic Cotton T-Shirt', price: 24.99, quantity: 1, earthScore: 78 }
      ],
      total: 56.97,
      co2Saved: 3.2,
      packaging: 'Eco Hero Package',
      deliveryDate: '2025-06-18',
      trackingNumber: 'GC123456789'
    },
    {
      id: 'ORD002',
      date: '2025-06-20',
      status: 'in-transit',
      items: [
        { id: '3', name: 'Reusable Water Bottle', price: 19.99, quantity: 1, earthScore: 92 },
        { id: '4', name: 'Solar Power Bank', price: 49.99, quantity: 1, earthScore: 88 }
      ],
      total: 69.98,
      co2Saved: 4.5,
      packaging: 'Carbon Neutral Box',
      trackingNumber: 'GC987654321'
    },
    {
      id: 'ORD003',
      date: '2025-06-21',
      status: 'group-buy',
      items: [
        { id: '5', name: 'Eco Kitchen Bundle', price: 89.99, quantity: 1, earthScore: 90 }
      ],
      total: 67.49,
      co2Saved: 8.5,
      packaging: 'Eco Hero Package',
      groupBuy: {
        name: 'Eco Kitchen Essentials',
        participants: 5,
        savings: 22.50
      }
    }
  ]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle sx={{ color: 'success.main' }} />;
      case 'in-transit':
        return <LocalShipping sx={{ color: 'primary.main' }} />;
      case 'processing':
        return <Schedule sx={{ color: 'warning.main' }} />;
      case 'group-buy':
        return <Group sx={{ color: 'info.main' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'in-transit':
        return 'primary';
      case 'processing':
        return 'warning';
      case 'group-buy':
        return 'info';
      default:
        return 'default';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (tabValue === 0) return true; // All orders
    if (tabValue === 1) return order.status === 'in-transit' || order.status === 'processing';
    if (tabValue === 2) return order.status === 'delivered';
    if (tabValue === 3) return order.status === 'group-buy';
    return true;
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Your Orders
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">{orders.length}</Typography>
              <Typography variant="body2">Total Orders</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">
                {orders.reduce((sum, order) => sum + order.co2Saved, 0).toFixed(1)}kg
              </Typography>
              <Typography variant="body2">CO2 Saved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'info.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">
                {orders.filter(o => o.groupBuy).length}
              </Typography>
              <Typography variant="body2">Group Buys Joined</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'white' }}>
            <CardContent>
              <Typography variant="h4">
                ${orders.filter(o => o.groupBuy).reduce((sum, o) => sum + (o.groupBuy?.savings || 0), 0).toFixed(2)}
              </Typography>
              <Typography variant="body2">Total Saved</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Order Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Orders" />
          <Tab label="Active" />
          <Tab label="Delivered" />
          <Tab label="Group Buys" />
        </Tabs>
      </Paper>

      {/* Orders List */}
      <List sx={{ bgcolor: 'background.paper' }}>
        {filteredOrders.map((order) => (
          <Paper key={order.id} sx={{ mb: 2 }}>
            <ListItem
              sx={{ 
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' }
              }}
              onClick={() => toggleOrderExpansion(order.id)}
            >
              <Box sx={{ width: '100%' }}>
                {/* Order Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getStatusIcon(order.status)}
                    <Box>
                      <Typography variant="h6">
                        Order #{order.id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Placed on {new Date(order.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={order.status.replace('-', ' ').toUpperCase()} 
                      color={getStatusColor(order.status) as any}
                      size="small"
                    />
                    <IconButton>
                      {expandedOrders.has(order.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </Box>
                </Box>

                {/* Order Summary */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">
                      {order.items.length} item{order.items.length > 1 ? 's' : ''} • ${order.total.toFixed(2)}
                    </Typography>
                    {order.groupBuy && (
                      <Chip 
                        icon={<Group />}
                        label={`Group Buy: Saved $${order.groupBuy.savings}`}
                        size="small"
                        color="success"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      icon={<EcoRounded />}
                      label={`${order.co2Saved}kg CO2 saved`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  </Box>
                </Box>
              </Box>
            </ListItem>

            {/* Expanded Order Details */}
            <Collapse in={expandedOrders.has(order.id)}>
              <Divider />
              <Box sx={{ p: 3 }}>
                {/* Items */}
                <Typography variant="subtitle1" gutterBottom>
                  Order Items
                </Typography>
                {order.items.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar variant="rounded" sx={{ width: 60, height: 60, mr: 2, bgcolor: 'grey.200' }}>
                      📦
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1">{item.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Qty: {item.quantity} • ${item.price} each • EarthScore: {item.earthScore}
                      </Typography>
                    </Box>
                    <Typography variant="h6">${(item.price * item.quantity).toFixed(2)}</Typography>
                  </Box>
                ))}

                <Divider sx={{ my: 2 }} />

                {/* Order Details */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Packaging
                    </Typography>
                    <Typography variant="body1">{order.packaging}</Typography>
                  </Grid>
                  {order.trackingNumber && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Tracking Number
                      </Typography>
                      <Typography variant="body1">{order.trackingNumber}</Typography>
                    </Grid>
                  )}
                  {order.deliveryDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Delivery Date
                      </Typography>
                      <Typography variant="body1">
                        {new Date(order.deliveryDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  {order.groupBuy && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Group Buy Details
                        </Typography>
                        <Typography variant="body2">
                          {order.groupBuy.name} • {order.groupBuy.participants} participants • 
                          Saved ${order.groupBuy.savings}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>

                {/* Actions */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  {order.status === 'delivered' && (
                    <>
                      <Button 
                        variant="outlined" 
                        startIcon={<Replay />}
                        onClick={() => navigate(ROUTES.PRODUCTS)}
                      >
                        Buy Again
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<RateReview />}
                      >
                        Leave Review
                      </Button>
                    </>
                  )}
                  {order.status === 'in-transit' && (
                    <Button 
                      variant="outlined" 
                      startIcon={<LocalShipping />}
                    >
                      Track Order
                    </Button>
                  )}
                  <Button 
                    variant="text" 
                    startIcon={<Receipt />}
                  >
                    Download Invoice
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        ))}
      </List>

      {filteredOrders.length === 0 && (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Button 
            variant="contained" 
            color="success" 
            sx={{ mt: 2 }}
            onClick={() => navigate(ROUTES.HOME)}
          >
            Start Shopping
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Orders;