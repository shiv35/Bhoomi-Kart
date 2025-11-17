import React from 'react';
import { Star, Leaf, ShoppingCart, Truck } from 'lucide-react';
import { Product } from '../types/Product';
import { useCart } from '../context/CartContext';
import '../styles/amazon-theme.css';
import '../styles/ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  // Map each category to its static placeholder path
  const categoryImages: { [key: string]: string } = {
    home: "/images/home.png",
    kitchen: "/images/kitchen.png",
    electronics: "/images/electronics.png",
    beauty: "/images/beauty.png",
    clothing: "/images/clothing.png",
  };

  // Always use our local category placeholders
  const categoryKey = product.category?.toLowerCase?.() || 'home';
  const imgSrc = categoryImages[categoryKey] || categoryImages['home'];

  const getEarthScoreColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEarthScoreText = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    return 'Fair';
  };

  return (
    <div className="product-card-amazon bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
      <div className="relative overflow-hidden">
        <img 
          src={imgSrc} 
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <div className="earth-score-badge">
            <Leaf className="h-3 w-3 inline mr-1" />
            <span>{product.earthScore}/10</span>
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
          {getEarthScoreText(product.earthScore)}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Truck className="h-4 w-4" />
            <span>{product.co2Footprint}kg CO2</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="price-amazon">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice != null && (
              <span className="text-sm text-gray-500 line-through ml-2">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <button
            onClick={e => {
              e.stopPropagation();
              addToCart({
                ...product,
                image: imgSrc,
                image_url: imgSrc,
                category: product.category || 'home'
              });
            }}
            className="amazon-button-green"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Sustainable materials • Carbon neutral shipping
        </div>
      </div>
    </div>
  );
};

export default ProductCard;