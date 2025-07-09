// Extraer solo la primera parte del archivo existente y agregar las nuevas funcionalidades
//
// SoftCronw Futuristic Navigation JavaScript
// Sistema de navegación extravagante con efectos 3D y animaciones avanzadas
//

document.addEventListener('DOMContentLoaded', function() {
    // Initialize futuristic navigation
    initFuturisticNavigation();
    initCustomCursor();
    initRippleEffects();
    initStickyHeader();
    initPageIndicators();
    
    console.log('🚀 SoftCronw Futuristic Navigation Initialized');
});

// =====================================
// CHATBOT DEBUG VERIFICATION
// =====================================

// Verificar el estado del chatbot después de la carga
setTimeout(() => {
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotContainer = document.getElementById('softcronw-chatbot');
    
    if (chatbotToggle && chatbotContainer) {
        console.log('✅ Elementos del chatbot encontrados');
        if (window.chatbot) {
            console.log('✅ Chatbot inicializado correctamente');
        } else {
            console.log('⚠️ Chatbot no inicializado, intentando inicialización manual...');
            if (window.initializeChatbot) {
                window.initializeChatbot();
            }
        }
    } else {
        console.error('❌ Elementos del chatbot no encontrados');
        console.log('Toggle button:', chatbotToggle);
        console.log('Container:', chatbotContainer);
    }
}, 3000);

// ================================
// NAVEGACIÓN FUTURISTA PRINCIPAL
// ================================

function initFuturisticNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-menu__link');
    const body = document.body;
    
    if (!hamburger || !navOverlay) {
        console.warn('Navigation elements not found');
        return;
    }
    
    let isOpen = false;
    
    // Toggle menú con efectos
    hamburger.addEventListener('click', function(e) {
        e.preventDefault();
        toggleNavigation();
    });
    
    // Cerrar menú al hacer clic en overlay
    navOverlay.addEventListener('click', function(e) {
        if (e.target === navOverlay) {
            closeNavigation();
        }
    });
    
    // Cerrar menú con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            closeNavigation();
        }
    });
    
    // Links del menú con efectos
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Agregar efecto ripple
            createRipple(e, this);
            
            // Pequeño delay para mostrar efecto antes de navegar
            setTimeout(() => {
                closeNavigation();
            }, 300);
        });
        
        // Efectos de hover
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotateX(5deg) rotateY(2deg)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    function toggleNavigation() {
        isOpen = !isOpen;
        
        if (isOpen) {
            openNavigation();
        } else {
            closeNavigation();
        }
    }
    
    function openNavigation() {
        hamburger.classList.add('hamburger--active');
        navOverlay.classList.add('nav-overlay--active');
        body.classList.add('nav-open');
        
        // Prevenir scroll del body
        body.style.overflow = 'hidden';
        
        // Animar entrada de elementos del menú
        animateMenuItems(true);
        
        // Trigger particle effects
        triggerParticleAnimation();
        
        isOpen = true;
    }
    
    function closeNavigation() {
        hamburger.classList.remove('hamburger--active');
        navOverlay.classList.remove('nav-overlay--active');
        body.classList.remove('nav-open');
        
        // Restaurar scroll del body
        body.style.overflow = '';
        
        // Animar salida de elementos del menú
        animateMenuItems(false);
        
        isOpen = false;
    }
    
    function animateMenuItems(show) {
        const menuItems = document.querySelectorAll('.nav-menu__item');
        
        menuItems.forEach((item, index) => {
            setTimeout(() => {
                if (show) {
                    item.style.transform = 'translateY(0)';
                    item.style.opacity = '1';
                } else {
                    item.style.transform = 'translateY(50px)';
                    item.style.opacity = '0';
                }
            }, index * 100);
        });
    }
    
    function triggerParticleAnimation() {
        const overlay = document.querySelector('.nav-overlay');
        if (overlay) {
            overlay.style.animation = 'none';
            setTimeout(() => {
                overlay.style.animation = '';
            }, 10);
        }
    }
}

// ================================
// CURSOR PERSONALIZADO
// ================================

function initCustomCursor() {
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (!navOverlay) return;
    
    // Crear cursor personalizado
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    navOverlay.appendChild(cursor);
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Seguir mouse
    navOverlay.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Efecto smooth follow
    function updateCursor() {
        const speed = 0.2;
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        requestAnimationFrame(updateCursor);
    }
    
    updateCursor();
    
    // Efectos en hover
    const navLinks = document.querySelectorAll('.nav-menu__link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            cursor.classList.add('custom-cursor--hover');
        });
        
        link.addEventListener('mouseleave', function() {
            cursor.classList.remove('custom-cursor--hover');
        });
    });
}

// ================================
// EFECTOS RIPPLE
// ================================

function initRippleEffects() {
    const rippleElements = document.querySelectorAll('.nav-menu__link, .hamburger');
    
    rippleElements.forEach(element => {
        element.addEventListener('click', function(e) {
            createRipple(e, this);
        });
    });
}

function createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.className = 'ripple-effect';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // Remover después de la animación
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// ================================
// HEADER STICKY CON EFECTOS
// ================================

function initStickyHeader() {
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    if (!header) return;
    
    function updateHeader() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        
        // Efecto de ocultación en scroll hacia abajo
        if (scrollY > lastScrollY && scrollY > 200) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// ================================
// INDICADORES DE PÁGINA ACTIVA
// ================================

function initPageIndicators() {
    const currentPage = getCurrentPage();
    const navLinks = document.querySelectorAll('.nav-menu__link');
    const dots = document.querySelectorAll('.nav-indicator__dot');
    
    // Marcar página activa en navegación
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && isCurrentPage(href, currentPage)) {
            link.classList.add('nav-menu__link--active');
        }
    });
    
    // Marcar dot activo
    dots.forEach((dot, index) => {
        const pages = ['index.html', 'servicios.html', 'sobre-nosotros.html', 'portfolio.html', 'contacto.html'];
        if (isCurrentPage(pages[index], currentPage)) {
            dot.classList.add('nav-indicator__dot--active');
        }
        
        // Click en dots para navegación rápida
        dot.addEventListener('click', function() {
            if (pages[index]) {
                window.location.href = pages[index];
            }
        });
    });
}

function getCurrentPage() {
    const path = window.location.pathname;
    return path.split('/').pop() || 'index.html';
}

function isCurrentPage(href, currentPage) {
    const linkPage = href.split('/').pop();
    return linkPage === currentPage || 
           (linkPage === 'index.html' && currentPage === '') ||
           (linkPage === '' && currentPage === 'index.html');
}

// ================================
// EFECTOS AVANZADOS ADICIONALES
// ================================

// Efecto parallax en partículas del menú
function initParallaxEffects() {
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (!navOverlay) return;
    
    navOverlay.addEventListener('mousemove', function(e) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;
        
        const particles = navOverlay.querySelector('::before');
        if (particles) {
            navOverlay.style.setProperty('--mouse-x', mouseX);
            navOverlay.style.setProperty('--mouse-y', mouseY);
        }
    });
}

// Animaciones de entrada para iconos
function animateIcons() {
    const icons = document.querySelectorAll('.nav-menu__icon');
    
    icons.forEach((icon, index) => {
        icon.style.animationDelay = `${index * 0.1}s`;
        icon.classList.add('animate-icon-entrance');
    });
}

// Efectos de sonido (opcional)
function initSoundEffects() {
    // Crear contexto de audio para efectos de sonido sutiles
    if ('AudioContext' in window || 'webkitAudioContext' in window) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        function playTone(frequency, duration) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        }
        
        // Sonido al abrir menú
        document.querySelector('.hamburger')?.addEventListener('click', function() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            playTone(800, 0.1);
        });
        
        // Sonido al hover en links
        document.querySelectorAll('.nav-menu__link').forEach(link => {
            link.addEventListener('mouseenter', function() {
                playTone(1000, 0.05);
            });
        });
    }
}

// Inicializar efectos adicionales
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initParallaxEffects();
        animateIcons();
        // initSoundEffects(); // Descomentar si quieres efectos de sonido
    }, 500);
});

// ================================
// UTILIDADES Y HELPERS
// ================================

// Throttle function para optimización
function throttle(func, wait) {
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

// Detectar capacidades del dispositivo
function detectCapabilities() {
    const capabilities = {
        touch: 'ontouchstart' in window,
        motion: 'DeviceMotionEvent' in window,
        orientation: 'DeviceOrientationEvent' in window,
        webgl: !!window.WebGLRenderingContext,
        animations: !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };
    
    // Agregar clases al body basadas en capacidades
    Object.keys(capabilities).forEach(capability => {
        if (capabilities[capability]) {
            document.body.classList.add(`supports-${capability}`);
        }
    });
    
    return capabilities;
}

// Optimización para dispositivos de bajo rendimiento
function optimizeForDevice() {
    const capabilities = detectCapabilities();
    
    if (!capabilities.animations) {
        document.body.classList.add('reduced-motion');
    }
    
    if (capabilities.touch) {
        document.body.classList.add('touch-device');
    }
}

// Inicializar optimizaciones
optimizeForDevice();

// ================================
// ANALYTICS Y TRACKING (OPCIONAL)
// ================================

function trackNavigation(action, page) {
    // Implementar tracking de navegación
    console.log(`Navigation Action: ${action} - Page: ${page}`);
    
    // Ejemplo para Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'navigation', {
            'action': action,
            'page': page
        });
    }
}

// Export para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initFuturisticNavigation,
        createRipple,
        trackNavigation
    };
} 

// ================================
// FOOTER SPECTACULAR FUNCTIONALITY
// ================================

class FooterSpectacular {
    constructor() {
        this.init();
    }

    init() {
        this.initBackToTop();
        this.initNewsletterForm();
        this.initScrollEffects();
        this.initStatsAnimation();
        this.initSocialHovers();
    }

    // Back to Top functionality (stable version)
    initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        
        if (backToTopBtn) {
            // Set initial state to prevent layout shifts
            backToTopBtn.style.opacity = '0';
            backToTopBtn.style.visibility = 'hidden';
            backToTopBtn.style.transform = 'translateZ(0)';
            backToTopBtn.style.transition = 'opacity 0.3s ease, visibility 0.3s ease, transform 0.15s ease';
            backToTopBtn.style.willChange = 'opacity, visibility, transform';

            let ticking = false;

            // Throttled scroll handler for better performance
            const handleScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        if (window.pageYOffset > 300) {
                            backToTopBtn.style.opacity = '1';
                            backToTopBtn.style.visibility = 'visible';
                        } else {
                            backToTopBtn.style.opacity = '0';
                            backToTopBtn.style.visibility = 'hidden';
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            };

            window.addEventListener('scroll', handleScroll, { passive: true });

            // Smooth scroll to top without layout disruption
            backToTopBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Add click animation using transform only
                backToTopBtn.style.transform = 'translateZ(0) scale(0.95)';
                
                setTimeout(() => {
                    backToTopBtn.style.transform = 'translateZ(0) scale(1)';
                }, 150);

                // Enhanced smooth scroll
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // Newsletter form functionality
    initNewsletterForm() {
        const newsletterForm = document.querySelector('.newsletter-form');
        
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const input = newsletterForm.querySelector('.newsletter-input');
                const button = newsletterForm.querySelector('.newsletter-btn');
                const email = input.value.trim();

                // Basic email validation
                if (!this.isValidEmail(email)) {
                    this.showNotification('Por favor, introduce un email válido', 'error');
                    this.shakeElement(input);
                    return;
                }

                // Show loading state
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                button.disabled = true;

                // Simulate API call
                setTimeout(() => {
                    // Success state
                    button.innerHTML = '<i class="fas fa-check"></i>';
                    input.value = '';
                    this.showNotification('¡Suscripción exitosa! Gracias por unirte.', 'success');
                    
                    // Reset button after 2 seconds
                    setTimeout(() => {
                        button.innerHTML = '<i class="fas fa-paper-plane"></i>';
                        button.disabled = false;
                    }, 2000);
                }, 1500);
            });
        }
    }

    // Scroll effects for footer sections (stable version)
    initScrollEffects() {
        const footerSections = document.querySelectorAll('.footer-spectacular section');
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    
                    // Trigger stable animations without layout shifts
                    const animatedElements = entry.target.querySelectorAll('.stat-item, .tech-item, .social-link');
                    animatedElements.forEach((el, index) => {
                        // Use requestAnimationFrame for smooth animations
                        requestAnimationFrame(() => {
                            setTimeout(() => {
                                el.style.transform = 'translateZ(0) translateY(0) scale(1)';
                                el.style.opacity = '1';
                            }, index * 50); // Reduced delay for faster animation
                        });
                    });
                }
            });
        }, observerOptions);

        // Apply initial states with stable positioning
        footerSections.forEach(section => {
            observer.observe(section);
            
            // Initial state for animated elements with contained layout
            const animatedElements = section.querySelectorAll('.stat-item, .tech-item, .social-link');
            animatedElements.forEach(el => {
                // Use transform3d for GPU acceleration and prevent layout shifts
                el.style.transform = 'translateZ(0) translateY(20px) scale(0.95)';
                el.style.opacity = '0';
                el.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease';
                el.style.willChange = 'transform, opacity';
                el.style.backfaceVisibility = 'hidden';
                el.style.perspective = '1000px';
            });
        });
    }

    // Animated counters for stats
    initStatsAnimation() {
        const statNumbers = document.querySelectorAll('.stat-number');
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        statNumbers.forEach(stat => {
            observer.observe(stat);
        });
    }

    // Social links hover effects
    initSocialHovers() {
        const socialLinks = document.querySelectorAll('.social-link');
        
        socialLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                // Create ripple effect
                const ripple = document.createElement('div');
                ripple.className = 'social-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: socialRipple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                link.appendChild(ripple);
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                }, 600);
            });
        });

        // Add CSS for ripple animation
        if (!document.querySelector('#social-ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'social-ripple-styles';
            style.textContent = `
                @keyframes socialRipple {
                    to {
                        width: 100px;
                        height: 100px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Helper methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    shakeElement(element) {
        element.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);

        // Add shake animation CSS if not exists
        if (!document.querySelector('#shake-animation')) {
            const style = document.createElement('style');
            style.id = 'shake-animation';
            style.textContent = `
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.footer-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = `footer-notification footer-notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${type === 'success' ? 
                'linear-gradient(135deg, rgba(16, 185, 129, 0.95) 0%, rgba(5, 150, 105, 0.95) 100%)' : 
                'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)'};
            backdrop-filter: blur(10px);
            border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
            border-radius: 12px;
            padding: 16px 20px;
            color: white;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            transform: translateX(400px);
            transition: all 0.3s ease;
            max-width: 400px;
        `;

        // Add content styles
        const content = notification.querySelector('.notification-content');
        content.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1rem;
            padding: 0;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    animateCounter(element) {
        const target = element.textContent;
        const numericValue = parseInt(target.replace(/\D/g, ''));
        const suffix = target.replace(/[\d]/g, '');
        
        if (isNaN(numericValue)) return;

        let current = 0;
        const increment = numericValue / 60; // 60 frames for smooth animation
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current) + suffix;
        }, 1000 / 60); // 60 FPS
    }
}

// ================================
// INITIALIZE FOOTER FUNCTIONALITY
// ================================

// Initialize footer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize footer functionality
    if (document.querySelector('.footer-spectacular')) {
        new FooterSpectacular();
    }
}); 