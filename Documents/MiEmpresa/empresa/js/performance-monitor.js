/**
 * SoftCronw Performance Monitor
 * Sistema de monitoreo de Core Web Vitals y métricas de rendimiento
 * Optimizado para SEO y UX
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            lcp: null,
            fid: null,
            cls: null,
            fcp: null,
            ttfb: null,
            navigationTiming: null
        };
        
        this.thresholds = {
            lcp: { good: 2500, needs_improvement: 4000 },
            fid: { good: 100, needs_improvement: 300 },
            cls: { good: 0.1, needs_improvement: 0.25 },
            fcp: { good: 1800, needs_improvement: 3000 },
            ttfb: { good: 800, needs_improvement: 1800 }
        };
        
        this.init();
    }
    
    init() {
        // Verificar soporte para Web Vitals
        if ('web-vital' in window) {
            this.initWebVitals();
        } else {
            this.loadWebVitalsPolyfill();
        }
        
        // Inicializar otros monitores
        this.initNavigationTiming();
        this.initResourceTiming();
        this.initCustomMetrics();
        this.initRealUserMonitoring();
    }
    
    // ==========================================
    // CORE WEB VITALS
    // ==========================================
    
    async loadWebVitalsPolyfill() {
        try {
            const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('https://unpkg.com/web-vitals@3/dist/web-vitals.js');
            
            // Largest Contentful Paint
            getLCP((metric) => {
                this.metrics.lcp = metric;
                this.reportMetric('LCP', metric);
            });
            
            // First Input Delay
            getFID((metric) => {
                this.metrics.fid = metric;
                this.reportMetric('FID', metric);
            });
            
            // Cumulative Layout Shift
            getCLS((metric) => {
                this.metrics.cls = metric;
                this.reportMetric('CLS', metric);
            });
            
            // First Contentful Paint
            getFCP((metric) => {
                this.metrics.fcp = metric;
                this.reportMetric('FCP', metric);
            });
            
            // Time to First Byte
            getTTFB((metric) => {
                this.metrics.ttfb = metric;
                this.reportMetric('TTFB', metric);
            });
            
        } catch (error) {
            console.warn('No se pudo cargar Web Vitals library:', error);
            this.fallbackMetrics();
        }
    }
    
    // ==========================================
    // NAVIGATION TIMING
    // ==========================================
    
    initNavigationTiming() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navigation = performance.getEntriesByType('navigation')[0];
                    if (navigation) {
                        this.metrics.navigationTiming = {
                            dns: navigation.domainLookupEnd - navigation.domainLookupStart,
                            connection: navigation.connectEnd - navigation.connectStart,
                            request: navigation.responseStart - navigation.requestStart,
                            response: navigation.responseEnd - navigation.responseStart,
                            processing: navigation.domComplete - navigation.responseEnd,
                            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                            loadComplete: navigation.loadEventEnd - navigation.navigationStart
                        };
                        
                        this.reportNavigationMetrics();
                    }
                }, 0);
            });
        }
    }
    
    // ==========================================
    // RESOURCE TIMING
    // ==========================================
    
    initResourceTiming() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    this.analyzeResourcePerformance(entry);
                });
            });
            
            observer.observe({ entryTypes: ['resource'] });
        }
    }
    
    analyzeResourcePerformance(entry) {
        const resourceTypes = {
            'stylesheet': 'CSS',
            'script': 'JavaScript',
            'img': 'Image',
            'font': 'Font',
            'fetch': 'API',
            'xmlhttprequest': 'XHR'
        };
        
        const type = resourceTypes[entry.initiatorType] || entry.initiatorType;
        const duration = entry.responseEnd - entry.requestStart;
        
        // Alertar sobre recursos lentos
        if (duration > 3000) {
            console.warn(`Recurso lento detectado: ${entry.name} (${type}) - ${Math.round(duration)}ms`);
            
            // Enviar métricas a analytics
            this.sendToAnalytics('slow_resource', {
                resource_name: entry.name,
                resource_type: type,
                duration: Math.round(duration),
                size: entry.transferSize || 0
            });
        }
    }
    
    // ==========================================
    // MÉTRICAS PERSONALIZADAS
    // ==========================================
    
    initCustomMetrics() {
        // Tiempo hasta que el contenido principal sea visible
        this.measureHeroImageLoad();
        
        // Tiempo de carga de CSS crítico
        this.measureCriticalCSS();
        
        // Tiempo de inicialización de JavaScript
        this.measureJSInitialization();
        
        // Métricas de interactividad
        this.measureInteractivity();
    }
    
    measureHeroImageLoad() {
        const heroImages = document.querySelectorAll('.hero-section-spectacular img, .hero-visual-mega img');
        let loadedImages = 0;
        const totalImages = heroImages.length;
        
        if (totalImages === 0) return;
        
        const startTime = performance.now();
        
        heroImages.forEach(img => {
            if (img.complete) {
                loadedImages++;
            } else {
                img.addEventListener('load', () => {
                    loadedImages++;
                    if (loadedImages === totalImages) {
                        const heroLoadTime = performance.now() - startTime;
                        this.reportCustomMetric('hero_images_loaded', heroLoadTime);
                    }
                });
            }
        });
        
        if (loadedImages === totalImages) {
            this.reportCustomMetric('hero_images_loaded', 0);
        }
    }
    
    measureCriticalCSS() {
        const criticalCSS = document.querySelector('style');
        if (criticalCSS) {
            this.reportCustomMetric('critical_css_size', criticalCSS.innerHTML.length);
        }
    }
    
    measureJSInitialization() {
        window.addEventListener('DOMContentLoaded', () => {
            const jsInitStart = performance.now();
            
            // Simular inicialización de componentes críticos
            requestAnimationFrame(() => {
                const jsInitTime = performance.now() - jsInitStart;
                this.reportCustomMetric('js_initialization', jsInitTime);
            });
        });
    }
    
    measureInteractivity() {
        let firstInteraction = null;
        
        const handleInteraction = (event) => {
            if (!firstInteraction) {
                firstInteraction = performance.now();
                this.reportCustomMetric('time_to_first_interaction', firstInteraction);
                
                // Remover listeners después de la primera interacción
                ['click', 'keydown', 'touchstart'].forEach(type => {
                    document.removeEventListener(type, handleInteraction, true);
                });
            }
        };
        
        ['click', 'keydown', 'touchstart'].forEach(type => {
            document.addEventListener(type, handleInteraction, true);
        });
    }
    
    // ==========================================
    // REAL USER MONITORING (RUM)
    // ==========================================
    
    initRealUserMonitoring() {
        // Detectar tipo de conexión
        this.detectConnectionType();
        
        // Monitorear errores JavaScript
        this.monitorJavaScriptErrors();
        
        // Monitorear errores de carga de recursos
        this.monitorResourceErrors();
        
        // Monitorear visibilidad de la página
        this.monitorPageVisibility();
    }
    
    detectConnectionType() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.reportCustomMetric('connection_type', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData
            });
        }
    }
    
    monitorJavaScriptErrors() {
        window.addEventListener('error', (event) => {
            this.sendToAnalytics('javascript_error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error ? event.error.stack : null
            });
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.sendToAnalytics('promise_rejection', {
                reason: event.reason
            });
        });
    }
    
    monitorResourceErrors() {
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.sendToAnalytics('resource_error', {
                    tagName: event.target.tagName,
                    source: event.target.src || event.target.href,
                    message: 'Failed to load resource'
                });
            }
        }, true);
    }
    
    monitorPageVisibility() {
        let visibilityStart = Date.now();
        let totalVisibleTime = 0;
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                visibilityStart = Date.now();
            } else {
                totalVisibleTime += Date.now() - visibilityStart;
                this.reportCustomMetric('page_visible_time', totalVisibleTime);
            }
        });
        
        window.addEventListener('beforeunload', () => {
            if (document.visibilityState === 'visible') {
                totalVisibleTime += Date.now() - visibilityStart;
            }
            this.sendFinalMetrics(totalVisibleTime);
        });
    }
    
    // ==========================================
    // REPORTING Y ANALYTICS
    // ==========================================
    
    reportMetric(name, metric) {
        const score = this.getMetricScore(name.toLowerCase(), metric.value);
        
        console.log(`📊 ${name}: ${Math.round(metric.value)}ms (${score})`);
        
        // Enviar a Google Analytics
        this.sendToAnalytics('web_vital', {
            metric_name: name,
            metric_value: Math.round(metric.value),
            metric_score: score,
            metric_id: metric.id
        });
        
        // Mostrar notificación si es necesario
        if (score === 'poor') {
            this.showPerformanceWarning(name, metric.value);
        }
    }
    
    reportNavigationMetrics() {
        const timing = this.metrics.navigationTiming;
        
        Object.entries(timing).forEach(([key, value]) => {
            console.log(`⏱️ ${key}: ${Math.round(value)}ms`);
        });
        
        this.sendToAnalytics('navigation_timing', timing);
    }
    
    reportCustomMetric(name, value) {
        console.log(`🔧 ${name}: ${typeof value === 'object' ? JSON.stringify(value) : Math.round(value)}`);
        
        this.sendToAnalytics('custom_metric', {
            metric_name: name,
            metric_value: value
        });
    }
    
    getMetricScore(metricName, value) {
        const threshold = this.thresholds[metricName];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needs_improvement) return 'needs_improvement';
        return 'poor';
    }
    
    sendToAnalytics(eventName, parameters) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
        
        // Google Tag Manager
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({
                event: eventName,
                ...parameters
            });
        }
        
        // Consola para desarrollo
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('📈 Analytics Event:', eventName, parameters);
        }
    }
    
    sendFinalMetrics(visibleTime) {
        const allMetrics = {
            ...this.metrics,
            total_visible_time: visibleTime,
            page_url: window.location.href,
            user_agent: navigator.userAgent,
            viewport: {
                width: window.innerWidth,
                height: window.innerHeight
            }
        };
        
        // Usar sendBeacon para envío garantizado
        if ('sendBeacon' in navigator) {
            const data = JSON.stringify({
                event: 'page_performance_summary',
                metrics: allMetrics
            });
            
            navigator.sendBeacon('/api/analytics', data);
        }
    }
    
    showPerformanceWarning(metric, value) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.warn(`⚠️ Performance Warning: ${metric} is ${Math.round(value)}ms (poor)`);
        }
    }
    
    // ==========================================
    // MÉTODOS FALLBACK
    // ==========================================
    
    fallbackMetrics() {
        // Implementación básica sin Web Vitals library
        window.addEventListener('load', () => {
            const timing = performance.timing;
            
            // Calcular métricas básicas
            const metrics = {
                fcp: timing.domContentLoadedEventEnd - timing.navigationStart,
                lcp: timing.loadEventEnd - timing.navigationStart,
                ttfb: timing.responseStart - timing.navigationStart
            };
            
            Object.entries(metrics).forEach(([name, value]) => {
                this.reportMetric(name.toUpperCase(), { value, id: `fallback-${name}` });
            });
        });
    }
    
    // ==========================================
    // API PÚBLICA
    // ==========================================
    
    getMetrics() {
        return this.metrics;
    }
    
    markCustomTiming(name) {
        performance.mark(name);
        this.reportCustomMetric(`custom_timing_${name}`, performance.now());
    }
    
    measureCustomDuration(startMark, endMark, name) {
        performance.mark(endMark);
        performance.measure(name, startMark, endMark);
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        if (measure) {
            this.reportCustomMetric(name, measure.duration);
        }
    }
}

// ==========================================
// INICIALIZACIÓN AUTOMÁTICA
// ==========================================

// Inicializar monitor de performance cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.performanceMonitor = new PerformanceMonitor();
    });
} else {
    window.performanceMonitor = new PerformanceMonitor();
}

// Exportar para uso manual
window.PerformanceMonitor = PerformanceMonitor; 