export interface User {
  id: string;
  username: string;
  email: string;
  role: 'brand_user' | 'merch_ops';
}

export interface SKU {
  id: string;
  name: string;
  sales: number;
  return_percentage: number;
  content_score: number;
  user_id: string;
  created_at: string;
  sales_data: SalesDataPoint[];
}

export interface SalesDataPoint {
  month: string;
  sales: number;
  date: string;
}

export interface Note {
  id: string;
  sku_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'brand_user' | 'merch_ops';
}