import { Product, ProductPackage, MaintenancePlan } from '@/types/ecommerce';

// Mock Products Data
export const mockProducts: Product[] = [
  // Web Development Services
  {
    id: 'web-basic',
    name: 'Sitio Web Básico',
    description: 'Sitio web profesional de hasta 5 páginas con diseño responsive y optimización SEO básica. Perfecto para pequeñas empresas que necesitan presencia online.',
    shortDescription: 'Sitio web profesional de hasta 5 páginas',
    price: 899,
    originalPrice: 1199,
    type: 'service',
    category: 'Desarrollo Web',
    subcategory: 'Sitios Corporativos',
    deliveryTime: '7-10 días',
    features: [
      'Hasta 5 páginas',
      'Diseño responsive',
      'Optimización SEO básica',
      'Formulario de contacto',
      'Integración redes sociales',
      'Google Analytics',
      'Certificado SSL',
      '1 mes de soporte gratis'
    ],
    isRecurring: false,
    isPopular: true,
    isFeatured: false,
    images: ['/images/products/web-basic-1.jpg', '/images/products/web-basic-2.jpg'],
    tags: ['web', 'básico', 'responsive', 'seo'],
    requirements: [
      'Contenido y textos preparados',
      'Logo en formato vectorial',
      'Imágenes en alta calidad'
    ],
    deliverables: [
      'Sitio web completo',
      'Panel de administración',
      'Manual de uso',
      'Archivos fuente'
    ],
    revisions: 3,
    supportIncluded: true,
    complexity: 'basic',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: 'web-premium',
    name: 'Sitio Web Premium',
    description: 'Sitio web avanzado con hasta 15 páginas, funcionalidades personalizadas, blog integrado y optimización SEO avanzada. Ideal para empresas en crecimiento.',
    shortDescription: 'Sitio web avanzado con funcionalidades personalizadas',
    price: 2499,
    originalPrice: 2999,
    type: 'service',
    category: 'Desarrollo Web',
    subcategory: 'Sitios Corporativos',
    deliveryTime: '15-20 días',
    features: [
      'Hasta 15 páginas',
      'Diseño personalizado',
      'Blog integrado',
      'Sistema de gestión de contenido',
      'Optimización SEO avanzada',
      'Integración con CRM',
      'Chat en vivo',
      'Analytics avanzados',
      '3 meses de soporte gratis'
    ],
    isRecurring: false,
    isPopular: false,
    isFeatured: true,
    images: ['/images/products/web-premium-1.jpg', '/images/products/web-premium-2.jpg'],
    tags: ['web', 'premium', 'personalizado', 'blog', 'crm'],
    requirements: [
      'Brief detallado del proyecto',
      'Contenido y textos preparados',
      'Logo y manual de marca',
      'Imágenes profesionales'
    ],
    deliverables: [
      'Sitio web completo',
      'Panel de administración avanzado',
      'Blog con sistema de comentarios',
      'Integración CRM',
      'Manual completo',
      'Archivos fuente'
    ],
    revisions: 5,
    supportIncluded: true,
    complexity: 'premium',
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: 'ecommerce-basic',
    name: 'Tienda Online Básica',
    description: 'Tienda online completa con hasta 50 productos, carrito de compras, pasarela de pago y panel de administración. Perfecta para empezar a vender online.',
    shortDescription: 'Tienda online completa hasta 50 productos',
    price: 1899,
    type: 'service',
    category: 'E-commerce',
    subcategory: 'Tiendas Online',
    deliveryTime: '12-15 días',
    features: [
      'Hasta 50 productos',
      'Carrito de compras',
      'Pasarela de pago (Stripe/PayPal)',
      'Gestión de inventario',
      'Panel de administración',
      'Diseño responsive',
      'SEO optimizado',
      'Certificado SSL',
      '2 meses de soporte'
    ],
    isRecurring: false,
    isPopular: true,
    isFeatured: false,
    images: ['/images/products/ecommerce-basic-1.jpg'],
    tags: ['ecommerce', 'tienda', 'online', 'pagos'],
    requirements: [
      'Catálogo de productos',
      'Información de envíos',
      'Términos y condiciones',
      'Política de privacidad'
    ],
    deliverables: [
      'Tienda online completa',
      'Panel de administración',
      'Configuración de pagos',
      'Manual de gestión',
      'Archivos fuente'
    ],
    revisions: 4,
    supportIncluded: true,
    complexity: 'standard',
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-07-20'),
  },
  // Design Services
  {
    id: 'logo-design',
    name: 'Diseño de Logo Profesional',
    description: 'Diseño de logo profesional con 3 propuestas iniciales, revisiones ilimitadas y entrega en todos los formatos necesarios.',
    shortDescription: 'Logo profesional con 3 propuestas y revisiones',
    price: 299,
    type: 'service',
    category: 'Diseño Gráfico',
    subcategory: 'Identidad Corporativa',
    deliveryTime: '3-5 días',
    features: [
      '3 propuestas iniciales',
      'Revisiones ilimitadas',
      'Entrega en vectorial (AI, EPS)',
      'Versiones en color y B/N',
      'Versión horizontal y vertical',
      'Manual de uso básico',
      'Archivos para web (PNG, JPG)',
      'Archivos para impresión'
    ],
    isRecurring: false,
    isPopular: true,
    isFeatured: false,
    images: ['/images/products/logo-design-1.jpg'],
    tags: ['logo', 'diseño', 'identidad', 'marca'],
    requirements: [
      'Brief del proyecto',
      'Referencias visuales',
      'Información de la empresa'
    ],
    deliverables: [
      'Logo en formato vectorial',
      'Versiones en diferentes formatos',
      'Manual de uso',
      'Archivos fuente'
    ],
    revisions: 999, // Unlimited
    supportIncluded: false,
    complexity: 'basic',
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: 'brand-identity',
    name: 'Identidad Corporativa Completa',
    description: 'Desarrollo completo de identidad corporativa incluyendo logo, paleta de colores, tipografías, papelería y manual de marca.',
    shortDescription: 'Identidad corporativa completa con manual de marca',
    price: 899,
    originalPrice: 1099,
    type: 'service',
    category: 'Diseño Gráfico',
    subcategory: 'Identidad Corporativa',
    deliveryTime: '10-12 días',
    features: [
      'Diseño de logo',
      'Paleta de colores',
      'Selección tipográfica',
      'Papelería corporativa',
      'Plantillas de presentación',
      'Manual de marca completo',
      'Aplicaciones en mockups',
      'Archivos editables'
    ],
    isRecurring: false,
    isPopular: false,
    isFeatured: true,
    images: ['/images/products/brand-identity-1.jpg'],
    tags: ['identidad', 'marca', 'corporativo', 'manual'],
    requirements: [
      'Brief detallado',
      'Información de la empresa',
      'Referencias de estilo',
      'Aplicaciones necesarias'
    ],
    deliverables: [
      'Logo y variaciones',
      'Manual de marca',
      'Papelería corporativa',
      'Plantillas editables',
      'Archivos fuente'
    ],
    revisions: 5,
    supportIncluded: true,
    complexity: 'standard',
    isActive: true,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-07-20'),
  },
  // Digital Marketing Services
  {
    id: 'seo-audit',
    name: 'Auditoría SEO Completa',
    description: 'Análisis exhaustivo del SEO de tu sitio web con reporte detallado y plan de acción para mejorar tu posicionamiento.',
    shortDescription: 'Auditoría SEO con reporte y plan de acción',
    price: 199,
    type: 'service',
    category: 'Marketing Digital',
    subcategory: 'SEO',
    deliveryTime: '2-3 días',
    features: [
      'Análisis técnico completo',
      'Auditoría de contenido',
      'Análisis de palabras clave',
      'Revisión de competencia',
      'Reporte detallado',
      'Plan de acción prioritizado',
      'Recomendaciones técnicas',
      '1 hora de consultoría'
    ],
    isRecurring: false,
    isPopular: true,
    isFeatured: false,
    images: ['/images/products/seo-audit-1.jpg'],
    tags: ['seo', 'auditoría', 'análisis', 'posicionamiento'],
    requirements: [
      'URL del sitio web',
      'Acceso a Google Analytics',
      'Acceso a Search Console',
      'Objetivos del negocio'
    ],
    deliverables: [
      'Reporte de auditoría',
      'Plan de acción',
      'Lista de palabras clave',
      'Recomendaciones técnicas',
      'Sesión de consultoría'
    ],
    revisions: 1,
    supportIncluded: true,
    complexity: 'basic',
    isActive: true,
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-07-20'),
  },
  // Add-ons
  {
    id: 'ssl-certificate',
    name: 'Certificado SSL Premium',
    description: 'Certificado SSL premium con validación extendida para máxima seguridad y confianza.',
    shortDescription: 'Certificado SSL premium con validación extendida',
    price: 99,
    type: 'addon',
    category: 'Seguridad',
    deliveryTime: '1-2 días',
    features: [
      'Validación extendida',
      'Garantía de $1,750,000',
      'Sello de confianza',
      'Soporte 24/7',
      'Instalación incluida'
    ],
    isRecurring: true,
    recurringPeriod: 'yearly',
    images: ['/images/products/ssl-certificate-1.jpg'],
    tags: ['ssl', 'seguridad', 'certificado'],
    requirements: ['Dominio activo'],
    deliverables: ['Certificado SSL instalado', 'Configuración completa'],
    revisions: 0,
    supportIncluded: true,
    complexity: 'basic',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-07-20'),
  },
  {
    id: 'backup-service',
    name: 'Servicio de Backup Automático',
    description: 'Copias de seguridad automáticas diarias con almacenamiento en la nube y restauración fácil.',
    shortDescription: 'Backups automáticos diarios en la nube',
    price: 29,
    type: 'addon',
    category: 'Seguridad',
    deliveryTime: '1 día',
    features: [
      'Backups diarios automáticos',
      'Almacenamiento en la nube',
      'Restauración con 1 clic',
      'Retención de 30 días',
      'Notificaciones por email'
    ],
    isRecurring: true,
    recurringPeriod: 'monthly',
    images: ['/images/products/backup-service-1.jpg'],
    tags: ['backup', 'seguridad', 'automático'],
    requirements: ['Sitio web activo'],
    deliverables: ['Servicio configurado', 'Panel de control'],
    revisions: 0,
    supportIncluded: true,
    complexity: 'basic',
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-07-20'),
  },
];

// Mock Product Packages
export const mockPackages: ProductPackage[] = [
  {
    id: 'startup-package',
    name: 'Paquete Startup',
    description: 'Todo lo que necesitas para lanzar tu negocio online: sitio web, logo e identidad corporativa.',
    products: ['web-basic', 'logo-design', 'ssl-certificate'],
    discountPercentage: 15,
    totalPrice: 1127, // 15% discount applied
    originalPrice: 1297,
    isActive: true,
    validUntil: new Date('2024-12-31'),
  },
  {
    id: 'business-package',
    name: 'Paquete Business',
    description: 'Solución completa para empresas: sitio web premium, identidad corporativa y auditoría SEO.',
    products: ['web-premium', 'brand-identity', 'seo-audit'],
    discountPercentage: 20,
    totalPrice: 2878, // 20% discount applied
    originalPrice: 3597,
    isActive: true,
    validUntil: new Date('2024-12-31'),
  },
  {
    id: 'ecommerce-package',
    name: 'Paquete E-commerce',
    description: 'Todo para tu tienda online: tienda básica, identidad corporativa y servicios de seguridad.',
    products: ['ecommerce-basic', 'brand-identity', 'ssl-certificate', 'backup-service'],
    discountPercentage: 18,
    totalPrice: 2464, // 18% discount applied
    originalPrice: 3027,
    isActive: true,
    validUntil: new Date('2024-12-31'),
  },
];

// Mock Maintenance Plans
export const mockMaintenancePlans: MaintenancePlan[] = [
  {
    id: 'basic-maintenance',
    name: 'Mantenimiento Básico',
    description: 'Mantenimiento esencial para mantener tu sitio web seguro y actualizado.',
    features: [
      'Actualizaciones de seguridad',
      'Backup semanal',
      'Monitoreo básico',
      'Soporte por email',
      '2 horas de cambios menores',
      'Reporte mensual'
    ],
    price: 49,
    billingCycle: 'monthly',
    supportLevel: 'basic',
    responseTime: '48 horas',
    monthlyHours: 2,
    backupFrequency: 'Semanal',
    securityUpdates: true,
    performanceOptimization: false,
    isPopular: true,
    isActive: true,
  },
  {
    id: 'standard-maintenance',
    name: 'Mantenimiento Estándar',
    description: 'Mantenimiento completo con optimización de rendimiento y soporte prioritario.',
    features: [
      'Todo del plan Básico',
      'Backup diario',
      'Optimización de rendimiento',
      'Monitoreo avanzado',
      'Soporte prioritario',
      '5 horas de cambios',
      'Reporte detallado',
      'Análisis de tráfico'
    ],
    price: 99,
    billingCycle: 'monthly',
    supportLevel: 'standard',
    responseTime: '24 horas',
    monthlyHours: 5,
    backupFrequency: 'Diario',
    securityUpdates: true,
    performanceOptimization: true,
    isPopular: false,
    isActive: true,
  },
  {
    id: 'premium-maintenance',
    name: 'Mantenimiento Premium',
    description: 'Servicio completo de mantenimiento con soporte 24/7 y gestión proactiva.',
    features: [
      'Todo del plan Estándar',
      'Soporte 24/7',
      'Gestión proactiva',
      'Optimización continua',
      '10 horas de desarrollo',
      'Consultoría estratégica',
      'Reportes ejecutivos',
      'Acceso directo al equipo'
    ],
    price: 199,
    billingCycle: 'monthly',
    supportLevel: 'premium',
    responseTime: '2 horas',
    monthlyHours: 10,
    backupFrequency: 'Diario + Tiempo real',
    securityUpdates: true,
    performanceOptimization: true,
    isPopular: false,
    isActive: true,
  },
];

// Product categories for filtering
export const productCategories = [
  {
    id: 'desarrollo-web',
    name: 'Desarrollo Web',
    subcategories: [
      { id: 'sitios-corporativos', name: 'Sitios Corporativos' },
      { id: 'aplicaciones-web', name: 'Aplicaciones Web' },
      { id: 'landing-pages', name: 'Landing Pages' },
    ]
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    subcategories: [
      { id: 'tiendas-online', name: 'Tiendas Online' },
      { id: 'marketplaces', name: 'Marketplaces' },
      { id: 'sistemas-pago', name: 'Sistemas de Pago' },
    ]
  },
  {
    id: 'diseno-grafico',
    name: 'Diseño Gráfico',
    subcategories: [
      { id: 'identidad-corporativa', name: 'Identidad Corporativa' },
      { id: 'material-impreso', name: 'Material Impreso' },
      { id: 'diseno-digital', name: 'Diseño Digital' },
    ]
  },
  {
    id: 'marketing-digital',
    name: 'Marketing Digital',
    subcategories: [
      { id: 'seo', name: 'SEO' },
      { id: 'sem', name: 'SEM' },
      { id: 'redes-sociales', name: 'Redes Sociales' },
    ]
  },
  {
    id: 'seguridad',
    name: 'Seguridad',
    subcategories: [
      { id: 'certificados', name: 'Certificados' },
      { id: 'backups', name: 'Backups' },
      { id: 'monitoreo', name: 'Monitoreo' },
    ]
  },
];

// Helper functions
export function getProductById(id: string): Product | undefined {
  return mockProducts.find(product => product.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(product => product.category === category);
}

export function getProductsByType(type: Product['type']): Product[] {
  return mockProducts.filter(product => product.type === type);
}

export function getFeaturedProducts(): Product[] {
  return mockProducts.filter(product => product.isFeatured);
}

export function getPopularProducts(): Product[] {
  return mockProducts.filter(product => product.isPopular);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
