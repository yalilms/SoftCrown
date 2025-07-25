// Stripe Payment Integration
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Order, PaymentMethod } from '@/types/ecommerce';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

export interface StripePaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
  status: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  paymentMethodId: string;
  billingDetails: {
    name: string;
    email: string;
    address: {
      line1: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export class StripeService {
  private stripe: Stripe | null = null;

  async initialize(): Promise<Stripe | null> {
    if (!this.stripe) {
      this.stripe = await getStripe();
    }
    return this.stripe;
  }

  // Create Payment Intent
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<StripePaymentIntent> {
    try {
      const response = await fetch('/api/payments/stripe/create-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentIntent = await response.json();
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }

  // Confirm Payment
  async confirmPayment(request: ConfirmPaymentRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const stripe = await this.initialize();
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error, paymentIntent } = await stripe.confirmCardPayment(
        request.paymentIntentId,
        {
          payment_method: request.paymentMethodId,
          billing_details: request.billingDetails,
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent?.status === 'succeeded') {
        return { success: true };
      }

      return { success: false, error: 'Payment not completed' };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return { success: false, error: 'Failed to confirm payment' };
    }
  }

  // Create Setup Intent for saving payment methods
  async createSetupIntent(customerId: string): Promise<{ client_secret: string }> {
    try {
      const response = await fetch('/api/payments/stripe/create-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw new Error('Failed to create setup intent');
    }
  }

  // Get saved payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payments/stripe/payment-methods?customerId=${customerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { paymentMethods } = await response.json();
      return paymentMethods.map((pm: any) => ({
        id: pm.id,
        type: 'card',
        provider: 'stripe',
        isDefault: false,
        isActive: true,
        last4: pm.card?.last4,
        brand: pm.card?.brand,
        expiryMonth: pm.card?.exp_month,
        expiryYear: pm.card?.exp_year,
      }));
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Create subscription
  async createSubscription(customerId: string, priceId: string, paymentMethodId: string) {
    try {
      const response = await fetch('/api/payments/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId,
          paymentMethodId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('Failed to create subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    try {
      const response = await fetch('/api/payments/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  // Process refund
  async processRefund(paymentIntentId: string, amount?: number): Promise<{ success: boolean; refundId?: string; error?: string }> {
    try {
      const response = await fetch('/api/payments/stripe/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          amount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, refundId: result.refund.id };
    } catch (error) {
      console.error('Error processing refund:', error);
      return { success: false, error: 'Failed to process refund' };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentIntentId: string): Promise<{ status: string; amount: number; currency: string }> {
    try {
      const response = await fetch(`/api/payments/stripe/payment-status?paymentIntentId=${paymentIntentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment status:', error);
      throw new Error('Failed to get payment status');
    }
  }

  // Webhook signature verification
  static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    try {
      // This would typically use Stripe's webhook verification
      // For now, we'll return true for mock purposes
      return true;
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Utility functions
export const formatStripeAmount = (amount: number): number => {
  // Stripe expects amounts in cents
  return Math.round(amount * 100);
};

export const formatDisplayAmount = (stripeAmount: number): number => {
  // Convert from cents to euros
  return stripeAmount / 100;
};

export const getStripeErrorMessage = (error: any): string => {
  if (error?.type === 'card_error') {
    switch (error.code) {
      case 'card_declined':
        return 'Tu tarjeta fue rechazada. Intenta con otra tarjeta.';
      case 'insufficient_funds':
        return 'Fondos insuficientes en tu tarjeta.';
      case 'incorrect_cvc':
        return 'El código CVC es incorrecto.';
      case 'expired_card':
        return 'Tu tarjeta ha expirado.';
      case 'incorrect_number':
        return 'El número de tarjeta es incorrecto.';
      default:
        return error.message || 'Error con tu tarjeta.';
    }
  }
  
  return error?.message || 'Error procesando el pago.';
};
