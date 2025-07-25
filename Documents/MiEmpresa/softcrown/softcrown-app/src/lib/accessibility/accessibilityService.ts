// Accessibility and UX Service
export interface AccessibilityConfig {
  ariaLabels: boolean;
  keyboardNavigation: boolean;
  screenReaderSupport: boolean;
  colorContrast: boolean;
  focusManagement: boolean;
  skipLinks: boolean;
  landmarks: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
}

export interface ColorContrastResult {
  ratio: number;
  level: 'AA' | 'AAA' | 'fail';
  foreground: string;
  background: string;
  isValid: boolean;
}

export interface KeyboardNavigationConfig {
  tabOrder: string[];
  focusTraps: string[];
  skipLinks: Array<{ text: string; target: string }>;
  shortcuts: Array<{ key: string; action: string; description: string }>;
}

export interface ScreenReaderConfig {
  announcements: boolean;
  liveRegions: string[];
  ariaDescriptions: Map<string, string>;
  roleOverrides: Map<string, string>;
}

export interface AccessibilityAudit {
  score: number;
  issues: AccessibilityIssue[];
  recommendations: AccessibilityRecommendation[];
  compliance: {
    wcag21AA: boolean;
    wcag21AAA: boolean;
    section508: boolean;
  };
}

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'keyboard' | 'screen-reader' | 'color-contrast' | 'structure' | 'content';
  element: string;
  description: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  solution: string;
  wcagCriterion: string;
}

export interface AccessibilityRecommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  implementation: string;
  benefit: string;
  effort: 'low' | 'medium' | 'high';
}

export class AccessibilityService {
  private config: AccessibilityConfig;
  private keyboardConfig: KeyboardNavigationConfig;
  private screenReaderConfig: ScreenReaderConfig;

  constructor() {
    this.config = this.getDefaultConfig();
    this.keyboardConfig = this.getDefaultKeyboardConfig();
    this.screenReaderConfig = this.getDefaultScreenReaderConfig();
    this.initializeAccessibility();
  }

  // Initialize accessibility features
  private initializeAccessibility(): void {
    if (typeof window !== 'undefined') {
      this.setupKeyboardNavigation();
      this.setupScreenReaderSupport();
      this.setupFocusManagement();
      this.setupSkipLinks();
      this.setupReducedMotion();
      this.setupHighContrast();
    }
  }

  // ARIA Labels and Descriptions
  generateAriaLabel(element: string, context?: string): string {
    const ariaLabels: Record<string, string> = {
      // Navigation
      'main-nav': 'Navegación principal',
      'breadcrumb': 'Ruta de navegación',
      'pagination': 'Navegación de páginas',
      'search': 'Buscar en el sitio',
      
      // Forms
      'contact-form': 'Formulario de contacto',
      'newsletter-form': 'Suscripción al boletín',
      'login-form': 'Formulario de inicio de sesión',
      'register-form': 'Formulario de registro',
      
      // Buttons
      'menu-toggle': 'Abrir/cerrar menú de navegación',
      'theme-toggle': 'Cambiar entre modo claro y oscuro',
      'close-modal': 'Cerrar ventana modal',
      'submit-form': 'Enviar formulario',
      
      // Content
      'main-content': 'Contenido principal',
      'sidebar': 'Barra lateral',
      'footer': 'Pie de página',
      'article': 'Artículo principal',
      
      // Interactive elements
      'dropdown': 'Menú desplegable',
      'tab-panel': 'Panel de pestañas',
      'accordion': 'Contenido expandible',
      'carousel': 'Carrusel de imágenes',
    };

    const baseLabel = ariaLabels[element] || element;
    return context ? `${baseLabel} - ${context}` : baseLabel;
  }

  generateAriaDescription(element: string, data?: any): string {
    const descriptions: Record<string, (data?: any) => string> = {
      'service-card': (data) => 
        `Servicio ${data?.name || 'desconocido'} por ${data?.price || 'precio a consultar'}€. ${data?.description || 'Sin descripción disponible'}.`,
      
      'product-card': (data) => 
        `Producto ${data?.name || 'desconocido'} con precio de ${data?.price || 0}€. ${data?.features?.length || 0} características incluidas.`,
      
      'blog-post': (data) => 
        `Artículo publicado el ${data?.date || 'fecha desconocida'} por ${data?.author || 'autor desconocido'}. Tiempo de lectura estimado: ${data?.readTime || 5} minutos.`,
      
      'testimonial': (data) => 
        `Testimonio de ${data?.author || 'cliente'}, ${data?.company || 'empresa'}, con valoración de ${data?.rating || 5} estrellas.`,
      
      'project-card': (data) => 
        `Proyecto ${data?.name || 'sin nombre'} en estado ${data?.status || 'desconocido'}. Progreso: ${data?.progress || 0}% completado.`,
    };

    const generator = descriptions[element];
    return generator ? generator(data) : `Elemento ${element}`;
  }

  // Keyboard Navigation
  private setupKeyboardNavigation(): void {
    // Tab order management
    this.setupTabOrder();
    
    // Focus traps for modals
    this.setupFocusTraps();
    
    // Keyboard shortcuts
    this.setupKeyboardShortcuts();
    
    // Arrow key navigation for components
    this.setupArrowKeyNavigation();
  }

  private setupTabOrder(): void {
    const focusableElements = [
      'button',
      'input',
      'select',
      'textarea',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll(focusableElements))
          .filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null) as HTMLElement[];
        
        const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
        
        if (e.shiftKey) {
          // Shift + Tab (backward)
          const prevIndex = currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1;
          focusable[prevIndex]?.focus();
        } else {
          // Tab (forward)
          const nextIndex = currentIndex >= focusable.length - 1 ? 0 : currentIndex + 1;
          focusable[nextIndex]?.focus();
        }
      }
    });
  }

  private setupFocusTraps(): void {
    const trapFocus = (container: HTMLElement) => {
      const focusableElements = container.querySelectorAll(
        'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
      ) as NodeListOf<HTMLElement>;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      container.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      });
    };

    // Apply focus trap to modals
    document.querySelectorAll('[role="dialog"], .modal').forEach(modal => {
      trapFocus(modal as HTMLElement);
    });
  }

  private setupKeyboardShortcuts(): void {
    const shortcuts = this.keyboardConfig.shortcuts;
    
    document.addEventListener('keydown', (e) => {
      const shortcut = shortcuts.find(s => {
        const keys = s.key.split('+');
        return keys.every(key => {
          switch (key.toLowerCase()) {
            case 'ctrl': return e.ctrlKey;
            case 'alt': return e.altKey;
            case 'shift': return e.shiftKey;
            case 'meta': return e.metaKey;
            default: return e.key.toLowerCase() === key.toLowerCase();
          }
        });
      });

      if (shortcut) {
        e.preventDefault();
        this.executeShortcutAction(shortcut.action);
      }
    });
  }

  private setupArrowKeyNavigation(): void {
    // Arrow key navigation for menus, tabs, etc.
    document.addEventListener('keydown', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.closest('[role="menubar"], [role="tablist"], .navigation-group')) {
        const container = target.closest('[role="menubar"], [role="tablist"], .navigation-group') as HTMLElement;
        const items = Array.from(container.querySelectorAll('[role="menuitem"], [role="tab"], .nav-item')) as HTMLElement[];
        const currentIndex = items.indexOf(target);

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % items.length;
            items[nextIndex]?.focus();
            break;
            
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            items[prevIndex]?.focus();
            break;
            
          case 'Home':
            e.preventDefault();
            items[0]?.focus();
            break;
            
          case 'End':
            e.preventDefault();
            items[items.length - 1]?.focus();
            break;
        }
      }
    });
  }

  // Screen Reader Support
  private setupScreenReaderSupport(): void {
    this.setupLiveRegions();
    this.setupAriaAnnouncements();
    this.setupRoleOverrides();
  }

  private setupLiveRegions(): void {
    // Create live regions for dynamic content
    const liveRegions = [
      { id: 'status-messages', politeness: 'polite' },
      { id: 'error-messages', politeness: 'assertive' },
      { id: 'loading-messages', politeness: 'polite' },
    ];

    liveRegions.forEach(region => {
      if (!document.getElementById(region.id)) {
        const liveRegion = document.createElement('div');
        liveRegion.id = region.id;
        liveRegion.setAttribute('aria-live', region.politeness);
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
      }
    });
  }

  announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const regionId = priority === 'assertive' ? 'error-messages' : 'status-messages';
    const region = document.getElementById(regionId);
    
    if (region) {
      region.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        region.textContent = '';
      }, 1000);
    }
  }

  private setupAriaAnnouncements(): void {
    // Announce page changes
    const announcePageChange = (title: string) => {
      this.announceToScreenReader(`Navegando a ${title}`);
    };

    // Announce form errors
    const announceFormErrors = (errors: string[]) => {
      const message = `Se encontraron ${errors.length} errores: ${errors.join(', ')}`;
      this.announceToScreenReader(message, 'assertive');
    };

    // Announce loading states
    const announceLoading = (isLoading: boolean, context?: string) => {
      const message = isLoading 
        ? `Cargando${context ? ` ${context}` : ''}...` 
        : `Carga completada${context ? ` de ${context}` : ''}`;
      this.announceToScreenReader(message);
    };

    // Export functions for use in components
    (window as any).accessibility = {
      announcePageChange,
      announceFormErrors,
      announceLoading,
    };
  }

  private setupRoleOverrides(): void {
    // Apply appropriate ARIA roles to elements
    const roleOverrides = this.screenReaderConfig.roleOverrides;
    
    roleOverrides.forEach((role, selector) => {
      document.querySelectorAll(selector).forEach(element => {
        element.setAttribute('role', role);
      });
    });
  }

  // Focus Management
  private setupFocusManagement(): void {
    // Focus visible styles
    const style = document.createElement('style');
    style.textContent = `
      .focus-visible {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
      
      .focus-visible:not(.focus-visible-added) {
        outline: none;
      }
      
      *:focus-visible {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);

    // Focus management for route changes
    this.setupRouteFocusManagement();
  }

  private setupRouteFocusManagement(): void {
    // Focus main content on route change
    const focusMainContent = () => {
      const mainContent = document.querySelector('main, [role="main"], #main-content') as HTMLElement;
      if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
        mainContent.focus();
        mainContent.addEventListener('blur', () => {
          mainContent.removeAttribute('tabindex');
        }, { once: true });
      }
    };

    // Listen for route changes (Next.js specific)
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', focusMainContent);
    }
  }

  // Skip Links
  private setupSkipLinks(): void {
    const skipLinks = this.keyboardConfig.skipLinks;
    
    // Create skip links container
    const skipLinksContainer = document.createElement('div');
    skipLinksContainer.className = 'skip-links';
    skipLinksContainer.innerHTML = `
      <style>
        .skip-links {
          position: absolute;
          top: -100px;
          left: 0;
          z-index: 9999;
        }
        
        .skip-links a {
          position: absolute;
          top: -100px;
          left: 0;
          background: #000;
          color: #fff;
          padding: 8px 16px;
          text-decoration: none;
          border-radius: 0 0 4px 0;
          font-weight: bold;
          transition: top 0.3s ease;
        }
        
        .skip-links a:focus {
          top: 0;
        }
      </style>
      ${skipLinks.map(link => 
        `<a href="${link.target}">${link.text}</a>`
      ).join('')}
    `;
    
    document.body.insertBefore(skipLinksContainer, document.body.firstChild);
  }

  // Color Contrast
  checkColorContrast(foreground: string, background: string): ColorContrastResult {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });

      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    let level: 'AA' | 'AAA' | 'fail';
    if (ratio >= 7) level = 'AAA';
    else if (ratio >= 4.5) level = 'AA';
    else level = 'fail';

    return {
      ratio: Math.round(ratio * 100) / 100,
      level,
      foreground,
      background,
      isValid: level !== 'fail',
    };
  }

  // Reduced Motion
  private setupReducedMotion(): void {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleReducedMotion = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
        
        // Add CSS for reduced motion
        const style = document.createElement('style');
        style.textContent = `
          .reduce-motion *,
          .reduce-motion *::before,
          .reduce-motion *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        `;
        document.head.appendChild(style);
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    };

    prefersReducedMotion.addEventListener('change', handleReducedMotion);
    handleReducedMotion(prefersReducedMotion);
  }

  // High Contrast
  private setupHighContrast(): void {
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)');
    
    const handleHighContrast = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) {
        document.documentElement.classList.add('high-contrast');
        
        // Add high contrast styles
        const style = document.createElement('style');
        style.textContent = `
          .high-contrast {
            filter: contrast(150%);
          }
          
          .high-contrast button,
          .high-contrast input,
          .high-contrast select,
          .high-contrast textarea {
            border: 2px solid #000;
          }
          
          .high-contrast a {
            text-decoration: underline;
            font-weight: bold;
          }
        `;
        document.head.appendChild(style);
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    };

    prefersHighContrast.addEventListener('change', handleHighContrast);
    handleHighContrast(prefersHighContrast);
  }

  // Accessibility Audit
  async performAccessibilityAudit(): Promise<AccessibilityAudit> {
    const issues: AccessibilityIssue[] = [];
    const recommendations: AccessibilityRecommendation[] = [];

    // Check for missing alt text
    document.querySelectorAll('img:not([alt])').forEach((img, index) => {
      issues.push({
        type: 'error',
        category: 'content',
        element: `img:nth-child(${index + 1})`,
        description: 'Imagen sin texto alternativo',
        impact: 'serious',
        solution: 'Añadir atributo alt descriptivo',
        wcagCriterion: '1.1.1 Non-text Content',
      });
    });

    // Check for missing form labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach((input, index) => {
      const hasLabel = document.querySelector(`label[for="${(input as HTMLInputElement).id}"]`);
      if (!hasLabel) {
        issues.push({
          type: 'error',
          category: 'structure',
          element: `input:nth-child(${index + 1})`,
          description: 'Campo de formulario sin etiqueta',
          impact: 'serious',
          solution: 'Añadir elemento label o atributos aria-label/aria-labelledby',
          wcagCriterion: '3.3.2 Labels or Instructions',
        });
      }
    });

    // Check color contrast
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, a, button');
    textElements.forEach((element, index) => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // Simplified contrast check (would need proper color parsing in real implementation)
        const contrastResult = this.checkColorContrast('#000000', '#ffffff'); // Mock values
        
        if (contrastResult.level === 'fail') {
          issues.push({
            type: 'warning',
            category: 'color-contrast',
            element: `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            description: `Contraste insuficiente: ${contrastResult.ratio}:1`,
            impact: 'moderate',
            solution: 'Ajustar colores para cumplir ratio mínimo 4.5:1',
            wcagCriterion: '1.4.3 Contrast (Minimum)',
          });
        }
      }
    });

    // Check heading hierarchy
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      
      if (currentLevel > previousLevel + 1) {
        issues.push({
          type: 'warning',
          category: 'structure',
          element: `${heading.tagName.toLowerCase()}:nth-child(${index + 1})`,
          description: 'Jerarquía de encabezados incorrecta',
          impact: 'moderate',
          solution: 'Usar encabezados en orden secuencial',
          wcagCriterion: '1.3.1 Info and Relationships',
        });
      }
      
      previousLevel = currentLevel;
    });

    // Generate recommendations
    if (issues.length > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Corregir problemas críticos de accesibilidad',
        description: `Se encontraron ${issues.filter(i => i.impact === 'critical' || i.impact === 'serious').length} problemas críticos`,
        implementation: 'Revisar y corregir cada problema identificado',
        benefit: 'Mejora significativa en accesibilidad y cumplimiento WCAG',
        effort: 'medium',
      });
    }

    const score = Math.max(0, 100 - (issues.length * 10));
    
    return {
      score,
      issues,
      recommendations,
      compliance: {
        wcag21AA: score >= 80,
        wcag21AAA: score >= 95,
        section508: score >= 85,
      },
    };
  }

  // Helper methods
  private executeShortcutAction(action: string): void {
    switch (action) {
      case 'focus-search':
        const searchInput = document.querySelector('input[type="search"], input[name="search"]') as HTMLElement;
        searchInput?.focus();
        break;
        
      case 'focus-main':
        const mainContent = document.querySelector('main, [role="main"]') as HTMLElement;
        mainContent?.focus();
        break;
        
      case 'toggle-menu':
        const menuToggle = document.querySelector('[aria-label*="menú"], .menu-toggle') as HTMLElement;
        menuToggle?.click();
        break;
        
      case 'skip-to-content':
        const skipLink = document.querySelector('.skip-links a') as HTMLElement;
        skipLink?.click();
        break;
    }
  }

  private getDefaultConfig(): AccessibilityConfig {
    return {
      ariaLabels: true,
      keyboardNavigation: true,
      screenReaderSupport: true,
      colorContrast: true,
      focusManagement: true,
      skipLinks: true,
      landmarks: true,
      reducedMotion: true,
      highContrast: true,
      fontSize: 'medium',
    };
  }

  private getDefaultKeyboardConfig(): KeyboardNavigationConfig {
    return {
      tabOrder: [],
      focusTraps: ['.modal', '[role="dialog"]'],
      skipLinks: [
        { text: 'Saltar al contenido principal', target: '#main-content' },
        { text: 'Saltar a la navegación', target: '#main-nav' },
        { text: 'Saltar al pie de página', target: '#footer' },
      ],
      shortcuts: [
        { key: 'Alt+1', action: 'focus-main', description: 'Ir al contenido principal' },
        { key: 'Alt+2', action: 'focus-search', description: 'Ir al buscador' },
        { key: 'Alt+M', action: 'toggle-menu', description: 'Abrir/cerrar menú' },
        { key: 'Alt+S', action: 'skip-to-content', description: 'Saltar al contenido' },
      ],
    };
  }

  private getDefaultScreenReaderConfig(): ScreenReaderConfig {
    return {
      announcements: true,
      liveRegions: ['#status-messages', '#error-messages', '#loading-messages'],
      ariaDescriptions: new Map(),
      roleOverrides: new Map([
        ['.card', 'article'],
        ['.nav-item', 'menuitem'],
        ['.tab', 'tab'],
        ['.panel', 'tabpanel'],
      ]),
    };
  }

  // Public API
  updateConfig(newConfig: Partial<AccessibilityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  isAccessibilityEnabled(): boolean {
    return Object.values(this.config).some(value => value === true);
  }
}

// Export singleton instance
export const accessibilityService = new AccessibilityService();
