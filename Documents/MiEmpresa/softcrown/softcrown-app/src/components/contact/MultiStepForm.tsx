'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact, useFormStep } from '@/contexts/ContactContext';
import Button from '@/components/ui/Button';
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { BudgetStep } from './steps/BudgetStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { FormProgress } from './FormProgress';
import { FormNavigation } from './FormNavigation';
import { 
  CheckCircleIcon, 
  UserIcon, 
  BriefcaseIcon, 
  CurrencyEuroIcon,
  DocumentCheckIcon 
} from '@heroicons/react/24/outline';

const steps = [
  {
    id: 1,
    title: 'Información Personal',
    description: 'Cuéntanos sobre ti',
    icon: UserIcon,
    component: PersonalInfoStep,
  },
  {
    id: 2,
    title: 'Detalles del Proyecto',
    description: 'Describe tu proyecto',
    icon: BriefcaseIcon,
    component: ProjectDetailsStep,
  },
  {
    id: 3,
    title: 'Presupuesto',
    description: 'Define tu inversión',
    icon: CurrencyEuroIcon,
    component: BudgetStep,
  },
  {
    id: 4,
    title: 'Confirmación',
    description: 'Revisa y envía',
    icon: DocumentCheckIcon,
    component: ConfirmationStep,
  },
];

export function MultiStepForm() {
  const { state, dispatch } = useContact();
  const { currentStep, totalSteps, completedSteps, nextStep, prevStep } = useFormStep();
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentStepComponent = currentStepData?.component;

  const canProceed = () => {
    return completedSteps.includes(currentStep) || state.progress.isValid;
  };

  const handleNext = async () => {
    if (!canProceed()) return;
    
    setIsAnimating(true);
    
    // Auto-save progress
    dispatch({ type: 'SAVE_PROGRESS' });
    
    // Add haptic feedback if available
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
    
    setTimeout(() => {
      nextStep();
      setIsAnimating(false);
    }, 150);
  };

  const handlePrev = () => {
    setIsAnimating(true);
    setTimeout(() => {
      prevStep();
      setIsAnimating(false);
    }, 150);
  };

  const handleSubmit = async () => {
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      // Here you would typically send the form data to your API
      console.log('Submitting form:', state.formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add success notification
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'success',
          title: '¡Formulario enviado!',
          message: 'Gracias por contactarnos. Te responderemos pronto.',
        },
      });
      
      // Reset form
      dispatch({ type: 'RESET_FORM' });
      
      // Clear saved progress
      if (typeof window !== 'undefined') {
        localStorage.removeItem('contactFormProgress');
      }
      
    } catch (error) {
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          type: 'error',
          title: 'Error al enviar',
          message: 'Hubo un problema. Por favor, inténtalo de nuevo.',
        },
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Auto-save on form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (Object.keys(state.formData).length > 0) {
        dispatch({ type: 'SAVE_PROGRESS' });
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state.formData, dispatch]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Solicita tu Cotización
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Completa este formulario para recibir una propuesta personalizada
        </motion.p>
      </div>

      {/* Progress Indicator */}
      <FormProgress 
        steps={steps}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />

      {/* Form Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className={isAnimating ? 'pointer-events-none' : ''}
          >
            {/* Step Header */}
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mr-4">
                {currentStepData?.icon && (
                  <currentStepData.icon className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {currentStepData?.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {currentStepData?.description}
                </p>
              </div>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {CurrentStepComponent && <CurrentStepComponent />}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Form Errors */}
        {Object.keys(state.errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Por favor, corrige los siguientes errores:
            </h3>
            <ul className="text-sm text-red-600 dark:text-red-300 space-y-1">
              {Object.entries(state.errors).map(([key, error]) => (
                <li key={key}>• {error}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <FormNavigation
        currentStep={currentStep}
        totalSteps={totalSteps}
        canProceed={canProceed()}
        isSubmitting={state.isSubmitting}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
      />

      {/* Auto-save Indicator */}
      {state.progress.savedAt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-3 py-2 rounded-lg text-sm flex items-center space-x-2 shadow-lg"
        >
          <CheckCircleIcon className="w-4 h-4" />
          <span>Guardado automáticamente</span>
        </motion.div>
      )}
    </div>
  );
}
