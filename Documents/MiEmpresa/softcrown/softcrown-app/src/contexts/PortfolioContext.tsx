'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  Project, 
  PortfolioState, 
  PortfolioAction, 
  PortfolioContextType, 
  PortfolioFilters,
  Technology,
  ProjectCategory,
  SearchResult
} from '@/types/portfolio';

// Mock data
const mockTechnologies: Technology[] = [
  { id: '1', name: 'React', icon: '⚛️', color: '#61DAFB', category: 'frontend', proficiency: 5 },
  { id: '2', name: 'Next.js', icon: '▲', color: '#000000', category: 'frontend', proficiency: 5 },
  { id: '3', name: 'TypeScript', icon: '📘', color: '#3178C6', category: 'frontend', proficiency: 5 },
  { id: '4', name: 'Node.js', icon: '🟢', color: '#339933', category: 'backend', proficiency: 4 },
  { id: '5', name: 'Python', icon: '🐍', color: '#3776AB', category: 'backend', proficiency: 4 },
  { id: '6', name: 'PostgreSQL', icon: '🐘', color: '#336791', category: 'database', proficiency: 4 },
  { id: '7', name: 'MongoDB', icon: '🍃', color: '#47A248', category: 'database', proficiency: 4 },
  { id: '8', name: 'Docker', icon: '🐳', color: '#2496ED', category: 'devops', proficiency: 3 },
  { id: '9', name: 'AWS', icon: '☁️', color: '#FF9900', category: 'devops', proficiency: 3 },
  { id: '10', name: 'Figma', icon: '🎨', color: '#F24E1E', category: 'design', proficiency: 4 },
  { id: '11', name: 'React Native', icon: '📱', color: '#61DAFB', category: 'mobile', proficiency: 3 },
  { id: '12', name: 'Flutter', icon: '🦋', color: '#02569B', category: 'mobile', proficiency: 3 },
];

const mockCategories: ProjectCategory[] = [
  { id: '1', name: 'E-commerce', slug: 'ecommerce', description: 'Tiendas online y plataformas de venta', color: '#10B981', icon: '🛒' },
  { id: '2', name: 'SaaS', slug: 'saas', description: 'Software como servicio', color: '#3B82F6', icon: '💼' },
  { id: '3', name: 'Landing Page', slug: 'landing', description: 'Páginas de aterrizaje y marketing', color: '#F59E0B', icon: '🎯' },
  { id: '4', name: 'Dashboard', slug: 'dashboard', description: 'Paneles de control y analytics', color: '#8B5CF6', icon: '📊' },
  { id: '5', name: 'Mobile App', slug: 'mobile', description: 'Aplicaciones móviles nativas', color: '#EF4444', icon: '📱' },
  { id: '6', name: 'Web App', slug: 'webapp', description: 'Aplicaciones web completas', color: '#06B6D4', icon: '🌐' },
];

const mockProjects: Project[] = [
  {
    id: '1',
    title: 'EcoShop - Tienda Sostenible',
    slug: 'ecoshop-tienda-sostenible',
    description: 'Plataforma e-commerce enfocada en productos ecológicos con sistema de puntos de sostenibilidad.',
    longDescription: 'EcoShop es una innovadora plataforma de comercio electrónico que revoluciona la forma en que los consumidores compran productos sostenibles. La aplicación incluye un sistema único de puntos de sostenibilidad, calculadora de huella de carbono, y recomendaciones personalizadas basadas en preferencias ecológicas.',
    images: [
      { id: '1', url: '/images/projects/ecoshop/hero.jpg', alt: 'EcoShop Homepage', width: 1920, height: 1080, order: 1 },
      { id: '2', url: '/images/projects/ecoshop/products.jpg', alt: 'Products Page', width: 1920, height: 1080, order: 2 },
      { id: '3', url: '/images/projects/ecoshop/checkout.jpg', alt: 'Checkout Process', width: 1920, height: 1080, order: 3 },
    ],
    technologies: [mockTechnologies[0], mockTechnologies[1], mockTechnologies[2], mockTechnologies[5]],
    category: mockCategories[0],
    client: 'GreenTech Solutions',
    duration: '4 meses',
    budget: '$25,000',
    features: [
      'Sistema de puntos de sostenibilidad',
      'Calculadora de huella de carbono',
      'Recomendaciones personalizadas',
      'Pasarela de pagos múltiple',
      'Dashboard de vendedor',
      'Sistema de reviews y ratings'
    ],
    challenges: [
      'Integración compleja de APIs de sostenibilidad',
      'Cálculos en tiempo real de huella de carbono',
      'Optimización para móviles con gran catálogo'
    ],
    solutions: [
      'Implementación de cache inteligente para cálculos',
      'Lazy loading y virtualización de listas',
      'Progressive Web App para mejor rendimiento móvil'
    ],
    codeSnippets: [
      {
        id: '1',
        title: 'Calculadora de Huella de Carbono',
        language: 'typescript',
        code: `const calculateCarbonFootprint = (products: Product[]): number => {
  return products.reduce((total, product) => {
    const productFootprint = product.weight * product.carbonFactor;
    const shippingFootprint = calculateShippingEmissions(product);
    return total + productFootprint + shippingFootprint;
  }, 0);
};`,
        description: 'Función para calcular la huella de carbono de una compra'
      }
    ],
    liveUrl: 'https://ecoshop-demo.vercel.app',
    githubUrl: 'https://github.com/softcrown/ecoshop',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-20'),
    status: 'published',
    featured: true,
    views: 1250,
    likes: 89,
    tags: ['ecommerce', 'sustainability', 'react', 'nextjs'],
    seoTitle: 'EcoShop - Plataforma E-commerce Sostenible | SoftCrown Portfolio',
    seoDescription: 'Descubre cómo desarrollamos EcoShop, una innovadora tienda online enfocada en productos sostenibles con sistema de puntos ecológicos.'
  },
  {
    id: '2',
    title: 'DataViz Pro - Dashboard Analytics',
    slug: 'dataviz-pro-dashboard',
    description: 'Dashboard avanzado para visualización de datos empresariales con gráficos interactivos y reportes en tiempo real.',
    longDescription: 'DataViz Pro es una solución completa de business intelligence que transforma datos complejos en insights accionables. Con más de 20 tipos de gráficos interactivos, reportes automatizados y alertas en tiempo real.',
    images: [
      { id: '4', url: '/images/projects/dataviz/dashboard.jpg', alt: 'Main Dashboard', width: 1920, height: 1080, order: 1 },
      { id: '5', url: '/images/projects/dataviz/charts.jpg', alt: 'Interactive Charts', width: 1920, height: 1080, order: 2 },
    ],
    technologies: [mockTechnologies[0], mockTechnologies[2], mockTechnologies[3], mockTechnologies[5]],
    category: mockCategories[3],
    client: 'TechCorp Analytics',
    duration: '6 meses',
    budget: '$45,000',
    features: [
      'Más de 20 tipos de gráficos interactivos',
      'Reportes automatizados',
      'Alertas en tiempo real',
      'Exportación a múltiples formatos',
      'API REST completa',
      'Sistema de permisos granular'
    ],
    challenges: [
      'Renderizado eficiente de grandes datasets',
      'Sincronización en tiempo real',
      'Compatibilidad cross-browser para gráficos'
    ],
    solutions: [
      'Implementación de WebGL para renderizado',
      'WebSockets para actualizaciones en vivo',
      'Polyfills y fallbacks para navegadores legacy'
    ],
    codeSnippets: [
      {
        id: '2',
        title: 'Hook para Datos en Tiempo Real',
        language: 'typescript',
        code: `const useRealTimeData = (endpoint: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const ws = new WebSocket(\`ws://api.dataviz.com/\${endpoint}\`);
    
    ws.onmessage = (event) => {
      setData(JSON.parse(event.data));
      setLoading(false);
    };
    
    return () => ws.close();
  }, [endpoint]);
  
  return { data, loading };
};`,
        description: 'Hook personalizado para manejar datos en tiempo real via WebSockets'
      }
    ],
    liveUrl: 'https://dataviz-pro.vercel.app',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-03-15'),
    status: 'published',
    featured: true,
    views: 890,
    likes: 67,
    tags: ['dashboard', 'analytics', 'dataviz', 'realtime'],
    seoTitle: 'DataViz Pro - Dashboard de Analytics Avanzado | SoftCrown',
    seoDescription: 'Explora nuestro dashboard de analytics con visualizaciones interactivas y reportes en tiempo real para empresas.'
  },
  {
    id: '3',
    title: 'FitTracker - App de Fitness',
    slug: 'fittracker-app-fitness',
    description: 'Aplicación móvil para seguimiento de ejercicios con IA para recomendaciones personalizadas.',
    longDescription: 'FitTracker combina tecnología de vanguardia con ciencia del deporte para ofrecer una experiencia de fitness completamente personalizada. Utiliza machine learning para adaptar rutinas según el progreso del usuario.',
    images: [
      { id: '6', url: '/images/projects/fittracker/mobile.jpg', alt: 'Mobile App Interface', width: 375, height: 812, order: 1 },
      { id: '7', url: '/images/projects/fittracker/workout.jpg', alt: 'Workout Screen', width: 375, height: 812, order: 2 },
    ],
    technologies: [mockTechnologies[10], mockTechnologies[2], mockTechnologies[4], mockTechnologies[6]],
    category: mockCategories[4],
    client: 'HealthTech Innovations',
    duration: '8 meses',
    budget: '$60,000',
    features: [
      'Seguimiento de ejercicios con IA',
      'Recomendaciones personalizadas',
      'Integración con wearables',
      'Social features y challenges',
      'Nutrición y planes de comida',
      'Analytics de progreso'
    ],
    challenges: [
      'Algoritmos de machine learning para móvil',
      'Sincronización offline/online',
      'Integración con múltiples dispositivos wearables'
    ],
    solutions: [
      'TensorFlow Lite para ML en dispositivo',
      'Redux Persist para estado offline',
      'SDK unificado para wearables'
    ],
    codeSnippets: [
      {
        id: '3',
        title: 'Algoritmo de Recomendación',
        language: 'python',
        code: `def recommend_workout(user_profile, workout_history, goals):
    # Análisis de patrones de usuario
    user_vector = create_user_vector(user_profile, workout_history)
    
    # Filtrado colaborativo
    similar_users = find_similar_users(user_vector)
    
    # Recomendaciones basadas en objetivos
    recommendations = []
    for goal in goals:
        goal_workouts = filter_by_goal(workouts, goal)
        scored_workouts = score_workouts(goal_workouts, user_vector)
        recommendations.extend(scored_workouts[:5])
    
    return deduplicate_and_rank(recommendations)`,
        description: 'Sistema de recomendación de ejercicios usando ML'
      }
    ],
    liveUrl: 'https://fittracker-app.com',
    githubUrl: 'https://github.com/softcrown/fittracker',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-04-10'),
    status: 'published',
    featured: false,
    views: 654,
    likes: 45,
    tags: ['mobile', 'fitness', 'ai', 'react-native'],
    seoTitle: 'FitTracker - App de Fitness con IA | SoftCrown Portfolio',
    seoDescription: 'Conoce FitTracker, nuestra app de fitness móvil con inteligencia artificial para recomendaciones personalizadas.'
  }
];

const initialFilters: PortfolioFilters = {
  technologies: [],
  categories: [],
  status: 'published',
  featured: null,
  search: '',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  limit: 6,
};

const initialState: PortfolioState = {
  projects: [],
  filteredProjects: [],
  selectedProject: null,
  filters: initialFilters,
  technologies: mockTechnologies,
  categories: mockCategories,
  loading: false,
  error: null,
  totalProjects: 0,
  hasMore: true,
  lightboxOpen: false,
  lightboxImageIndex: 0,
  adminMode: false,
};

// Fuzzy search function
const fuzzySearch = (query: string, projects: Project[]): SearchResult[] => {
  if (!query.trim()) return projects.map(project => ({ project, score: 1, matches: [] }));
  
  const searchTerms = query.toLowerCase().split(' ');
  
  return projects.map(project => {
    let score = 0;
    const matches: any[] = [];
    
    // Search in title (weight: 3)
    const titleMatches = searchTerms.filter(term => 
      project.title.toLowerCase().includes(term)
    );
    score += titleMatches.length * 3;
    
    // Search in description (weight: 2)
    const descMatches = searchTerms.filter(term => 
      project.description.toLowerCase().includes(term)
    );
    score += descMatches.length * 2;
    
    // Search in technologies (weight: 2)
    const techMatches = searchTerms.filter(term => 
      project.technologies.some(tech => tech.name.toLowerCase().includes(term))
    );
    score += techMatches.length * 2;
    
    // Search in tags (weight: 1)
    const tagMatches = searchTerms.filter(term => 
      project.tags.some(tag => tag.toLowerCase().includes(term))
    );
    score += tagMatches.length;
    
    return { project, score, matches };
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

const portfolioReducer = (state: PortfolioState, action: PortfolioAction): PortfolioState => {
  switch (action.type) {
    case 'SET_PROJECTS':
      return {
        ...state,
        projects: action.payload,
        filteredProjects: action.payload,
        totalProjects: action.payload.length,
      };
      
    case 'ADD_PROJECT':
      const newProjects = [action.payload, ...state.projects];
      return {
        ...state,
        projects: newProjects,
        filteredProjects: newProjects,
        totalProjects: newProjects.length,
      };
      
    case 'UPDATE_PROJECT':
      const updatedProjects = state.projects.map(p => 
        p.id === action.payload.id ? action.payload : p
      );
      return {
        ...state,
        projects: updatedProjects,
        filteredProjects: updatedProjects,
      };
      
    case 'DELETE_PROJECT':
      const remainingProjects = state.projects.filter(p => p.id !== action.payload);
      return {
        ...state,
        projects: remainingProjects,
        filteredProjects: remainingProjects,
        totalProjects: remainingProjects.length,
      };
      
    case 'SET_SELECTED_PROJECT':
      return {
        ...state,
        selectedProject: action.payload,
      };
      
    case 'SET_FILTERS':
      const newFilters = { ...state.filters, ...action.payload };
      let filtered = [...state.projects];
      
      // Apply filters
      if (newFilters.status !== 'all') {
        filtered = filtered.filter(p => p.status === newFilters.status);
      }
      
      if (newFilters.featured !== null) {
        filtered = filtered.filter(p => p.featured === newFilters.featured);
      }
      
      if (newFilters.categories.length > 0) {
        filtered = filtered.filter(p => 
          newFilters.categories.includes(p.category.id)
        );
      }
      
      if (newFilters.technologies.length > 0) {
        filtered = filtered.filter(p => 
          p.technologies.some(tech => newFilters.technologies.includes(tech.id))
        );
      }
      
      // Apply search
      if (newFilters.search.trim()) {
        const searchResults = fuzzySearch(newFilters.search, filtered);
        filtered = searchResults.map(result => result.project);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const aValue = a[newFilters.sortBy as keyof Project];
        const bValue = b[newFilters.sortBy as keyof Project];
        
        if (newFilters.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
      
      return {
        ...state,
        filters: newFilters,
        filteredProjects: filtered,
        hasMore: filtered.length > newFilters.page * newFilters.limit,
      };
      
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'OPEN_LIGHTBOX':
      return {
        ...state,
        lightboxOpen: true,
        lightboxImageIndex: action.payload,
      };
      
    case 'CLOSE_LIGHTBOX':
      return {
        ...state,
        lightboxOpen: false,
        lightboxImageIndex: 0,
      };
      
    case 'SET_ADMIN_MODE':
      return { ...state, adminMode: action.payload };
      
    case 'LOAD_MORE_PROJECTS':
      return {
        ...state,
        filteredProjects: [...state.filteredProjects, ...action.payload],
        hasMore: action.payload.length === state.filters.limit,
      };
      
    case 'LIKE_PROJECT':
      const likedProjects = state.projects.map(p => 
        p.id === action.payload ? { ...p, likes: p.likes + 1 } : p
      );
      return {
        ...state,
        projects: likedProjects,
        filteredProjects: state.filteredProjects.map(p => 
          p.id === action.payload ? { ...p, likes: p.likes + 1 } : p
        ),
      };
      
    case 'INCREMENT_VIEWS':
      const viewedProjects = state.projects.map(p => 
        p.id === action.payload ? { ...p, views: p.views + 1 } : p
      );
      return {
        ...state,
        projects: viewedProjects,
      };
      
    default:
      return state;
  }
};

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export const PortfolioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);
  
  // Load projects from localStorage or API
  const loadProjects = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Load from localStorage or use mock data
      const savedProjects = localStorage.getItem('portfolio-projects');
      const projects = savedProjects ? JSON.parse(savedProjects) : mockProjects;
      
      dispatch({ type: 'SET_PROJECTS', payload: projects });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error loading projects' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);
  
  const loadMoreProjects = useCallback(async () => {
    // Simulate loading more projects
    const nextPage = state.filters.page + 1;
    const startIndex = (nextPage - 1) * state.filters.limit;
    const endIndex = startIndex + state.filters.limit;
    
    const moreProjects = state.projects.slice(startIndex, endIndex);
    
    dispatch({ type: 'LOAD_MORE_PROJECTS', payload: moreProjects });
    dispatch({ type: 'SET_FILTERS', payload: { page: nextPage } });
  }, [state.filters.page, state.filters.limit, state.projects]);
  
  const searchProjects = useCallback((query: string) => {
    dispatch({ type: 'SET_FILTERS', payload: { search: query, page: 1 } });
  }, []);
  
  const filterProjects = useCallback((filters: Partial<PortfolioFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: { ...filters, page: 1 } });
  }, []);
  
  const selectProject = useCallback((project: Project | null) => {
    dispatch({ type: 'SET_SELECTED_PROJECT', payload: project });
  }, []);
  
  const createProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      likes: 0,
    };
    
    dispatch({ type: 'ADD_PROJECT', payload: newProject });
    
    // Save to localStorage
    const updatedProjects = [newProject, ...state.projects];
    localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
    
    return newProject;
  }, [state.projects]);
  
  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    const updatedProject = state.projects.find(p => p.id === id);
    if (updatedProject) {
      const newProject = { ...updatedProject, ...updates, updatedAt: new Date() };
      dispatch({ type: 'UPDATE_PROJECT', payload: newProject });
      
      // Save to localStorage
      const updatedProjects = state.projects.map(p => p.id === id ? newProject : p);
      localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
    }
  }, [state.projects]);
  
  const deleteProject = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: id });
    
    // Save to localStorage
    const updatedProjects = state.projects.filter(p => p.id !== id);
    localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
  }, [state.projects]);
  
  const likeProject = useCallback((id: string) => {
    dispatch({ type: 'LIKE_PROJECT', payload: id });
    
    // Save to localStorage
    const updatedProjects = state.projects.map(p => 
      p.id === id ? { ...p, likes: p.likes + 1 } : p
    );
    localStorage.setItem('portfolio-projects', JSON.stringify(updatedProjects));
  }, [state.projects]);
  
  const incrementViews = useCallback((id: string) => {
    dispatch({ type: 'INCREMENT_VIEWS', payload: id });
  }, []);
  
  const openLightbox = useCallback((imageIndex: number) => {
    dispatch({ type: 'OPEN_LIGHTBOX', payload: imageIndex });
  }, []);
  
  const closeLightbox = useCallback(() => {
    dispatch({ type: 'CLOSE_LIGHTBOX' });
  }, []);
  
  const toggleAdminMode = useCallback(() => {
    dispatch({ type: 'SET_ADMIN_MODE', payload: !state.adminMode });
  }, [state.adminMode]);
  
  // Load projects on mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);
  
  const value: PortfolioContextType = {
    state,
    dispatch,
    loadProjects,
    loadMoreProjects,
    searchProjects,
    filterProjects,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    likeProject,
    incrementViews,
    openLightbox,
    closeLightbox,
    toggleAdminMode,
  };
  
  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = (): PortfolioContextType => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};
