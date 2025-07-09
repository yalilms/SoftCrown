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