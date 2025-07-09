/**
 * LIBRERÍAS EXTERNAS UNIFICADAS - SoftCronw
 * Archivo central para cargar todas las librerías externas de forma consistente
 * Versión: 1.0.0
 */

// Definir versiones únicas y consistentes
const LIBRARY_VERSIONS = {
    bootstrap: '5.3.2',
    aos: '2.3.4',
    particles: '2.0.0',
    gsap: '3.12.2',
    threejs: 'r128',
    vanillaTilt: '1.8.0',
    typedjs: '2.0.12',
    lottie: '5.12.2',
    lightbox: '2.11.3',
    isotope: '3.0.6',
    intlTelInput: '18.2.1',
    emailjs: 'latest'
};

// URLs de CDN optimizadas
const CDN_URLS = {
    // Bootstrap
    bootstrap: `https://cdn.jsdelivr.net/npm/bootstrap@${LIBRARY_VERSIONS.bootstrap}/dist/js/bootstrap.bundle.min.js`,
    
    // AOS (Animate On Scroll)
    aos: `https://cdn.jsdelivr.net/npm/aos@${LIBRARY_VERSIONS.aos}/dist/aos.js`,
    
    // Particles.js
    particles: `https://cdn.jsdelivr.net/npm/particles.js@${LIBRARY_VERSIONS.particles}/particles.min.js`,
    
    // GSAP
    gsap: `https://cdnjs.cloudflare.com/ajax/libs/gsap/${LIBRARY_VERSIONS.gsap}/gsap.min.js`,
    gsapScrollTrigger: `https://cdnjs.cloudflare.com/ajax/libs/gsap/${LIBRARY_VERSIONS.gsap}/ScrollTrigger.min.js`,
    
    // Three.js
    threejs: `https://cdnjs.cloudflare.com/ajax/libs/three.js/${LIBRARY_VERSIONS.threejs}/three.min.js`,
    
    // Otras librerías
    vanillaTilt: `https://cdn.jsdelivr.net/npm/vanilla-tilt@${LIBRARY_VERSIONS.vanillaTilt}/dist/vanilla-tilt.min.js`,
    typedjs: `https://cdn.jsdelivr.net/npm/typed.js@${LIBRARY_VERSIONS.typedjs}`,
    lottie: `https://cdnjs.cloudflare.com/ajax/libs/lottie-web/${LIBRARY_VERSIONS.lottie}/lottie.min.js`,
    lightbox: `https://cdnjs.cloudflare.com/ajax/libs/lightbox2/${LIBRARY_VERSIONS.lightbox}/js/lightbox.min.js`,
    isotope: `https://cdnjs.cloudflare.com/ajax/libs/jquery.isotope/${LIBRARY_VERSIONS.isotope}/isotope.pkgd.min.js`,
    intlTelInput: `https://cdn.jsdelivr.net/npm/intl-tel-input@${LIBRARY_VERSIONS.intlTelInput}/build/js/intlTelInput.min.js`,
    emailjs: `https://cdn.emailjs.com/dist/email.min.js`
};

// Función para cargar script de forma asíncrona
function loadScript(url, callback) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = callback || function() {};
    script.onerror = function() {
        console.error(`Error cargando script: ${url}`);
    };
    document.head.appendChild(script);
}

// Configuraciones por página
const PAGE_CONFIGS = {
    // Librerías base para todas las páginas
    base: ['bootstrap', 'aos'],
    
    // Página de inicio - Efectos avanzados
    index: ['bootstrap', 'aos', 'particles', 'threejs', 'gsap', 'gsapScrollTrigger', 'vanillaTilt', 'typedjs', 'lottie'],
    
    // Página de servicios
    servicios: ['bootstrap', 'aos'],
    
    // Página sobre nosotros
    'sobre-nosotros': ['bootstrap', 'aos', 'particles', 'gsap', 'gsapScrollTrigger'],
    
    // Portfolio - Lightbox e isotope
    portfolio: ['bootstrap', 'aos', 'particles', 'lightbox', 'isotope'],
    
    // Contacto - Formularios avanzados
    contacto: ['bootstrap', 'aos', 'particles', 'intlTelInput', 'emailjs'],
    
    // Pagos - Básico
    pagos: ['bootstrap', 'aos']
};

// Función principal para cargar librerías según la página
function loadLibrariesForPage(pageName) {
    const config = PAGE_CONFIGS[pageName] || PAGE_CONFIGS.base;
    let loadedCount = 0;
    const totalLibraries = config.length;
    
    console.log(`🚀 Cargando ${totalLibraries} librerías para página: ${pageName}`);
    
    config.forEach((libName, index) => {
        const url = CDN_URLS[libName];
        if (url) {
            // Cargar con pequeño delay para evitar sobrecarga
            setTimeout(() => {
                loadScript(url, () => {
                    loadedCount++;
                    console.log(`✅ ${libName} cargado (${loadedCount}/${totalLibraries})`);
                    
                    // Cuando todas las librerías estén cargadas
                    if (loadedCount === totalLibraries) {
                        console.log('🎉 Todas las librerías cargadas');
                        initializeLibraries();
                    }
                });
            }, index * 50); // 50ms de delay entre cada script
        }
    });
}

// Inicializar librerías después de cargar
function initializeLibraries() {
    // Inicializar AOS si está disponible
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Inicializar Particles.js si está disponible
    if (typeof particlesJS !== 'undefined') {
        // La configuración específica se hará en cada página
        document.dispatchEvent(new CustomEvent('particlesReady'));
    }
    
    // Inicializar Bootstrap tooltips si está disponible
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    // Disparar evento personalizado cuando todo esté listo
    document.dispatchEvent(new CustomEvent('librariesLoaded'));
}

// Detectar página actual automáticamente
function detectCurrentPage() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().split('.')[0];
    
    // Mapear nombres de archivo a configuraciones
    const pageMap = {
        'index': 'index',
        '': 'index', // Para root
        'servicios': 'servicios',
        'sobre-nosotros': 'sobre-nosotros',
        'portfolio': 'portfolio',
        'contacto': 'contacto',
        'pagos': 'pagos'
    };
    
    return pageMap[filename] || 'base';
}

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = detectCurrentPage();
    console.log(`📄 Página detectada: ${currentPage}`);
    loadLibrariesForPage(currentPage);
});

// Exportar para uso manual si es necesario
window.LibrariesLoader = {
    loadLibrariesForPage,
    CDN_URLS,
    LIBRARY_VERSIONS,
    detectCurrentPage
}; 