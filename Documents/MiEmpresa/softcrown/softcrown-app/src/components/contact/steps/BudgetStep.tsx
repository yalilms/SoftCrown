'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact, useFormStep } from '@/contexts/ContactContext';
import { BudgetInfoForm } from '@/lib/validations/contact';
import { 
  CurrencyEuroIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const budgetRanges = [
  {
    id: 'under-5k',
    label: 'Menos de 5.000€',
    description: 'Proyectos pequeños, landing pages',
    icon: '💡',
    color: 'green',
    recommended: ['Landing Page', 'Blog Personal', 'Sitio Básico']
  },
  {
    id: '5k-15k',
    label: '5.000€ - 15.000€',
    description: 'Sitios web corporativos, apps básicas',
    icon: '🚀',
    color: 'blue',
    recommended: ['Web Corporativa', 'E-commerce Básico', 'App Móvil Simple']
  },
  {
    id: '15k-30k',
    label: '15.000€ - 30.000€',
    description: 'E-commerce, aplicaciones complejas',
    icon: '⭐',
    color: 'purple',
    recommended: ['E-commerce Avanzado', 'App Móvil Compleja', 'Portal Web']
  },
  {
    id: '30k-50k',
    label: '30.000€ - 50.000€',
    description: 'Plataformas empresariales',
    icon: '💎',
    color: 'yellow',
    recommended: ['Plataforma SaaS', 'Sistema Empresarial', 'Marketplace']
  },
  {
    id: 'over-50k',
    label: 'Más de 50.000€',
    description: 'Soluciones enterprise',
    icon: '🏆',
    color: 'red',
    recommended: ['Sistema Enterprise', 'Plataforma Compleja', 'Solución Custom']
  },
  {
    id: 'custom',
    label: 'Presupuesto personalizado',
    description: 'Define tu propio rango',
    icon: '🎯',
    color: 'gray',
    recommended: ['Proyecto Específico', 'Consultoría', 'Desarrollo Custom']
  }
];

const paymentOptions = [
  {
    id: 'milestone',
    title: 'Por Hitos',
    description: 'Pagos divididos según entregables',
    icon: CheckCircleIcon,
    popular: true,
    details: '30% inicio, 40% desarrollo, 30% entrega'
  },
  {
    id: 'monthly',
    title: 'Mensual',
    description: 'Pagos mensuales durante el proyecto',
    icon: CalendarDaysIcon,
    popular: false,
    details: 'Ideal para proyectos largos (6+ meses)'
  },
  {
    id: 'upfront',
    title: 'Pago Adelantado',
    description: '100% al inicio del proyecto',
    icon: BanknotesIcon,
    popular: false,
    details: 'Descuento del 10% aplicado'
  },
  {
    id: 'completion',
    title: 'Al Completar',
    description: '100% al finalizar el proyecto',
    icon: CheckCircleIcon,
    popular: false,
    details: 'Solo para proyectos pequeños'
  }
];

export function BudgetStep() {
  const { state, dispatch } = useContact();
  const { updateStep } = useFormStep();
  
  const [formData, setFormData] = useState<BudgetInfoForm>({
    range: state.formData.budget?.range || 'under-5k',
    customAmount: state.formData.budget?.customAmount || undefined,
    currency: state.formData.budget?.currency || 'EUR',
    paymentPreference: state.formData.budget?.paymentPreference || 'milestone',
    hasExistingBudget: state.formData.budget?.hasExistingBudget || false,
  });

  const [showCustomInput, setShowCustomInput] = useState(formData.range === 'custom');

  // Real-time validation
  useEffect(() => {
    updateStep(3, formData);
  }, [formData, updateStep]);

  const handleRangeChange = (range: string) => {
    setFormData(prev => ({ ...prev, range: range as any }));
    setShowCustomInput(range === 'custom');
  };

  const selectedRange = budgetRanges.find(range => range.id === formData.range);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Ayúdanos a entender tu presupuesto para crear una propuesta que se ajuste a tus necesidades.
        </p>
      </motion.div>

      {/* Budget Range Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¿Cuál es tu rango de presupuesto?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetRanges.map((range, index) => (
            <motion.div
              key={range.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${formData.range === range.id
                  ? `border-${range.color}-500 bg-${range.color}-50 dark:bg-${range.color}-900/20 shadow-lg`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleRangeChange(range.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{range.icon}</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {range.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {range.description}
                  </p>
                  
                  {/* Recommended projects */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {range.recommended.map((item) => (
                      <span
                        key={item}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Selection indicator */}
              {formData.range === range.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <AnimatePresence>
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Especifica tu presupuesto
            </h3>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.customAmount || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      customAmount: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    placeholder="Ej: 25000"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    {formData.currency === 'EUR' ? (
                      <CurrencyEuroIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'EUR' | 'USD' }))}
                  className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EUR">EUR €</option>
                  <option value="USD">USD $</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¿Cómo prefieres realizar los pagos?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${formData.paymentPreference === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => setFormData(prev => ({ ...prev, paymentPreference: option.id as any }))}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Popular badge */}
              {option.popular && (
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
              
              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${formData.paymentPreference === option.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  <option.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {option.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {option.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {option.details}
                  </p>
                </div>
              </div>
              
              {/* Selection indicator */}
              {formData.paymentPreference === option.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircleIcon className="w-4 h-4 text-white" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Existing Budget Question */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¿Ya tienes un presupuesto aprobado?
        </h3>
        
        <div className="flex space-x-4">
          <motion.button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasExistingBudget: true }))}
            className={`
              flex-1 p-4 rounded-xl border-2 transition-all duration-200
              ${formData.hasExistingBudget
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Sí, tengo presupuesto
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                El presupuesto ya está aprobado
              </p>
            </div>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, hasExistingBudget: false }))}
            className={`
              flex-1 p-4 rounded-xl border-2 transition-all duration-200
              ${!formData.hasExistingBudget
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                Necesito propuesta
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Requiero una cotización detallada
              </p>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Budget Summary */}
      {selectedRange && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start space-x-3">
            <InformationCircleIcon className="w-6 h-6 text-blue-500 mt-1" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                Resumen de Presupuesto
              </h4>
              <div className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p><strong>Rango:</strong> {selectedRange.label}</p>
                {formData.customAmount && (
                  <p><strong>Monto específico:</strong> {formData.customAmount.toLocaleString()} {formData.currency}</p>
                )}
                <p><strong>Forma de pago:</strong> {paymentOptions.find(p => p.id === formData.paymentPreference)?.title}</p>
                <p><strong>Estado del presupuesto:</strong> {formData.hasExistingBudget ? 'Aprobado' : 'Pendiente de aprobación'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Indicator */}
      <motion.div
        initial={{ width: '50%' }}
        animate={{ width: '75%' }}
        transition={{ duration: 0.5 }}
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
      />
    </div>
  );
}
