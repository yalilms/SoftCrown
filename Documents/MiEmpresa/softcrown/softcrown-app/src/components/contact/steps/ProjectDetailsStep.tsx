'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContact, useFormStep } from '@/contexts/ContactContext';
import { ProjectDetailsForm } from '@/lib/validations/contact';
import { 
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ShoppingCartIcon,
  PaintBrushIcon,
  ChatBubbleLeftRightIcon,
  EllipsisHorizontalIcon,
  PlusIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';

const projectTypes = [
  {
    id: 'web-development',
    title: 'Desarrollo Web',
    description: 'Sitios web, aplicaciones web, portales',
    icon: ComputerDesktopIcon,
    color: 'blue',
    features: ['Responsive Design', 'SEO Optimizado', 'Panel de Administración', 'Integración API', 'Base de Datos']
  },
  {
    id: 'mobile-app',
    title: 'App Móvil',
    description: 'iOS, Android, React Native, Flutter',
    icon: DevicePhoneMobileIcon,
    color: 'green',
    features: ['Diseño Nativo', 'Push Notifications', 'Geolocalización', 'Cámara/Galería', 'Offline Mode']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    description: 'Tiendas online, marketplaces',
    icon: ShoppingCartIcon,
    color: 'purple',
    features: ['Catálogo de Productos', 'Carrito de Compras', 'Pagos Online', 'Gestión de Inventario', 'Analytics']
  },
  {
    id: 'branding',
    title: 'Branding & Diseño',
    description: 'Identidad visual, logotipos, UI/UX',
    icon: PaintBrushIcon,
    color: 'pink',
    features: ['Logo Design', 'Paleta de Colores', 'Tipografía', 'Manual de Marca', 'Material Gráfico']
  },
  {
    id: 'consulting',
    title: 'Consultoría',
    description: 'Estrategia digital, auditorías',
    icon: ChatBubbleLeftRightIcon,
    color: 'yellow',
    features: ['Auditoría Técnica', 'Estrategia Digital', 'Optimización', 'Capacitación', 'Soporte']
  },
  {
    id: 'other',
    title: 'Otro',
    description: 'Proyecto personalizado',
    icon: EllipsisHorizontalIcon,
    color: 'gray',
    features: ['Desarrollo Custom', 'Integración', 'Migración', 'Mantenimiento', 'Soporte Técnico']
  }
];

export function ProjectDetailsStep() {
  const { state, dispatch } = useContact();
  const { updateStep } = useFormStep();
  
  const [formData, setFormData] = useState<ProjectDetailsForm>({
    projectType: state.formData.projectDetails?.projectType || 'web-development',
    description: state.formData.projectDetails?.description || '',
    features: state.formData.projectDetails?.features || [],
    targetAudience: state.formData.projectDetails?.targetAudience || '',
    competitors: state.formData.projectDetails?.competitors || '',
    inspiration: state.formData.projectDetails?.inspiration || '',
  });

  const [customFeature, setCustomFeature] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Real-time validation
  useEffect(() => {
    updateStep(2, formData);
  }, [formData, updateStep]);

  const selectedProjectType = projectTypes.find(type => type.id === formData.projectType);

  const handleProjectTypeChange = (typeId: string) => {
    setFormData(prev => ({ 
      ...prev, 
      projectType: typeId as any,
      features: [] // Reset features when changing project type
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleAddCustomFeature = () => {
    if (customFeature.trim() && !formData.features.includes(customFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, customFeature.trim()]
      }));
      setCustomFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature)
    }));
  };

  // File upload handlers
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5)); // Max 5 files
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Cuéntanos sobre tu proyecto para poder crear la propuesta perfecta para ti.
        </p>
      </motion.div>

      {/* Project Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          ¿Qué tipo de proyecto necesitas?
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTypes.map((type, index) => (
            <motion.div
              key={type.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`
                relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                ${formData.projectType === type.id
                  ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20`
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              onClick={() => handleProjectTypeChange(type.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center
                  ${formData.projectType === type.id
                    ? `bg-${type.color}-500 text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  <type.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {type.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {type.description}
                  </p>
                </div>
              </div>
              
              {/* Selection indicator */}
              {formData.projectType === type.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Selection */}
      {selectedProjectType && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            ¿Qué características necesitas?
          </h3>
          
          <div className="space-y-3">
            {/* Predefined features */}
            <div className="flex flex-wrap gap-2">
              {selectedProjectType.features.map((feature) => (
                <motion.button
                  key={feature}
                  type="button"
                  onClick={() => handleFeatureToggle(feature)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${formData.features.includes(feature)
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {feature}
                </motion.button>
              ))}
            </div>

            {/* Custom feature input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={customFeature}
                onChange={(e) => setCustomFeature(e.target.value)}
                placeholder="Agregar característica personalizada..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomFeature()}
              />
              <Button
                type="button"
                onClick={handleAddCustomFeature}
                disabled={!customFeature.trim()}
                size="sm"
                className="px-4"
              >
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            {/* Selected custom features */}
            {formData.features.filter(f => !selectedProjectType.features.includes(f)).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.features
                  .filter(f => !selectedProjectType.features.includes(f))
                  .map((feature) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center space-x-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-full text-sm"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feature)}
                        className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Project Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Descripción del Proyecto <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe tu proyecto en detalle. ¿Qué problema resuelve? ¿Cuáles son tus objetivos?"
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formData.description.length}/500 caracteres
        </p>
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Audiencia Objetivo <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.targetAudience}
          onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
          placeholder="¿Quién usará tu producto? Describe a tu audiencia objetivo..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Competidores (Opcional)
          </label>
          <input
            type="text"
            value={formData.competitors}
            onChange={(e) => setFormData(prev => ({ ...prev, competitors: e.target.value }))}
            placeholder="Sitios web o apps similares..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Inspiración (Opcional)
          </label>
          <input
            type="text"
            value={formData.inspiration}
            onChange={(e) => setFormData(prev => ({ ...prev, inspiration: e.target.value }))}
            placeholder="Diseños que te gustan..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Referencias (Opcional)
        </h3>
        
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-6 transition-all duration-200
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <label htmlFor="file-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                  Arrastra archivos aquí o{' '}
                  <span className="text-blue-600 hover:text-blue-500">busca en tu dispositivo</span>
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, PDF hasta 10MB (máximo 5 archivos)
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Archivos subidos:
            </h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <DocumentIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ width: '25%' }}
        animate={{ width: '50%' }}
        transition={{ duration: 0.5 }}
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
      />
    </div>
  );
}
