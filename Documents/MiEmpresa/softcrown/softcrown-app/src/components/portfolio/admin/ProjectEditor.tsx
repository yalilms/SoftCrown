'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project, Technology, ProjectCategory, CodeSnippet, ProjectImage } from '@/types/portfolio';
import { cn } from '@/lib/utils';

interface ProjectEditorProps {
  project?: Project | null;
  onBack: () => void;
  onSave: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({ project, onBack, onSave }) => {
  const { state, createProject, updateProject } = usePortfolio();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    longDescription: '',
    client: '',
    duration: '',
    budget: '',
    liveUrl: '',
    githubUrl: '',
    figmaUrl: '',
    status: 'draft' as 'draft' | 'published',
    featured: false,
    categoryId: '',
    technologyIds: [] as string[],
    tags: [] as string[],
    features: [] as string[],
    challenges: [] as string[],
    solutions: [] as string[],
    seoTitle: '',
    seoDescription: '',
  });

  const [images, setImages] = useState<ProjectImage[]>([]);
  const [codeSnippets, setCodeSnippets] = useState<CodeSnippet[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newChallenge, setNewChallenge] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [saving, setSaving] = useState(false);

  // Load project data for editing
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        slug: project.slug,
        description: project.description,
        longDescription: project.longDescription,
        client: project.client,
        duration: project.duration,
        budget: project.budget,
        liveUrl: project.liveUrl || '',
        githubUrl: project.githubUrl || '',
        figmaUrl: project.figmaUrl || '',
        status: project.status,
        featured: project.featured,
        categoryId: project.category.id,
        technologyIds: project.technologies.map(t => t.id),
        tags: [...project.tags],
        features: [...project.features],
        challenges: [...project.challenges],
        solutions: [...project.solutions],
        seoTitle: project.seoTitle || '',
        seoDescription: project.seoDescription || '',
      });
      setImages([...project.images]);
      setCodeSnippets([...project.codeSnippets]);
    }
  }, [project]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!project && formData.title) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, project]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addChallenge = () => {
    if (newChallenge.trim()) {
      setFormData(prev => ({
        ...prev,
        challenges: [...prev.challenges, newChallenge.trim()]
      }));
      setNewChallenge('');
    }
  };

  const removeChallenge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.filter((_, i) => i !== index)
    }));
  };

  const addSolution = () => {
    if (newSolution.trim()) {
      setFormData(prev => ({
        ...prev,
        solutions: [...prev.solutions, newSolution.trim()]
      }));
      setNewSolution('');
    }
  };

  const removeSolution = (index: number) => {
    setFormData(prev => ({
      ...prev,
      solutions: prev.solutions.filter((_, i) => i !== index)
    }));
  };

  const addCodeSnippet = () => {
    const newSnippet: CodeSnippet = {
      id: Date.now().toString(),
      title: 'Nuevo Snippet',
      language: 'javascript',
      code: '// Código aquí...',
      description: ''
    };
    setCodeSnippets(prev => [...prev, newSnippet]);
  };

  const updateCodeSnippet = (id: string, updates: Partial<CodeSnippet>) => {
    setCodeSnippets(prev =>
      prev.map(snippet =>
        snippet.id === id ? { ...snippet, ...updates } : snippet
      )
    );
  };

  const removeCodeSnippet = (id: string) => {
    setCodeSnippets(prev => prev.filter(snippet => snippet.id !== id));
  };

  const addImage = () => {
    const newImage: ProjectImage = {
      id: Date.now().toString(),
      url: '/images/placeholder-project.jpg',
      alt: formData.title,
      width: 1920,
      height: 1080,
      order: images.length + 1
    };
    setImages(prev => [...prev, newImage]);
  };

  const updateImage = (id: string, updates: Partial<ProjectImage>) => {
    setImages(prev =>
      prev.map(img =>
        img.id === id ? { ...img, ...updates } : img
      )
    );
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const category = state.categories.find(c => c.id === formData.categoryId);
      const technologies = state.technologies.filter(t => 
        formData.technologyIds.includes(t.id)
      );

      if (!category) {
        alert('Por favor selecciona una categoría');
        return;
      }

      const projectData = {
        ...formData,
        images,
        technologies,
        category,
        codeSnippets,
      };

      if (project) {
        await updateProject(project.id, projectData);
      } else {
        await createProject(projectData);
      }

      onSave();
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error al guardar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {project ? `Editando: ${project.title}` : 'Crear un nuevo proyecto para el portfolio'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !formData.title || !formData.categoryId}
              className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {saving && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {saving ? 'Guardando...' : 'Guardar Proyecto'}
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Proyecto *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre del proyecto"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="proyecto-ejemplo"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción Corta *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descripción breve del proyecto (aparece en las tarjetas)"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción Completa
            </label>
            <textarea
              value={formData.longDescription}
              onChange={(e) => handleInputChange('longDescription', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Descripción detallada del proyecto"
            />
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleInputChange('client', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Nombre del cliente"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => handleInputChange('duration', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="3 meses"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presupuesto
            </label>
            <input
              type="text"
              value={formData.budget}
              onChange={(e) => handleInputChange('budget', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="$10,000"
            />
          </div>
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Live
            </label>
            <input
              type="url"
              value={formData.liveUrl}
              onChange={(e) => handleInputChange('liveUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://proyecto.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL GitHub
            </label>
            <input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => handleInputChange('githubUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://github.com/usuario/repo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Figma
            </label>
            <input
              type="url"
              value={formData.figmaUrl}
              onChange={(e) => handleInputChange('figmaUrl', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://figma.com/file/..."
            />
          </div>
        </div>

        {/* Category and Technologies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Seleccionar categoría</option>
              {state.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tecnologías
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-gray-700">
              {state.technologies.map((tech) => (
                <label key={tech.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.technologyIds.includes(tech.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('technologyIds', [...formData.technologyIds, tech.id]);
                      } else {
                        handleInputChange('technologyIds', formData.technologyIds.filter(id => id !== tech.id));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">
                    {tech.icon} {tech.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Status and Featured */}
        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => handleInputChange('featured', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Proyecto destacado
            </label>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Agregar tag"
            />
            <button
              onClick={addTag}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Agregar
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-2"
              >
                #{tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Características
          </label>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Agregar característica"
            />
            <button
              onClick={addFeature}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Agregar
            </button>
          </div>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <span className="text-green-500">✅</span>
                <span className="flex-1 text-gray-900 dark:text-white">{feature}</span>
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSave}
            disabled={saving || !formData.title || !formData.categoryId}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? 'Guardando Proyecto...' : 'Guardar Proyecto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
