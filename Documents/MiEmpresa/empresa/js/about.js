/**
 * about.js
 * JavaScript específico para la página "Sobre Nosotros"
 * Incluye todas las funcionalidades interactivas y animaciones
 */

// ================================
// INITIALIZATION
// ================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all about page features
    initializeAboutPage();
});

function initializeAboutPage() {
    // Initialize AOS (Animate On Scroll)
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false,
            offset: 100
        });
    }
    
    // Initialize all features
    initializeCounterAnimations();
    initializeSkillBars();
    initializeTimelineProgress();
    initializeBudgetCalculator();
    initializeHeroAnimations();
    initializeParticles();
    initializeScrollEffects();
    initializeTeamInteractions();
    initializePaymentCards();
    
    console.log('About page initialized successfully');
}

// ================================
// COUNTER ANIMATIONS
// ================================

function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        element.textContent = Math.floor(current) + (element.textContent.includes('%') ? '%' : '');
    }, 16);
}

// ================================
// SKILL BARS ANIMATION
// ================================

function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress[data-width]');
    
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.getAttribute('data-width');
                
                setTimeout(() => {
                    bar.style.width = width;
                }, 200);
                
                observer.unobserve(bar);
            }
        });
    }, observerOptions);
    
    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

// ================================
// TIMELINE PROGRESS
// ================================

function initializeTimelineProgress() {
    const progressLine = document.querySelector('.timeline-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (!progressLine || !timelineItems.length) return;
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    let visibleItems = 0;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                visibleItems++;
                const progress = (visibleItems / timelineItems.length) * 100;
                progressLine.style.height = `${progress}%`;
            }
        });
    }, observerOptions);
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
}

// ================================
// BUDGET CALCULATOR
// ================================

function initializeBudgetCalculator() {
    const projectType = document.getElementById('project-type');
    const complexity = document.getElementById('complexity');
    const extraCheckboxes = document.querySelectorAll('.extra-item input[type="checkbox"]');
    const priceDisplay = document.getElementById('estimated-price');
    
    if (!projectType || !complexity || !priceDisplay) return;
    
    const projectPrices = {
        landing: { min: 800, max: 1500 },
        corporate: { min: 1500, max: 3000 },
        ecommerce: { min: 3000, max: 6000 },
        webapp: { min: 5000, max: 15000 },
        mobile: { min: 8000, max: 20000 }
    };
    
    const complexityMultipliers = {
        basic: 1,
        intermediate: 1.3,
        advanced: 1.6
    };
    
    function calculateBudget() {
        const selectedProject = projectType.value;
        const selectedComplexity = complexity.value;
        const basePrice = projectPrices[selectedProject];
        const multiplier = complexityMultipliers[selectedComplexity];
        
        // Calculate base price with complexity
        let minPrice = Math.round(basePrice.min * multiplier);
        let maxPrice = Math.round(basePrice.max * multiplier);
        
        // Add extras
        let extrasTotal = 0;
        extraCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                extrasTotal += parseInt(checkbox.value);
            }
        });
        
        minPrice += extrasTotal;
        maxPrice += extrasTotal;
        
        // Update display
        priceDisplay.textContent = `€${minPrice.toLocaleString()}`;
        priceDisplay.nextElementSibling.textContent = `- €${maxPrice.toLocaleString()}`;
        
        // Add animation
        priceDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            priceDisplay.style.transform = 'scale(1)';
        }, 200);
    }
    
    // Event listeners
    projectType.addEventListener('change', calculateBudget);
    complexity.addEventListener('change', calculateBudget);
    extraCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateBudget);
    });
    
    // Initial calculation
    calculateBudget();
}

// ================================
// HERO ANIMATIONS
// ================================

function initializeHeroAnimations() {
    // Title animation
    const titleLines = document.querySelectorAll('.hero-title .title-line');
    titleLines.forEach((line, index) => {
        line.style.animationDelay = `${index * 0.3}s`;
    });
    
    // Stats animation
    const stats = document.querySelectorAll('.stat-item');
    stats.forEach((stat, index) => {
        stat.style.animationDelay = `${index * 0.2}s`;
    });
    
    // Team showcase orbit animation
    const teamMembers = document.querySelectorAll('.team-member');
    teamMembers.forEach((member, index) => {
        member.style.animationDelay = `${index * 2}s`;
    });
}

// ================================
// PARTICLES SYSTEM
// ================================

function initializeParticles() {
    const particlesContainer = document.getElementById('particles-js');
    
    if (particlesContainer && typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#ffffff'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: false,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ffffff',
                    opacity: 0.4,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 6,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'repulse'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 400,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 400,
                        size: 40,
                        duration: 2,
                        opacity: 8,
                        speed: 3
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                }
            },
            retina_detect: true
        });
    }
}

// ================================
// SCROLL EFFECTS
// ================================

function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        // Parallax effect for hero shapes
        const heroShapes = document.querySelectorAll('.hero-shapes .shape');
        heroShapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// ================================
// TEAM INTERACTIONS
// ================================

function initializeTeamInteractions() {
    const teamCards = document.querySelectorAll('.team-card');
    
    teamCards.forEach(card => {
        const photo = card.querySelector('.team-photo');
        const overlay = card.querySelector('.photo-overlay');
        
        if (photo && overlay) {
            photo.addEventListener('mouseenter', () => {
                overlay.style.opacity = '1';
            });
            
            photo.addEventListener('mouseleave', () => {
                overlay.style.opacity = '0';
            });
        }
    });
}

// ================================
// PAYMENT CARDS
// ================================

function initializePaymentCards() {
    const paymentCards = document.querySelectorAll('.payment-card');
    
    paymentCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// ================================
// UTILITY FUNCTIONS
// ================================

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Request quote function
function requestQuote() {
    // Get calculator values
    const projectType = document.getElementById('project-type')?.value;
    const complexity = document.getElementById('complexity')?.value;
    const selectedExtras = Array.from(document.querySelectorAll('.extra-item input[type="checkbox"]:checked'))
        .map(cb => cb.nextElementSibling.textContent);
    
    // Create quote request data
    const quoteData = {
        projectType: projectType,
        complexity: complexity,
        extras: selectedExtras,
        timestamp: new Date().toISOString()
    };
    
    // Show notification
    showNotification('¡Presupuesto enviado! Te contactaremos pronto.', 'success');
    
    // In a real application, this would send data to server
    console.log('Quote request:', quoteData);
    
    // Optional: redirect to contact page
    setTimeout(() => {
        window.location.href = 'contacto.html';
    }, 2000);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <div class="notification__content">
            <span class="notification__message">${message}</span>
            <button class="notification__close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// ================================
// ANIMATIONS & EFFECTS
// ================================

// Text splitting animation
function splitTextAnimation(element) {
    const text = element.textContent;
    const letters = text.split('');
    element.innerHTML = '';
    
    letters.forEach((letter, index) => {
        const span = document.createElement('span');
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        span.style.animationDelay = `${index * 0.05}s`;
        span.classList.add('letter-animate');
        element.appendChild(span);
    });
}

// Morphing effects
function initializeMorphingEffects() {
    const morphElements = document.querySelectorAll('[data-morph]');
    
    morphElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.borderRadius = '50%';
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.borderRadius = '';
        });
    });
}

// 3D card effects
function initialize3DEffects() {
    const cards3D = document.querySelectorAll('.card-3d, .payment-card, .guarantee-card');
    
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        });
    });
}

// ================================
// RESPONSIVE HANDLERS
// ================================

// Handle mobile navigation
function handleMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (hamburger && navOverlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navOverlay.classList.toggle('active');
        });
    }
}

// Handle responsive animations
function handleResponsiveAnimations() {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
        // Disable heavy animations on mobile
        document.body.classList.add('mobile-optimized');
    } else {
        document.body.classList.remove('mobile-optimized');
    }
}

// ================================
// ERROR HANDLING
// ================================

// Global error handler
window.addEventListener('error', (event) => {
    console.error('About page error:', event.error);
    // Don't show errors to users in production
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        showNotification('Error en la página. Revisa la consola.', 'error');
    }
});

// ================================
// PERFORMANCE OPTIMIZATIONS
// ================================

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Debounce utility
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

// Throttle utility
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
    };
}

// ================================
// INITIALIZATION COMPLETE
// ================================

// Run additional initializations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    handleMobileNavigation();
    initialize3DEffects();
    initializeMorphingEffects();
    initializeLazyLoading();
});

// Handle window resize
window.addEventListener('resize', debounce(() => {
    handleResponsiveAnimations();
    
    // Reinitialize particles if needed
    if (window.innerWidth < 768) {
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.innerHTML = '';
        }
    } else {
        initializeParticles();
    }
}, 250));

// Export functions for global use
window.aboutPage = {
    scrollToSection,
    requestQuote,
    showNotification
}; 