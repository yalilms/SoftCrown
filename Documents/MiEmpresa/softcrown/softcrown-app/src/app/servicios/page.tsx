'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServicesProvider } from '@/contexts/ServicesContext';
import ServiceExplorer from '@/components/services/ServiceExplorer';
import ServiceConfigurator from '@/components/services/ServiceConfigurator';
import ComparisonTool from '@/components/services/ComparisonTool';
import { Service } from '@/types/services';
import { cn } from '@/lib/utils';

type ViewMode = 'explorer' | 'configurator' | 'comparison';

interface TabButtonProps {
  id: ViewMode;
  label: string;
  icon: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ 
  id, 
  label, 
  icon, 
  count, 
  isActive, 
  onClick 
}) => (
  <motion.button
    onClick={onClick}
    className={cn(
      "relative px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3",
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
    )}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="text-xl">{icon}</span>
    <span>{label}</span>
    {count !== undefined && count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bg-accent text-white text-xs px-2 py-1 rounded-full font-bold"
      >
        {count}
      </motion.span>
    )}
    
    {isActive && (
      <motion.div
        layoutId="activeTab"
        className="absolute inset-0 bg-primary rounded-xl -z-10"
        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      />
    )}
  </motion.button>
);

const ServicesPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('explorer');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentView('configurator');
  };

  const handleConfigureService = (service: Service) => {
    setSelectedService(service);
    setCurrentView('configurator');
  };

  const handleBackToExplorer = () => {
    setCurrentView('explorer');
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
          />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Cargando Servicios
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparando la mejor experiencia para ti...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <ServicesProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-accent to-primary py-20">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
            <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </div>
          
          <div className="relative container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Servicios de Desarrollo
                <span className="block text-3xl md:text-4xl font-normal text-white/90 mt-2">
                  Encuentra la solución perfecta para tu proyecto
                </span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Explora nuestros servicios, configura tu proyecto paso a paso y compara 
                opciones para tomar la mejor decisión. Todo con precios transparentes y 
                estimaciones en tiempo real.
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>Configuración Personalizada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <span>Comparación Inteligente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <span>Precios Transparentes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <ServicesProvider>
            {({ state }) => (
              <>
                {/* Navigation Tabs */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-wrap justify-center gap-4 mb-12"
                >
                  <TabButton
                    id="explorer"
                    label="Explorar Servicios"
                    icon="🔍"
                    isActive={currentView === 'explorer'}
                    onClick={() => setCurrentView('explorer')}
                  />
                  <TabButton
                    id="configurator"
                    label="Configurador"
                    icon="⚙️"
                    isActive={currentView === 'configurator'}
                    onClick={() => setCurrentView('configurator')}
                  />
                  <TabButton
                    id="comparison"
                    label="Comparar"
                    icon="⚖️"
                    count={state.selectedServices.length}
                    isActive={currentView === 'comparison'}
                    onClick={() => setCurrentView('comparison')}
                  />
                </motion.div>

                {/* Content Area */}
                <motion.div
                  layout
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <AnimatePresence mode="wait">
                    {currentView === 'explorer' && (
                      <motion.div
                        key="explorer"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="p-8"
                      >
                        <ServiceExplorer
                          onServiceSelect={handleServiceSelect}
                          onConfigureService={handleConfigureService}
                        />
                      </motion.div>
                    )}

                    {currentView === 'configurator' && (
                      <motion.div
                        key="configurator"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="p-8"
                      >
                        <div className="mb-6">
                          <button
                            onClick={handleBackToExplorer}
                            className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium"
                          >
                            <span>←</span>
                            Volver al Explorador
                          </button>
                        </div>
                        <ServiceConfigurator
                          selectedService={selectedService}
                          onBack={handleBackToExplorer}
                        />
                      </motion.div>
                    )}

                    {currentView === 'comparison' && (
                      <motion.div
                        key="comparison"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="p-8"
                      >
                        <ComparisonTool
                          onServiceSelect={handleServiceSelect}
                          onConfigureService={handleConfigureService}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {state.services.length}+
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Servicios Disponibles
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-accent mb-2">
                      {state.selectedServices.length}
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      En Comparación
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      24/7
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Soporte Técnico
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      100%
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Garantía de Calidad
                    </div>
                  </div>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-12 text-center"
                >
                  <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">
                      ¿Necesitas ayuda personalizada?
                    </h2>
                    <p className="text-xl mb-6 text-white/90">
                      Nuestro equipo de expertos está listo para ayudarte a encontrar 
                      la solución perfecta para tu proyecto.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                      <button className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                        💬 Consulta Gratuita
                      </button>
                      <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors">
                        📞 Llamar Ahora
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </ServicesProvider>
        </div>
      </div>
    </ServicesProvider>
  );
};

export default ServicesPage;
