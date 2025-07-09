/**
 * SoftCronw - Advanced Contact Page JavaScript
 * Comprehensive contact functionality including:
 * - Multi-step form validation
 * - Budget calculator
 * - AI Chatbot simulation
 * - FAQ search and filter
 * - Interactive map integration
 * - EmailJS integration
 * - Real-time validation
 */

class ContactManager {
    constructor() {
        this.currentStep = 1;
        this.formData = {};
        this.captchaAnswer = 0;
        this.calculator = null;
        this.chatbot = null;
        this.faqManager = null;
        this.mapManager = null;
        
        this.init();
    }

    init() {
        // Initialize components
        this.initializeForm();
        this.initializeCalculator();
        this.initializeChatbot();
        this.initializeFAQ();
        this.initializeMap();
        this.initializeEmailJS();
        this.initializeValidation();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Generate initial captcha
        this.generateCaptcha();
        
        console.log('ContactManager initialized successfully');
    }

    // =====================================
    // FORM MANAGEMENT
    // =====================================

    initializeForm() {
        this.form = document.getElementById('contactForm');
        this.sections = document.querySelectorAll('.form-section');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        this.updateProgress();
    }

    setupEventListeners() {
        // Form navigation
        document.querySelectorAll('.btn-next').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextSection = e.target.dataset.next;
                if (this.validateCurrentSection()) {
                    this.goToSection(nextSection);
                }
            });
        });

        document.querySelectorAll('.btn-prev').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const prevSection = e.target.dataset.prev;
                this.goToSection(prevSection);
            });
        });

        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission();
            });
        }

        // Real-time validation
        document.querySelectorAll('.form-control').forEach(input => {
            input.addEventListener('input', (e) => {
                this.validateField(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
        });

        // Character count for textarea
        const messageField = document.getElementById('mensaje');
        if (messageField) {
            messageField.addEventListener('input', this.updateCharacterCount);
        }
    }

    validateCurrentSection() {
        const currentSection = document.querySelector('.form-section.active');
        const inputs = currentSection.querySelectorAll('.form-control[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const validationEl = field.parentElement.querySelector('.form-validation');
        const messageEl = validationEl?.querySelector('.validation-message');
        
        let isValid = true;
        let message = '';

        // Required field validation
        if (field.required && !value) {
            isValid = false;
            message = 'Este campo es obligatorio';
        }

        // Specific field validations
        switch (fieldName) {
            case 'nombre':
            case 'apellidos':
                if (value && value.length < 2) {
                    isValid = false;
                    message = 'Debe tener al menos 2 caracteres';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    isValid = false;
                    message = 'Email no válido';
                }
                break;
                
            case 'telefono':
                if (value && value.length < 9) {
                    isValid = false;
                    message = 'Teléfono no válido';
                }
                break;
                
            case 'mensaje':
                if (value && value.length < 10) {
                    isValid = false;
                    message = 'Mensaje muy corto (mínimo 10 caracteres)';
                }
                break;
                
            case 'captchaAnswer':
                if (value && parseInt(value) !== this.captchaAnswer) {
                    isValid = false;
                    message = 'Respuesta incorrecta';
                }
                break;
        }

        // Update UI
        this.updateFieldValidation(field, isValid, message);
        
        return isValid;
    }

    updateFieldValidation(field, isValid, message) {
        const validationEl = field.parentElement.querySelector('.form-validation');
        const messageEl = validationEl?.querySelector('.validation-message');
        const validIcon = validationEl?.querySelector('.form-valid');
        const invalidIcon = validationEl?.querySelector('.form-invalid');

        if (!validationEl) return;

        // Reset classes
        field.classList.remove('is-valid', 'is-invalid');
        validIcon.style.display = 'none';
        invalidIcon.style.display = 'none';
        messageEl.classList.remove('show');

        if (field.value.trim()) {
            if (isValid) {
                field.classList.add('is-valid');
                validIcon.style.display = 'block';
            } else {
                field.classList.add('is-invalid');
                invalidIcon.style.display = 'block';
                messageEl.textContent = message;
                messageEl.classList.add('show');
            }
        }
    }

    updateCharacterCount() {
        const charCount = document.getElementById('charCount');
        const messageField = document.getElementById('mensaje');
        
        if (charCount && messageField) {
            charCount.textContent = messageField.value.length;
        }
    }

    goToSection(sectionName) {
        // Hide all sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });

        // Show target section
        const targetSection = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Update step number
            const stepMap = {
                'personal': 1,
                'project': 2,
                'verification': 3
            };
            
            this.currentStep = stepMap[sectionName] || 1;
            this.updateProgress();
            
            // Update form summary if verification step
            if (sectionName === 'verification') {
                this.updateFormSummary();
            }
        }
    }

    updateProgress() {
        const progress = (this.currentStep / 3) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.progressText.textContent = `Completado: ${Math.round(progress)}%`;
    }

    updateFormSummary() {
        const summaryContainer = document.getElementById('formSummary');
        if (!summaryContainer) return;

        const formData = new FormData(this.form);
        const summary = [];

        // Collect form data
        for (let [key, value] of formData.entries()) {
            if (value.trim()) {
                let label = this.getFieldLabel(key);
                summary.push({ label, value });
            }
        }

        // Generate summary HTML
        const summaryHTML = summary.map(item => `
            <div class="summary-item">
                <span class="item-label">${item.label}:</span>
                <span class="item-value">${item.value}</span>
            </div>
        `).join('');

        summaryContainer.innerHTML = summaryHTML;
    }

    getFieldLabel(fieldName) {
        const labels = {
            'nombre': 'Nombre',
            'apellidos': 'Apellidos',
            'email': 'Email',
            'telefono': 'Teléfono',
            'empresa': 'Empresa',
            'servicio': 'Servicio',
            'presupuesto': 'Presupuesto',
            'timeline': 'Timeline',
            'mensaje': 'Mensaje'
        };
        return labels[fieldName] || fieldName;
    }

    generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.captchaAnswer = num1 + num2;
        
        const captchaQuestion = document.getElementById('captchaQuestion');
        if (captchaQuestion) {
            captchaQuestion.innerHTML = `¿Cuánto es <span class="captcha-numbers">${num1} + ${num2}</span>?`;
        }
    }

    async handleFormSubmission() {
        if (!this.validateCurrentSection()) {
            return;
        }

        const submitBtn = document.querySelector('.btn-submit');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');

        // Show loading state
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        submitBtn.disabled = true;

        try {
            // Prepare form data
            const formData = new FormData(this.form);
            const emailData = {
                from_name: `${formData.get('nombre')} ${formData.get('apellidos')}`,
                from_email: formData.get('email'),
                phone: formData.get('telefono'),
                company: formData.get('empresa'),
                service: formData.get('servicio'),
                budget: formData.get('presupuesto'),
                timeline: formData.get('timeline'),
                message: formData.get('mensaje'),
                timestamp: new Date().toLocaleString('es-ES')
            };

            // Send email via EmailJS
            await emailjs.send('service_softcronw', 'template_contact', emailData);
            
            // Show success modal
            this.showModal('successModal');
            
            // Reset form
            this.form.reset();
            this.goToSection('personal');
            this.generateCaptcha();
            
        } catch (error) {
            console.error('Error sending email:', error);
            this.showModal('errorModal');
        } finally {
            // Reset button state
            btnText.style.display = 'inline-block';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }

    showModal(modalId) {
        const modal = new bootstrap.Modal(document.getElementById(modalId));
        modal.show();
    }

    // =====================================
    // BUDGET CALCULATOR
    // =====================================

    initializeCalculator() {
        this.calculator = new BudgetCalculator();
    }

    // =====================================
    // CHATBOT
    // =====================================

    initializeChatbot() {
        this.chatbot = new Chatbot();
    }

    // =====================================
    // FAQ MANAGER
    // =====================================

    initializeFAQ() {
        this.faqManager = new FAQManager();
    }

    // =====================================
    // MAP INTEGRATION
    // =====================================

    initializeMap() {
        this.mapManager = new MapManager();
    }

    // =====================================
    // EMAIL JS INTEGRATION
    // =====================================

    initializeEmailJS() {
        // Initialize EmailJS (replace with your actual keys)
        emailjs.init("your_public_key");
    }

    // =====================================
    // VALIDATION SYSTEM
    // =====================================

    initializeValidation() {
        // International phone number validation
        const phoneInput = document.getElementById('telefono');
        if (phoneInput && window.intlTelInput) {
            this.phoneInputInstance = window.intlTelInput(phoneInput, {
                initialCountry: "es",
                preferredCountries: ["es", "fr", "it", "de"],
                utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
            });
        }
    }
}

// =====================================
// BUDGET CALCULATOR CLASS
// =====================================

class BudgetCalculator {
    constructor() {
        this.currentStep = 1;
        this.selectedProject = null;
        this.selectedFeatures = [];
        this.projectDetails = {};
        this.basePrice = 0;
        this.finalPrice = 0;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStepDisplay();
    }

    setupEventListeners() {
        // Project type selection
        document.querySelectorAll('.project-type').forEach(type => {
            type.addEventListener('click', (e) => {
                this.selectProjectType(e.currentTarget);
            });
        });

        // Feature selection
        document.querySelectorAll('.feature-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleFeature(e.target);
            });
        });

        // Form inputs
        document.querySelectorAll('.calculator-step select').forEach(select => {
            select.addEventListener('change', (e) => {
                this.updateProjectDetails(e.target);
            });
        });

        // Navigation
        document.getElementById('calcNext')?.addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('calcPrev')?.addEventListener('click', () => {
            this.prevStep();
        });

        // Result actions
        document.getElementById('sendBudget')?.addEventListener('click', () => {
            this.sendBudgetRequest();
        });

        document.getElementById('restartCalculator')?.addEventListener('click', () => {
            this.restart();
        });
    }

    selectProjectType(element) {
        // Remove previous selection
        document.querySelectorAll('.project-type').forEach(type => {
            type.classList.remove('selected');
        });

        // Add selection
        element.classList.add('selected');
        
        this.selectedProject = element.dataset.type;
        this.basePrice = parseInt(element.dataset.basePrice);
        
        this.calculatePrice();
    }

    toggleFeature(checkbox) {
        const feature = checkbox.closest('.feature-option');
        const featureData = {
            id: feature.dataset.feature,
            price: parseInt(feature.dataset.price) || 0,
            checked: checkbox.checked
        };

        if (checkbox.checked) {
            this.selectedFeatures.push(featureData);
        } else {
            this.selectedFeatures = this.selectedFeatures.filter(f => f.id !== featureData.id);
        }

        this.calculatePrice();
    }

    updateProjectDetails(select) {
        const multiplierType = select.dataset.multiplier;
        const priceType = select.dataset.price;
        
        if (multiplierType) {
            this.projectDetails[multiplierType] = parseFloat(select.value);
        }
        
        if (priceType) {
            this.projectDetails[priceType] = parseInt(select.value);
        }
        
        this.calculatePrice();
    }

    calculatePrice() {
        let price = this.basePrice;
        
        // Add feature prices
        this.selectedFeatures.forEach(feature => {
            if (feature.checked) {
                price += feature.price;
            }
        });
        
        // Apply multipliers
        const multipliers = ['pages', 'design', 'urgency'];
        multipliers.forEach(mult => {
            if (this.projectDetails[mult]) {
                price *= this.projectDetails[mult];
            }
        });
        
        // Add integration costs
        if (this.projectDetails.integration) {
            price += this.projectDetails.integration;
        }
        
        this.finalPrice = Math.round(price);
        this.updatePriceDisplay();
    }

    updatePriceDisplay() {
        const priceElement = document.getElementById('finalPrice');
        if (priceElement) {
            const amountElement = priceElement.querySelector('.amount');
            if (amountElement) {
                amountElement.textContent = this.finalPrice.toLocaleString();
            }
        }
        
        this.updateBreakdown();
    }

    updateBreakdown() {
        const breakdownContainer = document.getElementById('priceBreakdown');
        if (!breakdownContainer) return;

        const breakdown = [];
        
        // Base price
        breakdown.push({
            label: 'Proyecto base',
            price: this.basePrice
        });
        
        // Features
        this.selectedFeatures.forEach(feature => {
            if (feature.checked && feature.price > 0) {
                breakdown.push({
                    label: this.getFeatureLabel(feature.id),
                    price: feature.price
                });
            }
        });
        
        // Integration
        if (this.projectDetails.integration) {
            breakdown.push({
                label: 'Integraciones',
                price: this.projectDetails.integration
            });
        }
        
        // Total
        breakdown.push({
            label: 'Total',
            price: this.finalPrice,
            isTotal: true
        });
        
        const breakdownHTML = breakdown.map(item => `
            <div class="breakdown-item ${item.isTotal ? 'total' : ''}">
                <span class="item-label">${item.label}</span>
                <span class="item-price">${item.price.toLocaleString()}€</span>
            </div>
        `).join('');
        
        breakdownContainer.innerHTML = breakdownHTML;
    }

    getFeatureLabel(featureId) {
        const labels = {
            'cms': 'Sistema de Gestión',
            'multilang': 'Multi-idioma',
            'blog': 'Blog',
            'seo': 'SEO',
            'analytics': 'Analytics'
        };
        return labels[featureId] || featureId;
    }

    nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.calculator-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStepEl = document.querySelector(`.calculator-step[data-step="${this.currentStep}"]`);
        if (currentStepEl) {
            currentStepEl.classList.add('active');
        }

        // Update progress
        const progressSteps = document.querySelectorAll('.step');
        progressSteps.forEach((step, index) => {
            if (index + 1 <= this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        const progressFill = document.querySelector('.calculator-progress .progress-fill');
        if (progressFill) {
            progressFill.style.width = `${(this.currentStep / 4) * 100}%`;
        }

        // Update navigation buttons
        const prevBtn = document.getElementById('calcPrev');
        const nextBtn = document.getElementById('calcNext');
        
        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
        }
        
        if (nextBtn) {
            nextBtn.style.display = this.currentStep === 4 ? 'none' : 'inline-block';
        }
    }

    sendBudgetRequest() {
        // Open contact form with pre-filled data
        const modal = new bootstrap.Modal(document.getElementById('budgetModal'));
        modal.show();
    }

    restart() {
        this.currentStep = 1;
        this.selectedProject = null;
        this.selectedFeatures = [];
        this.projectDetails = {};
        this.basePrice = 0;
        this.finalPrice = 0;
        
        // Reset UI
        document.querySelectorAll('.project-type').forEach(type => {
            type.classList.remove('selected');
        });
        
        document.querySelectorAll('.feature-option input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        document.querySelectorAll('.calculator-step select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        this.updateStepDisplay();
        this.updatePriceDisplay();
    }
}

// =====================================
// CHATBOT CLASS
// =====================================

class Chatbot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.responses = this.initializeResponses();
        
        this.init();
    }

    init() {
        this.chatbotContainer = document.getElementById('chatbotContainer');
        this.chatbotTrigger = document.getElementById('chatbotTrigger');
        this.chatbotWindow = document.getElementById('chatbotWindow');
        this.chatbotMessages = document.getElementById('chatbotMessages');
        this.chatbotInput = document.getElementById('chatbotInput');
        this.chatbotSend = document.getElementById('chatbotSend');
        this.chatbotTyping = document.getElementById('chatbotTyping');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Toggle chatbot
        this.chatbotTrigger?.addEventListener('click', () => {
            this.toggleChatbot();
        });

        // Send message
        this.chatbotSend?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter key to send
        this.chatbotInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Quick actions
        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', (e) => {
                const actionType = e.target.dataset.action;
                this.handleQuickAction(actionType);
            });
        });

        // Close/minimize
        document.getElementById('chatbotClose')?.addEventListener('click', () => {
            this.closeChatbot();
        });

        document.getElementById('chatbotMinimize')?.addEventListener('click', () => {
            this.minimizeChatbot();
        });
    }

    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }

    openChatbot() {
        this.chatbotWindow.style.display = 'flex';
        this.chatbotTrigger.style.display = 'none';
        this.isOpen = true;
        
        // Focus input
        setTimeout(() => {
            this.chatbotInput?.focus();
        }, 300);
    }

    closeChatbot() {
        this.chatbotWindow.style.display = 'none';
        this.chatbotTrigger.style.display = 'flex';
        this.isOpen = false;
    }

    minimizeChatbot() {
        this.closeChatbot();
    }

    sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatbotInput.value = '';

        // Show typing indicator
        this.showTyping();

        // Generate response
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 2000);
    }

    addMessage(content, sender) {
        const messageEl = document.createElement('div');
        messageEl.className = `message ${sender}-message`;
        
        const time = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageEl.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
            </div>
            <div class="message-content">
                <p>${content}</p>
            </div>
            <div class="message-time">${time}</div>
        `;
        
        this.chatbotMessages.appendChild(messageEl);
        this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
    }

    showTyping() {
        this.chatbotTyping.style.display = 'block';
    }

    hideTyping() {
        this.chatbotTyping.style.display = 'none';
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Find matching response
        for (const [keywords, response] of Object.entries(this.responses)) {
            const keywordList = keywords.split(',').map(k => k.trim().toLowerCase());
            if (keywordList.some(keyword => lowerMessage.includes(keyword))) {
                return Array.isArray(response) ? response[Math.floor(Math.random() * response.length)] : response;
            }
        }
        
        // Default response
        return "Gracias por tu mensaje. Para obtener información más específica, te recomiendo que contactes con nuestro equipo directamente o uses nuestro formulario de contacto.";
    }

    handleQuickAction(action) {
        const responses = {
            'pricing': '💰 Nuestros precios van desde 500€ para proyectos básicos hasta 20.000€+ para aplicaciones complejas. ¿Te gustaría usar nuestra calculadora de presupuesto?',
            'services': '🚀 Ofrecemos desarrollo web, diseño UX/UI, e-commerce, SEO, y mantenimiento. ¿Qué tipo de proyecto tienes en mente?',
            'timeline': '⏱️ Los tiempos varían: Landing pages (1-2 semanas), webs corporativas (3-6 semanas), e-commerce (6-10 semanas). ¿Cuál es tu timeline?',
            'contact': '📞 Puedes llamarnos al +34 900 123 456 o escribirnos a hello@softcronw.com. ¿Prefieres que te llamemos?'
        };
        
        const response = responses[action] || 'No encuentro información sobre esa consulta.';
        this.addMessage(response, 'bot');
    }

    initializeResponses() {
        return {
            'hola,hey,buenas,saludos': [
                '¡Hola! 👋 Soy el asistente de SoftCronw. ¿En qué puedo ayudarte hoy?',
                '¡Buenas! ¿Tienes alguna pregunta sobre nuestros servicios?',
                '¡Hola! Estoy aquí para ayudarte con cualquier duda sobre desarrollo web.'
            ],
            'precio,costo,presupuesto,cuanto': [
                'Los precios varían según el proyecto. Para una estimación personalizada, te recomiendo usar nuestra calculadora de presupuesto.',
                'Nuestros proyectos van desde 500€ hasta 20.000€+. ¿Quieres que te ayude a calcular el presupuesto de tu proyecto?'
            ],
            'servicio,desarrollo,diseño,web': [
                'Ofrecemos desarrollo web completo, diseño UX/UI, e-commerce, SEO y mantenimiento. ¿Qué tipo de proyecto necesitas?',
                'Nuestros servicios incluyen desarrollo web personalizado, tiendas online, aplicaciones web y mucho más.'
            ],
            'tiempo,cuanto tarda,plazos': [
                'Los tiempos dependen del proyecto: Landing pages (1-2 semanas), webs corporativas (3-6 semanas), e-commerce (6-10 semanas).',
                'Trabajamos con metodología ágil para entregas rápidas y eficientes.'
            ],
            'contacto,telefono,email,llamar': [
                'Puedes contactarnos al +34 900 123 456 o por email a hello@softcronw.com. ¿Prefieres que te llamemos?',
                'Estamos disponibles de lunes a viernes de 9:00 a 18:00, y sábados de 10:00 a 14:00.'
            ],
            'gracias,genial,perfecto': [
                '¡De nada! ¿Hay algo más en lo que pueda ayudarte?',
                '¡Genial! Si tienes más preguntas, estaré aquí.',
                '¡Perfecto! ¿Necesitas algo más?'
            ]
        };
    }
}

// =====================================
// FAQ MANAGER CLASS
// =====================================

class FAQManager {
    constructor() {
        this.init();
    }

    init() {
        this.searchInput = document.getElementById('faqSearch');
        this.accordionItems = document.querySelectorAll('.accordion-item');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Search functionality
        this.searchInput?.addEventListener('input', (e) => {
            this.filterFAQ(e.target.value);
        });
    }

    filterFAQ(searchTerm) {
        const term = searchTerm.toLowerCase();
        
        this.accordionItems.forEach(item => {
            const question = item.querySelector('.accordion-button').textContent.toLowerCase();
            const answer = item.querySelector('.accordion-body').textContent.toLowerCase();
            const tags = item.dataset.tags || '';
            
            const matches = question.includes(term) || 
                          answer.includes(term) || 
                          tags.includes(term);
            
            item.style.display = matches || !term ? 'block' : 'none';
        });
    }
}

// =====================================
// MAP MANAGER CLASS
// =====================================

class MapManager {
    constructor() {
        this.init();
    }

    init() {
        // Initialize map when available
        if (typeof google !== 'undefined' && google.maps) {
            this.initializeGoogleMap();
        } else {
            this.initializePlaceholderMap();
        }
    }

    initializeGoogleMap() {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        const location = { lat: 40.4168, lng: -3.7038 }; // Madrid coordinates
        
        const map = new google.maps.Map(mapElement, {
            zoom: 15,
            center: location,
            styles: this.getMapStyles()
        });

        const marker = new google.maps.Marker({
            position: location,
            map: map,
            title: 'SoftCronw'
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h4>SoftCronw</h4>
                    <p>Calle Serrano, 123<br>28006 Madrid, España</p>
                    <a href="https://goo.gl/maps/example" target="_blank">Ver en Google Maps</a>
                </div>
            `
        });

        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
    }

    initializePlaceholderMap() {
        const mapElement = document.getElementById('google-map');
        if (!mapElement) return;

        mapElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f0f0f0; color: #666;">
                <div style="text-align: center;">
                    <i class="fas fa-map-marked-alt" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <p>Mapa interactivo</p>
                    <p>Calle Serrano, 123<br>28006 Madrid, España</p>
                </div>
            </div>
        `;
    }

    getMapStyles() {
        return [
            {
                "featureType": "all",
                "elementType": "geometry.fill",
                "stylers": [{"weight": "2.00"}]
            },
            {
                "featureType": "all",
                "elementType": "geometry.stroke",
                "stylers": [{"color": "#9c9c9c"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text",
                "stylers": [{"visibility": "on"}]
            }
        ];
    }
}

// =====================================
// INITIALIZATION
// =====================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: { value: 80, density: { enable: true, value_area: 800 } },
                color: { value: "#007bff" },
                shape: { type: "circle" },
                opacity: { value: 0.5, random: false },
                size: { value: 3, random: true },
                line_linked: { enable: true, distance: 150, color: "#007bff", opacity: 0.4, width: 1 },
                move: { enable: true, speed: 6, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
            },
            interactivity: {
                detect_on: "canvas",
                events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
                modes: { grab: { distance: 400, line_linked: { opacity: 1 } }, bubble: { distance: 400, size: 40, duration: 2, opacity: 8, speed: 3 }, repulse: { distance: 200, duration: 0.4 }, push: { particles_nb: 4 }, remove: { particles_nb: 2 } }
            },
            retina_detect: true
        });
    }

    // Initialize AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-out-cubic',
            once: true,
            offset: 100
        });
    }

    // Initialize contact manager
    window.contactManager = new ContactManager();

    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }, 1000);
    }

    console.log('Contact page initialized successfully');
}); 