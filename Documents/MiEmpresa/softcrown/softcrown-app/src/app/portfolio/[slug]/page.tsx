'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { PortfolioProvider, usePortfolio } from '@/contexts/PortfolioContext';
import ProjectDetail from '@/components/portfolio/ProjectDetail';
import { Project } from '@/types/portfolio';

const ProjectPageContent: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { state, loadProjects } = usePortfolio();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    const findProject = async () => {
      setLoading(true);
      
      // Ensure projects are loaded
      if (state.projects.length === 0) {
        await loadProjects();
      }

      // Find project by slug
      const foundProject = state.projects.find(p => p.slug === slug);
      
      if (foundProject) {
        setProject(foundProject);
        setNotFound(false);
        
        // Update document title and meta description
        document.title = `${foundProject.title} | SoftCrown Portfolio`;
        
        // Update meta description
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
          metaDescription.setAttribute('content', foundProject.seoDescription || foundProject.description);
        }
        
        // Update Open Graph meta tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
          ogTitle.setAttribute('content', foundProject.seoTitle || foundProject.title);
        }
        
        const ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
          ogDescription.setAttribute('content', foundProject.seoDescription || foundProject.description);
        }
        
        const ogImage = document.querySelector('meta[property="og:image"]');
        if (ogImage && foundProject.socialImage) {
          ogImage.setAttribute('content', foundProject.socialImage);
        } else if (ogImage && foundProject.images[0]) {
          ogImage.setAttribute('content', foundProject.images[0].url);
        }
        
        // Add structured data for SEO
        const structuredData = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": foundProject.title,
          "description": foundProject.description,
          "author": {
            "@type": "Organization",
            "name": "SoftCrown"
          },
          "dateCreated": foundProject.createdAt.toISOString(),
          "dateModified": foundProject.updatedAt.toISOString(),
          "image": foundProject.images.map(img => img.url),
          "url": window.location.href,
          "keywords": foundProject.tags.join(', '),
          "genre": foundProject.category.name,
          "inLanguage": "es",
          "isAccessibleForFree": true,
          "license": "https://creativecommons.org/licenses/by/4.0/",
          "publisher": {
            "@type": "Organization",
            "name": "SoftCrown",
            "url": "https://softcrown.com"
          }
        };
        
        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
          existingScript.remove();
        }
        
        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
        
      } else {
        setNotFound(true);
      }
      
      setLoading(false);
    };

    findProject();
  }, [slug, state.projects, loadProjects]);

  const handleBackToPortfolio = () => {
    router.push('/portfolio');
  };

  const handleRelatedProjectSelect = (relatedProject: Project) => {
    router.push(`/portfolio/${relatedProject.slug}`);
  };

  if (loading) {
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
            Cargando Proyecto
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparando los detalles del proyecto...
          </p>
        </motion.div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="text-8xl mb-6">🔍</div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Proyecto No Encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            El proyecto que buscas no existe o ha sido movido. 
            Verifica la URL o explora nuestros otros proyectos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBackToPortfolio}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              🏠 Volver al Portfolio
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              🌟 Ir al Inicio
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <ProjectDetail
          project={project}
          onBack={handleBackToPortfolio}
          onRelatedProjectSelect={handleRelatedProjectSelect}
        />
      </div>
    </div>
  );
};

const ProjectPage: React.FC = () => {
  return (
    <PortfolioProvider>
      <ProjectPageContent />
    </PortfolioProvider>
  );
};

export default ProjectPage;
