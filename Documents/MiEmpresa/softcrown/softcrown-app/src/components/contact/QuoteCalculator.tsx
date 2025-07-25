'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact } from '@/contexts/ContactContext';
import { Quote, QuoteItem } from '@/types/contact';
import { 
  CalculatorIcon,
  PlusIcon,
  MinusIcon,
  DocumentArrowDownIcon,
  ClockIcon,
  CurrencyEuroIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  timeEstimate: number; // in days
  features: ServiceFeature[];
}

interface ServiceFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  timeImpact: number; // additional days
  category: 'essential' | 'recommended' | 'premium';
  dependencies?: string[]; // feature IDs that must be selected first
}

const serviceCategories: ServiceCategory[] = [
  {
    id: 'web-development',
    name: 'Desarrollo Web',
    description: 'Sitios web y aplicaciones web',
    icon: '🌐',
    basePrice: 2500,
    timeEstimate: 15,
    features: [
      {
        id: 'responsive-design',
        name: 'Diseño Responsive',
        description: 'Adaptación a móviles y tablets',
        price: 500,
        timeImpact: 3,
        category: 'essential'
      },
      {
        id: 'cms-integration',
        name: 'Sistema de Gestión de Contenido',
        description: 'Panel de administración para gestionar contenido',
        price: 800,
        timeImpact: 5,
        category: 'recommended'
      },
      {
        id: 'seo-optimization',
        name: 'Optimización SEO',
        description: 'Optimización para motores de búsqueda',
        price: 600,
        timeImpact: 2,
        category: 'recommended'
      },
      {
        id: 'multilanguage',
        name: 'Multi-idioma',
        description: 'Soporte para múltiples idiomas',
        price: 1200,
        timeImpact: 7,
        category: 'premium'
      },
      {
        id: 'advanced-animations',
        name: 'Animaciones Avanzadas',
        description: 'Efectos visuales y micro-interacciones',
        price: 900,
        timeImpact: 4,
        category: 'premium'
      }
    ]
  },
  {
    id: 'mobile-app',
    name: 'Aplicación Móvil',
    description: 'Apps nativas o híbridas',
    icon: '📱',
    basePrice: 5000,
    timeEstimate: 30,
    features: [
      {
        id: 'push-notifications',
        name: 'Notificaciones Push',
        description: 'Sistema de notificaciones en tiempo real',
        price: 800,
        timeImpact: 3,
        category: 'recommended'
      },
      {
        id: 'offline-mode',
        name: 'Modo Offline',
        description: 'Funcionalidad sin conexión a internet',
        price: 1500,
        timeImpact: 8,
        category: 'premium'
      },
      {
        id: 'geolocation',
        name: 'Geolocalización',
        description: 'Servicios basados en ubicación',
        price: 700,
        timeImpact: 4,
        category: 'recommended'
      },
      {
        id: 'camera-integration',
        name: 'Integración de Cámara',
        description: 'Captura y procesamiento de imágenes',
        price: 600,
        timeImpact: 3,
        category: 'essential'
      }
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Tienda online completa',
    icon: '🛒',
    basePrice: 4000,
    timeEstimate: 25,
    features: [
      {
        id: 'payment-gateway',
        name: 'Pasarela de Pagos',
        description: 'Integración con sistemas de pago',
        price: 1000,
        timeImpact: 5,
        category: 'essential'
      },
      {
        id: 'inventory-management',
        name: 'Gestión de Inventario',
        description: 'Control de stock y productos',
        price: 1200,
        timeImpact: 6,
        category: 'recommended'
      },
      {
        id: 'advanced-analytics',
        name: 'Analytics Avanzados',
        description: 'Reportes detallados de ventas',
        price: 800,
        timeImpact: 3,
        category: 'premium'
      },
      {
        id: 'multi-vendor',
        name: 'Multi-vendedor',
        description: 'Marketplace con múltiples vendedores',
        price: 2500,
        timeImpact: 15,
        category: 'premium'
      }
    ]
  }
];

const packages = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Perfecto para empezar',
    discount: 0,
    color: 'blue',
    features: ['Diseño responsive', 'SEO básico', 'Soporte 3 meses']
  },
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Para empresas en crecimiento',
    discount: 10,
    color: 'purple',
    features: ['Todo lo básico', 'CMS avanzado', 'Analytics', 'Soporte 6 meses'],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solución completa',
    discount: 15,
    color: 'gold',
    features: ['Todo lo profesional', 'Integraciones custom', 'Soporte 12 meses', 'Consultoría']
  }
];

export function QuoteCalculator() {
  const { state, dispatch } = useContact();
  
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>(serviceCategories[0]);
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());
  const [selectedPackage, setSelectedPackage] = useState<string>('professional');
  const [customizations, setCustomizations] = useState<string>('');
  const [urgency, setUrgency] = useState<'normal' | 'fast' | 'urgent'>('normal');

  const calculatePrice = () => {
    let basePrice = selectedCategory.basePrice;
    let featuresPrice = 0;
    
    selectedFeatures.forEach(featureId => {
      const feature = selectedCategory.features.find(f => f.id === featureId);
      if (feature) {
        featuresPrice += feature.price;
      }
    });

    const subtotal = basePrice + featuresPrice;
    
    // Apply package discount
    const packageDiscount = packages.find(p => p.id === selectedPackage)?.discount || 0;
    const discountAmount = (subtotal * packageDiscount) / 100;
    
    // Apply urgency multiplier
    const urgencyMultiplier = urgency === 'urgent' ? 1.5 : urgency === 'fast' ? 1.25 : 1;
    
    const total = (subtotal - discountAmount) * urgencyMultiplier;
    
    return {
      basePrice,
      featuresPrice,
      subtotal,
      discountAmount,
      urgencyMultiplier,
      total: Math.round(total)
    };
  };

  const calculateTimeEstimate = () => {
    let baseTime = selectedCategory.timeEstimate;
    let additionalTime = 0;
    
    selectedFeatures.forEach(featureId => {
      const feature = selectedCategory.features.find(f => f.id === featureId);
      if (feature) {
        additionalTime += feature.timeImpact;
      }
    });

    const totalDays = baseTime + additionalTime;
    
    // Apply urgency impact
    const urgencyImpact = urgency === 'urgent' ? 0.7 : urgency === 'fast' ? 0.85 : 1;
    
    return Math.ceil(totalDays * urgencyImpact);
  };

  const handleFeatureToggle = (featureId: string) => {
    const newSelected = new Set(selectedFeatures);
    
    if (newSelected.has(featureId)) {
      newSelected.delete(featureId);
    } else {
      // Check dependencies
      const feature = selectedCategory.features.find(f => f.id === featureId);
      if (feature?.dependencies) {
        const missingDeps = feature.dependencies.filter(dep => !newSelected.has(dep));
        if (missingDeps.length > 0) {
          // Auto-select dependencies
          missingDeps.forEach(dep => newSelected.add(dep));
        }
      }
      newSelected.add(featureId);
    }
    
    setSelectedFeatures(newSelected);
  };

  const generateQuote = () => {
    const pricing = calculatePrice();
    const timeEstimate = calculateTimeEstimate();
    
    const quoteItems: QuoteItem[] = [
      {
        id: 'base-service',
        name: selectedCategory.name,
        description: selectedCategory.description,
        quantity: 1,
        unitPrice: selectedCategory.basePrice,
        totalPrice: selectedCategory.basePrice,
        category: 'development'
      },
      ...Array.from(selectedFeatures).map(featureId => {
        const feature = selectedCategory.features.find(f => f.id === featureId)!;
        return {
          id: featureId,
          name: feature.name,
          description: feature.description,
          quantity: 1,
          unitPrice: feature.price,
          totalPrice: feature.price,
          category: 'development' as const
        };
      })
    ];

    const quote: Quote = {
      id: `quote-${Date.now()}`,
      leadId: 'temp-lead',
      items: quoteItems,
      subtotal: pricing.subtotal,
      tax: pricing.total * 0.21, // 21% IVA
      discount: pricing.discountAmount,
      total: pricing.total + (pricing.total * 0.21),
      currency: 'EUR',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'draft',
      createdAt: new Date(),
      terms: 'Cotización válida por 30 días. Precios sujetos a cambios según especificaciones finales.',
      notes: customizations
    };

    dispatch({ type: 'ADD_QUOTE', payload: quote });
    dispatch({ type: 'SET_CURRENT_QUOTE', payload: quote });
    
    // Show success notification
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        type: 'success',
        title: 'Cotización generada',
        message: 'Tu cotización ha sido creada exitosamente'
      }
    });
  };

  const pricing = calculatePrice();
  const timeEstimate = calculateTimeEstimate();

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CalculatorIcon className="w-8 h-8 inline-block mr-2" />
          Calculadora de Cotizaciones
        </motion.h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-300"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          Configura tu proyecto y obtén una estimación instantánea
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Category Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Tipo de Proyecto
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceCategories.map((category) => (
                <motion.div
                  key={category.id}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedCategory.id === category.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedFeatures(new Set());
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      {category.description}
                    </p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-2">
                      Desde {category.basePrice.toLocaleString()}€
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Features Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Características Adicionales
            </h2>
            
            <div className="space-y-4">
              {selectedCategory.features.map((feature) => {
                const isSelected = selectedFeatures.has(feature.id);
                const categoryColors = {
                  essential: 'green',
                  recommended: 'blue',
                  premium: 'purple'
                };
                const color = categoryColors[feature.category];
                
                return (
                  <motion.div
                    key={feature.id}
                    className={`
                      p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                      ${isSelected
                        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }
                    `}
                    onClick={() => handleFeatureToggle(feature.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            ${isSelected 
                              ? `border-${color}-500 bg-${color}-500` 
                              : 'border-gray-300 dark:border-gray-600'
                            }
                          `}>
                            {isSelected && (
                              <CheckCircleIcon className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {feature.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          +{feature.price.toLocaleString()}€
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          +{feature.timeImpact} días
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Package Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Paquetes de Servicio
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  className={`
                    relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${selectedPackage === pkg.id
                      ? `border-${pkg.color}-500 bg-${pkg.color}-50 dark:bg-${pkg.color}-900/20`
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setSelectedPackage(pkg.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {pkg.description}
                    </p>
                    {pkg.discount > 0 && (
                      <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                        {pkg.discount}% descuento
                      </p>
                    )}
                    <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      {pkg.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Urgency & Customizations */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Configuración Adicional
            </h2>
            
            <div className="space-y-6">
              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Urgencia del Proyecto
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'normal', label: 'Normal', multiplier: '1x', color: 'blue' },
                    { id: 'fast', label: 'Rápido', multiplier: '1.25x', color: 'yellow' },
                    { id: 'urgent', label: 'Urgente', multiplier: '1.5x', color: 'red' }
                  ].map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setUrgency(option.id as any)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200
                        ${urgency === option.id
                          ? `border-${option.color}-500 bg-${option.color}-50 dark:bg-${option.color}-900/20`
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {option.multiplier}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Customizations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Requisitos Especiales
                </label>
                <textarea
                  value={customizations}
                  onChange={(e) => setCustomizations(e.target.value)}
                  placeholder="Describe cualquier requisito especial o personalización..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Price Summary Sidebar */}
        <div className="space-y-6">
          {/* Price Breakdown */}
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Resumen de Cotización
            </h3>
            
            <div className="space-y-4">
              {/* Base Price */}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Precio base:</span>
                <span className="font-semibold">{pricing.basePrice.toLocaleString()}€</span>
              </div>
              
              {/* Features Price */}
              {pricing.featuresPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Características:</span>
                  <span className="font-semibold">+{pricing.featuresPrice.toLocaleString()}€</span>
                </div>
              )}
              
              {/* Subtotal */}
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="font-semibold">{pricing.subtotal.toLocaleString()}€</span>
              </div>
              
              {/* Discount */}
              {pricing.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Descuento:</span>
                  <span>-{pricing.discountAmount.toLocaleString()}€</span>
                </div>
              )}
              
              {/* Urgency */}
              {pricing.urgencyMultiplier > 1 && (
                <div className="flex justify-between text-orange-600 dark:text-orange-400">
                  <span>Urgencia ({pricing.urgencyMultiplier}x):</span>
                  <span>+{Math.round((pricing.total - pricing.subtotal + pricing.discountAmount)).toLocaleString()}€</span>
                </div>
              )}
              
              {/* Tax */}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">IVA (21%):</span>
                <span className="font-semibold">+{Math.round(pricing.total * 0.21).toLocaleString()}€</span>
              </div>
              
              {/* Total */}
              <div className="flex justify-between border-t pt-4 text-lg">
                <span className="font-bold text-gray-900 dark:text-white">Total:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {Math.round(pricing.total + (pricing.total * 0.21)).toLocaleString()}€
                </span>
              </div>
            </div>
            
            {/* Time Estimate */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Tiempo Estimado
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {timeEstimate} días
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Aproximadamente {Math.ceil(timeEstimate / 7)} semanas
              </p>
            </div>
            
            {/* Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={generateQuote}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <DocumentArrowDownIcon className="w-5 h-5" />
                <span>Generar Cotización</span>
              </button>
              
              <button
                className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Solicitar Consulta
              </button>
            </div>
            
            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <InformationCircleIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  Esta es una estimación inicial. El precio final puede variar según los requisitos específicos del proyecto.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
