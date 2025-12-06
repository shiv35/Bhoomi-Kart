import axios from 'axios';

// Create an axios instance with a base URL for all API calls
// Adjust the baseURL to match your backend server address
const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export TypeScript interfaces for API responses (optional)
export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  price: number;
  earth_score: number;
  // ...other fields if needed
}

// Add these interfaces first
export interface FilterOptions {
  category?: string;
  earth_score_min?: number;
  earth_score_max?: number;
  sort_by?: string;
  limit?: number;
}

export interface ExpressCheckoutRequest {
  user_id: string;
  items: any[];
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone?: string;
  };
  payment_method: string;
}

// Example endpoint helper: fetch all products
export const getAllProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get<Product[]>('/api/products');
  return response.data;
};

// Example endpoint helper: fetch a product by ID
export const getProductById = async (id: number): Promise<Product> => {
  const response = await apiClient.get<Product>(`/api/products/${id}`);
  return response.data;
};

// Get recommendations based on cart items
export interface Recommendation {
  product_id: number;
  product_name: string;
  price: number;
  earth_score: number;
  category: string;
  image_url: string;
  confidence: number;
  reason: string;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
  count: number;
  cart_items?: number[];
  message?: string;
}

export const getRecommendationsFromCart = async (userId: string, topN: number = 5): Promise<RecommendationResponse> => {
  const response = await apiClient.get<RecommendationResponse>(`/api/recommendations/cart/${userId}?top_n=${topN}`);
  return response.data;
};

export const getRecommendations = async (cartItems: number[], topN: number = 5): Promise<RecommendationResponse> => {
  const response = await apiClient.post<RecommendationResponse>('/api/recommendations', {
    cart_items: cartItems,
    top_n: topN
  });
  return response.data;
};

// Add these new API methods
export const getFilteredProducts = async (filters: FilterOptions): Promise<Product[]> => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.earth_score_min) params.append('earth_score_min', filters.earth_score_min.toString());
  if (filters.earth_score_max) params.append('earth_score_max', filters.earth_score_max.toString());
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.limit) params.append('limit', filters.limit.toString());
  
  const response = await apiClient.get(`/api/products/filter?${params.toString()}`);
  return response.data.products;
};

export const processExpressCheckout = async (checkoutData: ExpressCheckoutRequest) => {
  const response = await apiClient.post('/api/express-checkout', checkoutData);
  return response.data;
};

// ... add other API methods as needed, for example:
// export const createOrder = async (order: OrderPayload) => apiClient.post('/api/orders', order);

// Finally, export the raw axios instance for any custom calls
export const api = apiClient;

// Update the export default to include axios
export default apiClient;