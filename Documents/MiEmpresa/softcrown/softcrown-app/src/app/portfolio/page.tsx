'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PortfolioProvider } from '@/contexts/PortfolioContext';
import PortfolioGallery from '@/components/portfolio/PortfolioGallery';
import ProjectDetail from '@/components/portfolio/ProjectDetail';
import { Project } from '@/types/portfolio';

type ViewMode = 'gallery' | 'detail';

const PortfolioPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('gallery');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView('detail');
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    setSelectedProject(null);
  };

  const handleRelatedProjectSelect = (project: Project) => {
    setSelectedProject(project);
    // Stay in detail view
  };

  return (
    <PortfolioProvider>
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
                Nuestro Portfolio
                <span className="block text-3xl md:text-4xl font-normal text-white/90 mt-2">
                  Proyectos que transforman ideas en realidad
                </span>
              </h1>
              
              <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
                Explora nuestra colección de proyectos web, aplicaciones móviles y soluciones 
                digitales. Cada proyecto cuenta una historia de innovación, creatividad y 
                excelencia técnica.
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎨</span>
                  <span>Diseño Innovador</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span>Alto Rendimiento</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <span>Tecnología Avanzada</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <AnimatePresence mode="wait">
            {currentView === 'gallery' && (
              <motion.div
                key="gallery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PortfolioGallery onProjectSelect={handleProjectSelect} />
              </motion.div>
            )}

            {currentView === 'detail' && selectedProject && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <ProjectDetail
                  project={selectedProject}
                  onBack={handleBackToGallery}
                  onRelatedProjectSelect={handleRelatedProjectSelect}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Call to Action */}
        {currentView === 'gallery' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="container mx-auto px-4 pb-12"
          >
            <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-8 text-white text-center">
              <h2 className="text-3xl font-bold mb-4">
                ¿Tienes un proyecto en mente?
              </h2>
              <p className="text-xl mb-6 text-white/90">
                Convierte tu idea en realidad con nuestro equipo de expertos. 
                Desde el concepto hasta el lanzamiento, te acompañamos en cada paso.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="bg-white text-primary px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  💬 Iniciar Proyecto
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-xl font-semibold hover:bg-white hover:text-primary transition-colors">
                  📞 Consulta Gratuita
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </PortfolioProvider>
  );
};

export default PortfolioPage;
