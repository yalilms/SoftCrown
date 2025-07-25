import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SoftCrown - Contact & Lead Management',
    short_name: 'SoftCrown',
    description: 'Aplicación de gestión de contactos y leads con IA, chat inteligente y funcionalidades PWA avanzadas',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity', 'communication'],
    lang: 'es-ES',
    dir: 'ltr',
    scope: '/',
    
    icons: [
      {
        src: '/icons/icon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-152x152.png',
        sizes: '152x152',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    
    screenshots: [
      {
        src: '/screenshots/desktop-home.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Página principal de SoftCrown'
      },
      {
        src: '/screenshots/mobile-contact.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Formulario de contacto móvil'
      },
      {
        src: '/screenshots/mobile-chat.png',
        sizes: '390x844',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Chat inteligente con IA'
      }
    ],
    
    shortcuts: [
      {
        name: 'Nuevo Contacto',
        short_name: 'Contacto',
        description: 'Crear un nuevo contacto',
        url: '/contacto',
        icons: [
          {
            src: '/icons/shortcut-contact.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Cotización',
        short_name: 'Cotizar',
        description: 'Generar una cotización',
        url: '/cotizacion',
        icons: [
          {
            src: '/icons/shortcut-quote.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'Chat IA',
        short_name: 'Chat',
        description: 'Abrir chat inteligente',
        url: '/?chat=true',
        icons: [
          {
            src: '/icons/shortcut-chat.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      },
      {
        name: 'CRM Dashboard',
        short_name: 'CRM',
        description: 'Panel de administración CRM',
        url: '/crm',
        icons: [
          {
            src: '/icons/shortcut-crm.png',
            sizes: '96x96',
            type: 'image/png'
          }
        ]
      }
    ],
    
    related_applications: [
      {
        platform: 'webapp',
        url: 'https://softcrown.vercel.app/manifest.json'
      }
    ],
    
    prefer_related_applications: false,
    
    launch_handler: {
      client_mode: 'navigate-existing'
    }
  };
}
