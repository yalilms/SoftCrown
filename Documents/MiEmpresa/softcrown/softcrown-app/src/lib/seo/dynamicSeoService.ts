// Dynamic SEO and Meta Tags Service
import { Metadata } from 'next';

export interface DynamicMetadata {
  title: string;
  description: string;
  keywords: string[];
  openGraph: OpenGraphData;
  twitter: TwitterData;
  structuredData: StructuredData[];
  canonical: string;
  alternates?: AlternateLanguages;
  robots: RobotsConfig;
}

export interface OpenGraphData {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: OpenGraphImage[];
  type: 'website' | 'article' | 'product' | 'service';
  locale: string;
  alternateLocale?: string[];
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
  type?: string;
}

export interface TwitterData {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  site: string;
  creator: string;
  title: string;
  description: string;
  images: string[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

export interface AlternateLanguages {
  canonical: string;
  languages: Record<string, string>;
}

export interface RobotsConfig {
  index: boolean;
  follow: boolean;
  googleBot?: {
    index: boolean;
    follow: boolean;
    'max-video-preview': number;
    'max-image-preview': 'large' | 'standard' | 'none';
    'max-snippet': number;
  };
}

export interface SitemapEntry {
  url: string;
  lastModified: Date;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: Record<string, string>;
}

export class DynamicSEOService {
  private baseUrl = 'https://softcrown.es';
  private siteName = 'SoftCrown - Desarrollo Web España';
  private defaultImage = '/images/og-default.jpg';

  // Generate metadata for different page types
  async generateMetadata(
    pageType: 'home' | 'service' | 'product' | 'blog' | 'contact' | 'about',
    data?: any
  ): Promise<Metadata> {
    switch (pageType) {
      case 'home':
        return this.getHomeMetadata();
      case 'service':
        return this.getServiceMetadata(data);
      case 'product':
        return this.getProductMetadata(data);
      case 'blog':
        return this.getBlogMetadata(data);
      case 'contact':
        return this.getContactMetadata();
      case 'about':
        return this.getAboutMetadata();
      default:
        return this.getDefaultMetadata();
    }
  }

  // Home page metadata
  private getHomeMetadata(): Metadata {
    return {
      title: 'SoftCrown - Desarrollo Web Profesional desde 299€ | España',
      description: 'Creamos páginas web profesionales desde 299€ con diseño responsive, SEO optimizado y hosting incluido. Especialistas en desarrollo web, e-commerce y mantenimiento en España.',
      keywords: [
        'desarrollo web España',
        'páginas web baratas',
        'diseño web profesional',
        'desarrollo web lowcost',
        'agencia web España',
        'páginas web desde 299€',
        'desarrollo web Madrid',
        'diseño responsive',
        'SEO optimizado'
      ],
      authors: [{ name: 'SoftCrown Team' }],
      creator: 'SoftCrown',
      publisher: 'SoftCrown',
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(this.baseUrl),
      alternates: {
        canonical: '/',
        languages: {
          'es-ES': '/',
          'en-US': '/en',
        },
      },
      openGraph: {
        title: 'SoftCrown - Desarrollo Web Profesional desde 299€',
        description: 'Creamos páginas web profesionales con diseño moderno, SEO optimizado y hosting incluido. Tu presencia digital profesional desde 299€.',
        url: this.baseUrl,
        siteName: this.siteName,
        images: [
          {
            url: '/images/og-home.jpg',
            width: 1200,
            height: 630,
            alt: 'SoftCrown - Desarrollo Web Profesional España',
          },
        ],
        locale: 'es_ES',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SoftCrown - Desarrollo Web desde 299€',
        description: 'Páginas web profesionales con diseño moderno y SEO optimizado. ¡Solicita tu presupuesto gratis!',
        site: '@softcrown_es',
        creator: '@softcrown_es',
        images: ['/images/twitter-home.jpg'],
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      verification: {
        google: 'your-google-verification-code',
        yandex: 'your-yandex-verification-code',
        yahoo: 'your-yahoo-verification-code',
      },
    };
  }

  // Service page metadata
  private getServiceMetadata(service: any): Metadata {
    const serviceName = service?.name || 'Servicios de Desarrollo Web';
    const serviceDescription = service?.description || 'Servicios profesionales de desarrollo web';
    const servicePrice = service?.price || 'Consultar precio';

    return {
      title: `${serviceName} - SoftCrown | Desarrollo Web España`,
      description: `${serviceDescription}. Precio desde ${servicePrice}. Diseño profesional, SEO optimizado y soporte técnico incluido.`,
      keywords: [
        serviceName.toLowerCase(),
        'desarrollo web',
        'diseño web',
        'España',
        'profesional',
        'SEO optimizado',
        servicePrice.toString(),
      ],
      openGraph: {
        title: `${serviceName} - SoftCrown`,
        description: serviceDescription,
        url: `${this.baseUrl}/servicios/${service?.slug || ''}`,
        siteName: this.siteName,
        images: [
          {
            url: service?.image || '/images/og-service.jpg',
            width: 1200,
            height: 630,
            alt: `${serviceName} - SoftCrown`,
          },
        ],
        type: 'service',
        locale: 'es_ES',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${serviceName} - SoftCrown`,
        description: `${serviceDescription} desde ${servicePrice}`,
        site: '@softcrown_es',
        images: [service?.image || '/images/twitter-service.jpg'],
      },
    };
  }

  // Product page metadata
  private getProductMetadata(product: any): Metadata {
    const productName = product?.name || 'Producto';
    const productDescription = product?.description || 'Producto de desarrollo web';
    const productPrice = product?.price || 0;

    return {
      title: `${productName} - ${productPrice}€ | SoftCrown`,
      description: `${productDescription}. Precio: ${productPrice}€. Incluye diseño profesional, desarrollo responsive y soporte técnico.`,
      keywords: [
        productName.toLowerCase(),
        'comprar',
        'precio',
        productPrice.toString() + '€',
        'desarrollo web',
        'España',
      ],
      openGraph: {
        title: `${productName} - ${productPrice}€`,
        description: productDescription,
        url: `${this.baseUrl}/tienda/${product?.slug || ''}`,
        siteName: this.siteName,
        images: [
          {
            url: product?.image || '/images/og-product.jpg',
            width: 1200,
            height: 630,
            alt: productName,
          },
        ],
        type: 'product',
        locale: 'es_ES',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} - ${productPrice}€`,
        description: `${productDescription} | Comprar ahora por ${productPrice}€`,
        site: '@softcrown_es',
        images: [product?.image || '/images/twitter-product.jpg'],
      },
    };
  }

  // Blog post metadata
  private getBlogMetadata(post: any): Metadata {
    const postTitle = post?.title || 'Blog Post';
    const postDescription = post?.excerpt || 'Artículo del blog de SoftCrown';
    const postDate = post?.publishedAt || new Date();
    const author = post?.author || 'SoftCrown Team';

    return {
      title: `${postTitle} | Blog SoftCrown`,
      description: postDescription,
      keywords: post?.tags || ['desarrollo web', 'blog', 'España'],
      authors: [{ name: author }],
      publishedTime: postDate.toISOString(),
      openGraph: {
        title: postTitle,
        description: postDescription,
        url: `${this.baseUrl}/blog/${post?.slug || ''}`,
        siteName: this.siteName,
        images: [
          {
            url: post?.featuredImage || '/images/og-blog.jpg',
            width: 1200,
            height: 630,
            alt: postTitle,
          },
        ],
        type: 'article',
        locale: 'es_ES',
        publishedTime: postDate.toISOString(),
        authors: [author],
      },
      twitter: {
        card: 'summary_large_image',
        title: postTitle,
        description: postDescription,
        site: '@softcrown_es',
        creator: '@softcrown_es',
        images: [post?.featuredImage || '/images/twitter-blog.jpg'],
      },
    };
  }

  // Contact page metadata
  private getContactMetadata(): Metadata {
    return {
      title: 'Contacto - SoftCrown | Solicita tu Presupuesto Gratis',
      description: 'Contacta con SoftCrown para solicitar tu presupuesto gratuito de desarrollo web. Teléfono, email y formulario de contacto disponibles.',
      keywords: [
        'contacto SoftCrown',
        'presupuesto gratis',
        'solicitar presupuesto',
        'desarrollo web España',
        'contactar agencia web',
      ],
      openGraph: {
        title: 'Contacto - SoftCrown',
        description: 'Solicita tu presupuesto gratuito de desarrollo web. Te respondemos en menos de 24 horas.',
        url: `${this.baseUrl}/contacto`,
        siteName: this.siteName,
        images: [
          {
            url: '/images/og-contact.jpg',
            width: 1200,
            height: 630,
            alt: 'Contacto SoftCrown - Presupuesto Gratis',
          },
        ],
        type: 'website',
        locale: 'es_ES',
      },
      twitter: {
        card: 'summary',
        title: 'Contacto - SoftCrown',
        description: 'Solicita tu presupuesto gratuito de desarrollo web',
        site: '@softcrown_es',
      },
    };
  }

  // About page metadata
  private getAboutMetadata(): Metadata {
    return {
      title: 'Sobre Nosotros - SoftCrown | Agencia de Desarrollo Web España',
      description: 'Conoce el equipo de SoftCrown, tu agencia de desarrollo web de confianza en España. Más de 100 proyectos completados y clientes satisfechos.',
      keywords: [
        'sobre SoftCrown',
        'equipo desarrollo web',
        'agencia web España',
        'quiénes somos',
        'experiencia desarrollo web',
      ],
      openGraph: {
        title: 'Sobre Nosotros - SoftCrown',
        description: 'Conoce al equipo detrás de SoftCrown, tu agencia de desarrollo web de confianza en España.',
        url: `${this.baseUrl}/sobre-nosotros`,
        siteName: this.siteName,
        images: [
          {
            url: '/images/og-about.jpg',
            width: 1200,
            height: 630,
            alt: 'Equipo SoftCrown - Desarrollo Web España',
          },
        ],
        type: 'website',
        locale: 'es_ES',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Sobre Nosotros - SoftCrown',
        description: 'Conoce al equipo de desarrollo web más profesional de España',
        site: '@softcrown_es',
        images: ['/images/twitter-about.jpg'],
      },
    };
  }

  // Default metadata fallback
  private getDefaultMetadata(): Metadata {
    return {
      title: 'SoftCrown - Desarrollo Web Profesional España',
      description: 'Agencia de desarrollo web profesional en España. Páginas web, tiendas online y mantenimiento web.',
      openGraph: {
        title: 'SoftCrown - Desarrollo Web España',
        description: 'Desarrollo web profesional en España',
        url: this.baseUrl,
        siteName: this.siteName,
        images: [
          {
            url: this.defaultImage,
            width: 1200,
            height: 630,
            alt: 'SoftCrown - Desarrollo Web',
          },
        ],
        type: 'website',
        locale: 'es_ES',
      },
    };
  }

  // Generate structured data
  generateStructuredData(type: string, data?: any): StructuredData[] {
    switch (type) {
      case 'organization':
        return [this.getOrganizationSchema()];
      case 'website':
        return [this.getWebsiteSchema()];
      case 'service':
        return [this.getServiceSchema(data)];
      case 'product':
        return [this.getProductSchema(data)];
      case 'article':
        return [this.getArticleSchema(data)];
      case 'faq':
        return [this.getFAQSchema(data)];
      case 'breadcrumb':
        return [this.getBreadcrumbSchema(data)];
      default:
        return [this.getOrganizationSchema(), this.getWebsiteSchema()];
    }
  }

  // Organization schema
  private getOrganizationSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SoftCrown',
      alternateName: 'SoftCrown España',
      url: this.baseUrl,
      logo: `${this.baseUrl}/images/logo.png`,
      description: 'Agencia de desarrollo web profesional en España especializada en páginas web, e-commerce y mantenimiento web.',
      foundingDate: '2020',
      founders: [
        {
          '@type': 'Person',
          name: 'Equipo SoftCrown',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'ES',
        addressRegion: 'España',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+34-900-123-456',
        contactType: 'customer service',
        availableLanguage: ['Spanish', 'English'],
        areaServed: 'ES',
      },
      sameAs: [
        'https://www.facebook.com/softcrown',
        'https://www.twitter.com/softcrown_es',
        'https://www.linkedin.com/company/softcrown',
        'https://www.instagram.com/softcrown_es',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios de Desarrollo Web',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Desarrollo Web Básico',
              description: 'Página web profesional desde 299€',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Tienda Online',
              description: 'E-commerce completo desde 899€',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Mantenimiento Web',
              description: 'Mantenimiento mensual desde 49€',
            },
          },
        ],
      },
    };
  }

  // Website schema
  private getWebsiteSchema(): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: 'Desarrollo web profesional en España desde 299€',
      publisher: {
        '@type': 'Organization',
        name: 'SoftCrown',
      },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/buscar?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'es-ES',
    };
  }

  // Service schema
  private getServiceSchema(service: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service?.name || 'Servicio de Desarrollo Web',
      description: service?.description || 'Servicio profesional de desarrollo web',
      provider: {
        '@type': 'Organization',
        name: 'SoftCrown',
        url: this.baseUrl,
      },
      areaServed: {
        '@type': 'Country',
        name: 'España',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: service?.name,
        itemListElement: [
          {
            '@type': 'Offer',
            price: service?.price || '299',
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            validFrom: new Date().toISOString(),
          },
        ],
      },
      category: 'Web Development',
      serviceType: 'Professional Web Development',
    };
  }

  // Product schema
  private getProductSchema(product: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product?.name || 'Producto Web',
      description: product?.description || 'Producto de desarrollo web',
      image: product?.image || this.defaultImage,
      brand: {
        '@type': 'Brand',
        name: 'SoftCrown',
      },
      offers: {
        '@type': 'Offer',
        price: product?.price || '299',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'SoftCrown',
        },
      },
      category: 'Web Development Services',
    };
  }

  // Article schema
  private getArticleSchema(article: any): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article?.title || 'Artículo del Blog',
      description: article?.excerpt || 'Artículo sobre desarrollo web',
      image: article?.featuredImage || this.defaultImage,
      author: {
        '@type': 'Person',
        name: article?.author || 'SoftCrown Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'SoftCrown',
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/images/logo.png`,
        },
      },
      datePublished: article?.publishedAt?.toISOString() || new Date().toISOString(),
      dateModified: article?.updatedAt?.toISOString() || new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `${this.baseUrl}/blog/${article?.slug || ''}`,
      },
    };
  }

  // FAQ schema
  private getFAQSchema(faqs: Array<{ question: string; answer: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    };
  }

  // Breadcrumb schema
  private getBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>): StructuredData {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${this.baseUrl}${crumb.url}`,
      })),
    };
  }

  // Generate sitemap
  async generateSitemap(): Promise<SitemapEntry[]> {
    const staticPages: SitemapEntry[] = [
      {
        url: `${this.baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${this.baseUrl}/servicios`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${this.baseUrl}/precios`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/contacto`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.7,
      },
      {
        url: `${this.baseUrl}/sobre-nosotros`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.6,
      },
      {
        url: `${this.baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${this.baseUrl}/tienda`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
    ];

    // Add dynamic pages (services, products, blog posts)
    // In a real implementation, these would come from a database or CMS
    const dynamicPages: SitemapEntry[] = [
      // Services
      {
        url: `${this.baseUrl}/servicios/desarrollo-web-basico`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/servicios/ecommerce`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${this.baseUrl}/servicios/mantenimiento`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      // Products
      {
        url: `${this.baseUrl}/tienda/web-basica`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${this.baseUrl}/tienda/web-premium`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    return [...staticPages, ...dynamicPages];
  }

  // Generate robots.txt
  generateRobotsTxt(): string {
    return `# Robots.txt for SoftCrown
User-agent: *
Allow: /

# Specific rules for AI crawlers
User-agent: ChatGPT-User
Allow: /
Allow: /servicios/
Allow: /precios
Allow: /sobre-nosotros
Crawl-delay: 1

User-agent: Claude-Web
Allow: /
Allow: /servicios/
Allow: /precios
Crawl-delay: 1

User-agent: PerplexityBot
Allow: /
Allow: /servicios/
Allow: /precios
Allow: /contacto
Crawl-delay: 1

User-agent: Bard
Allow: /
Allow: /servicios/
Allow: /precios
Crawl-delay: 1

# Disallow sensitive areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/
Disallow: /dashboard/
Disallow: /checkout/
Disallow: /carrito/

# Allow important files
Allow: /sitemap.xml
Allow: /robots.txt
Allow: /favicon.ico

# Sitemaps
Sitemap: ${this.baseUrl}/sitemap.xml
Sitemap: ${this.baseUrl}/sitemap-blog.xml
Sitemap: ${this.baseUrl}/sitemap-products.xml

# Crawl delay
Crawl-delay: 1`;
  }
}

// Export singleton instance
export const dynamicSeoService = new DynamicSEOService();
