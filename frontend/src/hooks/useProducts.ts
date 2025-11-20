import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Product {
  id: number;
  product_id: number;
  product_name: string;
  name: string;
  description: string;
  price: number;
  category: string;
  earthScore: number;
  earth_score: number;
  rating: number;
  image: string;
  image_url: string;
  co2Footprint: number;
  originalPrice?: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/products');
        const transformedProducts = response.data.map((p: any) => ({
          ...p,
          id: p.product_id,
          name: p.product_name,
          description: `Sustainable ${p.category} product`,
          earthScore: p.earth_score || 75,
          rating: 4.5,
          image: p.image_url || `https://source.unsplash.com/300x200/?${p.category},product`,
          co2Footprint: 0.5,
          originalPrice: p.price > 50 ? p.price * 1.2 : null
        }));
        
        // Sort by EarthScore descending
        transformedProducts.sort((a: Product, b: Product) => b.earthScore - a.earthScore);
        
        setProducts(transformedProducts);
      } catch (err) {
        setError('Failed to fetch products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading, error };
};