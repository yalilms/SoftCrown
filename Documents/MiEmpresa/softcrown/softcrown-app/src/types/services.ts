export type ServiceCategory = 
  | 'desarrollo-web'
  | 'diseno-ui-ux'
  | 'ecommerce'
  | 'mantenimiento'
  | 'seo'
  | 'mobile-apps'
  | 'consultoria';

export type PriceType = 'fixed' | 'hourly' | 'project';

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced' | 'enterprise';

export interface Feature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  price?: number;
  icon: string;
  category: 'essential' | 'premium' | 'enterprise';
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: ServiceCategory;
  features: string[];
  popular?: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  basePrice: number;
  priceType: PriceType;
  duration: string;
  features: Feature[];
  category: ServiceCategory;
  addOns: AddOn[];
  difficulty: DifficultyLevel;
  rating: number;
  reviewCount: number;
  popular?: boolean;
  featured?: boolean;
  tags: string[];
  deliverables: string[];
  technologies: string[];
  portfolio: {
    id: string;
    title: string;
    image: string;
    url?: string;
  }[];
}

export interface ServiceFilter {
  categories: ServiceCategory[];
  priceRange: [number, number];
  duration: string[];
  difficulty: DifficultyLevel[];
  features: string[];
  rating: number;
}

export interface ServiceComparison {
  services: Service[];
  selectedFeatures: string[];
}

export interface ServiceConfiguration {
  service: Service;
  selectedFeatures: Feature[];
  selectedAddOns: AddOn[];
  customizations: Record<string, any>;
  totalPrice: number;
  estimatedDuration: string;
}

export interface ServiceState {
  services: Service[];
  filteredServices: Service[];
  selectedServices: Service[];
  comparison: ServiceComparison | null;
  configuration: ServiceConfiguration | null;
  filters: ServiceFilter;
  searchQuery: string;
  sortBy: 'price' | 'rating' | 'popularity' | 'name';
  sortOrder: 'asc' | 'desc';
  loading: boolean;
  error: string | null;
}

export interface ServiceAction {
  type: 
    | 'SET_SERVICES'
    | 'SET_FILTERED_SERVICES'
    | 'ADD_TO_COMPARISON'
    | 'REMOVE_FROM_COMPARISON'
    | 'CLEAR_COMPARISON'
    | 'SET_CONFIGURATION'
    | 'UPDATE_FILTERS'
    | 'SET_SEARCH_QUERY'
    | 'SET_SORT'
    | 'SET_LOADING'
    | 'SET_ERROR'
    | 'UNDO'
    | 'REDO'
    | 'RESET_STATE';
  payload?: any;
}

export interface ServiceContextType {
  state: ServiceState;
  dispatch: React.Dispatch<ServiceAction>;
  addToComparison: (service: Service) => void;
  removeFromComparison: (serviceId: string) => void;
  clearComparison: () => void;
  configureService: (config: ServiceConfiguration) => void;
  updateFilters: (filters: Partial<ServiceFilter>) => void;
  searchServices: (query: string) => void;
  sortServices: (sortBy: ServiceState['sortBy'], order: ServiceState['sortOrder']) => void;
  calculatePrice: (service: Service, features: Feature[], addOns: AddOn[]) => number;
  estimateDuration: (service: Service, features: Feature[], addOns: AddOn[]) => string;
  getRecommendations: (service: Service) => Service[];
  undo: () => void;
  redo: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
}
