'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { 
  UserIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CheckCircleIcon,
  PencilIcon,
  ClockIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const timelineOptions = [
  { id: 'asap', label: 'Lo antes posible', description: 'Necesito comenzar inmediatamente' },
  { id: '1-month', label: '1 mes', description: 'Puedo esperar hasta 1 mes' },
  { id: '2-3-months', label: '2-3 meses', description: 'Tengo flexibilidad de tiempo' },
  { id: '6-months', label: '6+ meses', description: 'Es un proyecto a largo plazo' },
];

const contactPreferences = [
  {
    id: 'email',
    title: 'Email',
    description: 'Comunicación por correo electrónico',
    icon: EnvelopeIcon,
    color: 'blue'
  },
  {
    id: 'phone',
    title: 'Teléfono',
    description: 'Llamada telefónica',
    icon: PhoneIcon,
    color: 'green'
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Mensajería instantánea',
    icon: ChatBubbleLeftRightIcon,
    color: 'green'
  },
  {
    id: 'video-call',
    title: 'Videollamada',
    description: 'Reunión virtual',
    icon: VideoCameraIcon,
    color: 'purple'
  }
];

export function ConfirmationStep() {
  const { state, dispatch } = useContact();
  
  const [timeline, setTimeline] = useState(state.formData.timeline || '1-month');
  const [additionalInfo, setAdditionalInfo] = useState(state.formData.additionalInfo || '');
  const [preferredContact, setPreferredContact] = useState(state.formData.preferredContact || 'email');
  const [marketingConsent, setMarketingConsent] = useState(state.formData.marketingConsent || false);

  // Update form data when local state changes
  React.useEffect(() => {
    dispatch({
      type: 'SET_FORM_DATA',
      payload: {
        timeline,
        additionalInfo,
        preferredContact,
        marketingConsent,
      }
    });
  }, [timeline, additionalInfo, preferredContact, marketingConsent, dispatch]);

  const { personalInfo, projectDetails, budget } = state.formData;

  const getBudgetDisplay = () => {
    if (!budget) return 'No especificado';
    
    if (budget.range === 'custom' && budget.customAmount) {
      return `${budget.customAmount.toLocaleString()} ${budget.currency}`;
    }
    
    const ranges = {
      'under-5k': 'Menos de 5.000€',
      '5k-15k': '5.000€ - 15.000€',
      '15k-30k': '15.000€ - 30.000€',
      '30k-50k': '30.000€ - 50.000€',
      'over-50k': 'Más de 50.000€',
    };
    
    return ranges[budget.range as keyof typeof ranges] || budget.range;
  };

  const getPaymentDisplay = () => {
    if (!budget) return 'No especificado';
    
    const payments = {
      'milestone': 'Por Hitos',
      'monthly': 'Mensual',
      'upfront': 'Pago Adelantado',
      'completion': 'Al Completar',
    };
    
    return payments[budget.paymentPreference as keyof typeof payments] || budget.paymentPreference;
  };

  const getProjectTypeDisplay = () => {
    if (!projectDetails) return 'No especificado';
    
    const types = {
      'web-development': 'Desarrollo Web',
      'mobile-app': 'App Móvil',
      'ecommerce': 'E-commerce',
      'branding': 'Branding & Diseño',
      'consulting': 'Consultoría',
      'other': 'Otro',
    };
    
    return types[projectDetails.projectType as keyof typeof types] || projectDetails.projectType;
  };

  const SummarySection = ({ 
    title, 
    icon: Icon, 
    children, 
    onEdit 
  }: { 
    title: string; 
    icon: React.ComponentType<any>; 
    children: React.ReactNode; 
    onEdit: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <PencilIcon className="w-5 h-5" />
        </button>
      </div>
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Revisa toda la información antes de enviar tu solicitud. Nos pondremos en contacto contigo pronto.
        </p>
      </motion.div>

      {/* Summary Sections */}
      <div className="space-y-6">
        {/* Personal Information */}
        <SummarySection
          title="Información Personal"
          icon={UserIcon}
          onEdit={() => dispatch({ type: 'UPDATE_STEP', payload: { step: 1, data: {} } })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Nombre:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {personalInfo?.firstName} {personalInfo?.lastName}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {personalInfo?.email}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Teléfono:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {personalInfo?.phone}
              </p>
            </div>
            {personalInfo?.company && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Empresa:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {personalInfo.company}
                </p>
              </div>
            )}
          </div>
        </SummarySection>

        {/* Project Details */}
        <SummarySection
          title="Detalles del Proyecto"
          icon={BriefcaseIcon}
          onEdit={() => dispatch({ type: 'UPDATE_STEP', payload: { step: 2, data: {} } })}
        >
          <div className="space-y-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Tipo de Proyecto:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {getProjectTypeDisplay()}
              </p>
            </div>
            
            {projectDetails?.features && projectDetails.features.length > 0 && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Características:</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {projectDetails.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {projectDetails?.description && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Descripción:</span>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {projectDetails.description}
                </p>
              </div>
            )}
          </div>
        </SummarySection>

        {/* Budget Information */}
        <SummarySection
          title="Información de Presupuesto"
          icon={CurrencyEuroIcon}
          onEdit={() => dispatch({ type: 'UPDATE_STEP', payload: { step: 3, data: {} } })}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Rango de Presupuesto:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {getBudgetDisplay()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Forma de Pago:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {getPaymentDisplay()}
              </p>
            </div>
            <div className="md:col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Estado del Presupuesto:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {budget?.hasExistingBudget ? 'Presupuesto aprobado' : 'Requiere aprobación'}
              </p>
            </div>
          </div>
        </SummarySection>
      </div>

      {/* Timeline Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          ¿Cuál es tu timeline ideal?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timelineOptions.map((option) => (
            <motion.div
              key={option.id}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${timeline === option.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => setTimeline(option.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {option.description}
                  </p>
                </div>
                {timeline === option.id && (
                  <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Contact Preference */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¿Cómo prefieres que te contactemos?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactPreferences.map((option) => (
            <motion.div
              key={option.id}
              className={`
                p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${preferredContact === option.id
                  ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => setPreferredContact(option.id as any)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-center">
                <div className={`
                  w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-3
                  ${preferredContact === option.id
                    ? `bg-${option.color}-500 text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  <option.icon className="w-6 h-6" />
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {option.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                  {option.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Información Adicional (Opcional)
        </label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="¿Hay algo más que deberíamos saber sobre tu proyecto?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Marketing Consent */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="marketing-consent"
          checked={marketingConsent}
          onChange={(e) => setMarketingConsent(e.target.checked)}
          className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="marketing-consent" className="text-sm text-gray-600 dark:text-gray-300">
          Acepto recibir comunicaciones de marketing y actualizaciones sobre servicios relacionados. 
          Puedes cancelar la suscripción en cualquier momento.
        </label>
      </div>

      {/* Final Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border border-green-200 dark:border-green-800"
      >
        <div className="flex items-start space-x-3">
          <CheckCircleIcon className="w-6 h-6 text-green-500 mt-1" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100">
              ¡Listo para enviar!
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200 mt-1">
              Hemos revisado toda tu información. Al enviar este formulario, nuestro equipo 
              recibirá tu solicitud y te contactaremos dentro de las próximas 24 horas para 
              discutir tu proyecto en detalle.
            </p>
            <div className="mt-3 flex items-center space-x-4 text-xs text-green-700 dark:text-green-300">
              <span className="flex items-center">
                <CalendarDaysIcon className="w-4 h-4 mr-1" />
                Respuesta en 24h
              </span>
              <span className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Consulta gratuita
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ width: '75%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.5 }}
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
      />
    </div>
  );
}
