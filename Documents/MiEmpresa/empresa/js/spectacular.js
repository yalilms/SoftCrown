//
// Spectacular Effects & Animations
// JavaScript espectacular para SoftCronw
//

// =====================================
// GLOBAL CONFIGURATION
// =====================================

const SpectacularConfig = {
  particles: {
    count: 100,
    maxSpeed: 2,
    colors: ['#00f5ff', '#ff00ff', '#00ff88']
  },
  animations: {
    duration: 2000,
    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  },
  effects: {
    cursorEnabled: true,
    parallaxEnabled: true,
    typewriterSpeed: 100
  }
};

// =====================================
// PARTICLE SYSTEM
// =====================================

class ParticleSystem {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.canvas = null;
    this.ctx = null;
    this.mouse = { x: 0, y: 0 };
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.createCanvas();
    this.createParticles();
    this.bindEvents();
    this.animate();
  }
  
  createCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);
    
    this.resize();
  }
  
  createParticles() {
    for (let i = 0; i < SpectacularConfig.particles.count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * SpectacularConfig.particles.maxSpeed,
        vy: (Math.random() - 0.5) * SpectacularConfig.particles.maxSpeed,
        radius: Math.random() * 3 + 1,
        color: SpectacularConfig.particles.colors[Math.floor(Math.random() * SpectacularConfig.particles.colors.length)],
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  resize() {
    this.canvas.width = this.container.offsetWidth;
    this.canvas.height = this.container.offsetHeight;
  }
  
  bindEvents() {
    window.addEventListener('resize', () => this.resize());
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      // Mouse interaction
      const dx = this.mouse.x - particle.x;
      const dy = this.mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        particle.vx += dx * 0.0001;
        particle.vy += dy * 0.0001;
      }
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Bounce off edges
      if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
      
      // Keep in bounds
      particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
      particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
      
      // Draw connections
      this.particles.forEach(otherParticle => {
        const dx2 = particle.x - otherParticle.x;
        const dy2 = particle.y - otherParticle.y;
        const distance2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        
        if (distance2 < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = particle.color;
          this.ctx.globalAlpha = (100 - distance2) / 100 * 0.2;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// =====================================
// TYPEWRITER EFFECT
// =====================================

class TypewriterEffect {
  constructor(element, texts, options = {}) {
    this.element = element;
    this.texts = Array.isArray(texts) ? texts : [texts];
    this.speed = options.speed || SpectacularConfig.effects.typewriterSpeed;
    this.backSpeed = options.backSpeed || this.speed / 2;
    this.startDelay = options.startDelay || 1000;
    this.backDelay = options.backDelay || 2000;
    this.loop = options.loop !== false;
    this.showCursor = options.showCursor !== false;
    
    this.currentTextIndex = 0;
    this.currentCharIndex = 0;
    this.isDeleting = false;
    this.isActive = false;
    
    this.init();
  }
  
  init() {
    if (this.showCursor) {
      this.createCursor();
    }
    
    setTimeout(() => {
      this.isActive = true;
      this.type();
    }, this.startDelay);
  }
  
  createCursor() {
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    this.element.appendChild(cursor);
  }
  
  type() {
    if (!this.isActive) return;
    
    const currentText = this.texts[this.currentTextIndex];
    
    if (this.isDeleting) {
      this.currentCharIndex--;
    } else {
      this.currentCharIndex++;
    }
    
    const displayText = currentText.substring(0, this.currentCharIndex);
    this.element.firstChild.textContent = displayText;
    
    let speed = this.isDeleting ? this.backSpeed : this.speed;
    
    if (!this.isDeleting && this.currentCharIndex === currentText.length) {
      speed = this.backDelay;
      this.isDeleting = true;
    } else if (this.isDeleting && this.currentCharIndex === 0) {
      this.isDeleting = false;
      this.currentTextIndex = (this.currentTextIndex + 1) % this.texts.length;
      
      if (!this.loop && this.currentTextIndex === 0 && this.currentCharIndex === 0) {
        this.isActive = false;
        return;
      }
      
      speed = this.startDelay;
    }
    
    setTimeout(() => this.type(), speed);
  }
  
  destroy() {
    this.isActive = false;
  }
}

// =====================================
// ANIMATED COUNTERS
// =====================================

class AnimatedCounter {
  constructor(element, targetValue, options = {}) {
    this.element = element;
    this.targetValue = targetValue;
    this.duration = options.duration || SpectacularConfig.animations.duration;
    this.startValue = options.startValue || 0;
    this.suffix = options.suffix || '';
    this.prefix = options.prefix || '';
    this.separator = options.separator || '';
    
    this.currentValue = this.startValue;
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animate();
          this.observer.unobserve(this.element);
        }
      });
    }, { threshold: 0.5 });
    
    this.observer.observe(this.element);
  }
  
  animate() {
    const startTime = performance.now();
    const startValue = this.currentValue;
    const valueRange = this.targetValue - startValue;
    
    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / this.duration, 1);
      
      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      this.currentValue = Math.floor(startValue + (valueRange * easeProgress));
      
      const formattedValue = this.formatNumber(this.currentValue);
      this.element.textContent = this.prefix + formattedValue + this.suffix;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        this.currentValue = this.targetValue;
        const finalValue = this.formatNumber(this.currentValue);
        this.element.textContent = this.prefix + finalValue + this.suffix;
      }
    };
    
    requestAnimationFrame(updateCounter);
  }
  
  formatNumber(num) {
    if (this.separator === ',') {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return num.toString();
  }
}

// =====================================
// SCROLL ANIMATIONS
// =====================================

class ScrollAnimations {
  constructor() {
    this.elements = [];
    this.observer = null;
    
    this.init();
  }
  
  init() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    this.bindElements();
  }
  
  bindElements() {
    // Elementos con animación de entrada
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(50px)';
      element.style.transition = 'all 0.8s ease';
      this.observer.observe(element);
    });
    
    // Cards con efecto hover 3D
    const cards3D = document.querySelectorAll('.service-card-3d, .feature-card-mega, .tech-category-card');
    cards3D.forEach(card => {
      this.add3DEffect(card);
    });
  }
  
  animateElement(element) {
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    
    // Efectos adicionales basados en clases
    if (element.classList.contains('slide-left')) {
      element.style.transform = 'translateX(0)';
    }
    if (element.classList.contains('slide-right')) {
      element.style.transform = 'translateX(0)';
    }
    if (element.classList.contains('scale-up')) {
      element.style.transform = 'scale(1)';
    }
  }
  
  add3DEffect(card) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(5deg) translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    });
    
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
  }
}

// =====================================
// PARALLAX EFFECTS
// =====================================

class ParallaxEffects {
  constructor() {
    this.elements = [];
    this.ticking = false;
    
    this.init();
  }
  
  init() {
    this.bindElements();
    this.bindEvents();
  }
  
  bindElements() {
    // Elementos con efecto parallax
    const parallaxElements = document.querySelectorAll('.parallax-element');
    parallaxElements.forEach(element => {
      const speed = element.dataset.speed || 0.5;
      this.elements.push({
        element,
        speed: parseFloat(speed)
      });
    });
    
    // Geometrías flotantes
    const floatingGeometries = document.querySelectorAll('.floating-geometry');
    floatingGeometries.forEach((geo, index) => {
      this.elements.push({
        element: geo,
        speed: 0.3 + (index * 0.1)
      });
    });
  }
  
  bindEvents() {
    window.addEventListener('scroll', () => {
      if (!this.ticking) {
        requestAnimationFrame(() => this.updateParallax());
        this.ticking = true;
      }
    });
  }
  
  updateParallax() {
    const scrollTop = window.pageYOffset;
    
    this.elements.forEach(({ element, speed }) => {
      const yPos = -(scrollTop * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
    
    this.ticking = false;
  }
}

// =====================================
// CUSTOM CURSOR
// =====================================

class CustomCursor {
  constructor() {
    this.cursor = null;
    this.isVisible = false;
    
    if (SpectacularConfig.effects.cursorEnabled && !this.isMobile()) {
      this.init();
    }
  }
  
  init() {
    this.createCursor();
    this.bindEvents();
  }
  
  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    document.body.appendChild(this.cursor);
  }
  
  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      if (!this.isVisible) {
        this.cursor.style.opacity = '1';
        this.isVisible = true;
      }
      
      this.cursor.style.left = e.clientX + 'px';
      this.cursor.style.top = e.clientY + 'px';
    });
    
    document.addEventListener('mouseenter', () => {
      this.cursor.style.opacity = '1';
      this.isVisible = true;
    });
    
    document.addEventListener('mouseleave', () => {
      this.cursor.style.opacity = '0';
      this.isVisible = false;
    });
    
    // Hover effects
    const hoverElements = document.querySelectorAll('a, button, .btn, .service-card-3d, .tech-orb');
    hoverElements.forEach(element => {
      element.addEventListener('mouseenter', () => {
        this.cursor.classList.add('cursor-hover');
      });
      
      element.addEventListener('mouseleave', () => {
        this.cursor.classList.remove('cursor-hover');
      });
    });
  }
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
}

// =====================================
// FORM ENHANCEMENTS
// =====================================

class FormEnhancements {
  constructor() {
    this.forms = [];
    
    this.init();
  }
  
  init() {
    this.bindForms();
    this.addFloatingLabels();
    this.addValidation();
  }
  
  bindForms() {
    const forms = document.querySelectorAll('.mega-form');
    forms.forEach(form => {
      this.forms.push(form);
      this.enhanceForm(form);
    });
  }
  
  enhanceForm(form) {
    const submitBtn = form.querySelector('.submit-btn-mega');
    
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        this.addRippleEffect(e, submitBtn);
      });
    }
  }
  
  addRippleEffect(event, button) {
    const ripple = button.querySelector('.btn-pulse');
    if (ripple) {
      ripple.style.width = '0';
      ripple.style.height = '0';
      
      setTimeout(() => {
        ripple.style.width = '300px';
        ripple.style.height = '300px';
      }, 10);
      
      setTimeout(() => {
        ripple.style.width = '0';
        ripple.style.height = '0';
      }, 600);
    }
  }
  
  addFloatingLabels() {
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach(group => {
      const input = group.querySelector('input, textarea, select');
      if (input && input.placeholder) {
        const label = document.createElement('label');
        label.textContent = input.placeholder;
        label.className = 'floating-label';
        input.placeholder = '';
        group.appendChild(label);
        
        input.addEventListener('focus', () => {
          label.classList.add('active');
        });
        
        input.addEventListener('blur', () => {
          if (!input.value) {
            label.classList.remove('active');
          }
        });
        
        if (input.value) {
          label.classList.add('active');
        }
      }
    });
  }
  
  addValidation() {
    const inputs = document.querySelectorAll('.form-group input, .form-group textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', () => {
        this.validateField(input);
      });
      
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          this.validateField(input);
        }
      });
    });
  }
  
  validateField(field) {
    const isValid = field.checkValidity();
    const group = field.closest('.form-group');
    
    if (isValid) {
      group.classList.remove('error');
      group.classList.add('success');
    } else {
      group.classList.remove('success');
      group.classList.add('error');
    }
  }
}

// =====================================
// SPECTACULAR INITIALIZATION
// =====================================

class SpectacularApp {
  constructor() {
    this.particleSystem = null;
    this.typewriter = null;
    this.counters = [];
    this.scrollAnimations = null;
    this.parallax = null;
    this.cursor = null;
    this.forms = null;
    
    this.init();
  }
  
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeEffects());
    } else {
      this.initializeEffects();
    }
  }
  
  initializeEffects() {
    console.log('🚀 Initializing Spectacular Effects...');
    
    // Initialize particle system
    this.initParticles();
    
    // Initialize typewriter effect
    this.initTypewriter();
    
    // Initialize animated counters
    this.initCounters();
    
    // Initialize scroll animations
    this.initScrollAnimations();
    
    // Initialize parallax effects
    this.initParallax();
    
    // Initialize custom cursor
    this.initCursor();
    
    // Initialize form enhancements
    this.initForms();
    
    // Initialize additional effects
    this.initAdditionalEffects();
    
    console.log('✨ Spectacular Effects Initialized!');
  }
  
  initParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (particlesContainer) {
      this.particleSystem = new ParticleSystem(particlesContainer);
    }
  }
  
  initTypewriter() {
    const typedElement = document.querySelector('.typed-text');
    if (typedElement) {
      const texts = [
        'Soluciones Innovadoras',
        'Desarrollo Web Avanzado',
        'Tecnología de Vanguardia',
        'Transformación Digital'
      ];
      
      this.typewriter = new TypewriterEffect(typedElement, texts, {
        speed: 100,
        backSpeed: 50,
        startDelay: 2000,
        backDelay: 2000
      });
    }
  }
  
  initCounters() {
    const counterElements = document.querySelectorAll('.stat-number-mega');
    counterElements.forEach(element => {
      const target = parseInt(element.textContent.replace(/[^\d]/g, ''));
      const suffix = element.textContent.replace(/[\d]/g, '');
      
      const counter = new AnimatedCounter(element, target, {
        duration: 2000,
        suffix: suffix,
        separator: ','
      });
      
      this.counters.push(counter);
    });
  }
  
  initScrollAnimations() {
    this.scrollAnimations = new ScrollAnimations();
  }
  
  initParallax() {
    if (SpectacularConfig.effects.parallaxEnabled) {
      this.parallax = new ParallaxEffects();
    }
  }
  
  initCursor() {
    this.cursor = new CustomCursor();
  }
  
  initForms() {
    this.forms = new FormEnhancements();
  }
  
  initAdditionalEffects() {
    // Smooth scroll for navigation links
    this.initSmoothScroll();
    
    // Add loading animations
    this.initLoadingAnimations();
    
    // Add reveal animations
    this.initRevealAnimations();
  }
  
  initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
  
  initLoadingAnimations() {
    // Add staggered animations for cards
    const cards = document.querySelectorAll('.service-card-3d');
    cards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.2}s`;
      card.classList.add('animate-on-scroll');
    });
    
    // Add staggered animations for features
    const features = document.querySelectorAll('.feature-card-mega');
    features.forEach((feature, index) => {
      feature.style.animationDelay = `${index * 0.15}s`;
      feature.classList.add('animate-on-scroll');
    });
  }
  
  initRevealAnimations() {
    // Badge animations
    const badges = document.querySelectorAll('.hero-badge-ultra, .section-badge-glow, .section-badge-ultra, .section-badge-tech');
    badges.forEach(badge => {
      badge.classList.add('animate-on-scroll');
    });
    
    // Title animations
    const titles = document.querySelectorAll('.hero-title-mega, .section-title-mega, .section-title-ultra, .section-title-tech');
    titles.forEach(title => {
      title.classList.add('animate-on-scroll');
    });
    
    // Description animations
    const descriptions = document.querySelectorAll('.hero-description-ultra, .section-description-mega, .section-description-ultra, .section-description-tech');
    descriptions.forEach(desc => {
      desc.classList.add('animate-on-scroll');
    });
  }
  
  destroy() {
    if (this.particleSystem) {
      this.particleSystem.destroy();
    }
    
    if (this.typewriter) {
      this.typewriter.destroy();
    }
    
    this.counters.forEach(counter => {
      if (counter.observer) {
        counter.observer.disconnect();
      }
    });
  }
}

// =====================================
// AUTO-INITIALIZATION
// =====================================

// Initialize the spectacular app
window.SpectacularApp = new SpectacularApp();

// Expose classes globally for custom usage
window.ParticleSystem = ParticleSystem;
window.TypewriterEffect = TypewriterEffect;
window.AnimatedCounter = AnimatedCounter;
window.ScrollAnimations = ScrollAnimations;
window.ParallaxEffects = ParallaxEffects;
window.CustomCursor = CustomCursor;
window.FormEnhancements = FormEnhancements; 