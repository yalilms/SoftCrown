#!/usr/bin/env node

/**
 * DEPLOY.JS
 * Script de deployment para el proyecto SoftCronw
 * Automatiza el proceso de subida a producción
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Ejecutar comando con manejo de errores
 */
function runCommand(command, description) {
  try {
    log.step(description);
    const output = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    log.success(`✓ ${description}`);
    return output;
  } catch (error) {
    log.error(`✗ Error en: ${description}`);
    log.error(error.message);
    throw error;
  }
}

/**
 * Verificar que Git esté limpio
 */
function checkGitStatus() {
  log.step('Verificando estado de Git...');
  
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log.warning('Hay cambios sin commit:');
      console.log(status);
      return false;
    }
    log.success('Git status limpio');
    return true;
  } catch (error) {
    log.error('Error verificando Git status');
    return false;
  }
}

/**
 * Ejecutar tests (placeholder)
 */
function runTests() {
  log.step('Ejecutando tests...');
  log.warning('Tests no implementados - omitiendo');
  return true;
}

/**
 * Verificar archivos críticos
 */
function checkCriticalFiles() {
  log.step('Verificando archivos críticos...');
  
  const criticalFiles = [
    'index.html',
    'css/styles.css',
    'package.json',
    'REPORTE_REVISION_DEPLOY.md'
  ];
  
  let allExist = true;
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      log.success(`✓ ${file}`);
    } else {
      log.error(`✗ Falta archivo: ${file}`);
      allExist = false;
    }
  }
  
  return allExist;
}

/**
 * Verificar tamaño de archivos
 */
function checkFileSizes() {
  log.step('Verificando tamaños de archivos...');
  
  const filesToCheck = [
    { path: 'servicios.html', maxSize: 100 * 1024 }, // 100KB
    { path: 'css/styles.css', maxSize: 500 * 1024 }, // 500KB
    { path: 'js/script.js', maxSize: 200 * 1024 }     // 200KB
  ];
  
  let allGood = true;
  
  for (const file of filesToCheck) {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      const sizeKB = (stats.size / 1024).toFixed(1);
      const maxSizeKB = (file.maxSize / 1024).toFixed(1);
      
      if (stats.size > file.maxSize) {
        log.warning(`⚠ ${file.path}: ${sizeKB}KB (máximo recomendado: ${maxSizeKB}KB)`);
        allGood = false;
      } else {
        log.success(`✓ ${file.path}: ${sizeKB}KB`);
      }
    }
  }
  
  return allGood;
}

/**
 * Crear backup antes del deploy
 */
function createBackup() {
  log.step('Creando backup...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupBranch = `backup-${timestamp}`;
  
  try {
    runCommand(`git branch ${backupBranch}`, `Creando branch de backup: ${backupBranch}`);
    log.success(`Backup creado: ${backupBranch}`);
    return backupBranch;
  } catch (error) {
    log.error('Error creando backup');
    throw error;
  }
}

/**
 * Deploy a GitHub
 */
function deployToGitHub() {
  log.step('Desplegando a GitHub...');
  
  try {
    // Verificar que existe remote origin
    const remotes = execSync('git remote -v', { encoding: 'utf8' });
    if (!remotes.includes('origin')) {
      throw new Error('No se encontró remote origin');
    }
    
    // Push a GitHub
    runCommand('git push origin master', 'Subiendo cambios a GitHub');
    
    // Push tags si existen
    try {
      runCommand('git push origin --tags', 'Subiendo tags');
    } catch (error) {
      log.warning('No hay tags para subir');
    }
    
    log.success('Deploy a GitHub completado');
  } catch (error) {
    log.error('Error en deploy a GitHub');
    throw error;
  }
}

/**
 * Actualizar archivo de deploy
 */
function updateDeployInfo() {
  const deployInfo = {
    lastDeploy: new Date().toISOString(),
    version: require('../package.json').version,
    environment: 'production',
    gitCommit: execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim(),
    deployer: require('os').userInfo().username
  };
  
  fs.writeFileSync('deploy-info.json', JSON.stringify(deployInfo, null, 2));
  log.success('Información de deploy actualizada');
}

/**
 * Función principal de deploy
 */
async function deploy(options = {}) {
  const startTime = Date.now();
  
  console.log(`${colors.bright}🚀 Iniciando deployment de SoftCronw${colors.reset}\n`);
  
  try {
    // 1. Verificaciones pre-deploy
    if (!options.skipGitCheck && !checkGitStatus()) {
      if (!options.force) {
        log.error('Hay cambios sin commit. Usa --force para omitir esta verificación');
        process.exit(1);
      }
      log.warning('Continuando con cambios sin commit (--force)');
    }
    
    if (!checkCriticalFiles()) {
      log.error('Faltan archivos críticos');
      process.exit(1);
    }
    
    if (!checkFileSizes()) {
      log.warning('Algunos archivos son más grandes de lo recomendado');
      if (!options.force) {
        log.error('Usa --force para continuar');
        process.exit(1);
      }
    }
    
    // 2. Tests
    if (!options.skipTests && !runTests()) {
      log.error('Tests fallaron');
      process.exit(1);
    }
    
    // 3. Backup
    let backupBranch;
    if (!options.skipBackup) {
      backupBranch = createBackup();
    }
    
    // 4. Build
    if (!options.skipBuild) {
      runCommand('node scripts/build.js', 'Ejecutando build de producción');
    }
    
    // 5. Deploy
    deployToGitHub();
    
    // 6. Post-deploy
    updateDeployInfo();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.green}${colors.bright}✅ Deploy completado exitosamente en ${duration}s${colors.reset}`);
    
    if (backupBranch) {
      console.log(`${colors.cyan}ℹ Backup disponible en branch: ${backupBranch}${colors.reset}`);
    }
    
    console.log(`${colors.cyan}ℹ Proyecto disponible en: https://github.com/yalilms/SoftCrown${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}${colors.bright}❌ Deploy falló${colors.reset}`);
    console.error(error.message);
    
    log.info('Para rollback, usa: git reset --hard HEAD~1');
    process.exit(1);
  }
}

/**
 * Función de rollback
 */
function rollback() {
  console.log(`${colors.bright}⏪ Iniciando rollback${colors.reset}\n`);
  
  try {
    // Verificar que hay commits para rollback
    const commits = execSync('git log --oneline -n 2', { encoding: 'utf8' });
    if (commits.split('\n').length < 2) {
      log.error('No hay commits anteriores para rollback');
      process.exit(1);
    }
    
    log.warning('⚠ ATENCIÓN: Esto deshará el último commit');
    log.info('Commits recientes:');
    console.log(commits);
    
    // Confirmar rollback
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('¿Confirmar rollback? (y/N): ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
          runCommand('git reset --hard HEAD~1', 'Revirtiendo último commit');
          runCommand('git push origin master --force', 'Forzando push del rollback');
          
          console.log(`\n${colors.green}${colors.bright}✅ Rollback completado${colors.reset}`);
        } catch (error) {
          console.log(`\n${colors.red}${colors.bright}❌ Rollback falló${colors.reset}`);
          console.error(error.message);
        }
      } else {
        log.info('Rollback cancelado');
      }
      rl.close();
    });
    
  } catch (error) {
    log.error(`Error en rollback: ${error.message}`);
    process.exit(1);
  }
}

// Parsing de argumentos
const args = process.argv.slice(2);
const command = args[0];
const options = {
  force: args.includes('--force'),
  skipGitCheck: args.includes('--skip-git-check'),
  skipTests: args.includes('--skip-tests'),
  skipBackup: args.includes('--skip-backup'),
  skipBuild: args.includes('--skip-build')
};

// Ejecutar según comando
switch (command) {
  case 'rollback':
    rollback();
    break;
  case 'deploy':
  default:
    deploy(options);
    break;
} 