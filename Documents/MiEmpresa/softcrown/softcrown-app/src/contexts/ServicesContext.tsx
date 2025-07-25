'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { 
  Service, 
  ServiceState, 
  ServiceAction, 
  ServiceContextType, 
  ServiceFilter,
  ServiceConfiguration,
  Feature,
  AddOn,
  ServiceCategory
} from '@/types/services';

// Initial state
const initialState: ServiceState = {
  services: [],
  filteredServices: [],
  selectedServices: [],
  comparison: null,
  configuration: null,
  filters: {
    categories: [],
    priceRange: [0, 50000],
    duration: [],
    difficulty: [],
    features: [],
    rating: 0,
  },
  searchQuery: '',
  sortBy: 'popularity',
  sortOrder: 'desc',
  loading: false,
  error: null,
};

// History for undo/redo functionality
interface StateHistory {
  past: ServiceState[];
  present: ServiceState;
  future: ServiceState[];
}

const initialHistory: StateHistory = {
  past: [],
  present: initialState,
  future: [],
};

// Reducer function
function servicesReducer(state: ServiceState, action: ServiceAction): ServiceState {
  switch (action.type) {
    case 'SET_SERVICES':
      return {
        ...state,
        services: action.payload,
        filteredServices: action.payload,
        loading: false,
      };

    case 'SET_FILTERED_SERVICES':
      return {
        ...state,
        filteredServices: action.payload,
      };

    case 'ADD_TO_COMPARISON':
      const serviceToAdd = action.payload;
      if (state.selectedServices.length >= 3) {
        return {
          ...state,
          error: 'Máximo 3 servicios para comparar',
        };
      }
      if (state.selectedServices.find(s => s.id === serviceToAdd.id)) {
        return state;
      }
      return {
        ...state,
        selectedServices: [...state.selectedServices, serviceToAdd],
        comparison: {
          services: [...state.selectedServices, serviceToAdd],
          selectedFeatures: [],
        },
        error: null,
      };

    case 'REMOVE_FROM_COMPARISON':
      const filteredServices = state.selectedServices.filter(s => s.id !== action.payload);
      return {
        ...state,
        selectedServices: filteredServices,
        comparison: filteredServices.length > 0 ? {
          services: filteredServices,
          selectedFeatures: state.comparison?.selectedFeatures || [],
        } : null,
      };

    case 'CLEAR_COMPARISON':
      return {
        ...state,
        selectedServices: [],
        comparison: null,
      };

    case 'SET_CONFIGURATION':
      return {
        ...state,
        configuration: action.payload,
      };

    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };

    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// History reducer for undo/redo
function historyReducer(history: StateHistory, action: ServiceAction): StateHistory {
  const { past, present, future } = history;

  switch (action.type) {
    case 'UNDO':
      if (past.length === 0) return history;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [present, ...future],
      };

    case 'REDO':
      if (future.length === 0) return history;
      const next = future[0];
      const newFuture = future.slice(1);
      return {
        past: [...past, present],
        present: next,
        future: newFuture,
      };

    case 'RESET_STATE':
      return initialHistory;

    default:
      // For actions that modify state, add current state to history
      if (['ADD_TO_COMPARISON', 'REMOVE_FROM_COMPARISON', 'SET_CONFIGURATION', 'UPDATE_FILTERS'].includes(action.type)) {
        const newPresent = servicesReducer(present, action);
        if (newPresent === present) return history;
        
        return {
          past: [...past, present],
          present: newPresent,
          future: [],
        };
      }
      
      return {
        ...history,
        present: servicesReducer(present, action),
      };
  }
}

// Mock services data
const mockServices: Service[] = [
  {
    id: 'web-custom',
    name: 'Desarrollo Web Custom',
    description: 'Desarrollo de aplicaciones web personalizadas con tecnologías modernas como React, Next.js y TypeScript.',
    shortDescription: 'Aplicaciones web personalizadas y escalables',
    basePrice: 8000,
    priceType: 'project',
    duration: '8-12 semanas',
    category: 'desarrollo-web',
    difficulty: 'advanced',
    rating: 4.9,
    reviewCount: 127,
    popular: true,
    featured: true,
    tags: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    deliverables: ['Código fuente', 'Documentación', 'Testing', 'Deployment'],
    technologies: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB'],
    portfolio: [
      { id: '1', title: 'E-commerce Platform', image: '/portfolio/ecommerce.jpg' },
      { id: '2', title: 'SaaS Dashboard', image: '/portfolio/saas.jpg' },
    ],
    features: [
      {
        id: 'responsive',
        name: 'Diseño Responsive',
        description: 'Adaptable a todos los dispositivos',
        included: true,
        icon: '📱',
        category: 'essential',
      },
      {
        id: 'seo',
        name: 'SEO Optimizado',
        description: 'Optimización para motores de búsqueda',
        included: true,
        icon: '🔍',
        category: 'essential',
      },
      {
        id: 'admin',
        name: 'Panel de Administración',
        description: 'Dashboard para gestión de contenido',
        included: false,
        price: 2000,
        icon: '⚙️',
        category: 'premium',
      },
    ],
    addOns: [
      {
        id: 'maintenance',
        name: 'Mantenimiento Mensual',
        description: 'Actualizaciones y soporte técnico',
        price: 500,
        duration: '1 mes',
        category: 'mantenimiento',
        features: ['Actualizaciones', 'Backup', 'Monitoreo'],
      },
    ],
  },
  {
    id: 'ui-ux-design',
    name: 'Diseño UI/UX',
    description: 'Diseño de interfaces de usuario intuitivas y experiencias excepcionales.',
    shortDescription: 'Interfaces modernas y experiencias únicas',
    basePrice: 3500,
    priceType: 'project',
    duration: '4-6 semanas',
    category: 'diseno-ui-ux',
    difficulty: 'intermediate',
    rating: 4.8,
    reviewCount: 89,
    popular: true,
    tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
    deliverables: ['Wireframes', 'Mockups', 'Prototipos', 'Design System'],
    technologies: ['Figma', 'Adobe Creative Suite', 'Principle', 'InVision'],
    portfolio: [
      { id: '3', title: 'Mobile Banking App', image: '/portfolio/banking.jpg' },
      { id: '4', title: 'Food Delivery UI', image: '/portfolio/food.jpg' },
    ],
    features: [
      {
        id: 'wireframes',
        name: 'Wireframes',
        description: 'Estructura y layout de páginas',
        included: true,
        icon: '📐',
        category: 'essential',
      },
      {
        id: 'prototypes',
        name: 'Prototipos Interactivos',
        description: 'Prototipos clickeables para testing',
        included: true,
        icon: '🎯',
        category: 'essential',
      },
      {
        id: 'design-system',
        name: 'Design System',
        description: 'Sistema de componentes reutilizables',
        included: false,
        price: 1500,
        icon: '🎨',
        category: 'premium',
      },
    ],
    addOns: [
      {
        id: 'user-testing',
        name: 'User Testing',
        description: 'Pruebas con usuarios reales',
        price: 800,
        duration: '2 semanas',
        category: 'diseno-ui-ux',
        features: ['5 usuarios', 'Reporte detallado', 'Recomendaciones'],
      },
    ],
  },
  {
    id: 'ecommerce-solution',
    name: 'E-commerce Solutions',
    description: 'Tiendas online completas con gestión de productos, pagos y envíos.',
    shortDescription: 'Tiendas online completas y optimizadas',
    basePrice: 12000,
    priceType: 'project',
    duration: '10-16 semanas',
    category: 'ecommerce',
    difficulty: 'enterprise',
    rating: 4.9,
    reviewCount: 156,
    featured: true,
    tags: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal'],
    deliverables: ['Tienda completa', 'Panel admin', 'Integración pagos', 'SEO'],
    technologies: ['Next.js', 'Stripe', 'MongoDB', 'Vercel'],
    portfolio: [
      { id: '5', title: 'Fashion Store', image: '/portfolio/fashion.jpg' },
      { id: '6', title: 'Electronics Shop', image: '/portfolio/electronics.jpg' },
    ],
    features: [
      {
        id: 'product-catalog',
        name: 'Catálogo de Productos',
        description: 'Gestión completa de productos',
        included: true,
        icon: '📦',
        category: 'essential',
      },
      {
        id: 'payment-gateway',
        name: 'Pasarela de Pagos',
        description: 'Integración con Stripe/PayPal',
        included: true,
        icon: '💳',
        category: 'essential',
      },
      {
        id: 'inventory',
        name: 'Gestión de Inventario',
        description: 'Control de stock automático',
        included: false,
        price: 2500,
        icon: '📊',
        category: 'premium',
      },
    ],
    addOns: [
      {
        id: 'marketing-tools',
        name: 'Herramientas de Marketing',
        description: 'Email marketing y cupones',
        price: 1500,
        duration: '3 semanas',
        category: 'ecommerce',
        features: ['Email campaigns', 'Cupones', 'Analytics'],
      },
    ],
  },
];

// Create context
const ServicesContext = createContext<ServiceContextType | undefined>(undefined);

// Provider component
export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, dispatchHistory] = useReducer(historyReducer, initialHistory);
  const { present: state } = history;

  // Initialize services
  useEffect(() => {
    dispatchHistory({ type: 'SET_SERVICES', payload: mockServices });
  }, []);

  // Filter and search services
  useEffect(() => {
    let filtered = [...state.services];

    // Apply category filter
    if (state.filters.categories.length > 0) {
      filtered = filtered.filter(service => 
        state.filters.categories.includes(service.category)
      );
    }

    // Apply price range filter
    filtered = filtered.filter(service => 
      service.basePrice >= state.filters.priceRange[0] && 
      service.basePrice <= state.filters.priceRange[1]
    );

    // Apply difficulty filter
    if (state.filters.difficulty.length > 0) {
      filtered = filtered.filter(service => 
        state.filters.difficulty.includes(service.difficulty)
      );
    }

    // Apply rating filter
    if (state.filters.rating > 0) {
      filtered = filtered.filter(service => service.rating >= state.filters.rating);
    }

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (state.sortBy) {
        case 'price':
          comparison = a.basePrice - b.basePrice;
          break;
        case 'rating':
          comparison = a.rating - b.rating;
          break;
        case 'popularity':
          comparison = a.reviewCount - b.reviewCount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }
      return state.sortOrder === 'asc' ? comparison : -comparison;
    });

    dispatchHistory({ type: 'SET_FILTERED_SERVICES', payload: filtered });
  }, [state.services, state.filters, state.searchQuery, state.sortBy, state.sortOrder]);

  // Context methods
  const addToComparison = useCallback((service: Service) => {
    dispatchHistory({ type: 'ADD_TO_COMPARISON', payload: service });
  }, []);

  const removeFromComparison = useCallback((serviceId: string) => {
    dispatchHistory({ type: 'REMOVE_FROM_COMPARISON', payload: serviceId });
  }, []);

  const clearComparison = useCallback(() => {
    dispatchHistory({ type: 'CLEAR_COMPARISON' });
  }, []);

  const configureService = useCallback((config: ServiceConfiguration) => {
    dispatchHistory({ type: 'SET_CONFIGURATION', payload: config });
  }, []);

  const updateFilters = useCallback((filters: Partial<ServiceFilter>) => {
    dispatchHistory({ type: 'UPDATE_FILTERS', payload: filters });
  }, []);

  const searchServices = useCallback((query: string) => {
    dispatchHistory({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const sortServices = useCallback((sortBy: ServiceState['sortBy'], order: ServiceState['sortOrder']) => {
    dispatchHistory({ type: 'SET_SORT', payload: { sortBy, sortOrder: order } });
  }, []);

  const calculatePrice = useCallback((service: Service, features: Feature[], addOns: AddOn[]): number => {
    let total = service.basePrice;
    
    features.forEach(feature => {
      if (feature.price && !feature.included) {
        total += feature.price;
      }
    });

    addOns.forEach(addOn => {
      total += addOn.price;
    });

    return total;
  }, []);

  const estimateDuration = useCallback((service: Service, features: Feature[], addOns: AddOn[]): string => {
    // Simple duration estimation logic
    const baseDuration = parseInt(service.duration.split('-')[0]);
    const additionalWeeks = Math.floor((features.length + addOns.length) * 0.5);
    const totalWeeks = baseDuration + additionalWeeks;
    
    return `${totalWeeks}-${totalWeeks + 4} semanas`;
  }, []);

  const getRecommendations = useCallback((service: Service): Service[] => {
    return state.services
      .filter(s => s.id !== service.id && s.category === service.category)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [state.services]);

  const undo = useCallback(() => {
    dispatchHistory({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatchHistory({ type: 'REDO' });
  }, []);

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem('softcrown-services-state', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [state]);

  const loadFromStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem('softcrown-services-state');
      if (saved) {
        const parsedState = JSON.parse(saved);
        dispatchHistory({ type: 'SET_SERVICES', payload: parsedState.services || mockServices });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state, saveToStorage]);

  const contextValue: ServiceContextType = {
    state,
    dispatch: dispatchHistory,
    addToComparison,
    removeFromComparison,
    clearComparison,
    configureService,
    updateFilters,
    searchServices,
    sortServices,
    calculatePrice,
    estimateDuration,
    getRecommendations,
    undo,
    redo,
    saveToStorage,
    loadFromStorage,
  };

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  );
};

// Custom hook
export const useServices = (): ServiceContextType => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};
