'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '@/contexts/ServicesContext';
import { Service, Feature } from '@/types/services';
import { cn } from '@/lib/utils';

interface ComparisonToolProps {
  onServiceSelect?: (service: Service) => void;
  onConfigureService?: (service: Service) => void;
}

const ComparisonTool: React.FC<ComparisonToolProps> = ({
  onServiceSelect,
  onConfigureService,
}) => {
  const { 
    state, 
    removeFromComparison, 
    clearComparison,
    getRecommendations 
  } = useServices();

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { selectedServices } = state;

  // Get all unique features across selected services
  const allFeatures = useMemo(() => {
    const featuresMap = new Map<string, Feature>();
    
    selectedServices.forEach(service => {
      service.features.forEach(feature => {
        if (!featuresMap.has(feature.id)) {
          featuresMap.set(feature.id, feature);
        }
      });
    });

    return Array.from(featuresMap.values());
  }, [selectedServices]);

  // Calculate price differences
  const priceAnalysis = useMemo(() => {
    if (selectedServices.length < 2) return null;

    const prices = selectedServices.map(s => s.basePrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;

    return {
      min: minPrice,
      max: maxPrice,
      average: avgPrice,
      difference: maxPrice - minPrice,
      savings: selectedServices.map(service => ({
        serviceId: service.id,
        savings: maxPrice - service.basePrice,
        percentage: ((maxPrice - service.basePrice) / maxPrice) * 100,
      })),
    };
  }, [selectedServices]);

  // Get recommendations based on first service
  const recommendations = useMemo(() => {
    if (selectedServices.length === 0) return [];
    return getRecommendations(selectedServices[0]);
  }, [selectedServices, getRecommendations]);

  // Feature comparison matrix
  const getFeatureStatus = (service: Service, featureId: string) => {
    const feature = service.features.find(f => f.id === featureId);
    if (!feature) return 'not-available';
    if (feature.included) return 'included';
    return 'optional';
  };

  // Handle feature filter
  const toggleFeatureFilter = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId)
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Filter features based on selection
  const filteredFeatures = selectedFeatures.length > 0 
    ? allFeatures.filter(f => selectedFeatures.includes(f.id))
    : allFeatures;

  if (selectedServices.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚖️</div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Herramienta de Comparación
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Selecciona servicios desde el explorador para compararlos lado a lado y 
          encontrar la mejor opción para tu proyecto.
        </p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-blue-800 dark:text-blue-200 text-sm">
            💡 Puedes comparar hasta 3 servicios simultáneamente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Comparación de Servicios
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Comparando {selectedServices.length} servicio{selectedServices.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            💡 Recomendaciones
          </button>
          <button
            onClick={clearComparison}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            Limpiar Todo
          </button>
        </div>
      </div>

      {/* Price Analysis */}
      {priceAnalysis && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📊 Análisis de Precios
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">Precio Mínimo</div>
              <div className="text-xl font-bold text-green-600">
                ${priceAnalysis.min.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">Precio Máximo</div>
              <div className="text-xl font-bold text-red-600">
                ${priceAnalysis.max.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">Promedio</div>
              <div className="text-xl font-bold text-blue-600">
                ${Math.round(priceAnalysis.average).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 dark:text-gray-300">Diferencia</div>
              <div className="text-xl font-bold text-purple-600">
                ${priceAnalysis.difference.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            <strong>Ahorro potencial:</strong> Hasta ${priceAnalysis.difference.toLocaleString()} 
            eligiendo la opción más económica
          </div>
        </div>
      )}

      {/* Feature Filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🎛️ Filtrar por Características
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {allFeatures.map(feature => (
            <button
              key={feature.id}
              onClick={() => toggleFeatureFilter(feature.id)}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedFeatures.includes(feature.id)
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              {feature.icon} {feature.name}
            </button>
          ))}
        </div>
        
        {selectedFeatures.length > 0 && (
          <button
            onClick={() => setSelectedFeatures([])}
            className="mt-3 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Característica
                </th>
                {selectedServices.map(service => (
                  <th key={service.id} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white min-w-48">
                    <div className="space-y-2">
                      <div className="font-bold">{service.name}</div>
                      <div className="text-2xl font-bold text-primary">
                        ${service.basePrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        ⭐ {service.rating} ({service.reviewCount})
                      </div>
                      <button
                        onClick={() => removeFromComparison(service.id)}
                        className="text-red-500 hover:text-red-700 text-xs"
                      >
                        ✕ Remover
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* Basic Info Rows */}
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  ⏱️ Duración
                </td>
                {selectedServices.map(service => (
                  <td key={service.id} className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    {service.duration}
                  </td>
                ))}
              </tr>
              
              <tr className="bg-gray-50 dark:bg-gray-700/50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  🎯 Dificultad
                </td>
                {selectedServices.map(service => (
                  <td key={service.id} className="px-6 py-4 text-center text-sm">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      service.difficulty === 'basic' && "bg-green-100 text-green-800",
                      service.difficulty === 'intermediate' && "bg-yellow-100 text-yellow-800",
                      service.difficulty === 'advanced' && "bg-orange-100 text-orange-800",
                      service.difficulty === 'enterprise' && "bg-red-100 text-red-800"
                    )}>
                      {service.difficulty}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Feature Rows */}
              {filteredFeatures.map((feature, index) => (
                <tr key={feature.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700/50'}>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>{feature.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {feature.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {feature.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  {selectedServices.map(service => {
                    const status = getFeatureStatus(service, feature.id);
                    const serviceFeature = service.features.find(f => f.id === feature.id);
                    
                    return (
                      <td key={service.id} className="px-6 py-4 text-center text-sm">
                        {status === 'included' && (
                          <div className="flex flex-col items-center">
                            <span className="text-green-500 text-lg">✓</span>
                            <span className="text-xs text-green-600">Incluido</span>
                          </div>
                        )}
                        {status === 'optional' && serviceFeature && (
                          <div className="flex flex-col items-center">
                            <span className="text-blue-500 text-lg">+</span>
                            <span className="text-xs text-blue-600">
                              ${serviceFeature.price?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {status === 'not-available' && (
                          <div className="flex flex-col items-center">
                            <span className="text-gray-400 text-lg">✕</span>
                            <span className="text-xs text-gray-400">No disponible</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        {selectedServices.map(service => (
          <div key={service.id} className="flex gap-2">
            <button
              onClick={() => onServiceSelect?.(service)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ver {service.name}
            </button>
            <button
              onClick={() => onConfigureService?.(service)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Configurar {service.name}
            </button>
          </div>
        ))}
      </div>

      {/* Recommendations Panel */}
      <AnimatePresence>
        {showRecommendations && recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
              💡 Servicios Recomendados
            </h3>
            <p className="text-purple-800 dark:text-purple-200 text-sm mb-4">
              Basado en tu selección de "{selectedServices[0]?.name}", estos servicios también podrían interesarte:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map(service => (
                <div key={service.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {service.name}
                    </h4>
                    <div className="text-primary font-bold text-sm">
                      ${service.basePrice.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                    {service.shortDescription}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      ⭐ {service.rating} ({service.reviewCount})
                    </div>
                    <button
                      onClick={() => onServiceSelect?.(service)}
                      className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                    >
                      Ver detalles →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Summary */}
      {selectedServices.length > 1 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            🎯 Recomendación del Sistema
          </h3>
          
          {(() => {
            const bestValue = selectedServices.reduce((best, current) => {
              const bestScore = (best.rating * 20) + (best.reviewCount * 0.1) - (best.basePrice * 0.0001);
              const currentScore = (current.rating * 20) + (current.reviewCount * 0.1) - (current.basePrice * 0.0001);
              return currentScore > bestScore ? current : best;
            });

            const cheapest = selectedServices.reduce((min, current) => 
              current.basePrice < min.basePrice ? current : min
            );

            const premium = selectedServices.reduce((max, current) => 
              current.basePrice > max.basePrice ? current : max
            );

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="font-semibold text-blue-900 dark:text-blue-100">
                    Mejor Relación Calidad-Precio
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-200">
                    {bestValue.name}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-semibold text-green-900 dark:text-green-100">
                    Más Económico
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-200">
                    {cheapest.name}
                  </div>
                </div>
                
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl mb-2">⭐</div>
                  <div className="font-semibold text-purple-900 dark:text-purple-100">
                    Premium
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-200">
                    {premium.name}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ComparisonTool;
