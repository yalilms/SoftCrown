// AI Chat Service - Intelligent chatbot with context awareness
import { ChatMessage, ChatContext, ChatSession, ChatbotConfig, ServiceRecommendation, PriceEstimation, AppointmentSlot, FAQItem } from '@/types/chat';

export class AIChatService {
  private config: ChatbotConfig;
  private sessions: Map<string, ChatSession> = new Map();
  private faqs: FAQItem[] = [];

  constructor(config: ChatbotConfig) {
    this.config = config;
    this.initializeFAQs();
  }

  // Initialize FAQ database
  private initializeFAQs() {
    this.faqs = [
      {
        id: '1',
        question: '¿Qué servicios ofrecen?',
        answer: 'Ofrecemos desarrollo web, aplicaciones móviles, e-commerce, diseño UX/UI, consultoría digital y soluciones personalizadas para empresas.',
        category: 'servicios',
        keywords: ['servicios', 'qué hacen', 'desarrollo', 'web', 'móvil'],
        confidence: 0.9
      },
      {
        id: '2',
        question: '¿Cuánto cuesta un sitio web?',
        answer: 'Los precios varían según la complejidad. Un sitio web básico desde €2,500, e-commerce desde €5,000, y aplicaciones personalizadas desde €10,000. ¿Te gustaría una cotización personalizada?',
        category: 'precios',
        keywords: ['precio', 'costo', 'cuánto', 'sitio web', 'cotización'],
        confidence: 0.85
      },
      {
        id: '3',
        question: '¿Cuánto tiempo toma desarrollar un proyecto?',
        answer: 'Los tiempos dependen del alcance: sitio web básico 2-4 semanas, e-commerce 4-8 semanas, aplicación móvil 8-16 semanas. Te daremos un cronograma detallado en la propuesta.',
        category: 'tiempos',
        keywords: ['tiempo', 'duración', 'cuánto tarda', 'cronograma', 'entrega'],
        confidence: 0.8
      },
      {
        id: '4',
        question: '¿Ofrecen soporte después del lanzamiento?',
        answer: 'Sí, ofrecemos planes de mantenimiento y soporte técnico. Incluye actualizaciones, backups, monitoreo y soporte prioritario.',
        category: 'soporte',
        keywords: ['soporte', 'mantenimiento', 'después', 'lanzamiento', 'ayuda'],
        confidence: 0.9
      }
    ];
  }

  // Create new chat session
  async createSession(userId?: string): Promise<ChatSession> {
    const sessionId = this.generateSessionId();
    
    const session: ChatSession = {
      id: sessionId,
      messages: [],
      context: {
        userId,
        sessionId,
        conversationStage: 'greeting',
        language: 'es',
        entities: {},
        preferences: {},
        leadScore: 0,
        previousInteractions: 0
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active'
    };

    this.sessions.set(sessionId, session);

    // Send welcome message
    const welcomeMessage = await this.generateWelcomeMessage(session.context);
    session.messages.push(welcomeMessage);

    return session;
  }

  // Process user message and generate response
  async processMessage(sessionId: string, userMessage: string, voiceEnabled = false): Promise<ChatMessage> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Add user message to session
    const userMsg: ChatMessage = {
      id: this.generateMessageId(),
      content: userMessage,
      role: 'user',
      timestamp: new Date(),
      metadata: {
        voiceEnabled,
        language: session.context.language
      }
    };

    session.messages.push(userMsg);

    // Analyze message and update context
    await this.analyzeMessage(userMessage, session.context);

    // Generate AI response
    const response = await this.generateResponse(session);
    session.messages.push(response);

    // Update session
    session.updatedAt = new Date();
    this.sessions.set(sessionId, session);

    return response;
  }

  // Analyze user message for intent and entities
  private async analyzeMessage(message: string, context: ChatContext) {
    const lowerMessage = message.toLowerCase();

    // Intent detection
    if (this.containsKeywords(lowerMessage, ['hola', 'buenos días', 'buenas tardes', 'saludos'])) {
      context.currentIntent = 'greeting';
    } else if (this.containsKeywords(lowerMessage, ['precio', 'costo', 'cuánto', 'cotización'])) {
      context.currentIntent = 'price_inquiry';
    } else if (this.containsKeywords(lowerMessage, ['servicio', 'qué hacen', 'desarrollo', 'web', 'móvil'])) {
      context.currentIntent = 'service_inquiry';
    } else if (this.containsKeywords(lowerMessage, ['cita', 'reunión', 'llamada', 'meeting'])) {
      context.currentIntent = 'appointment_booking';
    } else if (this.containsKeywords(lowerMessage, ['contacto', 'email', 'teléfono', 'hablar'])) {
      context.currentIntent = 'contact_request';
    } else if (this.containsKeywords(lowerMessage, ['humano', 'persona', 'agente', 'representante'])) {
      context.currentIntent = 'human_handoff';
    }

    // Entity extraction
    this.extractEntities(message, context);

    // Update conversation stage
    this.updateConversationStage(context);

    // Update lead score
    this.updateLeadScore(context);
  }

  // Extract entities from message
  private extractEntities(message: string, context: ChatContext) {
    const lowerMessage = message.toLowerCase();

    // Budget extraction
    const budgetMatch = message.match(/(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:€|euros?|dollars?|\$)/i);
    if (budgetMatch) {
      context.entities.budget = parseFloat(budgetMatch[1].replace(',', ''));
      context.preferences.budget = context.entities.budget;
    }

    // Service type extraction
    if (this.containsKeywords(lowerMessage, ['e-commerce', 'tienda online', 'shop'])) {
      context.entities.serviceType = 'e-commerce';
      context.preferences.serviceType = 'e-commerce';
    } else if (this.containsKeywords(lowerMessage, ['app', 'aplicación', 'móvil', 'mobile'])) {
      context.entities.serviceType = 'mobile-app';
      context.preferences.serviceType = 'mobile-app';
    } else if (this.containsKeywords(lowerMessage, ['web', 'sitio', 'página', 'website'])) {
      context.entities.serviceType = 'website';
      context.preferences.serviceType = 'website';
    }

    // Timeline extraction
    if (this.containsKeywords(lowerMessage, ['urgente', 'rápido', 'pronto', 'ya'])) {
      context.entities.timeline = 'urgent';
      context.preferences.timeline = 'urgent';
    } else if (this.containsKeywords(lowerMessage, ['mes', 'meses', 'month'])) {
      const monthMatch = message.match(/(\d+)\s*mes/i);
      if (monthMatch) {
        context.entities.timeline = `${monthMatch[1]} months`;
        context.preferences.timeline = context.entities.timeline;
      }
    }

    // Contact info extraction
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch) {
      context.entities.email = emailMatch[1];
    }

    const phoneMatch = message.match(/(\+?[0-9\s\-\(\)]{9,})/);
    if (phoneMatch) {
      context.entities.phone = phoneMatch[1];
    }
  }

  // Update conversation stage based on context
  private updateConversationStage(context: ChatContext) {
    if (context.currentIntent === 'greeting' && context.conversationStage === 'greeting') {
      context.conversationStage = 'discovery';
    } else if (context.currentIntent === 'service_inquiry' && context.conversationStage === 'discovery') {
      context.conversationStage = 'qualification';
    } else if (context.currentIntent === 'price_inquiry' && context.conversationStage === 'qualification') {
      context.conversationStage = 'recommendation';
    } else if (context.currentIntent === 'appointment_booking') {
      context.conversationStage = 'booking';
    } else if (context.currentIntent === 'human_handoff') {
      context.conversationStage = 'handoff';
    }
  }

  // Update lead score based on engagement
  private updateLeadScore(context: ChatContext) {
    if (context.entities.email) context.leadScore += 20;
    if (context.entities.phone) context.leadScore += 15;
    if (context.entities.budget) context.leadScore += 25;
    if (context.entities.serviceType) context.leadScore += 10;
    if (context.entities.timeline) context.leadScore += 10;
    if (context.currentIntent === 'appointment_booking') context.leadScore += 30;
    if (context.currentIntent === 'price_inquiry') context.leadScore += 15;
  }

  // Generate AI response based on context
  private async generateResponse(session: ChatSession): Promise<ChatMessage> {
    const { context } = session;
    let response = '';

    // Check for FAQ match first
    const faqResponse = this.findFAQMatch(session.messages[session.messages.length - 1].content);
    if (faqResponse) {
      response = faqResponse.answer;
    } else {
      // Generate contextual response
      response = await this.generateContextualResponse(context, session.messages);
    }

    return {
      id: this.generateMessageId(),
      content: response,
      role: 'assistant',
      timestamp: new Date(),
      metadata: {
        intent: context.currentIntent,
        confidence: 0.8,
        language: context.language,
        voiceEnabled: true
      }
    };
  }

  // Generate contextual response based on conversation stage
  private async generateContextualResponse(context: ChatContext, messages: ChatMessage[]): Promise<string> {
    const lastUserMessage = messages[messages.length - 1].content;

    switch (context.conversationStage) {
      case 'greeting':
        return '¡Hola! Soy el asistente virtual de SoftCrown. Estoy aquí para ayudarte con información sobre nuestros servicios de desarrollo web y aplicaciones. ¿En qué puedo ayudarte hoy?';

      case 'discovery':
        if (context.currentIntent === 'service_inquiry') {
          return 'Perfecto, te puedo ayudar con eso. Ofrecemos desarrollo web, aplicaciones móviles, e-commerce y consultoría digital. ¿Qué tipo de proyecto tienes en mente?';
        }
        return '¿Podrías contarme más sobre tu proyecto? Esto me ayudará a darte la mejor recomendación.';

      case 'qualification':
        const recommendations = await this.getServiceRecommendations(context);
        if (recommendations.length > 0) {
          const topRec = recommendations[0];
          return `Basándome en lo que me has contado, creo que ${topRec.name} sería perfecto para ti. ${topRec.description} El precio base sería de €${topRec.basePrice.toLocaleString()}. ¿Te gustaría saber más detalles o prefieres una cotización personalizada?`;
        }
        return 'Para darte una mejor recomendación, ¿podrías decirme cuál es tu presupuesto aproximado y en qué plazo necesitas el proyecto?';

      case 'recommendation':
        const estimation = await this.getPriceEstimation(context);
        return `Te puedo dar una estimación inicial: el proyecto estaría en un rango de €${estimation.basePrice.toLocaleString()} - €${estimation.total.toLocaleString()}, con un tiempo de desarrollo de ${estimation.timeline}. ¿Te gustaría agendar una consulta gratuita para discutir los detalles?`;

      case 'booking':
        return 'Excelente, me encantaría conectarte con nuestro equipo. ¿Prefieres una videollamada o una llamada telefónica? Tengo disponibilidad esta semana.';

      case 'handoff':
        return 'Por supuesto, te voy a conectar con uno de nuestros especialistas. Mientras tanto, ¿podrías compartir tu email y teléfono para que puedan contactarte directamente?';

      default:
        return 'Entiendo. ¿Hay algo específico sobre nuestros servicios que te gustaría saber?';
    }
  }

  // Find FAQ match
  private findFAQMatch(message: string): FAQItem | null {
    const lowerMessage = message.toLowerCase();
    
    for (const faq of this.faqs) {
      const keywordMatches = faq.keywords.filter(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      ).length;
      
      if (keywordMatches >= 2 || (keywordMatches >= 1 && faq.confidence > 0.8)) {
        return faq;
      }
    }
    
    return null;
  }

  // Get service recommendations based on context
  async getServiceRecommendations(context: ChatContext): Promise<ServiceRecommendation[]> {
    const recommendations: ServiceRecommendation[] = [];

    if (context.preferences.serviceType === 'website' || context.entities.serviceType === 'website') {
      recommendations.push({
        id: 'web-basic',
        name: 'Sitio Web Profesional',
        description: 'Sitio web responsive con diseño moderno, optimizado para SEO y dispositivos móviles.',
        basePrice: 2500,
        features: ['Diseño responsive', 'SEO optimizado', 'Formulario de contacto', 'Google Analytics'],
        timeline: '2-4 semanas',
        confidence: 0.9,
        reasons: ['Coincide con el tipo de servicio solicitado']
      });
    }

    if (context.preferences.serviceType === 'e-commerce' || context.entities.serviceType === 'e-commerce') {
      recommendations.push({
        id: 'ecommerce',
        name: 'Tienda Online Completa',
        description: 'E-commerce completo con gestión de productos, pagos seguros y panel administrativo.',
        basePrice: 5000,
        features: ['Catálogo de productos', 'Carrito de compras', 'Pasarelas de pago', 'Panel admin'],
        timeline: '4-8 semanas',
        confidence: 0.95,
        reasons: ['Coincide perfectamente con e-commerce']
      });
    }

    if (context.preferences.serviceType === 'mobile-app' || context.entities.serviceType === 'mobile-app') {
      recommendations.push({
        id: 'mobile-app',
        name: 'Aplicación Móvil',
        description: 'App nativa o híbrida para iOS y Android con funcionalidades personalizadas.',
        basePrice: 10000,
        features: ['iOS y Android', 'Backend API', 'Push notifications', 'Analytics'],
        timeline: '8-16 semanas',
        confidence: 0.85,
        reasons: ['Aplicación móvil solicitada']
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Get price estimation based on context
  async getPriceEstimation(context: ChatContext): Promise<PriceEstimation> {
    const serviceType = context.preferences.serviceType || context.entities.serviceType || 'website';
    const budget = context.preferences.budget || context.entities.budget;
    
    let basePrice = 2500;
    let timeline = '2-4 semanas';
    
    switch (serviceType) {
      case 'e-commerce':
        basePrice = 5000;
        timeline = '4-8 semanas';
        break;
      case 'mobile-app':
        basePrice = 10000;
        timeline = '8-16 semanas';
        break;
    }

    const features = [
      { name: 'Diseño personalizado', price: 1000, included: true },
      { name: 'Responsive design', price: 500, included: true },
      { name: 'SEO básico', price: 300, included: true },
      { name: 'Formularios avanzados', price: 800, included: budget ? budget > basePrice * 1.2 : false },
      { name: 'Integración API', price: 1200, included: budget ? budget > basePrice * 1.5 : false }
    ];

    const total = basePrice + features.filter(f => f.included).reduce((sum, f) => sum + f.price, 0);

    return {
      basePrice,
      features,
      total,
      timeline,
      confidence: 0.8,
      factors: ['Tipo de servicio', 'Complejidad estimada', 'Presupuesto indicado']
    };
  }

  // Get available appointment slots
  async getAvailableSlots(): Promise<AppointmentSlot[]> {
    const slots: AppointmentSlot[] = [];
    const now = new Date();
    
    // Generate slots for next 7 days (excluding weekends)
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      
      if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
        // Morning slots
        const morning = new Date(date);
        morning.setHours(10, 0, 0, 0);
        slots.push({
          id: `slot-${i}-morning`,
          date: morning,
          duration: 30,
          type: 'consultation',
          available: true
        });

        // Afternoon slots
        const afternoon = new Date(date);
        afternoon.setHours(15, 0, 0, 0);
        slots.push({
          id: `slot-${i}-afternoon`,
          date: afternoon,
          duration: 30,
          type: 'consultation',
          available: true
        });
      }
    }

    return slots;
  }

  // Request human handoff
  async requestHandoff(sessionId: string, reason: string): Promise<boolean> {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.context.conversationStage = 'handoff';
    session.status = 'transferred';
    
    // Here you would integrate with your support system
    // For now, we'll just update the session
    const handoffMessage: ChatMessage = {
      id: this.generateMessageId(),
      content: 'Te estoy conectando con uno de nuestros especialistas. En breve recibirás una llamada o email de nuestro equipo.',
      role: 'system',
      timestamp: new Date(),
      metadata: {
        handoffRequested: true,
        intent: 'handoff'
      }
    };

    session.messages.push(handoffMessage);
    this.sessions.set(sessionId, session);

    return true;
  }

  // Utility methods
  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  private generateMessageId(): string {
    return 'msg_' + Math.random().toString(36).substr(2, 9);
  }

  private async generateWelcomeMessage(context: ChatContext): Promise<ChatMessage> {
    return {
      id: this.generateMessageId(),
      content: '¡Hola! 👋 Soy el asistente virtual de SoftCrown. Estoy aquí para ayudarte con información sobre nuestros servicios de desarrollo web, aplicaciones móviles y soluciones digitales. ¿En qué puedo ayudarte hoy?',
      role: 'assistant',
      timestamp: new Date(),
      metadata: {
        intent: 'greeting',
        confidence: 1.0,
        language: context.language
      }
    };
  }

  // Get session
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  // Get all sessions for user
  getUserSessions(userId: string): ChatSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.context.userId === userId
    );
  }

  // Clean up old sessions
  cleanupSessions(maxAge: number = 24 * 60 * 60 * 1000) { // 24 hours
    const now = new Date();
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now.getTime() - session.updatedAt.getTime() > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export default instance
export const aiChatService = new AIChatService({
  aiProvider: 'local', // Can be configured to use OpenAI, Anthropic, etc.
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 500,
  systemPrompt: 'You are a helpful assistant for SoftCrown, a web development company.',
  fallbackResponses: [
    'Lo siento, no entendí completamente tu pregunta. ¿Podrías reformularla?',
    'Esa es una excelente pregunta. Déjame conectarte con uno de nuestros especialistas.',
    'Te puedo ayudar mejor si me das más detalles sobre tu proyecto.'
  ],
  enableVoice: true,
  enableHandoff: true,
  supportedLanguages: ['es', 'en'],
  confidenceThreshold: 0.6
});
