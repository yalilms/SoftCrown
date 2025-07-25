export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  website?: string;
}

export interface ProjectDetails {
  projectType: 'web-development' | 'mobile-app' | 'ecommerce' | 'branding' | 'consulting' | 'other';
  description: string;
  features: string[];
  targetAudience: string;
  competitors?: string;
  inspiration?: string;
  files?: File[];
}

export interface BudgetInfo {
  range: 'under-5k' | '5k-15k' | '15k-30k' | '30k-50k' | 'over-50k' | 'custom';
  customAmount?: number;
  currency: 'EUR' | 'USD';
  paymentPreference: 'upfront' | 'milestone' | 'monthly' | 'completion';
  hasExistingBudget: boolean;
}

export interface ContactForm {
  personalInfo: PersonalInfo;
  projectDetails: ProjectDetails;
  budget: BudgetInfo;
  timeline: string;
  additionalInfo: string;
  preferredContact: 'email' | 'phone' | 'whatsapp' | 'video-call';
  marketingConsent: boolean;
}

export interface ContactInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  website?: string;
  source: 'website' | 'referral' | 'social' | 'advertising' | 'other';
  tags: string[];
}

export interface ProjectRequirements {
  type: string;
  description: string;
  features: string[];
  budget: BudgetInfo;
  timeline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in-review' | 'quoted' | 'approved' | 'in-progress' | 'completed' | 'cancelled';
}

export interface Interaction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'chat' | 'note';
  subject: string;
  content: string;
  timestamp: Date;
  userId: string;
  attachments?: string[];
  outcome?: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost' | 'nurturing';

export interface Lead {
  id: string;
  contact: ContactInfo;
  project: ProjectRequirements;
  status: LeadStatus;
  score: number;
  interactions: Interaction[];
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  nextFollowUp?: Date;
  estimatedValue: number;
  probability: number;
  source: string;
  notes: string;
}

export interface QuoteItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'development' | 'design' | 'consulting' | 'maintenance' | 'hosting';
}

export interface Quote {
  id: string;
  leadId: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: 'EUR' | 'USD';
  validUntil: Date;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  terms: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'image' | 'system';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
}

export interface ChatSession {
  id: string;
  leadId?: string;
  visitorId: string;
  status: 'active' | 'closed' | 'transferred';
  messages: ChatMessage[];
  startedAt: Date;
  endedAt?: Date;
  assignedAgent?: string;
  tags: string[];
  rating?: number;
  feedback?: string;
}

export interface CalendarBooking {
  id: string;
  leadId?: string;
  contactEmail: string;
  contactName: string;
  meetingType: 'consultation' | 'demo' | 'follow-up' | 'project-review';
  scheduledAt: Date;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  meetingLink?: string;
  notes?: string;
  reminders: boolean;
}

export interface FormStep {
  id: number;
  title: string;
  description: string;
  isComplete: boolean;
  isActive: boolean;
  fields: string[];
}

export interface FormProgress {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  isValid: boolean;
  savedAt?: Date;
}
