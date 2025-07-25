# SoftCrown - Progressive Web App

Una Progressive Web App moderna para desarrollo y diseño web profesional, construida con las tecnologías más avanzadas del mercado.

## 🚀 Tecnologías Utilizadas

- **React 18** - Hooks y Context API
- **Next.js 14** - App Router para SSR/SSG
- **TypeScript** - Tipado fuerte y desarrollo seguro
- **Tailwind CSS** - Diseño responsive y moderno
- **Framer Motion** - Animaciones fluidas y micro-interacciones
- **Three.js / React Three Fiber** - Gráficos 3D interactivos
- **PWA** - Service Workers y funcionalidad offline
- **ESLint & Prettier** - Código limpio y consistente

## ✨ Características

### 🎨 Diseño Moderno
- **Glassmorphism** - Efectos de cristal y transparencias
- **Dark/Light Mode** - Tema adaptativo automático
- **Responsive Design** - Mobile-first approach
- **Micro-interacciones** - Botones con efectos ripple, glow y shimmer
- **Animaciones avanzadas** - Transiciones de página fluidas

### 🌐 Navegación 3D
- **Geometrías flotantes** - Elementos 3D interactivos
- **Navegación inmersiva** - Menú 3D con React Three Fiber
- **Efectos de partículas** - Animaciones ambientales

### ⚡ Rendimiento
- **Core Web Vitals optimizados** - Carga rápida y eficiente
- **Lazy Loading** - Carga bajo demanda de componentes
- **Service Worker** - Funcionalidad offline y caché inteligente
- **Optimización de imágenes** - Formatos WebP y AVIF

### ♿ Accesibilidad
- **WCAG 2.1 AA compliant** - Estándares de accesibilidad
- **Skip links** - Navegación por teclado
- **ARIA labels** - Soporte para lectores de pantalla
- **Focus management** - Indicadores visuales claros

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm, yarn, pnpm o bun

### Instalación
```bash
git clone https://github.com/tu-usuario/softcrown-app.git
cd softcrown-app
```

### 2. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno
```bash
cp env.example .env.local
```

Edita `.env.local` con tus claves de API:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# EmailJS
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx

# Payment Gateways
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxx

# CRM Integrations
NEXT_PUBLIC_HUBSPOT_API_KEY=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_SALESFORCE_CLIENT_ID=xxxxxxxxxxxxxxxx

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=xxxxxxxxxxxxxxxx
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción

# Testing
npm run test         # Tests unitarios
npm run test:e2e     # Tests end-to-end
npm run lighthouse   # Auditoría de rendimiento

# Análisis
npm run analyze      # Análisis del bundle
npm run type-check   # Verificación de tipos
npm run lint         # Linting del código
```

## 🏗️ Estructura del Proyecto

```
softcrown-app/
├── src/
│   ├── app/                 # App Router (Next.js 14)
│   │   ├── contacto/        # Formulario de contacto
│   │   ├── cotizacion/      # Calculadora de cotizaciones
│   │   ├── comunicacion/    # Hub de comunicación
│   │   ├── crm/            # Dashboard CRM
│   │   └── offline/        # Página offline
│   ├── components/         # Componentes React
│   │   ├── ui/             # Componentes UI base
│   │   ├── contact/        # Componentes de contacto
│   │   ├── chat/           # Chatbot IA
│   │   ├── crm/            # Dashboard CRM
│   │   └── layout/         # Layout components
│   ├── lib/                # Utilidades y servicios
│   │   ├── ai-chat.ts      # Servicio de chat IA
│   │   ├── voice.ts        # Servicio de voz
│   │   ├── pwa.ts          # Utilidades PWA
│   │   ├── performance.ts  # Monitorización
│   │   └── analytics.ts    # Analytics
│   ├── types/              # Definiciones TypeScript
│   └── contexts/           # Contextos React
├── public/
│   ├── sw.js               # Service Worker
│   ├── icons/              # Iconos PWA
│   └── screenshots/        # Screenshots PWA
├── .github/workflows/      # CI/CD GitHub Actions
└── docs/                   # Documentación
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service Worker
├── tailwind.config.ts       # Configuración Tailwind
├── next.config.ts          # Configuración Next.js
└── package.json            # Dependencias y scripts
```

## 🎯 Componentes Principales

### Header
- Navegación responsive con menú hamburguesa
- Toggle de tema dark/light
- Efectos de scroll y glassmorphism
- Navegación activa con indicadores animados

### Button
- 8 variantes: default, destructive, outline, secondary, ghost, link, gradient, glass
- Efectos ripple al hacer click
- Estados de loading y success animados
- Micro-interacciones avanzadas

### Scene3D
- Canvas Three.js optimizado
- Controles de cámara opcionales
- Iluminación y sombras realistas
- Geometrías flotantes animadas

### PageTransition
- Transiciones suaves entre páginas
- Loading bar superior
- Efectos de partículas durante transición

### Footer
- Diseño moderno con glassmorphism
- Sección de estadísticas animadas
- Newsletter con estados de loading
- Enlaces organizados por categorías

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Construir para producción
npm run start        # Ejecutar en producción
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint automáticamente
```

## 🌐 PWA (Progressive Web App)

La aplicación incluye funcionalidad PWA completa:

- **Manifest.json** - Configuración de la aplicación
- **Service Worker** - Caché inteligente y funcionalidad offline
- **Instalable** - Se puede instalar como app nativa
- **Responsive** - Funciona en todos los dispositivos

## 🎨 Personalización

### Colores y Tema
Edita `tailwind.config.ts` para personalizar la paleta de colores:

```typescript
colors: {
  primary: { /* Colores primarios */ },
  secondary: { /* Colores secundarios */ },
  accent: { /* Colores de acento */ },
}
```

### Animaciones
Personaliza las animaciones en `tailwind.config.ts`:

```typescript
animation: {
  'custom-animation': 'customKeyframe 2s ease-in-out infinite',
}
```

## 📱 Responsive Design

Breakpoints utilizados:
- **sm**: 640px+
- **md**: 768px+
- **lg**: 1024px+
- **xl**: 1280px+
- **2xl**: 1536px+

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build command
npm run build

# Publish directory
out
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

**SoftCrown Team** - Desarrollo y Diseño Web Profesional

- 🌐 Website: [softcrown.com](https://softcrown.com)
- 📧 Email: info@softcrown.com
- 📱 Teléfono: +34 650 63 65 99

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
