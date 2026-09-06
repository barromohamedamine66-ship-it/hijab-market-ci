// ==============================================================================
// HIJAB MARKET CI — Types TypeScript Complets v2.0
// ==============================================================================

// ---- Enums ----
export type UserRole = 'customer' | 'seller' | 'admin';
export type ShopStatus = 'pending' | 'active' | 'suspended' | 'rejected';
export type ProductStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
export type OrderStatus =
  | 'pending'
  | 'payment_pending'
  | 'paid'
  | 'confirmed'
  | 'processing'
  | 'ready_for_shipment'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'receipt_confirmed'
  | 'cancelled'
  | 'refunded';
export type PaymentMethod = 'wave' | 'orange_money' | 'mtn_momo' | 'moov_money' | 'card' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'cancelled' | 'refunded';
export type DisputeStatus = 'opened' | 'under_review' | 'resolved_refunded' | 'resolved_rejected' | 'closed';
export type WithdrawalStatus = 'pending' | 'approved' | 'rejected' | 'processed';
export type NotificationType = 'order' | 'payment' | 'review' | 'dispute' | 'system' | 'promotion';

// ---- Labels & Styles ----
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'En attente',
  payment_pending: 'Paiement en cours',
  paid: 'Paiement reçu',
  confirmed: 'Confirmée',
  processing: 'En préparation',
  ready_for_shipment: 'Prête pour livraison',
  shipped: 'Expédiée',
  out_for_delivery: 'En cours de livraison',
  delivered: 'Livrée',
  receipt_confirmed: 'Réceptionnée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  payment_pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  processing: 'bg-purple-100 text-purple-700',
  ready_for_shipment: 'bg-sky-100 text-sky-700',
  shipped: 'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-teal-100 text-teal-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  receipt_confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  mtn_momo: 'MTN MoMo',
  moov_money: 'Moov Money',
  card: 'Carte bancaire',
  cash_on_delivery: 'Paiement à la livraison',
};

// ---- Entités ----

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  city: string;
  commune: string | null;
  address: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string;
  icon: string | null;
  image_url: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  city: string;
  commune: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: ShopStatus;
  verified: boolean;
  commission_rate: number;
  rating: number;
  total_reviews: number;
  total_sales: number;
  // Nouveau positionnement : Abonnements & Boutiques Fondatrices
  is_founder?: boolean;
  free_trial_start?: string | null;
  free_trial_end?: string | null;
  subscription_plan_id?: string | null;
  subscription_status?: 'trial' | 'active' | 'expired' | 'cancelled' | null;
  views_count?: number;
  opening_hours?: string | null;
  social_instagram?: string | null;
  social_facebook?: string | null;
  social_tiktok?: string | null;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  subscription_plan?: SubscriptionPlan;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  duration: string;
  description: string | null;
  max_products: number; // -1 = illimité
  featured_products: number;
  analytics: boolean;
  priority_visibility: boolean;
  active: boolean;
  created_at: string;
  updated_at?: string;
  code?: string;
  price_monthly?: number;
  price_yearly?: number;
  features?: string[];
  badge_name?: string;
  is_popular?: boolean;
  order_index?: number;
  is_active?: boolean;
}

export interface StoreSubscription {
  id: string;
  store_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  starts_at: string;
  ends_at: string;
  is_founder: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
  store?: Shop;
}

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  status: ProductStatus;
  featured: boolean;
  badge: string | null;
  material: string | null;
  colors: string[];
  sizes: string[];
  rating: number;
  reviews_count: number;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  store?: Shop;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  position: number;
  is_cover: boolean;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  created_at: string;
  updated_at: string;
  product?: Product;
}

/** Représentation locale du panier (avant connexion / localStorage) */
export interface LocalCartItem {
  product_id: string;
  product_name: string;
  product_image: string | null;
  price: number;
  quantity: number;
  selected_color?: string;
  selected_size?: string;
  store_id: string;
  store_name: string;
}

export interface Address {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  city: string;
  commune: string;
  neighborhood: string | null;
  address: string;
  landmark: string | null;
  is_default: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentMethod | string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  delivery_address_id: string | null;
  customer_notes: string | null;
  receipt_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  delivery_address?: Address;
  customer?: Profile;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  store_id: string | null;
  product_name: string;
  product_image_url: string | null;
  unit_price: number;
  quantity: number;
  selected_color: string | null;
  selected_size: string | null;
  subtotal: number;
  store?: Shop;
}

export interface Payment {
  id: string;
  order_id: string;
  provider: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_reference: string | null;
  provider_response: Record<string, unknown> | null;
  initiated_at: string;
  completed_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  customer_id: string;
  product_id: string;
  order_id: string | null;
  store_id: string;
  rating: number;
  comment: string | null;
  verified_purchase: boolean;
  created_at: string;
  customer?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  order?: Order;
  store?: Shop;
}

export interface SellerWallet {
  id: string;
  store_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  order_id: string | null;
  type: 'credit_sale' | 'debit_withdrawal' | 'debit_fee' | 'credit_refund';
  amount: number;
  description: string | null;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  store_id: string;
  wallet_id: string;
  amount: number;
  payment_method: PaymentMethod;
  account_name: string;
  account_number: string;
  status: WithdrawalStatus;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
  store?: Shop;
}

// ---- Formes de saisie ----

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  role: 'customer' | 'seller';
  shop_name?: string;
  shop_description?: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  old_price?: number;
  stock: number;
  category_id: string;
  material?: string;
  colors: string[];
  sizes: string[];
  featured: boolean;
  badge?: string;
}

export interface CheckoutFormData {
  delivery_address_id?: string;
  full_name: string;
  phone: string;
  city: string;
  commune: string;
  neighborhood?: string;
  address: string;
  landmark?: string;
  payment_method: PaymentMethod;
  customer_notes?: string;
}

// ---- Type Supabase Database placeholder (pour générer plus tard avec Supabase CLI) ----
export type Database = {
  public: {
    Tables: Record<string, { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown> }>;
  };
};
