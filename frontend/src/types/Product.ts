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