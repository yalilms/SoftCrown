'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ShoppingCartIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  SparklesIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { withAuth } from '@/contexts/AuthContext';
import { useEcommerce } from '@/contexts/EcommerceContext';
import { Product, ProductFilters, ProductSort } from '@/types/ecommerce';
import { mockProducts, productCategories } from '@/lib/mockData/products';
import Button from '@/components/ui/Button';

const ProductCatalogPage = () => {
  const { addToCart, isInCart, getCartItem } = useEcommerce();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sort, setSort] = useState<ProductSort>({ field: 'name', direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    if (filters.type) {
      filtered = filtered.filter(product => product.type === filters.type);
    }

    if (filters.priceRange) {
      filtered = filtered.filter(product => 
        product.price >= filters.priceRange!.min && 
        product.price <= filters.priceRange!.max
      );
    }

    if (filters.complexity) {
      filtered = filtered.filter(product => product.complexity === filters.complexity);
    }

    if (filters.isRecurring !== undefined) {
      filtered = filtered.filter(product => product.isRecurring === filters.isRecurring);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(product =>
        filters.tags!.some(tag => product.tags.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sort.field];
      let bValue: any = b[sort.field];

      if (sort.field === 'createdAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sort.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProducts(filtered);
  }, [products, filters, sort, searchQuery]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const priceRanges = [
    { label: 'Menos de €200', min: 0, max: 200 },
    { label: '€200 - €500', min: 200, max: 500 },
    { label: '€500 - €1000', min: 500, max: 1000 },
    { label: '€1000 - €2000', min: 1000, max: 2000 },
    { label: 'Más de €2000', min: 2000, max: 10000 },
  ];

  const ProductCard = ({ product }: { product: Product }) => {
    const inCart = isInCart(product.id);
    const cartItem = getCartItem(product.id);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* Product Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
          {product.isFeatured && (
            <div className="absolute top-3 left-3 z-10">
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" />
                Destacado
              </span>
            </div>
          )}
          {product.isPopular && (
            <div className="absolute top-3 right-3 z-10">
              <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <FireIcon className="w-3 h-3" />
                Popular
              </span>
            </div>
          )}
          {product.originalPrice && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-2xl font-bold mb-1">{product.name}</div>
              <div className="text-sm opacity-90">{product.category}</div>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {product.shortDescription}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                €{product.price}
              </div>
              {product.originalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  €{product.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Features */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="space-y-1">
              {product.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {feature}
                </div>
              ))}
              {product.features.length > 3 && (
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  +{product.features.length - 3} características más
                </div>
              )}
            </div>
          </div>

          {/* Delivery Time & Complexity */}
          <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {product.deliveryTime}
            </div>
            <div className="flex items-center gap-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.complexity === 'basic' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : product.complexity === 'standard'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {product.complexity === 'basic' ? 'Básico' : 
                 product.complexity === 'standard' ? 'Estándar' : 'Premium'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setSelectedProduct(product)}
            >
              Ver Detalles
            </Button>
            <Button
              variant={inCart ? "secondary" : "default"}
              size="sm"
              className="flex-1"
              onClick={() => handleAddToCart(product)}
              disabled={inCart}
            >
              <ShoppingCartIcon className="w-4 h-4 mr-2" />
              {inCart ? `En Carrito (${cartItem?.quantity})` : 'Añadir'}
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const FilterSidebar = () => (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtros
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(false)}
          className="lg:hidden"
        >
          <XMarkIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Categoría
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Todas las categorías</option>
          {productCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Type Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo
        </label>
        <div className="space-y-2">
          {[
            { value: '', label: 'Todos' },
            { value: 'service', label: 'Servicios' },
            { value: 'package', label: 'Paquetes' },
            { value: 'addon', label: 'Add-ons' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="type"
                value={option.value}
                checked={filters.type === option.value || (!filters.type && !option.value)}
                onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Rango de Precio
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="priceRange"
              checked={!filters.priceRange}
              onChange={() => setFilters({ ...filters, priceRange: undefined })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Todos los precios
            </span>
          </label>
          {priceRanges.map((range) => (
            <label key={`${range.min}-${range.max}`} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                checked={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max}
                onChange={() => setFilters({ ...filters, priceRange: range })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {range.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Complexity Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Complejidad
        </label>
        <div className="space-y-2">
          {[
            { value: '', label: 'Todas' },
            { value: 'basic', label: 'Básico' },
            { value: 'standard', label: 'Estándar' },
            { value: 'premium', label: 'Premium' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="complexity"
                value={option.value}
                checked={filters.complexity === option.value || (!filters.complexity && !option.value)}
                onChange={(e) => setFilters({ ...filters, complexity: e.target.value as any || undefined })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Recurring Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tipo de Servicio
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.isRecurring === true}
              onChange={(e) => setFilters({ 
                ...filters, 
                isRecurring: e.target.checked ? true : undefined 
              })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Solo servicios recurrentes
            </span>
          </label>
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="w-full"
      >
        Limpiar Filtros
      </Button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Tienda de Servicios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Descubre nuestros servicios profesionales de desarrollo web, diseño y marketing digital
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Sort */}
            <div className="flex gap-2">
              <select
                value={`${sort.field}-${sort.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSort({ field: field as any, direction: direction as any });
                }}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="name-asc">Nombre A-Z</option>
                <option value="name-desc">Nombre Z-A</option>
                <option value="price-asc">Precio: Menor a Mayor</option>
                <option value="price-desc">Precio: Mayor a Menor</option>
                <option value="createdAt-desc">Más Recientes</option>
                <option value="createdAt-asc">Más Antiguos</option>
              </select>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <FunnelIcon className="w-5 h-5 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredProducts.length} servicio{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
            </p>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Limpiar todo
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <FilterSidebar />
          </div>

          {/* Filters Sidebar - Mobile */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <div
                  className="absolute left-0 top-0 h-full w-80 max-w-[90vw]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FilterSidebar />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {/* isLoading state was removed, so this block is now always true */}
            {/* The original code had a loading state, but the imports were removed.
                 Assuming the intent was to remove the loading state and always show products.
                 If the intent was to keep the loading state, the imports would need to be re-added.
                 For now, removing the loading state as per the edit hint. */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No se encontraron servicios
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Intenta ajustar tus filtros o términos de búsqueda
                </p>
                <Button onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedProduct.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProduct.category}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Descripción
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedProduct.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Características Incluidas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProduct.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Tiempo de Entrega
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProduct.deliveryTime}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Revisiones
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProduct.revisions === 999 ? 'Ilimitadas' : selectedProduct.revisions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        €{selectedProduct.price}
                      </div>
                      {selectedProduct.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          €{selectedProduct.originalPrice}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="default"
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      disabled={isInCart(selectedProduct.id)}
                    >
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      {isInCart(selectedProduct.id) ? 'En Carrito' : 'Añadir al Carrito'}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default withAuth(ProductCatalogPage, ['client', 'admin']);
