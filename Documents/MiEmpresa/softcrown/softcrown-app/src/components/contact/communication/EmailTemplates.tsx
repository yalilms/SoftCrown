'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  EnvelopeIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables: string[];
  category: 'welcome' | 'follow-up' | 'quote' | 'meeting' | 'thank-you' | 'custom';
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome-new-lead',
    name: 'Bienvenida - Nuevo Lead',
    subject: '¡Gracias por contactarnos, {{firstName}}!',
    content: `Hola {{firstName}},

¡Gracias por contactar con SoftCrown! Hemos recibido tu solicitud sobre {{projectType}} y estamos emocionados de poder ayudarte.

**Tu solicitud:**
- Tipo de proyecto: {{projectType}}
- Presupuesto estimado: {{budget}}
- Timeline: {{timeline}}

**Próximos pasos:**
1. Nuestro equipo revisará tu solicitud en las próximas 24 horas
2. Te contactaremos para agendar una consulta gratuita
3. Crearemos una propuesta personalizada para tu proyecto

¿Tienes alguna pregunta urgente? Responde a este email o llámanos al +34 650 63 65 99.

¡Esperamos trabajar contigo pronto!

Saludos,
El equipo de SoftCrown`,
    variables: ['firstName', 'projectType', 'budget', 'timeline'],
    category: 'welcome',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    usageCount: 45
  },
  {
    id: 'quote-ready',
    name: 'Cotización Lista',
    subject: 'Tu cotización personalizada está lista - {{projectType}}',
    content: `Hola {{firstName}},

¡Excelentes noticias! Tu cotización personalizada para {{projectType}} está lista.

**Resumen del proyecto:**
- Presupuesto total: {{totalAmount}}€ (IVA incluido)
- Tiempo de desarrollo: {{timeEstimate}} semanas
- Fecha de inicio propuesta: {{startDate}}

**Lo que incluye:**
{{projectFeatures}}

**Próximos pasos:**
1. Revisa la cotización detallada en el archivo adjunto
2. Agenda una llamada para resolver dudas
3. Si todo está bien, podemos comenzar inmediatamente

¿Tienes preguntas? Responde a este email o llámanos.

¡Esperamos tu respuesta!

Saludos,
{{agentName}}
SoftCrown - Desarrollo Web & Apps`,
    variables: ['firstName', 'projectType', 'totalAmount', 'timeEstimate', 'startDate', 'projectFeatures', 'agentName'],
    category: 'quote',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    lastUsed: new Date('2024-07-20'),
    usageCount: 32
  }
];

export function EmailTemplates() {
  const { state, dispatch } = useContact();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [editForm, setEditForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'custom' as EmailTemplate['category']
  });

  const [testVariables, setTestVariables] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedTemplate) {
      const defaultVars: Record<string, string> = {};
      selectedTemplate.variables.forEach(variable => {
        switch (variable) {
          case 'firstName':
            defaultVars[variable] = 'Juan';
            break;
          case 'projectType':
            defaultVars[variable] = 'Desarrollo Web';
            break;
          case 'budget':
            defaultVars[variable] = '5.000€ - 15.000€';
            break;
          case 'timeline':
            defaultVars[variable] = '2-3 meses';
            break;
          case 'totalAmount':
            defaultVars[variable] = '12.500';
            break;
          case 'agentName':
            defaultVars[variable] = 'Carlos Mendoza';
            break;
          default:
            defaultVars[variable] = `[${variable}]`;
        }
      });
      setTestVariables(defaultVars);
    }
  }, [selectedTemplate]);

  const processTemplate = (template: EmailTemplate, variables: Record<string, string>) => {
    let processed = template.content;
    template.variables.forEach(variable => {
      const value = variables[variable] || `{{${variable}}}`;
      processed = processed.replace(new RegExp(`{{${variable}}}`, 'g'), value);
    });
    return processed;
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsEditing(true);
    setEditForm({
      name: template.name,
      subject: template.subject,
      content: template.content,
      category: template.category
    });
  };

  const sendTestEmail = async (template: EmailTemplate) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'info',
        title: 'Email de prueba enviado',
        message: `Se ha enviado un email de prueba usando la plantilla "${template.name}"`
      }
    });
    
    setTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date() }
        : t
    ));
  };

  const getCategoryColor = (category: EmailTemplate['category']) => {
    const colors = {
      welcome: 'blue',
      'follow-up': 'yellow',
      quote: 'purple',
      meeting: 'green',
      'thank-you': 'pink',
      custom: 'gray'
    };
    return colors[category];
  };

  const getCategoryIcon = (category: EmailTemplate['category']) => {
    switch (category) {
      case 'welcome': return '👋';
      case 'follow-up': return '🔄';
      case 'quote': return '💰';
      case 'meeting': return '📅';
      case 'thank-you': return '🙏';
      case 'custom': return '✨';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <EnvelopeIcon className="w-8 h-8 inline-block mr-2 text-blue-500" />
          Plantillas de Email
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Gestiona y personaliza tus comunicaciones por email con Ionos o Google Workspace
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {!isEditing && !previewMode && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Templates List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Plantillas Disponibles
                  </h2>
                  <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nueva Plantilla</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {templates.map((template) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">{getCategoryIcon(template.category)}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {template.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              {template.subject}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className={`
                                px-2 py-1 rounded-full
                                bg-${getCategoryColor(template.category)}-100 dark:bg-${getCategoryColor(template.category)}-900/20
                                text-${getCategoryColor(template.category)}-800 dark:text-${getCategoryColor(template.category)}-200
                              `}>
                                {template.category}
                              </span>
                              <span>Usado {template.usageCount} veces</span>
                              {template.lastUsed && (
                                <span>Último uso: {template.lastUsed.toLocaleDateString('es-ES')}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTemplate(template);
                              setPreviewMode(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                            title="Vista previa"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                            title="Editar"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => sendTestEmail(template)}
                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                            title="Enviar prueba"
                          >
                            <PaperAirplaneIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        <p className="line-clamp-2">{template.content.substring(0, 150)}...</p>
                        {template.variables.length > 0 && (
                          <div className="mt-3">
                            <span className="font-medium">Variables: </span>
                            <span className="text-blue-600 dark:text-blue-400">
                              {template.variables.map(v => `{{${v}}}`).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Estadísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total plantillas:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {templates.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Plantillas activas:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {templates.filter(t => t.isActive).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total envíos:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Configuración de Email
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1">
                        Proveedor de Email:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option value="ionos">Ionos</option>
                        <option value="google">Google Workspace</option>
                        <option value="outlook">Outlook 365</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1">
                        Email remitente:
                      </label>
                      <input
                        type="email"
                        defaultValue="info@softcrown.com"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm">
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Preview Mode */}
        {previewMode && selectedTemplate && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Vista Previa: {selectedTemplate.name}
              </h2>
              <button
                onClick={() => {
                  setPreviewMode(false);
                  setSelectedTemplate(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Variables */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Variables de Prueba
                </h3>
                <div className="space-y-4">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={testVariables[variable] || ''}
                        onChange={(e) => setTestVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Vista Previa del Email
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border">
                  <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-600">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Asunto:</p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {processTemplate({ ...selectedTemplate, content: selectedTemplate.subject }, testVariables)}
                    </p>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white font-sans">
                      {processTemplate(selectedTemplate, testVariables)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-8 space-x-4">
              <button
                onClick={() => sendTestEmail(selectedTemplate)}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors flex items-center space-x-2"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
                <span>Enviar Email de Prueba</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
