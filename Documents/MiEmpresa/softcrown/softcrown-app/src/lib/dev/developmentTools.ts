// Development Tools Service
export interface DevToolsConfig {
  hotReload: boolean;
  strictMode: boolean;
  debugging: boolean;
  profiling: boolean;
  errorBoundaries: boolean;
  performanceMonitoring: boolean;
  memoryLeakDetection: boolean;
  bundleAnalysis: boolean;
  codeQuality: boolean;
  accessibilityChecks: boolean;
}

export interface ErrorInfo {
  id: string;
  message: string;
  stack: string;
  component: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  userAgent: string;
  url: string;
  userId?: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  component?: string;
  category: 'timing' | 'memory' | 'network' | 'rendering';
  threshold?: number;
  status: 'good' | 'warning' | 'critical';
}

export interface CodeQualityIssue {
  id: string;
  type: 'eslint' | 'typescript' | 'accessibility' | 'performance' | 'security';
  severity: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line: number;
  column: number;
  rule?: string;
  fixable: boolean;
  suggestion?: string;
}

export interface DebugSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  breakpoints: Breakpoint[];
  variables: VariableSnapshot[];
  callStack: CallStackFrame[];
  console: ConsoleMessage[];
  networkRequests: NetworkRequest[];
}

export interface Breakpoint {
  id: string;
  file: string;
  line: number;
  condition?: string;
  enabled: boolean;
  hitCount: number;
}

export interface VariableSnapshot {
  timestamp: Date;
  scope: 'global' | 'local' | 'closure';
  variables: Record<string, any>;
}

export interface CallStackFrame {
  function: string;
  file: string;
  line: number;
  column: number;
  source: string;
}

export interface ConsoleMessage {
  id: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: Date;
  source: string;
  args: any[];
}

export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  duration: number;
  size: number;
  timestamp: Date;
  headers: Record<string, string>;
  response?: any;
}

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  modules: ModuleInfo[];
  duplicates: DuplicateModule[];
  recommendations: string[];
  treeshaking: TreeshakingInfo;
}

export interface ChunkInfo {
  name: string;
  size: number;
  modules: string[];
  isEntry: boolean;
  isAsync: boolean;
}

export interface ModuleInfo {
  name: string;
  size: number;
  chunks: string[];
  dependencies: string[];
  usedExports: string[];
  unusedExports: string[];
}

export interface DuplicateModule {
  name: string;
  chunks: string[];
  totalSize: number;
  instances: number;
}

export interface TreeshakingInfo {
  eliminatedModules: string[];
  eliminatedSize: number;
  potentialSavings: string[];
}

export class DevelopmentTools {
  private config: DevToolsConfig;
  private errors: ErrorInfo[] = [];
  private metrics: PerformanceMetric[] = [];
  private qualityIssues: CodeQualityIssue[] = [];
  private debugSession: DebugSession | null = null;
  private isProduction: boolean = false;
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor(config: Partial<DevToolsConfig> = {}) {
    this.config = {
      hotReload: true,
      strictMode: true,
      debugging: true,
      profiling: true,
      errorBoundaries: true,
      performanceMonitoring: true,
      memoryLeakDetection: true,
      bundleAnalysis: true,
      codeQuality: true,
      accessibilityChecks: true,
      ...config,
    };

    this.isProduction = process.env.NODE_ENV === 'production';
    this.initialize();
  }

  // Initialization
  private initialize(): void {
    if (this.isProduction) {
      // Disable most dev tools in production
      this.config = {
        ...this.config,
        debugging: false,
        profiling: false,
        bundleAnalysis: false,
        codeQuality: false,
      };
    }

    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupHotReload();
    this.setupMemoryLeakDetection();
  }

  // Error Handling
  private setupErrorHandling(): void {
    if (!this.config.errorBoundaries) return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        stack: event.error?.stack || '',
        component: 'Global',
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || '',
        component: 'Promise',
        severity: 'high',
        context: { reason: event.reason },
      });
    });

    // React error boundary integration
    this.setupReactErrorBoundary();
  }

  logError(error: Partial<ErrorInfo>): void {
    const errorInfo: ErrorInfo = {
      id: `error-${Date.now()}`,
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      component: error.component || 'Unknown',
      timestamp: new Date(),
      severity: error.severity || 'medium',
      context: error.context || {},
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: error.userId,
    };

    this.errors.push(errorInfo);
    
    // Keep only last 100 errors
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }

    // Send to external service in production
    if (this.isProduction) {
      this.sendErrorToService(errorInfo);
    }

    console.error('DevTools Error:', errorInfo);
  }

  getErrors(severity?: string): ErrorInfo[] {
    return severity 
      ? this.errors.filter(e => e.severity === severity)
      : this.errors;
  }

  clearErrors(): void {
    this.errors = [];
  }

  // Performance Monitoring
  private setupPerformanceMonitoring(): void {
    if (!this.config.performanceMonitoring || !('PerformanceObserver' in window)) return;

    // Largest Contentful Paint
    this.createObserver('largest-contentful-paint', (entries) => {
      entries.forEach(entry => {
        this.logMetric({
          name: 'LCP',
          value: entry.startTime,
          unit: 'ms',
          category: 'timing',
          threshold: 2500,
        });
      });
    });

    // First Input Delay
    this.createObserver('first-input', (entries) => {
      entries.forEach(entry => {
        this.logMetric({
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          unit: 'ms',
          category: 'timing',
          threshold: 100,
        });
      });
    });

    // Cumulative Layout Shift
    this.createObserver('layout-shift', (entries) => {
      let clsValue = 0;
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      if (clsValue > 0) {
        this.logMetric({
          name: 'CLS',
          value: clsValue,
          unit: 'score',
          category: 'rendering',
          threshold: 0.1,
        });
      }
    });

    // Long Tasks
    this.createObserver('longtask', (entries) => {
      entries.forEach(entry => {
        this.logMetric({
          name: 'Long Task',
          value: entry.duration,
          unit: 'ms',
          category: 'timing',
          threshold: 50,
        });
      });
    });

    // Memory Usage
    this.monitorMemoryUsage();
  }

  private createObserver(type: string, callback: (entries: any[]) => void): void {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Failed to create ${type} observer:`, error);
    }
  }

  private monitorMemoryUsage(): void {
    if (!('memory' in performance)) return;

    setInterval(() => {
      const memory = (performance as any).memory;
      
      this.logMetric({
        name: 'Used JS Heap Size',
        value: memory.usedJSHeapSize,
        unit: 'bytes',
        category: 'memory',
        threshold: 50 * 1024 * 1024, // 50MB
      });

      this.logMetric({
        name: 'Total JS Heap Size',
        value: memory.totalJSHeapSize,
        unit: 'bytes',
        category: 'memory',
      });
    }, 10000); // Every 10 seconds
  }

  logMetric(metric: Partial<PerformanceMetric>): void {
    const performanceMetric: PerformanceMetric = {
      id: `metric-${Date.now()}`,
      name: metric.name || 'Unknown',
      value: metric.value || 0,
      unit: metric.unit || 'ms',
      timestamp: new Date(),
      component: metric.component,
      category: metric.category || 'timing',
      threshold: metric.threshold,
      status: this.getMetricStatus(metric.value || 0, metric.threshold),
    };

    this.metrics.push(performanceMetric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    if (performanceMetric.status === 'critical') {
      console.warn('Performance Issue:', performanceMetric);
    }
  }

  private getMetricStatus(value: number, threshold?: number): 'good' | 'warning' | 'critical' {
    if (!threshold) return 'good';
    
    if (value > threshold * 1.5) return 'critical';
    if (value > threshold) return 'warning';
    return 'good';
  }

  getMetrics(category?: string): PerformanceMetric[] {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : this.metrics;
  }

  // Hot Reload
  private setupHotReload(): void {
    if (!this.config.hotReload || this.isProduction) return;

    // Mock hot reload setup - in real implementation, integrate with webpack HMR
    if (module.hot) {
      module.hot.accept();
      
      module.hot.addStatusHandler((status) => {
        console.log('HMR Status:', status);
      });

      module.hot.addDisposeHandler(() => {
        this.cleanup();
      });
    }
  }

  // Memory Leak Detection
  private setupMemoryLeakDetection(): void {
    if (!this.config.memoryLeakDetection) return;

    let lastMemoryUsage = 0;
    const memoryGrowthThreshold = 10 * 1024 * 1024; // 10MB

    setInterval(() => {
      if ('memory' in performance) {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        const growth = currentMemory - lastMemoryUsage;

        if (growth > memoryGrowthThreshold) {
          console.warn('Potential memory leak detected:', {
            growth: `${(growth / 1024 / 1024).toFixed(2)}MB`,
            total: `${(currentMemory / 1024 / 1024).toFixed(2)}MB`,
          });
        }

        lastMemoryUsage = currentMemory;
      }
    }, 30000); // Check every 30 seconds
  }

  // Debugging
  startDebugSession(): string {
    if (!this.config.debugging) return '';

    const sessionId = `debug-${Date.now()}`;
    this.debugSession = {
      id: sessionId,
      startTime: new Date(),
      breakpoints: [],
      variables: [],
      callStack: [],
      console: [],
      networkRequests: [],
    };

    this.setupConsoleInterception();
    this.setupNetworkInterception();

    console.log('Debug session started:', sessionId);
    return sessionId;
  }

  stopDebugSession(): void {
    if (this.debugSession) {
      this.debugSession.endTime = new Date();
      console.log('Debug session ended:', this.debugSession.id);
      this.debugSession = null;
    }
  }

  addBreakpoint(file: string, line: number, condition?: string): string {
    if (!this.debugSession) return '';

    const breakpoint: Breakpoint = {
      id: `bp-${Date.now()}`,
      file,
      line,
      condition,
      enabled: true,
      hitCount: 0,
    };

    this.debugSession.breakpoints.push(breakpoint);
    return breakpoint.id;
  }

  private setupConsoleInterception(): void {
    if (!this.debugSession) return;

    const originalConsole = { ...console };
    
    ['log', 'info', 'warn', 'error', 'debug'].forEach(level => {
      (console as any)[level] = (...args: any[]) => {
        if (this.debugSession) {
          this.debugSession.console.push({
            id: `console-${Date.now()}`,
            level: level as any,
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date(),
            source: this.getCallSource(),
            args,
          });
        }
        
        (originalConsole as any)[level](...args);
      };
    });
  }

  private setupNetworkInterception(): void {
    if (!this.debugSession) return;

    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : args[0].url;
      
      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        if (this.debugSession) {
          this.debugSession.networkRequests.push({
            id: `req-${Date.now()}`,
            url,
            method: args[1]?.method || 'GET',
            status: response.status,
            duration,
            size: parseInt(response.headers.get('content-length') || '0'),
            timestamp: new Date(),
            headers: Object.fromEntries(response.headers.entries()),
          });
        }
        
        return response;
      } catch (error) {
        if (this.debugSession) {
          this.debugSession.networkRequests.push({
            id: `req-${Date.now()}`,
            url,
            method: args[1]?.method || 'GET',
            status: 0,
            duration: Date.now() - startTime,
            size: 0,
            timestamp: new Date(),
            headers: {},
          });
        }
        throw error;
      }
    };
  }

  private getCallSource(): string {
    const stack = new Error().stack;
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    // Skip first 3 lines (Error, getCallSource, console method)
    const caller = lines[3];
    return caller ? caller.trim() : 'unknown';
  }

  // Code Quality
  runCodeQualityCheck(): CodeQualityIssue[] {
    if (!this.config.codeQuality) return [];

    // Mock code quality issues - in real implementation, integrate with ESLint, TypeScript, etc.
    const mockIssues: CodeQualityIssue[] = [
      {
        id: 'issue-1',
        type: 'eslint',
        severity: 'warning',
        message: 'Unused variable "unusedVar"',
        file: 'src/components/Example.tsx',
        line: 15,
        column: 10,
        rule: 'no-unused-vars',
        fixable: true,
        suggestion: 'Remove unused variable or prefix with underscore',
      },
      {
        id: 'issue-2',
        type: 'typescript',
        severity: 'error',
        message: 'Property "nonExistent" does not exist on type',
        file: 'src/utils/helper.ts',
        line: 23,
        column: 5,
        fixable: false,
        suggestion: 'Check property name or add to interface',
      },
    ];

    this.qualityIssues = mockIssues;
    return mockIssues;
  }

  getQualityIssues(type?: string): CodeQualityIssue[] {
    return type 
      ? this.qualityIssues.filter(issue => issue.type === type)
      : this.qualityIssues;
  }

  // Bundle Analysis
  analyzeBundleSize(): BundleAnalysis {
    if (!this.config.bundleAnalysis) {
      return {
        totalSize: 0,
        gzippedSize: 0,
        chunks: [],
        modules: [],
        duplicates: [],
        recommendations: [],
        treeshaking: { eliminatedModules: [], eliminatedSize: 0, potentialSavings: [] },
      };
    }

    // Mock bundle analysis - in real implementation, integrate with webpack-bundle-analyzer
    return {
      totalSize: 2.5 * 1024 * 1024, // 2.5MB
      gzippedSize: 800 * 1024, // 800KB
      chunks: [
        {
          name: 'main',
          size: 1.2 * 1024 * 1024,
          modules: ['src/app/page.tsx', 'src/components/ui/Button.tsx'],
          isEntry: true,
          isAsync: false,
        },
        {
          name: 'vendor',
          size: 1.3 * 1024 * 1024,
          modules: ['node_modules/react', 'node_modules/next'],
          isEntry: false,
          isAsync: false,
        },
      ],
      modules: [
        {
          name: 'react',
          size: 500 * 1024,
          chunks: ['vendor'],
          dependencies: [],
          usedExports: ['useState', 'useEffect'],
          unusedExports: ['useMemo', 'useCallback'],
        },
      ],
      duplicates: [
        {
          name: 'lodash',
          chunks: ['main', 'vendor'],
          totalSize: 100 * 1024,
          instances: 2,
        },
      ],
      recommendations: [
        'Consider code splitting for better performance',
        'Remove unused exports from react',
        'Deduplicate lodash instances',
      ],
      treeshaking: {
        eliminatedModules: ['unused-module'],
        eliminatedSize: 50 * 1024,
        potentialSavings: ['Remove unused CSS classes', 'Tree-shake utility libraries'],
      },
    };
  }

  // React Error Boundary
  private setupReactErrorBoundary(): void {
    // This would be used in a React Error Boundary component
    window.addEventListener('react-error', ((event: CustomEvent) => {
      this.logError({
        message: event.detail.error.message,
        stack: event.detail.error.stack,
        component: event.detail.errorInfo.componentStack,
        severity: 'high',
        context: event.detail.errorInfo,
      });
    }) as EventListener);
  }

  // Profiling
  startProfiling(): void {
    if (!this.config.profiling) return;

    console.profile('DevTools Profiling');
    console.time('DevTools Performance');
  }

  stopProfiling(): void {
    if (!this.config.profiling) return;

    console.profileEnd('DevTools Profiling');
    console.timeEnd('DevTools Performance');
  }

  // Configuration
  updateConfig(updates: Partial<DevToolsConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  getConfig(): DevToolsConfig {
    return { ...this.config };
  }

  // Cleanup
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
    
    if (this.debugSession) {
      this.stopDebugSession();
    }
  }

  // External Service Integration
  private sendErrorToService(error: ErrorInfo): void {
    // Mock implementation - integrate with Sentry, LogRocket, etc.
    if (this.isProduction) {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      }).catch(console.error);
    }
  }

  // Export Data
  exportData(): string {
    return JSON.stringify({
      errors: this.errors,
      metrics: this.metrics,
      qualityIssues: this.qualityIssues,
      debugSession: this.debugSession,
      config: this.config,
    }, null, 2);
  }

  // Health Check
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    metrics: Record<string, number>;
  } {
    const criticalErrors = this.errors.filter(e => e.severity === 'critical').length;
    const criticalMetrics = this.metrics.filter(m => m.status === 'critical').length;
    const codeErrors = this.qualityIssues.filter(i => i.severity === 'error').length;

    const issues: string[] = [];
    if (criticalErrors > 0) issues.push(`${criticalErrors} critical errors`);
    if (criticalMetrics > 0) issues.push(`${criticalMetrics} performance issues`);
    if (codeErrors > 0) issues.push(`${codeErrors} code quality errors`);

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalErrors > 0 || codeErrors > 0) status = 'critical';
    else if (criticalMetrics > 0 || issues.length > 0) status = 'warning';

    return {
      status,
      issues,
      metrics: {
        totalErrors: this.errors.length,
        criticalErrors,
        performanceIssues: criticalMetrics,
        codeQualityIssues: this.qualityIssues.length,
      },
    };
  }
}

// Export singleton instance
export const devTools = new DevelopmentTools();
