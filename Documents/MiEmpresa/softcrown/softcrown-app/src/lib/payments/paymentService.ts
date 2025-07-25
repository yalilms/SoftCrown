// Unified Payment Service
import { stripeService } from './stripe';
import { paypalService } from './paypal';
import { Order, PaymentMethod, PaymentStatus } from '@/types/ecommerce';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer';
  customerInfo: {
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
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  status?: PaymentStatus;
  error?: string;
  redirectUrl?: string;
}

export interface RefundRequest {
  paymentId: string;
  amount?: number;
  reason: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  amount?: number;
  error?: string;
}

export interface RecurringPaymentRequest {
  customerId: string;
  planId: string;
  paymentMethodId: string;
  startDate?: Date;
}

export class PaymentService {
  // Process payment based on method
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      switch (request.paymentMethod) {
        case 'stripe':
          return await this.processStripePayment(request);
        case 'paypal':
          return await this.processPayPalPayment(request);
        case 'bank_transfer':
          return await this.processBankTransfer(request);
        default:
          throw new Error(`Unsupported payment method: ${request.paymentMethod}`);
      }
    } catch (error) {
      // console.error('Payment processing error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Process Stripe payment
  private async processStripePayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create payment intent
      const paymentIntent = await stripeService.createPaymentIntent({
        amount: request.amount,
        currency: request.currency,
        orderId: request.orderId,
        metadata: request.metadata,
      });

      return {
        success: true,
        paymentId: paymentIntent.id,
        status: 'processing',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment failed',
      };
    }
  }

  // Process PayPal payment
  private async processPayPalPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Create PayPal order
      const orderData = {
        intent: 'CAPTURE' as const,
        purchase_units: [{
          amount: {
            currency_code: request.currency.toUpperCase(),
            value: request.amount.toFixed(2),
          },
          description: `SoftCrown Order #${request.orderId}`,
        }],
        application_context: {
          brand_name: 'SoftCrown',
          landing_page: 'NO_PREFERENCE' as const,
          shipping_preference: 'NO_SHIPPING' as const,
          user_action: 'PAY_NOW' as const,
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
        },
      };

      const paypalOrder = await paypalService.createOrder(orderData);
      const approvalUrl = paypalOrder.links.find(link => link.rel === 'approve')?.href;

      return {
        success: true,
        paymentId: paypalOrder.id,
        status: 'pending',
        redirectUrl: approvalUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'PayPal payment failed',
      };
    }
  }

  // Process bank transfer
  private async processBankTransfer(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Generate bank transfer instructions
      const transferId = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // In a real app, this would create a pending payment record
      // and send bank transfer instructions via email
      
      return {
        success: true,
        paymentId: transferId,
        status: 'pending',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bank transfer setup failed',
      };
    }
  }

  // Confirm payment (for client-side confirmation)
  async confirmPayment(paymentId: string, paymentMethod: string, confirmationData: any): Promise<PaymentResult> {
    try {
      switch (paymentMethod) {
        case 'stripe':
          const stripeResult = await stripeService.confirmPayment({
            paymentIntentId: paymentId,
            paymentMethodId: confirmationData.paymentMethodId,
            billingDetails: confirmationData.billingDetails,
          });
          
          return {
            success: stripeResult.success,
            paymentId,
            status: stripeResult.success ? 'paid' : 'failed',
            error: stripeResult.error,
          };

        case 'paypal':
          const paypalResult = await paypalService.captureOrder(paymentId);
          
          return {
            success: paypalResult.status === 'COMPLETED',
            paymentId,
            status: paypalResult.status === 'COMPLETED' ? 'paid' : 'failed',
          };

        default:
          throw new Error(`Unsupported payment method: ${paymentMethod}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed',
      };
    }
  }

  // Process refund
  async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      // Determine payment method from payment ID prefix
      const paymentMethod = this.getPaymentMethodFromId(request.paymentId);

      switch (paymentMethod) {
        case 'stripe':
          const stripeRefund = await stripeService.processRefund(
            request.paymentId,
            request.amount
          );
          
          return {
            success: stripeRefund.success,
            refundId: stripeRefund.refundId,
            error: stripeRefund.error,
          };

        case 'paypal':
          const paypalRefund = await paypalService.processRefund(
            request.paymentId,
            request.amount ? {
              currency_code: 'EUR',
              value: request.amount.toFixed(2),
            } : undefined
          );
          
          return {
            success: true,
            refundId: paypalRefund.id,
            amount: parseFloat(paypalRefund.amount?.value || '0'),
          };

        default:
          throw new Error(`Refund not supported for payment method: ${paymentMethod}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Create recurring payment/subscription
  async createRecurringPayment(request: RecurringPaymentRequest): Promise<PaymentResult> {
    try {
      // For Stripe subscriptions
      const subscription = await stripeService.createSubscription(
        request.customerId,
        request.planId,
        request.paymentMethodId
      );

      return {
        success: true,
        paymentId: subscription.id,
        status: 'active',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription creation failed',
      };
    }
  }

  // Cancel recurring payment/subscription
  async cancelRecurringPayment(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const paymentMethod = this.getPaymentMethodFromId(subscriptionId);

      switch (paymentMethod) {
        case 'stripe':
          await stripeService.cancelSubscription(subscriptionId);
          return { success: true };

        case 'paypal':
          await paypalService.cancelSubscription(subscriptionId, 'User requested cancellation');
          return { success: true };

        default:
          throw new Error(`Cancellation not supported for payment method: ${paymentMethod}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Subscription cancellation failed',
      };
    }
  }

  // Get payment status
  async getPaymentStatus(paymentId: string): Promise<{ status: PaymentStatus; amount?: number }> {
    try {
      const paymentMethod = this.getPaymentMethodFromId(paymentId);

      switch (paymentMethod) {
        case 'stripe':
          const stripeStatus = await stripeService.getPaymentStatus(paymentId);
          return {
            status: this.mapStripeStatus(stripeStatus.status),
            amount: stripeStatus.amount / 100, // Convert from cents
          };

        case 'paypal':
          const paypalOrder = await paypalService.getOrder(paymentId);
          return {
            status: this.mapPayPalStatus(paypalOrder.status),
          };

        default:
          return { status: 'pending' };
      }
    } catch (error) {
      // console.error('Error getting payment status:', error);
      return { status: 'failed' };
    }
  }

  // Get saved payment methods for customer
  async getCustomerPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const stripePaymentMethods = await stripeService.getPaymentMethods(customerId);
      // Could also fetch PayPal saved payment methods here
      
      return stripePaymentMethods;
    } catch (error) {
      // console.error('Error fetching payment methods:', error);
      return [];
    }
  }

  // Generate invoice
  async generateInvoice(orderId: string): Promise<{ success: boolean; invoiceUrl?: string; error?: string }> {
    try {
      // This would typically generate a PDF invoice and store it
      const invoiceUrl = `/api/invoices/${orderId}/download`;
      
      return {
        success: true,
        invoiceUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Invoice generation failed',
      };
    }
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(orderId: string, customerEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically send an email via your email service
      // console.log(`Sending payment confirmation for order ${orderId} to ${customerEmail}`);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed',
      };
    }
  }

  // Utility methods
  private getPaymentMethodFromId(paymentId: string): string {
    if (paymentId.startsWith('pi_') || paymentId.startsWith('sub_')) {
      return 'stripe';
    } else if (paymentId.includes('PAYPAL') || paymentId.length === 17) {
      return 'paypal';
    } else if (paymentId.startsWith('BT_')) {
      return 'bank_transfer';
    }
    return 'unknown';
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case 'succeeded':
        return 'paid';
      case 'processing':
        return 'processing';
      case 'requires_payment_method':
      case 'requires_confirmation':
      case 'requires_action':
        return 'pending';
      case 'canceled':
        return 'failed';
      default:
        return 'pending';
    }
  }

  private mapPayPalStatus(paypalStatus: string): PaymentStatus {
    switch (paypalStatus) {
      case 'COMPLETED':
        return 'paid';
      case 'APPROVED':
        return 'processing';
      case 'CREATED':
      case 'SAVED':
        return 'pending';
      case 'VOIDED':
        return 'failed';
      default:
        return 'pending';
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();

// Utility functions
export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const validatePaymentAmount = (amount: number): boolean => {
  return amount > 0 && amount <= 999999; // Max €999,999
};

export const getPaymentMethodIcon = (method: string): string => {
  switch (method) {
    case 'stripe':
    case 'card':
      return '💳';
    case 'paypal':
      return '🅿️';
    case 'bank_transfer':
      return '🏦';
    default:
      return '💰';
  }
};

export const getPaymentStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'paid':
      return 'text-green-600 bg-green-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    case 'pending':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'refunded':
      return 'text-gray-600 bg-gray-100';
    case 'partially_refunded':
      return 'text-orange-600 bg-orange-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};
