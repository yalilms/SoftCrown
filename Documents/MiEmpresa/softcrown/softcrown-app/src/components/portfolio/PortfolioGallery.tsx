'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, Technology, ProjectCategory } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface PortfolioGalleryProps {
  onProjectSelect?: (project: Project) => void;
}

const ProjectCard: React.FC<{
  project: Project;
  index: number;
  onSelect: (project: Project) => void;
  onLike: (id: string) => void;
}> = ({ project, index, onSelect, onLike }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleImageLoad = () => setImageLoaded(true);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(project)}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      {/* Featured Badge */}
      {project.featured && (
        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
          ⭐ Destacado
        </div>
      )}

      {/* Image Container */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
        )}
        
        <img
          src={project.images[0]?.url || '/images/placeholder-project.jpg'}
          alt={project.images[0]?.alt || project.title}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-110",
            isHovered && "scale-110"
          )}
          onLoad={handleImageLoad}
        />
        
        {/* Overlay */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )} />
        
        {/* Quick Actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {project.liveUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(project.liveUrl, '_blank');
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    🌐 Ver Live
                  </button>
                )}
                {project.githubUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(project.githubUrl, '_blank');
                    }}
                    className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    💻 GitHub
                  </button>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onLike(project.id);
                }}
                className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors flex items-center gap-1"
              >
                ❤️ {project.likes}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${project.category.color}20`,
              color: project.category.color,
            }}
          >
            {project.category.icon} {project.category.name}
          </span>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>👁️ {project.views}</span>
            <span>❤️ {project.likes}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Technologies */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.slice(0, 4).map((tech) => (
            <span
              key={tech.id}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium flex items-center gap-1"
            >
              <span>{tech.icon}</span>
              <span>{tech.name}</span>
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-md text-xs">
              +{project.technologies.length - 4} más
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{project.client}</span>
          <span>{project.duration}</span>
        </div>
      </div>
    </motion.div>
  );
};

const FilterButton: React.FC<{
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  color?: string;
  icon?: string;
}> = ({ label, count, isActive, onClick, color, icon }) => (
  <button
    onClick={onClick}
    className={cn(
      "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2",
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
    )}
  >
    {icon && <span>{icon}</span>}
    <span>{label}</span>
    {count !== undefined && (
      <span className={cn(
        "px-2 py-0.5 rounded-full text-xs font-bold",
        isActive ? "bg-white/20 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
      )}>
        {count}
      </span>
    )}
  </button>
);

const PortfolioGallery: React.FC<PortfolioGalleryProps> = ({ onProjectSelect }) => {
  const {
    state,
    searchProjects,
    filterProjects,
    loadMoreProjects,
    likeProject,
    incrementViews
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTechs, setSelectedTechs] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'createdAt' | 'views' | 'likes' | 'title'>('createdAt');
  const [isLoading, setIsLoading] = useState(false);

  const observerRef = useRef<IntersectionObserver>();
  const lastProjectRef = useRef<HTMLDivElement>(null);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchProjects(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchProjects]);

  // Apply filters
  useEffect(() => {
    filterProjects({
      technologies: selectedTechs,
      categories: selectedCategories,
      featured: showFeaturedOnly ? true : null,
      sortBy,
      sortOrder: 'desc',
    });
  }, [selectedTechs, selectedCategories, showFeaturedOnly, sortBy, filterProjects]);

  // Infinite scroll
  const lastProjectElementRef = useCallback((node: HTMLDivElement) => {
    if (state.loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && state.hasMore) {
        setIsLoading(true);
        loadMoreProjects().finally(() => setIsLoading(false));
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [state.loading, state.hasMore, loadMoreProjects]);

  const handleProjectSelect = (project: Project) => {
    incrementViews(project.id);
    onProjectSelect?.(project);
  };

  const toggleTechnology = (techId: string) => {
    setSelectedTechs(prev =>
      prev.includes(techId)
        ? prev.filter(id => id !== techId)
        : [...prev, techId]
    );
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSelectedTechs([]);
    setSelectedCategories([]);
    setShowFeaturedOnly(false);
    setSearchQuery('');
  };

  const activeFiltersCount = selectedTechs.length + selectedCategories.length + (showFeaturedOnly ? 1 : 0);

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="text-gray-400 text-xl">🔍</span>
        </div>
        <input
          type="text"
          placeholder="Buscar proyectos, tecnologías, clientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-lg"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="space-y-6">
        {/* Quick Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <FilterButton
            label="Destacados"
            isActive={showFeaturedOnly}
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            icon="⭐"
            count={state.projects.filter(p => p.featured).length}
          />
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="createdAt">Más reciente</option>
              <option value="views">Más visto</option>
              <option value="likes">Más popular</option>
              <option value="title">Alfabético</option>
            </select>
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Limpiar filtros ({activeFiltersCount})
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Categorías</h3>
          <div className="flex flex-wrap gap-2">
            {state.categories.map((category) => (
              <FilterButton
                key={category.id}
                label={category.name}
                isActive={selectedCategories.includes(category.id)}
                onClick={() => toggleCategory(category.id)}
                icon={category.icon}
                count={state.projects.filter(p => p.category.id === category.id).length}
              />
            ))}
          </div>
        </div>

        {/* Technology Filters */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Tecnologías</h3>
          <div className="flex flex-wrap gap-2">
            {state.technologies.map((tech) => (
              <FilterButton
                key={tech.id}
                label={tech.name}
                isActive={selectedTechs.includes(tech.id)}
                onClick={() => toggleTechnology(tech.id)}
                icon={tech.icon}
                count={state.projects.filter(p => 
                  p.technologies.some(t => t.id === tech.id)
                ).length}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-600 dark:text-gray-300">
          {state.filteredProjects.length === 0 ? (
            'No se encontraron proyectos'
          ) : (
            `${state.filteredProjects.length} proyecto${state.filteredProjects.length !== 1 ? 's' : ''} encontrado${state.filteredProjects.length !== 1 ? 's' : ''}`
          )}
        </p>
        
        {state.loading && (
          <div className="flex items-center gap-2 text-primary">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Cargando...</span>
          </div>
        )}
      </div>

      {/* Projects Grid - Masonry Layout */}
      {state.filteredProjects.length > 0 ? (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {state.filteredProjects.map((project, index) => (
            <div
              key={project.id}
              ref={index === state.filteredProjects.length - 1 ? lastProjectElementRef : undefined}
              className="break-inside-avoid"
            >
              <ProjectCard
                project={project}
                index={index}
                onSelect={handleProjectSelect}
                onLike={likeProject}
              />
            </div>
          ))}
        </div>
      ) : !state.loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            No se encontraron proyectos
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
            Intenta ajustar los filtros o términos de búsqueda para encontrar lo que buscas.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            Limpiar todos los filtros
          </button>
        </div>
      )}

      {/* Loading More */}
      {isLoading && state.filteredProjects.length > 0 && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Cargando más proyectos...</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioGallery;
