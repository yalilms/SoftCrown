// PayPal Payment Integration
import { Order } from '@/types/ecommerce';

export interface PayPalOrderRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    reference_id?: string;
    amount: {
      currency_code: string;
      value: string;
      breakdown?: {
        item_total: {
          currency_code: string;
          value: string;
        };
        tax_total?: {
          currency_code: string;
          value: string;
        };
        discount?: {
          currency_code: string;
          value: string;
        };
      };
    };
    items?: Array<{
      name: string;
      description?: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      quantity: string;
      category?: 'DIGITAL_GOODS' | 'PHYSICAL_GOODS';
    }>;
    description?: string;
    invoice_id?: string;
  }>;
  application_context?: {
    brand_name?: string;
    landing_page?: 'LOGIN' | 'BILLING' | 'NO_PREFERENCE';
    shipping_preference?: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
    user_action?: 'CONTINUE' | 'PAY_NOW';
    return_url: string;
    cancel_url: string;
  };
}

export interface PayPalOrder {
  id: string;
  status: 'CREATED' | 'SAVED' | 'APPROVED' | 'VOIDED' | 'COMPLETED' | 'PAYER_ACTION_REQUIRED';
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
  intent: string;
  purchase_units: any[];
}

export interface PayPalSubscriptionRequest {
  plan_id: string;
  start_time?: string;
  quantity?: string;
  shipping_amount?: {
    currency_code: string;
    value: string;
  };
  subscriber: {
    name?: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    shipping_address?: {
      name: {
        full_name: string;
      };
      address: {
        address_line_1: string;
        address_line_2?: string;
        admin_area_2: string;
        admin_area_1: string;
        postal_code: string;
        country_code: string;
      };
    };
  };
  application_context: {
    brand_name: string;
    locale: string;
    shipping_preference: 'GET_FROM_FILE' | 'NO_SHIPPING' | 'SET_PROVIDED_ADDRESS';
    user_action: 'SUBSCRIBE_NOW' | 'CONTINUE';
    payment_method: {
      payer_selected: 'PAYPAL';
      payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED';
    };
    return_url: string;
    cancel_url: string;
  };
}

export class PayPalService {
  private baseURL: string;
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api.paypal.com' 
      : 'https://api.sandbox.paypal.com';
    this.clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
  }

  // Get access token
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch(`${this.baseURL}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'en_US',
          'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

      return this.accessToken;
    } catch (error) {
      // console.error('Error getting PayPal access token:', error);
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  // Create order
  async createOrder(orderData: PayPalOrderRequest): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseURL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `order-${Date.now()}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('PayPal order creation error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error creating PayPal order:', error);
      throw new Error('Failed to create PayPal order');
    }
  }

  // Capture order
  async captureOrder(orderId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseURL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `capture-${Date.now()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('PayPal order capture error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error capturing PayPal order:', error);
      throw new Error('Failed to capture PayPal order');
    }
  }

  // Get order details
  async getOrder(orderId: string): Promise<PayPalOrder> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseURL}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error getting PayPal order:', error);
      throw new Error('Failed to get PayPal order');
    }
  }

  // Create subscription
  async createSubscription(subscriptionData: PayPalSubscriptionRequest): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `subscription-${Date.now()}`,
        },
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('PayPal subscription creation error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error creating PayPal subscription:', error);
      throw new Error('Failed to create PayPal subscription');
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseURL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          reason: reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('PayPal subscription cancellation error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return { success: true };
    } catch (error) {
      // console.error('Error canceling PayPal subscription:', error);
      throw new Error('Failed to cancel PayPal subscription');
    }
  }

  // Process refund
  async processRefund(captureId: string, amount?: { currency_code: string; value: string }): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const refundData: any = {};
      if (amount) {
        refundData.amount = amount;
      }

      const response = await fetch(`${this.baseURL}/v2/payments/captures/${captureId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'PayPal-Request-Id': `refund-${Date.now()}`,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // console.error('PayPal refund error:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // console.error('Error processing PayPal refund:', error);
      throw new Error('Failed to process PayPal refund');
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(
    payload: string,
    headers: Record<string, string>,
    webhookId: string
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      try {
        // This would typically verify the webhook signature with PayPal
        // For now, we'll return true for mock purposes
        resolve(true);
      } catch (error) {
        // console.error('Error verifying PayPal webhook signature:', error);
        resolve(false);
      }
    });
  }

  // Convert order to PayPal format
  static convertOrderToPayPal(order: Order): PayPalOrderRequest {
    return {
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: order.id,
        amount: {
          currency_code: order.currency,
          value: order.total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: order.currency,
              value: order.subtotal.toFixed(2),
            },
            tax_total: {
              currency_code: order.currency,
              value: order.taxAmount.toFixed(2),
            },
            ...(order.discountAmount > 0 && {
              discount: {
                currency_code: order.currency,
                value: order.discountAmount.toFixed(2),
              },
            }),
          },
        },
        items: order.items.map(item => ({
          name: item.product.name,
          description: item.product.shortDescription,
          unit_amount: {
            currency_code: order.currency,
            value: item.unitPrice.toFixed(2),
          },
          quantity: item.quantity.toString(),
          category: 'DIGITAL_GOODS',
        })),
        description: `Pedido SoftCrown #${order.orderNumber}`,
        invoice_id: order.orderNumber,
      }],
      application_context: {
        brand_name: 'SoftCrown',
        landing_page: 'NO_PREFERENCE',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel`,
      },
    };
  }
}

// Export singleton instance
export const paypalService = new PayPalService();
