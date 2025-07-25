// Payment gateway integration for SoftCrown
// Supports Stripe, PayPal, and other payment providers

export interface PaymentConfig {
  provider: 'stripe' | 'paypal' | 'square' | 'redsys';
  publicKey: string;
  currency: 'EUR' | 'USD';
  environment: 'sandbox' | 'production';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  description: string;
  metadata: {
    leadId?: string;
    quoteId?: string;
    projectType?: string;
    clientEmail?: string;
    clientName?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  error?: string;
  transactionId?: string;
  amount?: number;
  currency?: string;
}

// Default configuration
const PAYMENT_CONFIG: PaymentConfig = {
  provider: 'stripe',
  publicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  currency: 'EUR',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
};

// Stripe integration
interface StripeInstance {
  confirmCardPayment: (clientSecret: string, options: any) => Promise<any>;
  confirmPayment: (options: any) => Promise<any>;
  elements: () => any;
  // Add other Stripe methods as needed
}

export class StripePaymentService {
  private stripe: StripeInstance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Load Stripe.js dynamically
      this.loadStripe();
    }
  }

  private async loadStripe() {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      this.stripe = await loadStripe(PAYMENT_CONFIG.publicKey);
    } catch (error) {
      // Error loading Stripe
    }
  }

  async createPaymentIntent(amount: number, description: string, metadata: Record<string, string>): Promise<PaymentIntent> {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to cents
          currency: PAYMENT_CONFIG.currency.toLowerCase(),
          description,
          metadata
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      return {
        id: data.id,
        amount: amount,
        currency: PAYMENT_CONFIG.currency,
        description,
        metadata
      };
    } catch (error) {
      // console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  async confirmPayment(clientSecret: string, paymentMethod: Record<string, any>): Promise<PaymentResult> {
    try {
      if (!this.stripe) {
        await this.loadStripe();
      }

      if (!this.stripe) {
        throw new Error('Stripe not initialized');
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message
        };
      }

      return {
        success: true,
        paymentId: result.paymentIntent.id,
        transactionId: result.paymentIntent.id,
        amount: result.paymentIntent.amount / 100,
        currency: result.paymentIntent.currency.toUpperCase()
      };
    } catch (error) {
      // console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }
}

// PayPal integration
export class PayPalPaymentService {
  private paypal: any;

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadPayPal();
    }
  }

  private async loadPayPal() {
    try {
      // Load PayPal SDK dynamically
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&currency=${PAYMENT_CONFIG.currency}`;
      document.head.appendChild(script);
      
      script.onload = () => {
        this.paypal = (window as any).paypal;
      };
    } catch (error) {
      // console.error('Error loading PayPal:', error);
    }
  }

  async createOrder(amount: number, description: string): Promise<string> {
    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount.toFixed(2),
          currency: PAYMENT_CONFIG.currency,
          description
        }),
      });

      const data = await response.json();
      return data.id;
    } catch (error) {
      // console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  async captureOrder(orderId: string): Promise<PaymentResult> {
    try {
      const response = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Payment capture failed'
        };
      }

      return {
        success: true,
        paymentId: data.id,
        transactionId: data.purchase_units[0].payments.captures[0].id,
        amount: parseFloat(data.purchase_units[0].amount.value),
        currency: data.purchase_units[0].amount.currency_code
      };
    } catch (error) {
      // console.error('Error capturing PayPal order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment capture failed'
      };
    }
  }
}

// Main payment service
export class PaymentService {
  private stripeService: StripePaymentService;
  private paypalService: PayPalPaymentService;

  constructor() {
    this.stripeService = new StripePaymentService();
    this.paypalService = new PayPalPaymentService();
  }

  // Process quote payment
  async processQuotePayment(
    quoteData: any,
    paymentMethod: 'stripe' | 'paypal',
    paymentDetails: any
  ): Promise<PaymentResult> {
    try {
      const amount = quoteData.total;
      const description = `Pago por ${quoteData.category} - ${quoteData.features?.length || 0} características`;
      const metadata = {
        quoteId: quoteData.id,
        projectType: quoteData.category,
        clientEmail: paymentDetails.email,
        clientName: paymentDetails.name
      };

      if (paymentMethod === 'stripe') {
        const intent = await this.stripeService.createPaymentIntent(amount, description, metadata);
        return await this.stripeService.confirmPayment(intent.id, paymentDetails);
      } else if (paymentMethod === 'paypal') {
        const orderId = await this.paypalService.createOrder(amount, description);
        return await this.paypalService.captureOrder(orderId);
      }

      throw new Error('Unsupported payment method');
    } catch (error) {
      // console.error('Error processing quote payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Process service payment
  async processServicePayment(
    serviceType: string,
    amount: number,
    clientInfo: any,
    paymentMethod: 'stripe' | 'paypal',
    paymentDetails: any
  ): Promise<PaymentResult> {
    try {
      const description = `Pago por servicio: ${serviceType}`;
      const metadata = {
        serviceType,
        clientEmail: clientInfo.email,
        clientName: clientInfo.name,
        leadId: clientInfo.leadId
      };

      if (paymentMethod === 'stripe') {
        const intent = await this.stripeService.createPaymentIntent(amount, description, metadata);
        return await this.stripeService.confirmPayment(intent.id, paymentDetails);
      } else if (paymentMethod === 'paypal') {
        const orderId = await this.paypalService.createOrder(amount, description);
        return await this.paypalService.captureOrder(orderId);
      }

      throw new Error('Unsupported payment method');
    } catch (error) {
      // console.error('Error processing service payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed'
      };
    }
  }

  // Get payment methods
  getAvailablePaymentMethods(): string[] {
    const methods = [];
    
    if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      methods.push('stripe');
    }
    
    if (process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      methods.push('paypal');
    }

    return methods;
  }

  // Validate payment configuration
  validatePaymentConfig(): boolean {
    const hasStripe = !!(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    const hasPayPal = !!(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID);
    
    return hasStripe || hasPayPal;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Payment utilities
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const calculateTax = (amount: number, taxRate: number = 0.21): number => {
  return amount * taxRate;
};

export const calculateTotal = (subtotal: number, taxRate: number = 0.21): number => {
  return subtotal + calculateTax(subtotal, taxRate);
};

// Payment status tracking
export interface PaymentStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export const trackPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
  try {
    const response = await fetch(`/api/payments/status/${paymentId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment status');
    }

    return await response.json();
  } catch (error) {
    // console.error('Error tracking payment status:', error);
    return null;
  }
};
