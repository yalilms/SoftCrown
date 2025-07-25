'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  EnvelopeIcon,
  ClockIcon,
  PhoneIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Import communication components
import { ChatWidget } from '../chat/ChatWidget';
import { WhatsAppIntegration } from './WhatsAppIntegration';
import { VideoCallBooking } from './VideoCallBooking';
import { EmailTemplates } from './EmailTemplates';
import { FollowUpAutomation } from './FollowUpAutomation';

interface CommunicationStats {
  activeChats: number;
  pendingBookings: number;
  unreadWhatsApp: number;
  scheduledEmails: number;
  activeAutomations: number;
  responseTime: string;
  satisfactionRate: number;
}

interface CommunicationActivity {
  id: string;
  type: 'chat' | 'email' | 'whatsapp' | 'call' | 'automation';
  title: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  leadId?: string;
  leadName?: string;
}

const mockStats: CommunicationStats = {
  activeChats: 3,
  pendingBookings: 7,
  unreadWhatsApp: 12,
  scheduledEmails: 25,
  activeAutomations: 8,
  responseTime: '2.3 min',
  satisfactionRate: 94.8
};

const mockActivities: CommunicationActivity[] = [
  {
    id: '1',
    type: 'chat',
    title: 'Nuevo chat iniciado',
    description: 'María García inició una conversación sobre desarrollo web',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    status: 'pending',
    leadId: 'lead-001',
    leadName: 'María García'
  },
  {
    id: '2',
    type: 'email',
    title: 'Email de bienvenida enviado',
    description: 'Plantilla de bienvenida enviada a nuevo lead',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    status: 'success',
    leadId: 'lead-002',
    leadName: 'Carlos Ruiz'
  },
  {
    id: '3',
    type: 'whatsapp',
    title: 'Mensaje WhatsApp recibido',
    description: 'Consulta sobre precios de aplicación móvil',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    status: 'pending',
    leadId: 'lead-003',
    leadName: 'Ana López'
  },
  {
    id: '4',
    type: 'call',
    title: 'Videollamada programada',
    description: 'Reunión de consulta para mañana a las 15:00',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    status: 'success',
    leadId: 'lead-004',
    leadName: 'Pedro Martín'
  },
  {
    id: '5',
    type: 'automation',
    title: 'Secuencia de seguimiento activada',
    description: 'Automatización de cotización iniciada',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    status: 'success',
    leadId: 'lead-005',
    leadName: 'Laura Sánchez'
  }
];

export function CommunicationHub() {
  const { state, dispatch } = useContact();
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'whatsapp' | 'video' | 'email' | 'automation'>('overview');
  const [stats, setStats] = useState<CommunicationStats>(mockStats);
  const [activities, setActivities] = useState<CommunicationActivity[]>(mockActivities);
  const [showNotifications, setShowNotifications] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update stats randomly
      setStats(prev => ({
        ...prev,
        activeChats: Math.max(0, prev.activeChats + Math.floor(Math.random() * 3) - 1),
        unreadWhatsApp: Math.max(0, prev.unreadWhatsApp + Math.floor(Math.random() * 3) - 1),
        responseTime: `${(Math.random() * 5 + 1).toFixed(1)} min`
      }));

      // Add new activity occasionally
      if (Math.random() < 0.3) {
        const newActivity: CommunicationActivity = {
          id: `activity-${Date.now()}`,
          type: ['chat', 'email', 'whatsapp', 'call', 'automation'][Math.floor(Math.random() * 5)] as any,
          title: 'Nueva actividad',
          description: 'Actividad simulada en tiempo real',
          timestamp: new Date(),
          status: Math.random() > 0.8 ? 'failed' : 'success',
          leadId: `lead-${Math.floor(Math.random() * 100)}`,
          leadName: `Usuario ${Math.floor(Math.random() * 100)}`
        };
        
        setActivities(prev => [newActivity, ...prev.slice(0, 9)]);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: CommunicationActivity['type']) => {
    switch (type) {
      case 'chat': return ChatBubbleLeftRightIcon;
      case 'email': return EnvelopeIcon;
      case 'whatsapp': return PhoneIcon;
      case 'call': return VideoCameraIcon;
      case 'automation': return ClockIcon;
      default: return ChatBubbleLeftRightIcon;
    }
  };

  const getActivityColor = (type: CommunicationActivity['type']) => {
    switch (type) {
      case 'chat': return 'blue';
      case 'email': return 'green';
      case 'whatsapp': return 'emerald';
      case 'call': return 'purple';
      case 'automation': return 'orange';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: CommunicationActivity['status']) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'failed': return ExclamationTriangleIcon;
      case 'pending': return ClockIcon;
      default: return ClockIcon;
    }
  };

  const getStatusColor = (status: CommunicationActivity['status']) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: ChartBarIcon },
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon, badge: stats.activeChats },
    { id: 'whatsapp', label: 'WhatsApp', icon: PhoneIcon, badge: stats.unreadWhatsApp },
    { id: 'video', label: 'Video', icon: VideoCameraIcon, badge: stats.pendingBookings },
    { id: 'email', label: 'Email', icon: EnvelopeIcon, badge: stats.scheduledEmails },
    { id: 'automation', label: 'Automatización', icon: ClockIcon, badge: stats.activeAutomations }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-2xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <UserGroupIcon className="w-8 h-8 inline-block mr-3 text-blue-500" />
                Hub de Comunicación
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-300 mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Gestiona todas las comunicaciones con leads y clientes desde un solo lugar
              </motion.p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors relative"
                >
                  <BellIcon className="w-6 h-6" />
                  {activities.filter(a => a.status === 'pending').length > 0 && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Notificaciones Recientes
                        </h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {activities.slice(0, 5).map((activity) => {
                          const ActivityIcon = getActivityIcon(activity.type);
                          const StatusIcon = getStatusIcon(activity.status);
                          
                          return (
                            <div key={activity.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-lg bg-${getActivityColor(activity.type)}-100 dark:bg-${getActivityColor(activity.type)}-900/20`}>
                                  <ActivityIcon className={`w-4 h-4 text-${getActivityColor(activity.type)}-600 dark:text-${getActivityColor(activity.type)}-400`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {activity.title}
                                    </p>
                                    <StatusIcon className={`w-4 h-4 text-${getStatusColor(activity.status)}-500 flex-shrink-0`} />
                                  </div>
                                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                    {activity.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {activity.leadName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {activity.timestamp.toLocaleTimeString('es-ES', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                          Ver todas las notificaciones
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 text-xs font-medium px-2 py-1 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                      <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Chats Activos</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeChats}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20">
                      <PhoneIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">WhatsApp</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.unreadWhatsApp}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                      <VideoCameraIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reuniones</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBookings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                      <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Automatizaciones</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeAutomations}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Métricas de Rendimiento
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tiempo de respuesta promedio:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{stats.responseTime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tasa de satisfacción:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{stats.satisfactionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Emails programados:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.scheduledEmails}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {activities.slice(0, 5).map((activity) => {
                      const ActivityIcon = getActivityIcon(activity.type);
                      const StatusIcon = getStatusIcon(activity.status);
                      
                      return (
                        <div key={activity.id} className="flex items-start space-x-3">
                          <div className={`p-2 rounded-lg bg-${getActivityColor(activity.type)}-100 dark:bg-${getActivityColor(activity.type)}-900/20 flex-shrink-0`}>
                            <ActivityIcon className={`w-4 h-4 text-${getActivityColor(activity.type)}-600 dark:text-${getActivityColor(activity.type)}-400`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {activity.title}
                              </p>
                              <StatusIcon className={`w-4 h-4 text-${getStatusColor(activity.status)}-500 flex-shrink-0`} />
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-300">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {activity.timestamp.toLocaleString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ChatWidget />
            </motion.div>
          )}

          {/* WhatsApp Tab */}
          {activeTab === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <WhatsAppIntegration />
            </motion.div>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VideoCallBooking />
            </motion.div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <EmailTemplates />
            </motion.div>
          )}

          {/* Automation Tab */}
          {activeTab === 'automation' && (
            <motion.div
              key="automation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FollowUpAutomation />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
