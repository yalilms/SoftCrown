'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon,
  BellIcon,
  CurrencyEuroIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { User, Project, Notification, Invoice, Message } from '@/types/auth';
import Button from '@/components/ui/Button';

// Mock data service
const getDashboardData = async (user: User) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Sitio Web Corporativo',
      description: 'Desarrollo de sitio web responsive con CMS',
      status: 'in-progress',
      priority: 'high',
      clientId: user.id,
      assignedTo: ['admin-1'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      estimatedHours: 120,
      actualHours: 85,
      budget: 8500,
      spent: 5200,
      progress: 70,
      milestones: [],
      files: [],
      tags: ['web', 'cms', 'responsive'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'App Móvil E-commerce',
      description: 'Aplicación móvil para tienda online',
      status: 'planning',
      priority: 'medium',
      clientId: user.id,
      assignedTo: ['admin-1', 'dev-1'],
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-01'),
      estimatedHours: 200,
      actualHours: 0,
      budget: 15000,
      spent: 0,
      progress: 10,
      milestones: [],
      files: [],
      tags: ['mobile', 'ecommerce', 'react-native'],
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
    },
  ];

  const mockNotifications: Notification[] = [
    {
      id: '1',
      userId: user.id,
      type: 'info',
      title: 'Proyecto actualizado',
      message: 'El proyecto "Sitio Web Corporativo" ha alcanzado el 70% de progreso',
      read: false,
      actionUrl: '/projects/1',
      actionLabel: 'Ver proyecto',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      id: '2',
      userId: user.id,
      type: 'success',
      title: 'Pago recibido',
      message: 'Se ha procesado el pago de €2,500 para la factura #INV-001',
      read: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
    {
      id: '3',
      userId: user.id,
      type: 'warning',
      title: 'Reunión programada',
      message: 'Reunión de seguimiento mañana a las 10:00 AM',
      read: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ];

  const mockInvoices: Invoice[] = [
    {
      id: '1',
      clientId: user.id,
      projectId: '1',
      invoiceNumber: 'INV-001',
      status: 'paid',
      amount: 2500,
      tax: 525,
      total: 3025,
      currency: 'EUR',
      dueDate: new Date('2024-02-15'),
      paidDate: new Date('2024-02-10'),
      items: [
        {
          id: '1',
          description: 'Desarrollo frontend - Fase 1',
          quantity: 50,
          rate: 50,
          amount: 2500,
        },
      ],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-10'),
    },
    {
      id: '2',
      clientId: user.id,
      projectId: '1',
      invoiceNumber: 'INV-002',
      status: 'sent',
      amount: 3000,
      tax: 630,
      total: 3630,
      currency: 'EUR',
      dueDate: new Date('2024-03-15'),
      items: [
        {
          id: '1',
          description: 'Desarrollo backend - Fase 2',
          quantity: 60,
          rate: 50,
          amount: 3000,
        },
      ],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15'),
    },
  ];

  const mockMessages: Message[] = [
    {
      id: '1',
      conversationId: 'conv-1',
      senderId: 'admin-1',
      senderName: 'Admin SoftCrown',
      senderRole: 'admin',
      content: 'Hola! ¿Cómo va el feedback del diseño inicial?',
      type: 'text',
      readBy: [user.id],
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: '2',
      conversationId: 'conv-1',
      senderId: user.id,
      senderName: user.name,
      senderRole: 'client',
      content: 'Me gusta mucho la propuesta. Solo tengo algunas sugerencias menores.',
      type: 'text',
      readBy: ['admin-1'],
      createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      updatedAt: new Date(Date.now() - 15 * 60 * 1000),
    },
  ];

  return {
    activeProjects: mockProjects.filter(p => p.status === 'in-progress'),
    recentProjects: mockProjects,
    notifications: mockNotifications,
    unreadNotifications: mockNotifications.filter(n => !n.read).length,
    invoices: mockInvoices,
    pendingInvoices: mockInvoices.filter(i => i.status === 'sent'),
    messages: mockMessages,
    unreadMessages: 0,
    stats: {
      totalProjects: mockProjects.length,
      completedProjects: 0,
      activeProjects: mockProjects.filter(p => p.status === 'in-progress').length,
      totalSpent: mockProjects.reduce((sum, p) => sum + p.spent, 0),
      pendingPayments: mockInvoices.filter(i => i.status === 'sent').reduce((sum, i) => sum + i.total, 0),
    },
  };
};

function DashboardPage() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        const data = await getDashboardData(user);
        setDashboardData(data);
      } catch {
        // console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error al cargar el dashboard
          </h2>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'planning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'paused': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'in-progress': return 'En progreso';
      case 'planning': return 'Planificación';
      case 'paused': return 'Pausado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'warning': return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'error': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default: return <BellIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    } else if (diffInMinutes < 1440) {
      return `hace ${Math.floor(diffInMinutes / 60)} h`;
    } else {
      return `hace ${Math.floor(diffInMinutes / 1440)} días`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                ¡Hola, {user?.name}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Aquí tienes un resumen de tus proyectos y actividad reciente
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <CalendarDaysIcon className="h-4 w-4 mr-2" />
                Programar reunión
              </Button>
              <Button size="sm">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo proyecto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FolderIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Proyectos Activos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.activeProjects}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completados
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {dashboardData.stats.completedProjects}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <CurrencyEuroIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Invertido
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dashboardData.stats.totalSpent)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pagos Pendientes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(dashboardData.stats.pendingPayments)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Proyectos Activos
                  </h2>
                  <Button variant="outline" size="sm">
                    Ver todos
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.activeProjects.map((project: Project) => (
                    <div
                      key={project.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {project.name}
                            </h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                              {getStatusText(project.status)}
                            </span>
                            <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                              {project.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>Progreso: {project.progress}%</span>
                            <span>Presupuesto: {formatCurrency(project.budget)}</span>
                            <span>Vence: {formatDate(project.endDate!)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span>Progreso</span>
                          <span>{project.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Recent Messages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mensajes Recientes
                  </h2>
                  <Button variant="outline" size="sm">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Ver chat
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.messages.map((message: Message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-white">
                            {message.senderName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.senderName}
                          </p>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.senderRole === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                          }`}>
                            {message.senderRole === 'admin' ? 'Equipo' : 'Tú'}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getTimeAgo(message.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notificaciones
                  </h2>
                  {dashboardData.unreadNotifications > 0 && (
                    <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
                      {dashboardData.unreadNotifications} nuevas
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboardData.notifications.slice(0, 5).map((notification: Notification) => (
                    <div
                      key={notification.id}
                      className={`flex space-x-3 p-3 rounded-lg transition-colors ${
                        !notification.read 
                          ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {getTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Pending Invoices */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Facturas Pendientes
                  </h2>
                  <Button variant="outline" size="sm">
                    Ver todas
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {dashboardData.pendingInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.pendingInvoices.map((invoice: Invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Vence: {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(invoice.total)}
                          </p>
                          <Button size="sm" className="mt-1">
                            Pagar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ¡Todas las facturas están al día!
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage);
