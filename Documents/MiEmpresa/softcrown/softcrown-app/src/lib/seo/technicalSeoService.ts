// Technical SEO Service
import {
  SEOPerformance,
  CoreWebVitals,
  SitemapEntry,
  RobotsTxt,
  ContentOptimization,
  TechnicalIssue,
  SEORecommendation,
  ImageOptimization,
  InternalLink,
  LocalSEO,
  GoogleMyBusinessData
} from '@/types/seo';

export interface PerformanceAuditResult {
  score: number;
  coreWebVitals: CoreWebVitals;
  issues: TechnicalIssue[];
  recommendations: SEORecommendation[];
  optimizations: {
    images: ImageOptimization[];
    css: string[];
    javascript: string[];
    fonts: string[];
  };
}

export interface ContentAnalysisResult {
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  contentLength: number;
  headingStructure: Array<{ level: number; text: string; keywords: string[] }>;
  internalLinks: InternalLink[];
  issues: string[];
  recommendations: string[];
}

export class TechnicalSEOService {
  private performanceData: Map<string, PerformanceAuditResult> = new Map();
  private contentAnalysis: Map<string, ContentAnalysisResult> = new Map();
  private localSEOData: LocalSEO;

  constructor() {
    this.initializeLocalSEO();
  }

  // Performance Optimization
  async auditPagePerformance(url: string): Promise<PerformanceAuditResult> {
    // Simulate performance audit
    const coreWebVitals: CoreWebVitals = {
      lcp: Math.random() * 2000 + 1000, // 1-3 seconds
      fid: Math.random() * 100 + 50, // 50-150ms
      cls: Math.random() * 0.1, // 0-0.1
      fcp: Math.random() * 1500 + 500, // 0.5-2 seconds
      ttfb: Math.random() * 500 + 200, // 200-700ms
      score: 0,
    };

    // Calculate overall score
    let score = 100;
    if (coreWebVitals.lcp > 2500) score -= 20;
    if (coreWebVitals.fid > 100) score -= 15;
    if (coreWebVitals.cls > 0.1) score -= 15;
    if (coreWebVitals.fcp > 1800) score -= 10;
    if (coreWebVitals.ttfb > 600) score -= 10;

    coreWebVitals.score = Math.max(0, score);

    const issues: TechnicalIssue[] = [];
    const recommendations: SEORecommendation[] = [];

    // Generate issues based on performance
    if (coreWebVitals.lcp > 2500) {
      issues.push({
        type: 'performance',
        severity: 'high',
        description: 'Largest Contentful Paint is too slow',
        affectedUrls: [url],
        solution: 'Optimize images, reduce server response time, eliminate render-blocking resources',
        aiImpact: true,
      });

      recommendations.push({
        category: 'technical',
        priority: 'high',
        title: 'Optimize Largest Contentful Paint',
        description: 'Reduce LCP to under 2.5 seconds for better user experience and AI crawling',
        expectedImpact: 'Improved page rankings and AI visibility',
        effort: 'medium',
        aiRelevant: true,
      });
    }

    if (coreWebVitals.cls > 0.1) {
      issues.push({
        type: 'performance',
        severity: 'medium',
        description: 'Cumulative Layout Shift exceeds recommended threshold',
        affectedUrls: [url],
        solution: 'Add size attributes to images, reserve space for ads, avoid inserting content above existing content',
        aiImpact: true,
      });
    }

    const optimizations = {
      images: await this.analyzeImages(url),
      css: this.analyzeCSSOptimizations(url),
      javascript: this.analyzeJSOptimizations(url),
      fonts: this.analyzeFontOptimizations(url),
    };

    const result: PerformanceAuditResult = {
      score: coreWebVitals.score,
      coreWebVitals,
      issues,
      recommendations,
      optimizations,
    };

    this.performanceData.set(url, result);
    return result;
  }

  async optimizeImages(images: string[]): Promise<ImageOptimization[]> {
    return images.map((src, index) => ({
      src,
      alt: `Imagen optimizada ${index + 1} - SoftCrown desarrollo web España`,
      title: `SoftCrown - Desarrollo web profesional`,
      caption: `Ejemplo de trabajo de SoftCrown`,
      aiDescription: `Imagen que muestra el trabajo profesional de SoftCrown en desarrollo web en España`,
      lazyLoaded: true,
      webpFormat: true,
      dimensions: {
        width: 800,
        height: 600,
      },
      fileSize: Math.floor(Math.random() * 100000) + 50000, // 50-150KB
    }));
  }

  // Content Optimization
  async analyzeContent(url: string, content: string, targetKeywords: string[]): Promise<ContentAnalysisResult> {
    const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;

    // Calculate keyword density
    const keywordDensity: Record<string, number> = {};
    targetKeywords.forEach(keyword => {
      const keywordCount = words.filter(word => 
        word.includes(keyword.toLowerCase()) || 
        keyword.toLowerCase().includes(word)
      ).length;
      keywordDensity[keyword] = (keywordCount / totalWords) * 100;
    });

    // Analyze heading structure
    const headingStructure = this.extractHeadings(content);

    // Analyze internal links
    const internalLinks = this.extractInternalLinks(content);

    // Calculate readability score (simplified)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgWordsPerSentence = totalWords / sentences.length;
    let readabilityScore = 100;
    if (avgWordsPerSentence > 20) readabilityScore -= 20;
    if (avgWordsPerSentence > 30) readabilityScore -= 40;

    // Generate issues and recommendations
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check keyword density
    Object.entries(keywordDensity).forEach(([keyword, density]) => {
      if (density < 0.5) {
        issues.push(`Baja densidad de "${keyword}" (${density.toFixed(1)}%)`);
        recommendations.push(`Aumentar menciones de "${keyword}" de forma natural`);
      }
      if (density > 3) {
        issues.push(`Alta densidad de "${keyword}" (${density.toFixed(1)}%)`);
        recommendations.push(`Reducir repeticiones de "${keyword}" para evitar sobreoptimización`);
      }
    });

    // Check content length
    if (totalWords < 300) {
      issues.push('Contenido demasiado corto para SEO efectivo');
      recommendations.push('Ampliar contenido a al menos 300 palabras');
    }

    // Check heading structure
    const h1Count = headingStructure.filter(h => h.level === 1).length;
    if (h1Count === 0) {
      issues.push('Falta etiqueta H1');
      recommendations.push('Añadir una etiqueta H1 con keyword principal');
    }
    if (h1Count > 1) {
      issues.push('Múltiples etiquetas H1');
      recommendations.push('Usar solo una etiqueta H1 por página');
    }

    const result: ContentAnalysisResult = {
      keywordDensity,
      readabilityScore,
      contentLength: totalWords,
      headingStructure,
      internalLinks,
      issues,
      recommendations,
    };

    this.contentAnalysis.set(url, result);
    return result;
  }

  // Sitemap Generation
  async generateSitemap(): Promise<SitemapEntry[]> {
    const pages = [
      {
        url: 'https://softcrown.es/',
        priority: 1.0,
        changeFrequency: 'weekly' as const,
        aiImportance: 1.0,
      },
      {
        url: 'https://softcrown.es/servicios',
        priority: 0.9,
        changeFrequency: 'weekly' as const,
        aiImportance: 0.9,
      },
      {
        url: 'https://softcrown.es/servicios/desarrollo-web-basico',
        priority: 0.8,
        changeFrequency: 'monthly' as const,
        aiImportance: 0.8,
      },
      {
        url: 'https://softcrown.es/servicios/ecommerce',
        priority: 0.8,
        changeFrequency: 'monthly' as const,
        aiImportance: 0.8,
      },
      {
        url: 'https://softcrown.es/servicios/mantenimiento',
        priority: 0.7,
        changeFrequency: 'monthly' as const,
        aiImportance: 0.7,
      },
      {
        url: 'https://softcrown.es/precios',
        priority: 0.8,
        changeFrequency: 'monthly' as const,
        aiImportance: 0.9, // High AI importance for pricing info
      },
      {
        url: 'https://softcrown.es/contacto',
        priority: 0.7,
        changeFrequency: 'yearly' as const,
        aiImportance: 0.8,
      },
      {
        url: 'https://softcrown.es/sobre-nosotros',
        priority: 0.6,
        changeFrequency: 'yearly' as const,
        aiImportance: 0.7,
      },
      {
        url: 'https://softcrown.es/blog',
        priority: 0.7,
        changeFrequency: 'weekly' as const,
        aiImportance: 0.6,
      },
      {
        url: 'https://softcrown.es/portfolio',
        priority: 0.6,
        changeFrequency: 'monthly' as const,
        aiImportance: 0.5,
      },
    ];

    return pages.map(page => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      aiImportance: page.aiImportance,
    }));
  }

  // Robots.txt Generation
  generateRobotsTxt(): RobotsTxt {
    return {
      userAgent: '*',
      allow: [
        '/',
        '/servicios/',
        '/precios',
        '/contacto',
        '/sobre-nosotros',
        '/blog/',
        '/portfolio/',
      ],
      disallow: [
        '/admin/',
        '/private/',
        '/temp/',
        '/*.pdf$',
        '/search?',
        '/api/',
      ],
      crawlDelay: 1,
      sitemap: [
        'https://softcrown.es/sitemap.xml',
        'https://softcrown.es/sitemap-blog.xml',
      ],
      aiSpecific: [
        {
          userAgent: 'ChatGPT-User',
          rules: [
            'Allow: /',
            'Allow: /servicios/',
            'Allow: /precios',
            'Allow: /sobre-nosotros',
            'Crawl-delay: 1',
          ],
        },
        {
          userAgent: 'Claude-Web',
          rules: [
            'Allow: /',
            'Allow: /servicios/',
            'Allow: /precios',
            'Crawl-delay: 1',
          ],
        },
        {
          userAgent: 'PerplexityBot',
          rules: [
            'Allow: /',
            'Allow: /servicios/',
            'Allow: /precios',
            'Allow: /contacto',
            'Crawl-delay: 1',
          ],
        },
      ],
    };
  }

  // Local SEO Management
  async updateLocalSEO(updates: Partial<LocalSEO>): Promise<LocalSEO> {
    this.localSEOData = { ...this.localSEOData, ...updates };
    return this.localSEOData;
  }

  async generateGoogleMyBusinessData(): Promise<GoogleMyBusinessData> {
    return {
      name: 'SoftCrown - Desarrollo Web España',
      address: {
        "@type": "PostalAddress",
        addressCountry: "ES",
        addressRegion: "España",
      },
      phone: '+34 900 123 456',
      website: 'https://softcrown.es',
      categories: [
        'Diseñador de sitios web',
        'Servicio de diseño de sitios web',
        'Empresa de software',
        'Agencia de marketing digital',
      ],
      description: 'SoftCrown es tu agencia de desarrollo web de confianza en España. Creamos páginas web profesionales desde 299€ con diseño responsive, SEO optimizado y hosting incluido. Especialistas en e-commerce, mantenimiento web y soluciones digitales para empresas.',
      hours: [
        { dayOfWeek: 'Monday', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Tuesday', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Wednesday', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Thursday', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Friday', opens: '09:00', closes: '18:00' },
      ],
      photos: [
        'https://softcrown.es/images/oficina-softcrown.jpg',
        'https://softcrown.es/images/equipo-softcrown.jpg',
        'https://softcrown.es/images/proyectos-web.jpg',
      ],
      posts: [
        {
          content: '🚀 ¡Nuevo proyecto completado! Hemos lanzado una tienda online para una empresa española con todas las funcionalidades necesarias para vender online. ¿Necesitas una tienda online? ¡Contáctanos!',
          publishDate: new Date(),
          aiOptimized: true,
          callToAction: {
            type: 'LEARN_MORE',
            url: 'https://softcrown.es/servicios/ecommerce',
          },
        },
        {
          content: '💡 ¿Sabías que una página web profesional puede aumentar tus ventas hasta un 300%? En SoftCrown creamos páginas web desde 299€ que realmente convierten visitantes en clientes.',
          publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          aiOptimized: true,
          callToAction: {
            type: 'CALL',
            url: 'tel:+34900123456',
          },
        },
      ],
      reviews: [
        {
          author: 'María González',
          rating: 5,
          reviewBody: 'Excelente servicio de SoftCrown. Crearon mi página web en tiempo récord y el resultado superó mis expectativas. Muy profesionales y precios muy competitivos.',
          datePublished: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          platform: 'Google',
          verified: true,
        },
        {
          author: 'Carlos Martín',
          rating: 5,
          reviewBody: 'Contraté a SoftCrown para mi tienda online y no puedo estar más contento. El equipo es muy profesional y el soporte post-venta es excelente. 100% recomendable.',
          datePublished: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          platform: 'Google',
          verified: true,
        },
      ],
      insights: {
        views: 1250,
        searches: 890,
        actions: 156,
        period: 'last_month',
      },
    };
  }

  // Internal Linking Optimization
  async optimizeInternalLinking(pages: string[]): Promise<InternalLink[]> {
    const internalLinks: InternalLink[] = [
      {
        url: '/servicios/desarrollo-web-basico',
        anchorText: 'desarrollo web profesional desde 299€',
        context: 'Ofrecemos desarrollo web profesional desde 299€ con todas las características necesarias',
        aiRelevant: true,
        targetKeywords: ['desarrollo web', 'precio', '299€'],
      },
      {
        url: '/servicios/ecommerce',
        anchorText: 'tienda online completa',
        context: 'Crea tu tienda online completa con todas las funcionalidades de e-commerce',
        aiRelevant: true,
        targetKeywords: ['tienda online', 'e-commerce', 'venta online'],
      },
      {
        url: '/servicios/mantenimiento',
        anchorText: 'mantenimiento web desde 49€/mes',
        context: 'Nuestro servicio de mantenimiento web desde 49€/mes mantiene tu web siempre actualizada',
        aiRelevant: true,
        targetKeywords: ['mantenimiento web', 'precio', '49€'],
      },
      {
        url: '/precios',
        anchorText: 'consulta nuestros precios',
        context: 'Para más información sobre costes, consulta nuestros precios transparentes',
        aiRelevant: true,
        targetKeywords: ['precios', 'presupuesto', 'coste'],
      },
      {
        url: '/contacto',
        anchorText: 'solicita presupuesto gratis',
        context: 'Solicita presupuesto gratis sin compromiso para tu proyecto web',
        aiRelevant: true,
        targetKeywords: ['presupuesto', 'gratis', 'contacto'],
      },
    ];

    return internalLinks;
  }

  // Critical CSS Generation
  generateCriticalCSS(url: string): string {
    return `
/* Critical CSS for ${url} - SoftCrown */
body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
.header { background: #1a1a1a; color: white; padding: 1rem; }
.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 2rem; text-align: center; }
.hero h1 { font-size: 2.5rem; margin-bottom: 1rem; }
.hero p { font-size: 1.2rem; margin-bottom: 2rem; }
.cta-button { background: #ff6b6b; color: white; padding: 1rem 2rem; border: none; border-radius: 5px; font-size: 1.1rem; cursor: pointer; }
.services-preview { padding: 2rem; }
.service-card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    `.trim();
  }

  // AMP Page Generation
  generateAMPVersion(content: string, metadata: any): string {
    return `
<!doctype html>
<html ⚡>
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <title>${metadata.title}</title>
  <link rel="canonical" href="${metadata.canonicalUrl}">
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <meta name="description" content="${metadata.description}">
  <meta name="ai-purpose" content="${metadata.aiPurpose}">
  <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style><noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
  <style amp-custom>
    body { font-family: 'Roboto', sans-serif; margin: 0; padding: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
    .header { background: #1a1a1a; color: white; padding: 1rem 0; }
    .hero { background: #667eea; color: white; padding: 3rem 0; text-align: center; }
    .content { padding: 2rem 0; }
    .service-card { background: #f9f9f9; padding: 1.5rem; margin-bottom: 1rem; border-radius: 8px; }
    .price { font-size: 1.5rem; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <header class="header">
    <div class="container">
      <h1>SoftCrown - Desarrollo Web España</h1>
    </div>
  </header>
  
  <section class="hero">
    <div class="container">
      <h1>Desarrollo Web Profesional desde 299€</h1>
      <p>Páginas web, tiendas online y mantenimiento en España</p>
    </div>
  </section>
  
  <main class="content">
    <div class="container">
      ${content}
    </div>
  </main>
</body>
</html>
    `.trim();
  }

  // Private helper methods
  private async analyzeImages(url: string): Promise<ImageOptimization[]> {
    // Mock image analysis
    const mockImages = [
      'hero-softcrown.jpg',
      'servicios-web.jpg',
      'equipo-desarrollo.jpg',
      'portfolio-ejemplo.jpg',
    ];

    return mockImages.map((filename, index) => ({
      src: `/images/${filename}`,
      alt: `SoftCrown desarrollo web España - ${filename.replace('.jpg', '')}`,
      title: 'SoftCrown - Desarrollo web profesional',
      aiDescription: `Imagen profesional de SoftCrown mostrando ${filename.replace('.jpg', '').replace('-', ' ')}`,
      lazyLoaded: true,
      webpFormat: true,
      dimensions: { width: 800, height: 600 },
      fileSize: Math.floor(Math.random() * 100000) + 50000,
    }));
  }

  private analyzeCSSOptimizations(url: string): string[] {
    return [
      'Minificar CSS principal',
      'Eliminar CSS no utilizado',
      'Inline critical CSS',
      'Usar CSS Grid en lugar de Flexbox para layouts complejos',
      'Optimizar selectores CSS',
    ];
  }

  private analyzeJSOptimizations(url: string): string[] {
    return [
      'Minificar JavaScript',
      'Eliminar código JavaScript no utilizado',
      'Implementar lazy loading para scripts no críticos',
      'Usar Web Workers para procesamiento pesado',
      'Optimizar event listeners',
    ];
  }

  private analyzeFontOptimizations(url: string): string[] {
    return [
      'Preload fuentes críticas',
      'Usar font-display: swap',
      'Optimizar subset de fuentes',
      'Implementar fallback fonts',
      'Considerar fuentes del sistema',
    ];
  }

  private extractHeadings(content: string): Array<{ level: number; text: string; keywords: string[] }> {
    const headings = [];
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = parseInt(match[1]);
      const text = match[2].replace(/<[^>]*>/g, '').trim();
      const keywords = this.extractKeywordsFromText(text);
      
      headings.push({ level, text, keywords });
    }

    return headings;
  }

  private extractInternalLinks(content: string): InternalLink[] {
    const links = [];
    const linkRegex = /<a[^>]*href=["']([^"']*softcrown[^"']*)["'][^>]*>(.*?)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      const url = match[1];
      const anchorText = match[2].replace(/<[^>]*>/g, '').trim();
      
      links.push({
        url,
        anchorText,
        context: this.extractLinkContext(content, match.index),
        aiRelevant: this.isAIRelevantLink(anchorText),
        targetKeywords: this.extractKeywordsFromText(anchorText),
      });
    }

    return links;
  }

  private extractKeywordsFromText(text: string): string[] {
    const keywords = [];
    const importantWords = ['desarrollo', 'web', 'diseño', 'tienda', 'online', 'mantenimiento', 'SEO', 'España', 'profesional', 'lowcost'];
    
    importantWords.forEach(word => {
      if (text.toLowerCase().includes(word.toLowerCase())) {
        keywords.push(word);
      }
    });

    return keywords;
  }

  private extractLinkContext(content: string, linkIndex: number): string {
    const start = Math.max(0, linkIndex - 100);
    const end = Math.min(content.length, linkIndex + 100);
    return content.substring(start, end).replace(/<[^>]*>/g, '').trim();
  }

  private isAIRelevantLink(anchorText: string): boolean {
    const aiRelevantTerms = ['precio', 'servicio', 'contacto', 'presupuesto', 'desarrollo', 'web', 'tienda', 'mantenimiento'];
    return aiRelevantTerms.some(term => anchorText.toLowerCase().includes(term));
  }

  private initializeLocalSEO(): void {
    this.localSEOData = {
      businessName: 'SoftCrown - Desarrollo Web España',
      address: {
        "@type": "PostalAddress",
        addressCountry: "ES",
        addressRegion: "España",
      },
      phone: '+34 900 123 456',
      website: 'https://softcrown.es',
      categories: ['Desarrollo Web', 'Diseño Web', 'E-commerce', 'SEO', 'Mantenimiento Web'],
      description: 'SoftCrown es tu agencia de desarrollo web de confianza en España. Creamos páginas web profesionales desde 299€ con diseño responsive, SEO optimizado y hosting incluido.',
      hours: [
        { dayOfWeek: 'Lunes', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Martes', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Miércoles', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Jueves', opens: '09:00', closes: '18:00' },
        { dayOfWeek: 'Viernes', opens: '09:00', closes: '18:00' },
      ],
      reviews: [],
      photos: [
        'https://softcrown.es/images/oficina.jpg',
        'https://softcrown.es/images/equipo.jpg',
        'https://softcrown.es/images/proyectos.jpg',
      ],
      localKeywords: [
        'desarrollo web España',
        'diseño web español',
        'agencia web España',
        'páginas web lowcost España',
        'tienda online España',
      ],
      serviceAreas: ['España', 'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao'],
    };
  }
}

// Export singleton instance
export const technicalSeoService = new TechnicalSEOService();
