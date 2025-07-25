'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '@/contexts/ServicesContext';
import { Service, ServiceCategory, DifficultyLevel } from '@/types/services';
import { cn } from '@/lib/utils';

interface ServiceExplorerProps {
  onServiceSelect?: (service: Service) => void;
  onCompareService?: (service: Service) => void;
}

const ServiceExplorer: React.FC<ServiceExplorerProps> = ({
  onServiceSelect,
  onCompareService,
}) => {
  const { 
    state, 
    updateFilters, 
    searchServices, 
    sortServices,
    addToComparison,
    removeFromComparison 
  } = useServices();

  const [searchQuery, setSearchQuery] = useState(state.searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<string[]>([]);

  // Category options
  const categoryOptions: { value: ServiceCategory; label: string; icon: string }[] = [
    { value: 'desarrollo-web', label: 'Desarrollo Web', icon: '💻' },
    { value: 'diseno-ui-ux', label: 'Diseño UI/UX', icon: '🎨' },
    { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    { value: 'mantenimiento', label: 'Mantenimiento', icon: '🔧' },
    { value: 'seo', label: 'SEO', icon: '🔍' },
    { value: 'mobile-apps', label: 'Apps Móviles', icon: '📱' },
    { value: 'consultoria', label: 'Consultoría', icon: '💡' },
  ];

  // Difficulty options
  const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
    { value: 'basic', label: 'Básico', color: 'bg-green-500' },
    { value: 'intermediate', label: 'Intermedio', color: 'bg-yellow-500' },
    { value: 'advanced', label: 'Avanzado', color: 'bg-orange-500' },
    { value: 'enterprise', label: 'Enterprise', color: 'bg-red-500' },
  ];

  // Sort options
  const sortOptions = [
    { value: 'popularity', label: 'Popularidad' },
    { value: 'price', label: 'Precio' },
    { value: 'rating', label: 'Calificación' },
    { value: 'name', label: 'Nombre' },
  ];

  // Generate autocomplete suggestions
  const generateSuggestions = useCallback((query: string) => {
    if (!query || query.length < 2) {
      setAutocompleteSuggestions([]);
      return;
    }

    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    state.services.forEach(service => {
      // Add service names
      if (service.name.toLowerCase().includes(lowerQuery)) {
        suggestions.add(service.name);
      }

      // Add tags
      service.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });

      // Add technologies
      service.technologies.forEach(tech => {
        if (tech.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tech);
        }
      });
    });

    setAutocompleteSuggestions(Array.from(suggestions).slice(0, 5));
  }, [state.services]);

  // Handle search input
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    generateSuggestions(query);
    
    // Debounced search
    const timeoutId = setTimeout(() => {
      searchServices(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  // Handle filter changes
  const handleCategoryFilter = (category: ServiceCategory) => {
    const newCategories = state.filters.categories.includes(category)
      ? state.filters.categories.filter(c => c !== category)
      : [...state.filters.categories, category];
    
    updateFilters({ categories: newCategories });
  };

  const handleDifficultyFilter = (difficulty: DifficultyLevel) => {
    const newDifficulties = state.filters.difficulty.includes(difficulty)
      ? state.filters.difficulty.filter(d => d !== difficulty)
      : [...state.filters.difficulty, difficulty];
    
    updateFilters({ difficulty: newDifficulties });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    updateFilters({ priceRange: range });
  };

  const handleRatingFilter = (rating: number) => {
    updateFilters({ rating });
  };

  // Handle sorting
  const handleSort = (sortBy: typeof state.sortBy) => {
    const newOrder = state.sortBy === sortBy && state.sortOrder === 'desc' ? 'asc' : 'desc';
    sortServices(sortBy, newOrder);
  };

  // Service card component
  const ServiceCard: React.FC<{ service: Service; index: number }> = ({ service, index }) => {
    const isInComparison = state.selectedServices.some(s => s.id === service.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 group"
      >
        {/* Service Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                {service.popular && (
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    Popular
                  </span>
                )}
                {service.featured && (
                  <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                    Destacado
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {service.shortDescription}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <span>⭐</span>
                  <span>{service.rating}</span>
                  <span>({service.reviewCount})</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{service.duration}</span>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  difficultyOptions.find(d => d.value === service.difficulty)?.color,
                  "text-white"
                )}>
                  {difficultyOptions.find(d => d.value === service.difficulty)?.label}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary mb-1">
                ${service.basePrice.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {service.priceType === 'project' ? 'Por proyecto' : 'Por hora'}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {service.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
              >
                {tag}
              </span>
            ))}
            {service.tags.length > 4 && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-md">
                +{service.tags.length - 4} más
              </span>
            )}
          </div>

          {/* Features Preview */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Características incluidas:
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {service.features.filter(f => f.included).slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="text-green-500">✓</span>
                  <span>{feature.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <button
              onClick={() => onServiceSelect?.(service)}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Ver Detalles
            </button>
            
            <button
              onClick={() => isInComparison ? removeFromComparison(service.id) : addToComparison(service)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                isInComparison
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              )}
            >
              {isInComparison ? '✓' : '⚖️'}
            </button>

            <button
              onClick={() => onCompareService?.(service)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            >
              Configurar
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar servicios, tecnologías, características..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>

          {/* Autocomplete Suggestions */}
          <AnimatePresence>
            {autocompleteSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10"
              >
                {autocompleteSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      searchServices(suggestion);
                      setAutocompleteSuggestions([]);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                  >
                    {suggestion}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                showFilters
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              🎛️ Filtros
              {(state.filters.categories.length > 0 || state.filters.difficulty.length > 0 || state.filters.rating > 0) && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.filters.categories.length + state.filters.difficulty.length + (state.filters.rating > 0 ? 1 : 0)}
                </span>
              )}
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {state.filteredServices.length} servicios encontrados
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Ordenar por:</span>
            <select
              value={state.sortBy}
              onChange={(e) => handleSort(e.target.value as typeof state.sortBy)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => sortServices(state.sortBy, state.sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              {state.sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Categorías
                </h3>
                <div className="space-y-2">
                  {categoryOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.filters.categories.includes(option.value)}
                        onChange={() => handleCategoryFilter(option.value)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">
                        {option.icon} {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Dificultad
                </h3>
                <div className="space-y-2">
                  {difficultyOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={state.filters.difficulty.includes(option.value)}
                        onChange={() => handleDifficultyFilter(option.value)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full", option.color)} />
                        <span className="text-sm">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Rango de Precio
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={state.filters.priceRange[0]}
                      onChange={(e) => handlePriceRangeChange([parseInt(e.target.value) || 0, state.filters.priceRange[1]])}
                      placeholder="Mín"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      value={state.filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange([state.filters.priceRange[0], parseInt(e.target.value) || 50000])}
                      placeholder="Máx"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    ${state.filters.priceRange[0].toLocaleString()} - ${state.filters.priceRange[1].toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Calificación Mínima
                </h3>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 3.0].map(rating => (
                    <label key={rating} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={state.filters.rating === rating}
                        onChange={() => handleRatingFilter(rating)}
                        className="text-primary focus:ring-primary"
                      />
                      <div className="flex items-center gap-1">
                        <span>⭐</span>
                        <span className="text-sm">{rating}+</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={state.filters.rating === 0}
                      onChange={() => handleRatingFilter(0)}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Todas</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => updateFilters({
                  categories: [],
                  difficulty: [],
                  priceRange: [0, 50000],
                  rating: 0,
                })}
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {state.filteredServices.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {state.filteredServices.length === 0 && !state.loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No se encontraron servicios
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Intenta ajustar los filtros o cambiar los términos de búsqueda
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              searchServices('');
              updateFilters({
                categories: [],
                difficulty: [],
                priceRange: [0, 50000],
                rating: 0,
              });
            }}
            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Limpiar filtros
          </button>
        </motion.div>
      )}

      {/* Loading State */}
      {state.loading && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Cargando servicios...</p>
        </div>
      )}
    </div>
  );
};

export default ServiceExplorer;
