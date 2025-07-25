'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'time_based' | 'action_based' | 'condition_based';
    condition: string;
    delay?: number;
  };
  actions: AutomationAction[];
  isActive: boolean;
  createdAt: Date;
  lastTriggered?: Date;
  triggerCount: number;
  successRate: number;
}

interface AutomationAction {
  id: string;
  type: 'send_email' | 'create_task' | 'update_status' | 'schedule_call' | 'send_whatsapp';
  templateId?: string;
  parameters: Record<string, any>;
  delay?: number;
}

interface AutomationExecution {
  id: string;
  ruleId: string;
  leadId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  currentStep: number;
  totalSteps: number;
  results: any[];
  error?: string;
}

const defaultRules: AutomationRule[] = [
  {
    id: 'welcome-sequence',
    name: 'Secuencia de Bienvenida',
    description: 'Envía emails de bienvenida y seguimiento automático para nuevos leads',
    trigger: {
      type: 'action_based',
      condition: 'lead_created',
      delay: 0
    },
    actions: [
      {
        id: 'welcome-email',
        type: 'send_email',
        templateId: 'welcome-new-lead',
        parameters: {},
        delay: 0
      },
      {
        id: 'follow-up-1',
        type: 'send_email',
        templateId: 'follow-up-day-3',
        parameters: {},
        delay: 72
      }
    ],
    isActive: true,
    createdAt: new Date('2024-01-15'),
    lastTriggered: new Date('2024-07-20'),
    triggerCount: 156,
    successRate: 94.2
  },
  {
    id: 'quote-follow-up',
    name: 'Seguimiento de Cotizaciones',
    description: 'Seguimiento automático cuando se envía una cotización sin respuesta',
    trigger: {
      type: 'time_based',
      condition: 'quote_sent_no_response',
      delay: 48
    },
    actions: [
      {
        id: 'quote-reminder',
        type: 'send_email',
        templateId: 'quote-reminder',
        parameters: {},
        delay: 0
      },
      {
        id: 'schedule-call-reminder',
        type: 'send_email',
        templateId: 'schedule-call-offer',
        parameters: {},
        delay: 120
      }
    ],
    isActive: true,
    createdAt: new Date('2024-02-01'),
    lastTriggered: new Date('2024-07-18'),
    triggerCount: 89,
    successRate: 87.6
  }
];

export function FollowUpAutomation() {
  const { state, dispatch } = useContact();
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [executions, setExecutions] = useState<AutomationExecution[]>([]);
  const [activeTab, setActiveTab] = useState<'rules' | 'executions' | 'analytics'>('rules');

  useEffect(() => {
    const mockExecutions: AutomationExecution[] = [
      {
        id: 'exec-1',
        ruleId: 'welcome-sequence',
        leadId: 'lead-123',
        status: 'running',
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        currentStep: 2,
        totalSteps: 3,
        results: [
          { action: 'welcome-email', status: 'completed', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
        ]
      }
    ];
    setExecutions(mockExecutions);
  }, []);

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive }
        : rule
    ));
    
    const rule = rules.find(r => r.id === ruleId);
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'success',
        title: 'Regla actualizada',
        message: `La regla "${rule?.name}" ha sido ${rule?.isActive ? 'desactivada' : 'activada'}`
      }
    });
  };

  const getStatusColor = (status: AutomationExecution['status']) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: AutomationExecution['status']) => {
    switch (status) {
      case 'pending': return ClockIcon;
      case 'running': return PlayIcon;
      case 'completed': return CheckCircleIcon;
      case 'failed': return ExclamationTriangleIcon;
      case 'cancelled': return StopIcon;
      default: return ClockIcon;
    }
  };

  const getActionTypeIcon = (type: AutomationAction['type']) => {
    switch (type) {
      case 'send_email': return EnvelopeIcon;
      case 'create_task': return CheckCircleIcon;
      case 'update_status': return ChartBarIcon;
      case 'schedule_call': return CalendarIcon;
      default: return CheckCircleIcon;
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
          <ClockIcon className="w-8 h-8 inline-block mr-2 text-purple-500" />
          Automatización de Seguimiento
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Configura secuencias automáticas de seguimiento para leads y clientes
        </motion.p>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {[
            { id: 'rules', label: 'Reglas', icon: ClockIcon },
            { id: 'executions', label: 'Ejecuciones', icon: PlayIcon },
            { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <motion.div
            key="rules"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Rules List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Reglas de Automatización
                  </h2>
                  <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl transition-colors flex items-center space-x-2">
                    <PlusIcon className="w-5 h-5" />
                    <span>Nueva Regla</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {rules.map((rule) => (
                    <motion.div
                      key={rule.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {rule.name}
                            </h3>
                            <span className={`
                              px-2 py-1 rounded-full text-xs font-medium
                              ${rule.isActive 
                                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200'
                              }
                            `}>
                              {rule.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                            {rule.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
                            <span>
                              <strong>Acciones:</strong> {rule.actions.length}
                            </span>
                            <span>
                              <strong>Ejecutada:</strong> {rule.triggerCount} veces
                            </span>
                            <span>
                              <strong>Éxito:</strong> {rule.successRate}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleRule(rule.id)}
                            className={`
                              p-2 transition-colors
                              ${rule.isActive 
                                ? 'text-green-500 hover:text-green-600'
                                : 'text-gray-400 hover:text-green-500'
                              }
                            `}
                            title={rule.isActive ? 'Desactivar' : 'Activar'}
                          >
                            {rule.isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Actions Preview */}
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Secuencia de Acciones:
                        </h4>
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                          {rule.actions.map((action, index) => {
                            const ActionIcon = getActionTypeIcon(action.type);
                            return (
                              <div key={action.id} className="flex items-center space-x-2 flex-shrink-0">
                                <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                                  <ActionIcon className="w-4 h-4 text-purple-500" />
                                  <span className="text-xs text-gray-700 dark:text-gray-300">
                                    {action.type.replace('_', ' ')}
                                  </span>
                                  {action.delay && action.delay > 0 && (
                                    <span className="text-xs text-gray-500">
                                      (+{action.delay}h)
                                    </span>
                                  )}
                                </div>
                                {index < rule.actions.length - 1 && (
                                  <div className="w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Estadísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Reglas activas:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {rules.filter(r => r.isActive).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Total ejecuciones:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {rules.reduce((sum, r) => sum + r.triggerCount, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Tasa éxito promedio:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {Math.round(rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Configuración
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1">
                        Intervalo de verificación:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option value="5">Cada 5 minutos</option>
                        <option value="15">Cada 15 minutos</option>
                        <option value="30">Cada 30 minutos</option>
                        <option value="60">Cada hora</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-600 dark:text-gray-300 mb-1">
                        Zona horaria:
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                        <option value="Europe/Madrid">Madrid (CET)</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    
                    <button className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm">
                      Guardar Configuración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Executions Tab */}
        {activeTab === 'executions' && (
          <motion.div
            key="executions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Ejecuciones en Tiempo Real
              </h2>

              <div className="space-y-4">
                {executions.map((execution) => {
                  const StatusIcon = getStatusIcon(execution.status);
                  const rule = rules.find(r => r.id === execution.ruleId);
                  
                  return (
                    <motion.div
                      key={execution.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`w-5 h-5 text-${getStatusColor(execution.status)}-500`} />
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {rule?.name || 'Regla desconocida'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              Lead ID: {execution.leadId}
                            </p>
                          </div>
                        </div>
                        
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          bg-${getStatusColor(execution.status)}-100 dark:bg-${getStatusColor(execution.status)}-900/20
                          text-${getStatusColor(execution.status)}-800 dark:text-${getStatusColor(execution.status)}-200
                        `}>
                          {execution.status}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <span>Progreso</span>
                          <span>{execution.currentStep}/{execution.totalSteps}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`bg-${getStatusColor(execution.status)}-500 h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${(execution.currentStep / execution.totalSteps) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {executions.length === 0 && (
                  <div className="text-center py-12">
                    <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No hay ejecuciones activas en este momento
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Rendimiento por Regla
                </h3>
                
                <div className="space-y-4">
                  {rules.map((rule) => (
                    <div key={rule.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {rule.successRate}% éxito
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${rule.successRate}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span>{rule.triggerCount} ejecuciones</span>
                        <span>
                          {rule.lastTriggered ? 
                            `Última: ${rule.lastTriggered.toLocaleDateString('es-ES')}` : 
                            'Nunca ejecutada'
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Métricas de Conversión
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {Math.round(rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length)}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Tasa de Éxito General
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {rules.reduce((sum, r) => sum + r.triggerCount, 0)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        Total Ejecutadas
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {executions.filter(e => e.status === 'running').length}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        En Ejecución
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
