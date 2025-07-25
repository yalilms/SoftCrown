'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, CodeSnippet } from '@/types/portfolio';
import Lightbox from './Lightbox';
import { cn } from '@/lib/utils';

interface ProjectDetailProps {
  project: Project;
  onBack?: () => void;
  onRelatedProjectSelect?: (project: Project) => void;
}

const CodeBlock: React.FC<{ snippet: CodeSnippet }> = ({ snippet }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">{snippet.title}</span>
          <span className="text-gray-400 text-sm">({snippet.language})</span>
        </div>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
        >
          {copied ? '✅ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <div className="p-4">
        {snippet.description && (
          <p className="text-gray-300 text-sm mb-4">{snippet.description}</p>
        )}
        <pre className="text-gray-100 text-sm overflow-x-auto">
          <code>{snippet.code}</code>
        </pre>
      </div>
    </div>
  );
};

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onBack,
  onRelatedProjectSelect
}) => {
  const { state, likeProject, incrementViews } = usePortfolio();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'gallery' | 'code' | 'specs'>('overview');

  useEffect(() => {
    incrementViews(project.id);
  }, [project.id, incrementViews]);

  const relatedProjects = state.projects
    .filter(p => 
      p.id !== project.id && 
      (p.category.id === project.category.id || 
       p.technologies.some(tech => project.technologies.some(pTech => pTech.id === tech.id)))
    )
    .slice(0, 3);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === project.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? project.images.length - 1 : prev - 1
    );
  };

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📋' },
    { id: 'gallery', label: 'Galería', icon: '🖼️', count: project.images.length },
    { id: 'code', label: 'Código', icon: '💻', count: project.codeSnippets.length },
    { id: 'specs', label: 'Especificaciones', icon: '⚙️' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 top-0 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors font-medium"
          >
            <span>←</span>
            Volver al Portfolio
          </button>
        )}
        
        <div className="text-center pt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4"
          >
            <span>{project.category.icon}</span>
            <span>{project.category.name}</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
          >
            {project.title}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8"
          >
            {project.description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mb-8"
          >
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                🌐 Ver Proyecto Live
              </a>
            )}
            
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                💻 Ver Código
              </a>
            )}
            
            <button
              onClick={() => likeProject(project.id)}
              className="px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              ❤️ Me Gusta ({project.likes})
            </button>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="flex bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2",
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
                )}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Hero Image */}
            {project.images[0] && (
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={project.images[0].url}
                  alt={project.images[0].alt}
                  className="w-full h-96 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  onClick={() => openLightbox(0)}
                />
              </div>
            )}

            {/* Project Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Descripción del Proyecto
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {project.longDescription}
                  </p>
                </div>

                {/* Features */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    🚀 Características Principales
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {project.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800"
                      >
                        <span className="text-green-500 text-xl">✅</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {feature}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Project Details */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    📊 Detalles del Proyecto
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Cliente</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {project.client}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Duración</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {project.duration}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Presupuesto</span>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {project.budget}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Technologies */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    🛠️ Tecnologías
                  </h3>
                  <div className="space-y-3">
                    {project.technologies.map((tech) => (
                      <div
                        key={tech.id}
                        className="px-3 py-2 rounded-xl font-medium flex items-center gap-2"
                        style={{
                          backgroundColor: `${tech.color}20`,
                          color: tech.color,
                        }}
                      >
                        <span>{tech.icon}</span>
                        <span>{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {project.images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <span className="text-white text-2xl">🔍</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'code' && (
          <motion.div
            key="code"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {project.codeSnippets.length > 0 ? (
              project.codeSnippets.map((snippet, index) => (
                <motion.div
                  key={snippet.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  <CodeBlock snippet={snippet} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💻</div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No hay código disponible
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Los snippets de código para este proyecto no están disponibles públicamente.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'specs' && (
          <motion.div
            key="specs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {/* Technical Specifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                ⚙️ Especificaciones Técnicas
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Arquitectura</span>
                  <span className="font-semibold text-gray-900 dark:text-white">SPA</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Responsive</span>
                  <span className="font-semibold text-green-600">✅ Sí</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600 dark:text-gray-400">PWA</span>
                  <span className="font-semibold text-green-600">✅ Sí</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                📈 Métricas de Rendimiento
              </h3>
              <div className="space-y-6">
                {[
                  { label: 'Performance', score: 95 },
                  { label: 'Accessibility', score: 100 },
                  { label: 'Best Practices', score: 92 },
                  { label: 'SEO', score: 100 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 dark:text-gray-400">{metric.label}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {metric.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="h-2 rounded-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            🔗 Proyectos Relacionados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((relatedProject) => (
              <motion.div
                key={relatedProject.id}
                whileHover={{ y: -4 }}
                className="group cursor-pointer"
                onClick={() => onRelatedProjectSelect?.(relatedProject)}
              >
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={relatedProject.images[0]?.url || '/images/placeholder-project.jpg'}
                      alt={relatedProject.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {relatedProject.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {relatedProject.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        images={project.images}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNext={nextImage}
        onPrevious={previousImage}
        projectTitle={project.title}
      />
    </div>
  );
};

export default ProjectDetail;
