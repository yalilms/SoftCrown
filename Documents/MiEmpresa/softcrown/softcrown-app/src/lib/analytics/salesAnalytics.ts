// Sales Analytics Service
import { Order, Product, SalesAnalytics, ConversionFunnel } from '@/types/ecommerce';
import { orderService } from '../orders/orderService';
import { subscriptionService } from '../subscriptions/subscriptionService';

export interface SalesMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number;
  customerLifetimeValue: number;
  repeatCustomerRate: number;
  revenueGrowthRate: number;
  orderGrowthRate: number;
}

export interface RevenueBreakdown {
  oneTimeRevenue: number;
  recurringRevenue: number;
  refundedRevenue: number;
  netRevenue: number;
}

export interface CustomerSegment {
  segment: string;
  customerCount: number;
  revenue: number;
  averageOrderValue: number;
  orderFrequency: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  revenue: number;
  averagePrice: number;
  conversionRate: number;
  profitMargin: number;
}

export interface SalesTimeSeriesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

export interface GeographicData {
  country: string;
  region: string;
  customers: number;
  revenue: number;
  orders: number;
}

export class SalesAnalyticsService {
  private orders: Order[] = [];
  private customers: Map<string, any> = new Map();
  private products: Map<string, Product> = new Map();

  // Initialize with mock data
  constructor() {
    this.initializeMockData();
  }

  // Get comprehensive sales analytics
  async getSalesAnalytics(dateFrom?: Date, dateTo?: Date): Promise<SalesAnalytics> {
    const filteredOrders = this.filterOrdersByDate(dateFrom, dateTo);
    
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Calculate conversion rate (mock data)
    const totalVisitors = 10000; // Would come from analytics service
    const conversionRate = totalOrders > 0 ? (totalOrders / totalVisitors) * 100 : 0;
    
    // Top products
    const productStats = new Map<string, { name: string; revenue: number; orders: number }>();
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.productId) || {
          name: item.product.name,
          revenue: 0,
          orders: 0,
        };
        existing.revenue += item.totalPrice;
        existing.orders += item.quantity;
        productStats.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        revenue: stats.revenue,
        orders: stats.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by month
    const revenueByMonth = this.calculateRevenueByMonth(filteredOrders);
    
    // Customer metrics
    const uniqueCustomers = new Set(filteredOrders.map(order => order.customer.id));
    const repeatCustomers = this.calculateRepeatCustomers(filteredOrders);
    const customerLifetimeValue = this.calculateCustomerLifetimeValue(filteredOrders);
    const repeatCustomerRate = uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      topProducts,
      revenueByMonth,
      customerLifetimeValue,
      repeatCustomerRate,
    };
  }

  // Get detailed sales metrics
  async getSalesMetrics(dateFrom?: Date, dateTo?: Date): Promise<SalesMetrics> {
    const currentPeriodOrders = this.filterOrdersByDate(dateFrom, dateTo);
    const previousPeriodOrders = this.getPreviousPeriodOrders(dateFrom, dateTo);

    const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = currentPeriodOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.total, 0);
    const previousOrders = previousPeriodOrders.length;

    const revenueGrowthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const orderGrowthRate = previousOrders > 0 ? ((totalOrders - previousOrders) / previousOrders) * 100 : 0;

    // Mock conversion rate and customer metrics
    const conversionRate = 2.5; // Would come from analytics service
    const customerLifetimeValue = this.calculateCustomerLifetimeValue(currentPeriodOrders);
    const repeatCustomerRate = this.calculateRepeatCustomerRate(currentPeriodOrders);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      conversionRate,
      customerLifetimeValue,
      repeatCustomerRate,
      revenueGrowthRate,
      orderGrowthRate,
    };
  }

  // Get revenue breakdown
  async getRevenueBreakdown(dateFrom?: Date, dateTo?: Date): Promise<RevenueBreakdown> {
    const orders = this.filterOrdersByDate(dateFrom, dateTo);
    
    const oneTimeRevenue = orders
      .filter(order => !this.isRecurringOrder(order))
      .reduce((sum, order) => sum + order.total, 0);

    const recurringRevenue = orders
      .filter(order => this.isRecurringOrder(order))
      .reduce((sum, order) => sum + order.total, 0);

    const refundedRevenue = orders
      .filter(order => order.paymentStatus === 'refunded' || order.paymentStatus === 'partially_refunded')
      .reduce((sum, order) => sum + order.total, 0);

    const netRevenue = oneTimeRevenue + recurringRevenue - refundedRevenue;

    return {
      oneTimeRevenue,
      recurringRevenue,
      refundedRevenue,
      netRevenue,
    };
  }

  // Get customer segments
  async getCustomerSegments(dateFrom?: Date, dateTo?: Date): Promise<CustomerSegment[]> {
    const orders = this.filterOrdersByDate(dateFrom, dateTo);
    const customerStats = new Map<string, { orders: number; revenue: number }>();

    orders.forEach(order => {
      const existing = customerStats.get(order.customer.id) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += order.total;
      customerStats.set(order.customer.id, existing);
    });

    const segments: CustomerSegment[] = [
      {
        segment: 'High Value (€1000+)',
        customerCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        orderFrequency: 0,
      },
      {
        segment: 'Medium Value (€500-€999)',
        customerCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        orderFrequency: 0,
      },
      {
        segment: 'Low Value (<€500)',
        customerCount: 0,
        revenue: 0,
        averageOrderValue: 0,
        orderFrequency: 0,
      },
    ];

    customerStats.forEach((stats, customerId) => {
      const avgOrderValue = stats.revenue / stats.orders;
      let segment: CustomerSegment;

      if (stats.revenue >= 1000) {
        segment = segments[0];
      } else if (stats.revenue >= 500) {
        segment = segments[1];
      } else {
        segment = segments[2];
      }

      segment.customerCount += 1;
      segment.revenue += stats.revenue;
      segment.orderFrequency += stats.orders;
    });

    // Calculate averages
    segments.forEach(segment => {
      if (segment.customerCount > 0) {
        segment.averageOrderValue = segment.revenue / segment.orderFrequency;
        segment.orderFrequency = segment.orderFrequency / segment.customerCount;
      }
    });

    return segments;
  }

  // Get product performance
  async getProductPerformance(dateFrom?: Date, dateTo?: Date): Promise<ProductPerformance[]> {
    const orders = this.filterOrdersByDate(dateFrom, dateTo);
    const productStats = new Map<string, {
      name: string;
      category: string;
      sales: number;
      revenue: number;
      totalPrice: number;
    }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.productId) || {
          name: item.product.name,
          category: item.product.category,
          sales: 0,
          revenue: 0,
          totalPrice: 0,
        };
        existing.sales += item.quantity;
        existing.revenue += item.totalPrice;
        existing.totalPrice += item.unitPrice * item.quantity;
        productStats.set(item.productId, existing);
      });
    });

    return Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        category: stats.category,
        totalSales: stats.sales,
        revenue: stats.revenue,
        averagePrice: stats.sales > 0 ? stats.totalPrice / stats.sales : 0,
        conversionRate: Math.random() * 5 + 1, // Mock conversion rate
        profitMargin: Math.random() * 30 + 20, // Mock profit margin
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get time series data
  async getTimeSeriesData(dateFrom: Date, dateTo: Date, interval: 'day' | 'week' | 'month' = 'day'): Promise<SalesTimeSeriesData[]> {
    const orders = this.filterOrdersByDate(dateFrom, dateTo);
    const timeSeriesMap = new Map<string, {
      revenue: number;
      orders: number;
      customers: Set<string>;
    }>();

    orders.forEach(order => {
      const date = this.formatDateForInterval(order.createdAt, interval);
      const existing = timeSeriesMap.get(date) || {
        revenue: 0,
        orders: 0,
        customers: new Set<string>(),
      };
      
      existing.revenue += order.total;
      existing.orders += 1;
      existing.customers.add(order.customer.id);
      timeSeriesMap.set(date, existing);
    });

    return Array.from(timeSeriesMap.entries())
      .map(([date, stats]) => ({
        date,
        revenue: stats.revenue,
        orders: stats.orders,
        customers: stats.customers.size,
        averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get geographic data
  async getGeographicData(dateFrom?: Date, dateTo?: Date): Promise<GeographicData[]> {
    const orders = this.filterOrdersByDate(dateFrom, dateTo);
    const geoStats = new Map<string, {
      customers: Set<string>;
      revenue: number;
      orders: number;
    }>();

    orders.forEach(order => {
      const country = order.billingAddress.country;
      const existing = geoStats.get(country) || {
        customers: new Set<string>(),
        revenue: 0,
        orders: 0,
      };
      
      existing.customers.add(order.customer.id);
      existing.revenue += order.total;
      existing.orders += 1;
      geoStats.set(country, existing);
    });

    return Array.from(geoStats.entries())
      .map(([country, stats]) => ({
        country,
        region: this.getRegionFromCountry(country),
        customers: stats.customers.size,
        revenue: stats.revenue,
        orders: stats.orders,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  // Get conversion funnel data
  async getConversionFunnel(funnelName: string, dateFrom?: Date, dateTo?: Date): Promise<ConversionFunnel[]> {
    // Mock funnel data - in real app, this would come from analytics service
    const funnels: Record<string, ConversionFunnel[]> = {
      'ecommerce_purchase': [
        { step: 'Product View', visitors: 10000, conversions: 3000, conversionRate: 30, dropoffRate: 70 },
        { step: 'Add to Cart', visitors: 3000, conversions: 1500, conversionRate: 50, dropoffRate: 50 },
        { step: 'Checkout Started', visitors: 1500, conversions: 1200, conversionRate: 80, dropoffRate: 20 },
        { step: 'Payment Info', visitors: 1200, conversions: 1000, conversionRate: 83.33, dropoffRate: 16.67 },
        { step: 'Purchase Complete', visitors: 1000, conversions: 900, conversionRate: 90, dropoffRate: 10 },
      ],
      'subscription_signup': [
        { step: 'Landing Page', visitors: 5000, conversions: 2000, conversionRate: 40, dropoffRate: 60 },
        { step: 'Pricing Page', visitors: 2000, conversions: 800, conversionRate: 40, dropoffRate: 60 },
        { step: 'Plan Selected', visitors: 800, conversions: 600, conversionRate: 75, dropoffRate: 25 },
        { step: 'Account Created', visitors: 600, conversions: 500, conversionRate: 83.33, dropoffRate: 16.67 },
        { step: 'Payment Complete', visitors: 500, conversions: 450, conversionRate: 90, dropoffRate: 10 },
      ],
    };

    return funnels[funnelName] || [];
  }

  // Export sales data
  async exportSalesData(format: 'csv' | 'json' | 'xlsx', dateFrom?: Date, dateTo?: Date): Promise<{ success: boolean; downloadUrl?: string; error?: string }> {
    try {
      const orders = this.filterOrdersByDate(dateFrom, dateTo);
      const analytics = await this.getSalesAnalytics(dateFrom, dateTo);
      
      // In a real app, this would generate and store the file
      const exportData = {
        summary: analytics,
        orders: orders.map(order => ({
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          customerEmail: order.customer.email,
          total: order.total,
          status: order.status,
          paymentStatus: order.paymentStatus,
          createdAt: order.createdAt,
          items: order.items.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        })),
      };

      const downloadUrl = `/api/exports/sales-${Date.now()}.${format}`;
      
      return {
        success: true,
        downloadUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  // Private helper methods
  private initializeMockData(): void {
    // Initialize with some mock orders for demonstration
    const mockOrders: Order[] = [
      // Mock orders would be added here
    ];
    
    this.orders = mockOrders;
  }

  private filterOrdersByDate(dateFrom?: Date, dateTo?: Date): Order[] {
    let filtered = [...this.orders];
    
    if (dateFrom) {
      filtered = filtered.filter(order => order.createdAt >= dateFrom);
    }
    
    if (dateTo) {
      filtered = filtered.filter(order => order.createdAt <= dateTo);
    }
    
    return filtered;
  }

  private getPreviousPeriodOrders(dateFrom?: Date, dateTo?: Date): Order[] {
    if (!dateFrom || !dateTo) return [];
    
    const periodLength = dateTo.getTime() - dateFrom.getTime();
    const previousDateTo = new Date(dateFrom.getTime() - 1);
    const previousDateFrom = new Date(previousDateTo.getTime() - periodLength);
    
    return this.filterOrdersByDate(previousDateFrom, previousDateTo);
  }

  private calculateRevenueByMonth(orders: Order[]): Array<{ month: string; revenue: number; orders: number }> {
    const monthlyData = new Map<string, { revenue: number; orders: number }>();
    
    orders.forEach(order => {
      const month = order.createdAt.toISOString().slice(0, 7); // YYYY-MM
      const existing = monthlyData.get(month) || { revenue: 0, orders: 0 };
      existing.revenue += order.total;
      existing.orders += 1;
      monthlyData.set(month, existing);
    });
    
    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateRepeatCustomers(orders: Order[]): number {
    const customerOrderCounts = new Map<string, number>();
    
    orders.forEach(order => {
      const count = customerOrderCounts.get(order.customer.id) || 0;
      customerOrderCounts.set(order.customer.id, count + 1);
    });
    
    return Array.from(customerOrderCounts.values()).filter(count => count > 1).length;
  }

  private calculateCustomerLifetimeValue(orders: Order[]): number {
    const customerRevenue = new Map<string, number>();
    
    orders.forEach(order => {
      const revenue = customerRevenue.get(order.customer.id) || 0;
      customerRevenue.set(order.customer.id, revenue + order.total);
    });
    
    const revenues = Array.from(customerRevenue.values());
    return revenues.length > 0 ? revenues.reduce((sum, revenue) => sum + revenue, 0) / revenues.length : 0;
  }

  private calculateRepeatCustomerRate(orders: Order[]): number {
    const uniqueCustomers = new Set(orders.map(order => order.customer.id)).size;
    const repeatCustomers = this.calculateRepeatCustomers(orders);
    
    return uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;
  }

  private isRecurringOrder(order: Order): boolean {
    return order.items.some(item => item.product.isRecurring);
  }

  private formatDateForInterval(date: Date, interval: 'day' | 'week' | 'month'): string {
    switch (interval) {
      case 'day':
        return date.toISOString().slice(0, 10); // YYYY-MM-DD
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        return weekStart.toISOString().slice(0, 10);
      case 'month':
        return date.toISOString().slice(0, 7); // YYYY-MM
      default:
        return date.toISOString().slice(0, 10);
    }
  }

  private getRegionFromCountry(country: string): string {
    const regions: Record<string, string> = {
      'España': 'Europa',
      'Portugal': 'Europa',
      'Francia': 'Europa',
      'Italia': 'Europa',
      'Alemania': 'Europa',
      'Reino Unido': 'Europa',
      'Estados Unidos': 'América del Norte',
      'Canadá': 'América del Norte',
      'México': 'América Latina',
      'Brasil': 'América Latina',
      'Argentina': 'América Latina',
    };
    
    return regions[country] || 'Otros';
  }
}

// Export singleton instance
export const salesAnalyticsService = new SalesAnalyticsService();

// Utility functions for analytics
export const formatCurrency = (amount: number, currency = 'EUR'): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const getGrowthRateColor = (rate: number): string => {
  if (rate > 0) return 'text-green-600';
  if (rate < 0) return 'text-red-600';
  return 'text-gray-600';
};

export const getGrowthRateIcon = (rate: number): string => {
  if (rate > 0) return '📈';
  if (rate < 0) return '📉';
  return '➡️';
};
