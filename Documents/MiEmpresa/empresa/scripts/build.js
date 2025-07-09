#!/usr/bin/env node

/**
 * BUILD.JS
 * Script de construcción para el proyecto SoftCronw
 * Compila SCSS, minifica archivos y optimiza para producción
 */

const fs = require('fs');
const path = require('path');
const sass = require('sass');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

// Configuración
const CONFIG = {
  // Directorios
  dirs: {
    src: 'css',
    dist: 'dist',
    js: 'js'
  },
  
  // Archivos
  files: {
    scssMain: 'css/main.scss',
    cssOutput: 'css/styles.css',
    cssMinOutput: 'css/styles.min.css'
  },
  
  // Opciones de compilación
  sass: {
    style: 'expanded',
    sourceMap: true,
    sourceMapContents: true
  },
  
  cleanCss: {
    level: 2,
    sourceMap: true
  }
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Logger con colores
 */
const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.blue}→${colors.reset} ${msg}`)
};

/**
 * Crear directorio si no existe
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.info(`Directorio creado: ${dir}`);
  }
}

/**
 * Compilar SCSS a CSS
 */
async function compileSCSS() {
  try {
    log.step('Compilando SCSS...');
    
    const result = sass.compile(CONFIG.files.scssMain, CONFIG.sass);
    
    // Escribir CSS expandido
    fs.writeFileSync(CONFIG.files.cssOutput, result.css);
    log.success(`CSS compilado: ${CONFIG.files.cssOutput}`);
    
    // Escribir source map
    if (result.sourceMap) {
      fs.writeFileSync(CONFIG.files.cssOutput + '.map', JSON.stringify(result.sourceMap));
      log.success('Source map generado');
    }
    
    return result.css;
  } catch (error) {
    log.error(`Error compilando SCSS: ${error.message}`);
    throw error;
  }
}

/**
 * Minificar CSS
 */
async function minifyCSS(css) {
  try {
    log.step('Minificando CSS...');
    
    const cleanCSS = new CleanCSS(CONFIG.cleanCss);
    const result = cleanCSS.minify(css);
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => log.error(`Error CSS: ${error}`));
      throw new Error('Errores en minificación CSS');
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => log.warning(`Advertencia CSS: ${warning}`));
    }
    
    // Escribir CSS minificado
    fs.writeFileSync(CONFIG.files.cssMinOutput, result.styles);
    
    // Estadísticas
    const originalSize = Buffer.byteLength(css, 'utf8');
    const minifiedSize = Buffer.byteLength(result.styles, 'utf8');
    const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    log.success(`CSS minificado: ${CONFIG.files.cssMinOutput}`);
    log.info(`Tamaño original: ${(originalSize / 1024).toFixed(1)}KB`);
    log.info(`Tamaño minificado: ${(minifiedSize / 1024).toFixed(1)}KB`);
    log.info(`Reducción: ${savings}%`);
    
    return result.styles;
  } catch (error) {
    log.error(`Error minificando CSS: ${error.message}`);
    throw error;
  }
}

/**
 * Minificar archivos JavaScript
 */
async function minifyJS() {
  try {
    log.step('Minificando JavaScript...');
    
    const jsDir = CONFIG.dirs.js;
    const files = fs.readdirSync(jsDir).filter(file => file.endsWith('.js') && !file.endsWith('.min.js'));
    
    for (const file of files) {
      const filePath = path.join(jsDir, file);
      const code = fs.readFileSync(filePath, 'utf8');
      
      const result = await minify(code, {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info']
        },
        mangle: true,
        format: {
          comments: false
        }
      });
      
      if (result.error) {
        log.error(`Error minificando ${file}: ${result.error}`);
        continue;
      }
      
      const minFile = file.replace('.js', '.min.js');
      const minPath = path.join(jsDir, minFile);
      fs.writeFileSync(minPath, result.code);
      
      // Estadísticas
      const originalSize = Buffer.byteLength(code, 'utf8');
      const minifiedSize = Buffer.byteLength(result.code, 'utf8');
      const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
      
      log.success(`${file} → ${minFile} (${savings}% reducción)`);
    }
  } catch (error) {
    log.error(`Error minificando JavaScript: ${error.message}`);
    throw error;
  }
}

/**
 * Optimizar imágenes (placeholder para futuro)
 */
async function optimizeImages() {
  log.step('Optimización de imágenes (pendiente)...');
  log.warning('Implementar optimización de imágenes con imagemin');
}

/**
 * Generar reporte de build
 */
function generateBuildReport() {
  const report = {
    timestamp: new Date().toISOString(),
    version: require('../package.json').version,
    files: {
      css: {
        main: fs.existsSync(CONFIG.files.cssOutput),
        minified: fs.existsSync(CONFIG.files.cssMinOutput)
      }
    }
  };
  
  fs.writeFileSync('build-report.json', JSON.stringify(report, null, 2));
  log.success('Reporte de build generado: build-report.json');
}

/**
 * Función principal de build
 */
async function build() {
  const startTime = Date.now();
  
  console.log(`${colors.bright}🚀 Iniciando build de SoftCronw${colors.reset}\n`);
  
  try {
    // 1. Compilar SCSS
    const css = await compileSCSS();
    
    // 2. Minificar CSS
    await minifyCSS(css);
    
    // 3. Minificar JavaScript
    await minifyJS();
    
    // 4. Optimizar imágenes
    await optimizeImages();
    
    // 5. Generar reporte
    generateBuildReport();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.green}${colors.bright}✅ Build completado exitosamente en ${duration}s${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}${colors.bright}❌ Build falló${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

/**
 * Función de watch para desarrollo
 */
function watch() {
  console.log(`${colors.bright}👀 Iniciando modo watch${colors.reset}\n`);
  
  const chokidar = require('chokidar');
  
  // Watch SCSS files
  const scssWatcher = chokidar.watch('css/**/*.scss', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  });
  
  scssWatcher.on('change', async (path) => {
    log.info(`Archivo cambiado: ${path}`);
    try {
      const css = await compileSCSS();
      await minifyCSS(css);
      log.success('SCSS recompilado');
    } catch (error) {
      log.error(`Error recompilando: ${error.message}`);
    }
  });
  
  log.info('Watching SCSS files...');
  log.info('Presiona Ctrl+C para detener');
}

// Ejecutar según argumentos de línea de comandos
const command = process.argv[2];

switch (command) {
  case 'watch':
    watch();
    break;
  case 'build':
  default:
    build();
    break;
} 