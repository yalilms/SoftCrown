/**
 * SOFTCRONW CHATBOT CORE - Versión Consolidada
 * Sistema completo de chatbot inteligente con IA, analytics e integración
 * Consolida: chatbot-intelligent.js + chatbot-responses.js + chatbot-integration.js + chatbot-analytics.js + chatbot-features.js
 * Versión: 2.0.0 Optimizada
 */

// ==========================================
// CLASE PRINCIPAL DEL CHATBOT
// ==========================================

class SoftCronwChatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.isTyping = false;
        this.conversationId = this.generateConversationId();
        this.userId = this.getUserId();
        this.currentStep = 'greeting';
        this.userData = {};
        this.conversationHistory = [];
        this.autoResponses = true;
        this.humanHandoffRequested = false;
        
        // Elementos DOM
        this.elements = {};
        
        // Analytics y métricas
        this.analytics = new ChatbotAnalytics();
        
        // Base de conocimiento
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.personalityTraits = this.initializePersonality();
        
        // Inicialización
        this.init();
    }
    
    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    init() {
        this.bindElements();
        this.bindEvents();
        this.loadConversationHistory();
        this.showWelcomeMessage();
        this.analytics.track('chatbot_initialized');
    }
    
    bindElements() {
        this.elements = {
            container: document.getElementById('softcronw-chatbot'),
            toggle: document.getElementById('chatbot-toggle'),
            widget: document.getElementById('chatbot-widget'),
            preview: document.getElementById('chatbot-preview'),
            messages: document.getElementById('chatbot-messages'),
            input: document.getElementById('message-input'),
            sendBtn: document.getElementById('send-btn'),
            notification: document.getElementById('chat-notification'),
            typingIndicator: document.getElementById('typing-indicator'),
            quickActions: document.getElementById('quick-actions'),
            minimizeBtn: document.getElementById('chatbot-minimize'),
            closeBtn: document.getElementById('chatbot-close'),
            satisfactionRating: document.getElementById('satisfaction-rating')
        };
    }
    
    bindEvents() {
        // Toggle del chatbot
        this.elements.toggle?.addEventListener('click', () => this.toggleChat());
        
        // Controles
        this.elements.minimizeBtn?.addEventListener('click', () => this.minimizeChat());
        this.elements.closeBtn?.addEventListener('click', () => this.closeChat());
        
        // Input de mensajes
        this.elements.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.elements.input?.addEventListener('input', () => this.autoResizeTextarea());
        this.elements.sendBtn?.addEventListener('click', () => this.sendMessage());
        
        // Acciones rápidas
        this.elements.quickActions?.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-btn')) {
                this.handleQuickAction(e.target.dataset.action);
            }
        });
        
        // Sugerencias
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion')) {
                this.elements.input.value = e.target.dataset.text;
                this.sendMessage();
            }
        });
        
        // Preview click
        this.elements.preview?.addEventListener('click', () => this.toggleChat());
    }
    
    // ==========================================
    // PERSONALIDAD Y CONOCIMIENTO
    // ==========================================
    
    initializePersonality() {
        return {
            name: 'Sofia',
            role: 'Asistente Digital de SoftCronw',
            greetings: [
                '¡Hola! 👋 Soy Sofia, tu asistente digital de SoftCronw. ¿En qué puedo ayudarte hoy?',
                '¡Bienvenido/a! 🌟 Soy Sofia y estoy aquí para ayudarte con tu proyecto web. ¿Qué necesitas?',
                '¡Hola! Soy Sofia de SoftCronw 🚀 ¿Listo/a para crear algo increíble juntos?'
            ],
            responses: {
                understood: ['¡Perfecto! 👍', '¡Entendido! 💡', '¡Excelente! ✨'],
                thinking: ['Analizando tus necesidades... ⚡', 'Buscando la mejor solución... 🔍'],
                encouragement: ['¡Excelente elección! 🌟', '¡Estás en el camino correcto! 🎯']
            }
        };
    }
    
    initializeKnowledgeBase() {
        return {
            services: {
                'desarrollo web': {
                    title: '💻 Desarrollo Web Low-Cost',
                    description: 'Páginas web profesionales desde 299€',
                    features: ['Diseño responsive', 'SEO optimizado', 'Velocidad garantizada', 'Soporte 24/7'],
                    price: 'Desde 299€',
                    timeframe: '3-7 días'
                },
                'ecommerce': {
                    title: '🛒 Tienda Online',
                    description: 'E-commerce completo y profesional',
                    features: ['Catálogo ilimitado', 'Pasarela de pago', 'Panel de administración'],
                    price: 'Desde 599€',
                    timeframe: '7-14 días'
                },
                'aplicaciones': {
                    title: '📱 Aplicación Web',
                    description: 'Apps web a medida para tu negocio',
                    features: ['PWA compatible', 'Offline ready', 'Push notifications'],
                    price: 'Desde 899€',
                    timeframe: '14-21 días'
                }
            },
            faq: {
                'precios': {
                    question: '¿Cuánto cuesta una página web?',
                    answer: 'Nuestras páginas web profesionales empiezan desde 299€. ¿Te gustaría un presupuesto personalizado?'
                },
                'tiempo': {
                    question: '¿Cuánto tiempo tarda?',
                    answer: 'Desarrollamos tu página web en 3-7 días laborables. Para proyectos más complejos puede ser hasta 21 días.'
                },
                'incluye': {
                    question: '¿Qué incluye el servicio?',
                    answer: 'Incluye diseño responsive, hosting 1 año, dominio gratis, SSL, optimización SEO y soporte técnico.'
                }
            }
        };
    }
    
    // ==========================================
    // FUNCIONALIDADES PRINCIPALES
    // ==========================================
    
    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.isOpen = true;
        this.isMinimized = false;
        this.elements.widget?.classList.remove('hidden');
        this.elements.preview?.classList.add('hidden');
        this.elements.notification?.style.display = 'none';
        this.analytics.track('chat_opened');
        this.scrollToBottom();
    }
    
    closeChat() {
        this.isOpen = false;
        this.isMinimized = false;
        this.elements.widget?.classList.add('hidden');
        this.elements.preview?.classList.add('hidden');
        this.analytics.track('chat_closed');
    }
    
    minimizeChat() {
        this.isMinimized = true;
        this.elements.widget?.classList.add('hidden');
        this.elements.preview?.classList.remove('hidden');
        this.analytics.track('chat_minimized');
    }
    
    async sendMessage() {
        const message = this.elements.input?.value.trim();
        if (!message) return;
        
        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.elements.input.value = '';
        this.analytics.track('message_sent', { message: message });
        
        // Procesar respuesta
        this.showTypingIndicator();
        await this.delay(800); // Simular procesamiento
        
        const response = await this.processUserMessage(message);
        this.hideTypingIndicator();
        this.addMessage(response, 'bot');
        
        this.saveConversationHistory();
    }
    
    addMessage(content, type = 'bot', options = {}) {
        const messagesContainer = this.elements.messages;
        if (!messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        if (type === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${content}</div>
                    <div class="message-time">${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Guardar en historial
        this.conversationHistory.push({
            content,
            type,
            timestamp: new Date().toISOString()
        });
    }
    
    showTypingIndicator() {
        this.elements.typingIndicator?.classList.remove('hidden');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.elements.typingIndicator?.classList.add('hidden');
    }
    
    async processUserMessage(message) {
        const intent = this.detectIntent(message);
        const entities = this.extractEntities(message);
        
        switch (intent) {
            case 'greeting':
                return this.handleGreeting();
            case 'services':
                return this.handleServicesInquiry();
            case 'pricing':
                return this.handlePricingInquiry();
            case 'contact':
                return this.handleContactRequest();
            case 'help':
                return this.handleHelpRequest();
            default:
                return this.handleGeneralInquiry(message, entities);
        }
    }
    
    detectIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hola') || lowerMessage.includes('buenas') || lowerMessage.includes('saludos')) {
            return 'greeting';
        }
        if (lowerMessage.includes('servicio') || lowerMessage.includes('qué hace') || lowerMessage.includes('ofertas')) {
            return 'services';
        }
        if (lowerMessage.includes('precio') || lowerMessage.includes('cuesta') || lowerMessage.includes('coste') || lowerMessage.includes('€')) {
            return 'pricing';
        }
        if (lowerMessage.includes('contacto') || lowerMessage.includes('llamar') || lowerMessage.includes('email') || lowerMessage.includes('teléfono')) {
            return 'contact';
        }
        if (lowerMessage.includes('ayuda') || lowerMessage.includes('help') || lowerMessage.includes('no entiendo')) {
            return 'help';
        }
        
        return 'general';
    }
    
    extractEntities(message) {
        const entities = {};
        const lowerMessage = message.toLowerCase();
        
        // Detectar tipo de servicio
        if (lowerMessage.includes('tienda') || lowerMessage.includes('ecommerce') || lowerMessage.includes('venta')) {
            entities.serviceType = 'ecommerce';
        } else if (lowerMessage.includes('app') || lowerMessage.includes('aplicación') || lowerMessage.includes('móvil')) {
            entities.serviceType = 'aplicaciones';
        } else if (lowerMessage.includes('web') || lowerMessage.includes('página') || lowerMessage.includes('sitio')) {
            entities.serviceType = 'desarrollo web';
        }
        
        return entities;
    }
    
    // ==========================================
    // HANDLERS DE INTENTS
    // ==========================================
    
    handleGreeting() {
        const greetings = this.personalityTraits.greetings;
        return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    handleServicesInquiry() {
        return `¡Excelente pregunta! 🚀 En SoftCronw ofrecemos:\n\n💻 **Desarrollo Web** - Páginas profesionales desde 299€\n🛒 **E-commerce** - Tiendas online desde 599€\n📱 **Apps Web** - Aplicaciones a medida desde 899€\n\n¿Cuál te interesa más?`;
    }
    
    handlePricingInquiry() {
        return `💰 **Nuestros precios LOW-COST:**\n\n• Página web básica: 299€\n• E-commerce completo: 599€\n• Aplicación web: 899€\n\n✅ **Incluye:** Hosting 1 año, dominio gratis, SSL, soporte\n\n¿Te gustaría un presupuesto personalizado?`;
    }
    
    handleContactRequest() {
        return `📞 **¡Hablemos de tu proyecto!**\n\n📧 Email: info@softcronw.com\n📱 WhatsApp: +34 900 123 456\n⏰ Horario: Lunes a Viernes 9:00-18:00\n\n¿Prefieres que te llamemos o quieres programar una videollamada?`;
    }
    
    handleHelpRequest() {
        return `🤝 **Estoy aquí para ayudarte:**\n\nPuedes preguntarme sobre:\n• Nuestros servicios y precios\n• Tiempos de desarrollo\n• Proceso de trabajo\n• Tecnologías que usamos\n\n¿Qué te gustaría saber específicamente?`;
    }
    
    handleGeneralInquiry(message, entities) {
        // Buscar en FAQ
        for (const [key, faq] of Object.entries(this.knowledgeBase.faq)) {
            if (message.toLowerCase().includes(key)) {
                return faq.answer;
            }
        }
        
        // Respuesta por defecto
        return `Entiendo tu consulta sobre "${message}". Te conectaré con nuestro equipo para una respuesta más específica. ¿Prefieres que te contactemos por email o WhatsApp?`;
    }
    
    handleQuickAction(action) {
        switch (action) {
            case 'services':
                this.addMessage('¿Qué servicios ofrecen?', 'user');
                setTimeout(() => this.addMessage(this.handleServicesInquiry(), 'bot'), 500);
                break;
            case 'pricing':
                this.addMessage('¿Cuánto cuesta una página web?', 'user');
                setTimeout(() => this.addMessage(this.handlePricingInquiry(), 'bot'), 500);
                break;
            case 'quote':
                this.addMessage('Quiero un presupuesto personalizado', 'user');
                setTimeout(() => this.showQuoteForm(), 500);
                break;
            case 'contact':
                this.addMessage('¿Cómo puedo contactarlos?', 'user');
                setTimeout(() => this.addMessage(this.handleContactRequest(), 'bot'), 500);
                break;
        }
        this.analytics.track('quick_action_used', { action });
    }
    
    showQuoteForm() {
        const formHtml = `
            <div class="quote-form">
                <h4>📋 Presupuesto Personalizado</h4>
                <div class="form-group">
                    <label>¿Qué tipo de proyecto necesitas?</label>
                    <select id="project-type">
                        <option value="web">Página Web</option>
                        <option value="ecommerce">Tienda Online</option>
                        <option value="app">Aplicación Web</option>
                        <option value="other">Otro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Tu email:</label>
                    <input type="email" id="user-email" placeholder="email@ejemplo.com">
                </div>
                <div class="form-group">
                    <label>Describe tu proyecto:</label>
                    <textarea id="project-description" placeholder="Cuéntanos qué necesitas..."></textarea>
                </div>
                <button id="quote-submit-btn" class="quote-submit-btn">Enviar Solicitud 🚀</button>
            </div>
        `;
        this.addMessage(formHtml, 'bot');
        
        // Agregar event listener al botón después de que se agregue al DOM
        setTimeout(() => {
            const submitBtn = document.getElementById('quote-submit-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => this.submitQuoteForm());
            }
        }, 100);
    }
    
    submitQuoteForm() {
        const projectType = document.getElementById('project-type')?.value;
        const email = document.getElementById('user-email')?.value;
        const description = document.getElementById('project-description')?.value;
        
        if (!email || !description) {
            alert('Por favor completa todos los campos');
            return;
        }
        
        // Simular envío
        this.analytics.track('quote_submitted', { projectType, email });
        this.addMessage('¡Perfecto! 🎉 Hemos recibido tu solicitud. Te contactaremos en las próximas 2 horas con un presupuesto detallado. ¡Gracias!', 'bot');
    }
    
    // ==========================================
    // UTILIDADES
    // ==========================================
    
    autoResizeTextarea() {
        const textarea = this.elements.input;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    }
    
    scrollToBottom() {
        const container = this.elements.messages;
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    generateConversationId() {
        return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    getUserId() {
        let userId = localStorage.getItem('softcronw_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('softcronw_user_id', userId);
        }
        return userId;
    }
    
    saveConversationHistory() {
        localStorage.setItem('softcronw_chat_history', JSON.stringify(this.conversationHistory));
    }
    
    loadConversationHistory() {
        const history = localStorage.getItem('softcronw_chat_history');
        if (history) {
            this.conversationHistory = JSON.parse(history);
        }
    }
    
    showWelcomeMessage() {
        if (this.conversationHistory.length === 0) {
            setTimeout(() => {
                this.addMessage(this.handleGreeting(), 'bot');
            }, 1000);
        }
    }
}

// ==========================================
// CLASE DE ANALYTICS
// ==========================================

class ChatbotAnalytics {
    constructor() {
        this.events = [];
        this.sessionStart = Date.now();
    }
    
    track(event, data = {}) {
        const eventData = {
            event,
            data,
            timestamp: Date.now(),
            sessionId: this.getSessionId(),
            url: window.location.href
        };
        
        this.events.push(eventData);
        
        // Log para desarrollo
        console.log('📊 Chatbot Analytics:', eventData);
        
        // Enviar a analytics si está configurado
        if (typeof gtag !== 'undefined') {
            gtag('event', event, {
                event_category: 'chatbot',
                event_label: JSON.stringify(data)
            });
        }
    }
    
    getSessionId() {
        let sessionId = sessionStorage.getItem('chatbot_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('chatbot_session_id', sessionId);
        }
        return sessionId;
    }
    
    getStats() {
        return {
            totalEvents: this.events.length,
            sessionDuration: Date.now() - this.sessionStart,
            events: this.events
        };
    }
}

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

let chatbot;

// Función para inicializar el chatbot de forma segura
function initializeChatbot() {
    try {
        // Verificar que no esté ya inicializado
        if (chatbot) {
            console.log('🤖 Chatbot ya inicializado');
            return;
        }
        
        // Verificar que los elementos DOM existan
        const toggleBtn = document.getElementById('chatbot-toggle');
        const chatContainer = document.getElementById('softcronw-chatbot');
        
        if (!toggleBtn || !chatContainer) {
            console.log('⏳ Elementos del chatbot no encontrados, reintentando...');
            return false;
        }
        
        chatbot = new SoftCronwChatbot();
        console.log('🤖 SoftCronw Chatbot inicializado correctamente');
        
        // Hacer disponible globalmente para debugging
        window.chatbot = chatbot;
        return true;
    } catch (error) {
        console.error('❌ Error inicializando chatbot:', error);
        return false;
    }
}

// Múltiples puntos de inicialización para mayor robustez

// 1. Inmediato si el DOM ya está cargado
if (document.readyState === 'loading') {
    // DOM aún cargando
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeChatbot, 100);
    });
} else {
    // DOM ya cargado
    setTimeout(initializeChatbot, 100);
}

// 2. Cuando las librerías estén cargadas (si el evento existe)
document.addEventListener('librariesLoaded', function() {
    if (!chatbot) {
        initializeChatbot();
    }
});

// 3. Fallback adicional después de un tiempo corto
setTimeout(() => {
    if (!chatbot) {
        console.log('🔄 Inicializando chatbot (fallback)...');
        initializeChatbot();
    }
}, 500);

// 4. Fallback final después de más tiempo
setTimeout(() => {
    if (!chatbot) {
        console.log('🔄 Último intento de inicialización del chatbot...');
        const success = initializeChatbot();
        if (!success) {
            console.warn('⚠️ No se pudo inicializar el chatbot - elementos DOM no encontrados');
        }
    }
}, 2000);

// 5. Inicialización manual disponible globalmente
window.initializeChatbot = initializeChatbot;

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoftCronwChatbot, ChatbotAnalytics };
} 