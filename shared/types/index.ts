import type { Timestamp } from 'firebase/firestore';

// ─── Product ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  slug: string;
  skuCode: string;
  categoryId: string;
  description: string;
  ingredients: string;
  weightGrams: number;
  packetDimensions: string;
  priceLKR: number;
  compareAtPriceLKR: number;
  stockQuantity: number;
  lowStockThreshold: number;
  inStock: boolean;
  images: string[];
  shelfLife: string;
  healthTags: string[];
  sortOrder: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  parentName: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type PaymentMethod = 'COD' | 'PAYHERE' | 'STRIPE' | 'IPAY';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';
export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Dispatched'
  | 'Delivered'
  | 'Cancelled';

export interface DeliveryAddress {
  line1: string;
  city: string;
  district: string;
  province: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  priceLKR: number;
  subtotalLKR: number;
}

export interface StatusHistoryEntry {
  status: string;
  changedAt: Timestamp;
  changedByUid: string;
  note: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    deliveryAddress: DeliveryAddress;
  };
  items: OrderItem[];
  subtotalLKR: number;
  shippingLKR: number;
  discountLKR: number;
  couponCode: string | null;
  totalLKR: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId: string | null;
  gatewayResponse: Record<string, unknown> | null;
  orderStatus: OrderStatus;
  orderNotes: string;
  cancellationReason: string | null;
  trackingNumber: string | null;
  statusHistory: StatusHistoryEntry[];
  emailSent: boolean;
  customerId?: string | null;
  driverId?: string | null;
  driverName?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Customer ─────────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  addresses: DeliveryAddress[];
  orderCount: number;
  totalOrders: number;
  totalSpentLKR: number;
  firstOrderAt: Timestamp | null;
  lastOrderAt: Timestamp | null;
  lastDeliveryAddress: DeliveryAddress | null;
  notes: string;
  createdAt: Timestamp;
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface HeroSlide {
  id: string;
  imageUrl: string;
  headline: string;
  subheadline: string;
  cta1Label: string;
  cta1Href: string;
  cta2Label: string;
  cta2Href: string;
}

export interface ShippingRates {
  colombo: number;
  westernProvince: number;
  outstation: number;
}

export interface SiteSettings {
  announcementBarEnabled: boolean;
  announcementBarText: string;
  heroSlides: HeroSlide[];
  featuredProductIds: string[];
  shippingRates: ShippingRates;
  minOrderForFreeShipping: number;
  whatsappNumber: string;
  contactEmail: string;
  businessAddress: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  metaPixelId: string;
  tiktokPixelId: string;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderLKR: number;
  usageLimit: number;
  usageCount: number;
  expiresAt: Timestamp;
  isActive: boolean;
}

// ─── Admin User & RBAC ────────────────────────────────────────────────────────

export interface RolePermissions {
  // Dashboard
  dashboard_view: boolean;
  dashboard_export_analytics: boolean;
  // Orders
  orders_view: boolean;
  orders_edit: boolean;
  orders_update_status: boolean;
  orders_refund: boolean;
  orders_delivery_queue: boolean;
  // Products & Categories
  menu_view: boolean;
  menu_edit: boolean;
  menu_toggle_stock: boolean;
  // Customers
  customers_view: boolean;
  customers_edit: boolean;
  // Coupons
  coupons_manage: boolean;
  // Settings
  settings_manage: boolean;
  // Staff & Roles
  staff_manage: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: RolePermissions;
  isActive: boolean;
  isSystem: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  roleId: string;
  role?: string; // Legacy fallback
  isActive: boolean;
  createdAt: Timestamp;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceLKR: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotalLKR: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

// ─── Checkout Form ────────────────────────────────────────────────────────────

export interface CustomerFormData {
  name: string;
  phone: string;
  email: string;
  deliveryAddress: DeliveryAddress;
  orderNotes: string;
}

// ─── Contact Message ──────────────────────────────────────────────────────────

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Timestamp;
}

// ─── Counters ─────────────────────────────────────────────────────────────────

export interface OrderCounter {
  count: number;
  year: number;
}

// ─── Sri Lankan Districts & Provinces ────────────────────────────────────────

export const DISTRICT_PROVINCE_MAP: Record<string, string> = {
  Colombo: 'Western Province',
  Gampaha: 'Western Province',
  Kalutara: 'Western Province',
  Kandy: 'Central Province',
  Matale: 'Central Province',
  'Nuwara Eliya': 'Central Province',
  Galle: 'Southern Province',
  Matara: 'Southern Province',
  Hambantota: 'Southern Province',
  Jaffna: 'Northern Province',
  Kilinochchi: 'Northern Province',
  Mannar: 'Northern Province',
  Mullaitivu: 'Northern Province',
  Vavuniya: 'Northern Province',
  Trincomalee: 'Eastern Province',
  Batticaloa: 'Eastern Province',
  Ampara: 'Eastern Province',
  Kurunegala: 'North Western Province',
  Puttalam: 'North Western Province',
  Anuradhapura: 'North Central Province',
  Polonnaruwa: 'North Central Province',
  Badulla: 'Uva Province',
  Monaragala: 'Uva Province',
  Ratnapura: 'Sabaragamuwa Province',
  Kegalle: 'Sabaragamuwa Province',
};

export const SHIPPING_DISTRICT_TIER: Record<string, keyof ShippingRates> = {
  Colombo: 'colombo',
  Gampaha: 'westernProvince',
  Kalutara: 'westernProvince',
  Kandy: 'outstation',
  Matale: 'outstation',
  'Nuwara Eliya': 'outstation',
  Galle: 'outstation',
  Matara: 'outstation',
  Hambantota: 'outstation',
  Jaffna: 'outstation',
  Kilinochchi: 'outstation',
  Mannar: 'outstation',
  Mullaitivu: 'outstation',
  Vavuniya: 'outstation',
  Trincomalee: 'outstation',
  Batticaloa: 'outstation',
  Ampara: 'outstation',
  Kurunegala: 'outstation',
  Puttalam: 'outstation',
  Anuradhapura: 'outstation',
  Polonnaruwa: 'outstation',
  Badulla: 'outstation',
  Monaragala: 'outstation',
  Ratnapura: 'outstation',
  Kegalle: 'outstation',
};
