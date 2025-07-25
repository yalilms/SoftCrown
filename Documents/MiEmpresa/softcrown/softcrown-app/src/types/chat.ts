// Chat types and interfaces for AI chatbot

export interface MessageMetadata {
  confidence?: number;
  intent?: string;
  entities?: Record<string, any>;
  language?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  handoffRequested?: boolean;
  audioUrl?: string;
  voiceEnabled?: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface ChatContext {
  userId?: string;
  sessionId: string;
  currentIntent?: string;
  entities: Record<string, any>;
  conversationStage: 'greeting' | 'discovery' | 'qualification' | 'recommendation' | 'booking' | 'handoff' | 'completed';
  language: string;
  preferences: {
    serviceType?: string;
    budget?: number;
    timeline?: string;
    industry?: string;
  };
  leadScore: number;
  previousInteractions: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  context: ChatContext;
  leadData?: Partial<Lead>;
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'transferred' | 'completed' | 'abandoned';
}

export interface Lead {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  projectType?: string;
  budget?: number;
  timeline?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  notes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotConfig {
  aiProvider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  fallbackResponses: string[];
  enableVoice: boolean;
  enableHandoff: boolean;
  supportedLanguages: string[];
  confidenceThreshold: number;
}

export interface ServiceRecommendation {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  features: string[];
  timeline: string;
  confidence: number;
  reasons: string[];
}

export interface PriceEstimation {
  basePrice: number;
  features: Array<{
    name: string;
    price: number;
    included: boolean;
  }>;
  total: number;
  timeline: string;
  confidence: number;
  factors: string[];
}

export interface AppointmentSlot {
  id: string;
  date: Date;
  duration: number;
  type: 'consultation' | 'demo' | 'follow-up';
  available: boolean;
  meetingUrl?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  confidence: number;
}

export interface ChatbotAnalytics {
  sessionId: string;
  totalMessages: number;
  userMessages: number;
  botMessages: number;
  sessionDuration: number;
  intentsDetected: string[];
  leadGenerated: boolean;
  handoffRequested: boolean;
  satisfactionScore?: number;
  conversionEvents: string[];
}

export interface VoiceConfig {
  enabled: boolean;
  language: string;
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
  autoSpeak: boolean;
}

export interface ChatWidget {
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme: 'light' | 'dark' | 'auto';
  showTypingIndicator: boolean;
  showOnlineStatus: boolean;
  unreadCount: number;
}
