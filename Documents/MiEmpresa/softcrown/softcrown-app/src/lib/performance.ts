// Performance monitoring and optimization utilities
// Web Vitals, performance metrics, error boundary, A/B testing

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  
  // Other metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
  domContentLoaded?: number;
  loadComplete?: number;
  
  // Custom metrics
  timeToInteractive?: number;
  totalBlockingTime?: number;
  
  // Navigation timing
  navigationStart?: number;
  responseStart?: number;
  domComplete?: number;
}

export interface ErrorReport {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: Date;
  userAgent: string;
  url: string;
  userId?: string;
  sessionId?: string;
  componentStack?: string;
  errorBoundary?: string;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  active: boolean;
  targetAudience?: {
    percentage: number;
    criteria?: Record<string, any>;
  };
}

// Performance Monitoring Service
export class PerformanceMonitoringService {
  private metrics: PerformanceMetrics = {};
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeMonitoring();
  }

  // Initialize performance monitoring
  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();
    
    // Monitor navigation timing
    this.observeNavigationTiming();
    
    // Monitor resource timing
    this.observeResourceTiming();
    
    // Monitor long tasks
    this.observeLongTasks();
  }

  // Observe Core Web Vitals
  private observeWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        // console.warn('LCP observer not supported:', error);
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        // console.warn('FID observer not supported:', error);
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.cls = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        // console.warn('CLS observer not supported:', error);
      }

      // First Contentful Paint (FCP)
      try {
        const fcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-contentful-paint') {
              this.metrics.fcp = entry.startTime;
              this.reportMetric('fcp', entry.startTime);
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        // console.warn('FCP observer not supported:', error);
      }
    }
  }

  // Observe navigation timing
  private observeNavigationTiming() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        this.metrics.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
        
        this.reportMetric('ttfb', this.metrics.ttfb);
        this.reportMetric('domContentLoaded', this.metrics.domContentLoaded);
        this.reportMetric('loadComplete', this.metrics.loadComplete);
      });
    }
  }

  // Observe resource timing
  private observeResourceTiming() {
    if ('PerformanceObserver' in window) {
      try {
        const resourceObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            // Track slow resources
            if (entry.duration > 1000) { // Resources taking more than 1s
              this.reportSlowResource({
                name: entry.name,
                duration: entry.duration,
                size: entry.transferSize,
                type: entry.initiatorType
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        // console.warn('Resource observer not supported:', error);
      }
    }
  }

  // Observe long tasks
  private observeLongTasks() {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach((entry: any) => {
            this.reportLongTask({
              duration: entry.duration,
              startTime: entry.startTime,
              attribution: entry.attribution
            });
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        // console.warn('Long task observer not supported:', error);
      }
    }
  }

  // Report metric to analytics
  private reportMetric(name: string, value: number) {
    // console.log(`Performance metric - ${name}:`, value);
    
    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: name,
        metric_value: Math.round(value),
        custom_map: { metric_id: name }
      });
    }
  }

  // Report slow resource
  private reportSlowResource(resource: any) {
    // console.warn('Slow resource detected:', resource);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'slow_resource', {
        resource_name: resource.name,
        resource_duration: Math.round(resource.duration),
        resource_size: resource.size,
        resource_type: resource.type
      });
    }
  }

  // Report long task
  private reportLongTask(task: any) {
    // console.warn('Long task detected:', task);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'long_task', {
        task_duration: Math.round(task.duration),
        task_start_time: Math.round(task.startTime)
      });
    }
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Get performance score
  getPerformanceScore(): number {
    const { lcp, fid, cls, fcp } = this.metrics;
    let score = 100;

    // LCP scoring (0-2.5s good, 2.5-4s needs improvement, >4s poor)
    if (lcp) {
      if (lcp > 4000) score -= 30;
      else if (lcp > 2500) score -= 15;
    }

    // FID scoring (0-100ms good, 100-300ms needs improvement, >300ms poor)
    if (fid) {
      if (fid > 300) score -= 25;
      else if (fid > 100) score -= 10;
    }

    // CLS scoring (0-0.1 good, 0.1-0.25 needs improvement, >0.25 poor)
    if (cls) {
      if (cls > 0.25) score -= 25;
      else if (cls > 0.1) score -= 10;
    }

    // FCP scoring (0-1.8s good, 1.8-3s needs improvement, >3s poor)
    if (fcp) {
      if (fcp > 3000) score -= 20;
      else if (fcp > 1800) score -= 10;
    }

    return Math.max(0, score);
  }

  // Cleanup observers
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Error Reporting Service
export class ErrorReportingService {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  constructor() {
    this.initializeErrorHandling();
  }

  // Initialize error handling
  private initializeErrorHandling() {
    if (typeof window === 'undefined') return;

    // Global error handler
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  // Report error
  reportError(error: Partial<ErrorReport>) {
    const fullError: ErrorReport = {
      message: error.message || 'Unknown error',
      stack: error.stack,
      filename: error.filename,
      lineno: error.lineno,
      colno: error.colno,
      timestamp: error.timestamp || new Date(),
      userAgent: error.userAgent || navigator.userAgent,
      url: error.url || window.location.href,
      userId: error.userId,
      sessionId: error.sessionId,
      componentStack: error.componentStack,
      errorBoundary: error.errorBoundary
    };

    // Add to queue
    this.errorQueue.push(fullError);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Log error
    // console.error('Error reported:', fullError);

    // Send to analytics
    this.sendErrorToAnalytics(fullError);

    // Send to external service (e.g., Sentry, LogRocket)
    this.sendErrorToExternalService(fullError);
  }

  // Send error to analytics
  private sendErrorToAnalytics(error: ErrorReport) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_stack: error.stack?.substring(0, 500), // Limit stack trace length
          error_filename: error.filename,
          error_component: error.errorBoundary
        }
      });
    }
  }

  // Send error to external service
  private sendErrorToExternalService(error: ErrorReport) {
    // This would integrate with services like Sentry, LogRocket, etc.
    // For now, we'll just log it
    if (process.env.NODE_ENV === 'production') {
      // In production, you would send to your error reporting service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error)
      }).catch(err => console.error('Failed to send error report:', err));
    }
  }

  // Get error reports
  getErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }

  // Clear error queue
  clearErrors() {
    this.errorQueue = [];
  }
}

// A/B Testing Service
export class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private userVariants: Map<string, string> = new Map();

  constructor() {
    this.loadTestsFromStorage();
  }

  // Load tests from storage
  private loadTestsFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ab_tests');
      if (stored) {
        const tests = JSON.parse(stored);
        tests.forEach((test: ABTest) => {
          this.tests.set(test.id, test);
        });
      }

      const variants = localStorage.getItem('ab_user_variants');
      if (variants) {
        const userVariants = JSON.parse(variants);
        Object.entries(userVariants).forEach(([testId, variantId]) => {
          this.userVariants.set(testId, variantId as string);
        });
      }
    } catch (error) {
      console.error('Failed to load A/B tests from storage:', error);
    }
  }

  // Save tests to storage
  private saveTestsToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const tests = Array.from(this.tests.values());
      localStorage.setItem('ab_tests', JSON.stringify(tests));

      const userVariants = Object.fromEntries(this.userVariants);
      localStorage.setItem('ab_user_variants', JSON.stringify(userVariants));
    } catch (error) {
      console.error('Failed to save A/B tests to storage:', error);
    }
  }

  // Add test
  addTest(test: ABTest) {
    this.tests.set(test.id, test);
    this.saveTestsToStorage();
  }

  // Get user variant for test
  getUserVariant(testId: string, userId?: string): string | null {
    const test = this.tests.get(testId);
    if (!test || !test.active) {
      return null;
    }

    // Check if user already has a variant assigned
    if (this.userVariants.has(testId)) {
      return this.userVariants.get(testId)!;
    }

    // Check target audience
    if (test.targetAudience) {
      const random = Math.random() * 100;
      if (random > test.targetAudience.percentage) {
        return null; // User not in target audience
      }
    }

    // Assign variant based on weights
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const variant of test.variants) {
      currentWeight += variant.weight;
      if (random <= currentWeight) {
        this.userVariants.set(testId, variant.id);
        this.saveTestsToStorage();
        
        // Track assignment
        this.trackVariantAssignment(testId, variant.id, userId);
        
        return variant.id;
      }
    }

    return null;
  }

  // Get variant config
  getVariantConfig(testId: string, variantId: string): Record<string, any> | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const variant = test.variants.find(v => v.id === variantId);
    return variant?.config || null;
  }

  // Track conversion
  trackConversion(testId: string, conversionType: string, value?: number, userId?: string) {
    const variantId = this.userVariants.get(testId);
    if (!variantId) return;

    // console.log(`A/B Test Conversion - Test: ${testId}, Variant: ${variantId}, Type: ${conversionType}, Value: ${value}`);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_conversion', {
        test_id: testId,
        variant_id: variantId,
        conversion_type: conversionType,
        conversion_value: value,
        user_id: userId
      });
    }
  }

  // Track variant assignment
  private trackVariantAssignment(testId: string, variantId: string, userId?: string) {
    // console.log(`A/B Test Assignment - Test: ${testId}, Variant: ${variantId}`);

    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ab_test_assignment', {
        test_id: testId,
        variant_id: variantId,
        user_id: userId
      });
    }
  }

  // Get active tests
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.active);
  }

  // Remove test
  removeTest(testId: string) {
    this.tests.delete(testId);
    this.userVariants.delete(testId);
    this.saveTestsToStorage();
  }
}

// Conversion Funnel Analysis
export class ConversionFunnelService {
  private funnelSteps: Map<string, string[]> = new Map();
  private userProgress: Map<string, Map<string, number>> = new Map();

  // Define funnel steps
  defineFunnel(funnelId: string, steps: string[]) {
    this.funnelSteps.set(funnelId, steps);
  }

  // Track funnel step
  trackStep(funnelId: string, step: string, userId?: string) {
    const steps = this.funnelSteps.get(funnelId);
    if (!steps || !steps.includes(step)) {
      // console.warn(`Invalid funnel step: ${step} for funnel: ${funnelId}`);
      return;
    }

    const userKey = userId || 'anonymous';
    if (!this.userProgress.has(userKey)) {
      this.userProgress.set(userKey, new Map());
    }

    const userFunnels = this.userProgress.get(userKey)!;
    const stepIndex = steps.indexOf(step);
    const currentProgress = userFunnels.get(funnelId) || -1;

    // Only advance if this is the next step
    if (stepIndex === currentProgress + 1) {
      userFunnels.set(funnelId, stepIndex);
      
      // console.log(`Funnel progress - ${funnelId}: ${step} (${stepIndex + 1}/${steps.length})`);

      // Send to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'funnel_step', {
          funnel_id: funnelId,
          step_name: step,
          step_index: stepIndex,
          user_id: userId
        });
      }
    }
  }

  // Get funnel analytics
  getFunnelAnalytics(funnelId: string): any {
    const steps = this.funnelSteps.get(funnelId);
    if (!steps) return null;

    const stepCounts = new Array(steps.length).fill(0);
    
    for (const userFunnels of this.userProgress.values()) {
      const progress = userFunnels.get(funnelId);
      if (progress !== undefined) {
        for (let i = 0; i <= progress; i++) {
          stepCounts[i]++;
        }
      }
    }

    const analytics = {
      funnelId,
      steps: steps.map((step, index) => ({
        name: step,
        count: stepCounts[index],
        conversionRate: index === 0 ? 100 : (stepCounts[index] / stepCounts[0]) * 100,
        dropoffRate: index === 0 ? 0 : ((stepCounts[index - 1] - stepCounts[index]) / stepCounts[index - 1]) * 100
      })),
      totalUsers: stepCounts[0],
      completionRate: stepCounts[0] > 0 ? (stepCounts[stepCounts.length - 1] / stepCounts[0]) * 100 : 0
    };

    return analytics;
  }
}

// Export singleton instances
export const performanceMonitoring = new PerformanceMonitoringService();
export const errorReporting = new ErrorReportingService();
export const abTesting = new ABTestingService();
export const conversionFunnel = new ConversionFunnelService();

// Initialize default funnels
conversionFunnel.defineFunnel('contact_form', [
  'form_view',
  'step1_complete',
  'step2_complete', 
  'step3_complete',
  'form_submit'
]);

conversionFunnel.defineFunnel('quote_calculator', [
  'calculator_view',
  'category_select',
  'features_select',
  'quote_generate',
  'quote_request'
]);

conversionFunnel.defineFunnel('chat_to_lead', [
  'chat_start',
  'service_inquiry',
  'contact_provided',
  'appointment_booked'
]);
