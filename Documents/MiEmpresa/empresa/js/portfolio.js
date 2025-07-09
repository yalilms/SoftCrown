/**
 * Portfolio JavaScript - SoftCronw
 * Advanced interactive functionality for portfolio page
 */

// Global variables
let currentProject = null;
let projectsData = {};
let isotope = null;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializePortfolio();
    initializeParticles();
    initializeCounters();
    initializeScrollEffects();
    initializeModal();
    initializeIsotope();
    initializeShareButtons();
    initializeNavigation();
});

// ================================
// PORTFOLIO INITIALIZATION
// ================================
function initializePortfolio() {
    // Initialize AOS (Animate On Scroll)
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
    
    // Remove loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 1000);
    
    // Initialize projects data
    setupProjectsData();
    
    // Show portfolio items with stagger effect
    setTimeout(() => {
        const items = document.querySelectorAll('.portfolio-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('show');
            }, index * 100);
        });
    }, 500);
}

// ================================
// PARTICLES BACKGROUND
// ================================
function initializeParticles() {
    if (typeof particlesJS !== 'undefined') {
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
                    value: 0.1,
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
                    opacity: 0.1,
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
// COUNTER ANIMATIONS
// ================================
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => {
        counterObserver.observe(counter);
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
        
        element.textContent = Math.floor(current);
    }, 16);
}

// ================================
// ISOTOPE FILTERING
// ================================
function initializeIsotope() {
    const grid = document.querySelector('.portfolio-masonry');
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (!grid) return;
    
    // Initialize isotope
    isotope = new Isotope(grid, {
        itemSelector: '.portfolio-item',
        layoutMode: 'masonry',
        masonry: {
            columnWidth: '.portfolio-item',
            gutter: 24
        },
        transitionDuration: '0.6s'
    });
    
    // Filter button events
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter isotope
            isotope.arrange({ filter: filter });
            
            // Animate filtered items
            setTimeout(() => {
                const visibleItems = grid.querySelectorAll('.portfolio-item:not(.isotope-hidden)');
                visibleItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.style.transform = 'translateY(0)';
                        item.style.opacity = '1';
                    }, index * 100);
                });
            }, 100);
        });
    });
}

// ================================
// SCROLL EFFECTS
// ================================
function initializeScrollEffects() {
    // Parallax effect for hero section
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.portfolio-hero');
        
        if (hero) {
            const heroHeight = hero.offsetHeight;
            const heroParallax = scrolled * 0.5;
            
            if (scrolled < heroHeight) {
                hero.style.transform = `translateY(${heroParallax}px)`;
            }
        }
        
        // Navbar background on scroll
        const header = document.querySelector('.header');
        if (header) {
            if (scrolled > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Smooth scroll for CTA buttons
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ================================
// MODAL FUNCTIONALITY
// ================================
function initializeModal() {
    const modal = document.getElementById('projectModal');
    const modalClose = document.getElementById('modalClose');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    const viewButtons = document.querySelectorAll('.btn-view');
    
    // Open modal
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            openModal(projectId);
        });
    });
    
    // Close modal
    modalClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);
    
    // ESC key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Modal navigation
    document.getElementById('navProjectPrev').addEventListener('click', () => {
        navigateProject('prev');
    });
    
    document.getElementById('navProjectNext').addEventListener('click', () => {
        navigateProject('next');
    });
    
    // Gallery navigation
    document.getElementById('galleryPrev').addEventListener('click', () => {
        navigateGallery('prev');
    });
    
    document.getElementById('galleryNext').addEventListener('click', () => {
        navigateGallery('next');
    });
}

function openModal(projectId) {
    const modal = document.getElementById('projectModal');
    const project = projectsData[projectId];
    
    if (!project) return;
    
    currentProject = projectId;
    
    // Update modal content
    document.getElementById('modalTitle').textContent = project.title;
    document.getElementById('modalDescription').textContent = project.description;
    document.getElementById('modalLiveLink').href = project.liveLink;
    
    // Update main image
    document.getElementById('modalMainImage').src = project.gallery[0];
    
    // Update tech stack
    const techStack = document.getElementById('modalTechStack');
    techStack.innerHTML = project.technologies.map(tech => 
        `<span class="tech-tag">${tech}</span>`
    ).join('');
    
    // Update features
    const features = document.getElementById('modalFeatures');
    features.innerHTML = project.features.map(feature => 
        `<li>${feature}</li>`
    ).join('');
    
    // Update testimonial
    const testimonial = document.getElementById('modalTestimonial');
    testimonial.innerHTML = `
        <div class="testimonial-text">"${project.testimonial.text}"</div>
        <div class="testimonial-author">- ${project.testimonial.author}</div>
    `;
    
    // Update gallery thumbnails
    updateGalleryThumbnails(project.gallery);
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentProject = null;
}

function navigateProject(direction) {
    const projects = Object.keys(projectsData);
    const currentIndex = projects.indexOf(currentProject);
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : projects.length - 1;
    } else {
        newIndex = currentIndex < projects.length - 1 ? currentIndex + 1 : 0;
    }
    
    openModal(projects[newIndex]);
}

function navigateGallery(direction) {
    const project = projectsData[currentProject];
    const mainImage = document.getElementById('modalMainImage');
    const currentSrc = mainImage.src;
    const currentIndex = project.gallery.indexOf(currentSrc);
    let newIndex;
    
    if (direction === 'prev') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : project.gallery.length - 1;
    } else {
        newIndex = currentIndex < project.gallery.length - 1 ? currentIndex + 1 : 0;
    }
    
    mainImage.src = project.gallery[newIndex];
    updateActiveThumbnail(newIndex);
}

function updateGalleryThumbnails(gallery) {
    const thumbnails = document.getElementById('galleryThumbnails');
    thumbnails.innerHTML = gallery.map((img, index) => 
        `<img src="${img}" alt="Gallery ${index + 1}" class="${index === 0 ? 'active' : ''}" onclick="selectGalleryImage(${index})">`
    ).join('');
}

function selectGalleryImage(index) {
    const project = projectsData[currentProject];
    const mainImage = document.getElementById('modalMainImage');
    mainImage.src = project.gallery[index];
    updateActiveThumbnail(index);
}

function updateActiveThumbnail(index) {
    const thumbnails = document.querySelectorAll('.gallery-thumbnails img');
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

// ================================
// SHARE BUTTONS
// ================================
function initializeShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            const url = window.location.href;
            const title = document.title;
            
            shareOnPlatform(platform, url, title);
        });
    });
}

function shareOnPlatform(platform, url, title) {
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

// ================================
// NAVIGATION
// ================================
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (hamburger && navOverlay) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });
        
        // Close navigation when clicking on a link
        const navLinks = document.querySelectorAll('.nav-menu__link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navOverlay.classList.remove('active');
                document.body.classList.remove('nav-open');
            });
        });
    }
}

// ================================
// PROJECTS DATA
// ================================
function setupProjectsData() {
    projectsData = {
        ecomarket: {
            title: 'EcoMarket',
            description: 'Plataforma de e-commerce revolucionaria para productos ecológicos que implementa un sistema único de puntos de sostenibilidad, permitiendo a los usuarios ganar recompensas por compras responsables. Incluye marketplace integrado, seguimiento de impacto ambiental y certificaciones de sostenibilidad.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS', 'Socket.io'],
            features: [
                'Sistema de puntos de sostenibilidad',
                'Marketplace integrado para vendedores',
                'Seguimiento de impacto ambiental',
                'Certificaciones de productos ecológicos',
                'Pasarela de pagos segura con Stripe',
                'Notificaciones en tiempo real',
                'Dashboard de analytics avanzado',
                'Sistema de reseñas y calificaciones'
            ],
            gallery: [
                'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1556741533-6e6a62bd8b49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            ],
            testimonial: {
                text: 'SoftCronw transformó nuestra visión de un marketplace ecológico en una plataforma excepcional. Las ventas aumentaron un 400% en los primeros 6 meses.',
                author: 'María González, CEO de EcoMarket'
            },
            liveLink: 'https://ecomarket-demo.com'
        },
        
        financehub: {
            title: 'FinanceHub',
            description: 'Plataforma integral de gestión financiera corporativa que revoluciona la forma en que las empresas manejan sus finanzas. Incluye análisis en tiempo real, reporting avanzado, API robusta para integraciones y dashboard interactivo con visualizaciones de datos sofisticadas.',
            technologies: ['Vue.js', 'Laravel', 'PostgreSQL', 'Docker', 'Redis', 'Chart.js'],
            features: [
                'Dashboard financiero en tiempo real',
                'Reportes automáticos personalizables',
                'API REST robusta para integraciones',
                'Sistema de alertas inteligentes',
                'Análisis predictivo con IA',
                'Gestión de presupuestos y forecasting',
                'Cumplimiento normativo automatizado',
                'Integración con sistemas ERP'
            ],
            gallery: [
                'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1460472178825-e5240623afd5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            ],
            testimonial: {
                text: 'FinanceHub ha transformado completamente nuestra gestión financiera. Ahora tenemos visibilidad total de nuestros números y podemos tomar decisiones informadas.',
                author: 'Carlos Rodríguez, CFO de TechCorp'
            },
            liveLink: 'https://financehub-demo.com'
        },
        
        artistrylab: {
            title: 'ArtistryLab',
            description: 'Portfolio interactivo de última generación para estudio creativo que combina arte y tecnología. Incluye animaciones 3D impresionantes, galería inmersiva con WebGL, sistema de gestión de proyectos integrado y experiencia de usuario completamente personalizada.',
            technologies: ['Three.js', 'GSAP', 'WebGL', 'Nuxt.js', 'Blender', 'Framer Motion'],
            features: [
                'Animaciones 3D con Three.js',
                'Galería inmersiva con WebGL',
                'Sistema de gestión de proyectos',
                'Experiencia de usuario personalizada',
                'Efectos de parallax avanzados',
                'Renderizado en tiempo real',
                'Portfolio responsivo y accesible',
                'Integración con CMS headless'
            ],
            gallery: [
                'https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            ],
            testimonial: {
                text: 'ArtistryLab no es solo un portfolio, es una experiencia. Nuestros clientes quedan fascinados por la presentación de nuestros proyectos.',
                author: 'Elena Martínez, Directora Creativa de ArtistryLab'
            },
            liveLink: 'https://artistrylab-demo.com'
        },
        
        medconnect: {
            title: 'MedConnect',
            description: 'Plataforma de telemedicina de próxima generación que conecta pacientes y profesionales de la salud. Incluye citas online seguras, historial médico digital cifrado, sistema de prescripciones electrónicas y videoconferencias con tecnología WebRTC.',
            technologies: ['React Native', 'Firebase', 'Socket.io', 'WebRTC', 'Node.js', 'MongoDB'],
            features: [
                'Citas médicas online seguras',
                'Historial médico digital cifrado',
                'Prescripciones electrónicas',
                'Videoconferencias con WebRTC',
                'Sistema de notificaciones push',
                'Integración con wearables',
                'Dashboard médico completo',
                'Cumplimiento HIPAA y GDPR'
            ],
            gallery: [
                'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
                'https://images.unsplash.com/photo-1585435557343-3b092031b8b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
            ],
            testimonial: {
                text: 'MedConnect ha revolucionado nuestra práctica médica. Ahora podemos atender a más pacientes con la misma calidad de atención.',
                author: 'Dr. Fernando López, Director Médico'
            },
            liveLink: 'https://medconnect-demo.com'
        }
    };
}

// Expose functions to global scope for HTML onclick handlers
window.selectGalleryImage = selectGalleryImage; 