export interface Product {
  id: string;
  name: string;
  description: string | null;
  category_id: string | null;
  price_retail: number;
  price_wholesale: number | null;
  discount_price: number | null;
  flash_sale_end: string | null;
  stock: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  phone: string;
  address: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'completed';
  checkout_method: 'standard' | 'whatsapp' | 'call';
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string | null;
  product_id: string;
  order_id: string | null;
  rating: number;
  comment: string | null;
  reviewer_name: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}