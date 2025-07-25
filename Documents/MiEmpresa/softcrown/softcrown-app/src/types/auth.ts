// Authentication and user management types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  avatar?: string;
  company?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  projects: Project[];
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company?: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyEmailData {
  token: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in-progress' | 'review' | 'completed' | 'paused' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  clientId: string;
  assignedTo: string[];
  startDate: Date;
  endDate?: Date;
  estimatedHours: number;
  actualHours: number;
  budget: number;
  spent: number;
  progress: number; // 0-100
  milestones: Milestone[];
  files: ProjectFile[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  assignedTo: string[];
  deliverables: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'design' | 'document' | 'code' | 'image' | 'video' | 'other';
  isPublic: boolean;
  version: number;
  description?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  expiresAt?: Date;
}

export interface Invoice {
  id: string;
  clientId: string;
  projectId?: string;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  amount: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'client' | 'admin';
  content: string;
  type: 'text' | 'file' | 'system' | 'project_update' | 'client_feedback' | 'client_message';
  attachments?: MessageAttachment[];
  readBy: string[];
  createdAt: Date;
  updatedAt: Date;
  timestamp?: Date;
  recipientId?: string;
  subject?: string;
  isRead?: boolean;
  projectId?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Conversation {
  id: string;
  projectId?: string;
  participants: string[];
  title: string;
  lastMessage?: Message;
  unreadCount: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientDashboard {
  user: User;
  activeProjects: Project[];
  recentProjects: Project[];
  notifications: Notification[];
  unreadNotifications: number;
  invoices: Invoice[];
  pendingInvoices: Invoice[];
  messages: Message[];
  unreadMessages: number;
  conversations: Conversation[];
  stats: {
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    totalSpent: number;
    pendingPayments: number;
  };
}

export interface AdminDashboard {
  totalClients: number;
  activeProjects: number;
  totalRevenue: number;
  pendingInvoices: number;
  recentClients: User[];
  recentProjects: Project[];
  recentMessages: Message[];
  systemStats: {
    serverUptime: number;
    totalUsers: number;
    totalProjects: number;
    totalFiles: number;
    storageUsed: number;
  };
}

export interface Document {
  id: string;
  clientId: string;
  projectId?: string;
  name: string;
  type: 'contract' | 'manual' | 'credentials' | 'backup' | 'legal' | 'other';
  category: string;
  description?: string;
  url: string;
  size: number;
  isConfidential: boolean;
  accessLevel: 'client' | 'admin' | 'public';
  downloadCount: number;
  lastDownloaded?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  company: string;
  phone: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

// Security types
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
}

export interface CSRFToken {
  token: string;
  expiresAt: Date;
}

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
}

// Social login types
export interface SocialProvider {
  id: 'google' | 'github' | 'linkedin';
  name: string;
  icon: string;
  color: string;
}

export interface SocialLoginData {
  provider: string;
  accessToken: string;
  profile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
}
