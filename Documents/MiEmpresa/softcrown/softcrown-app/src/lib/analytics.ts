// Google Analytics and custom analytics integration
// Supports GA4, custom events, and real-time tracking

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  customEndpoint?: string;
  enableDebug: boolean;
  trackingEnabled: boolean;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface UserProperties {
  userId?: string;
  userType?: 'lead' | 'customer' | 'visitor';
  company?: string;
  industry?: string;
  source?: string;
  customProperties?: Record<string, any>;
}

export interface ConversionEvent {
  type: 'form_submit' | 'quote_request' | 'payment_complete' | 'meeting_booked' | 'email_signup';
  value?: number;
  currency?: string;
  leadId?: string;
  metadata?: Record<string, any>;
}

// Google Analytics 4 Integration
export class GoogleAnalyticsService {
  private gtag: any;
  private config: AnalyticsConfig;

  constructor(config: AnalyticsConfig) {
    this.config = config;
    this.initializeGA4();
  }

  private async initializeGA4() {
    if (!this.config.googleAnalyticsId || typeof window === 'undefined') {
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
      document.head.appendChild(script);

      // Initialize gtag
      (window as any).dataLayer = (window as any).dataLayer || [];
      this.gtag = function(...args: any[]) {
        (window as any).dataLayer.push(arguments);
      };

      this.gtag('js', new Date());
      this.gtag('config', this.config.googleAnalyticsId, {
        debug_mode: this.config.enableDebug,
        send_page_view: true
      });

      console.log('Google Analytics 4 initialized');
    } catch (error) {
      console.error('Error initializing Google Analytics:', error);
    }
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    if (!this.config.trackingEnabled || !this.gtag) return;

    this.gtag('config', this.config.googleAnalyticsId, {
      page_path: path,
      page_title: title
    });

    if (this.config.enableDebug) {
      console.log('GA4: Page view tracked', { path, title });
    }
  }

  // Track custom events
  trackEvent(event: AnalyticsEvent) {
    if (!this.config.trackingEnabled || !this.gtag) return;

    this.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.customParameters
    });

    if (this.config.enableDebug) {
      console.log('GA4: Event tracked', event);
    }
  }

  // Track conversions
  trackConversion(conversion: ConversionEvent) {
    if (!this.config.trackingEnabled || !this.gtag) return;

    const eventName = this.mapConversionToGA4Event(conversion.type);
    
    this.gtag('event', eventName, {
      currency: conversion.currency || 'EUR',
      value: conversion.value || 0,
      lead_id: conversion.leadId,
      ...conversion.metadata
    });

    if (this.config.enableDebug) {
      console.log('GA4: Conversion tracked', conversion);
    }
  }

  // Set user properties
  setUserProperties(properties: UserProperties) {
    if (!this.config.trackingEnabled || !this.gtag) return;

    this.gtag('config', this.config.googleAnalyticsId, {
      user_id: properties.userId,
      custom_map: {
        user_type: properties.userType,
        company: properties.company,
        industry: properties.industry,
        source: properties.source,
        ...properties.customProperties
      }
    });

    if (this.config.enableDebug) {
      console.log('GA4: User properties set', properties);
    }
  }

  private mapConversionToGA4Event(type: ConversionEvent['type']): string {
    const eventMap: Record<string, string> = {
      'form_submit': 'generate_lead',
      'quote_request': 'begin_checkout',
      'payment_complete': 'purchase',
      'meeting_booked': 'schedule_meeting',
      'email_signup': 'sign_up'
    };
    return eventMap[type] || 'conversion';
  }
}

// Custom Analytics Service
export class CustomAnalyticsService {
  private config: AnalyticsConfig;
  private eventQueue: AnalyticsEvent[] = [];

  constructor(config: AnalyticsConfig) {
    this.config = config;
  }

  // Track custom events
  async trackEvent(event: AnalyticsEvent) {
    if (!this.config.trackingEnabled) return;

    try {
      if (this.config.customEndpoint) {
        await this.sendToCustomEndpoint(event);
      } else {
        this.eventQueue.push(event);
      }

      if (this.config.enableDebug) {
        console.log('Custom Analytics: Event tracked', event);
      }
    } catch (error) {
      console.error('Error tracking custom event:', error);
    }
  }

  private async sendToCustomEndpoint(event: AnalyticsEvent) {
    const response = await fetch(this.config.customEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send analytics event: ${response.statusText}`);
    }
  }

  // Get queued events
  getQueuedEvents(): AnalyticsEvent[] {
    return [...this.eventQueue];
  }

  // Clear event queue
  clearQueue() {
    this.eventQueue = [];
  }
}

// Main Analytics Service
export class AnalyticsService {
  private googleAnalytics: GoogleAnalyticsService;
  private customAnalytics: CustomAnalyticsService;
  private config: AnalyticsConfig;

  constructor(config?: Partial<AnalyticsConfig>) {
    this.config = {
      googleAnalyticsId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      customEndpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
      enableDebug: process.env.NODE_ENV === 'development',
      trackingEnabled: true,
      ...config
    };

    this.googleAnalytics = new GoogleAnalyticsService(this.config);
    this.customAnalytics = new CustomAnalyticsService(this.config);
  }

  // Track page views
  trackPageView(path: string, title?: string) {
    this.googleAnalytics.trackPageView(path, title);
    
    this.customAnalytics.trackEvent({
      name: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
      customParameters: { title }
    });
  }

  // Track form submissions
  trackFormSubmission(formType: string, formData: any) {
    const event: AnalyticsEvent = {
      name: 'form_submission',
      category: 'engagement',
      action: 'form_submit',
      label: formType,
      customParameters: {
        form_type: formType,
        fields_completed: Object.keys(formData).length,
        has_company: !!formData.company,
        has_phone: !!formData.phone
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);

    // Track as conversion
    this.trackConversion({
      type: 'form_submit',
      metadata: { form_type: formType }
    });
  }

  // Track quote requests
  trackQuoteRequest(quoteData: any) {
    const event: AnalyticsEvent = {
      name: 'quote_request',
      category: 'conversion',
      action: 'quote_request',
      label: quoteData.category,
      value: quoteData.total,
      customParameters: {
        category: quoteData.category,
        features_count: quoteData.features?.length || 0,
        package: quoteData.package,
        urgency: quoteData.urgency,
        total_value: quoteData.total
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);

    // Track as conversion
    this.trackConversion({
      type: 'quote_request',
      value: quoteData.total,
      currency: 'EUR',
      metadata: { category: quoteData.category }
    });
  }

  // Track payments
  trackPayment(paymentData: any) {
    const event: AnalyticsEvent = {
      name: 'payment_complete',
      category: 'conversion',
      action: 'purchase',
      label: paymentData.type,
      value: paymentData.amount,
      customParameters: {
        payment_method: paymentData.method,
        currency: paymentData.currency,
        transaction_id: paymentData.transactionId
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);

    // Track as conversion
    this.trackConversion({
      type: 'payment_complete',
      value: paymentData.amount,
      currency: paymentData.currency,
      metadata: { 
        payment_method: paymentData.method,
        transaction_id: paymentData.transactionId
      }
    });
  }

  // Track communication events
  trackCommunication(type: 'email' | 'call' | 'chat' | 'meeting', data: any) {
    const event: AnalyticsEvent = {
      name: 'communication',
      category: 'engagement',
      action: type,
      label: data.subject || data.topic,
      customParameters: {
        communication_type: type,
        lead_id: data.leadId,
        duration: data.duration,
        outcome: data.outcome
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);
  }

  // Track lead scoring changes
  trackLeadScoring(leadId: string, oldScore: number, newScore: number, factors: string[]) {
    const event: AnalyticsEvent = {
      name: 'lead_scoring',
      category: 'crm',
      action: 'score_change',
      label: leadId,
      value: newScore,
      customParameters: {
        lead_id: leadId,
        old_score: oldScore,
        new_score: newScore,
        score_change: newScore - oldScore,
        factors: factors.join(',')
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);
  }

  // Track pipeline movements
  trackPipelineMovement(leadId: string, fromStage: string, toStage: string, value?: number) {
    const event: AnalyticsEvent = {
      name: 'pipeline_movement',
      category: 'crm',
      action: 'stage_change',
      label: `${fromStage} → ${toStage}`,
      value: value,
      customParameters: {
        lead_id: leadId,
        from_stage: fromStage,
        to_stage: toStage,
        deal_value: value
      }
    };

    this.googleAnalytics.trackEvent(event);
    this.customAnalytics.trackEvent(event);
  }

  // Private method to track conversions
  private trackConversion(conversion: ConversionEvent) {
    this.googleAnalytics.trackConversion(conversion);
  }

  // Set user properties
  setUser(properties: UserProperties) {
    this.googleAnalytics.setUserProperties(properties);
  }

  // Enable/disable tracking
  setTrackingEnabled(enabled: boolean) {
    this.config.trackingEnabled = enabled;
  }

  // Get configuration status
  getStatus() {
    return {
      googleAnalyticsConfigured: !!this.config.googleAnalyticsId,
      customEndpointConfigured: !!this.config.customEndpoint,
      trackingEnabled: this.config.trackingEnabled,
      debugMode: this.config.enableDebug
    };
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();

// Utility functions
export const trackPageView = (path: string, title?: string) => {
  analyticsService.trackPageView(path, title);
};

export const trackFormSubmission = (formType: string, formData: any) => {
  analyticsService.trackFormSubmission(formType, formData);
};

export const trackQuoteRequest = (quoteData: any) => {
  analyticsService.trackQuoteRequest(quoteData);
};

export const trackPayment = (paymentData: any) => {
  analyticsService.trackPayment(paymentData);
};

export const trackCommunication = (type: 'email' | 'call' | 'chat' | 'meeting', data: any) => {
  analyticsService.trackCommunication(type, data);
};
