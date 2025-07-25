'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ShareIcon,
  LockClosedIcon,
  KeyIcon,
  ServerIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { Document } from '@/types/auth';
import { Download as DownloadIcon } from 'lucide-react';
import Button from '@/components/ui/Button';

// Mock data service
const getDocumentsData = async (userId: string) => {
  await new Promise(resolve => setTimeout(resolve, 600));

  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Contrato de Desarrollo Web',
      type: 'contract',
      category: 'legal',
      description: 'Contrato principal para el desarrollo del sitio web corporativo',
      url: '/documents/contrato-desarrollo-web.pdf',
      size: 1456789,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['contrato', 'legal', 'desarrollo'],
      version: '1.0',
      status: 'active',
      expiresAt: new Date('2025-01-10'),
    },
    {
      id: '2',
      name: 'Manual de Usuario - CMS',
      type: 'manual',
      category: 'documentation',
      description: 'Guía completa para el uso del sistema de gestión de contenidos',
      url: '/documents/manual-cms.pdf',
      size: 3456789,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-20'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['manual', 'cms', 'usuario'],
      version: '2.1',
      status: 'active',
    },
    {
      id: '3',
      name: 'Credenciales de Acceso',
      type: 'credentials',
      category: 'security',
      description: 'Credenciales de acceso al panel de administración y servicios',
      url: '/documents/credenciales.pdf',
      size: 234567,
      createdAt: new Date('2024-02-28'),
      updatedAt: new Date('2024-02-28'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['credenciales', 'acceso', 'admin'],
      version: '1.0',
      status: 'active',
    },
    {
      id: '4',
      name: 'Backup Database - Marzo 2024',
      type: 'backup',
      category: 'technical',
      description: 'Copia de seguridad completa de la base de datos del sitio web',
      url: '/backups/db-backup-marzo-2024.sql',
      size: 15678901,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-01'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['backup', 'database', 'seguridad'],
      version: '1.0',
      status: 'active',
    },
    {
      id: '5',
      name: 'Especificaciones Técnicas',
      type: 'specification',
      category: 'technical',
      description: 'Documentación técnica detallada del proyecto y arquitectura',
      url: '/documents/especificaciones-tecnicas.pdf',
      size: 2789012,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-02-10'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['especificaciones', 'técnico', 'arquitectura'],
      version: '1.2',
      status: 'active',
    },
    {
      id: '6',
      name: 'Certificado SSL',
      type: 'certificate',
      category: 'security',
      description: 'Certificado de seguridad SSL para el dominio principal',
      url: '/certificates/ssl-certificate.pem',
      size: 45678,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      isPublic: false,
      requiresAuth: true,
      projectId: '1',
      tags: ['ssl', 'certificado', 'seguridad'],
      version: '1.0',
      status: 'active',
      expiresAt: new Date('2025-01-15'),
    },
  ];

  return mockDocuments;
};

function DocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    const loadDocuments = async () => {
      if (!user) return;
      
      try {
        const data = await getDocumentsData(user.id);
        setDocuments(data);
        setFilteredDocuments(data);
      } catch (error) {
        // console.error('Error loading documents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, [user]);

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(doc => doc.type === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, categoryFilter, typeFilter]);

  const getDocumentIcon = (type: string) => {
    const icons = {
      contract: <DocumentTextIcon className="h-6 w-6 text-blue-600" />,
      manual: <DocumentDuplicateIcon className="h-6 w-6 text-green-600" />,
      credentials: <KeyIcon className="h-6 w-6 text-red-600" />,
      backup: <ServerIcon className="h-6 w-6 text-purple-600" />,
      specification: <DocumentTextIcon className="h-6 w-6 text-orange-600" />,
      certificate: <ShieldCheckIcon className="h-6 w-6 text-yellow-600" />,
    };
    return icons[type as keyof typeof icons] || <DocumentTextIcon className="h-6 w-6 text-gray-600" />;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      legal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      documentation: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      security: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      technical: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const getStatusIcon = (doc: Document) => {
    if (doc.expiresAt && new Date(doc.expiresAt) < new Date()) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />;
    }
    if (doc.status === 'active') {
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    }
    return <ClockIcon className="h-4 w-4 text-yellow-500" />;
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const isExpiringSoon = (doc: Document) => {
    if (!doc.expiresAt) return false;
    const daysUntilExpiry = Math.ceil((new Date(doc.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (doc: Document) => {
    if (!doc.expiresAt) return false;
    return new Date(doc.expiresAt) < new Date();
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
                Documentos
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Accede a contratos, manuales, credenciales y backups
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                <LockClosedIcon className="h-4 w-4" />
                <span>Documentos seguros</span>
              </div>
            </div>
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
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas las categorías</option>
                <option value="legal">Legal</option>
                <option value="documentation">Documentación</option>
                <option value="security">Seguridad</option>
                <option value="technical">Técnico</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="contract">Contratos</option>
                <option value="manual">Manuales</option>
                <option value="credentials">Credenciales</option>
                <option value="backup">Backups</option>
                <option value="specification">Especificaciones</option>
                <option value="certificate">Certificados</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div>
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
                Limpiar filtros
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                isExpired(document) ? 'border-red-300 dark:border-red-700' :
                isExpiringSoon(document) ? 'border-yellow-300 dark:border-yellow-700' : ''
              }`}
            >
              {/* Document Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getDocumentIcon(document.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {document.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        v{document.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(document)}
                    {document.requiresAuth && (
                      <LockClosedIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {document.description}
                </p>

                {/* Category and Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(document.category)}`}>
                    {document.category}
                  </span>
                  {document.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Document Info */}
                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex justify-between">
                    <span>Tamaño:</span>
                    <span>{formatFileSize(document.size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Creado:</span>
                    <span>{formatDate(document.createdAt)}</span>
                  </div>
                  {document.updatedAt && document.updatedAt !== document.createdAt && (
                    <div className="flex justify-between">
                      <span>Actualizado:</span>
                      <span>{formatDate(document.updatedAt)}</span>
                    </div>
                  )}
                  {document.expiresAt && (
                    <div className="flex justify-between">
                      <span>Expira:</span>
                      <span className={isExpired(document) ? 'text-red-500' : isExpiringSoon(document) ? 'text-yellow-500' : ''}>
                        {formatDate(document.expiresAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Warning Messages */}
                {isExpired(document) && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700 dark:text-red-300">
                        Este documento ha expirado
                      </span>
                    </div>
                  </div>
                )}

                {isExpiringSoon(document) && !isExpired(document) && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-300">
                        Expira pronto
                      </span>
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
                      <DownloadIcon className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <ShareIcon className="h-4 w-4 mr-1" />
                    Compartir
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <FolderIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron documentos
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Los documentos aparecerán aquí cuando estén disponibles'
              }
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default withAuth(DocumentsPage);
