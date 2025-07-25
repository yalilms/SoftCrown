'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  PauseIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { Project } from '@/types/auth';
import Button from '@/components/ui/Button';

// Mock projects data for admin
const mockAdminProjects: Project[] = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Plataforma completa de comercio electrónico con gestión de inventario',
    status: 'in-progress',
    priority: 'high',
    clientId: 'client-1',
    assignedTo: ['dev-1', 'design-1'],
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-04-15'),
    estimatedHours: 200,
    actualHours: 150,
    budget: 12000,
    spent: 9000,
    progress: 75,
    milestones: [],
    files: [],
    tags: ['ecommerce', 'web', 'react'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Corporate Website',
    description: 'Sitio web corporativo con CMS personalizado',
    status: 'in-progress',
    priority: 'medium',
    clientId: 'client-2',
    assignedTo: ['dev-2'],
    startDate: new Date('2024-02-01'),
    endDate: new Date('2024-03-30'),
    estimatedHours: 120,
    actualHours: 72,
    budget: 8500,
    spent: 5100,
    progress: 60,
    milestones: [],
    files: [],
    tags: ['corporate', 'cms', 'web'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Mobile App MVP',
    description: 'Aplicación móvil MVP para startup tecnológica',
    status: 'planning',
    priority: 'high',
    clientId: 'client-3',
    assignedTo: ['dev-3', 'design-2'],
    startDate: new Date('2024-03-01'),
    endDate: new Date('2024-05-01'),
    estimatedHours: 180,
    actualHours: 27,
    budget: 15000,
    spent: 2250,
    progress: 15,
    milestones: [],
    files: [],
    tags: ['mobile', 'mvp', 'react-native'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date(),
  },
  {
    id: '4',
    name: 'Dashboard Analytics',
    description: 'Dashboard de analytics con visualizaciones avanzadas',
    status: 'completed',
    priority: 'medium',
    clientId: 'client-1',
    assignedTo: ['dev-1'],
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-12-15'),
    estimatedHours: 80,
    actualHours: 75,
    budget: 6000,
    spent: 5625,
    progress: 100,
    milestones: [],
    files: [],
    tags: ['dashboard', 'analytics', 'charts'],
    createdAt: new Date('2023-10-20'),
    updatedAt: new Date('2023-12-15'),
  },
];

function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setProjects(mockAdminProjects);
      setFilteredProjects(mockAdminProjects);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Filter projects
  useEffect(() => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      'in-progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      planning: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      paused: 'text-gray-600 bg-gray-100 dark:bg-gray-900/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircleIcon className="h-4 w-4" />,
      'in-progress': <PlayIcon className="h-4 w-4" />,
      planning: <ClockIcon className="h-4 w-4" />,
      paused: <PauseIcon className="h-4 w-4" />,
    };
    return icons[status as keyof typeof icons] || <ClockIcon className="h-4 w-4" />;
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
                Gestión de Proyectos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Administra todos los proyectos y sus timelines
              </p>
            </div>
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Proyecto
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los estados</option>
              <option value="planning">Planificación</option>
              <option value="in-progress">En progreso</option>
              <option value="paused">Pausado</option>
              <option value="completed">Completado</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las prioridades</option>
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
              }}
              className="w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">
                          {project.status === 'in-progress' ? 'En progreso' :
                           project.status === 'completed' ? 'Completado' :
                           project.status === 'planning' ? 'Planificación' : 'Pausado'}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      ID Cliente: {project.clientId}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {project.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
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

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CurrencyEuroIcon className="h-4 w-4 text-green-600 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(project.budget)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Presupuesto
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ClockIcon className="h-4 w-4 text-blue-600 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.actualHours}h
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Trabajadas
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <UserGroupIcon className="h-4 w-4 text-purple-600 mr-1" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.assignedTo.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Miembros
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <span>Inicio: {formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    <span>Entrega: {project.endDate ? formatDate(project.endDate) : 'TBD'}</span>
                  </div>
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
                  <Button variant="outline" size="sm">
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron proyectos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza creando tu primer proyecto'
              }
            </p>
            {(!searchTerm && statusFilter === 'all' && priorityFilter === 'all') && (
              <Button>
                <PlusIcon className="h-4 w-4 mr-2" />
                Crear Proyecto
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AdminProjectsPage;
