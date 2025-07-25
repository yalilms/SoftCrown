export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  thumbnail?: string;
  order: number;
}

export interface Technology {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'design' | 'mobile';
  proficiency: number; // 1-5
}

export interface ProjectCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  images: ProjectImage[];
  technologies: Technology[];
  category: ProjectCategory;
  client: string;
  duration: string;
  budget: string;
  features: string[];
  challenges: string[];
  solutions: string[];
  codeSnippets: CodeSnippet[];
  liveUrl?: string;
  githubUrl?: string;
  figmaUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published';
  featured: boolean;
  views: number;
  likes: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  socialImage?: string;
}

export interface PortfolioFilters {
  technologies: string[];
  categories: string[];
  status: 'all' | 'draft' | 'published';
  featured: boolean | null;
  search: string;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'views' | 'likes';
  sortOrder: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface PortfolioState {
  projects: Project[];
  filteredProjects: Project[];
  selectedProject: Project | null;
  filters: PortfolioFilters;
  technologies: Technology[];
  categories: ProjectCategory[];
  loading: boolean;
  error: string | null;
  totalProjects: number;
  hasMore: boolean;
  lightboxOpen: boolean;
  lightboxImageIndex: number;
  adminMode: boolean;
}

export type PortfolioAction =
  | { type: 'SET_PROJECTS'; payload: Project[] }
  | { type: 'ADD_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: Project }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'SET_SELECTED_PROJECT'; payload: Project | null }
  | { type: 'SET_FILTERS'; payload: Partial<PortfolioFilters> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'OPEN_LIGHTBOX'; payload: number }
  | { type: 'CLOSE_LIGHTBOX' }
  | { type: 'SET_ADMIN_MODE'; payload: boolean }
  | { type: 'LOAD_MORE_PROJECTS'; payload: Project[] }
  | { type: 'LIKE_PROJECT'; payload: string }
  | { type: 'INCREMENT_VIEWS'; payload: string };

export interface PortfolioContextType {
  state: PortfolioState;
  dispatch: React.Dispatch<PortfolioAction>;
  // Actions
  loadProjects: () => Promise<void>;
  loadMoreProjects: () => Promise<void>;
  searchProjects: (query: string) => void;
  filterProjects: (filters: Partial<PortfolioFilters>) => void;
  selectProject: (project: Project | null) => void;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  likeProject: (id: string) => void;
  incrementViews: (id: string) => void;
  openLightbox: (imageIndex: number) => void;
  closeLightbox: () => void;
  toggleAdminMode: () => void;
}

// Mock data interfaces
export interface MockProjectData {
  projects: Project[];
  technologies: Technology[];
  categories: ProjectCategory[];
}

// Upload interfaces
export interface ImageUploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

export interface UploadState {
  uploads: ImageUploadProgress[];
  isUploading: boolean;
}

// Search and filtering
export interface SearchResult {
  project: Project;
  score: number;
  matches: {
    field: string;
    value: string;
    indices: number[][];
  }[];
}

// Analytics
export interface ProjectAnalytics {
  projectId: string;
  views: number;
  likes: number;
  shares: number;
  timeSpent: number;
  bounceRate: number;
  conversionRate: number;
  topReferrers: string[];
  deviceTypes: Record<string, number>;
  countries: Record<string, number>;
}

// SEO
export interface ProjectSEO {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  canonicalUrl: string;
  structuredData: any;
}
