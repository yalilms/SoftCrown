import type { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import WhySoftCrow from '@/components/sections/WhySoftCrow';
import ServicesCarousel from '@/components/sections/ServicesCarousel';
import TechStack from '@/components/sections/TechStack';
import WorkProcess from '@/components/sections/WorkProcess';

export const metadata: Metadata = {
  title: 'SoftCrown - Desarrollo Web Avanzado | Aplicaciones Modernas y Escalables',
  description: 'Especialistas en desarrollo web con React, Next.js, TypeScript y tecnologías 3D. Creamos aplicaciones web modernas, escalables y de alto rendimiento.',
  keywords: [
    'desarrollo web', 'React', 'Next.js', 'TypeScript', 'aplicaciones web',
    'desarrollo frontend', 'desarrollo backend', 'Three.js', 'desarrollo 3D',
    'PWA', 'aplicaciones móviles', 'e-commerce', 'SoftCrown'
  ],
  openGraph: {
    title: 'SoftCrown - Desarrollo Web Avanzado',
    description: 'Especialistas en desarrollo web con React, Next.js, TypeScript y tecnologías 3D.',
    url: 'https://softcrown.com',
    siteName: 'SoftCrown',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'SoftCrown',
  url: 'https://softcrown.com',
  description: 'Especialistas en desarrollo web con React, Next.js, TypeScript y tecnologías 3D.',
  services: [
    {
      '@type': 'Service',
      name: 'Desarrollo Web Frontend',
      description: 'Desarrollo de interfaces modernas con React, Next.js y TypeScript',
    },
    {
      '@type': 'Service',
      name: 'Desarrollo Web Backend',
      description: 'APIs robustas y escalables con Node.js y bases de datos modernas',
    },
  ],
};

export default function HomePage() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Page Content */}
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Why Choose SoftCrow Section */}
        <WhySoftCrow />

        {/* Services Carousel */}
        <ServicesCarousel />

        {/* Technology Stack */}
        <TechStack />

        {/* Work Process */}
        <WorkProcess />

        {/* Additional SEO Content (Hidden but crawlable) */}
        <div className="sr-only">
          <h2>Servicios de Desarrollo Web en Madrid</h2>
          <p>
            SoftCrown ofrece servicios completos de desarrollo web en Madrid y toda España. 
            Especializados en React, Next.js, TypeScript, Node.js, y tecnologías 3D como Three.js. 
            Creamos aplicaciones web modernas, escalables y de alto rendimiento.
          </p>
          
          <h3>Tecnologías que Dominamos</h3>
          <ul>
            <li>Frontend: React, Next.js, TypeScript, Tailwind CSS, Three.js</li>
            <li>Backend: Node.js, Python, GraphQL, REST APIs</li>
            <li>Bases de Datos: MongoDB, PostgreSQL, Redis</li>
            <li>Cloud: AWS, Vercel, Docker, Kubernetes</li>
            <li>Herramientas: Git, Jest, Cypress, Figma</li>
          </ul>

          <h3>Tipos de Proyectos</h3>
          <ul>
            <li>Aplicaciones Web Empresariales</li>
            <li>E-commerce y Tiendas Online</li>
            <li>Aplicaciones Web Progresivas (PWA)</li>
            <li>Dashboards y Paneles de Control</li>
            <li>APIs y Microservicios</li>
            <li>Experiencias 3D Interactivas</li>
            <li>Landing Pages de Alto Rendimiento</li>
          </ul>

          <h3>Proceso de Desarrollo</h3>
          <p>
            Nuestro proceso incluye análisis de requisitos, diseño UX/UI, desarrollo frontend y backend, 
            testing exhaustivo, despliegue en producción y soporte continuo. Garantizamos calidad, 
            escalabilidad y rendimiento en cada proyecto.
          </p>

          <h3>Contacto</h3>
          <p>
            ¿Tienes un proyecto en mente? Contacta con nosotros para una consulta gratuita. 
            Estamos ubicados en Madrid pero trabajamos con clientes de toda España y Latinoamérica.
          </p>
        </div>
      </main>
    </>
  );
}

