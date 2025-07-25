'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '@/contexts/ServicesContext';
import { Service, Feature, AddOn, ServiceConfiguration } from '@/types/services';
import { cn } from '@/lib/utils';

interface ServiceConfiguratorProps {
  service: Service;
  onComplete?: (configuration: ServiceConfiguration) => void;
  onCancel?: () => void;
}

type ConfigStep = 'overview' | 'features' | 'addons' | 'review';

const ServiceConfigurator: React.FC<ServiceConfiguratorProps> = ({
  service,
  onComplete,
  onCancel,
}) => {
  const { calculatePrice, estimateDuration, configureService } = useServices();
  
  const [currentStep, setCurrentStep] = useState<ConfigStep>('overview');
  const [selectedFeatures, setSelectedFeatures] = useState<Feature[]>(
    service.features.filter(f => f.included)
  );
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [customizations, setCustomizations] = useState({
    projectName: '',
    description: '',
    timeline: 'standard',
    priority: 'normal',
  });

  const steps = [
    { id: 'overview' as ConfigStep, title: 'Resumen', icon: '📋' },
    { id: 'features' as ConfigStep, title: 'Características', icon: '⚙️' },
    { id: 'addons' as ConfigStep, title: 'Adicionales', icon: '🚀' },
    { id: 'review' as ConfigStep, title: 'Revisión', icon: '✅' },
  ];

  const totalPrice = useMemo(() => {
    return calculatePrice(service, selectedFeatures, selectedAddOns);
  }, [service, selectedFeatures, selectedAddOns, calculatePrice]);

  const estimatedDuration = useMemo(() => {
    return estimateDuration(service, selectedFeatures, selectedAddOns);
  }, [service, selectedFeatures, selectedAddOns, estimateDuration]);

  const toggleFeature = (feature: Feature) => {
    if (feature.included) return;
    
    setSelectedFeatures(prev => {
      const isSelected = prev.some(f => f.id === feature.id);
      return isSelected 
        ? prev.filter(f => f.id !== feature.id)
        : [...prev, feature];
    });
  };

  const toggleAddOn = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(a => a.id === addOn.id);
      return isSelected 
        ? prev.filter(a => a.id !== addOn.id)
        : [...prev, addOn];
    });
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  const handleComplete = () => {
    const configuration: ServiceConfiguration = {
      service,
      selectedFeatures,
      selectedAddOns,
      customizations,
      totalPrice,
      estimatedDuration,
    };

    configureService(configuration);
    onComplete?.(configuration);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {service.name}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                {service.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-lg font-semibold">Precio Base</div>
                <div className="text-2xl font-bold text-primary">
                  ${service.basePrice.toLocaleString()}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                <div className="text-2xl mb-2">⏱️</div>
                <div className="text-lg font-semibold">Duración</div>
                <div className="text-xl font-bold text-primary">
                  {service.duration}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 text-center">
                <div className="text-2xl mb-2">⭐</div>
                <div className="text-lg font-semibold">Calificación</div>
                <div className="text-xl font-bold text-primary">
                  {service.rating} ({service.reviewCount})
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nombre del Proyecto
                </label>
                <input
                  type="text"
                  value={customizations.projectName}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, projectName: e.target.value }))}
                  placeholder="Ej: Mi tienda online"
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Descripción del Proyecto
                </label>
                <textarea
                  value={customizations.description}
                  onChange={(e) => setCustomizations(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu proyecto..."
                  rows={4}
                  className="w-full px-4 py-3 border rounded-lg"
                />
              </div>
            </div>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Selecciona las Características</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Personaliza tu servicio con las funcionalidades que necesitas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {service.features.map((feature) => {
                const isSelected = selectedFeatures.some(f => f.id === feature.id);
                const isIncluded = feature.included;

                return (
                  <div
                    key={feature.id}
                    className={cn(
                      "p-4 border-2 rounded-xl cursor-pointer transition-all",
                      isSelected ? "border-primary bg-primary/5" : "border-gray-200",
                      isIncluded && "border-green-500 bg-green-50"
                    )}
                    onClick={() => !isIncluded && toggleFeature(feature)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{feature.icon}</span>
                          <h3 className="font-semibold">{feature.name}</h3>
                          {isIncluded && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Incluido
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {feature.description}
                        </p>
                        {feature.price && !isIncluded && (
                          <div className="text-lg font-bold text-primary">
                            +${feature.price.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className={cn(
                          "w-6 h-6 border-2 rounded-full flex items-center justify-center",
                          isSelected || isIncluded
                            ? "border-primary bg-primary"
                            : "border-gray-300"
                        )}>
                          {(isSelected || isIncluded) && <span className="text-white text-sm">✓</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'addons':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Servicios Adicionales</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Mejora tu proyecto con servicios complementarios
              </p>
            </div>

            {service.addOns.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2">
                  No hay servicios adicionales disponibles
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.addOns.map((addOn) => {
                  const isSelected = selectedAddOns.some(a => a.id === addOn.id);

                  return (
                    <div
                      key={addOn.id}
                      className={cn(
                        "p-6 border-2 rounded-xl cursor-pointer transition-all",
                        isSelected ? "border-primary bg-primary/5" : "border-gray-200"
                      )}
                      onClick={() => toggleAddOn(addOn)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2">
                            {addOn.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {addOn.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary mb-1">
                            ${addOn.price.toLocaleString()}
                          </div>
                          <div className={cn(
                            "w-6 h-6 border-2 rounded-full flex items-center justify-center",
                            isSelected ? "border-primary bg-primary" : "border-gray-300"
                          )}>
                            {isSelected && <span className="text-white text-sm">✓</span>}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Incluye:</h4>
                        <div className="grid grid-cols-1 gap-1">
                          {addOn.features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <span className="text-green-500">✓</span>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Revisión Final</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Confirma los detalles de tu configuración
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Resumen del Proyecto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Información General</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Servicio:</strong> {service.name}</div>
                    <div><strong>Proyecto:</strong> {customizations.projectName || 'Sin nombre'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Precio y Duración</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Precio Base:</strong> ${service.basePrice.toLocaleString()}</div>
                    <div className="text-lg font-bold text-primary">
                      <strong>Total:</strong> ${totalPrice.toLocaleString()}
                    </div>
                    <div><strong>Duración:</strong> {estimatedDuration}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">
                Características ({selectedFeatures.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedFeatures.map((feature) => (
                  <div key={feature.id} className="flex items-center gap-2 text-sm">
                    <span>{feature.icon}</span>
                    <span>{feature.name}</span>
                    {feature.price && !feature.included && (
                      <span className="text-primary">+${feature.price.toLocaleString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {selectedAddOns.length > 0 && (
              <div className="bg-white dark:bg-gray-800 border rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Servicios Adicionales ({selectedAddOns.length})
                </h3>
                <div className="space-y-3">
                  {selectedAddOns.map((addOn) => (
                    <div key={addOn.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{addOn.name}</div>
                        <div className="text-sm text-gray-600">{addOn.description}</div>
                      </div>
                      <div className="text-primary font-semibold">
                        ${addOn.price.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold",
                    isActive ? "bg-primary text-white" :
                    isCompleted ? "bg-green-500 text-white" :
                    "bg-gray-200 text-gray-500"
                  )}>
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div className="text-sm font-medium mt-2 text-center">
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "flex-1 h-1 mx-4",
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border p-8 mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Price Summary */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Precio Total</h3>
            <p className="text-sm text-gray-600">Duración estimada: {estimatedDuration}</p>
          </div>
          <div className="text-3xl font-bold text-primary">
            ${totalPrice.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          {currentStepIndex > 0 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Anterior
            </button>
          )}
        </div>

        <div>
          {currentStep === 'review' ? (
            <button
              onClick={handleComplete}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Confirmar Configuración
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={currentStep === 'overview' && !customizations.projectName.trim()}
              className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceConfigurator;
