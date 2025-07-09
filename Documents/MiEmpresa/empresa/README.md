# 🎨 SoftCronw CSS Architecture

**Arquitectura CSS modular, escalable y mantenible** siguiendo las mejores prácticas modernas con **metodología BEM**, **SCSS avanzado** y **efectos glassmorphism**.

## 🚀 Características Principales

- ✅ **Metodología BEM** estricta y consistente
- ✅ **SCSS modular** con sistema de variables completo  
- ✅ **Responsive Design** mobile-first
- ✅ **Glassmorphism** y efectos modernos
- ✅ **Componentes reutilizables** bien documentados
- ✅ **Sistema de grid** flexible (CSS Grid + Flexbox)
- ✅ **Animaciones AOS** integradas
- ✅ **Accesibilidad** y soporte completo
- ✅ **Performance optimizado** con lazy loading

## 📁 Estructura del Proyecto

```
css/
├── abstracts/           # Variables, mixins, funciones
│   ├── _variables.scss  # Sistema completo de variables
│   ├── _mixins.scss     # Mixins reutilizables  
│   ├── _functions.scss  # Funciones SCSS
│   └── _placeholders.scss # Placeholders para @extend
├── base/                # Estilos fundamentales
│   ├── _reset.scss      # Reset CSS moderno
│   ├── _typography.scss # Sistema tipográfico
│   └── _base.scss       # Estilos base
├── components/          # Componentes modulares
│   ├── _buttons.scss    # Sistema de botones BEM
│   ├── _cards.scss      # Tarjetas con glassmorphism
│   ├── _forms.scss      # Formularios y inputs
│   ├── _navigation.scss # Navegación responsive
│   ├── _modal.scss      # Modales y overlays
│   ├── _chatbot.scss    # Widget de chat
│   └── _loader.scss     # Loaders y spinners
├── layout/              # Estructura del sitio
│   ├── _header.scss     # Header con glassmorphism
│   ├── _footer.scss     # Footer responsive
│   ├── _grid.scss       # Sistema de grid avanzado
│   └── _sidebar.scss    # Barras laterales
├── pages/               # Estilos específicos por página
│   ├── _home.scss       # Página de inicio
│   ├── _services.scss   # Página de servicios
│   ├── _about.scss      # Acerca de nosotros
│   ├── _portfolio.scss  # Portfolio/proyectos
│   └── _contact.scss    # Contacto
├── themes/              # Temas y variaciones
│   ├── _default.scss    # Tema por defecto
│   └── _dark.scss       # Tema oscuro
├── vendors/             # Librerías de terceros
│   ├── _bootstrap.scss  # Overrides de Bootstrap
│   └── _aos.scss        # Animate On Scroll
└── main.scss            # Archivo principal
```

## 🛠️ Instalación y Uso

### 1. **Instalar Dependencias**

```bash
npm install
```

### 2. **Compilar SCSS**

```bash
# Desarrollo (watch mode)
npm run dev

# Producción (comprimido)
npm run build-prod

# Build simple
npm run build
```

### 3. **Linting y Formato**

```bash
# Linting SCSS
npm run lint

# Formatear código
npm run format
```

## 🎯 Metodología BEM

Usamos **BEM (Block Element Modifier)** de forma estricta:

```scss
// ✅ Correcto
.card {                    // Block
  &__header { }           // Element
  &__title { }            // Element
  &__body { }             // Element
  
  &--primary { }          // Modifier
  &--large { }            // Modifier
  &--glass { }            // Modifier
}

// ✅ HTML
<div class="card card--primary card--large">
  <div class="card__header">
    <h3 class="card__title">Título</h3>
  </div>
  <div class="card__body">Contenido</div>
</div>
```

## 🎨 Sistema de Variables

### **Colores Principales**

```scss
// Brand Colors
$color-primary: #1e3a8a;      // Azul profundo
$color-secondary: #10b981;    // Verde esmeralda  
$color-accent: #f59e0b;       // Amarillo dorado

// Gradientes
$gradient-primary: linear-gradient(135deg, $color-primary, $color-primary-light);
$gradient-hero: linear-gradient(135deg, rgba($color-primary, 0.9), rgba($color-secondary, 0.8));
```

### **Tipografía**

```scss
// Fuentes
$font-family-primary: 'Poppins', sans-serif;    // Headers
$font-family-secondary: 'Roboto', sans-serif;   // Body text

// Tamaños responsivos
$font-size-xs: 0.75rem;   // 12px
$font-size-sm: 0.875rem;  // 14px  
$font-size-base: 1rem;    // 16px
$font-size-lg: 1.125rem;  // 18px
$font-size-xl: 1.25rem;   // 20px
// ... hasta 7xl
```

### **Espaciado**

```scss
// Sistema de espaciado basado en rem
$spacing-1: 0.25rem;   // 4px
$spacing-2: 0.5rem;    // 8px
$spacing-4: 1rem;      // 16px (base)
$spacing-6: 1.5rem;    // 24px
$spacing-8: 2rem;      // 32px
// ... hasta 64
```

## 🧩 Componentes Principales

### **Botones**

```html
<!-- Variantes -->
<button class="btn btn--primary">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--outline">Outline</button>
<button class="btn btn--ghost">Ghost</button>
<button class="btn btn--glass">Glassmorphism</button>

<!-- Tamaños -->
<button class="btn btn--xs">Extra Small</button>
<button class="btn btn--sm">Small</button>
<button class="btn btn--lg">Large</button>
<button class="btn btn--xl">Extra Large</button>

<!-- Estados -->
<button class="btn btn--primary btn--loading">Loading...</button>
<button class="btn btn--primary" disabled>Disabled</button>

<!-- Con iconos -->
<button class="btn btn--primary">
  <span class="btn__icon btn__icon--left">🚀</span>
  <span class="btn__text">Con Icono</span>
</button>
```

### **Tarjetas**

```html
<!-- Tarjeta básica -->
<div class="card">
  <div class="card__header">
    <h3 class="card__title">Título</h3>
    <p class="card__subtitle">Subtítulo</p>
  </div>
  <div class="card__body">
    <p class="card__text">Contenido de la tarjeta</p>
  </div>
  <div class="card__footer">
    <div class="card__actions">
      <button class="btn btn--primary">Acción</button>
    </div>
  </div>
</div>

<!-- Tarjeta con glassmorphism -->
<div class="card card--glass">
  <!-- contenido -->
</div>

<!-- Tarjeta con gradiente -->
<div class="card card--gradient">
  <!-- contenido -->
</div>

<!-- Tarjeta interactiva -->
<div class="card card--interactive">
  <!-- contenido -->
</div>
```

### **Grid System**

```html
<!-- CSS Grid -->
<div class="grid grid--3 grid--gap-6">
  <div class="grid-item grid-item--span-2">Span 2</div>
  <div class="grid-item">Item 2</div>
  <div class="grid-item">Item 3</div>
</div>

<!-- Flexbox Grid -->
<div class="flex-grid flex-grid--justify-center">
  <div class="flex-item flex-item--4">25%</div>
  <div class="flex-item flex-item--8">75%</div>
</div>

<!-- Auto-fit Grid -->
<div class="grid grid--auto-fit grid--gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### **Loaders**

```html
<!-- Spinner clásico -->
<div class="spinner spinner--primary spinner--lg"></div>

<!-- Puntos animados -->
<div class="dots-loader loader--primary">
  <div class="dots-loader__dot"></div>
  <div class="dots-loader__dot"></div>
  <div class="dots-loader__dot"></div>
</div>

<!-- Ondas -->
<div class="wave-loader loader--secondary">
  <div class="wave-loader__bar"></div>
  <div class="wave-loader__bar"></div>
  <div class="wave-loader__bar"></div>
</div>

<!-- Overlay loader -->
<div class="overlay-loader">
  <div class="overlay-loader__content">
    <div class="spinner spinner--primary spinner--lg"></div>
    <p class="overlay-loader__text">Cargando...</p>
  </div>
</div>
```

## 🎭 Efectos Glassmorphism

```scss
// Usar el mixin
.mi-elemento {
  @include glassmorphism(0.1, 20px, 0.2);
  // background-opacity, blur, border-opacity
}

// O usar las clases
.glass { @include glassmorphism(); }
.glass-dark { @include glassmorphism-dark(); }
```

```html
<!-- HTML -->
<div class="card card--glass">
  <div class="card__body">
    <h3>Tarjeta con Glassmorphism</h3>
    <p>Efecto cristal translúcido moderno</p>
  </div>
</div>
```

## 📱 Responsive Design

```scss
// Breakpoints disponibles
$breakpoints: (
  'xs': 480px,
  'sm': 640px,
  'md': 768px,
  'lg': 1024px,
  'xl': 1280px,
  '2xl': 1536px
);

// Uso de mixins responsive
.mi-componente {
  padding: $spacing-4;
  
  @include respond-to('md') {
    padding: $spacing-6;
  }
  
  @include respond-to('lg') {
    padding: $spacing-8;
  }
}
```

```html
<!-- Clases responsive -->
<div class="grid grid--1 grid--md-2 grid--lg-3">
  <div class="grid-item grid-item--span-full grid-item--md-span-1">
    Responsive item
  </div>
</div>
```

## 🎬 Animaciones AOS

```html
<!-- Incluir AOS -->
<link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet">
<script src="https://unpkg.com/aos@2.3.1/dist/aos.js"></script>

<!-- Usar animaciones -->
<div data-aos="fade-up">Fade Up</div>
<div data-aos="fade-up" data-aos-delay="100">Con delay</div>
<div data-aos="zoom-in" data-aos-duration="800">Zoom In</div>

<!-- Animaciones personalizadas -->
<div data-aos="scale-up">Scale Up</div>
<div data-aos="slide-up-bounce">Slide Bounce</div>
<div data-aos="flip-left">Flip Left</div>

<!-- Staggered animations -->
<div class="aos-grid-stagger">
  <div data-aos="fade-up">Item 1</div>
  <div data-aos="fade-up">Item 2</div> <!-- Auto delay -->
  <div data-aos="fade-up">Item 3</div> <!-- Auto delay -->
</div>
```

## 🎨 Temas

### **Tema por Defecto**

```html
<body class="theme-default">
  <!-- Contenido con tema por defecto -->
</body>
```

### **Crear Temas Personalizados**

```scss
// css/themes/_mi-tema.scss
.theme-mi-tema {
  --color-primary: #your-color;
  --color-secondary: #your-color;
  
  // Override de componentes
  .btn--primary {
    background: var(--color-primary);
  }
}
```

## ⚡ Performance

### **Optimizaciones Incluidas**

- **CSS crítico** separado
- **Will-change** optimizado para animaciones
- **Hardware acceleration** en transformaciones
- **Lazy loading** para imágenes
- **Prefers-reduced-motion** respetado
- **Container queries** preparado

### **Mejores Prácticas**

```scss
// ✅ Usar variables CSS para temas dinámicos
.componente {
  color: var(--color-primary);
  background: var(--color-bg-primary);
}

// ✅ Optimizar animaciones
.elemento-animado {
  will-change: transform;
  
  &.animating {
    will-change: auto;
  }
}

// ✅ Responsive con clamp()
.titulo-fluido {
  font-size: clamp(1.5rem, 4vw, 3rem);
}
```

## 🎯 Ejemplos de Uso

### **Header Glassmorphism**

```html
<header class="header header--transparent">
  <div class="header__container">
    <a href="#" class="header__logo">
      <span class="header__logo-text">SoftCronw</span>
    </a>
    
    <nav class="header__nav">
      <ul class="nav__list">
        <li class="nav__item">
          <a href="#" class="nav__link nav__link--active">Inicio</a>
        </li>
        <li class="nav__item">
          <a href="#" class="nav__link">Servicios</a>
        </li>
      </ul>
    </nav>
  </div>
</header>
```

### **Sección Hero Moderna**

```html
<section class="hero" data-aos="fade-up">
  <div class="hero__content">
    <h1 class="hero__title">
      Soluciones <span class="text-gradient-primary">Innovadoras</span>
    </h1>
    <p class="hero__subtitle">
      Transformamos ideas en realidad digital
    </p>
    <div class="hero__actions">
      <button class="btn btn--primary btn--lg">Comenzar</button>
      <button class="btn btn--outline btn--lg">Saber Más</button>
    </div>
  </div>
</section>
```

## 🚧 Desarrollo y Mantenimiento

### **Agregar Nuevos Componentes**

1. Crear archivo en `css/components/_mi-componente.scss`
2. Seguir metodología BEM
3. Usar variables del sistema
4. Incluir responsive design
5. Agregar al `main.scss`

```scss
// css/components/_mi-componente.scss
.mi-componente {
  // Estilos base
  
  // BEM Elements
  &__elemento { }
  
  // BEM Modifiers  
  &--variante { }
  
  // Responsive
  @include respond-to('md') {
    // Estilos tablet
  }
}
```

### **Convenciones de Nomenclatura**

- **Archivos**: `_kebab-case.scss`
- **Clases**: `.kebab-case`
- **Variables**: `$kebab-case`
- **Mixins**: `@mixin kebab-case`
- **BEM**: `.block__element--modifier`

## 📊 Browser Support

- ✅ **Chrome** 90+
- ✅ **Firefox** 88+  
- ✅ **Safari** 14+
- ✅ **Edge** 90+
- ⚠️ **IE** No soportado (por diseño moderno)

## 🤝 Contribución

1. **Fork** el proyecto
2. Crear **branch** para feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** al branch (`git push origin feature/AmazingFeature`)
5. Abrir **Pull Request**

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver `LICENSE` para más detalles.

## 📞 Contacto

**SoftCronw Team**
- 📧 Email: hello@softcronw.com
- 🌐 Website: [softcronw.com](https://softcronw.com)
- 💼 LinkedIn: [@softcronw](https://linkedin.com/company/softcronw)

---

**¡Hecho con ❤️ por el equipo de SoftCronw!** 