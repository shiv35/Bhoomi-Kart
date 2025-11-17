import React, { createContext, useContext, useState } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  earthScore: number;
  image: string;
  co2Footprint: number;
  category: string;
}

interface CartContextType {
  items: any[];
  addToCart: (product: any) => void;
  addItem: (product: any) => void;
  removeFromCart: (id: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalCO2: () => number;
  getAverageEarthScore: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    // Helper function to get category image
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

    setItems(prev => {
      const productId = String(product.product_id || product.id);
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item => 
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      // Ensure image is always set
      const imageUrl = product.image_url || product.image || getCategoryImage(product.category);
      
      return [...prev, {
        id: productId,
        name: product.product_name || product.name,
        price: product.price,
        quantity: 1,
        earthScore: product.earth_score || product.earthScore || 75,
        image: imageUrl,
        co2Footprint: product.co2Footprint || 0.5,
        category: product.category || 'home' // Add category to cart items
      }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0);
  const getTotalPrice = () => items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const getTotalCO2 = () => items.reduce((sum, item) => sum + (item.quantity * item.co2Footprint), 0);
  
  const getAverageEarthScore = () => {
    if (items.length === 0) return 0;
    const totalScore = items.reduce((sum, item) => sum + item.earthScore, 0);
    return Math.round(totalScore / items.length);
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      addItem: addToCart,
      removeFromCart,
      removeItem: removeFromCart,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      getTotalCO2,
      getAverageEarthScore,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};