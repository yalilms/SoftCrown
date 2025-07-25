'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  EcommerceState, 
  CartAction, 
  ShoppingCart, 
  CartItem, 
  Product,
  DiscountCode 
} from '@/types/ecommerce';

// Initial state
const initialState: EcommerceState = {
  cart: null,
  products: [],
  orders: [],
  subscriptions: [],
  isLoading: false,
  error: null,
};

// Context
const EcommerceContext = createContext<{
  state: EcommerceState;
  dispatch: React.Dispatch<CartAction>;
  // Cart methods
  addToCart: (product: Product, quantity?: number, customizations?: Record<string, any>) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  applyDiscount: (code: string) => Promise<boolean>;
  removeDiscount: () => void;
  // Utility methods
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isInCart: (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
} | undefined>(undefined);

// Cart reducer
function cartReducer(state: EcommerceState, action: CartAction): EcommerceState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItem = action.payload;
      const existingCart = state.cart;
      
      if (!existingCart) {
        // Create new cart
        const newCart: ShoppingCart = {
          id: generateCartId(),
          sessionId: generateSessionId(),
          items: [newItem],
          subtotal: newItem.totalPrice,
          discountAmount: 0,
          taxAmount: 0,
          total: newItem.totalPrice,
          currency: 'EUR',
          createdAt: new Date(),
          updatedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        };
        return { ...state, cart: newCart };
      }

      // Check if item already exists
      const existingItemIndex = existingCart.items.findIndex(
        item => item.productId === newItem.productId
      );

      let updatedItems: CartItem[];
      if (existingItemIndex >= 0) {
        // Update existing item
        updatedItems = existingCart.items.map((item, index) => 
          index === existingItemIndex 
            ? { 
                ...item, 
                quantity: item.quantity + newItem.quantity,
                totalPrice: (item.quantity + newItem.quantity) * item.unitPrice
              }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...existingCart.items, newItem];
      }

      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = existingCart.discountCode ? calculateDiscount(subtotal, existingCart.discountCode) : 0;
      const taxAmount = calculateTax(subtotal - discountAmount);
      const total = subtotal - discountAmount + taxAmount;

      const updatedCart: ShoppingCart = {
        ...existingCart,
        items: updatedItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        updatedAt: new Date(),
      };

      return { ...state, cart: updatedCart };
    }

    case 'UPDATE_QUANTITY': {
      if (!state.cart) return state;

      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: { itemId } });
      }

      const updatedItems = state.cart.items.map(item =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: quantity * item.unitPrice }
          : item
      );

      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.cart.discountCode ? calculateDiscount(subtotal, state.cart.discountCode) : 0;
      const taxAmount = calculateTax(subtotal - discountAmount);
      const total = subtotal - discountAmount + taxAmount;

      const updatedCart: ShoppingCart = {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        updatedAt: new Date(),
      };

      return { ...state, cart: updatedCart };
    }

    case 'REMOVE_ITEM': {
      if (!state.cart) return state;

      const { itemId } = action.payload;
      const updatedItems = state.cart.items.filter(item => item.id !== itemId);

      if (updatedItems.length === 0) {
        return { ...state, cart: null };
      }

      const subtotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
      const discountAmount = state.cart.discountCode ? calculateDiscount(subtotal, state.cart.discountCode) : 0;
      const taxAmount = calculateTax(subtotal - discountAmount);
      const total = subtotal - discountAmount + taxAmount;

      const updatedCart: ShoppingCart = {
        ...state.cart,
        items: updatedItems,
        subtotal,
        discountAmount,
        taxAmount,
        total,
        updatedAt: new Date(),
      };

      return { ...state, cart: updatedCart };
    }

    case 'APPLY_DISCOUNT': {
      if (!state.cart) return state;

      const { code, discount } = action.payload;
      const discountAmount = calculateDiscountFromCode(state.cart.subtotal, discount);
      const taxAmount = calculateTax(state.cart.subtotal - discountAmount);
      const total = state.cart.subtotal - discountAmount + taxAmount;

      const updatedCart: ShoppingCart = {
        ...state.cart,
        discountCode: code,
        discountAmount,
        taxAmount,
        total,
        updatedAt: new Date(),
      };

      return { ...state, cart: updatedCart };
    }

    case 'REMOVE_DISCOUNT': {
      if (!state.cart) return state;

      const taxAmount = calculateTax(state.cart.subtotal);
      const total = state.cart.subtotal + taxAmount;

      const updatedCart: ShoppingCart = {
        ...state.cart,
        discountCode: undefined,
        discountAmount: 0,
        taxAmount,
        total,
        updatedAt: new Date(),
      };

      return { ...state, cart: updatedCart };
    }

    case 'CLEAR_CART': {
      return { ...state, cart: null };
    }

    case 'LOAD_CART': {
      return { ...state, cart: action.payload };
    }

    default:
      return state;
  }
}

// Provider component
export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('softcrown_cart');
    if (savedCart) {
      try {
        const cart = JSON.parse(savedCart);
        // Check if cart is not expired
        if (new Date(cart.expiresAt) > new Date()) {
          dispatch({ type: 'LOAD_CART', payload: cart });
        } else {
          localStorage.removeItem('softcrown_cart');
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('softcrown_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.cart) {
      localStorage.setItem('softcrown_cart', JSON.stringify(state.cart));
    } else {
      localStorage.removeItem('softcrown_cart');
    }
  }, [state.cart]);

  // Cart methods
  const addToCart = (product: Product, quantity = 1, customizations?: Record<string, any>) => {
    const cartItem: CartItem = {
      id: generateCartItemId(),
      productId: product.id,
      product,
      quantity,
      customizations,
      unitPrice: product.price,
      totalPrice: product.price * quantity,
      addedAt: new Date(),
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });

    // Track analytics event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'EUR',
        value: cartItem.totalPrice,
        items: [{
          item_id: product.id,
          item_name: product.name,
          category: product.category,
          quantity: quantity,
          price: product.price,
        }],
      });
    }
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const removeFromCart = (itemId: string) => {
    const item = state.cart?.items.find(item => item.id === itemId);
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });

    // Track analytics event
    if (item && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'remove_from_cart', {
        currency: 'EUR',
        value: item.totalPrice,
        items: [{
          item_id: item.product.id,
          item_name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          price: item.product.price,
        }],
      });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const applyDiscount = async (code: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      const discount = await validateDiscountCode(code);
      if (discount) {
        dispatch({ type: 'APPLY_DISCOUNT', payload: { code, discount } });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error applying discount:', error);
      return false;
    }
  };

  const removeDiscount = () => {
    dispatch({ type: 'REMOVE_DISCOUNT' });
  };

  // Utility methods
  const getCartTotal = (): number => {
    return state.cart?.total || 0;
  };

  const getCartItemCount = (): number => {
    return state.cart?.items.reduce((count, item) => count + item.quantity, 0) || 0;
  };

  const isInCart = (productId: string): boolean => {
    return state.cart?.items.some(item => item.productId === productId) || false;
  };

  const getCartItem = (productId: string): CartItem | undefined => {
    return state.cart?.items.find(item => item.productId === productId);
  };

  const value = {
    state,
    dispatch,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    getCartTotal,
    getCartItemCount,
    isInCart,
    getCartItem,
  };

  return (
    <EcommerceContext.Provider value={value}>
      {children}
    </EcommerceContext.Provider>
  );
}

// Hook to use the context
export function useEcommerce() {
  const context = useContext(EcommerceContext);
  if (context === undefined) {
    throw new Error('useEcommerce must be used within an EcommerceProvider');
  }
  return context;
}

// Utility functions
function generateCartId(): string {
  return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function generateCartItemId(): string {
  return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function calculateTax(amount: number): number {
  // 21% VAT for Spain
  return amount * 0.21;
}

function calculateDiscount(subtotal: number, discountCode: string): number {
  // Mock discount calculation - in real app, this would use the DiscountCode object
  const discountRates: Record<string, number> = {
    'WELCOME10': 0.10,
    'SAVE20': 0.20,
    'FIRST50': 0.50,
  };
  
  const rate = discountRates[discountCode] || 0;
  return subtotal * rate;
}

function calculateDiscountFromCode(subtotal: number, discount: DiscountCode): number {
  if (discount.type === 'percentage') {
    const discountAmount = subtotal * (discount.value / 100);
    return discount.maxDiscountAmount 
      ? Math.min(discountAmount, discount.maxDiscountAmount)
      : discountAmount;
  } else {
    return Math.min(discount.value, subtotal);
  }
}

async function validateDiscountCode(code: string): Promise<DiscountCode | null> {
  // Mock API call - in real app, this would validate against the backend
  const mockDiscounts: Record<string, DiscountCode> = {
    'WELCOME10': {
      id: '1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      minOrderAmount: 100,
      usageLimit: 100,
      usedCount: 25,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      createdAt: new Date(),
    },
    'SAVE20': {
      id: '2',
      code: 'SAVE20',
      type: 'percentage',
      value: 20,
      minOrderAmount: 500,
      maxDiscountAmount: 200,
      usageLimit: 50,
      usedCount: 10,
      isActive: true,
      validFrom: new Date('2024-01-01'),
      validUntil: new Date('2024-12-31'),
      createdAt: new Date(),
    },
  };

  return new Promise((resolve) => {
    setTimeout(() => {
      const discount = mockDiscounts[code];
      resolve(discount || null);
    }, 500);
  });
}
