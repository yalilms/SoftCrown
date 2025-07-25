// Order Management Service
import { Order, OrderItem, OrderStatus, PaymentStatus, OrderMilestone } from '@/types/ecommerce';
import { paymentService } from '../payments/paymentService';

export interface CreateOrderRequest {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    customizations?: Record<string, any>;
  }>;
  billingAddress: any;
  shippingAddress?: any;
  paymentMethodId: string;
  discountCode?: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  notes?: string;
  notifyCustomer?: boolean;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<OrderStatus, number>;
  ordersByPaymentStatus: Record<PaymentStatus, number>;
  recentOrders: Order[];
  topProducts: Array<{
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}

export class OrderService {
  private orders: Map<string, Order> = new Map();
  private orderCounter = 1000;

  // Create new order
  async createOrder(request: CreateOrderRequest): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      const orderId = this.generateOrderId();
      const orderNumber = this.generateOrderNumber();

      // Calculate totals
      const subtotal = request.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const discountAmount = request.discountCode ? this.calculateDiscount(subtotal, request.discountCode) : 0;
      const taxAmount = (subtotal - discountAmount) * 0.21; // 21% VAT
      const total = subtotal - discountAmount + taxAmount;

      // Create order items
      const orderItems: OrderItem[] = request.items.map(item => ({
        id: this.generateOrderItemId(),
        productId: item.productId,
        product: this.getProductById(item.productId), // Mock product lookup
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
        customizations: item.customizations,
        status: 'pending',
      }));

      // Create order
      const order: Order = {
        id: orderId,
        orderNumber,
        customer: {
          id: request.customerId,
          name: `${request.billingAddress.firstName} ${request.billingAddress.lastName}`,
          email: request.billingAddress.email || 'customer@example.com',
          phone: request.billingAddress.phone,
        },
        items: orderItems,
        subtotal,
        discountAmount,
        discountCode: request.discountCode,
        taxAmount,
        total,
        currency: 'EUR',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: {
          id: request.paymentMethodId,
          type: 'card',
          provider: 'stripe',
          isDefault: false,
          isActive: true,
        },
        billingAddress: request.billingAddress,
        shippingAddress: request.shippingAddress,
        notes: request.notes,
        estimatedDelivery: this.calculateEstimatedDelivery(orderItems),
        createdAt: new Date(),
        updatedAt: new Date(),
        milestones: this.generateOrderMilestones(orderId, orderItems),
      };

      // Store order
      this.orders.set(orderId, order);

      // Track analytics
      this.trackOrderCreated(order);

      return { success: true, order };
    } catch (error) {
      // console.error('Error creating order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  // Get orders with filters
  async getOrders(filters: OrderFilters = {}, page = 1, limit = 20): Promise<{
    orders: Order[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    let filteredOrders = Array.from(this.orders.values());

    // Apply filters
    if (filters.status) {
      filteredOrders = filteredOrders.filter(order => order.status === filters.status);
    }

    if (filters.paymentStatus) {
      filteredOrders = filteredOrders.filter(order => order.paymentStatus === filters.paymentStatus);
    }

    if (filters.customerId) {
      filteredOrders = filteredOrders.filter(order => order.customer.id === filters.customerId);
    }

    if (filters.dateFrom) {
      filteredOrders = filteredOrders.filter(order => order.createdAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      filteredOrders = filteredOrders.filter(order => order.createdAt <= filters.dateTo!);
    }

    if (filters.minAmount) {
      filteredOrders = filteredOrders.filter(order => order.total >= filters.minAmount!);
    }

    if (filters.maxAmount) {
      filteredOrders = filteredOrders.filter(order => order.total <= filters.maxAmount!);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter(order =>
        order.orderNumber.toLowerCase().includes(searchLower) ||
        order.customer.name.toLowerCase().includes(searchLower) ||
        order.customer.email.toLowerCase().includes(searchLower) ||
        order.items.some(item => item.product.name.toLowerCase().includes(searchLower))
      );
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = filteredOrders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return {
      orders: paginatedOrders,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  // Update order status
  async updateOrderStatus(request: UpdateOrderStatusRequest): Promise<{ success: boolean; error?: string }> {
    try {
      const order = this.orders.get(request.orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Update order
      order.status = request.status;
      order.updatedAt = new Date();

      // Add status-specific logic
      switch (request.status) {
        case 'confirmed':
          order.estimatedDelivery = this.calculateEstimatedDelivery(order.items);
          break;
        case 'in_progress':
          // Assign to team, create project, etc.
          break;
        case 'completed':
          order.deliveredAt = new Date();
          break;
        case 'cancelled':
          // Handle cancellation logic
          break;
      }

      // Update milestones
      this.updateOrderMilestones(order, request.status);

      // Store updated order
      this.orders.set(request.orderId, order);

      // Send notification if requested
      if (request.notifyCustomer) {
        await this.sendStatusUpdateNotification(order, request.status, request.notes);
      }

      // Track analytics
      this.trackOrderStatusUpdate(order, request.status);

      return { success: true };
    } catch (error) {
      // console.error('Error updating order status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update order status',
      };
    }
  }

  // Process payment for order
  async processOrderPayment(orderId: string, paymentMethodId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Process payment
      const paymentResult = await paymentService.processPayment({
        orderId: order.id,
        amount: order.total,
        currency: order.currency,
        paymentMethod: 'stripe', // Determine from paymentMethodId
        customerInfo: {
          name: order.customer.name,
          email: order.customer.email,
          address: {
            line1: order.billingAddress.street,
            city: order.billingAddress.city,
            state: order.billingAddress.state,
            postal_code: order.billingAddress.postalCode,
            country: order.billingAddress.country,
          },
        },
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      });

      if (paymentResult.success) {
        // Update order payment status
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.updatedAt = new Date();
        this.orders.set(orderId, order);

        // Send confirmation email
        await paymentService.sendPaymentConfirmation(orderId, order.customer.email);

        return { success: true };
      } else {
        order.paymentStatus = 'failed';
        order.updatedAt = new Date();
        this.orders.set(orderId, order);

        return { success: false, error: paymentResult.error };
      }
    } catch (error) {
      // console.error('Error processing order payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // Process refund for order
  async processOrderRefund(orderId: string, amount?: number, reason?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      if (order.paymentStatus !== 'paid') {
        return { success: false, error: 'Order payment not completed' };
      }

      // Process refund
      const refundResult = await paymentService.processRefund({
        paymentId: order.id, // In real app, this would be the payment transaction ID
        amount,
        reason: reason || 'Customer requested refund',
      });

      if (refundResult.success) {
        // Update order status
        order.paymentStatus = amount && amount < order.total ? 'partially_refunded' : 'refunded';
        order.status = 'cancelled';
        order.updatedAt = new Date();
        this.orders.set(orderId, order);

        return { success: true };
      } else {
        return { success: false, error: refundResult.error };
      }
    } catch (error) {
      // console.error('Error processing order refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund processing failed',
      };
    }
  }

  // Get order statistics
  async getOrderStats(dateFrom?: Date, dateTo?: Date): Promise<OrderStats> {
    let orders = Array.from(this.orders.values());

    // Filter by date range if provided
    if (dateFrom) {
      orders = orders.filter(order => order.createdAt >= dateFrom);
    }
    if (dateTo) {
      orders = orders.filter(order => order.createdAt <= dateTo);
    }

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);

    // Orders by payment status
    const ordersByPaymentStatus = orders.reduce((acc, order) => {
      acc[order.paymentStatus] = (acc[order.paymentStatus] || 0) + 1;
      return acc;
    }, {} as Record<PaymentStatus, number>);

    // Recent orders (last 10)
    const recentOrders = orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);

    // Top products
    const productStats = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productStats.get(item.productId) || {
          name: item.product.name,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.totalPrice;
        productStats.set(item.productId, existing);
      });
    });

    const topProducts = Array.from(productStats.entries())
      .map(([productId, stats]) => ({
        productId,
        productName: stats.name,
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      ordersByPaymentStatus,
      recentOrders,
      topProducts,
    };
  }

  // Assign order to team member
  async assignOrder(orderId: string, assigneeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      order.assignedTo = order.assignedTo || [];
      if (!order.assignedTo.includes(assigneeId)) {
        order.assignedTo.push(assigneeId);
      }

      order.updatedAt = new Date();
      this.orders.set(orderId, order);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign order',
      };
    }
  }

  // Update order milestone
  async updateOrderMilestone(orderId: string, milestoneId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<{ success: boolean; error?: string }> {
    try {
      const order = this.orders.get(orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      const milestone = order.milestones?.find(m => m.id === milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      milestone.status = status;
      if (status === 'completed') {
        milestone.completedAt = new Date();
      }

      order.updatedAt = new Date();
      this.orders.set(orderId, order);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update milestone',
      };
    }
  }

  // Private helper methods
  private generateOrderId(): string {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOrderNumber(): string {
    return `ORD-${(this.orderCounter++).toString().padStart(6, '0')}`;
  }

  private generateOrderItemId(): string {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateDiscount(subtotal: number, discountCode: string): number {
    const discountRates: Record<string, number> = {
      'WELCOME10': 0.10,
      'SAVE20': 0.20,
      'FIRST50': 0.50,
    };
    return subtotal * (discountRates[discountCode] || 0);
  }

  private calculateEstimatedDelivery(items: OrderItem[]): Date {
    // Find the longest delivery time among all items
    const maxDeliveryDays = Math.max(...items.map(item => {
      const deliveryTime = item.product.deliveryTime;
      const match = deliveryTime.match(/(\d+)/);
      return match ? parseInt(match[1]) : 7;
    }));

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + maxDeliveryDays);
    return deliveryDate;
  }

  private generateOrderMilestones(orderId: string, items: OrderItem[]): OrderMilestone[] {
    const milestones: OrderMilestone[] = [
      {
        id: `milestone_${Date.now()}_1`,
        orderId,
        title: 'Pedido Confirmado',
        description: 'El pedido ha sido confirmado y el pago procesado',
        dueDate: new Date(),
        status: 'completed',
        completedAt: new Date(),
        deliverables: ['Confirmación de pedido', 'Factura'],
      },
      {
        id: `milestone_${Date.now()}_2`,
        orderId,
        title: 'Desarrollo Iniciado',
        description: 'El equipo ha comenzado a trabajar en tu proyecto',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        status: 'pending',
        deliverables: ['Plan de proyecto', 'Asignación de equipo'],
      },
      {
        id: `milestone_${Date.now()}_3`,
        orderId,
        title: 'Primera Revisión',
        description: 'Primera versión lista para revisión del cliente',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
        deliverables: ['Prototipo inicial', 'Documentación'],
      },
      {
        id: `milestone_${Date.now()}_4`,
        orderId,
        title: 'Entrega Final',
        description: 'Proyecto completado y entregado al cliente',
        dueDate: this.calculateEstimatedDelivery(items),
        status: 'pending',
        deliverables: ['Proyecto finalizado', 'Manual de usuario', 'Archivos fuente'],
      },
    ];

    return milestones;
  }

  private updateOrderMilestones(order: Order, status: OrderStatus): void {
    if (!order.milestones) return;

    switch (status) {
      case 'confirmed':
        const confirmMilestone = order.milestones.find(m => m.title === 'Pedido Confirmado');
        if (confirmMilestone) {
          confirmMilestone.status = 'completed';
          confirmMilestone.completedAt = new Date();
        }
        break;
      case 'in_progress':
        const startMilestone = order.milestones.find(m => m.title === 'Desarrollo Iniciado');
        if (startMilestone) {
          startMilestone.status = 'completed';
          startMilestone.completedAt = new Date();
        }
        break;
      case 'completed':
        order.milestones.forEach(milestone => {
          if (milestone.status !== 'completed') {
            milestone.status = 'completed';
            milestone.completedAt = new Date();
          }
        });
        break;
    }
  }

  private async sendStatusUpdateNotification(order: Order, status: OrderStatus, notes?: string): Promise<void> {
    // This would typically send an email or push notification
    // console.log(`Sending status update notification for order ${order.orderNumber} to ${order.customer.email}`);
    // console.log(`New status: ${status}`);
    // if (notes) {
    //   console.log(`Notes: ${notes}`);
    // }
  }

  private trackOrderCreated(order: Order): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: order.orderNumber,
        value: order.total,
        currency: order.currency,
        items: order.items.map(item => ({
          item_id: item.product.id,
          item_name: item.product.name,
          category: item.product.category,
          quantity: item.quantity,
          price: item.product.price,
        })),
      });
    }
  }

  private trackOrderStatusUpdate(order: Order, status: OrderStatus): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'order_status_update', {
        order_id: order.orderNumber,
        status: status,
        value: order.total,
        currency: order.currency,
      });
    }
  }

  private getProductById(productId: string): any {
    // Mock product lookup - in real app, this would fetch from database
    return {
      id: productId,
      name: 'Mock Product',
      category: 'Services',
      price: 100,
      deliveryTime: '7-10 días',
    };
  }
}

// Export singleton instance
export const orderService = new OrderService();
