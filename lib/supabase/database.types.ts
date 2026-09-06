export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          city?: string;
          commune?: string | null;
          address?: string | null;
          role?: UserRole;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      categories: {
        Row: {
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
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          emoji?: string;
          icon?: string | null;
          image_url?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      shops: {
        Row: {
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          slug: string;
          description?: string | null;
          city?: string;
          commune?: string | null;
          address?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          logo_url?: string | null;
          banner_url?: string | null;
          status?: ShopStatus;
          verified?: boolean;
          commission_rate?: number;
          rating?: number;
          total_reviews?: number;
          total_sales?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['shops']['Insert']>;
      };
      products: {
        Row: {
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
        };
        Insert: {
          id?: string;
          store_id: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          old_price?: number | null;
          stock?: number;
          status?: ProductStatus;
          featured?: boolean;
          badge?: string | null;
          material?: string | null;
          colors?: string[];
          sizes?: string[];
          rating?: number;
          reviews_count?: number;
          admin_notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          position: number;
          is_cover: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          position?: number;
          is_cover?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['product_images']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          customer_id: string;
          order_number: string;
          status: OrderStatus;
          payment_status: PaymentStatus;
          subtotal: number;
          delivery_fee: number;
          total_amount: number;
          delivery_address_id: string | null;
          customer_notes: string | null;
          receipt_confirmed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          order_number?: string;
          status?: OrderStatus;
          payment_status?: PaymentStatus;
          subtotal: number;
          delivery_fee?: number;
          total_amount: number;
          delivery_address_id?: string | null;
          customer_notes?: string | null;
          receipt_confirmed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      order_items: {
        Row: {
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
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          store_id?: string | null;
          product_name: string;
          product_image_url?: string | null;
          unit_price: number;
          quantity?: number;
          selected_color?: string | null;
          selected_size?: string | null;
          subtotal?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>;
      };
      addresses: {
        Row: {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          phone: string;
          city?: string;
          commune: string;
          neighborhood?: string | null;
          address: string;
          landmark?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['addresses']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          provider: PaymentMethod;
          amount: number;
          status: PaymentStatus;
          transaction_reference: string | null;
          provider_response: Json | null;
          initiated_at: string;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          provider: PaymentMethod;
          amount: number;
          status?: PaymentStatus;
          transaction_reference?: string | null;
          provider_response?: Json | null;
          initiated_at?: string;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      seller_wallets: {
        Row: {
          id: string;
          store_id: string;
          available_balance: number;
          pending_balance: number;
          total_earned: number;
          total_withdrawn: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_id: string;
          available_balance?: number;
          pending_balance?: number;
          total_earned?: number;
          total_withdrawn?: number;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['seller_wallets']['Insert']>;
      };
    };
  };
}
