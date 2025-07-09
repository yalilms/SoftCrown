/**
 * ================================================================
 * SOFTCRONW GSAP ANIMATION SYSTEM
 * Sistema avanzado de animaciones con GSAP y timeline complejos
 * ================================================================
 */

class GSAPAnimationSystem {
  constructor() {
    this.timelines = new Map();
    this.observers = new Map();
    this.isInitialized = false;
    this.config = {
      ease: 'power2.out',
      duration: 0.8,
      stagger: 0.1
    };
  }

  // ================================
  // INICIALIZACIÓN
  // ================================

  init() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP no está disponible');
      return;
    }

    this.setupGSAPPlugins();
    this.createMasterTimeline();
    this.initScrollAnimations();
    this.initHoverAnimations();
    this.initPageTransitions();
    this.initLoadingAnimations();
    this.setupIntersectionObserver();
    
    this.isInitialized = true;
    console.log('🎬 Sistema GSAP inicializado');
  }

  // ================================
  // CONFIGURACIÓN DE PLUGINS
  // ================================

  setupGSAPPlugins() {
    // Registrar plugins si están disponibles
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    
    if (typeof TextPlugin !== 'undefined') {
      gsap.registerPlugin(TextPlugin);
    }
    
    if (typeof MorphSVGPlugin !== 'undefined') {
      gsap.registerPlugin(MorphSVGPlugin);
    }

    // Configuraciones globales
    gsap.defaults({
      ease: this.config.ease,
      duration: this.config.duration
    });

    // Configurar ScrollTrigger si está disponible
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.config({
        autoRefreshEvents: "visibilitychange,DOMContentLoaded,load"
      });
    }
  }

  // ================================
  // TIMELINE MAESTRO
  // ================================

  createMasterTimeline() {
    this.masterTL = gsap.timeline({
      paused: true,
      onComplete: () => {
        this.dispatchEvent('gsap:masterComplete');
      }
    });

    // Animaciones de carga inicial
    this.masterTL
      .add(this.createHeroAnimation(), 0)
      .add(this.createNavigationAnimation(), 0.2)
      .add(this.createContentAnimation(), 0.4);
  }

  // ================================
  // ANIMACIONES HERO
  // ================================

  createHeroAnimation() {
    const tl = gsap.timeline();

    // Elementos del hero
    const heroTitle = document.querySelector('.hero-title-mega');
    const heroDescription = document.querySelector('.hero-description-ultra');
    const heroBadge = document.querySelector('.hero-badge-ultra');
    const heroButtons = document.querySelectorAll('.hero-btn');
    const heroParticles = document.querySelector('#particles-hero');

    if (heroTitle) {
      // Animación de título con efecto typing mejorado
      tl.fromTo(heroTitle, 
        { 
          opacity: 0, 
          y: 100,
          rotationX: -90,
          transformPerspective: 1000
        },
        { 
          opacity: 1, 
          y: 0,
          rotationX: 0,
          duration: 1.2,
          ease: 'back.out(1.7)'
        }
      );

      // Animar palabras individualmente
      const words = heroTitle.querySelectorAll('.title-word');
      if (words.length > 0) {
        tl.fromTo(words,
          { 
            opacity: 0,
            y: 50,
            rotationY: -45,
            scale: 0.8
          },
          { 
            opacity: 1,
            y: 0,
            rotationY: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'elastic.out(1, 0.5)'
          },
          '-=0.8'
        );
      }
    }

    if (heroBadge) {
      tl.fromTo(heroBadge,
        {
          opacity: 0,
          scale: 0,
          rotation: -180
        },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 1,
          ease: 'bounce.out'
        },
        '-=1'
      );

      // Animación continua del badge
      gsap.to(heroBadge, {
        y: -10,
        duration: 2,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1
      });
    }

    if (heroDescription) {
      tl.fromTo(heroDescription,
        {
          opacity: 0,
          y: 30,
          filter: 'blur(10px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power2.out'
        },
        '-=0.5'
      );
    }

    if (heroButtons.length > 0) {
      tl.fromTo(heroButtons,
        {
          opacity: 0,
          y: 40,
          scale: 0.8
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out'
        },
        '-=0.3'
      );
    }

    // Efectos de partículas
    if (heroParticles) {
      tl.fromTo(heroParticles,
        { opacity: 0 },
        { opacity: 1, duration: 2 },
        '-=1'
      );
    }

    return tl;
  }

  // ================================
  // ANIMACIONES DE NAVEGACIÓN
  // ================================

  createNavigationAnimation() {
    const tl = gsap.timeline();

    const header = document.querySelector('.header');
    const logo = document.querySelector('.nav__logo');
    const hamburger = document.querySelector('.hamburger');

    if (header) {
      tl.fromTo(header,
        {
          y: -100,
          opacity: 0
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power2.out'
        }
      );
    }

    if (logo) {
      tl.fromTo(logo,
        {
          scale: 0,
          rotation: -360
        },
        {
          scale: 1,
          rotation: 0,
          duration: 1.2,
          ease: 'elastic.out(1, 0.3)'
        },
        '-=0.8'
      );
    }

    if (hamburger) {
      tl.fromTo(hamburger,
        {
          scale: 0,
          rotation: 180
        },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: 'back.out(1.7)'
        },
        '-=0.6'
      );
    }

    return tl;
  }

  // ================================
  // ANIMACIONES DE CONTENIDO
  // ================================

  createContentAnimation() {
    const tl = gsap.timeline();

    // Elementos generales de contenido
    const sections = document.querySelectorAll('section:not(.hero-section-spectacular)');
    const cards = document.querySelectorAll('.card, .service-card, .feature-card');
    const images = document.querySelectorAll('img[data-animate]');

    // Animaciones de secciones
    if (sections.length > 0) {
      sections.forEach((section, index) => {
        gsap.set(section, { opacity: 0, y: 50 });
        
        // Crear ScrollTrigger para cada sección
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            onEnter: () => {
              gsap.to(section, {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: 'power2.out'
              });
            }
          });
        }
      });
    }

    // Animaciones de tarjetas
    if (cards.length > 0) {
      this.animateCards(cards);
    }

    // Animaciones de imágenes
    if (images.length > 0) {
      this.animateImages(images);
    }

    return tl;
  }

  // ================================
  // ANIMACIONES DE SCROLL
  // ================================

  initScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined') {
      console.warn('ScrollTrigger no disponible');
      return;
    }

    // Parallax de elementos
    this.createParallaxEffects();
    
    // Animaciones de contadores
    this.createCounterAnimations();
    
    // Animaciones de progreso
    this.createProgressAnimations();
    
    // Animaciones de reveal
    this.createRevealAnimations();
  }

  createParallaxEffects() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    
    parallaxElements.forEach(element => {
      const speed = element.dataset.parallax || 0.5;
      
      gsap.to(element, {
        yPercent: -50 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });
    });
  }

  createCounterAnimations() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
      const endValue = parseInt(counter.dataset.counter);
      const duration = parseFloat(counter.dataset.duration) || 2;
      
      ScrollTrigger.create({
        trigger: counter,
        start: 'top 80%',
        onEnter: () => {
          gsap.fromTo(counter, 
            { textContent: 0 },
            {
              textContent: endValue,
              duration: duration,
              ease: 'power2.out',
              snap: { textContent: 1 },
              onUpdate: function() {
                counter.textContent = Math.ceil(this.targets()[0].textContent);
              }
            }
          );
        },
        once: true
      });
    });
  }

  createProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-bar');
    
    progressBars.forEach(bar => {
      const progress = bar.dataset.progress || 100;
      
      gsap.set(bar, { width: '0%' });
      
      ScrollTrigger.create({
        trigger: bar,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(bar, {
            width: `${progress}%`,
            duration: 1.5,
            ease: 'power2.out'
          });
        },
        once: true
      });
    });
  }

  createRevealAnimations() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach(element => {
      const direction = element.dataset.reveal || 'up';
      let fromProps = {};
      
      switch (direction) {
        case 'up':
          fromProps = { y: 100, opacity: 0 };
          break;
        case 'down':
          fromProps = { y: -100, opacity: 0 };
          break;
        case 'left':
          fromProps = { x: -100, opacity: 0 };
          break;
        case 'right':
          fromProps = { x: 100, opacity: 0 };
          break;
        case 'scale':
          fromProps = { scale: 0, opacity: 0 };
          break;
        case 'rotate':
          fromProps = { rotation: 180, opacity: 0 };
          break;
      }
      
      gsap.set(element, fromProps);
      
      ScrollTrigger.create({
        trigger: element,
        start: 'top 90%',
        onEnter: () => {
          gsap.to(element, {
            ...Object.keys(fromProps).reduce((acc, key) => {
              acc[key] = key === 'opacity' ? 1 : 0;
              return acc;
            }, {}),
            duration: 1,
            ease: 'power2.out'
          });
        },
        once: true
      });
    });
  }

  // ================================
  // ANIMACIONES DE HOVER
  // ================================

  initHoverAnimations() {
    // Botones
    this.animateButtons();
    
    // Tarjetas
    this.animateCardHovers();
    
    // Enlaces
    this.animateLinks();
    
    // Iconos
    this.animateIcons();
  }

  animateButtons() {
    const buttons = document.querySelectorAll('.btn, button');
    
    buttons.forEach(button => {
      // Estado inicial
      gsap.set(button, { transformOrigin: 'center' });
      
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mousedown', () => {
        gsap.to(button, {
          scale: 0.95,
          duration: 0.1,
          ease: 'power2.out'
        });
      });
      
      button.addEventListener('mouseup', () => {
        gsap.to(button, {
          scale: 1.05,
          duration: 0.1,
          ease: 'power2.out'
        });
      });
    });
  }

  animateCardHovers() {
    const cards = document.querySelectorAll('.card, .service-card, .feature-card');
    
    cards.forEach(card => {
      gsap.set(card, { transformOrigin: 'center' });
      
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -10,
          scale: 1.02,
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          duration: 0.4,
          ease: 'power2.out'
        });
        
        // Animar elementos internos
        const cardImage = card.querySelector('img');
        const cardTitle = card.querySelector('h3, .card-title');
        
        if (cardImage) {
          gsap.to(cardImage, {
            scale: 1.1,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
        
        if (cardTitle) {
          gsap.to(cardTitle, {
            color: '#007bff',
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          scale: 1,
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          duration: 0.4,
          ease: 'power2.out'
        });
        
        const cardImage = card.querySelector('img');
        const cardTitle = card.querySelector('h3, .card-title');
        
        if (cardImage) {
          gsap.to(cardImage, {
            scale: 1,
            duration: 0.4,
            ease: 'power2.out'
          });
        }
        
        if (cardTitle) {
          gsap.to(cardTitle, {
            color: '',
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      });
    });
  }

  animateLinks() {
    const links = document.querySelectorAll('a:not(.btn)');
    
    links.forEach(link => {
      // Crear underline animado
      const underline = document.createElement('span');
      underline.className = 'animated-underline';
      underline.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 2px;
        background: currentColor;
        transition: none;
      `;
      
      if (link.style.position !== 'absolute' && link.style.position !== 'fixed') {
        link.style.position = 'relative';
      }
      
      link.appendChild(underline);
      
      link.addEventListener('mouseenter', () => {
        gsap.to(underline, {
          width: '100%',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
      
      link.addEventListener('mouseleave', () => {
        gsap.to(underline, {
          width: '0%',
          duration: 0.3,
          ease: 'power2.out'
        });
      });
    });
  }

  animateIcons() {
    const icons = document.querySelectorAll('.fa, .icon, [class*="icon-"]');
    
    icons.forEach(icon => {
      icon.addEventListener('mouseenter', () => {
        gsap.to(icon, {
          rotation: 10,
          scale: 1.2,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });
      
      icon.addEventListener('mouseleave', () => {
        gsap.to(icon, {
          rotation: 0,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)'
        });
      });
    });
  }

  // ================================
  // TRANSICIONES DE PÁGINA
  // ================================

  initPageTransitions() {
    const links = document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        // Solo para enlaces internos
        if (href && !href.startsWith('http') && !href.startsWith('mailto') && !href.startsWith('tel')) {
          e.preventDefault();
          this.transitionToPage(href);
        }
      });
    });
  }

  transitionToPage(url) {
    const tl = gsap.timeline({
      onComplete: () => {
        window.location.href = url;
      }
    });
    
    // Crear overlay de transición
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #007bff, #00d4ff);
      z-index: 10000;
      pointer-events: none;
    `;
    
    document.body.appendChild(overlay);
    
    // Animación de salida
    tl.to(overlay, {
      left: '0%',
      duration: 0.8,
      ease: 'power2.inOut'
    })
    .to(document.body, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.4');
  }

  // ================================
  // ANIMACIONES DE CARGA
  // ================================

  initLoadingAnimations() {
    const loadingScreen = document.getElementById('loading-screen');
    
    if (loadingScreen) {
      this.createLoadingAnimation(loadingScreen);
    }
  }

  createLoadingAnimation(loadingScreen) {
    const spinner = loadingScreen.querySelector('.loading-spinner');
    const logo = loadingScreen.querySelector('.loading-logo');
    const subtitle = loadingScreen.querySelector('.loading-subtitle');
    
    // Animación del spinner
    if (spinner) {
      gsap.to(spinner, {
        rotation: 360,
        duration: 1,
        ease: 'linear',
        repeat: -1
      });
    }
    
    // Animación del logo
    if (logo) {
      gsap.fromTo(logo,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, ease: 'elastic.out(1, 0.3)' }
      );
    }
    
    // Animación del subtítulo
    if (subtitle) {
      gsap.fromTo(subtitle,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, ease: 'power2.out' }
      );
    }
  }

  // ================================
  // UTILIDADES DE ANIMACIÓN
  // ================================

  animateCards(cards) {
    cards.forEach((card, index) => {
      gsap.set(card, {
        opacity: 0,
        y: 50,
        scale: 0.8,
        rotation: Math.random() * 10 - 5
      });
      
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(card, {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            delay: index * 0.1,
            ease: 'back.out(1.7)'
          });
        },
        once: true
      });
    });
  }

  animateImages(images) {
    images.forEach(img => {
      gsap.set(img, { opacity: 0, scale: 0.8, filter: 'blur(10px)' });
      
      ScrollTrigger.create({
        trigger: img,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(img, {
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: 'power2.out'
          });
        },
        once: true
      });
    });
  }

  // ================================
  // MÉTODOS PÚBLICOS
  // ================================

  playMasterTimeline() {
    if (this.masterTL) {
      this.masterTL.play();
    }
  }

  pauseMasterTimeline() {
    if (this.masterTL) {
      this.masterTL.pause();
    }
  }

  restartMasterTimeline() {
    if (this.masterTL) {
      this.masterTL.restart();
    }
  }

  createCustomAnimation(element, fromProps, toProps, options = {}) {
    const duration = options.duration || this.config.duration;
    const ease = options.ease || this.config.ease;
    const delay = options.delay || 0;
    
    gsap.set(element, fromProps);
    
    return gsap.to(element, {
      ...toProps,
      duration,
      ease,
      delay,
      ...options
    });
  }

  // ================================
  // GESTIÓN DE EVENTOS
  // ================================

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            this.dispatchEvent('gsap:elementInView', { element: entry.target });
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });
      
      // Observar todos los elementos animables
      document.querySelectorAll('[data-animate], .animate-on-scroll').forEach(el => {
        observer.observe(el);
      });
      
      this.observers.set('intersection', observer);
    }
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // ================================
  // CONTROL DE RENDIMIENTO
  // ================================

  pause() {
    // Pausar animaciones costosas
    if (this.masterTL) {
      this.masterTL.pause();
    }
    
    gsap.globalTimeline.pause();
  }

  resume() {
    // Reanudar animaciones
    if (this.masterTL) {
      this.masterTL.resume();
    }
    
    gsap.globalTimeline.resume();
  }

  destroy() {
    // Limpiar observadores
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    
    // Limpiar timelines
    this.timelines.forEach(timeline => {
      timeline.kill();
    });
    
    // Limpiar GSAP
    gsap.killTweensOf('*');
    
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.killAll();
    }
  }
}

// Export para uso en app.js
if (typeof window !== 'undefined') {
  window.GSAPAnimationSystem = GSAPAnimationSystem;
} 