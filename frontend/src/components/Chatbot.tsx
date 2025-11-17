// src/components/Chatbot.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Fab,
  Drawer,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Button,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  GridLegacy as Grid,
  Snackbar,
  Alert
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import NatureIcon from '@mui/icons-material/Nature';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import InfoIcon from '@mui/icons-material/Info';
import FlashOn from '@mui/icons-material/FlashOn';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ProductDetailDialog from './ProductDetailDialog';
import FilterBadge from './FilterBadge';
import ExpressCheckoutModal from './ExpressCheckoutModal';
import { ExpressCheckoutItem } from '../types/checkout.types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  agent?: string;
  timestamp: Date;
  products?: Product[];
  actions?: ChatAction[];
}

interface Product {
  product_id: number;
  product_name: string;
  price: number;
  earth_score: number;
  category?: string;
  image_url?: string;
  // Additional fields for detail dialog
  manufacturing_emissions_gco2e?: number;
  transport_distance_km?: number;
  recyclability_percent?: number;
  biodegradability_score?: number;
  is_fair_trade?: boolean;
  supply_chain_transparency_score?: number;
  durability_rating?: number;
  repairability_index?: number;
}

interface ChatAction {
  type: 'navigate' | 'add_to_cart' | 'view_details' | 'join_group_buy';
  label: string;
  data: any;
}

const Chatbot: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: "Hi there! I'm the GreenCart assistant. How can I help you shop sustainably today? Try asking:\n- 'Show me eco-friendly products'\n- 'What's in my cart?'\n- 'Find group buys near me'",
      agent: 'main',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // Add new state variables for filters and express checkout
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    earth_score_min?: number;
    earth_score_max?: number;
  }>({});

  const [expressCheckoutItem, setExpressCheckoutItem] = useState<ExpressCheckoutItem | null>(null);
  const [expressCheckoutOpen, setExpressCheckoutOpen] = useState(false);

  // Add diagnostic useEffect
  useEffect(() => {
    console.log("Chatbot mounted. API URL:", API_URL);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAgentIcon = (agent?: string) => {
    switch (agent) {
      case 'shopping_assistant':
        return <ShoppingCartIcon />;
      case 'sustainability_advisor':
        return <NatureIcon />;
      case 'deal_finder':
        return <LocalOfferIcon />;
      case 'checkout_assistant':
        return <ShoppingCartIcon />;
      default:
        return <SmartToyIcon />;
    }
  };

  const getAgentColor = (agent?: string) => {
    switch (agent) {
      case 'shopping_assistant':
        return 'primary.main';
      case 'sustainability_advisor':
        return 'success.main';
      case 'deal_finder':
        return 'warning.main';
      case 'checkout_assistant':
        return 'secondary.main';
      default:
        return 'info.main';
    }
  };

  // Map categories to image paths
  const getCategoryImage = (category?: string): string => {
    const categoryImages: { [key: string]: string } = {
      home: "/images/home.png",
      kitchen: "/images/kitchen.png",
      electronics: "/images/electronics.png",
      beauty: "/images/beauty.png",
      clothing: "/images/clothing.png",
    };

    const categoryKey = category?.toLowerCase() || 'home';
    return categoryImages[categoryKey] || "/images/home.png";
  };

  const extractProductsFromResponse = (response: any): Product[] => {
    // Check if we have filters applied in the response
    if (response.filters_applied) {
      setActiveFilters(response.filters_applied);
    }

    // If the response contains structured product data from backend
    if (response.products && Array.isArray(response.products)) {
      return response.products.map((p: any) => ({
        product_id: p.product_id || p.id,
        product_name: p.product_name || p.name,
        price: p.price || 0,
        earth_score: p.earth_score || p.earthScore || 0,
        category: p.category,
        image_url: p.image_url || p.image,
        manufacturing_emissions_gco2e: p.manufacturing_emissions_gco2e,
        transport_distance_km: p.transport_distance_km,
        recyclability_percent: p.recyclability_percent,
        biodegradability_score: p.biodegradability_score,
        is_fair_trade: p.is_fair_trade,
        supply_chain_transparency_score: p.supply_chain_transparency_score,
        durability_rating: p.durability_rating,
        repairability_index: p.repairability_index
      }));
    }

    // Fallback: parse from text (improved regex)
    const products: Product[] = [];
    const productLines = response.reply?.split('\n') || [];

    productLines.forEach((line: string) => {
      // Look for patterns like:
      // 1. Product Name - $XX.XX (EarthScore: YY)
      // - Product Name - $XX.XX (EarthScore: YY)
      const match = line.match(/(?:\d+\.\s*|[-•]\s*)(.+?)\s*-\s*\$(\d+\.?\d*)\s*\(EarthScore:\s*(\d+)\)/);
      if (match) {
        const productName = match[1].trim();
        const price = parseFloat(match[2]);
        const earthScore = parseInt(match[3]);

        // Try to determine category from product name
        let category = 'home';
        const nameLower = productName.toLowerCase();
        if (nameLower.includes('kitchen') || nameLower.includes('utensil') || nameLower.includes('food')) {
          category = 'kitchen';
        } else if (nameLower.includes('electronic') || nameLower.includes('gadget') || nameLower.includes('device')) {
          category = 'electronics';
        } else if (nameLower.includes('beauty') || nameLower.includes('cosmetic')) {
          category = 'beauty';
        } else if (nameLower.includes('clothing') || nameLower.includes('wear')) {
          category = 'clothing';
        }

        products.push({
          product_id: products.length + 1, // Temporary ID
          product_name: productName,
          price: price,
          earth_score: earthScore,
          category: category,
          image_url: getCategoryImage(category),
          // Add default values for all detail fields
          manufacturing_emissions_gco2e: 2000 + Math.random() * 3000,
          transport_distance_km: 500 + Math.random() * 2000,
          recyclability_percent: 60 + Math.floor(Math.random() * 40),
          biodegradability_score: Math.ceil(Math.random() * 5),
          is_fair_trade: Math.random() > 0.5,
          supply_chain_transparency_score: Math.ceil(Math.random() * 5),
          durability_rating: Math.ceil(Math.random() * 5),
          repairability_index: Math.ceil(Math.random() * 5)
        });
      }
    });

    return products;
  };

  const sendMessage = async (message: string, userId: string = 'user123') => {
    try {
      console.log('Sending message:', message);
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: message, 
          user_id: userId 
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      console.log('Reply field:', data.reply);

      // Extract products from response
      const products = extractProductsFromResponse(data);

      // Handle the response
      return {
        text: data.reply || 'No response received',
        sender: 'bot' as const,
        agent: data.agent_used,
        timestamp: new Date(),
        products: products,
        actions: products.length > 0 ? [{
          type: 'navigate' as const,
          label: 'View All Products',
          data: { path: '/greencart' }
        }] : undefined
      };

    } catch (error) {
      console.error('Chat error:', error);
      
      // Return error message
      return {
        text: 'Sorry, I\'m having trouble connecting right now. Please check the console for details.',
        sender: 'bot' as const,
        agent: 'main',
        timestamp: new Date()
      };
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = {
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    try {
      const botResponse = await sendMessage(input, currentUser?.uid || 'guest');
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        agent: 'main',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      // Use the cart context to add to cart
      addToCart({
        product_id: product.product_id,
        product_name: product.product_name,
        name: product.product_name,
        price: product.price,
        earth_score: product.earth_score,
        earthScore: product.earth_score,
        image_url: product.image_url,
        image: product.image_url,
        category: product.category
      });

      setSnackbar({
        open: true,
        message: `✅ Added ${product.product_name} to your cart!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Add to cart error:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add to cart. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (product: Product) => {
    // Directly use the product data we already have - no API call needed!
    setSelectedProduct(product);
    setDetailDialogOpen(true);
  };

  // Add handler for express checkout
  const handleExpressCheckout = (product: Product) => {
    const checkoutItem: ExpressCheckoutItem = {
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      quantity: 1,
      earth_score: product.earth_score,
      image_url: product.image_url || getCategoryImage(product.category)
    };
    
    setExpressCheckoutItem(checkoutItem);
    setExpressCheckoutOpen(true);
  };

  // Add handler for removing filters
  const handleRemoveFilter = (filterType: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (filterType === 'category') {
        delete newFilters.category;
      } else if (filterType === 'earth_score') {
        delete newFilters.earth_score_min;
      } else if (filterType === 'earth_score_max') {
        delete newFilters.earth_score_max;
      }
      return newFilters;
    });
  };

  const handleAction = (action: ChatAction) => {
    switch (action.type) {
      case 'navigate':
        setIsOpen(false);
        navigate(action.data.path);
        break;
      case 'add_to_cart':
        handleAddToCart(action.data.product);
        break;
      case 'view_details':
        handleViewDetails(action.data.product);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const renderProductCard = (product: Product) => (
    <Card sx={{ maxWidth: 345, my: 1 }}>
      <CardMedia
        component="img"
        height="140"
        image={product.image_url || getCategoryImage(product.category)}
        alt={product.product_name}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {product.product_name}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary">
            ${product.price.toFixed(2)}
          </Typography>
          <Chip
            icon={<NatureIcon />}
            label={`Score: ${product.earth_score}/100`}
            color={product.earth_score >= 80 ? 'success' : product.earth_score >= 60 ? 'warning' : 'error'}
            size="small"
          />
        </Box>
        {product.category && (
          <Typography variant="body2" color="text.secondary">
            Category: {product.category}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2, pb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<AddShoppingCartIcon />}
            onClick={() => handleAddToCart(product)}
            sx={{ flex: 1 }}
          >
            Add to Cart
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<InfoIcon />}
            onClick={() => handleViewDetails(product)}
            sx={{ flex: 1 }}
          >
            Details
          </Button>
        </Box>
        
        {/* Express Checkout Button */}
        <Button
          size="small"
          variant="contained"
          color="primary"
          startIcon={<FlashOn />}
          onClick={() => handleExpressCheckout(product)}
          fullWidth
          sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
          }}
        >
          Xpress Checkout
        </Button>
      </CardActions>
    </Card>
  );

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setIsOpen(true)}
      >
        <ChatIcon />
      </Fab>

      <Drawer anchor="right" open={isOpen} onClose={() => setIsOpen(false)}>
        <Box sx={{ width: 450, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Paper sx={{ p: 2, bgcolor: 'primary.main', color: 'white', borderRadius: 0 }}>
            <Typography variant="h6">GreenCart Assistant</Typography>
            <Typography variant="caption">
              Your sustainable shopping companion
            </Typography>
          </Paper>

          {/* Filter Badge Display */}
          {Object.keys(activeFilters).length > 0 && (
            <Box sx={{ px: 2, pt: 1 }}>
              <FilterBadge 
                filters={activeFilters} 
                onRemoveFilter={handleRemoveFilter} 
              />
            </Box>
          )}

          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
            {messages.map((msg, index) => (
              <ListItem
                key={index}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1, flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}>
                  <Avatar
                    sx={{
                      bgcolor: msg.sender === 'bot' ? getAgentColor(msg.agent) : 'primary.main',
                      mx: 1
                    }}
                  >
                    {msg.sender === 'bot' ? getAgentIcon(msg.agent) : <PersonIcon />}
                  </Avatar>

                  <Box sx={{ maxWidth: '70%' }}>
                    {msg.sender === 'bot' && msg.agent && msg.agent !== 'main' && (
                      <Chip
                        label={msg.agent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        size="small"
                        sx={{ mb: 0.5 }}
                        color={
                          msg.agent === 'shopping_assistant' ? 'primary' :
                            msg.agent === 'sustainability_advisor' ? 'success' :
                              msg.agent === 'deal_finder' ? 'warning' :
                                'secondary'
                        }
                      />
                    )}

                    <Paper
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: msg.sender === 'bot' ? '#f0f0f0' : 'primary.light',
                        color: msg.sender === 'bot' ? 'text.primary' : 'white'
                      }}
                    >
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </Paper>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      {msg.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>

                {/* Product Cards */}
                {msg.products && msg.products.length > 0 && (
                  <Box sx={{ mt: 2, width: '100%' }}>
                    <Grid container spacing={1}>
                      {msg.products.map((product, idx) => (
                        <Grid item xs={12} key={idx}>
                          {renderProductCard(product)}
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {/* Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {msg.actions.map((action, idx) => (
                      <Button
                        key={idx}
                        variant="contained"
                        size="small"
                        onClick={() => handleAction(action)}
                        startIcon={
                          action.type === 'navigate' ? <ShoppingCartIcon /> :
                            action.type === 'add_to_cart' ? <AddShoppingCartIcon /> :
                              undefined
                        }
                      >
                        {action.label}
                      </Button>
                    ))}
                  </Box>
                )}
              </ListItem>
            ))}
            {isThinking && (
              <ListItem sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Avatar sx={{ bgcolor: 'info.main', mr: 1 }}>
                  <SmartToyIcon />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: '#f0f0f0' }}>
                  <CircularProgress size={20} />
                </Paper>
              </ListItem>
            )}
            <div ref={messagesEndRef} />
          </List>

          <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask about sustainable products..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
                size="small"
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!input.trim() || isThinking}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      {/* Product Detail Dialog */}
      {selectedProduct && (
        <ProductDetailDialog
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedProduct(null);
          }}
          product={{
            product_name: selectedProduct.product_name,
            category: selectedProduct.category || 'home',
            price: selectedProduct.price,
            manufacturing_emissions_gco2e: selectedProduct.manufacturing_emissions_gco2e || 2274,
            transport_distance_km: selectedProduct.transport_distance_km || 1452,
            recyclability_percent: selectedProduct.recyclability_percent || 90,
            biodegradability_score: selectedProduct.biodegradability_score || 5,
            is_fair_trade: selectedProduct.is_fair_trade || false,
            supply_chain_transparency_score: selectedProduct.supply_chain_transparency_score || 5,
            durability_rating: selectedProduct.durability_rating || 5,
            repairability_index: selectedProduct.repairability_index || 5,
            earth_score: selectedProduct.earth_score
          }}
        />
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Express Checkout Modal */}
      {expressCheckoutItem && (
        <ExpressCheckoutModal
          open={expressCheckoutOpen}
          onClose={() => {
            setExpressCheckoutOpen(false);
            setExpressCheckoutItem(null);
          }}
          item={expressCheckoutItem}
          onSuccess={(orderId) => {
            setSnackbar({
              open: true,
              message: `🎉 Order ${orderId} placed successfully! Your eco-friendly purchase is on its way.`,
              severity: 'success'
            });
            setExpressCheckoutOpen(false);
            setExpressCheckoutItem(null);
          }}
        />
      )}
    </>
  );
};

export default Chatbot;