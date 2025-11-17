// src/App.tsx
import React, { useState, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';


// New feature components
import OrderGrouping from './components/OrderGrouping';
import Calculator from './components/Calculator';
import EarthScoreRatings from './components/EarthScoreRatings';
import AIOptimization from './components/AIOptimization';
import CarbonTracking from './components/CarbonTracking';
import CartPage from './components/CartPage';
import Cart from './components/Cart';
import CheckoutFlow from './components/CheckoutFlow';

// Core app components
import ProductDetail from './components/ProductDetail';
import Dashboard from './components/Dashboard';
import SignUp from './components/SignUp';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import Profile from './components/Profile';
import Orders from './components/Orders';

// New UI components
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import CartModal from './components/CartModal';
import AuthModal from './components/AuthModal';
import SustainabilityDashboard from './components/SustainabilityDashboard';
import ProductParameters from './components/ProductParameters';

// MUI
import { AppBar, Toolbar, Typography, Container, Button, CircularProgress, Box, ThemeProvider, createTheme } from '@mui/material';
import './App.css';

// Lazy load Amazon UI to keep bundle sizes separate
const AmazonUIWrapper = lazy(() => import('./amazon-ui/components/AmazonUIWrapper'));

// Amazon-style Material-UI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Keep green as primary
      contrastText: '#fff',
    },
    secondary: {
      main: '#FF9900', // Amazon orange as secondary
      contrastText: '#000',
    },
    info: {
      main: '#232F3E', // Amazon dark blue
    },
  },
  typography: {
    fontFamily: '"Amazon Ember", "Helvetica Neue", Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none', // Amazon doesn't use all caps
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedSecondary: {
          backgroundColor: '#FFD814',
          color: '#0F1111',
          border: '1px solid #FCD200',
          '&:hover': {
            backgroundColor: '#F7CA00',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 5px 0 rgba(213,217,217,.5)',
          borderRadius: 4,
          '&:hover': {
            boxShadow: '0 2px 5px 0 rgba(213,217,217,.7)',
          },
        },
      },
    },
  },
});

// Loading component
const LoadingScreen = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress color="primary" size={60} />
  </Box>
);

// GreenCart App Layout (your existing layout)
const GreenCartLayout: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/greencart/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const handleAuthRequired = () => {
    setIsCartModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const useNewHeader = true;

  return (
    <div className="App">

      {useNewHeader ? (
        <Header />
      ) : (
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <Typography
              variant="h6"
              component={Link}
              to="/greencart"
              sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
            >
              GreenCart
            </Typography>

            <Button
              color="inherit"
              component={Link}
              to="/greencart/group-buy"
            >
              Group Buys
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/greencart/calculator"
            >
              Calculator
            </Button>
            <Button
              color="inherit"
              onClick={() => setIsCartModalOpen(true)}
            >
              Cart
            </Button>

            {currentUser ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/greencart/dashboard"
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Log In / Sign Up
                </Button>
              </>
            )}
          </Toolbar>
        </AppBar>
      )}

      <main>
        <Routes>
          <Route
            path=""
            element={
              <>
                <Hero />
                <Container sx={{ py: 4 }}>
                  <ProductGrid />
                </Container>
                <SustainabilityDashboard />
              </>
            }
          />
          <Route
            path="products/:productId"
            element={
              <Container sx={{ py: 4 }}>
                <ProductDetail />
              </Container>
            }
          />
          <Route
            path="dashboard"
            element={
              <Container sx={{ py: 4 }}>
                <Dashboard />
              </Container>
            }
          />
          <Route
            path="signup"
            element={
              <Container sx={{ py: 4 }}>
                <SignUp />
              </Container>
            }
          />
          <Route
            path="login"
            element={
              <Container sx={{ py: 4 }}>
                <Login />
              </Container>
            }
          />
          <Route
            path="group-buy"
            element={
              <Container sx={{ py: 4 }}>
                <OrderGrouping />
              </Container>
            }
          />
          <Route
            path="calculator"
            element={
              <Container sx={{ py: 4 }}>
                <Calculator />
              </Container>
            }
          />
          <Route
            path="earthscore"
            element={<EarthScoreRatings />}
          />
          <Route
            path="ai-optimization"
            element={<AIOptimization />}
          />
          <Route
            path="carbon-tracking"
            element={<CarbonTracking />}
          />
          <Route
            path="cart"
            element={<CartPage />}
          />
          <Route
            path="cart-detail"
            element={
              <Container sx={{ py: 4 }}>
                <Cart />
              </Container>
            }
          />
          <Route
            path="checkout"
            element={
              <Container sx={{ py: 4 }}>
                <CheckoutFlow />
              </Container>
            }
          />
          <Route
            path="profile"
            element={
              <Container sx={{ py: 4 }}>
                <Profile />
              </Container>
            }
          />
          <Route
            path="orders"
            element={
              <Container sx={{ py: 4 }}>
                <Orders />
              </Container>
            }
          />
          <Route
            path="product-parameters"
            element={<ProductParameters />}
          />
        </Routes>
      </main>

      {useNewHeader && <Footer />}

      <Chatbot />

      {/* Modals */}
      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        onAuthRequired={handleAuthRequired}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

// Main App component with routing
const AppLayout: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Amazon UI Routes - Default landing */}
        <Route path="/*" element={<AmazonUIWrapper />} />

        {/* GreenCart Routes - When user clicks GreenCart Zone button */}
        <Route path="/greencart/*" element={<GreenCartLayout />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppLayout />
        </Router>
      </CartProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;