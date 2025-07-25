// E-commerce Types for SoftCrown Services

export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number; // For discounts
  type: 'service' | 'package' | 'addon';
  category: string;
  subcategory?: string;
  deliveryTime: string;
  features: string[];
  isRecurring?: boolean;
  recurringPeriod?: 'monthly' | 'yearly';
  isPopular?: boolean;
  isFeatured?: boolean;
  images: string[];
  tags: string[];
  requirements?: string[];
  deliverables: string[];
  revisions: number;
  supportIncluded: boolean;
  complexity: 'basic' | 'standard' | 'premium';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductPackage {
  id: string;
  name: string;
  description: string;
  products: string[]; // Product IDs
  discountPercentage: number;
  totalPrice: number;
  originalPrice: number;
  isActive: boolean;
  validUntil?: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  selectedAddons?: string[];
  customizations?: Record<string, any>;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

export interface ShoppingCart {
  id: string;
  userId?: string; // For logged in users
  sessionId: string; // For guest users
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxAmount: number;
  total: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface DiscountCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  applicableProducts?: string[];
  applicableCategories?: string[];
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  validFrom: Date;
  validUntil: Date;
  createdAt: Date;
}

export interface ShippingOption {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface Address {
  id: string;
  type: 'billing' | 'shipping';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_transfer' | 'crypto';
  provider: 'stripe' | 'paypal' | 'manual';
  isDefault: boolean;
  isActive: boolean;
  // Card specific
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  // PayPal specific
  email?: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  selectedAddons?: string[];
  customizations?: Record<string, any>;
  status: OrderStatus;
  deliveredAt?: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  taxAmount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  billingAddress: Address;
  shippingAddress?: Address;
  notes?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Project tracking
  projectId?: string;
  assignedTo?: string[];
  milestones?: OrderMilestone[];
}

export interface OrderMilestone {
  id: string;
  orderId: string;
  title: string;
  description: string;
  dueDate: Date;
  completedAt?: Date;
  status: 'pending' | 'in_progress' | 'completed';
  deliverables: string[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  product: Product;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  currency: string;
  startDate: Date;
  endDate?: Date;
  nextBillingDate: Date;
  autoRenew: boolean;
  paymentMethodId: string;
  trialEndDate?: Date;
  cancelledAt?: Date;
  pausedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenancePlan {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  billingCycle: 'monthly' | 'yearly';
  supportLevel: 'basic' | 'standard' | 'premium';
  responseTime: string;
  monthlyHours: number;
  backupFrequency: string;
  securityUpdates: boolean;
  performanceOptimization: boolean;
  isPopular: boolean;
  isActive: boolean;
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    revenue: number;
    orders: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  customerLifetimeValue: number;
  repeatCustomerRate: number;
}

export interface ConversionFunnel {
  step: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  dropoffRate: number;
}

// API Response Types
export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form Types
export interface CheckoutForm {
  // Customer Info
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  
  // Billing Address
  billingAddress: Omit<Address, 'id' | 'type'>;
  
  // Shipping Address (if different)
  useShippingAddress: boolean;
  shippingAddress?: Omit<Address, 'id' | 'type'>;
  
  // Payment
  paymentMethod: string;
  
  // Additional
  notes?: string;
  subscribeNewsletter: boolean;
  agreeTerms: boolean;
}

export interface ProductFilters {
  category?: string;
  type?: Product['type'];
  priceRange?: {
    min: number;
    max: number;
  };
  deliveryTime?: string;
  complexity?: Product['complexity'];
  isRecurring?: boolean;
  tags?: string[];
  search?: string;
}

export interface ProductSort {
  field: 'name' | 'price' | 'createdAt' | 'popularity';
  direction: 'asc' | 'desc';
}

// Utility Types
export type CartAction = 
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { itemId: string } }
  | { type: 'APPLY_DISCOUNT'; payload: { code: string; discount: DiscountCode } }
  | { type: 'REMOVE_DISCOUNT' }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: ShoppingCart };

export interface EcommerceState {
  cart: ShoppingCart | null;
  products: Product[];
  orders: Order[];
  subscriptions: Subscription[];
  isLoading: boolean;
  error: string | null;
}
