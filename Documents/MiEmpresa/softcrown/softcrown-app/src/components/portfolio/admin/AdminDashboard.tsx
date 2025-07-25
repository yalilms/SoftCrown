'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePortfolio } from '@/contexts/PortfolioContext';
import { Project } from '@/types/portfolio';
import ProjectEditor from './ProjectEditor';
import ImageUploader from './ImageUploader';
import { cn } from '@/lib/utils';

type AdminView = 'dashboard' | 'projects' | 'editor' | 'media';

const AdminDashboard: React.FC = () => {
  const { state, deleteProject, toggleAdminMode } = usePortfolio();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const stats = {
    totalProjects: state.projects.length,
    publishedProjects: state.projects.filter(p => p.status === 'published').length,
    draftProjects: state.projects.filter(p => p.status === 'draft').length,
    featuredProjects: state.projects.filter(p => p.featured).length,
    totalViews: state.projects.reduce((sum, p) => sum + p.views, 0),
    totalLikes: state.projects.reduce((sum, p) => sum + p.likes, 0),
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsEditing(true);
    setCurrentView('editor');
  };

  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsEditing(true);
    setCurrentView('editor');
  };

  const handleDeleteProject = async (project: Project) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${project.title}"?`)) {
      await deleteProject(project.id);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProject(null);
    setIsEditing(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'projects', label: 'Proyectos', icon: '📁', count: state.projects.length },
    { id: 'editor', label: 'Editor', icon: '✏️' },
    { id: 'media', label: 'Media', icon: '🖼️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                Portfolio CMS
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <span>➕</span>
                Nuevo Proyecto
              </button>
              
              <button
                onClick={toggleAdminMode}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Salir del Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as AdminView)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg font-medium transition-colors",
                    currentView === item.id
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-bold",
                      currentView === item.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    )}>
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              {currentView === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Proyectos</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {stats.totalProjects}
                          </p>
                        </div>
                        <div className="text-4xl">📁</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Publicados</p>
                          <p className="text-3xl font-bold text-green-600">
                            {stats.publishedProjects}
                          </p>
                        </div>
                        <div className="text-4xl">✅</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Borradores</p>
                          <p className="text-3xl font-bold text-yellow-600">
                            {stats.draftProjects}
                          </p>
                        </div>
                        <div className="text-4xl">📝</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Destacados</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {stats.featuredProjects}
                          </p>
                        </div>
                        <div className="text-4xl">⭐</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Vistas</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {stats.totalViews.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-4xl">👁️</div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
                          <p className="text-3xl font-bold text-red-600">
                            {stats.totalLikes.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-4xl">❤️</div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Projects */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Proyectos Recientes
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {state.projects.slice(0, 5).map((project) => (
                          <div
                            key={project.id}
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={project.images[0]?.url || '/images/placeholder-project.jpg'}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {project.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {project.category.name} • {project.client}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-1 rounded-full text-xs font-medium",
                                project.status === 'published'
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              )}>
                                {project.status === 'published' ? 'Publicado' : 'Borrador'}
                              </span>
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-primary hover:text-primary/80 transition-colors"
                              >
                                Editar
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Gestión de Proyectos
                      </h2>
                      <button
                        onClick={handleCreateProject}
                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                      >
                        <span>➕</span>
                        Nuevo Proyecto
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              Proyecto
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              Estado
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              Categoría
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              Vistas
                            </th>
                            <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                              Acciones
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {state.projects.map((project) => (
                            <tr
                              key={project.id}
                              className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={project.images[0]?.url || '/images/placeholder-project.jpg'}
                                    alt={project.title}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      {project.title}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                      {project.client}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-xs font-medium",
                                  project.status === 'published'
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                )}>
                                  {project.status === 'published' ? 'Publicado' : 'Borrador'}
                                </span>
                                {project.featured && (
                                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                                    ⭐ Destacado
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-medium"
                                  style={{
                                    backgroundColor: `${project.category.color}20`,
                                    color: project.category.color,
                                  }}
                                >
                                  {project.category.icon} {project.category.name}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="text-gray-900 dark:text-white">
                                  {project.views.toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {project.likes} likes
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditProject(project)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProject(project)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentView === 'editor' && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ProjectEditor
                    project={selectedProject}
                    onBack={handleBackToDashboard}
                    onSave={handleBackToDashboard}
                  />
                </motion.div>
              )}

              {currentView === 'media' && (
                <motion.div
                  key="media"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ImageUploader />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
