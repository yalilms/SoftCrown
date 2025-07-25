'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  // ChevronDownIcon, // Removed - not used
  // CalendarDaysIcon, // Removed - not used
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  // InformationCircleIcon, // Removed - not used
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';
import {
  Send,
  // Eye, // Removed - not used
  Plus,
  Users,
  MessageCircle,
  // Video, // Removed - not used
  // User, // Removed - not used
} from 'lucide-react';
import { withAuth } from '@/contexts/AuthContext';
import { Message } from '@/types/auth';
import Button from '@/components/ui/Button';

// Extended interface for communication messages with additional properties
interface CommunicationMessage extends Message {
  status?: 'sent' | 'delivered' | 'read' | 'replied';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

// Mock communications data
const mockCommunications: CommunicationMessage[] = [
  {
    id: '1',
    conversationId: 'conv-1',
    senderId: 'client-1',
    senderName: 'María González',
    senderRole: 'client' as const,
    recipientId: 'admin-1',
    subject: 'Consulta sobre el progreso del proyecto',
    content: 'Hola, me gustaría saber cómo va el desarrollo del e-commerce. ¿Podrían enviarme un update?',
    timestamp: new Date('2024-01-15T10:30:00'),
    isRead: false,
    type: 'client_inquiry' as const,
    projectId: '1',
    attachments: [],
    readBy: [],
    createdAt: new Date('2024-01-15T10:30:00'),
    updatedAt: new Date('2024-01-15T10:30:00'),
    priority: 'medium' as const,
    status: 'sent' as const,
  },
  {
    id: '2',
    conversationId: 'conv-2',
    senderId: 'admin-1',
    senderName: 'Ana García',
    senderRole: 'admin' as const,
    recipientId: 'client-2',
    subject: 'Entrega de mockups - Corporate Website',
    content: 'Hemos completado los mockups del sitio corporativo. Están disponibles en la galería de archivos para su revisión.',
    timestamp: new Date('2024-02-21T16:45:00'),
    isRead: true,
    type: 'project_update',
    projectId: '2',
    attachments: [],
    priority: 'high',
    status: 'read' as const,
  },
  {
    id: '3',
    senderId: 'client-3',
    senderName: 'Ana Martín',
    senderRole: 'client' as const,
    recipientId: 'admin-1',
    subject: 'Solicitud de cambios en el MVP',
    content: 'Después de revisar los wireframes, nos gustaría hacer algunos ajustes en la navegación de la app móvil.',
    timestamp: new Date('2024-02-20T14:20:00'),
    isRead: true,
    type: 'change_request',
    projectId: '3',
    attachments: [],
    priority: 'high',
    status: 'responded',
  },
  {
    id: '4',
    senderId: 'admin-1',
    senderName: 'Ana García',
    senderRole: 'admin' as const,
    recipientId: 'client-1',
    subject: 'Programación de reunión semanal',
    content: 'Les propongo que tengamos nuestra reunión semanal el viernes a las 10:00 AM para revisar el progreso.',
    timestamp: new Date('2024-02-19T09:15:00'),
    isRead: true,
    type: 'meeting_request',
    projectId: '1',
    attachments: [],
    priority: 'medium',
    status: 'read' as const,
  },
];

function AdminCommunicationsPage() {
  const [communications, setCommunications] = useState<CommunicationMessage[]>(mockCommunications);
  const [filteredCommunications, setFilteredCommunications] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<CommunicationMessage | null>(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setCommunications(mockCommunications);
      setFilteredCommunications(mockCommunications);
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  // Filter communications
  useEffect(() => {
    let filtered = communications;

    if (searchTerm) {
      filtered = filtered.filter(comm =>
        comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comm.senderName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(comm => comm.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(comm => comm.type === typeFilter);
    }

    setFilteredCommunications(filtered);
  }, [communications, searchTerm, statusFilter, typeFilter]);

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
      sent: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      responded: 'text-green-600 bg-green-100 dark:bg-green-900/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: <ClockIcon className="h-4 w-4" />,
      sent: <PaperAirplaneIcon className="h-4 w-4" />,
      responded: <CheckCircleIcon className="h-4 w-4" />,
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

  const getTypeIcon = (type: string) => {
    const icons = {
      client_inquiry: <MessageCircle className="h-5 w-5 text-blue-600" />,
      project_update: <ExclamationTriangleIcon className="h-5 w-5 text-green-600" />,
      change_request: <Plus className="h-5 w-5 text-orange-600" />,
      meeting_request: <Users className="h-5 w-5 text-purple-600" />,
    };
    return icons[type as keyof typeof icons] || <MessageCircle className="h-5 w-5 text-gray-600" />;
  };

  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setReplyContent('');
  };

  const sendReply = () => {
    if (!replyContent.trim() || !selectedMessage) return;

    // Here you would typically send the reply to your API
    // console.log({
    //   originalMessage: selectedMessage.id,
    //   recipient: selectedMessage.senderId,
    // });

    // Update the message status
    setCommunications(prev => 
      prev.map(comm => 
        comm.id === selectedMessage.id 
          ? { ...comm, status: 'responded' }
          : comm
      )
    );

    setSelectedMessage(null);
    setReplyContent('');
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
                Centro de Comunicación
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona todas las comunicaciones con clientes
              </p>
            </div>
            <Button>
              <Plus className="h-5 w-5" /> Nuevo Mensaje
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
                placeholder="Buscar comunicaciones..."
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
              <option value="pending">Pendientes</option>
              <option value="sent">Enviados</option>
              <option value="responded">Respondidos</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">Todos los tipos</option>
              <option value="client_inquiry">Consultas</option>
              <option value="project_update">Updates</option>
              <option value="change_request">Cambios</option>
              <option value="meeting_request">Reuniones</option>
            </select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className="w-full"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </motion.div>

        {/* Communications List */}
        <div className="space-y-4">
          {filteredCommunications.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow ${
                !message.isRead ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {message.subject}
                        </h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mb-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          De: {message.senderName} ({message.senderRole})
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(message.timestamp)}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {message.content}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(message.status || 'pending')}`}>
                          {getStatusIcon(message.status || 'pending')}
                          <span className="ml-1">
                            {message.status === 'pending' ? 'Pendiente' :
                             message.status === 'sent' ? 'Enviado' : 'Respondido'}
                          </span>
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(message.priority || 'medium')}`}>
                          {(message.priority || 'medium').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Proyecto #{message.projectId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Users className="h-5 w-5" /> Ver
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleReply(message)}
                    >
                      <Send className="h-5 w-5" /> Responder
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCommunications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <MessageCircle className="h-6 w-6 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron comunicaciones
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Intenta ajustar los filtros de búsqueda'
                : 'Las comunicaciones aparecerán aquí'
              }
            </p>
          </motion.div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Responder a: {selectedMessage.subject}
              </h3>
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Mensaje original de {selectedMessage.senderName}:
                </p>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {selectedMessage.content}
                </p>
              </div>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Escribe tu respuesta..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex items-center justify-end space-x-3 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedMessage(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={sendReply}
                  disabled={!replyContent.trim()}
                >
                  <Send className="h-5 w-5" /> Enviar Respuesta
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(AdminCommunicationsPage, ['admin']);
