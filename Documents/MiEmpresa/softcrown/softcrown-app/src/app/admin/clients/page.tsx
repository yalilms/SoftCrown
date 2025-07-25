'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  CurrencyEuroIcon,
  UsersIcon,
  // UserGroupIcon // Removed - not used
} from '@heroicons/react/24/outline';
import { Users } from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import { User } from '@/types/auth';
import Button from '@/components/ui/Button';

// Extended interface for client display
interface ClientUser extends User {
  address?: string;
  status: 'active' | 'inactive' | 'pending';
  projectsCount: number;
  totalSpent: number;
  lastLoginAt?: Date;
}

// Mock clients data
const mockClients: ClientUser[] = [
  {
    id: '1',
    email: 'contact@techcorp.com',
    name: 'María González',
    role: 'client',
    phone: '+34 600 123 456',
    company: 'TechCorp Solutions',
    address: 'Calle Mayor 123, Madrid',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    emailVerified: true,
    isActive: true,
    lastLogin: new Date('2024-02-22'),
    lastLoginAt: new Date('2024-02-22'),
    projects: [],
    projectsCount: 2,
    totalSpent: 15000,
    status: 'active',
  },
  {
    id: '2',
    email: 'info@innovate.com',
    name: 'Carlos Rodríguez',
    role: 'client',
    phone: '+34 600 789 012',
    company: 'Innovate Digital',
    address: 'Avenida Libertad 45, Barcelona',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-15'),
    emailVerified: true,
    isActive: true,
    lastLogin: new Date('2024-02-21'),
    lastLoginAt: new Date('2024-02-21'),
    projects: [],
    projectsCount: 1,
    totalSpent: 8500,
    status: 'active',
  },
  {
    id: '3',
    email: 'hello@startupxyz.com',
    name: 'Ana Martín',
    role: 'client',
    phone: '+34 600 345 678',
    company: 'StartupXYZ',
    address: 'Plaza España 67, Valencia',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15'),
    emailVerified: false,
    isActive: false,
    lastLogin: new Date('2024-02-16'),
    lastLoginAt: new Date('2024-02-16'),
    projects: [],
    projectsCount: 1,
    totalSpent: 5000,
    status: 'pending',
  },
];

function ClientsManagementPage() {
  // const { user } = useAuth(); // Commented out as unused
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setClients(mockClients);
      setFilteredClients(mockClients);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Filter clients based on search and filters
  useEffect(() => {
    let filtered = clients;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(client => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      inactive: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
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
                Gestión de Clientes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra todos los clientes y sus proyectos
              </p>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="pending">Pendientes</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="w-full"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Limpiar filtros
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client, index) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Client Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {client.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {client.company}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status || 'inactive')}`}>
                    {client.status === 'active' ? 'Activo' : 
                     client.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Client Details */}
              <div className="p-6">
                {/* Contact Info */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      <span className="truncate">{client.address}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {client.projectsCount || 0}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Proyectos
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <CurrencyEuroIcon className="h-4 w-4 text-green-600 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(client.totalSpent || 0)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Total gastado
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Cliente desde:</span>
                    <span>{formatDate(client.createdAt)}</span>
                  </div>
                  {client.lastLoginAt && (
                    <div className="flex justify-between">
                      <span>Último acceso:</span>
                      <span>{formatDate(client.lastLoginAt)}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                      Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <UsersIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron clientes
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza agregando tu primer cliente'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Agregar Cliente
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default withAuth(ClientsManagementPage, 'admin');
