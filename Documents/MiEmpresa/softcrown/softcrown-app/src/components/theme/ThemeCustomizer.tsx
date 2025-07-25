'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout, 
  Settings, 
  Download, 
  Upload, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  Plus,
  Moon,
  Sun,
  Monitor,
  Copy,
  Check,
  X
} from 'lucide-react';
import { themeCustomizer, ThemeConfig, ThemePreset } from '@/lib/theme/themeCustomizer';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ThemeCustomizer({ isOpen, onClose }: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'layout' | 'components'>('presets');
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(themeCustomizer.getCurrentTheme());
  const [presets, setPresets] = useState<ThemePreset[]>(themeCustomizer.getPresets());
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>(themeCustomizer.getCustomThemes());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [importData, setImportData] = useState('');
  const [copiedTheme, setCopiedTheme] = useState<string | null>(null);

  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      setCurrentTheme(event.detail.theme);
    };

    window.addEventListener('themeChanged', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChanged', handleThemeChange as EventListener);
  }, []);

  const tabs = [
    { id: 'presets', label: 'Presets', icon: Palette },
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'typography', label: 'Tipografía', icon: Type },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'components', label: 'Componentes', icon: Settings },
  ];

  const handlePresetSelect = (presetId: string) => {
    themeCustomizer.setTheme(presetId);
    setCurrentTheme(themeCustomizer.getCurrentTheme());
  };

  const handlePreviewToggle = (themeId: string) => {
    if (isPreviewMode) {
      themeCustomizer.disablePreview();
      setIsPreviewMode(false);
    } else {
      themeCustomizer.enablePreview(themeId);
      setIsPreviewMode(true);
    }
  };

  const handleCreateTheme = () => {
    if (!newThemeName.trim()) return;
    
    const newTheme = themeCustomizer.createCustomTheme(newThemeName);
    setCustomThemes(themeCustomizer.getCustomThemes());
    setNewThemeName('');
    setShowCreateModal(false);
    themeCustomizer.setTheme(newTheme.id);
    setCurrentTheme(newTheme);
  };

  const handleImportTheme = () => {
    try {
      const importedTheme = themeCustomizer.importTheme(importData, 'Tema Importado');
      setCustomThemes(themeCustomizer.getCustomThemes());
      setImportData('');
      setShowImportModal(false);
      themeCustomizer.setTheme(importedTheme.id);
      setCurrentTheme(importedTheme);
    } catch (error) {
      alert('Error al importar tema: ' + error);
    }
  };

  const handleExportTheme = (themeId: string) => {
    try {
      const exportData = themeCustomizer.exportTheme(themeId);
      navigator.clipboard.writeText(exportData);
      setCopiedTheme(themeId);
      setTimeout(() => setCopiedTheme(null), 2000);
    } catch (error) {
      alert('Error al exportar tema: ' + error);
    }
  };

  const handleColorChange = (colorPath: string, value: string) => {
    if (!currentTheme.isCustom) return;
    
    const colorUpdate = { ...currentTheme.colors };
    const keys = colorPath.split('.');
    let current: any = colorUpdate;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    themeCustomizer.updateColors(colorUpdate);
    setCurrentTheme(themeCustomizer.getCurrentTheme());
  };

  const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer"
          disabled={!currentTheme.isCustom}
        />
        <span className="text-xs text-gray-500 font-mono">{value}</span>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Theme Customizer</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Personaliza la apariencia</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Mode Banner */}
            {isPreviewMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Modo Preview</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        themeCustomizer.confirmPreview();
                        setIsPreviewMode(false);
                        setCurrentTheme(themeCustomizer.getCurrentTheme());
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                    >
                      Aplicar
                    </button>
                    <button
                      onClick={() => handlePreviewToggle('')}
                      className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'presets' && (
                <div className="space-y-6">
                  {/* Current Theme Info */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Tema Actual</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">{currentTheme.name}</p>
                        <p className="text-sm text-gray-500">{currentTheme.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {currentTheme.isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        {currentTheme.isCustom && (
                          <button
                            onClick={() => handleExportTheme(currentTheme.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            {copiedTheme === currentTheme.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Crear Tema
                    </button>
                    <button
                      onClick={() => setShowImportModal(true)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Importar
                    </button>
                  </div>

                  {/* Preset Themes */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Temas Predefinidos</h3>
                    <div className="space-y-2">
                      {presets.map((preset) => (
                        <div
                          key={preset.id}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            currentTheme.id === preset.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                          onClick={() => handlePresetSelect(preset.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{preset.name}</h4>
                              <p className="text-sm text-gray-500">{preset.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePreviewToggle(preset.id);
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                              >
                                {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              {preset.config.isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Themes */}
                  {customThemes.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Temas Personalizados</h3>
                      <div className="space-y-2">
                        {customThemes.map((theme) => (
                          <div
                            key={theme.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              currentTheme.id === theme.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                            onClick={() => handlePresetSelect(theme.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white">{theme.name}</h4>
                                <p className="text-sm text-gray-500">{theme.description}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleExportTheme(theme.id);
                                  }}
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                >
                                  {copiedTheme === theme.id ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Download className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('¿Eliminar este tema personalizado?')) {
                                      themeCustomizer.deleteCustomTheme(theme.id);
                                      setCustomThemes(themeCustomizer.getCustomThemes());
                                    }
                                  }}
                                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                {theme.isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {currentTheme.isCustom ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Personaliza los colores de tu tema
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Crea un tema personalizado para editar colores
                      </p>
                    )}
                  </div>

                  {/* Primary Colors */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Colores Primarios</h3>
                    <div className="space-y-2">
                      <ColorPicker
                        label="Primary 500"
                        value={currentTheme.colors.primary[500]}
                        onChange={(value) => handleColorChange('primary.500', value)}
                      />
                      <ColorPicker
                        label="Primary 600"
                        value={currentTheme.colors.primary[600]}
                        onChange={(value) => handleColorChange('primary.600', value)}
                      />
                    </div>
                  </div>

                  {/* Background Colors */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Fondos</h3>
                    <div className="space-y-2">
                      <ColorPicker
                        label="Fondo Principal"
                        value={currentTheme.colors.background.primary}
                        onChange={(value) => handleColorChange('background.primary', value)}
                      />
                      <ColorPicker
                        label="Fondo Secundario"
                        value={currentTheme.colors.background.secondary}
                        onChange={(value) => handleColorChange('background.secondary', value)}
                      />
                    </div>
                  </div>

                  {/* Text Colors */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Texto</h3>
                    <div className="space-y-2">
                      <ColorPicker
                        label="Texto Principal"
                        value={currentTheme.colors.text.primary}
                        onChange={(value) => handleColorChange('text.primary', value)}
                      />
                      <ColorPicker
                        label="Texto Secundario"
                        value={currentTheme.colors.text.secondary}
                        onChange={(value) => handleColorChange('text.secondary', value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configuración de tipografía disponible próximamente
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'layout' && (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Configuración de layout disponible próximamente
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'components' && (
                <div className="space-y-6">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Personalización de componentes disponible próximamente
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Create Theme Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Crear Tema Personalizado</h3>
                  <input
                    type="text"
                    placeholder="Nombre del tema"
                    value={newThemeName}
                    onChange={(e) => setNewThemeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateTheme()}
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateTheme}
                      disabled={!newThemeName.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewThemeName('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Import Theme Modal */}
          <AnimatePresence>
            {showImportModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Importar Tema</h3>
                  <textarea
                    placeholder="Pega aquí los datos del tema JSON..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white mb-4 h-32 resize-none"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleImportTheme}
                      disabled={!importData.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Importar
                    </button>
                    <button
                      onClick={() => {
                        setShowImportModal(false);
                        setImportData('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
