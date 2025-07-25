'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UsersIcon,
  FolderIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { TrendingUp as ArrowTrendingUpIcon } from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';

// Mock data for admin dashboard
const mockAdminData = {
  stats: {
    totalClients: 24,
    activeProjects: 8,
    completedProjects: 16,
    totalRevenue: 125000,
    monthlyRevenue: 15000,
    pendingTasks: 12,
    overdueProjects: 2,
  },
  recentClients: [
    {
      id: '1',
      name: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      phone: '+34 600 123 456',
      company: 'TechCorp Solutions',
      joinDate: new Date('2024-01-15'),
      status: 'active',
      projectsCount: 2,
      totalSpent: 15000,
    },
    {
      id: '2',
      name: 'Innovate Digital',
      email: 'info@innovate.com',
      phone: '+34 600 789 012',
      company: 'Innovate Digital',
      joinDate: new Date('2024-02-01'),
      status: 'active',
      projectsCount: 1,
      totalSpent: 8500,
    },
    {
      id: '3',
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      phone: '+34 600 345 678',
      company: 'StartupXYZ',
      joinDate: new Date('2024-02-15'),
      status: 'pending',
      projectsCount: 1,
      totalSpent: 5000,
    },
  ],
  recentProjects: [
    {
      id: '1',
      name: 'E-commerce Platform',
      clientName: 'TechCorp Solutions',
      status: 'in-progress',
      progress: 75,
      budget: 12000,
      spent: 9000,
      dueDate: new Date('2024-04-15'),
      priority: 'high',
    },
    {
      id: '2',
      name: 'Corporate Website',
      clientName: 'Innovate Digital',
      status: 'in-progress',
      progress: 60,
      budget: 8500,
      spent: 5100,
      dueDate: new Date('2024-03-30'),
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Mobile App MVP',
      clientName: 'StartupXYZ',
      status: 'planning',
      progress: 15,
      budget: 15000,
      spent: 2250,
      dueDate: new Date('2024-05-01'),
      priority: 'high',
    },
  ],
};

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      inactive: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
      'in-progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      planning: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 dark:bg-red-900/10',
      medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10',
      low: 'text-green-600 bg-green-50 dark:bg-green-900/10',
    };
    return colors[priority as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Panel de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona clientes, proyectos y comunicaciones
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
              <Button variant="outline">
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockAdminData.stats.totalClients}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Proyectos Activos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockAdminData.stats.activeProjects}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FolderIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">nuevos este mes</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos Mensuales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(mockAdminData.stats.monthlyRevenue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">vs mes anterior</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tareas Pendientes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {mockAdminData.stats.pendingTasks}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600">{mockAdminData.stats.overdueProjects}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">proyectos atrasados</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Clientes Recientes
                </h3>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAdminData.recentClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <UsersIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {client.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {client.company}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                        {client.status === 'active' ? 'Activo' : 'Pendiente'}
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {client.projectsCount} proyecto{client.projectsCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Proyectos Activos
                </h3>
                <Button variant="outline" size="sm">
                  Ver todos
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {mockAdminData.recentProjects.map((project) => (
                  <div key={project.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.clientName}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                          {project.priority.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status === 'in-progress' ? 'En progreso' : 
                           project.status === 'planning' ? 'Planificación' : project.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progreso</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 dark:text-gray-400">
                          {formatCurrency(project.spent)} / {formatCurrency(project.budget)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          Entrega: {formatDate(project.dueDate)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <EyeIcon className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <PencilIcon className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <ChatBubbleLeftRightIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <UsersIcon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Gestionar Clientes</span>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <FolderIcon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Gestionar Proyectos</span>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Subir Archivos</span>
              </div>
            </Button>
            <Button variant="outline" className="flex items-center justify-center p-4 h-auto">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm">Centro Comunicación</span>
              </div>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default withAuth(AdminDashboard, 'admin');
