'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { Project } from '@/types/auth';
import Button from '@/components/ui/Button';

// Mock data service
const getProjectsData = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, 800));

  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Sitio Web Corporativo',
      description: 'Desarrollo de sitio web responsive con CMS personalizado para mejorar la presencia online de la empresa',
      status: 'in-progress',
      priority: 'high',
      clientId: userId,
      assignedTo: ['admin-1', 'dev-1'],
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-03-15'),
      estimatedHours: 120,
      actualHours: 85,
      budget: 8500,
      spent: 5200,
      progress: 70,
      milestones: [
        {
          id: '1',
          projectId: '1',
          title: 'Diseño UI/UX',
          description: 'Diseño completo de la interfaz de usuario',
          dueDate: new Date('2024-02-01'),
          status: 'completed',
          progress: 100,
          assignedTo: ['design-1'],
          deliverables: ['Mockups', 'Prototipo interactivo'],
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: '2',
          projectId: '1',
          title: 'Desarrollo Frontend',
          description: 'Implementación del frontend responsive',
          dueDate: new Date('2024-02-28'),
          status: 'in-progress',
          progress: 80,
          assignedTo: ['dev-1'],
          deliverables: ['Componentes React', 'Páginas principales'],
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date(),
        },
        {
          id: '3',
          projectId: '1',
          title: 'CMS Backend',
          description: 'Sistema de gestión de contenidos',
          dueDate: new Date('2024-03-10'),
          status: 'pending',
          progress: 30,
          assignedTo: ['dev-2'],
          deliverables: ['API REST', 'Panel de administración'],
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date(),
        },
      ],
      files: [],
      tags: ['web', 'cms', 'responsive', 'react'],
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'App Móvil E-commerce',
      description: 'Aplicación móvil nativa para iOS y Android con funcionalidades de tienda online completa',
      status: 'planning',
      priority: 'medium',
      clientId: userId,
      assignedTo: ['admin-1', 'dev-3', 'design-2'],
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-01'),
      estimatedHours: 200,
      actualHours: 15,
      budget: 15000,
      spent: 750,
      progress: 15,
      milestones: [
        {
          id: '4',
          projectId: '2',
          title: 'Análisis de Requisitos',
          description: 'Definición detallada de funcionalidades',
          dueDate: new Date('2024-03-15'),
          status: 'in-progress',
          progress: 60,
          assignedTo: ['admin-1'],
          deliverables: ['Documento de requisitos', 'User stories'],
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date(),
        },
      ],
      files: [],
      tags: ['mobile', 'ecommerce', 'react-native', 'ios', 'android'],
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Sistema de Gestión Interna',
      description: 'Plataforma web para gestión de recursos humanos y procesos internos de la empresa',
      status: 'completed',
      priority: 'low',
      clientId: userId,
      assignedTo: ['dev-2'],
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-12-15'),
      estimatedHours: 80,
      actualHours: 75,
      budget: 6000,
      spent: 5625,
      progress: 100,
      milestones: [],
      files: [],
      tags: ['web', 'internal', 'hr', 'management'],
      createdAt: new Date('2023-09-15'),
      updatedAt: new Date('2023-12-15'),
    },
    {
      id: '4',
      name: 'Rediseño de Identidad Corporativa',
      description: 'Renovación completa de la imagen corporativa incluyendo logo, colores y materiales gráficos',
      status: 'paused',
      priority: 'medium',
      clientId: userId,
      assignedTo: ['design-1'],
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-01'),
      estimatedHours: 60,
      actualHours: 25,
      budget: 4500,
      spent: 1875,
      progress: 40,
      milestones: [],
      files: [],
      tags: ['design', 'branding', 'logo', 'identity'],
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date(),
    },
  ];

  return mockProjects;
};

function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;
      
      try {
        const data = await getProjectsData(user.id);
        setProjects(data);
        setFilteredProjects(data);
      } catch {
        // console.error('Error loading projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, [user]);

  // Filter projects based on search and filters
  useEffect(() => {
    let filtered = projects;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(project => project.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(project => project.priority === priorityFilter);
    }

    setFilteredProjects(filtered);
  }, [projects, searchTerm, statusFilter, priorityFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'in-progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
      case 'planning': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'paused': return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4" />;
      case 'in-progress': return <PlayIcon className="h-4 w-4" />;
      case 'planning': return <ClockIcon className="h-4 w-4" />;
      case 'paused': return <PauseIcon className="h-4 w-4" />;
      case 'cancelled': return <ExclamationTriangleIcon className="h-4 w-4" />;
      default: return <FolderIcon className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50 dark:bg-red-900/10';
      case 'high': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/10';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/10';
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/10';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/10';
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
                Mis Proyectos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona y supervisa todos tus proyectos
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
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
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
                <option value="planning">Planificación</option>
                <option value="in-progress">En progreso</option>
                <option value="paused">Pausado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas las prioridades</option>
                <option value="urgent">Urgente</option>
                <option value="high">Alta</option>
                <option value="medium">Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
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
                Limpiar filtros
              </Button>
            </div>
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
              {/* Project Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1">{getStatusText(project.status)}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {project.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(project.priority)}`}>
                      {project.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6">
                {/* Progress */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span>Progreso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(project.progress)}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Presupuesto</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gastado</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(project.spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Inicio</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(project.startDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Entrega</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {project.endDate ? formatDate(project.endDate) : 'Por definir'}
                    </p>
                  </div>
                </div>

                {/* Milestones */}
                {project.milestones.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Hitos recientes
                    </h4>
                    <div className="space-y-2">
                      {project.milestones.slice(0, 2).map((milestone) => (
                        <div key={milestone.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            {milestone.title}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            milestone.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                              : milestone.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                          }`}>
                            {milestone.progress}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm">
                      <DocumentTextIcon className="h-4 w-4 mr-1" />
                      Archivos
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <CalendarDaysIcon className="h-4 w-4 mr-1" />
                    Reunión
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

export default withAuth(ProjectsPage);
