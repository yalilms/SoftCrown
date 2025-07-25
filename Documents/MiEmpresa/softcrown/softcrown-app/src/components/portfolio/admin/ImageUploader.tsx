'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUploadProgress } from '@/types/portfolio';
import { cn } from '@/lib/utils';

const ImageUploader: React.FC = () => {
  const [uploads, setUploads] = useState<ImageUploadProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList) => {
    const newUploads: ImageUploadProgress[] = Array.from(files).map(file => ({
      file,
      progress: 0,
      status: 'pending',
    }));

    setUploads(prev => [...prev, ...newUploads]);

    // Simulate upload process
    newUploads.forEach((upload, index) => {
      setTimeout(() => {
        simulateUpload(upload.file);
      }, index * 500);
    });
  }, []);

  const simulateUpload = (file: File) => {
    const fileName = file.name;
    
    setUploads(prev => prev.map(upload => 
      upload.file.name === fileName 
        ? { ...upload, status: 'uploading' }
        : upload
    ));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      
      setUploads(prev => prev.map(upload => 
        upload.file.name === fileName 
          ? { ...upload, progress: Math.min(progress, 100) }
          : upload
      ));

      if (progress >= 100) {
        clearInterval(interval);
        
        // Simulate success or error
        const success = Math.random() > 0.1; // 90% success rate
        
        setTimeout(() => {
          setUploads(prev => prev.map(upload => 
            upload.file.name === fileName 
              ? { 
                  ...upload, 
                  status: success ? 'success' : 'error',
                  progress: 100,
                  url: success ? `/images/uploads/${fileName}` : undefined,
                  error: success ? undefined : 'Error al subir la imagen'
                }
              : upload
          ));
        }, 500);
      }
    }, 200);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeUpload = (fileName: string) => {
    setUploads(prev => prev.filter(upload => upload.file.name !== fileName));
  };

  const retryUpload = (file: File) => {
    setUploads(prev => prev.map(upload => 
      upload.file.name === file.name 
        ? { ...upload, status: 'pending', progress: 0, error: undefined }
        : upload
    ));
    
    setTimeout(() => simulateUpload(file), 500);
  };

  const clearCompleted = () => {
    setUploads(prev => prev.filter(upload => 
      upload.status !== 'success' && upload.status !== 'error'
    ));
  };

  const getStatusIcon = (status: ImageUploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'uploading':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: ImageUploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-500';
      case 'uploading':
        return 'text-blue-500';
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Imágenes
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sube y gestiona las imágenes de tus proyectos
          </p>
        </div>
        
        {uploads.length > 0 && (
          <button
            onClick={clearCompleted}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            Limpiar completados
          </button>
        )}
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5 scale-105"
            : "border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className="text-center">
          <motion.div
            animate={{ scale: dragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
            className="text-6xl mb-4"
          >
            {dragActive ? '📤' : '🖼️'}
          </motion.div>
          
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {dragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes aquí'}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            O haz clic para seleccionar archivos
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Formatos soportados:</span>
            <span className="font-medium">JPG, PNG, GIF, WEBP</span>
            <span>•</span>
            <span className="font-medium">Máximo 10MB por archivo</span>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subidas en Progreso ({uploads.length})
              </h3>
            </div>
            
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {uploads.map((upload) => (
                <motion.div
                  key={upload.file.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  {/* File Preview */}
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center overflow-hidden">
                    {upload.file.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(upload.file)}
                        alt={upload.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">📄</span>
                    )}
                  </div>
                  
                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("text-lg", getStatusColor(upload.status))}>
                        {getStatusIcon(upload.status)}
                      </span>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {upload.file.name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>{upload.file.type}</span>
                      {upload.status === 'uploading' && (
                        <span>{Math.round(upload.progress)}%</span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {upload.status === 'uploading' && (
                      <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className="bg-primary h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${upload.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {upload.error && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {upload.error}
                      </p>
                    )}
                    
                    {/* Success URL */}
                    {upload.url && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                        Subido: {upload.url}
                      </p>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {upload.status === 'error' && (
                      <button
                        onClick={() => retryUpload(upload.file)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Reintentar
                      </button>
                    )}
                    
                    {upload.status === 'success' && (
                      <button
                        onClick={() => navigator.clipboard.writeText(upload.url!)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Copiar URL
                      </button>
                    )}
                    
                    <button
                      onClick={() => removeUpload(upload.file.name)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Gallery */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Galería de Imágenes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Imágenes disponibles para usar en proyectos
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Placeholder images */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
              >
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <span className="text-2xl">🖼️</span>
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                    <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                      👁️
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                      📋
                    </button>
                    <button className="p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add more button */}
            <div
              className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-200"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <div className="text-3xl text-gray-400 dark:text-gray-500 mb-2">➕</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Subir más
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
