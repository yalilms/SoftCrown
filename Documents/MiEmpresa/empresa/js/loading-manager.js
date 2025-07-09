/**
 * LOADING MANAGER - SoftCronw
 * Sistema unificado para manejar pantallas de carga
 * Versión: 1.0.0
 */

class LoadingManager {
    constructor() {
        this.loadingScreen = null;
        this.isLoading = true;
        this.loadingTimeout = null;
        this.minLoadingTime = 1000; // Mínimo 1 segundo
        this.maxLoadingTime = 5000; // Máximo 5 segundos
        this.startTime = Date.now();
        
        this.init();
    }
    
    init() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupLoadingScreen());
        } else {
            this.setupLoadingScreen();
        }
    }
    
    setupLoadingScreen() {
        this.loadingScreen = document.getElementById('loading-screen');
        
        if (!this.loadingScreen) {
            console.warn('Loading screen element not found');
            return;
        }
        
        // Configurar el contexto de la página
        this.setPageContext();
        
        // Establecer timeout de seguridad
        this.setLoadingTimeout();
        
        // Escuchar eventos de carga
        this.bindLoadingEvents();
        
        console.log('🔄 Loading Manager initialized');
    }
    
    setPageContext() {
        const content = this.loadingScreen.querySelector('.loading-content');
        if (!content) return;
        
        // Detectar página actual
        const currentPage = this.detectCurrentPage();
        content.setAttribute('data-page', currentPage);
        
        // Personalizar texto según la página
        this.customizeLoadingText(currentPage);
    }
    
    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().split('.')[0];
        
        const pageMap = {
            'index': 'inicio',
            '': 'inicio',
            'servicios': 'servicios',
            'sobre-nosotros': 'sobre-nosotros',
            'portfolio': 'portfolio',
            'contacto': 'contacto',
            'pagos': 'pagos'
        };
        
        return pageMap[filename] || 'inicio';
    }
    
    customizeLoadingText(pageName) {
        const subtitle = this.loadingScreen.querySelector('.loading-subtitle');
        if (!subtitle) return;
        
        const pageTexts = {
            'inicio': 'Cargando experiencia digital',
            'servicios': 'Cargando servicios',
            'portfolio': 'Cargando portfolio',
            'contacto': 'Cargando formularios',
            'sobre-nosotros': 'Cargando información',
            'pagos': 'Cargando métodos de pago'
        };
        
        subtitle.textContent = pageTexts[pageName] || 'Cargando contenido';
    }
    
    bindLoadingEvents() {
        // Cuando la página esté completamente cargada
        if (document.readyState === 'complete') {
            this.checkAndHideLoading();
        } else {
            window.addEventListener('load', () => this.checkAndHideLoading());
        }
        
        // Cuando las librerías estén cargadas (nuestro sistema unificado)
        document.addEventListener('librariesLoaded', () => {
            console.log('📚 Libraries loaded');
            this.checkAndHideLoading();
        });
        
        // Timeout de seguridad para pantallas lentas
        setTimeout(() => {
            this.forceHideLoading();
        }, this.maxLoadingTime);
    }
    
    checkAndHideLoading() {
        const elapsed = Date.now() - this.startTime;
        
        // Respetar tiempo mínimo de loading para mejor UX
        if (elapsed < this.minLoadingTime) {
            setTimeout(() => {
                this.hideLoading();
            }, this.minLoadingTime - elapsed);
        } else {
            this.hideLoading();
        }
    }
    
    hideLoading() {
        if (!this.loadingScreen || !this.isLoading) return;
        
        console.log('✅ Hiding loading screen');
        this.isLoading = false;
        
        // Limpiar timeout si existe
        if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
        }
        
        // Animar salida
        this.loadingScreen.classList.add('fade-out');
        
        // Remover del DOM después de la animación
        setTimeout(() => {
            if (this.loadingScreen) {
                this.loadingScreen.classList.add('hidden');
                this.loadingScreen.style.display = 'none';
                
                // Dispatch event para otros scripts
                document.dispatchEvent(new CustomEvent('loadingComplete'));
            }
        }, 800);
    }
    
    forceHideLoading() {
        if (this.isLoading) {
            console.warn('⚠️ Force hiding loading screen (timeout reached)');
            this.hideLoading();
        }
    }
    
    setLoadingTimeout() {
        this.loadingTimeout = setTimeout(() => {
            this.forceHideLoading();
        }, this.maxLoadingTime);
    }
    
    // Método público para mostrar loading manualmente
    showLoading(text = 'Cargando...') {
        if (!this.loadingScreen) return;
        
        const subtitle = this.loadingScreen.querySelector('.loading-subtitle');
        if (subtitle) {
            subtitle.textContent = text;
        }
        
        this.loadingScreen.classList.remove('hidden', 'fade-out');
        this.loadingScreen.style.display = 'flex';
        this.isLoading = true;
        
        console.log('🔄 Showing loading screen:', text);
    }
    
    // Método público para ocultar loading manualmente
    hideLoadingNow() {
        this.hideLoading();
    }
    
    // Obtener estado actual
    isCurrentlyLoading() {
        return this.isLoading;
    }
}

// ================================
// INICIALIZACIÓN AUTOMÁTICA
// ================================

let loadingManager;

// Inicializar inmediatamente
try {
    loadingManager = new LoadingManager();
    
    // Hacer disponible globalmente
    window.LoadingManager = loadingManager;
    
    console.log('🚀 Loading Manager ready');
} catch (error) {
    console.error('❌ Error initializing Loading Manager:', error);
    
    // Fallback: ocultar loading después de 3 segundos
    setTimeout(() => {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
    }, 3000);
}

// ================================
// UTILIDADES ADICIONALES
// ================================

// Función para mostrar loading durante operaciones asíncronas
window.showLoadingFor = function(promise, text = 'Procesando...') {
    if (loadingManager) {
        loadingManager.showLoading(text);
        
        promise.finally(() => {
            setTimeout(() => {
                loadingManager.hideLoadingNow();
            }, 500);
        });
    }
    
    return promise;
};

// Función para crear loading temporal
window.createTemporaryLoading = function(duration = 2000, text = 'Cargando...') {
    if (loadingManager) {
        loadingManager.showLoading(text);
        
        setTimeout(() => {
            loadingManager.hideLoadingNow();
        }, duration);
    }
};

// Exportar para módulos ES6 si está disponible
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
} 