//
// Services Page Spectacular JavaScript
// Funcionalidades interactivas para la página de servicios
//

// =====================================
// GLOBAL CONFIGURATION
// =====================================

const ServicesConfig = {
  filters: {
    animationDuration: 500,
    defaultFilter: 'all'
  },
  calculator: {
    updateDelay: 300,
    baseComplexity: 1.2,
    defaultTimeline: 1.0
  },
  testimonials: {
    autoSlideInterval: 6000,
    currentSlide: 0,
    totalSlides: 3
  },
  cards: {
    flipDuration: 800,
    hoverDelay: 100
  }
};

// =====================================
// SERVICE FILTERS SYSTEM
// =====================================

class ServiceFilters {
  constructor() {
    this.currentFilter = ServicesConfig.filters.defaultFilter;
    this.cards = [];
    this.filterButtons = [];
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.filterCards(this.currentFilter);
  }
  
  bindElements() {
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.cards = document.querySelectorAll('.service-card-3d');
  }
  
  bindEvents() {
    this.filterButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const filter = button.dataset.filter;
        this.setActiveFilter(button);
        this.filterCards(filter);
      });
    });
  }
  
  setActiveFilter(activeButton) {
    this.filterButtons.forEach(btn => {
      btn.classList.remove('filter-btn--active');
    });
    activeButton.classList.add('filter-btn--active');
  }
  
  filterCards(filter) {
    this.currentFilter = filter;
    
    this.cards.forEach((card, index) => {
      const cardCategory = card.dataset.category;
      const shouldShow = filter === 'all' || cardCategory === filter;
      
      setTimeout(() => {
        if (shouldShow) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.transition = 'all 0.3s ease';
          card.style.opacity = '0';
          card.style.transform = 'translateY(-20px)';
          
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      }, index * 100);
    });
  }
}

// =====================================
// 3D CARD EFFECTS
// =====================================

class Card3DEffects {
  constructor() {
    this.cards = [];
    this.init();
  }
  
  init() {
    this.bindCards();
    this.setupCardEvents();
  }
  
  bindCards() {
    this.cards = document.querySelectorAll('.service-card-3d');
  }
  
  setupCardEvents() {
    this.cards.forEach(card => {
      const cardInner = card.querySelector('.service-card__inner');
      
      card.addEventListener('mouseenter', () => {
        this.addHoverEffects(card);
      });
      
      card.addEventListener('mouseleave', () => {
        this.removeHoverEffects(card);
      });
      
      card.addEventListener('mousemove', (e) => {
        this.updateTiltEffect(card, e);
      });
      
      // Auto-flip effect on scroll
      this.setupScrollFlip(card);
    });
  }
  
  addHoverEffects(card) {
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.opacity = '0.6';
    }
    
    card.style.transform = 'perspective(1000px) rotateY(0deg) translateY(-10px)';
    card.style.transition = 'transform 0.3s ease';
  }
  
  removeHoverEffects(card) {
    const glow = card.querySelector('.card-glow');
    if (glow) {
      glow.style.opacity = '0';
    }
    
    card.style.transform = 'perspective(1000px) rotateY(0deg) translateY(0px)';
  }
  
  updateTiltEffect(card, event) {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
  }
  
  setupScrollFlip(card) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            card.classList.add('animate-flip');
          }, Math.random() * 500);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(card);
  }
}

// =====================================
// PRICE CALCULATOR
// =====================================

class PriceCalculator {
  constructor() {
    this.selectedServices = new Set();
    this.complexityMultiplier = ServicesConfig.calculator.baseComplexity;
    this.timelineMultiplier = ServicesConfig.calculator.defaultTimeline;
    this.totalPrice = 0;
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.updateCalculator();
  }
  
  bindElements() {
    this.serviceCards = document.querySelectorAll('.option-card[data-service]');
    this.timelineCards = document.querySelectorAll('.timeline-option');
    this.complexityRange = document.getElementById('complexity-range');
    this.complexityValue = document.getElementById('complexity-value');
    this.totalPriceElement = document.getElementById('total-price');
    this.priceBreakdown = document.getElementById('price-breakdown');
  }
  
  bindEvents() {
    // Service selection
    this.serviceCards.forEach(card => {
      card.addEventListener('click', () => {
        this.toggleService(card);
      });
    });
    
    // Timeline selection
    this.timelineCards.forEach(card => {
      card.addEventListener('click', () => {
        this.selectTimeline(card);
      });
    });
    
    // Complexity range
    if (this.complexityRange) {
      this.complexityRange.addEventListener('input', (e) => {
        this.updateComplexity(parseFloat(e.target.value));
      });
    }
  }
  
  toggleService(card) {
    const service = card.dataset.service;
    const price = parseInt(card.dataset.price);
    const checkbox = card.querySelector('.option-checkbox');
    
    if (this.selectedServices.has(service)) {
      this.selectedServices.delete(service);
      card.classList.remove('selected');
      checkbox.classList.remove('checked');
    } else {
      this.selectedServices.add(service);
      card.classList.add('selected');
      checkbox.classList.add('checked');
    }
    
    this.updateCalculator();
    this.animateCardSelection(card);
  }
  
  selectTimeline(card) {
    this.timelineCards.forEach(c => {
      c.classList.remove('selected');
      c.querySelector('.option-checkbox').classList.remove('checked');
    });
    
    card.classList.add('selected');
    card.querySelector('.option-checkbox').classList.add('checked');
    
    this.timelineMultiplier = parseFloat(card.dataset.multiplier);
    this.updateCalculator();
  }
  
  updateComplexity(value) {
    this.complexityMultiplier = value;
    
    let label = 'Básico';
    if (value <= 1.0) label = 'Básico';
    else if (value <= 1.5) label = 'Medio';
    else label = 'Avanzado';
    
    if (this.complexityValue) {
      this.complexityValue.textContent = `${label} (${value}x)`;
    }
    
    this.updateCalculator();
  }
  
  updateCalculator() {
    let basePrice = 0;
    const selectedList = [];
    
    this.serviceCards.forEach(card => {
      const service = card.dataset.service;
      if (this.selectedServices.has(service)) {
        const price = parseInt(card.dataset.price);
        const title = card.querySelector('.option-title').textContent;
        basePrice += price;
        selectedList.push(`${title} (€${price})`);
      }
    });
    
    this.totalPrice = Math.round(basePrice * this.complexityMultiplier * this.timelineMultiplier);
    
    this.updatePriceDisplay(selectedList);
    this.animatePriceUpdate();
  }
  
  updatePriceDisplay(selectedList) {
    if (this.totalPriceElement) {
      this.totalPriceElement.textContent = `€${this.totalPrice.toLocaleString()}`;
    }
    
    if (this.priceBreakdown) {
      if (selectedList.length > 0) {
        let breakdown = `Servicios seleccionados: ${selectedList.join(', ')}`;
        if (this.complexityMultiplier !== 1.0) {
          breakdown += ` • Complejidad: ${this.complexityMultiplier}x`;
        }
        if (this.timelineMultiplier !== 1.0) {
          breakdown += ` • Timeline: ${this.timelineMultiplier}x`;
        }
        this.priceBreakdown.textContent = breakdown;
      } else {
        this.priceBreakdown.textContent = 'Selecciona los servicios que necesitas';
      }
    }
  }
  
  animateCardSelection(card) {
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      card.style.transform = 'scale(1)';
    }, 150);
  }
  
  animatePriceUpdate() {
    if (this.totalPriceElement) {
      this.totalPriceElement.style.transform = 'scale(1.1)';
      setTimeout(() => {
        this.totalPriceElement.style.transform = 'scale(1)';
      }, 200);
    }
  }
  
  getEstimate() {
    return {
      services: Array.from(this.selectedServices),
      totalPrice: this.totalPrice,
      complexity: this.complexityMultiplier,
      timeline: this.timelineMultiplier
    };
  }
}

// =====================================
// TESTIMONIALS SLIDER
// =====================================

class TestimonialsSlider {
  constructor() {
    this.currentSlide = 0;
    this.totalSlides = ServicesConfig.testimonials.totalSlides;
    this.autoSlideTimer = null;
    this.isAutoPlaying = true;
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
    this.startAutoSlide();
  }
  
  bindElements() {
    this.testimonialCards = document.querySelectorAll('.testimonial-card');
    this.navDots = document.querySelectorAll('.nav-dot');
    this.sliderContainer = document.querySelector('.testimonials-slider');
  }
  
  bindEvents() {
    this.navDots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoSlide();
      });
    });
    
    // Pause on hover
    if (this.sliderContainer) {
      this.sliderContainer.addEventListener('mouseenter', () => {
        this.pauseAutoSlide();
      });
      
      this.sliderContainer.addEventListener('mouseleave', () => {
        this.startAutoSlide();
      });
    }
    
    // Touch/swipe support
    this.setupTouchEvents();
  }
  
  goToSlide(index) {
    this.currentSlide = index;
    
    this.testimonialCards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
    
    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    
    this.animateSlideTransition();
  }
  
  nextSlide() {
    const nextIndex = (this.currentSlide + 1) % this.totalSlides;
    this.goToSlide(nextIndex);
  }
  
  prevSlide() {
    const prevIndex = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.goToSlide(prevIndex);
  }
  
  startAutoSlide() {
    if (this.isAutoPlaying) {
      this.autoSlideTimer = setInterval(() => {
        this.nextSlide();
      }, ServicesConfig.testimonials.autoSlideInterval);
    }
  }
  
  pauseAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }
  
  resetAutoSlide() {
    this.pauseAutoSlide();
    this.startAutoSlide();
  }
  
  animateSlideTransition() {
    const activeCard = document.querySelector('.testimonial-card.active');
    if (activeCard) {
      activeCard.style.opacity = '0';
      activeCard.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        activeCard.style.transition = 'all 0.5s ease';
        activeCard.style.opacity = '1';
        activeCard.style.transform = 'translateY(0)';
      }, 50);
    }
  }
  
  setupTouchEvents() {
    let startX = 0;
    let startY = 0;
    let threshold = 50;
    
    if (this.sliderContainer) {
      this.sliderContainer.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      });
      
      this.sliderContainer.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
          if (deltaX > 0) {
            this.prevSlide();
          } else {
            this.nextSlide();
          }
          this.resetAutoSlide();
        }
      });
    }
  }
}

// =====================================
// SERVICE MODALS
// =====================================

class ServiceModals {
  constructor() {
    this.currentModal = null;
    this.init();
  }
  
  init() {
    this.createModalContainer();
    this.bindEvents();
  }
  
  createModalContainer() {
    if (!document.getElementById('modal-container')) {
      const modalContainer = document.createElement('div');
      modalContainer.id = 'modal-container';
      modalContainer.className = 'modal-container';
      document.body.appendChild(modalContainer);
    }
  }
  
  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal-container') || e.target.matches('.modal-close')) {
        this.closeModal();
      }
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentModal) {
        this.closeModal();
      }
    });
  }
  
  openServiceModal(serviceId) {
    const modalData = this.getServiceModalData(serviceId);
    if (!modalData) return;
    
    const modalHTML = this.createModalHTML(modalData);
    const modalContainer = document.getElementById('modal-container');
    
    modalContainer.innerHTML = modalHTML;
    modalContainer.style.display = 'flex';
    
    setTimeout(() => {
      modalContainer.classList.add('modal-open');
    }, 10);
    
    this.currentModal = serviceId;
    document.body.style.overflow = 'hidden';
  }
  
  openQuoteModal(serviceId) {
    const quoteData = this.getQuoteModalData(serviceId);
    if (!quoteData) return;
    
    const modalHTML = this.createQuoteModalHTML(quoteData);
    const modalContainer = document.getElementById('modal-container');
    
    modalContainer.innerHTML = modalHTML;
    modalContainer.style.display = 'flex';
    
    setTimeout(() => {
      modalContainer.classList.add('modal-open');
    }, 10);
    
    this.currentModal = `quote-${serviceId}`;
    document.body.style.overflow = 'hidden';
  }
  
  closeModal() {
    const modalContainer = document.getElementById('modal-container');
    
    modalContainer.classList.remove('modal-open');
    
    setTimeout(() => {
      modalContainer.style.display = 'none';
      modalContainer.innerHTML = '';
    }, 300);
    
    this.currentModal = null;
    document.body.style.overflow = 'auto';
  }
  
  getServiceModalData(serviceId) {
    const serviceData = {
      'desarrollo-web': {
        title: 'Desarrollo Web Frontend & Backend',
        icon: 'fas fa-laptop-code',
        description: 'Creamos sitios web modernos y aplicaciones web escalables utilizando las últimas tecnologías.',
        features: [
          'Desarrollo Frontend con React/Vue.js',
          'Backend robusto con Node.js/PHP',
          'Base de datos MySQL/MongoDB',
          'API REST/GraphQL personalizada',
          'Hosting y dominio incluido (1 año)',
          'Certificado SSL y seguridad',
          'Panel de administración',
          'Responsive design garantizado',
          'Optimización SEO básica',
          'Soporte post-lanzamiento (3 meses)'
        ],
        technologies: ['React', 'Node.js', 'MySQL', 'AWS', 'Docker'],
        timeline: '3-4 semanas',
        price: '€899',
        portfolio: ['Proyecto E-commerce', 'Portal Corporativo', 'SaaS Platform']
      },
      'diseno-uiux': {
        title: 'Diseño UI/UX Profesional',
        icon: 'fas fa-palette',
        description: 'Diseñamos experiencias digitales memorables que conectan con tu audiencia.',
        features: [
          'Investigación de usuarios (UX Research)',
          'Wireframes y arquitectura de información',
          'Prototipos interactivos en Figma',
          'Sistema de diseño completo',
          'Diseño responsive para todos los dispositivos',
          'Testing de usabilidad',
          'Guía de marca y assets',
          'Animaciones y micro-interacciones',
          'Handoff a desarrollo',
          'Revisiones ilimitadas'
        ],
        technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision', 'Principle'],
        timeline: '2-3 semanas',
        price: '€599',
        portfolio: ['App Bancaria', 'E-commerce Fashion', 'Dashboard Analytics']
      },
      'ecommerce': {
        title: 'E-commerce Completo',
        icon: 'fas fa-shopping-cart',
        description: 'Tiendas online que convierten visitantes en clientes con la mejor experiencia de compra.',
        features: [
          'Plataforma WooCommerce/Shopify personalizada',
          'Pasarelas de pago múltiples (Stripe, PayPal)',
          'Gestión avanzada de inventario',
          'Panel de administración completo',
          'Carrito de compra optimizado',
          'Sistema de cupones y descuentos',
          'Integración con redes sociales',
          'Email marketing automatizado',
          'Analytics e informes de ventas',
          'Soporte 24/7 primer mes'
        ],
        technologies: ['WooCommerce', 'Shopify', 'Stripe', 'MailChimp', 'Google Analytics'],
        timeline: '4-6 semanas',
        price: '€1,299',
        portfolio: ['Fashion Store', 'Electronics Shop', 'Food Delivery']
      }
      // Agregar más servicios según sea necesario
    };
    
    return serviceData[serviceId] || null;
  }
  
  getQuoteModalData(serviceId) {
    const serviceNames = {
      'desarrollo-web': 'Desarrollo Web Frontend & Backend',
      'diseno-uiux': 'Diseño UI/UX Profesional', 
      'ecommerce': 'E-commerce Completo',
      'mantenimiento': 'Mantenimiento Web',
      'soporte': 'Soporte Técnico 24/7',
      'seo': 'Optimización SEO',
      'apps-moviles': 'Aplicaciones Móviles',
      'consultoria': 'Consultoría Digital',
      'calculator': 'Servicios Seleccionados en Calculadora'
    };
    
    return {
      serviceId: serviceId,
      serviceName: serviceNames[serviceId] || 'Servicio Personalizado',
      title: `Cotización para ${serviceNames[serviceId] || 'Servicio Personalizado'}`,
      description: 'Cuéntanos más detalles sobre tu proyecto para una cotización precisa y personalizada'
    };
  }
  
  createModalHTML(data) {
    return `
      <div class="modal-backdrop">
        <div class="modal-content service-modal">
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-header">
            <div class="service-icon-large">
              <i class="${data.icon}"></i>
            </div>
            <h2 class="modal-title">${data.title}</h2>
            <p class="modal-description">${data.description}</p>
          </div>
          
          <div class="modal-body">
            <div class="service-details-grid">
              <div class="service-features-detailed">
                <h3>✨ Qué Incluye</h3>
                <ul class="features-list-detailed">
                  ${data.features.map(feature => `
                    <li>
                      <i class="fas fa-check-circle"></i>
                      <span>${feature}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              
              <div class="service-info">
                <div class="info-card">
                  <h4>🚀 Tecnologías</h4>
                  <div class="tech-tags">
                    ${data.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                  </div>
                </div>
                
                <div class="info-card">
                  <h4>⏱ Timeline</h4>
                  <p class="timeline-text">${data.timeline}</p>
                </div>
                
                <div class="info-card price-card">
                  <h4>💰 Precio</h4>
                  <p class="price-large">${data.price}</p>
                  <small>Precio base, puede variar según requerimientos</small>
                </div>
              </div>
            </div>
            
            <div class="portfolio-showcase">
              <h3>📂 Proyectos Similares</h3>
              <div class="portfolio-items">
                ${data.portfolio.map(project => `
                  <div class="portfolio-item">
                    <div class="portfolio-thumb"></div>
                    <span class="portfolio-name">${project}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="btn-modal btn-secondary" onclick="serviceModals.closeModal()">
              Cerrar
            </button>
            <button class="btn-modal btn-primary" onclick="serviceModals.openQuoteModal('${data.serviceId || 'generic'}')">
              <i class="fas fa-paper-plane"></i>
              Solicitar Cotización
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  createQuoteModalHTML(data) {
    return `
      <div class="modal-backdrop">
        <div class="modal-content quote-modal">
          <button class="modal-close">
            <i class="fas fa-times"></i>
          </button>
          
          <div class="modal-header">
            <div class="quote-icon">
              <i class="fas fa-calculator"></i>
            </div>
            <h2 class="modal-title">${data.title}</h2>
            <p class="modal-description">${data.description}</p>
          </div>
          
          <div class="modal-body">
            <form class="quote-form" id="quote-form" onsubmit="return serviceModals.handleQuoteSubmit(event)">
              <input type="hidden" name="service_type" value="${data.serviceId}">
              <input type="hidden" name="service_name" value="${data.serviceName}">
              
              <div class="form-grid">
                <div class="form-group">
                  <label>Nombre completo *</label>
                  <input type="text" name="name" required placeholder="Tu nombre completo">
                </div>
                
                <div class="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required placeholder="tu@email.com">
                </div>
                
                <div class="form-group">
                  <label>Teléfono</label>
                  <input type="tel" name="phone" placeholder="+34 600 000 000">
                </div>
                
                <div class="form-group">
                  <label>Empresa</label>
                  <input type="text" name="company" placeholder="Nombre de tu empresa">
                </div>
              </div>
              
              <div class="form-group">
                <label>Presupuesto estimado</label>
                <select name="budget">
                  <option value="">Selecciona un rango</option>
                  <option value="500-1000">€500 - €1,000</option>
                  <option value="1000-2500">€1,000 - €2,500</option>
                  <option value="2500-5000">€2,500 - €5,000</option>
                  <option value="5000-10000">€5,000 - €10,000</option>
                  <option value="10000+">€10,000+</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Descripción del proyecto *</label>
                <textarea name="description" required rows="4" placeholder="Cuéntanos los detalles de tu proyecto: objetivos, funcionalidades específicas, audiencia target, referencias, etc."></textarea>
              </div>
              
              <div class="form-group">
                <label>Timeline deseado</label>
                <select name="timeline">
                  <option value="">Selecciona timeline</option>
                  <option value="urgente">Urgente (1-2 semanas) +50%</option>
                  <option value="normal">Normal (3-4 semanas)</option>
                  <option value="flexible">Flexible (5+ semanas) -20%</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Servicios adicionales</label>
                <div class="checkbox-grid">
                  <label class="checkbox-item">
                    <input type="checkbox" name="extras[]" value="hosting">
                    <span class="checkmark"></span>
                    <span>Hosting y Dominio</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" name="extras[]" value="seo">
                    <span class="checkmark"></span>
                    <span>SEO Básico</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" name="extras[]" value="analytics">
                    <span class="checkmark"></span>
                    <span>Analytics Setup</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" name="extras[]" value="social">
                    <span class="checkmark"></span>
                    <span>Redes Sociales</span>
                  </label>
                </div>
              </div>
              
              <div class="form-group">
                <label class="checkbox-item privacy-check">
                  <input type="checkbox" name="privacy" required>
                  <span class="checkmark"></span>
                  <span>Acepto la <a href="#" class="privacy-link">política de privacidad</a> y el tratamiento de mis datos *</span>
                </label>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn-modal btn-secondary" onclick="serviceModals.closeModal()">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button type="submit" form="quote-form" class="btn-modal btn-primary" id="submit-quote-btn">
              <i class="fas fa-paper-plane"></i>
              Enviar Cotización
            </button>
          </div>
        </div>
      </div>
    `;
  }
  
  handleQuoteSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submit-quote-btn');
    const originalText = submitBtn.innerHTML;
    
    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    submitBtn.disabled = true;
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Simulate API call
    setTimeout(() => {
      // Get form data
      const quoteData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || 'No proporcionado',
        company: formData.get('company') || 'No especificada',
        serviceType: formData.get('service_type'),
        serviceName: formData.get('service_name'),
        budget: formData.get('budget') || 'Por determinar',
        description: formData.get('description'),
        timeline: formData.get('timeline') || 'Flexible',
        extras: formData.getAll('extras[]'),
        timestamp: new Date().toLocaleString('es-ES')
      };
      
      // Store in localStorage for demo purposes
      const quotes = JSON.parse(localStorage.getItem('softcronw_quotes') || '[]');
      quotes.push(quoteData);
      localStorage.setItem('softcronw_quotes', JSON.stringify(quotes));
      
      console.log('💬 Nueva cotización recibida:', quoteData);
      
      // Show success message
      this.showSuccessMessage(quoteData);
      
      // Reset button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      
    }, 2000); // Simulate 2 second API call
    
    return false;
  }
  
  showSuccessMessage(quoteData) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-content success-modal">
          <div class="success-animation">
            <div class="success-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="success-ripple"></div>
          </div>
          
          <h2>¡Cotización Enviada Exitosamente!</h2>
          
          <div class="success-details">
            <p><strong>Gracias ${quoteData.name}</strong>, hemos recibido tu solicitud para <strong>${quoteData.serviceName}</strong>.</p>
            
            <div class="next-steps">
              <h3>📋 Próximos Pasos:</h3>
              <ul>
                <li><i class="fas fa-clock"></i> <strong>Análisis:</strong> Revisaremos tu proyecto en detalle</li>
                <li><i class="fas fa-calculator"></i> <strong>Cotización:</strong> Prepararemos una propuesta personalizada</li>
                <li><i class="fas fa-phone"></i> <strong>Contacto:</strong> Te llamaremos en menos de 24 horas</li>
                <li><i class="fas fa-handshake"></i> <strong>Reunión:</strong> Agendaremos una videollamada si es necesario</li>
              </ul>
            </div>
            
            <div class="contact-info">
              <p>Si tienes alguna pregunta urgente, puedes contactarnos:</p>
              <div class="contact-methods">
                <a href="mailto:info@softcronw.com" class="contact-item">
                  <i class="fas fa-envelope"></i>
                  info@softcronw.com
                </a>
                <a href="tel:+34600000000" class="contact-item">
                  <i class="fas fa-phone"></i>
                  +34 600 000 000
                </a>
                <a href="https://wa.me/34600000000" class="contact-item" target="_blank">
                  <i class="fab fa-whatsapp"></i>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
          
          <div class="success-actions">
            <button class="btn-modal btn-secondary" onclick="serviceModals.closeModal()">
              <i class="fas fa-home"></i>
              Volver a Servicios
            </button>
            <a href="portfolio.html" class="btn-modal btn-primary">
              <i class="fas fa-briefcase"></i>
              Ver Nuestro Portfolio
            </a>
          </div>
        </div>
      </div>
    `;
    
    // Add success animation
    setTimeout(() => {
      const ripple = document.querySelector('.success-ripple');
      if (ripple) {
        ripple.style.animation = 'successRipple 1s ease-out forwards';
      }
    }, 500);
  }
}

// =====================================
// SCROLL ANIMATIONS ENHANCEMENT
// =====================================

class ScrollAnimationsServices {
  constructor() {
    this.init();
  }
  
  init() {
    this.setupScrollObserver();
    this.addScrollEffects();
  }
  
  setupScrollObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll(
      '.service-card-3d, .timeline-item-spectacular, .option-card, .testimonial-card'
    );
    
    animatedElements.forEach(el => {
      observer.observe(el);
    });
  }
  
  addScrollEffects() {
    // Parallax effect for background elements
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const parallaxElements = document.querySelectorAll('.floating-quotes, .floating-elements');
      
      parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });
    });
  }
}

// =====================================
// SERVICES APP INITIALIZATION
// =====================================

class ServicesApp {
  constructor() {
    this.filters = null;
    this.cardEffects = null;
    this.calculator = null;
    this.testimonials = null;
    this.modals = null;
    this.scrollAnimations = null;
    
    this.init();
  }
  
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
    } else {
      this.initializeComponents();
    }
  }
  
  initializeComponents() {
    console.log('🎯 Initializing Services Spectacular...');
    
    // Initialize all components
    this.filters = new ServiceFilters();
    this.cardEffects = new Card3DEffects();
    this.calculator = new PriceCalculator();
    this.testimonials = new TestimonialsSlider();
    this.modals = new ServiceModals();
    this.scrollAnimations = new ScrollAnimationsServices();
    
    // Make components globally available
    window.serviceFilters = this.filters;
    window.priceCalculator = this.calculator;
    window.testimonialsSlider = this.testimonials;
    window.serviceModals = this.modals;
    
    console.log('✨ Services Spectacular Initialized!');
  }
}

// ========================================
// GLOBAL FUNCTIONS FOR HTML INTEGRATION
// ========================================

// Global function to open service modal
function openServiceModal(serviceId) {
  if (window.serviceModals) {
    window.serviceModals.openModal(serviceId);
  }
}

// Global function to open quote modal
function openQuoteModal(serviceId) {
  if (window.serviceModals) {
    window.serviceModals.openQuoteModal(serviceId);
  }
}

// Global function to close modals
function closeModal() {
  if (window.serviceModals) {
    window.serviceModals.closeModal();
  }
}

// Global function to close service modal (legacy support)
function closeServiceModal() {
  closeModal();
}

// Global function to handle calculator quote
function handleCalculatorQuote() {
  if (window.priceCalculator) {
    window.priceCalculator.handleQuote();
  }
}

// Console logging for debugging
console.log('🌟 Services Spectacular - Global functions loaded');

// ========================================
// PERFORMANCE OPTIMIZATIONS
// ========================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function for scroll events
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

// Add performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('⚡ Page Load Performance:', {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        totalTime: Math.round(perfData.loadEventEnd - perfData.navigationStart)
      });
    }, 0);
  });
}

// ========================================
// EXPORT FOR MODULE SYSTEMS (if needed)
// ========================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ServiceFilters,
    PriceCalculator,
    TestimonialSlider,
    ServiceModals,
    openServiceModal,
    openQuoteModal,
    closeModal,
    debounce,
    throttle
  };
}

// ========================================
// INITIALIZATION COMPLETE
// ========================================

console.log('🎯 Services Spectacular - All modules loaded successfully');
console.log('📊 Available global functions:', {
  'openServiceModal()': 'Opens service information modal',
  'openQuoteModal()': 'Opens quote request modal',
  'closeModal()': 'Closes any open modal',
  'handleCalculatorQuote()': 'Handles calculator quote request'
});

// =====================================
// AUTO-INITIALIZATION
// =====================================

// Initialize the services app
window.ServicesApp = new ServicesApp();

// Export classes for external use
window.ServiceFilters = ServiceFilters;
window.Card3DEffects = Card3DEffects;
window.PriceCalculator = PriceCalculator;
window.TestimonialsSlider = TestimonialsSlider;
window.ServiceModals = ServiceModals; 