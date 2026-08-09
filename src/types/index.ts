export interface ProductVariant {
  id: string;
  product_id: string;
  size: string;
  color?: string;
  sku?: string;
  price: number;
  sale_price?: number;
  stock: number;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  image_url?: string;
  parent_id?: string;
  sort_order: number;
  is_featured?: boolean;
  is_active?: boolean;
  show_on_homepage?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_image?: string;
  is_featured: boolean;
  sort_order?: number;
  is_active?: boolean;
  badge_color?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description?: string;
  full_description?: string;
  size_guide?: string;
  brand: string;
  sku?: string;
  barcode?: string;
  status: 'active' | 'draft' | 'archived';
  is_featured: boolean;
  is_new_arrival: boolean;
  is_clearance: boolean;
  is_crazy_deal: boolean;
  is_bundle_offer: boolean;
  is_minor_fault: boolean;
  regular_price: number;
  sale_price?: number;
  cost_price?: number;
  compare_at_price?: number;
  category_id?: string;
  category?: Category;
  gender?: string;
  age_group?: string;
  product_type?: string;
  tags?: string[];
  main_image: string;
  gallery_images?: string[];
  track_inventory: boolean;
  total_stock: number;
  low_stock_threshold: number;
  variants?: ProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  variant_info?: string;
  unit_price: number;
  price?: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  province: string;
  city: string;
  full_address: string;
  order_notes?: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  payment_receipt_url?: string | null;
  payment_proof_url?: string | null;
  items?: OrderItem[];
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  min_spend: number;
  max_discount_amount?: number;
  is_public: boolean;
  is_active: boolean;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  times_used?: number;
  created_at?: string;
}

export interface Review {
  id: string;
  product_id?: string;
  customer_name: string;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  is_featured: boolean;
  created_at: string;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  variant?: ProductVariant;
  selectedVariant?: string;
  selectedSize?: string;
  selectedColor?: string;
}

export interface HomepageSection {
  id: string;
  section_type: string;
  internal_name: string;
  public_title?: string;
  subtitle?: string;
  desktop_image?: string;
  mobile_image?: string;
  cta_label?: string;
  cta_url?: string;
  sort_order: number;
  is_enabled: boolean;
  config_json?: any;
  metadata?: any;
}
