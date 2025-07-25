// AI-SEO Optimization Service
import {
  AIOptimizedContent,
  AISchema,
  FAQItem,
  SEOMetadata,
  ContentOptimization,
  ConversationalContent,
  AIKnowledgeBase,
  ServiceDetail,
  ContactInfo,
  PricingInfo,
  SchemaMarkup
} from '@/types/seo';

export interface GenerateSchemaRequest {
  type: 'Organization' | 'LocalBusiness' | 'WebDevelopmentService' | 'FAQ' | 'Service';
  data: any;
  aiOptimized?: boolean;
}

export interface OptimizeContentRequest {
  content: string;
  targetKeywords: string[];
  aiKeywords: string[];
  contentType: 'service' | 'blog' | 'landing' | 'faq';
}

export interface AIContentAnalysis {
  aiReadabilityScore: number;
  semanticKeywords: string[];
  keyFacts: string[];
  aiSummary: string;
  conversationalScore: number;
  citabilityScore: number;
  recommendations: string[];
}

export class AISEOService {
  private softcrownData: ContactInfo = {
    company: 'SoftCrown',
    website: 'https://softcrown.es',
    email: 'info@softcrown.es',
    phone: '+34 900 123 456',
    address: 'España',
    country: 'España',
    timezone: 'Europe/Madrid',
  };

  private services: ServiceDetail[] = [
    {
      id: 'web-basico',
      name: 'Desarrollo Web Básico',
      description: 'Página web profesional con diseño responsive y optimización SEO básica',
      aiDescription: 'SoftCrown crea páginas web profesionales desde 299€ con diseño responsive, optimización SEO y hosting incluido durante el primer año.',
      features: ['Diseño responsive', 'SEO básico', 'Hosting 1 año', 'SSL certificado', 'Formulario contacto'],
      pricing: {
        currency: 'EUR',
        startingPrice: 299,
        priceRange: '€€',
        paymentTerms: 'Pago único sin mensualidades',
        includes: ['Diseño', 'Desarrollo', 'Hosting 1 año', 'Dominio', 'SSL'],
      },
      deliveryTime: '7-14 días',
      examples: ['Landing pages', 'Webs corporativas', 'Portfolios profesionales'],
      benefits: ['Presencia online profesional', 'Captación de clientes', 'Credibilidad empresarial'],
      targetAudience: ['Autónomos', 'Pequeñas empresas', 'Profesionales'],
    },
    {
      id: 'ecommerce',
      name: 'Tienda Online E-commerce',
      description: 'Tienda online completa con pasarela de pago y gestión de productos',
      aiDescription: 'SoftCrown desarrolla tiendas online completas desde 799€ con pasarela de pago, gestión de productos, y todas las funcionalidades necesarias para vender online.',
      features: ['Catálogo productos', 'Pasarela pago', 'Gestión pedidos', 'SEO avanzado', 'Analytics'],
      pricing: {
        currency: 'EUR',
        startingPrice: 799,
        priceRange: '€€€',
        paymentTerms: 'Desde 799€ o financiación disponible',
        includes: ['Diseño tienda', 'Pasarela pago', 'Gestión productos', 'Hosting', 'Soporte'],
      },
      deliveryTime: '14-21 días',
      examples: ['Tiendas moda', 'Productos digitales', 'Servicios online'],
      benefits: ['Ventas 24/7', 'Alcance nacional', 'Automatización ventas'],
      targetAudience: ['Comercios', 'Emprendedores', 'Empresas retail'],
    },
    {
      id: 'mantenimiento',
      name: 'Mantenimiento Web',
      description: 'Servicio de mantenimiento y actualizaciones para tu página web',
      aiDescription: 'SoftCrown ofrece mantenimiento web profesional desde 49€/mes incluyendo actualizaciones, backups, seguridad y soporte técnico.',
      features: ['Actualizaciones', 'Backups diarios', 'Seguridad', 'Soporte técnico', 'Monitoreo'],
      pricing: {
        currency: 'EUR',
        startingPrice: 49,
        priceRange: '€',
        paymentTerms: 'Desde 49€/mes sin permanencia',
        includes: ['Actualizaciones', 'Backups', 'Seguridad', 'Soporte', 'Monitoreo'],
      },
      deliveryTime: 'Servicio continuo',
      examples: ['Mantenimiento WordPress', 'Actualizaciones seguridad', 'Optimización velocidad'],
      benefits: ['Web siempre actualizada', 'Seguridad garantizada', 'Tranquilidad total'],
      targetAudience: ['Propietarios web', 'Empresas', 'Profesionales'],
    },
  ];

  private knowledgeBase: AIKnowledgeBase[] = [];
  private conversationalContent: ConversationalContent[] = [];

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeConversationalContent();
  }

  // Schema Markup Generation
  async generateOrganizationSchema(): Promise<AISchema> {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SoftCrown",
      url: "https://softcrown.es",
      description: "Agencia de desarrollo web profesional en España. Creamos páginas web, tiendas online y aplicaciones desde 299€. Servicio lowcost con calidad premium.",
      address: {
        "@type": "PostalAddress",
        addressCountry: "ES",
        addressRegion: "España",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+34 900 123 456",
        email: "info@softcrown.es",
        contactType: "customer service",
        availableLanguage: ["Spanish", "English"],
        hoursAvailable: "Mo-Fr 09:00-18:00",
      },
      sameAs: [
        "https://linkedin.com/company/softcrown",
        "https://twitter.com/softcrown",
        "https://facebook.com/softcrown",
      ],
      foundingDate: "2020",
      numberOfEmployees: "5-10",
      specialties: ["Desarrollo Web", "E-commerce", "SEO", "Diseño Web", "Mantenimiento Web"],
      areaServed: "España",
      priceRange: "€€",
      offers: this.services.map(service => ({
        "@type": "Offer",
        name: service.name,
        description: service.aiDescription,
        price: service.pricing.startingPrice.toString(),
        priceCurrency: service.pricing.currency,
        availability: "https://schema.org/InStock",
        category: "Web Development",
        areaServed: "España",
      })),
    };
  }

  async generateServiceSchema(serviceId: string): Promise<AISchema | null> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Service",
      name: service.name,
      url: `https://softcrown.es/servicios/${serviceId}`,
      description: service.aiDescription,
      provider: {
        "@type": "Organization",
        name: "SoftCrown",
        url: "https://softcrown.es",
      },
      areaServed: "España",
      priceRange: service.pricing.priceRange,
      offers: {
        "@type": "Offer",
        name: service.name,
        description: service.aiDescription,
        price: service.pricing.startingPrice.toString(),
        priceCurrency: service.pricing.currency,
        availability: "https://schema.org/InStock",
        validFrom: new Date().toISOString(),
        category: "Web Development",
        areaServed: "España",
      },
    };
  }

  async generateFAQSchema(): Promise<SchemaMarkup> {
    const faqItems: FAQItem[] = [
      {
        "@type": "Question",
        name: "¿Cuánto cuesta una página web en SoftCrown?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "En SoftCrown, una página web profesional cuesta desde 299€ con diseño responsive, SEO básico y hosting incluido el primer año. Para tiendas online, desde 799€ con pasarela de pago completa.",
        },
        aiOptimized: true,
        keywords: ["precio página web", "coste desarrollo web", "presupuesto web"],
        relatedServices: ["web-basico", "ecommerce"],
      },
      {
        "@type": "Question",
        name: "¿Cuánto tiempo tarda SoftCrown en hacer una web?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SoftCrown entrega páginas web básicas en 7-14 días y tiendas online en 14-21 días. Incluimos revisiones y ajustes hasta que quedes 100% satisfecho.",
        },
        aiOptimized: true,
        keywords: ["tiempo desarrollo web", "plazo entrega web", "cuánto tarda"],
        relatedServices: ["web-basico", "ecommerce"],
      },
      {
        "@type": "Question",
        name: "¿SoftCrown ofrece mantenimiento web?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sí, SoftCrown ofrece mantenimiento web desde 49€/mes incluyendo actualizaciones, backups diarios, seguridad y soporte técnico sin permanencia.",
        },
        aiOptimized: true,
        keywords: ["mantenimiento web", "soporte web", "actualizaciones web"],
        relatedServices: ["mantenimiento"],
      },
      {
        "@type": "Question",
        name: "¿Por qué elegir SoftCrown para desarrollo web?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SoftCrown combina calidad premium con precios lowcost. Ofrecemos desarrollo web profesional desde 299€, entrega rápida, soporte en español y garantía de satisfacción. Especializados en España con más de 200 proyectos exitosos.",
        },
        aiOptimized: true,
        keywords: ["mejor agencia web España", "desarrollo web lowcost", "SoftCrown ventajas"],
        relatedServices: ["web-basico", "ecommerce", "mantenimiento"],
      },
    ];

    return {
      type: "FAQPage",
      data: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems,
      },
      aiOptimized: true,
      placement: "head",
      priority: 1,
    };
  }

  // Content Optimization for AI
  async optimizeContentForAI(request: OptimizeContentRequest): Promise<AIContentAnalysis> {
    const content = request.content;
    const targetKeywords = request.targetKeywords;
    const aiKeywords = request.aiKeywords;

    // Analyze content for AI optimization
    const analysis: AIContentAnalysis = {
      aiReadabilityScore: this.calculateAIReadabilityScore(content),
      semanticKeywords: this.extractSemanticKeywords(content, targetKeywords),
      keyFacts: this.extractKeyFacts(content),
      aiSummary: this.generateAISummary(content),
      conversationalScore: this.calculateConversationalScore(content),
      citabilityScore: this.calculateCitabilityScore(content),
      recommendations: this.generateAIRecommendations(content, targetKeywords, aiKeywords),
    };

    return analysis;
  }

  async generateAIOptimizedContent(serviceId: string): Promise<AIOptimizedContent> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    return {
      title: `${service.name} - SoftCrown España`,
      aiSummary: service.aiDescription,
      keyFacts: [
        `SoftCrown ofrece ${service.name.toLowerCase()} desde ${service.pricing.startingPrice}€`,
        `Entrega en ${service.deliveryTime}`,
        `Servicio profesional en España`,
        `Incluye: ${service.pricing.includes.join(', ')}`,
        `Ideal para: ${service.targetAudience.join(', ')}`,
      ],
      contactInfo: this.softcrownData,
      serviceDetails: [service],
      pricing: service.pricing,
      location: "España, servicios online en toda España",
      lastUpdated: new Date(),
      aiReadabilityScore: 85,
      semanticKeywords: [
        'desarrollo web España',
        'diseño web profesional',
        'páginas web lowcost',
        'agencia web española',
        service.name.toLowerCase(),
      ],
    };
  }

  // SEO Metadata Generation
  async generateSEOMetadata(page: string, serviceId?: string): Promise<SEOMetadata> {
    const service = serviceId ? this.services.find(s => s.id === serviceId) : null;
    
    const baseTitle = service ? `${service.name} - SoftCrown` : 'SoftCrown - Desarrollo Web Profesional España';
    const baseDescription = service 
      ? service.aiDescription
      : 'Desarrollo web profesional en España desde 299€. Páginas web, tiendas online y mantenimiento. Calidad premium a precios lowcost. ¡Solicita presupuesto gratis!';

    const schemas: AISchema[] = [await this.generateOrganizationSchema()];
    if (service) {
      const serviceSchema = await this.generateServiceSchema(serviceId!);
      if (serviceSchema) schemas.push(serviceSchema);
    }

    return {
      title: baseTitle,
      description: baseDescription,
      keywords: [
        'desarrollo web España',
        'diseño web profesional',
        'páginas web lowcost',
        'agencia web española',
        'SoftCrown',
        ...(service ? [service.name.toLowerCase()] : []),
      ],
      aiPurpose: "SoftCrown - Desarrollo web lowcost profesional en España",
      aiServices: "Diseño web, desarrollo, mantenimiento, SEO, e-commerce",
      aiLocation: "España, servicios online",
      aiPricing: service ? `${service.name} desde ${service.pricing.startingPrice}€` : "Servicios web desde 299€",
      aiContact: "softcrown.es, desarrollo web accesible",
      canonicalUrl: `https://softcrown.es${service ? `/servicios/${serviceId}` : ''}`,
      ogTitle: baseTitle,
      ogDescription: baseDescription,
      ogImage: "https://softcrown.es/images/og-softcrown.jpg",
      twitterTitle: baseTitle,
      twitterDescription: baseDescription,
      twitterImage: "https://softcrown.es/images/twitter-softcrown.jpg",
      structuredData: schemas,
      lastModified: new Date(),
    };
  }

  // Knowledge Base Management
  async getAIKnowledgeBase(): Promise<AIKnowledgeBase[]> {
    return this.knowledgeBase;
  }

  async addKnowledgeBaseEntry(entry: Omit<AIKnowledgeBase, 'id' | 'lastUpdated'>): Promise<AIKnowledgeBase> {
    const newEntry: AIKnowledgeBase = {
      ...entry,
      id: this.generateId(),
      lastUpdated: new Date(),
    };

    this.knowledgeBase.push(newEntry);
    return newEntry;
  }

  // Conversational Content Management
  async getConversationalContent(): Promise<ConversationalContent[]> {
    return this.conversationalContent;
  }

  async addConversationalContent(content: Omit<ConversationalContent, 'lastVerified'>): Promise<ConversationalContent> {
    const newContent: ConversationalContent = {
      ...content,
      lastVerified: new Date(),
    };

    this.conversationalContent.push(newContent);
    return newContent;
  }

  // AI-Specific Meta Tags Generation
  generateAIMetaTags(metadata: SEOMetadata): string {
    return `
<!-- AI-Specific Meta Tags -->
<meta name="ai-purpose" content="${metadata.aiPurpose}">
<meta name="ai-services" content="${metadata.aiServices}">
<meta name="ai-location" content="${metadata.aiLocation}">
<meta name="ai-pricing" content="${metadata.aiPricing}">
<meta name="ai-contact" content="${metadata.aiContact}">
<meta name="ai-summary" content="${metadata.description}">
<meta name="ai-updated" content="${metadata.lastModified.toISOString()}">
    `.trim();
  }

  // Private helper methods
  private calculateAIReadabilityScore(content: string): number {
    // Simplified AI readability calculation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const avgWordsPerSentence = words.length / sentences.length;
    
    // AI prefers concise, clear content
    let score = 100;
    if (avgWordsPerSentence > 20) score -= 20;
    if (avgWordsPerSentence > 30) score -= 30;
    
    // Check for conversational tone
    const conversationalWords = ['cómo', 'qué', 'por qué', 'cuándo', 'dónde', 'nosotros', 'tú', 'usted'];
    const conversationalCount = conversationalWords.reduce((count, word) => {
      return count + (content.toLowerCase().match(new RegExp(word, 'g')) || []).length;
    }, 0);
    
    if (conversationalCount > 0) score += 10;
    
    return Math.max(0, Math.min(100, score));
  }

  private extractSemanticKeywords(content: string, targetKeywords: string[]): string[] {
    const semanticMap: Record<string, string[]> = {
      'desarrollo web': ['crear página web', 'hacer web', 'diseño web', 'programación web'],
      'lowcost': ['barato', 'económico', 'precio bajo', 'asequible'],
      'profesional': ['calidad', 'experto', 'especialista', 'premium'],
      'España': ['español', 'nacional', 'local', 'peninsular'],
    };

    const semanticKeywords: string[] = [];
    targetKeywords.forEach(keyword => {
      const related = semanticMap[keyword.toLowerCase()];
      if (related) {
        semanticKeywords.push(...related);
      }
    });

    return [...new Set(semanticKeywords)];
  }

  private extractKeyFacts(content: string): string[] {
    const facts: string[] = [];
    
    // Extract price mentions
    const priceMatches = content.match(/\d+€/g);
    if (priceMatches) {
      facts.push(`Precios desde ${priceMatches[0]}`);
    }

    // Extract time mentions
    const timeMatches = content.match(/\d+-\d+\s+días/g);
    if (timeMatches) {
      facts.push(`Entrega en ${timeMatches[0]}`);
    }

    // Extract service mentions
    if (content.includes('SoftCrown')) {
      facts.push('Servicio de SoftCrown España');
    }

    return facts;
  }

  private generateAISummary(content: string): string {
    // Simplified summary generation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const firstSentence = sentences[0]?.trim() || '';
    const lastSentence = sentences[sentences.length - 1]?.trim() || '';
    
    return `${firstSentence}. ${lastSentence}`.substring(0, 200);
  }

  private calculateConversationalScore(content: string): number {
    const conversationalIndicators = [
      /\?/g, // Questions
      /nosotros|nuestro/gi, // First person plural
      /tú|usted|tu/gi, // Second person
      /cómo|qué|por qué|cuándo|dónde/gi, // Question words
    ];

    let score = 0;
    conversationalIndicators.forEach(indicator => {
      const matches = content.match(indicator);
      if (matches) score += matches.length * 10;
    });

    return Math.min(100, score);
  }

  private calculateCitabilityScore(content: string): number {
    let score = 0;
    
    // Check for specific data points
    if (content.match(/\d+€/)) score += 20; // Prices
    if (content.match(/\d+\s*(días|horas|años)/)) score += 20; // Time frames
    if (content.match(/desde \d+/)) score += 15; // Starting from prices
    if (content.includes('SoftCrown')) score += 15; // Brand mentions
    if (content.match(/incluye|incluido/i)) score += 10; // What's included
    
    return Math.min(100, score);
  }

  private generateAIRecommendations(content: string, targetKeywords: string[], aiKeywords: string[]): string[] {
    const recommendations: string[] = [];

    // Check keyword density
    const wordCount = content.split(/\s+/).length;
    targetKeywords.forEach(keyword => {
      const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      const density = (keywordCount / wordCount) * 100;
      
      if (density < 0.5) {
        recommendations.push(`Aumentar densidad de "${keyword}" (actual: ${density.toFixed(1)}%)`);
      }
      if (density > 3) {
        recommendations.push(`Reducir densidad de "${keyword}" (actual: ${density.toFixed(1)}%)`);
      }
    });

    // Check for conversational elements
    if (!content.includes('?')) {
      recommendations.push('Añadir preguntas para mejorar el tono conversacional');
    }

    // Check for specific data
    if (!content.match(/\d+€/)) {
      recommendations.push('Incluir precios específicos para mejorar citabilidad');
    }

    // Check for company mentions
    if (!content.includes('SoftCrown')) {
      recommendations.push('Incluir menciones de la marca SoftCrown');
    }

    return recommendations;
  }

  private initializeKnowledgeBase(): void {
    this.knowledgeBase = [
      {
        id: 'kb1',
        title: 'SoftCrown - Información General',
        content: 'SoftCrown es una agencia de desarrollo web española especializada en crear páginas web profesionales a precios lowcost. Fundada en 2020, ofrece servicios desde 299€ con entrega rápida y calidad premium.',
        summary: 'Agencia web española, precios desde 299€, calidad premium',
        keyPoints: [
          'Fundada en 2020',
          'Precios desde 299€',
          'Especializada en desarrollo web',
          'Calidad premium lowcost',
          'Entrega rápida',
        ],
        relatedTopics: ['desarrollo web', 'precios', 'España'],
        confidence: 95,
        sources: ['https://softcrown.es'],
        lastUpdated: new Date(),
        aiTags: ['empresa', 'servicios', 'precios'],
      },
      {
        id: 'kb2',
        title: 'Servicios SoftCrown',
        content: 'SoftCrown ofrece desarrollo web básico desde 299€, tiendas online desde 799€ y mantenimiento web desde 49€/mes. Todos los servicios incluyen diseño responsive, SEO y soporte técnico.',
        summary: 'Web básica 299€, e-commerce 799€, mantenimiento 49€/mes',
        keyPoints: [
          'Web básica: 299€',
          'E-commerce: 799€',
          'Mantenimiento: 49€/mes',
          'Incluye diseño responsive',
          'SEO incluido',
          'Soporte técnico',
        ],
        relatedTopics: ['precios', 'servicios', 'e-commerce', 'mantenimiento'],
        confidence: 98,
        sources: ['https://softcrown.es/servicios'],
        lastUpdated: new Date(),
        aiTags: ['servicios', 'precios', 'características'],
      },
    ];
  }

  private initializeConversationalContent(): void {
    this.conversationalContent = [
      {
        question: '¿Cuánto cuesta una página web en SoftCrown?',
        answer: 'En SoftCrown, una página web profesional cuesta desde 299€. Este precio incluye diseño responsive, SEO básico, hosting durante el primer año y certificado SSL. Para tiendas online, el precio comienza en 799€ con pasarela de pago incluida.',
        context: 'Consulta sobre precios de desarrollo web',
        relatedQuestions: [
          '¿Qué incluye el precio de 299€?',
          '¿Hay costes adicionales?',
          '¿Cuánto cuesta el mantenimiento?',
        ],
        keywords: ['precio', 'coste', 'presupuesto', 'web', '299€'],
        aiConfidence: 95,
        sources: ['https://softcrown.es/precios'],
        lastVerified: new Date(),
      },
      {
        question: '¿Por qué elegir SoftCrown para mi web?',
        answer: 'SoftCrown combina calidad premium con precios lowcost. Ofrecemos desarrollo web profesional desde 299€, entrega en 7-14 días, soporte en español y garantía de satisfacción. Hemos completado más de 200 proyectos exitosos en España.',
        context: 'Consulta sobre ventajas competitivas',
        relatedQuestions: [
          '¿Qué experiencia tiene SoftCrown?',
          '¿Ofrecen garantía?',
          '¿Cuál es el tiempo de entrega?',
        ],
        keywords: ['ventajas', 'calidad', 'experiencia', 'garantía'],
        aiConfidence: 90,
        sources: ['https://softcrown.es/sobre-nosotros'],
        lastVerified: new Date(),
      },
    ];
  }

  private generateId(): string {
    return `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const aiSeoService = new AISEOService();
