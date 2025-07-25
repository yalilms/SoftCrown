'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  PaperAirplaneIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSubmitting: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting,
  onNext,
  onPrev,
  onSubmit,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <motion.div
      className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Previous Button */}
      <div className="flex-1">
        {!isFirstStep && (
          <Button
            variant="outline"
            size="lg"
            onClick={onPrev}
            disabled={isSubmitting}
            className="group"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1" />
            Anterior
          </Button>
        )}
      </div>

      {/* Step Counter */}
      <div className="flex items-center space-x-2 mx-6">
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, index) => (
            <motion.div
              key={index}
              className={`
                w-2 h-2 rounded-full transition-all duration-300
                ${index + 1 <= currentStep 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
          {currentStep}/{totalSteps}
        </span>
      </div>

      {/* Next/Submit Button */}
      <div className="flex-1 flex justify-end">
        {isLastStep ? (
          <Button
            size="lg"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className="group relative overflow-hidden"
          >
            {isSubmitting ? (
              <>
                <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-5 h-5 mr-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                Enviar Solicitud
              </>
            )}
            
            {/* Shimmer effect */}
            {!isSubmitting && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  repeatDelay: 3,
                  ease: "easeInOut" 
                }}
              />
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canProceed || isSubmitting}
            className="group"
          >
            Siguiente
            <ChevronRightIcon className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>

      {/* Keyboard Shortcuts Hint */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <div className="text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-4">
          {!isFirstStep && (
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-1">
                ←
              </kbd>
              Anterior
            </span>
          )}
          {!isLastStep && canProceed && (
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-1">
                →
              </kbd>
              Siguiente
            </span>
          )}
          {isLastStep && canProceed && (
            <span className="flex items-center">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs mr-1">
                Enter
              </kbd>
              Enviar
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Keyboard navigation hook
export function useKeyboardNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting,
  onNext,
  onPrev,
  onSubmit,
}: FormNavigationProps) {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (event.key) {
        case 'ArrowLeft':
          if (currentStep > 1 && !isSubmitting) {
            event.preventDefault();
            onPrev();
          }
          break;
        case 'ArrowRight':
          if (currentStep < totalSteps && canProceed && !isSubmitting) {
            event.preventDefault();
            onNext();
          }
          break;
        case 'Enter':
          if (currentStep === totalSteps && canProceed && !isSubmitting) {
            event.preventDefault();
            onSubmit();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, totalSteps, canProceed, isSubmitting, onNext, onPrev, onSubmit]);
}
