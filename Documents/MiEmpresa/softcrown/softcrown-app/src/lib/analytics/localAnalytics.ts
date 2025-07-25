// Local Analytics and Monitoring System
export interface AnalyticsEvent {
  id: string;
  type: 'pageview' | 'click' | 'form_submit' | 'error' | 'performance' | 'custom';
  name: string;
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
  referrer: string;
  viewport: { width: number; height: number };
}

export interface UserSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  events: number;
  bounced: boolean;
  device: DeviceInfo;
  location: LocationInfo;
  source: TrafficSource;
}

export interface DeviceInfo {
  type: 'desktop' | 'tablet' | 'mobile';
  os: string;
  browser: string;
  screenResolution: string;
  colorDepth: number;
  language: string;
  timezone: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
}

export interface TrafficSource {
  source: string;
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
}

export interface HeatmapData {
  id: string;
  url: string;
  viewport: string;
  clicks: HeatmapPoint[];
  moves: HeatmapPoint[];
  scrolls: ScrollData[];
  timestamp: Date;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  element?: string;
  timestamp: Date;
}

export interface ScrollData {
  maxScroll: number;
  timeToScroll: number;
  scrollEvents: { position: number; timestamp: Date }[];
}

export interface FormAnalytics {
  formId: string;
  url: string;
  fields: FormFieldAnalytics[];
  submissions: number;
  abandonment: number;
  completionRate: number;
  averageTime: number;
  errors: FormError[];
}

export interface FormFieldAnalytics {
  name: string;
  type: string;
  interactions: number;
  focusTime: number;
  errors: number;
  correctionRate: number;
  abandonmentRate: number;
}

export interface FormError {
  field: string;
  error: string;
  count: number;
  timestamp: Date;
}

export interface RealUserMetrics {
  id: string;
  url: string;
  timestamp: Date;
  navigationTiming: {
    dns: number;
    tcp: number;
    request: number;
    response: number;
    processing: number;
    onLoad: number;
  };
  paintTiming: {
    firstPaint: number;
    firstContentfulPaint: number;
  };
  vitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  resources: ResourceTiming[];
}

export interface ResourceTiming {
  name: string;
  type: string;
  size: number;
  duration: number;
  startTime: number;
}

export interface ErrorReport {
  id: string;
  message: string;
  stack: string;
  url: string;
  line: number;
  column: number;
  timestamp: Date;
  sessionId: string;
  userId?: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: Record<string, any>;
  frequency: number;
}

export class LocalAnalytics {
  private events: AnalyticsEvent[] = [];
  private sessions: Map<string, UserSession> = new Map();
  private currentSession: UserSession | null = null;
  private heatmaps: Map<string, HeatmapData> = new Map();
  private formAnalytics: Map<string, FormAnalytics> = new Map();
  private rumMetrics: RealUserMetrics[] = [];
  private errors: ErrorReport[] = [];
  private isEnabled: boolean = true;
  private samplingRate: number = 1.0;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setupSession();
    this.setupEventListeners();
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupHeatmapTracking();
    this.setupFormTracking();
    this.startDataPersistence();
  }

  // Session Management
  private setupSession(): void {
    const sessionId = this.getOrCreateSessionId();
    const userId = this.getUserId();

    this.currentSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      events: 0,
      bounced: true,
      device: this.getDeviceInfo(),
      location: this.getLocationInfo(),
      source: this.getTrafficSource(),
    };

    this.sessions.set(sessionId, this.currentSession);
    this.trackPageView();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private getUserId(): string | undefined {
    return localStorage.getItem('analytics_user_id') || undefined;
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    
    return {
      type: this.getDeviceType(),
      os: this.getOS(userAgent),
      browser: this.getBrowser(userAgent),
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
    return 'desktop';
  }

  private getOS(userAgent: string): string {
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  private getBrowser(userAgent: string): string {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getLocationInfo(): LocationInfo {
    // Mock location - in real implementation, use IP geolocation service
    return {
      country: 'Spain',
      region: 'Madrid',
      city: 'Madrid',
    };
  }

  private getTrafficSource(): TrafficSource {
    const referrer = document.referrer;
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('utm_source')) {
      return {
        source: urlParams.get('utm_source') || 'unknown',
        medium: urlParams.get('utm_medium') || 'unknown',
        campaign: urlParams.get('utm_campaign') || undefined,
        term: urlParams.get('utm_term') || undefined,
        content: urlParams.get('utm_content') || undefined,
      };
    }

    if (referrer) {
      try {
        const referrerUrl = new URL(referrer);
        return {
          source: referrerUrl.hostname,
          medium: 'referral',
        };
      } catch {
        return { source: 'direct', medium: 'none' };
      }
    }

    return { source: 'direct', medium: 'none' };
  }

  // Event Tracking
  track(eventName: string, properties: Record<string, any> = {}): void {
    if (!this.isEnabled || Math.random() > this.samplingRate) return;

    const event: AnalyticsEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'custom',
      name: eventName,
      properties,
      timestamp: new Date(),
      sessionId: this.currentSession?.id || '',
      userId: this.currentSession?.userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };

    this.events.push(event);
    
    if (this.currentSession) {
      this.currentSession.events++;
      this.currentSession.bounced = false;
    }

    this.limitEventStorage();
  }

  trackPageView(): void {
    this.track('page_view', {
      title: document.title,
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });

    if (this.currentSession) {
      this.currentSession.pageViews++;
    }
  }

  trackClick(element: HTMLElement, properties: Record<string, any> = {}): void {
    const clickProperties = {
      ...properties,
      element: element.tagName.toLowerCase(),
      id: element.id || undefined,
      className: element.className || undefined,
      text: element.textContent?.slice(0, 100) || undefined,
      href: element.getAttribute('href') || undefined,
    };

    this.track('click', clickProperties);
  }

  trackFormSubmit(formId: string, success: boolean, errors: string[] = []): void {
    this.track('form_submit', {
      formId,
      success,
      errors,
      errorCount: errors.length,
    });
  }

  // Event Listeners
  private setupEventListeners(): void {
    // Page visibility
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endSession();
      } else {
        this.setupSession();
      }
    });

    // Before unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });

    // Click tracking
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.tagName === 'BUTTON' || target.getAttribute('data-track')) {
        this.trackClick(target);
      }
    });

    // Form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.getAttribute('data-form-id') || 'unknown';
      this.trackFormSubmit(formId, true);
    });
  }

  private endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
      this.sessions.set(this.currentSession.id, this.currentSession);
    }
  }

  // Performance Monitoring
  private setupPerformanceMonitoring(): void {
    if (!('PerformanceObserver' in window)) return;

    // Navigation timing
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          this.collectRUMMetrics(navigation);
        }
      }, 0);
    });

    // Core Web Vitals
    this.observeWebVitals();
  }

  private collectRUMMetrics(navigation: PerformanceNavigationTiming): void {
    const rumMetric: RealUserMetrics = {
      id: `rum-${Date.now()}`,
      url: window.location.href,
      timestamp: new Date(),
      navigationTiming: {
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        processing: navigation.domContentLoadedEventStart - navigation.responseEnd,
        onLoad: navigation.loadEventEnd - navigation.loadEventStart,
      },
      paintTiming: {
        firstPaint: 0,
        firstContentfulPaint: 0,
      },
      vitals: {
        lcp: 0,
        fid: 0,
        cls: 0,
      },
      resources: this.getResourceTimings(),
    };

    // Paint timing
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach(entry => {
      if (entry.name === 'first-paint') {
        rumMetric.paintTiming.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        rumMetric.paintTiming.firstContentfulPaint = entry.startTime;
      }
    });

    this.rumMetrics.push(rumMetric);
    this.limitRUMStorage();
  }

  private getResourceTimings(): ResourceTiming[] {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      size: resource.transferSize || 0,
      duration: resource.duration,
      startTime: resource.startTime,
    }));
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  private observeWebVitals(): void {
    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.track('web_vital', {
        name: 'LCP',
        value: lastEntry.startTime,
        rating: lastEntry.startTime > 2500 ? 'poor' : lastEntry.startTime > 1200 ? 'needs-improvement' : 'good',
      });
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        const fid = entry.processingStart - entry.startTime;
        this.track('web_vital', {
          name: 'FID',
          value: fid,
          rating: fid > 300 ? 'poor' : fid > 100 ? 'needs-improvement' : 'good',
        });
      });
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      });
      
      this.track('web_vital', {
        name: 'CLS',
        value: clsValue,
        rating: clsValue > 0.25 ? 'poor' : clsValue > 0.1 ? 'needs-improvement' : 'good',
      });
    }).observe({ type: 'layout-shift', buffered: true });
  }

  // Error Tracking
  private setupErrorTracking(): void {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack || '',
        url: event.filename || window.location.href,
        line: event.lineno || 0,
        column: event.colno || 0,
        severity: 'high',
        context: { type: 'javascript' },
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack || '',
        url: window.location.href,
        line: 0,
        column: 0,
        severity: 'high',
        context: { type: 'promise', reason: event.reason },
      });
    });
  }

  private trackError(errorInfo: Partial<ErrorReport>): void {
    const error: ErrorReport = {
      id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      message: errorInfo.message || 'Unknown error',
      stack: errorInfo.stack || '',
      url: errorInfo.url || window.location.href,
      line: errorInfo.line || 0,
      column: errorInfo.column || 0,
      timestamp: new Date(),
      sessionId: this.currentSession?.id || '',
      userId: this.currentSession?.userId,
      userAgent: navigator.userAgent,
      severity: errorInfo.severity || 'medium',
      context: errorInfo.context || {},
      frequency: 1,
    };

    // Check for duplicate errors
    const existingError = this.errors.find(e => 
      e.message === error.message && 
      e.line === error.line && 
      e.url === error.url
    );

    if (existingError) {
      existingError.frequency++;
      existingError.timestamp = error.timestamp;
    } else {
      this.errors.push(error);
    }

    this.limitErrorStorage();
    this.track('error', error);
  }

  // Heatmap Tracking
  private setupHeatmapTracking(): void {
    const currentUrl = window.location.pathname;
    const viewport = `${window.innerWidth}x${window.innerHeight}`;
    const heatmapId = `${currentUrl}-${viewport}`;

    if (!this.heatmaps.has(heatmapId)) {
      this.heatmaps.set(heatmapId, {
        id: heatmapId,
        url: currentUrl,
        viewport,
        clicks: [],
        moves: [],
        scrolls: [],
        timestamp: new Date(),
      });
    }

    const heatmap = this.heatmaps.get(heatmapId)!;

    // Click tracking
    document.addEventListener('click', (event) => {
      heatmap.clicks.push({
        x: event.clientX,
        y: event.clientY,
        intensity: 1,
        element: (event.target as HTMLElement).tagName.toLowerCase(),
        timestamp: new Date(),
      });
    });

    // Mouse movement tracking (throttled)
    let lastMoveTime = 0;
    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      if (now - lastMoveTime > 100) { // Throttle to every 100ms
        heatmap.moves.push({
          x: event.clientX,
          y: event.clientY,
          intensity: 1,
          timestamp: new Date(),
        });
        lastMoveTime = now;
      }
    });

    // Scroll tracking
    let maxScroll = 0;
    const scrollEvents: { position: number; timestamp: Date }[] = [];
    
    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      maxScroll = Math.max(maxScroll, scrollPercent);
      
      scrollEvents.push({
        position: scrollPercent,
        timestamp: new Date(),
      });
    });

    // Save scroll data on page unload
    window.addEventListener('beforeunload', () => {
      heatmap.scrolls.push({
        maxScroll,
        timeToScroll: scrollEvents.length > 0 ? scrollEvents[scrollEvents.length - 1].timestamp.getTime() - scrollEvents[0].timestamp.getTime() : 0,
        scrollEvents,
      });
    });
  }

  // Form Tracking
  private setupFormTracking(): void {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      const formId = form.id || form.getAttribute('data-form-id') || `form-${Date.now()}`;
      
      if (!this.formAnalytics.has(formId)) {
        this.formAnalytics.set(formId, {
          formId,
          url: window.location.href,
          fields: [],
          submissions: 0,
          abandonment: 0,
          completionRate: 0,
          averageTime: 0,
          errors: [],
        });
      }

      const formAnalytics = this.formAnalytics.get(formId)!;
      const startTime = Date.now();

      // Track field interactions
      const fields = form.querySelectorAll('input, textarea, select');
      fields.forEach(field => {
        const fieldName = field.getAttribute('name') || field.getAttribute('id') || 'unknown';
        const fieldType = field.getAttribute('type') || field.tagName.toLowerCase();

        let fieldAnalytics = formAnalytics.fields.find(f => f.name === fieldName);
        if (!fieldAnalytics) {
          fieldAnalytics = {
            name: fieldName,
            type: fieldType,
            interactions: 0,
            focusTime: 0,
            errors: 0,
            correctionRate: 0,
            abandonmentRate: 0,
          };
          formAnalytics.fields.push(fieldAnalytics);
        }

        let focusStartTime = 0;

        field.addEventListener('focus', () => {
          focusStartTime = Date.now();
          fieldAnalytics!.interactions++;
        });

        field.addEventListener('blur', () => {
          if (focusStartTime > 0) {
            fieldAnalytics!.focusTime += Date.now() - focusStartTime;
          }
        });

        field.addEventListener('invalid', () => {
          fieldAnalytics!.errors++;
          formAnalytics.errors.push({
            field: fieldName,
            error: (field as HTMLInputElement).validationMessage,
            count: 1,
            timestamp: new Date(),
          });
        });
      });

      // Track form submission
      form.addEventListener('submit', () => {
        formAnalytics.submissions++;
        formAnalytics.averageTime = (formAnalytics.averageTime + (Date.now() - startTime)) / formAnalytics.submissions;
        formAnalytics.completionRate = (formAnalytics.submissions / (formAnalytics.submissions + formAnalytics.abandonment)) * 100;
      });
    });
  }

  // Data Management
  private limitEventStorage(): void {
    if (this.events.length > 10000) {
      this.events = this.events.slice(-5000);
    }
  }

  private limitRUMStorage(): void {
    if (this.rumMetrics.length > 1000) {
      this.rumMetrics = this.rumMetrics.slice(-500);
    }
  }

  private limitErrorStorage(): void {
    if (this.errors.length > 500) {
      this.errors = this.errors.slice(-250);
    }
  }

  private startDataPersistence(): void {
    // Save data every 30 seconds
    setInterval(() => {
      this.saveToStorage();
    }, 30000);

    // Save on page unload
    window.addEventListener('beforeunload', () => {
      this.saveToStorage();
    });
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('analytics_events', JSON.stringify(this.events.slice(-1000)));
      localStorage.setItem('analytics_sessions', JSON.stringify(Array.from(this.sessions.values()).slice(-50)));
      localStorage.setItem('analytics_errors', JSON.stringify(this.errors.slice(-100)));
      localStorage.setItem('analytics_rum', JSON.stringify(this.rumMetrics.slice(-100)));
    } catch (error) {
      console.warn('Failed to save analytics data:', error);
    }
  }

  // Public API
  getEvents(limit?: number): AnalyticsEvent[] {
    return limit ? this.events.slice(-limit) : this.events;
  }

  getSessions(limit?: number): UserSession[] {
    const sessions = Array.from(this.sessions.values());
    return limit ? sessions.slice(-limit) : sessions;
  }

  getErrors(limit?: number): ErrorReport[] {
    return limit ? this.errors.slice(-limit) : this.errors;
  }

  getRUMMetrics(limit?: number): RealUserMetrics[] {
    return limit ? this.rumMetrics.slice(-limit) : this.rumMetrics;
  }

  getHeatmaps(): HeatmapData[] {
    return Array.from(this.heatmaps.values());
  }

  getFormAnalytics(): FormAnalytics[] {
    return Array.from(this.formAnalytics.values());
  }

  // Configuration
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setSamplingRate(rate: number): void {
    this.samplingRate = Math.max(0, Math.min(1, rate));
  }

  setUserId(userId: string): void {
    localStorage.setItem('analytics_user_id', userId);
    if (this.currentSession) {
      this.currentSession.userId = userId;
    }
  }

  // Export Data
  exportData(): string {
    return JSON.stringify({
      events: this.events,
      sessions: Array.from(this.sessions.values()),
      errors: this.errors,
      rumMetrics: this.rumMetrics,
      heatmaps: Array.from(this.heatmaps.values()),
      formAnalytics: Array.from(this.formAnalytics.values()),
    }, null, 2);
  }

  // Clear Data
  clearData(): void {
    this.events = [];
    this.sessions.clear();
    this.errors = [];
    this.rumMetrics = [];
    this.heatmaps.clear();
    this.formAnalytics.clear();
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('analytics_sessions');
    localStorage.removeItem('analytics_errors');
    localStorage.removeItem('analytics_rum');
  }
}

// Export singleton instance
export const localAnalytics = new LocalAnalytics();
