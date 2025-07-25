// Subscription Management Service
import { Subscription, MaintenancePlan } from '@/types/ecommerce';
import { paymentService } from '../payments/paymentService';

export interface CreateSubscriptionRequest {
  customerId: string;
  planId: string;
  paymentMethodId: string;
  billingCycle: 'monthly' | 'yearly';
  startDate?: Date;
  trialDays?: number;
  couponCode?: string;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  autoRenew?: boolean;
}

export interface SubscriptionFilters {
  status?: Subscription['status'];
  customerId?: string;
  planId?: string;
  billingCycle?: 'monthly' | 'yearly';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  churnRate: number;
  averageRevenuePerUser: number;
  subscriptionsByStatus: Record<Subscription['status'], number>;
  subscriptionsByPlan: Array<{
    planId: string;
    planName: string;
    count: number;
    revenue: number;
  }>;
  recentSubscriptions: Subscription[];
}

export class SubscriptionService {
  private subscriptions: Map<string, Subscription> = new Map();
  private plans: Map<string, MaintenancePlan> = new Map();

  constructor() {
    this.initializePlans();
  }

  // Initialize maintenance plans
  private initializePlans(): void {
    const plans: MaintenancePlan[] = [
      {
        id: 'basic-maintenance',
        name: 'Mantenimiento Básico',
        description: 'Mantenimiento esencial para mantener tu sitio web seguro y actualizado.',
        features: [
          'Actualizaciones de seguridad',
          'Backup semanal',
          'Monitoreo básico',
          'Soporte por email',
          '2 horas de cambios menores',
          'Reporte mensual'
        ],
        price: 49,
        billingCycle: 'monthly',
        supportLevel: 'basic',
        responseTime: '48 horas',
        monthlyHours: 2,
        backupFrequency: 'Semanal',
        securityUpdates: true,
        performanceOptimization: false,
        isPopular: true,
        isActive: true,
      },
      {
        id: 'standard-maintenance',
        name: 'Mantenimiento Estándar',
        description: 'Mantenimiento completo con optimización de rendimiento y soporte prioritario.',
        features: [
          'Todo del plan Básico',
          'Backup diario',
          'Optimización de rendimiento',
          'Monitoreo avanzado',
          'Soporte prioritario',
          '5 horas de cambios',
          'Reporte detallado',
          'Análisis de tráfico'
        ],
        price: 99,
        billingCycle: 'monthly',
        supportLevel: 'standard',
        responseTime: '24 horas',
        monthlyHours: 5,
        backupFrequency: 'Diario',
        securityUpdates: true,
        performanceOptimization: true,
        isPopular: false,
        isActive: true,
      },
      {
        id: 'premium-maintenance',
        name: 'Mantenimiento Premium',
        description: 'Servicio completo de mantenimiento con soporte 24/7 y gestión proactiva.',
        features: [
          'Todo del plan Estándar',
          'Soporte 24/7',
          'Gestión proactiva',
          'Optimización continua',
          '10 horas de desarrollo',
          'Consultoría estratégica',
          'Reportes ejecutivos',
          'Acceso directo al equipo'
        ],
        price: 199,
        billingCycle: 'monthly',
        supportLevel: 'premium',
        responseTime: '2 horas',
        monthlyHours: 10,
        backupFrequency: 'Diario + Tiempo real',
        securityUpdates: true,
        performanceOptimization: true,
        isPopular: false,
        isActive: true,
      },
    ];

    plans.forEach(plan => this.plans.set(plan.id, plan));
  }

  // Create new subscription
  async createSubscription(request: CreateSubscriptionRequest): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    try {
      const plan = this.plans.get(request.planId);
      if (!plan) {
        return { success: false, error: 'Plan not found' };
      }

      const subscriptionId = this.generateSubscriptionId();
      const startDate = request.startDate || new Date();
      const trialEndDate = request.trialDays ? new Date(startDate.getTime() + request.trialDays * 24 * 60 * 60 * 1000) : undefined;

      // Calculate price based on billing cycle
      let price = plan.price;
      if (request.billingCycle === 'yearly') {
        price = plan.price * 12 * 0.9; // 10% discount for yearly
      }

      // Apply coupon if provided
      if (request.couponCode) {
        price = this.applyCoupon(price, request.couponCode);
      }

      const subscription: Subscription = {
        id: subscriptionId,
        customerId: request.customerId,
        productId: request.planId,
        product: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          shortDescription: plan.description,
          price: plan.price,
          type: 'service',
          category: 'Mantenimiento',
          deliveryTime: 'Inmediato',
          features: plan.features,
          isRecurring: true,
          recurringPeriod: request.billingCycle,
          images: [],
          tags: ['mantenimiento', 'soporte'],
          requirements: [],
          deliverables: plan.features,
          revisions: 0,
          supportIncluded: true,
          complexity: 'standard',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        planName: plan.name,
        status: trialEndDate ? 'active' : 'active',
        billingCycle: request.billingCycle,
        price,
        currency: 'EUR',
        startDate,
        nextBillingDate: this.calculateNextBillingDate(startDate, request.billingCycle, trialEndDate),
        autoRenew: true,
        paymentMethodId: request.paymentMethodId,
        trialEndDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Process initial payment (unless in trial)
      if (!trialEndDate) {
        const paymentResult = await paymentService.createRecurringPayment({
          customerId: request.customerId,
          planId: request.planId,
          paymentMethodId: request.paymentMethodId,
        });

        if (!paymentResult.success) {
          return { success: false, error: paymentResult.error };
        }
      }

      // Store subscription
      this.subscriptions.set(subscriptionId, subscription);

      // Track analytics
      this.trackSubscriptionCreated(subscription);

      return { success: true, subscription };
    } catch (error) {
      // console.error('Error creating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
      };
    }
  }

  // Get subscription by ID
  async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    return this.subscriptions.get(subscriptionId) || null;
  }

  // Get subscriptions with filters
  async getSubscriptions(filters: SubscriptionFilters = {}, page = 1, limit = 20): Promise<{
    subscriptions: Subscription[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    let filteredSubscriptions = Array.from(this.subscriptions.values());

    // Apply filters
    if (filters.status) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === filters.status);
    }

    if (filters.customerId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.customerId === filters.customerId);
    }

    if (filters.planId) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.productId === filters.planId);
    }

    if (filters.billingCycle) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.billingCycle === filters.billingCycle);
    }

    if (filters.dateFrom) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.createdAt <= filters.dateTo!);
    }

    // Sort by creation date (newest first)
    filteredSubscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = filteredSubscriptions.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

    return {
      subscriptions: paginatedSubscriptions,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  // Update subscription
  async updateSubscription(request: UpdateSubscriptionRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(request.subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      // Update fields
      if (request.planId && request.planId !== subscription.productId) {
        const newPlan = this.plans.get(request.planId);
        if (!newPlan) {
          return { success: false, error: 'New plan not found' };
        }

        subscription.productId = request.planId;
        subscription.planName = newPlan.name;
        subscription.price = request.billingCycle === 'yearly' ? newPlan.price * 12 * 0.9 : newPlan.price;
      }

      if (request.billingCycle && request.billingCycle !== subscription.billingCycle) {
        subscription.billingCycle = request.billingCycle;
        const plan = this.plans.get(subscription.productId);
        if (plan) {
          subscription.price = request.billingCycle === 'yearly' ? plan.price * 12 * 0.9 : plan.price;
        }
        subscription.nextBillingDate = this.calculateNextBillingDate(new Date(), request.billingCycle);
      }

      if (request.autoRenew !== undefined) {
        subscription.autoRenew = request.autoRenew;
      }

      subscription.updatedAt = new Date();
      this.subscriptions.set(request.subscriptionId, subscription);

      return { success: true };
    } catch (error) {
      // console.error('Error updating subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update subscription',
      };
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string, reason?: string, cancelAtPeriodEnd = true): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      if (cancelAtPeriodEnd) {
        // Cancel at the end of current billing period
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.endDate = subscription.nextBillingDate;
        subscription.autoRenew = false;
      } else {
        // Cancel immediately
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        subscription.endDate = new Date();
      }

      subscription.updatedAt = new Date();
      this.subscriptions.set(subscriptionId, subscription);

      // Cancel recurring payment
      await paymentService.cancelRecurringPayment(subscriptionId);

      // Track analytics
      this.trackSubscriptionCancelled(subscription, reason);

      return { success: true };
    } catch (error) {
      // console.error('Error cancelling subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel subscription',
      };
    }
  }

  // Pause subscription
  async pauseSubscription(subscriptionId: string, resumeDate?: Date): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      subscription.status = 'paused';
      subscription.pausedAt = new Date();
      subscription.updatedAt = new Date();

      if (resumeDate) {
        subscription.nextBillingDate = resumeDate;
      }

      this.subscriptions.set(subscriptionId, subscription);

      return { success: true };
    } catch (error) {
      // console.error('Error pausing subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pause subscription',
      };
    }
  }

  // Resume subscription
  async resumeSubscription(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      subscription.status = 'active';
      subscription.pausedAt = undefined;
      subscription.nextBillingDate = this.calculateNextBillingDate(new Date(), subscription.billingCycle);
      subscription.updatedAt = new Date();

      this.subscriptions.set(subscriptionId, subscription);

      return { success: true };
    } catch (error) {
      // console.error('Error resuming subscription:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to resume subscription',
      };
    }
  }

  // Process subscription billing
  async processSubscriptionBilling(subscriptionId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) {
        return { success: false, error: 'Subscription not found' };
      }

      if (subscription.status !== 'active') {
        return { success: false, error: 'Subscription not active' };
      }

      // Process payment
      const paymentResult = await paymentService.processPayment({
        orderId: `sub_${subscription.id}_${Date.now()}`,
        amount: subscription.price,
        currency: subscription.currency,
        paymentMethod: 'stripe', // Determine from subscription
        customerInfo: {
          name: 'Customer Name', // Would fetch from customer service
          email: 'customer@example.com',
          address: {
            line1: 'Address',
            city: 'City',
            state: 'State',
            postal_code: '12345',
            country: 'ES',
          },
        },
        metadata: {
          subscriptionId: subscription.id,
          billingCycle: subscription.billingCycle,
        },
      });

      if (paymentResult.success) {
        // Update next billing date
        subscription.nextBillingDate = this.calculateNextBillingDate(
          subscription.nextBillingDate,
          subscription.billingCycle
        );
        subscription.updatedAt = new Date();
        this.subscriptions.set(subscriptionId, subscription);

        return { success: true };
      } else {
        // Handle failed payment
        subscription.status = 'expired';
        subscription.updatedAt = new Date();
        this.subscriptions.set(subscriptionId, subscription);

        return { success: false, error: paymentResult.error };
      }
    } catch (error) {
      // console.error('Error processing subscription billing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Billing processing failed',
      };
    }
  }

  // Get subscription statistics
  async getSubscriptionStats(dateFrom?: Date, dateTo?: Date): Promise<SubscriptionStats> {
    let subscriptions = Array.from(this.subscriptions.values());

    // Filter by date range if provided
    if (dateFrom) {
      subscriptions = subscriptions.filter(sub => sub.createdAt >= dateFrom);
    }
    if (dateTo) {
      subscriptions = subscriptions.filter(sub => sub.createdAt <= dateTo);
    }

    const totalSubscriptions = subscriptions.length;
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;

    // Calculate MRR and ARR
    const monthlyRevenue = subscriptions
      .filter(sub => sub.status === 'active')
      .reduce((sum, sub) => {
        const monthlyAmount = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
        return sum + monthlyAmount;
      }, 0);

    const monthlyRecurringRevenue = monthlyRevenue;
    const annualRecurringRevenue = monthlyRevenue * 12;

    // Calculate churn rate (simplified)
    const cancelledThisMonth = subscriptions.filter(sub => 
      sub.status === 'cancelled' && 
      sub.cancelledAt && 
      sub.cancelledAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;
    const churnRate = totalSubscriptions > 0 ? (cancelledThisMonth / totalSubscriptions) * 100 : 0;

    // Average revenue per user
    const averageRevenuePerUser = activeSubscriptions > 0 ? monthlyRecurringRevenue / activeSubscriptions : 0;

    // Subscriptions by status
    const subscriptionsByStatus = subscriptions.reduce((acc, sub) => {
      acc[sub.status] = (acc[sub.status] || 0) + 1;
      return acc;
    }, {} as Record<Subscription['status'], number>);

    // Subscriptions by plan
    const planStats = new Map<string, { name: string; count: number; revenue: number }>();
    subscriptions.forEach(sub => {
      const existing = planStats.get(sub.productId) || {
        name: sub.planName,
        count: 0,
        revenue: 0,
      };
      existing.count += 1;
      if (sub.status === 'active') {
        const monthlyAmount = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
        existing.revenue += monthlyAmount;
      }
      planStats.set(sub.productId, existing);
    });

    const subscriptionsByPlan = Array.from(planStats.entries())
      .map(([planId, stats]) => ({
        planId,
        planName: stats.name,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Recent subscriptions
    const recentSubscriptions = subscriptions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    return {
      totalSubscriptions,
      activeSubscriptions,
      monthlyRecurringRevenue,
      annualRecurringRevenue,
      churnRate,
      averageRevenuePerUser,
      subscriptionsByStatus,
      subscriptionsByPlan,
      recentSubscriptions,
    };
  }

  // Get available plans
  getPlans(): MaintenancePlan[] {
    return Array.from(this.plans.values()).filter(plan => plan.isActive);
  }

  // Get plan by ID
  getPlan(planId: string): MaintenancePlan | null {
    return this.plans.get(planId) || null;
  }

  // Private helper methods
  private generateSubscriptionId(): string {
    return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateNextBillingDate(startDate: Date, billingCycle: 'monthly' | 'yearly', trialEndDate?: Date): Date {
    const baseDate = trialEndDate || startDate;
    const nextBilling = new Date(baseDate);

    if (billingCycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    return nextBilling;
  }

  private applyCoupon(price: number, couponCode: string): number {
    const coupons: Record<string, number> = {
      'FIRST10': 0.10,
      'SAVE20': 0.20,
      'WELCOME50': 0.50,
    };

    const discount = coupons[couponCode] || 0;
    return price * (1 - discount);
  }

  private trackSubscriptionCreated(subscription: Subscription): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'subscription_created', {
        subscription_id: subscription.id,
        plan_id: subscription.productId,
        plan_name: subscription.planName,
        billing_cycle: subscription.billingCycle,
        value: subscription.price,
        currency: subscription.currency,
      });
    }
  }

  private trackSubscriptionCancelled(subscription: Subscription, reason?: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'subscription_cancelled', {
        subscription_id: subscription.id,
        plan_id: subscription.productId,
        plan_name: subscription.planName,
        reason: reason || 'Not specified',
        value: subscription.price,
        currency: subscription.currency,
      });
    }
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
