'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  PlayIcon,
  EyeIcon,
  ArrowDownTrayIcon as DownloadIcon,
  PaperAirplaneIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useAuth, withAuth } from '@/contexts/AuthContext';
import { Project, Message } from '@/types/auth';
import Button from '@/components/ui/Button';

// Optimized mock data
const mockProject: Project = {
  id: '1',
  name: 'Sitio Web Corporativo',
  description: 'Desarrollo de sitio web responsive con CMS personalizado',
  status: 'in-progress',
  priority: 'high',
  clientId: 'client-1',
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
      description: 'Diseño completo de interfaz y experiencia de usuario',
      dueDate: new Date('2024-02-01'),
      status: 'completed',
      progress: 100,
      assignedTo: ['design-1'],
      deliverables: ['Mockups', 'Prototipo', 'Guía de estilos'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-02-01'),
    },
    {
      id: '2',
      projectId: '1',
      title: 'Desarrollo Frontend',
      description: 'Implementación responsive con React y Next.js',
      dueDate: new Date('2024-02-28'),
      status: 'in-progress',
      progress: 85,
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
      status: 'in-progress',
      progress: 45,
      assignedTo: ['dev-1'],
      deliverables: ['API REST', 'Panel admin'],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date(),
    },
  ],
  files: [
    {
      id: '1',
      projectId: '1',
      name: 'Wireframes_V2.pdf',
      originalName: 'Wireframes_V2.pdf',
      url: '/files/wireframes-v2.pdf',
      type: 'application/pdf',
      size: 2456789,
      uploadedBy: 'design-1',
      uploadedAt: new Date('2024-01-28'),
      category: 'design',
      isPublic: false,
      version: 2,
      description: 'Wireframes actualizados',
    },
    {
      id: '2',
      projectId: '1',
      name: 'Mockup_Homepage.png',
      originalName: 'Mockup_Homepage.png',
      url: '/files/mockup-homepage.png',
      type: 'image/png',
      size: 1234567,
      uploadedBy: 'design-1',
      uploadedAt: new Date('2024-02-05'),
      category: 'design',
      isPublic: false,
      version: 1,
      description: 'Diseño final homepage',
    },
  ],
  tags: ['web', 'cms', 'responsive'],
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date(),
};

const mockMessages: Message[] = [
  {
    id: '1',
    conversationId: 'conv-1',
    senderId: 'admin-1',
    senderName: 'Ana García',
    senderRole: 'admin',
    recipientId: 'client-1',
    subject: 'Actualización del proyecto',
    content: 'Hemos completado el diseño UI/UX. Puedes revisar los mockups en archivos.',
    timestamp: new Date('2024-02-10T10:30:00'),
    isRead: true,
    type: 'project_update',
    projectId: '1',
    attachments: [],
    readBy: ['client-1'],
    createdAt: new Date('2024-02-10T10:30:00'),
    updatedAt: new Date('2024-02-10T10:30:00'),
  },
  {
    id: '2',
    conversationId: 'conv-1',
    senderId: 'client-1',
    senderName: 'Cliente',
    senderRole: 'client',
    recipientId: 'admin-1',
    subject: 'Feedback',
    content: 'Me encanta el diseño! Solo una sugerencia sobre el color del header.',
    timestamp: new Date('2024-02-11T14:20:00'),
    isRead: true,
    type: 'client_feedback',
    projectId: '1',
    attachments: [],
    readBy: ['admin-1'],
    createdAt: new Date('2024-02-11T14:20:00'),
    updatedAt: new Date('2024-02-11T14:20:00'),
  },
];

function ProjectDetailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [project] = useState<Project>(mockProject);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMessage, setNewMessage] = useState('');

  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'text-green-600 bg-green-100 dark:bg-green-900/20',
      'in-progress': 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
      pending: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      completed: <CheckCircleIcon className="h-4 w-4" />,
      'in-progress': <PlayIcon className="h-4 w-4" />,
      pending: <ClockIcon className="h-4 w-4" />,
    };
    return icons[status as keyof typeof icons] || <ClockIcon className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  const formatDate = (date: Date) => 
    new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const message: Message = {
      id: Date.now().toString(),
      conversationId: 'conv-1',
      senderId: user?.id || 'client-1',
      senderName: user?.name || 'Cliente',
      senderRole: 'client',
      recipientId: 'admin-1',
      subject: 'Mensaje del cliente',
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      type: 'client_message',
      projectId: '1',
      attachments: [],
      readBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {project.description}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline">
                <PencilIcon className="h-4 w-4 mr-2" />
                Solicitar Cambio
              </Button>
              <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                <span className="ml-2">En progreso</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Resumen', icon: EyeIcon },
              { id: 'milestones', name: 'Hitos', icon: CheckCircleIcon },
              { id: 'files', name: 'Archivos', icon: DocumentTextIcon },
              { id: 'chat', name: 'Chat', icon: ChatBubbleLeftRightIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Progress & Budget */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Progreso del Proyecto
                  </h3>
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Completado</span>
                      <span>{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Estimadas</p>
                      <p className="font-medium text-gray-900 dark:text-white">{project.estimatedHours}h</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Trabajadas</p>
                      <p className="font-medium text-gray-900 dark:text-white">{project.actualHours}h</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Presupuesto
                  </h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(project.budget)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Gastado</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(project.spent)}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(project.spent / project.budget) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Cronograma
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Inicio</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(project.startDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CalendarDaysIcon className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Entrega</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {project.endDate ? formatDate(project.endDate) : 'Por definir'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Equipo
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Ana García</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Project Manager</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <UserGroupIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Carlos Rodríguez</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Developer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'milestones' && (
            <div className="space-y-6">
              {project.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                          <span className="ml-1">
                            {milestone.status === 'completed' ? 'Completado' :
                             milestone.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                          </span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(milestone.dueDate)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {milestone.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>Progreso</span>
                      <span>{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          milestone.status === 'completed' ? 'bg-green-600' :
                          milestone.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-400'
                        }`}
                        style={{ width: `${milestone.progress}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Entregables:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {milestone.deliverables.map((deliverable, idx) => (
                        <li key={idx}>{deliverable}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {project.files.map((file) => (
                <div
                  key={file.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? 
                        <PhotoIcon className="h-5 w-5 text-blue-600" /> : 
                        <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        {file.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {file.category}
                    </span>
                    <Button variant="outline" size="sm">
                      <DownloadIcon className="h-3 w-3 mr-1" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 h-96 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === user?.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-1">
                          {message.senderName} • {formatDate(message.timestamp || message.createdAt)}
                        </div>
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <PaperAirplaneIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default withAuth(ProjectDetailPage);
