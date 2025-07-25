'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
}

export function FormProgress({ steps, currentStep, completedSteps }: FormProgressProps) {
  return (
    <div className="mb-8">
      {/* Desktop Progress */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isPast = step.id < currentStep;
            
            return (
              <React.Fragment key={step.id}>
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <motion.div
                    className={`
                      relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                      ${isCurrent 
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
                        : isCompleted || isPast
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                      }
                    `}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isCompleted || isPast ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckIcon className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <step.icon className="w-6 h-6" />
                    )}
                    
                    {/* Current step pulse effect */}
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-blue-500"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                  
                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <motion.p
                      className={`
                        text-sm font-medium transition-colors duration-300
                        ${isCurrent 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : isCompleted || isPast
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                        }
                      `}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                    >
                      {step.title}
                    </motion.p>
                    <motion.p
                      className="text-xs text-gray-400 dark:text-gray-500 mt-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    >
                      {step.description}
                    </motion.p>
                  </div>
                </div>
                
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="flex-1 h-0.5 mx-4 mt-6"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  >
                    <div
                      className={`
                        h-full transition-all duration-500
                        ${step.id < currentStep || completedSteps.includes(step.id)
                          ? 'bg-gradient-to-r from-green-500 to-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                        }
                      `}
                    />
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Paso {currentStep} de {steps.length}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {Math.round((completedSteps.length / steps.length) * 100)}% completado
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="absolute top-0 left-0 w-full h-2 flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              
              return (
                <motion.div
                  key={step.id}
                  className={`
                    w-3 h-3 rounded-full border-2 bg-white dark:bg-gray-800 -mt-0.5 transition-all duration-300
                    ${isCurrent 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/25' 
                      : isCompleted
                      ? 'border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                    }
                  `}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                />
              );
            })}
          </div>
        </div>
        
        {/* Current Step Info */}
        <motion.div
          className="mt-4 text-center"
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {steps[currentStep - 1]?.description}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
