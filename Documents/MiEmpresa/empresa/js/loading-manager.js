/**
 * SoftCronw Global Loader - Pantalla de carga unificada
 * Versión: 2.0
 * Autor: SoftCronw Team
 */

class SoftCronwLoader {
  constructor() {
    this.isLoaded = false;
    this.loadingProgress = 0;
    this.minLoadTime = 1000; // 1 segundo máximo
    this.startTime = Date.now();
    this.init();
  }
  
  init() {
    this.createLoader();
    this.showLoader();
    this.simulateProgress();
    this.preloadAssets();
  }
  
  createLoader() {
    // Crear estructura del loader
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = `
      <div class="loader-content">
        <div class="loader-logo">
          <div class="gear-animation">
            <div class="gear gear-1">
              <div class="gear-inner"></div>
            </div>
            <div class="gear gear-2">
              <div class="gear-inner"></div>
            </div>
          </div>
          <h1 class="logo-text">SoftCronw</h1>
        </div>
        
        <div class="loader-progress">
          <div class="progress-container">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <div class="progress-percentage">0%</div>
          </div>
        </div>
        
        <p class="loader-text">
          <span class="text-typing">Cargando experiencia digital</span>
          <span class="dots">
            <span>.</span>
            <span>.</span>
            <span>.</span>
          </span>
        </p>
        
        <div class="loader-features">
          <div class="feature-item">
            <i class="fas fa-bolt"></i>
            <span>Carga Optimizada</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-shield-alt"></i>
            <span>100% Seguro</span>
          </div>
          <div class="feature-item">
            <i class="fas fa-rocket"></i>
            <span>Alto Rendimiento</span>
          </div>
        </div>
      </div>
      
      <div class="loader-background">
        <div class="floating-particles">
          ${this.generateParticles(15)}
        </div>
        <div class="circuit-lines">
          <svg width="100%" height="100%" viewBox="0 0 1920 1080">
            <defs>
              <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:0.8" />
                <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:0.8" />
              </linearGradient>
            </defs>
            <path d="M0,200 Q200,50 400,200 T800,200 Q1000,350 1200,200 T1920,200" 
                  stroke="url(#circuitGradient)" 
                  stroke-width="2" 
                  fill="none" 
                  opacity="0.6" />
            <path d="M0,600 Q300,450 600,600 T1200,600 Q1400,750 1600,600 T1920,600" 
                  stroke="url(#circuitGradient)" 
                  stroke-width="2" 
                  fill="none" 
                  opacity="0.4" />
          </svg>
        </div>
      </div>
    `;
    
    // Crear estilos CSS
    this.createStyles();
    
    // Insertar al inicio del body
    document.body.insertBefore(loader, document.body.firstChild);
  }
  
  generateParticles(count) {
    let particles = '';
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 2;
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 3 + 2;
      particles += `<div class="particle" style="left: ${left}%; width: ${size}px; height: ${size}px; animation-duration: ${animationDuration}s;"></div>`;
    }
    return particles;
  }
  
  createStyles() {
    if (document.getElementById('loader-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'loader-styles';
    styles.textContent = `
      #global-loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0f0f0f 100%);
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 1;
        transition: opacity 0.2s ease-out;
        overflow: hidden;
      }
      
      .loader-content {
        text-align: center;
        z-index: 2;
        position: relative;
      }
      
      .loader-logo {
        margin-bottom: 3rem;
        position: relative;
      }
      
      .gear-animation {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 2rem;
      }
      
      .gear {
        position: absolute;
        border: 3px solid;
        border-radius: 50%;
        border-color: #00d4ff transparent #ff6b6b transparent;
      }
      
      .gear-1 {
        width: 80px;
        height: 80px;
        top: 20px;
        left: 20px;
        animation: gearRotate 2s linear infinite;
      }
      
      .gear-2 {
        width: 120px;
        height: 120px;
        top: 0;
        left: 0;
        border-color: #ff6b6b transparent #00d4ff transparent;
        animation: gearRotate 3s linear infinite reverse;
      }
      
      .gear-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 20px;
        height: 20px;
        background: radial-gradient(circle, #00d4ff, #ff6b6b);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
      }
      
      @keyframes gearRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .logo-text {
        font-size: 3rem;
        font-weight: 700;
        background: linear-gradient(45deg, #00d4ff, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        letter-spacing: 2px;
        animation: logoGlow 2s ease-in-out infinite alternate;
      }
      
      @keyframes logoGlow {
        from { filter: drop-shadow(0 0 10px rgba(0, 212, 255, 0.3)); }
        to { filter: drop-shadow(0 0 30px rgba(255, 107, 107, 0.5)); }
      }
      
      .loader-progress {
        margin: 2rem 0;
      }
      
      .progress-container {
        position: relative;
        width: 300px;
        margin: 0 auto;
      }
      
      .progress-bar {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #00d4ff, #ff6b6b, #00d4ff);
        background-size: 200% 100%;
        border-radius: 10px;
        width: 0%;
        transition: width 0.3s ease-out;
        animation: progressShimmer 2s ease-in-out infinite;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      }
      
      @keyframes progressShimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      .progress-percentage {
        position: absolute;
        top: -30px;
        right: 0;
        color: #fff;
        font-weight: 600;
        font-size: 0.9rem;
      }
      
      .loader-text {
        color: rgba(255, 255, 255, 0.8);
        font-size: 1.2rem;
        margin: 2rem 0;
        font-weight: 500;
      }
      
      .dots span {
        animation: dotBlink 1.4s ease-in-out infinite both;
      }
      
      .dots span:nth-child(1) { animation-delay: 0s; }
      .dots span:nth-child(2) { animation-delay: 0.2s; }
      .dots span:nth-child(3) { animation-delay: 0.4s; }
      
      @keyframes dotBlink {
        0%, 80%, 100% { opacity: 0; }
        40% { opacity: 1; }
      }
      
      .loader-features {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
      }
      
      .feature-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        opacity: 0;
        animation: featureSlide 0.6s ease-out forwards;
      }
      
      .feature-item:nth-child(1) { animation-delay: 1s; }
      .feature-item:nth-child(2) { animation-delay: 1.3s; }
      .feature-item:nth-child(3) { animation-delay: 1.6s; }
      
      .feature-item i {
        font-size: 1.5rem;
        color: #00d4ff;
      }
      
      .feature-item span {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.8rem;
        font-weight: 500;
      }
      
      @keyframes featureSlide {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .loader-background {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
      }
      
      .floating-particles {
        position: absolute;
        width: 100%;
        height: 100%;
      }
      
      .particle {
        position: absolute;
        background: linear-gradient(45deg, #00d4ff, #ff6b6b);
        border-radius: 50%;
        opacity: 0.6;
        animation: particleFloat 5s ease-in-out infinite;
      }
      
      @keyframes particleFloat {
        0%, 100% {
          transform: translateY(100vh) rotate(0deg);
          opacity: 0;
        }
        10% {
          opacity: 0.6;
        }
        90% {
          opacity: 0.6;
        }
        100% {
          transform: translateY(-100px) rotate(360deg);
          opacity: 0;
        }
      }
      
      .circuit-lines {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.3;
      }
      
      /* Responsive */
      @media (max-width: 768px) {
        .logo-text {
          font-size: 2.5rem;
        }
        
        .progress-container {
          width: 250px;
        }
        
        .loader-features {
          flex-direction: column;
          gap: 1rem;
        }
        
        .feature-item {
          flex-direction: row;
          gap: 1rem;
        }
      }
    `;
    
    document.head.appendChild(styles);
  }
  
  showLoader() {
    const loader = document.getElementById('global-loader');
    if (loader) {
      loader.style.display = 'flex';
      loader.style.opacity = '1';
    }
  }
  
  updateProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-percentage');
    
    if (progressFill) {
      progressFill.style.width = percentage + '%';
    }
    
    if (progressText) {
      progressText.textContent = Math.round(percentage) + '%';
    }
    
    this.loadingProgress = percentage;
  }
  
  simulateProgress() {
    const increment = 100 / (this.minLoadTime / 50); // Actualizar cada 50ms
    let progress = 0;
    
    const progressInterval = setInterval(() => {
      progress += increment * (Math.random() * 0.5 + 0.5); // Variación natural
      
      if (progress >= 95) {
        progress = 95; // Parar en 95% hasta que todo esté listo
      }
      
      this.updateProgress(progress);
      
      if (progress >= 95 && this.isLoaded) {
        clearInterval(progressInterval);
        this.completeLoading();
      }
    }, 50);
  }
  
  preloadAssets() {
    const assetsToLoad = [
      'css/styles.css',
      'js/script.js'
    ];
    
    let loadedCount = 0;
    const totalAssets = assetsToLoad.length;
    
    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalAssets) {
        // Esperar tiempo mínimo
        const elapsedTime = Date.now() - this.startTime;
        const remainingTime = Math.max(0, this.minLoadTime - elapsedTime);
        
        setTimeout(() => {
          this.isLoaded = true;
        }, remainingTime);
      }
    };
    
    // Simular carga de assets
    assetsToLoad.forEach((asset, index) => {
      setTimeout(() => {
        checkComplete();
      }, (index + 1) * 200);
    });
  }
  
  completeLoading() {
    this.updateProgress(100);
    
    setTimeout(() => {
      this.hideLoader();
    }, 100);
  }
  
  hideLoader() {
    const loader = document.getElementById('global-loader');
    
    if (loader) {
      loader.style.opacity = '0';
      
      setTimeout(() => {
        loader.remove();
        
        // Limpiar estilos
        const loaderStyles = document.getElementById('loader-styles');
        if (loaderStyles) {
          loaderStyles.remove();
        }
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('loaderComplete'));
        
        // Lanzar animaciones de entrada
        this.initPageAnimations();
      }, 200);
    }
  }
  
  initPageAnimations() {
    // Aplicar animaciones de entrada a elementos de la página
    const elementsToAnimate = document.querySelectorAll(
      'section, .hero-content, .nav, header, main'
    );
    
    elementsToAnimate.forEach((element, index) => {
      element.style.opacity = '0';
      element.style.transform = 'translateY(30px)';
      element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      
      setTimeout(() => {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }, index * 100);
    });
  }
}

// Auto-inicializar el loader cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que no haya múltiples instancias
  if (!window.softcronwLoader && !document.getElementById('global-loader')) {
    window.softcronwLoader = new SoftCronwLoader();
  }
});

// También inicializar inmediatamente si el DOM ya está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.softcronwLoader && !document.getElementById('global-loader')) {
      window.softcronwLoader = new SoftCronwLoader();
    }
  });
} else {
  // DOM ya está cargado
  if (!window.softcronwLoader && !document.getElementById('global-loader')) {
    window.softcronwLoader = new SoftCronwLoader();
  }
}

// Funcionalidad global del hamburger menu
class HamburgerMenuManager {
  constructor() {
    this.init();
  }
  
  init() {
    this.hamburger = document.querySelector('.hamburger');
    this.overlay = document.querySelector('.nav-overlay');
    this.isOpen = false;
    
    if (this.hamburger && this.overlay) {
      this.hamburger.addEventListener('click', () => this.toggle());
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
      
      // Cerrar con ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.hamburger.classList.add('hamburger--active');
    this.overlay.classList.add('nav-overlay--active');
    document.body.style.overflow = 'hidden';
    this.isOpen = true;
  }
  
  close() {
    this.hamburger.classList.remove('hamburger--active');
    this.overlay.classList.remove('nav-overlay--active');
    document.body.style.overflow = '';
    this.isOpen = false;
  }
}

// Inicializar hamburger menu cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.hamburgerMenu = new HamburgerMenuManager();
});

// Exportar para uso externo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SoftCronwLoader, HamburgerMenuManager };
} 