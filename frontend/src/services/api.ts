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

// right below getProductById…
export const getRecommendations = async (productId: number): Promise<Product[]> => {
  const resp = await apiClient.get<Product[]>(`/api/products/${productId}/recommendations`);
  return resp.data;
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