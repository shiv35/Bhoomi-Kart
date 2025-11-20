export interface ExpressCheckoutItem {
  product_id: number;
  product_name: string;
  price: number;
  quantity: number;
  earth_score: number;
  image_url?: string;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
}

export interface ExpressCheckoutRequest {
  user_id: string;
  items: ExpressCheckoutItem[];
  shipping_address: ShippingAddress;
  payment_method: string;
}

export interface ExpressCheckoutResponse {
  success: boolean;
  order_id: string;
  total: number;
  earth_score: number;
  co2_saved: number;
  transaction_id: string;
  message: string;
}

export interface FilterOptions {
  category?: string;
  earth_score_min?: number;
  earth_score_max?: number;
  sort_by?: string;
  limit?: number;
}