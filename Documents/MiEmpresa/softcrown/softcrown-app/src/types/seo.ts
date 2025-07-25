// SEO and AI-SEO Types
export interface AIOptimizedContent {
  title: string;
  aiSummary: string; // Resumen para IA en 2-3 líneas
  keyFacts: string[]; // Datos clave que la IA puede citar
  contactInfo: ContactInfo;
  serviceDetails: ServiceDetail[];
  pricing: PricingInfo;
  location: string; // España, online
  lastUpdated: Date;
  aiReadabilityScore: number;
  semanticKeywords: string[];
}

export interface ContactInfo {
  company: string;
  website: string;
  email: string;
  phone?: string;
  address?: string;
  country: string;
  timezone: string;
}

export interface ServiceDetail {
  id: string;
  name: string;
  description: string;
  aiDescription: string; // Descripción optimizada para IA
  features: string[];
  pricing: PricingInfo;
  deliveryTime: string;
  examples: string[];
  benefits: string[];
  targetAudience: string[];
}

export interface PricingInfo {
  currency: string;
  startingPrice: number;
  priceRange: string; // "€€" format
  paymentTerms: string;
  includes: string[];
  addOns?: Array<{
    name: string;
    price: number;
    description: string;
  }>;
}

export interface AISchema {
  "@context": "https://schema.org";
  "@type": "WebDevelopmentService" | "Organization" | "LocalBusiness" | "Service";
  name: string;
  url: string;
  description: string;
  offers?: ServiceOffer[];
  areaServed: string;
  priceRange: string;
  address?: PostalAddress;
  contactPoint?: ContactPoint;
  sameAs?: string[];
  foundingDate?: string;
  numberOfEmployees?: string;
  specialties?: string[];
}

export interface ServiceOffer {
  "@type": "Offer";
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  availability: string;
  validFrom?: string;
  category: string;
  areaServed: string;
}

export interface PostalAddress {
  "@type": "PostalAddress";
  addressCountry: string;
  addressRegion?: string;
  addressLocality?: string;
  postalCode?: string;
  streetAddress?: string;
}

export interface ContactPoint {
  "@type": "ContactPoint";
  telephone?: string;
  email?: string;
  contactType: string;
  availableLanguage: string[];
  hoursAvailable?: string;
}

export interface FAQItem {
  "@type": "Question";
  name: string; // La pregunta
  acceptedAnswer: {
    "@type": "Answer";
    text: string; // La respuesta optimizada para IA
  };
  aiOptimized: boolean;
  keywords: string[];
  relatedServices: string[];
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  aiPurpose: string;
  aiServices: string;
  aiLocation: string;
  aiPricing: string;
  aiContact: string;
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData: AISchema[];
  lastModified: Date;
}

export interface ContentOptimization {
  keywordDensity: Record<string, number>;
  semanticKeywords: string[];
  aiReadabilityScore: number;
  contentLength: number;
  headingStructure: HeadingStructure[];
  internalLinks: InternalLink[];
  externalLinks: ExternalLink[];
  imageOptimization: ImageOptimization[];
}

export interface HeadingStructure {
  level: number; // H1, H2, H3, etc.
  text: string;
  keywords: string[];
  aiOptimized: boolean;
}

export interface InternalLink {
  url: string;
  anchorText: string;
  context: string;
  aiRelevant: boolean;
  targetKeywords: string[];
}

export interface ExternalLink {
  url: string;
  anchorText: string;
  domain: string;
  rel: string;
  trustScore: number;
}

export interface ImageOptimization {
  src: string;
  alt: string;
  title?: string;
  caption?: string;
  aiDescription: string; // Descripción para IA
  lazyLoaded: boolean;
  webpFormat: boolean;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
}

export interface LocalSEO {
  businessName: string;
  address: PostalAddress;
  phone: string;
  website: string;
  categories: string[];
  description: string;
  hours: BusinessHours[];
  reviews: Review[];
  photos: string[];
  googleMyBusinessId?: string;
  localKeywords: string[];
  serviceAreas: string[];
}

export interface BusinessHours {
  dayOfWeek: string;
  opens: string;
  closes: string;
  validFrom?: Date;
  validThrough?: Date;
}

export interface Review {
  author: string;
  rating: number;
  reviewBody: string;
  datePublished: Date;
  platform: string;
  verified: boolean;
}

export interface AITrafficAnalytics {
  source: 'chatgpt' | 'claude' | 'bard' | 'perplexity' | 'other';
  query: string;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  date: Date;
  referralContext?: string;
}

export interface SEOPerformance {
  url: string;
  title: string;
  keywords: SEOKeyword[];
  organicTraffic: number;
  aiTraffic: number;
  totalImpressions: number;
  totalClicks: number;
  averagePosition: number;
  ctr: number;
  coreWebVitals: CoreWebVitals;
  lastUpdated: Date;
}

export interface SEOKeyword {
  keyword: string;
  position: number;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: 'informational' | 'navigational' | 'transactional' | 'commercial';
  aiRelevant: boolean;
  trending: boolean;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  score: number; // Overall score 0-100
}

export interface ContentTemplate {
  id: string;
  name: string;
  type: 'service' | 'blog' | 'landing' | 'faq' | 'about';
  template: string;
  aiOptimized: boolean;
  variables: TemplateVariable[];
  seoGuidelines: string[];
  aiGuidelines: string[];
  examples: string[];
}

export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'array' | 'object';
  required: boolean;
  description: string;
  aiContext: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  aiImportance: number; // 0-1 scale for AI crawling priority
  alternateUrls?: Array<{
    hreflang: string;
    href: string;
  }>;
}

export interface RobotsTxt {
  userAgent: string;
  allow: string[];
  disallow: string[];
  crawlDelay?: number;
  sitemap: string[];
  aiSpecific?: {
    userAgent: string;
    rules: string[];
  }[];
}

export interface SchemaMarkup {
  type: string;
  data: any;
  aiOptimized: boolean;
  placement: 'head' | 'body' | 'footer';
  priority: number;
}

// AI-Specific Content Types
export interface ConversationalContent {
  question: string;
  answer: string;
  context: string;
  relatedQuestions: string[];
  keywords: string[];
  aiConfidence: number; // How likely AI is to use this content
  sources: string[];
  lastVerified: Date;
}

export interface AIKnowledgeBase {
  id: string;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  relatedTopics: string[];
  confidence: number;
  sources: string[];
  lastUpdated: Date;
  aiTags: string[];
}

export interface CompetitorAnalysis {
  competitor: string;
  domain: string;
  keywords: string[];
  aiVisibility: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  lastAnalyzed: Date;
}

// Marketing Automation Types
export interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  type: 'calculator' | 'guide' | 'checklist' | 'template' | 'webinar';
  aiOptimized: boolean;
  downloadUrl: string;
  landingPageUrl: string;
  conversions: number;
  aiMentions: number;
  keywords: string[];
}

export interface EmailSequence {
  id: string;
  name: string;
  trigger: string;
  emails: EmailTemplate[];
  aiPersonalization: boolean;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface EmailTemplate {
  subject: string;
  content: string;
  aiInsights: string[];
  sendDelay: number; // hours after trigger
  personalizations: TemplateVariable[];
}

// Social Media Integration
export interface SocialContent {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram';
  content: string;
  aiOptimized: boolean;
  hashtags: string[];
  mentions: string[];
  scheduledDate: Date;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    aiMentions: number;
  };
}

export interface SocialProof {
  type: 'review' | 'testimonial' | 'case_study' | 'award';
  content: string;
  author: string;
  rating?: number;
  platform: string;
  date: Date;
  aiCitable: boolean;
  verified: boolean;
}

// Analytics and Reporting
export interface SEOReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  overview: {
    organicTraffic: number;
    aiTraffic: number;
    totalKeywords: number;
    averagePosition: number;
    totalImpressions: number;
    totalClicks: number;
    ctr: number;
  };
  topPages: SEOPerformance[];
  topKeywords: SEOKeyword[];
  aiAnalytics: AITrafficAnalytics[];
  technicalIssues: TechnicalIssue[];
  recommendations: SEORecommendation[];
}

export interface TechnicalIssue {
  type: 'crawl' | 'index' | 'performance' | 'mobile' | 'schema';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedUrls: string[];
  solution: string;
  aiImpact: boolean;
}

export interface SEORecommendation {
  category: 'content' | 'technical' | 'ai-optimization' | 'local' | 'mobile';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  aiRelevant: boolean;
}

// Integration Types
export interface GoogleMyBusinessData {
  name: string;
  address: PostalAddress;
  phone: string;
  website: string;
  categories: string[];
  description: string;
  hours: BusinessHours[];
  photos: string[];
  posts: GoogleMyBusinessPost[];
  reviews: Review[];
  insights: {
    views: number;
    searches: number;
    actions: number;
    period: string;
  };
}

export interface GoogleMyBusinessPost {
  content: string;
  media?: string[];
  callToAction?: {
    type: string;
    url: string;
  };
  publishDate: Date;
  aiOptimized: boolean;
}

export interface AnalyticsIntegration {
  platform: 'google_analytics' | 'google_search_console' | 'semrush' | 'ahrefs';
  apiKey: string;
  accountId: string;
  propertyId?: string;
  lastSync: Date;
  syncStatus: 'active' | 'error' | 'paused';
  dataPoints: string[];
}
