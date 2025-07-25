'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'template' | 'media';
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: 'welcome' | 'follow-up' | 'quote' | 'support';
}

const whatsappTemplates: WhatsAppTemplate[] = [
  {
    id: 'welcome',
    name: 'Mensaje de Bienvenida',
    content: '¡Hola {{name}}! 👋 Gracias por contactar con SoftCrown. Hemos recibido tu solicitud sobre {{project_type}} y nos pondremos en contacto contigo pronto.',
    variables: ['name', 'project_type'],
    category: 'welcome'
  },
  {
    id: 'quote-ready',
    name: 'Cotización Lista',
    content: '¡Hola {{name}}! 📋 Tu cotización para {{project_type}} está lista. El presupuesto estimado es de {{amount}}€. ¿Te gustaría agendar una llamada para discutir los detalles?',
    variables: ['name', 'project_type', 'amount'],
    category: 'quote'
  },
  {
    id: 'follow-up',
    name: 'Seguimiento',
    content: 'Hola {{name}}, ¿cómo estás? 😊 Quería hacer seguimiento a nuestra conversación sobre {{project_type}}. ¿Tienes alguna pregunta adicional?',
    variables: ['name', 'project_type'],
    category: 'follow-up'
  },
  {
    id: 'meeting-reminder',
    name: 'Recordatorio de Reunión',
    content: '⏰ Recordatorio: Tienes una reunión programada para {{date}} a las {{time}}. El enlace de la videollamada es: {{meeting_link}}',
    variables: ['date', 'time', 'meeting_link'],
    category: 'support'
  }
];

interface WhatsAppIntegrationProps {
  leadId?: string;
  phoneNumber?: string;
  onMessageSent?: (message: WhatsAppMessage) => void;
}

export function WhatsAppIntegration({ 
  leadId, 
  phoneNumber, 
  onMessageSent 
}: WhatsAppIntegrationProps) {
  const { state, dispatch } = useContact();
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  // Simulate WhatsApp connection status
  useEffect(() => {
    const timer = setTimeout(() => setIsConnected(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Load existing messages for the lead
  useEffect(() => {
    if (leadId) {
      // In a real app, you'd fetch messages from your backend
      const mockMessages: WhatsAppMessage[] = [
        {
          id: '1',
          content: '¡Hola! Gracias por contactarnos.',
          timestamp: new Date(Date.now() - 3600000),
          type: 'template',
          status: 'read'
        }
      ];
      setMessages(mockMessages);
    }
  }, [leadId]);

  const sendWhatsAppMessage = async (content: string, type: 'text' | 'template' = 'text') => {
    if (!phoneNumber || !content.trim()) return;

    setIsSending(true);

    const message: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      content,
      timestamp: new Date(),
      type,
      status: 'sent'
    };

    try {
      // In a real app, you'd call your WhatsApp Business API
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update message status
      message.status = 'delivered';
      setMessages(prev => [...prev, message]);

      // Clear form
      setCustomMessage('');
      setSelectedTemplate(null);
      setTemplateVariables({});

      // Callback
      onMessageSent?.(message);

      // Add notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: 'Mensaje enviado',
          message: `Mensaje de WhatsApp enviado a ${phoneNumber}`
        }
      });

      // Simulate delivery confirmation after a delay
      setTimeout(() => {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === message.id 
              ? { ...msg, status: 'read' }
              : msg
          )
        );
      }, 3000);

    } catch (error) {
      message.status = 'failed';
      setMessages(prev => [...prev, message]);
      
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error al enviar',
          message: 'No se pudo enviar el mensaje de WhatsApp'
        }
      });
    } finally {
      setIsSending(false);
    }
  };

  const processTemplate = (template: WhatsAppTemplate): string => {
    let processed = template.content;
    template.variables.forEach(variable => {
      const value = templateVariables[variable] || `{{${variable}}}`;
      processed = processed.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    return processed;
  };

  const openWhatsAppWeb = () => {
    if (phoneNumber) {
      const message = encodeURIComponent(customMessage || 'Hola, me gustaría obtener más información sobre sus servicios.');
      const url = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${message}`;
      window.open(url, '_blank');
    }
  };

  const getStatusIcon = (status: WhatsAppMessage['status']) => {
    switch (status) {
      case 'sent':
        return <CheckCircleIcon className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <CheckCircleIcon className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChatBubbleLeftRightIcon className="w-8 h-8 inline-block mr-2 text-green-500" />
          WhatsApp Business
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Comunícate directamente con tus leads a través de WhatsApp
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Message Composer */}
        <div className="lg:col-span-2 space-y-6">
          {/* Connection Status */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Estado de Conexión
              </h2>
              <div className={`
                flex items-center space-x-2 px-3 py-1 rounded-full text-sm
                ${isConnected 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                  : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                }
              `}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span>{isConnected ? 'Conectado' : 'Conectando...'}</span>
              </div>
            </div>
            
            {phoneNumber && (
              <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                <PhoneIcon className="w-5 h-5" />
                <span>Número objetivo: {phoneNumber}</span>
              </div>
            )}
          </div>

          {/* Template Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Plantillas de Mensaje
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {whatsappTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedTemplate?.id === template.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedTemplate(template)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {template.content.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`
                      px-2 py-1 rounded-full text-xs
                      ${template.category === 'welcome' ? 'bg-blue-100 text-blue-800' :
                        template.category === 'quote' ? 'bg-purple-100 text-purple-800' :
                        template.category === 'follow-up' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {template.category}
                    </span>
                    {template.variables.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {template.variables.length} variables
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Template Variables */}
            {selectedTemplate && selectedTemplate.variables.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Variables de la Plantilla
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {variable.replace('_', ' ')}
                      </label>
                      <input
                        type="text"
                        value={templateVariables[variable] || ''}
                        onChange={(e) => setTemplateVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        placeholder={`Ingresa ${variable}`}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Preview */}
            {selectedTemplate && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Vista Previa del Mensaje
                </h3>
                <p className="text-green-800 dark:text-green-200 whitespace-pre-wrap">
                  {processTemplate(selectedTemplate)}
                </p>
              </div>
            )}
          </div>

          {/* Custom Message */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Mensaje Personalizado
            </h2>
            
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Escribe tu mensaje personalizado aquí..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {customMessage.length}/1000 caracteres
              </span>
              
              <div className="flex space-x-3">
                <button
                  onClick={openWhatsAppWeb}
                  disabled={!phoneNumber}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Abrir WhatsApp Web
                </button>
                
                <button
                  onClick={() => sendWhatsAppMessage(
                    selectedTemplate ? processTemplate(selectedTemplate) : customMessage,
                    selectedTemplate ? 'template' : 'text'
                  )}
                  disabled={isSending || (!selectedTemplate && !customMessage.trim()) || !phoneNumber}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-4 h-4" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Message History Sidebar */}
        <div className="space-y-6">
          {/* Recent Messages */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Historial de Mensajes
            </h3>
            
            {messages.length > 0 ? (
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.type === 'template' ? 'Plantilla' : 'Personalizado'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(message.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {message.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay mensajes aún</p>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Estadísticas
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Mensajes enviados:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {messages.filter(m => m.status !== 'failed').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Mensajes leídos:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {messages.filter(m => m.status === 'read').length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tasa de entrega:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {messages.length > 0 
                    ? Math.round((messages.filter(m => m.status !== 'failed').length / messages.length) * 100)
                    : 0
                  }%
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Acciones Rápidas
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => setSelectedTemplate(whatsappTemplates.find(t => t.id === 'welcome') || null)}
                className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                <div className="font-medium text-blue-900 dark:text-blue-100">
                  Enviar Bienvenida
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Mensaje de bienvenida automático
                </div>
              </button>
              
              <button
                onClick={() => setSelectedTemplate(whatsappTemplates.find(t => t.id === 'follow-up') || null)}
                className="w-full text-left p-3 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
              >
                <div className="font-medium text-yellow-900 dark:text-yellow-100">
                  Hacer Seguimiento
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  Mensaje de seguimiento personalizado
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
