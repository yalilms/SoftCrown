'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  PhotoIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  // ArchiveBoxIcon, // Removed - not used
  // ChevronDownIcon, // Removed - not used
  // CalendarDaysIcon, // Removed - not used
  // ClockIcon, // Removed - not used
  // CheckCircleIcon, // Removed - not used
  // ExclamationTriangleIcon, // Removed - not used
  // InformationCircleIcon, // Removed - not used
} from '@heroicons/react/24/outline';
import { 
  Upload,
  Eye,
  Share2,
  Trash2,
  Download as DownloadIcon 
} from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import { ProjectFile } from '@/types/auth';
import Button from '@/components/ui/Button';

// Mock files data for admin
const mockAdminFiles: ProjectFile[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Homepage_Design_Final.psd',
    originalName: 'Homepage_Design_Final.psd',
    url: '/files/homepage-design-final.psd',
    type: 'image/psd',
    size: 15678901,
    uploadedBy: 'design-1',
    uploadedAt: new Date('2024-02-15'),
    category: 'design',
    isPublic: false,
    version: 1,
    description: 'Diseño final de la página principal - E-commerce Platform',
  },
  {
    id: '2',
    projectId: '2',
    name: 'Corporate_Logo_Variants.ai',
    originalName: 'Corporate_Logo_Variants.ai',
    url: '/files/corporate-logo-variants.ai',
    type: 'application/illustrator',
    size: 3456789,
    uploadedBy: 'design-2',
    uploadedAt: new Date('2024-02-10'),
    category: 'design',
    isPublic: false,
    version: 1,
    description: 'Variantes del logo corporativo - Corporate Website',
  },
  {
    id: '3',
    projectId: '1',
    name: 'Database_Schema.sql',
    originalName: 'Database_Schema.sql',
    url: '/files/database-schema.sql',
    type: 'application/sql',
    size: 234567,
    uploadedBy: 'dev-1',
    uploadedAt: new Date('2024-02-20'),
    category: 'code',
    isPublic: false,
    version: 1,
    description: 'Esquema de base de datos para e-commerce',
  },
  {
    id: '4',
    projectId: '3',
    name: 'Mobile_Wireframes.fig',
    originalName: 'Mobile_Wireframes.fig',
    url: '/files/mobile-wireframes.fig',
    type: 'application/figma',
    size: 5678901,
    uploadedBy: 'design-1',
    uploadedAt: new Date('2024-02-25'),
    category: 'design',
    isPublic: false,
    version: 1,
    description: 'Wireframes para aplicación móvil MVP',
  },
  {
    id: '5',
    projectId: '2',
    name: 'Content_Strategy.docx',
    originalName: 'Content_Strategy.docx',
    url: '/files/content-strategy.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1234567,
    uploadedBy: 'content-1',
    uploadedAt: new Date('2024-02-12'),
    category: 'document',
    isPublic: false,
    version: 1,
    description: 'Estrategia de contenidos para sitio corporativo',
  },
  {
    id: '6',
    projectId: '1',
    name: 'API_Documentation.pdf',
    originalName: 'API_Documentation.pdf',
    url: '/files/api-documentation.pdf',
    type: 'application/pdf',
    size: 2345678,
    uploadedBy: 'dev-2',
    uploadedAt: new Date('2024-02-18'),
    category: 'document',
    isPublic: false,
    version: 1,
    description: 'Documentación completa de la API REST',
  },
];

function AdminFilesPage() {
  // const { user } = useAuth(); // Removed - not used
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setFiles(mockAdminFiles);
      setFilteredFiles(mockAdminFiles);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Filter files
  useEffect(() => {
    let filtered = files;

    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (file.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(file => file.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => file.type.startsWith(typeFilter));
    }

    setFilteredFiles(filtered);
  }, [files, searchTerm, categoryFilter, typeFilter]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <PhotoIcon className="h-6 w-6 text-blue-600" />;
    if (type.includes('pdf')) return <DocumentTextIcon className="h-6 w-6 text-red-600" />;
    if (type.includes('word') || type.includes('document')) return <DocumentTextIcon className="h-6 w-6 text-blue-600" />;
    if (type.includes('sql')) return <DocumentTextIcon className="h-6 w-6 text-green-600" />;
    return <DocumentTextIcon className="h-6 w-6 text-gray-600" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      design: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      development: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      content: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      documentation: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

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
                Sistema de Archivos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona todos los archivos de proyectos
              </p>
            </div>
            <Button>
              <Upload className="h-5 w-5" />
              Subir Archivo
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
                placeholder="Buscar archivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todas las categorías</option>
              <option value="design">Diseño</option>
              <option value="development">Desarrollo</option>
              <option value="content">Contenido</option>
              <option value="documentation">Documentación</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="image">Imágenes</option>
              <option value="application">Documentos</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}
              className="w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </motion.div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {file.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Proyecto ID:</span>
                    <span className="font-medium">{file.projectId}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Versión:</span>
                    <span className="font-medium">v{file.version}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(file.category)}`}>
                    {file.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Por: {file.uploadedBy}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron archivos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Comienza subiendo tu primer archivo'
              }
            </p>
            {(!searchTerm && categoryFilter === 'all' && typeFilter === 'all') && (
              <Button>
                <Upload className="h-5 w-5" />
                Subir Archivo
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default withAuth(AdminFilesPage, 'admin');
