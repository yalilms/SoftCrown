'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  FunnelIcon,
  ArrowRightIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { TrendingUp as TrendingUpIcon } from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  color: string;
  leads: PipelineLead[];
  conversionRate: number;
  averageTime: number; // days
  totalValue: number;
}

interface PipelineLead {
  id: string;
  name: string;
  company: string;
  value: number;
  probability: number;
  daysInStage: number;
  lastActivity: Date;
  nextAction: string;
  assignedTo: string;
}

const mockPipelineData: PipelineStage[] = [
  {
    id: 'new',
    name: 'Nuevos Leads',
    color: 'blue',
    conversionRate: 45,
    averageTime: 2,
    totalValue: 125000,
    leads: [
      {
        id: 'lead-001',
        name: 'María García',
        company: 'Tech Solutions SL',
        value: 25000,
        probability: 20,
        daysInStage: 1,
        lastActivity: new Date('2024-07-23'),
        nextAction: 'Llamada de calificación',
        assignedTo: 'Carlos Mendoza'
      },
      {
        id: 'lead-002',
        name: 'Juan Rodríguez',
        company: 'InnovaStart',
        value: 15000,
        probability: 25,
        daysInStage: 3,
        lastActivity: new Date('2024-07-21'),
        nextAction: 'Enviar información adicional',
        assignedTo: 'Ana López'
      },
      {
        id: 'lead-003',
        name: 'Laura Martín',
        company: 'Consultora Digital',
        value: 8000,
        probability: 15,
        daysInStage: 5,
        lastActivity: new Date('2024-07-19'),
        nextAction: 'Seguimiento por email',
        assignedTo: 'Pedro Sánchez'
      }
    ]
  },
  {
    id: 'qualified',
    name: 'Calificados',
    color: 'purple',
    conversionRate: 65,
    averageTime: 5,
    totalValue: 89000,
    leads: [
      {
        id: 'lead-004',
        name: 'Carlos Ruiz',
        company: 'StartupTech',
        value: 35000,
        probability: 60,
        daysInStage: 4,
        lastActivity: new Date('2024-07-22'),
        nextAction: 'Presentación de propuesta',
        assignedTo: 'Carlos Mendoza'
      },
      {
        id: 'lead-005',
        name: 'Ana Fernández',
        company: 'Digital Corp',
        value: 22000,
        probability: 70,
        daysInStage: 2,
        lastActivity: new Date('2024-07-23'),
        nextAction: 'Reunión técnica',
        assignedTo: 'Ana López'
      }
    ]
  },
  {
    id: 'proposal',
    name: 'Propuesta Enviada',
    color: 'orange',
    conversionRate: 75,
    averageTime: 7,
    totalValue: 67000,
    leads: [
      {
        id: 'lead-006',
        name: 'Pedro López',
        company: 'MegaCorp SA',
        value: 45000,
        probability: 80,
        daysInStage: 6,
        lastActivity: new Date('2024-07-20'),
        nextAction: 'Seguimiento de propuesta',
        assignedTo: 'Carlos Mendoza'
      },
      {
        id: 'lead-007',
        name: 'Sofia González',
        company: 'TechStart',
        value: 22000,
        probability: 70,
        daysInStage: 3,
        lastActivity: new Date('2024-07-22'),
        nextAction: 'Negociación de términos',
        assignedTo: 'Pedro Sánchez'
      }
    ]
  },
  {
    id: 'negotiation',
    name: 'Negociación',
    color: 'indigo',
    conversionRate: 85,
    averageTime: 10,
    totalValue: 78000,
    leads: [
      {
        id: 'lead-008',
        name: 'Miguel Torres',
        company: 'InnovaCorp',
        value: 55000,
        probability: 90,
        daysInStage: 8,
        lastActivity: new Date('2024-07-21'),
        nextAction: 'Firma de contrato',
        assignedTo: 'Ana López'
      },
      {
        id: 'lead-009',
        name: 'Elena Morales',
        company: 'FutureTech',
        value: 23000,
        probability: 80,
        daysInStage: 12,
        lastActivity: new Date('2024-07-18'),
        nextAction: 'Revisión final de términos',
        assignedTo: 'Carlos Mendoza'
      }
    ]
  },
  {
    id: 'won',
    name: 'Ganados',
    color: 'green',
    conversionRate: 100,
    averageTime: 0,
    totalValue: 156000,
    leads: [
      {
        id: 'lead-010',
        name: 'Roberto Silva',
        company: 'GlobalTech',
        value: 85000,
        probability: 100,
        daysInStage: 0,
        lastActivity: new Date('2024-07-22'),
        nextAction: 'Inicio de proyecto',
        assignedTo: 'Carlos Mendoza'
      },
      {
        id: 'lead-011',
        name: 'Carmen Vega',
        company: 'SmartSolutions',
        value: 38000,
        probability: 100,
        daysInStage: 2,
        lastActivity: new Date('2024-07-20'),
        nextAction: 'Onboarding cliente',
        assignedTo: 'Ana López'
      }
    ]
  }
];

export function PipelineVisualization() {
  const { state, dispatch } = useContact();
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>(mockPipelineData);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [selectedLead, setSelectedLead] = useState<PipelineLead | null>(null);
  const [viewMode, setViewMode] = useState<'kanban' | 'funnel'>('kanban');

  // Calculate pipeline metrics
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.leads.length, 0);
  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.totalValue, 0);
  const weightedValue = pipelineData.reduce((sum, stage) => 
    sum + stage.leads.reduce((stageSum, lead) => 
      stageSum + (lead.value * lead.probability / 100), 0
    ), 0
  );
  const averageConversion = pipelineData.reduce((sum, stage) => sum + stage.conversionRate, 0) / pipelineData.length;

  const moveLead = (leadId: string, fromStageId: string, toStageId: string) => {
    setPipelineData(prev => {
      const newData = [...prev];
      const fromStage = newData.find(s => s.id === fromStageId);
      const toStage = newData.find(s => s.id === toStageId);
      
      if (fromStage && toStage) {
        const leadIndex = fromStage.leads.findIndex(l => l.id === leadId);
        if (leadIndex !== -1) {
          const lead = fromStage.leads[leadIndex];
          fromStage.leads.splice(leadIndex, 1);
          toStage.leads.push({
            ...lead,
            daysInStage: 0,
            lastActivity: new Date()
          });
        }
      }
      
      return newData;
    });

    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'success',
        title: 'Lead movido',
        message: `Lead movido a ${pipelineData.find(s => s.id === toStageId)?.name}`
      }
    });
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'green';
    if (probability >= 60) return 'yellow';
    if (probability >= 40) return 'orange';
    return 'red';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FunnelIcon className="w-8 h-8 inline-block mr-3 text-purple-500" />
            Pipeline de Ventas
          </motion.h1>
          <motion.p 
            className="text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Visualiza y gestiona el progreso de tus oportunidades de negocio
          </motion.p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('funnel')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'funnel'
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Embudo
            </button>
          </div>
        </div>
      </div>

      {/* Pipeline Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserGroupIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
              <CurrencyEuroIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{totalValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUpIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Valor Ponderado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                €{Math.round(weightedValue).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <ChartBarIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Conversión Promedio</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(averageConversion)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline Visualization */}
      <AnimatePresence mode="wait">
        {viewMode === 'kanban' && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {pipelineData.map((stage, stageIndex) => (
              <div
                key={stage.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Stage Header */}
                <div className={`bg-${stage.color}-500 px-6 py-4`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">
                      {stage.name}
                    </h3>
                    <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">
                      {stage.leads.length}
                    </span>
                  </div>
                  <div className="mt-2 text-white text-xs opacity-90">
                    €{stage.totalValue.toLocaleString()} • {stage.conversionRate}%
                  </div>
                </div>

                {/* Stage Content */}
                <div className="p-4 space-y-3 min-h-[400px] max-h-[600px] overflow-y-auto">
                  {stage.leads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-all"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                            {lead.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {lead.company}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLead(lead);
                          }}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          €{lead.value.toLocaleString()}
                        </span>
                        <span className={`
                          text-xs px-2 py-1 rounded-full
                          bg-${getProbabilityColor(lead.probability)}-100 dark:bg-${getProbabilityColor(lead.probability)}-900/20
                          text-${getProbabilityColor(lead.probability)}-800 dark:text-${getProbabilityColor(lead.probability)}-200
                        `}>
                          {lead.probability}%
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <div className="flex items-center space-x-1 mb-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>{lead.daysInStage} días en etapa</span>
                        </div>
                        <div>Próximo: {lead.nextAction}</div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {lead.assignedTo}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {lead.lastActivity.toLocaleDateString('es-ES')}
                        </span>
                      </div>

                      {/* Move buttons */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {stageIndex > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLead(lead.id, stage.id, pipelineData[stageIndex - 1].id);
                            }}
                            className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                          >
                            ← Anterior
                          </button>
                        )}
                        {stageIndex < pipelineData.length - 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveLead(lead.id, stage.id, pipelineData[stageIndex + 1].id);
                            }}
                            className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors ml-auto"
                          >
                            Siguiente →
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {stage.leads.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <FunnelIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No hay leads en esta etapa</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {viewMode === 'funnel' && (
          <motion.div
            key="funnel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="space-y-6">
              {pipelineData.map((stage, index) => (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <div className="flex items-center space-x-4">
                    {/* Funnel Stage */}
                    <div 
                      className={`
                        flex-1 bg-${stage.color}-500 rounded-lg p-6 text-white relative
                        ${index === 0 ? 'ml-0' : 'ml-8'}
                        ${index === pipelineData.length - 1 ? 'mr-0' : 'mr-8'}
                      `}
                      style={{
                        clipPath: index === pipelineData.length - 1 
                          ? 'none' 
                          : 'polygon(0 0, calc(100% - 30px) 0, 100% 50%, calc(100% - 30px) 100%, 0 100%)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{stage.name}</h3>
                          <p className="text-sm opacity-90">
                            {stage.leads.length} leads • €{stage.totalValue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{stage.conversionRate}%</div>
                          <div className="text-sm opacity-90">conversión</div>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    {index < pipelineData.length - 1 && (
                      <ArrowRightIcon className="w-6 h-6 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>

                  {/* Stage Details */}
                  <div className="mt-4 ml-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="font-medium text-gray-900 dark:text-white">Tiempo Promedio</div>
                      <div className="text-gray-600 dark:text-gray-300">{stage.averageTime} días</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="font-medium text-gray-900 dark:text-white">Valor Promedio</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        €{stage.leads.length > 0 ? Math.round(stage.totalValue / stage.leads.length).toLocaleString() : 0}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <div className="font-medium text-gray-900 dark:text-white">Próximas Acciones</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {stage.leads.filter(l => l.nextAction).length} pendientes
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead Detail Modal */}
      <AnimatePresence>
        {selectedLead && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedLead(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Detalles del Lead
                </h3>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{selectedLead.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{selectedLead.company}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Valor</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      €{selectedLead.value.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Probabilidad</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedLead.probability}%
                    </p>
                  </div>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Próxima Acción</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLead.nextAction}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Asignado a</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedLead.assignedTo}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedLead.daysInStage} días en etapa
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedLead.lastActivity.toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
