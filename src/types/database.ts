export type OrderStatus = 'pending' | 'paid' | 'processing' | 'completed' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  name_somali: string;
  enabled: boolean;
  created_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface ProductColor {
  id: string;
  product_id: string;
  name: string;
  hex_code: string;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  eu_size: string;
  us_size: string;
  stock: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  is_on_sale: boolean;
  sale_price: number | null;
  category?: Category;
  product_images?: ProductImage[];
  product_colors?: ProductColor[];
  product_sizes?: ProductSize[];
}

export interface Order {
  id: string;
  customer_phone: string;
  total_amount: number;
  payment_reference: string | null;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  selected_size?: string | null;
  selected_color?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}