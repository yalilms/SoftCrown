// A/B Testing Framework
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  type: 'page' | 'component' | 'feature';
  variants: ABVariant[];
  targetAudience: TargetAudience;
  trafficAllocation: number; // Percentage of users to include in test
  startDate: Date;
  endDate?: Date;
  goals: ABGoal[];
  results?: ABTestResults;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficWeight: number; // Percentage of test traffic
  config: VariantConfig;
  metrics: VariantMetrics;
}

export interface VariantConfig {
  // Page variants
  pageContent?: {
    title?: string;
    subtitle?: string;
    heroImage?: string;
    ctaText?: string;
    ctaColor?: string;
    layout?: string;
  };
  
  // Component variants
  componentProps?: Record<string, any>;
  
  // Style variants
  styles?: {
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    spacing?: Record<string, string>;
  };
  
  // Feature flags
  features?: Record<string, boolean>;
}

export interface TargetAudience {
  include?: AudienceRule[];
  exclude?: AudienceRule[];
  percentage?: number;
}

export interface AudienceRule {
  type: 'geography' | 'device' | 'browser' | 'referrer' | 'custom';
  operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'not_in';
  value: string | string[];
}

export interface ABGoal {
  id: string;
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  event: string;
  target?: number;
  weight: number; // Importance weight
}

export interface VariantMetrics {
  impressions: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  engagementTime: number;
  bounceRate: number;
  customMetrics: Record<string, number>;
}

export interface ABTestResults {
  winner?: string;
  confidence: number;
  significance: number;
  uplift: number;
  duration: number;
  totalParticipants: number;
  variantPerformance: Record<string, VariantPerformance>;
  recommendations: string[];
}

export interface VariantPerformance {
  variantId: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  confidence: number;
  significance: number;
  uplift: number;
  revenue: number;
  revenuePerUser: number;
}

export interface UserAssignment {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  hasConverted: boolean;
  conversionEvents: ConversionEvent[];
}

export interface ConversionEvent {
  goalId: string;
  event: string;
  value?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class ABTestingFramework {
  private tests: Map<string, ABTest> = new Map();
  private assignments: Map<string, UserAssignment[]> = new Map();
  private currentUserId: string = '';
  private isEnabled: boolean = true;

  constructor() {
    this.initializeUserId();
    this.loadTests();
    this.loadAssignments();
  }

  // Test Management
  createTest(testConfig: Omit<ABTest, 'id' | 'createdAt' | 'updatedAt'>): ABTest {
    const test: ABTest = {
      ...testConfig,
      id: `test-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Validate traffic weights sum to 100%
    const totalWeight = test.variants.reduce((sum, variant) => sum + variant.trafficWeight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error('Variant traffic weights must sum to 100%');
    }

    this.tests.set(test.id, test);
    this.saveTests();
    return test;
  }

  getTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null;
  }

  getAllTests(): ABTest[] {
    return Array.from(this.tests.values());
  }

  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  updateTest(testId: string, updates: Partial<ABTest>): void {
    const test = this.tests.get(testId);
    if (!test) return;

    const updatedTest = {
      ...test,
      ...updates,
      updatedAt: new Date(),
    };

    this.tests.set(testId, updatedTest);
    this.saveTests();
  }

  startTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;

    test.status = 'running';
    test.startDate = new Date();
    test.updatedAt = new Date();

    this.tests.set(testId, test);
    this.saveTests();
  }

  pauseTest(testId: string): void {
    this.updateTest(testId, { status: 'paused' });
  }

  stopTest(testId: string): void {
    const test = this.tests.get(testId);
    if (!test) return;

    test.status = 'completed';
    test.endDate = new Date();
    test.results = this.calculateResults(testId);

    this.tests.set(testId, test);
    this.saveTests();
  }

  deleteTest(testId: string): boolean {
    const deleted = this.tests.delete(testId);
    if (deleted) {
      this.saveTests();
      // Clean up assignments
      this.assignments.delete(testId);
      this.saveAssignments();
    }
    return deleted;
  }

  // User Assignment
  getVariantForUser(testId: string, userId?: string): string | null {
    if (!this.isEnabled) return null;

    const user = userId || this.currentUserId;
    const test = this.tests.get(testId);
    
    if (!test || test.status !== 'running') return null;
    if (!this.isUserEligible(test, user)) return null;

    // Check existing assignment
    const userAssignments = this.assignments.get(testId) || [];
    const existingAssignment = userAssignments.find(a => a.userId === user);
    
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user should be included in test
    if (Math.random() * 100 > test.trafficAllocation) {
      return null;
    }

    // Assign variant based on weights
    const variantId = this.assignVariant(test.variants, user);
    
    // Save assignment
    const assignment: UserAssignment = {
      userId: user,
      testId,
      variantId,
      assignedAt: new Date(),
      hasConverted: false,
      conversionEvents: [],
    };

    userAssignments.push(assignment);
    this.assignments.set(testId, userAssignments);
    this.saveAssignments();

    // Track impression
    this.trackImpression(testId, variantId);

    return variantId;
  }

  // Event Tracking
  trackConversion(testId: string, goalId: string, value?: number, metadata?: Record<string, any>): void {
    const user = this.currentUserId;
    const userAssignments = this.assignments.get(testId) || [];
    const assignment = userAssignments.find(a => a.userId === user);

    if (!assignment) return;

    const conversionEvent: ConversionEvent = {
      goalId,
      event: 'conversion',
      value,
      timestamp: new Date(),
      metadata,
    };

    assignment.conversionEvents.push(conversionEvent);
    assignment.hasConverted = true;

    this.assignments.set(testId, userAssignments);
    this.saveAssignments();

    // Update variant metrics
    this.updateVariantMetrics(testId, assignment.variantId, 'conversion', value);
  }

  trackCustomEvent(testId: string, event: string, value?: number, metadata?: Record<string, any>): void {
    const user = this.currentUserId;
    const userAssignments = this.assignments.get(testId) || [];
    const assignment = userAssignments.find(a => a.userId === user);

    if (!assignment) return;

    this.updateVariantMetrics(testId, assignment.variantId, event, value);
  }

  // Analytics
  getTestResults(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    return this.calculateResults(testId);
  }

  getVariantConfig(testId: string, variantId?: string): VariantConfig | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const assignedVariantId = variantId || this.getVariantForUser(testId);
    if (!assignedVariantId) return null;

    const variant = test.variants.find(v => v.id === assignedVariantId);
    return variant?.config || null;
  }

  // Utility Methods
  isUserInTest(testId: string, userId?: string): boolean {
    const user = userId || this.currentUserId;
    const userAssignments = this.assignments.get(testId) || [];
    return userAssignments.some(a => a.userId === user);
  }

  getUserVariant(testId: string, userId?: string): string | null {
    const user = userId || this.currentUserId;
    const userAssignments = this.assignments.get(testId) || [];
    const assignment = userAssignments.find(a => a.userId === user);
    return assignment?.variantId || null;
  }

  // Configuration
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  setUserId(userId: string): void {
    this.currentUserId = userId;
  }

  // Export/Import
  exportTest(testId: string): string {
    const test = this.tests.get(testId);
    if (!test) throw new Error('Test not found');

    const assignments = this.assignments.get(testId) || [];
    return JSON.stringify({ test, assignments }, null, 2);
  }

  importTest(data: string): ABTest {
    try {
      const { test, assignments } = JSON.parse(data);
      
      test.id = `test-${Date.now()}`;
      test.createdAt = new Date();
      test.updatedAt = new Date();
      test.status = 'draft';

      this.tests.set(test.id, test);
      this.assignments.set(test.id, assignments || []);
      
      this.saveTests();
      this.saveAssignments();

      return test;
    } catch (error) {
      throw new Error(`Failed to import test: ${error}`);
    }
  }

  // Private Methods
  private initializeUserId(): void {
    if (typeof window !== 'undefined') {
      let userId = localStorage.getItem('ab-test-user-id');
      if (!userId) {
        userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ab-test-user-id', userId);
      }
      this.currentUserId = userId;
    }
  }

  private isUserEligible(test: ABTest, userId: string): boolean {
    const { targetAudience } = test;
    
    if (!targetAudience) return true;

    // Check include rules
    if (targetAudience.include && targetAudience.include.length > 0) {
      const matchesInclude = targetAudience.include.some(rule => this.evaluateRule(rule, userId));
      if (!matchesInclude) return false;
    }

    // Check exclude rules
    if (targetAudience.exclude && targetAudience.exclude.length > 0) {
      const matchesExclude = targetAudience.exclude.some(rule => this.evaluateRule(rule, userId));
      if (matchesExclude) return false;
    }

    return true;
  }

  private evaluateRule(rule: AudienceRule, userId: string): boolean {
    // Simplified rule evaluation - in real implementation, use actual user data
    switch (rule.type) {
      case 'geography':
        return this.checkGeography(rule);
      case 'device':
        return this.checkDevice(rule);
      case 'browser':
        return this.checkBrowser(rule);
      case 'referrer':
        return this.checkReferrer(rule);
      case 'custom':
        return this.checkCustomRule(rule, userId);
      default:
        return true;
    }
  }

  private checkGeography(rule: AudienceRule): boolean {
    // Mock implementation
    const userCountry = 'ES'; // Would get from IP geolocation
    return this.applyOperator(rule.operator, userCountry, rule.value);
  }

  private checkDevice(rule: AudienceRule): boolean {
    const userAgent = navigator.userAgent;
    const isMobile = /Mobile|Android|iPhone|iPad/.test(userAgent);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    return this.applyOperator(rule.operator, deviceType, rule.value);
  }

  private checkBrowser(rule: AudienceRule): boolean {
    const userAgent = navigator.userAgent;
    let browser = 'unknown';
    
    if (userAgent.includes('Chrome')) browser = 'chrome';
    else if (userAgent.includes('Firefox')) browser = 'firefox';
    else if (userAgent.includes('Safari')) browser = 'safari';
    else if (userAgent.includes('Edge')) browser = 'edge';
    
    return this.applyOperator(rule.operator, browser, rule.value);
  }

  private checkReferrer(rule: AudienceRule): boolean {
    const referrer = document.referrer;
    return this.applyOperator(rule.operator, referrer, rule.value);
  }

  private checkCustomRule(rule: AudienceRule, userId: string): boolean {
    // Custom rule evaluation based on user properties
    return true; // Simplified
  }

  private applyOperator(operator: string, actual: string, expected: string | string[]): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        return typeof expected === 'string' && actual.includes(expected);
      case 'startsWith':
        return typeof expected === 'string' && actual.startsWith(expected);
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not_in':
        return Array.isArray(expected) && !expected.includes(actual);
      default:
        return false;
    }
  }

  private assignVariant(variants: ABVariant[], userId: string): string {
    // Use consistent hashing for stable assignment
    const hash = this.hashUserId(userId);
    let cumulative = 0;
    
    for (const variant of variants) {
      cumulative += variant.trafficWeight;
      if (hash <= cumulative) {
        return variant.id;
      }
    }
    
    // Fallback to control
    return variants.find(v => v.isControl)?.id || variants[0].id;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100;
  }

  private trackImpression(testId: string, variantId: string): void {
    this.updateVariantMetrics(testId, variantId, 'impression');
  }

  private updateVariantMetrics(testId: string, variantId: string, event: string, value?: number): void {
    const test = this.tests.get(testId);
    if (!test) return;

    const variant = test.variants.find(v => v.id === variantId);
    if (!variant) return;

    switch (event) {
      case 'impression':
        variant.metrics.impressions++;
        break;
      case 'conversion':
        variant.metrics.conversions++;
        variant.metrics.conversionRate = variant.metrics.conversions / variant.metrics.impressions;
        if (value) variant.metrics.revenue += value;
        break;
      default:
        if (value) {
          variant.metrics.customMetrics[event] = (variant.metrics.customMetrics[event] || 0) + value;
        }
    }

    this.tests.set(testId, test);
    this.saveTests();
  }

  private calculateResults(testId: string): ABTestResults {
    const test = this.tests.get(testId);
    if (!test) throw new Error('Test not found');

    const assignments = this.assignments.get(testId) || [];
    const variantPerformance: Record<string, VariantPerformance> = {};
    
    let totalParticipants = 0;
    let controlVariant: ABVariant | null = null;

    // Calculate performance for each variant
    for (const variant of test.variants) {
      const variantAssignments = assignments.filter(a => a.variantId === variant.id);
      const conversions = variantAssignments.filter(a => a.hasConverted).length;
      const revenue = variantAssignments.reduce((sum, a) => {
        return sum + a.conversionEvents.reduce((eventSum, e) => eventSum + (e.value || 0), 0);
      }, 0);

      const performance: VariantPerformance = {
        variantId: variant.id,
        participants: variantAssignments.length,
        conversions,
        conversionRate: variantAssignments.length > 0 ? conversions / variantAssignments.length : 0,
        confidence: 0,
        significance: 0,
        uplift: 0,
        revenue,
        revenuePerUser: variantAssignments.length > 0 ? revenue / variantAssignments.length : 0,
      };

      variantPerformance[variant.id] = performance;
      totalParticipants += variantAssignments.length;

      if (variant.isControl) {
        controlVariant = variant;
      }
    }

    // Calculate statistical significance and confidence
    if (controlVariant) {
      const controlPerformance = variantPerformance[controlVariant.id];
      
      for (const variant of test.variants) {
        if (variant.isControl) continue;
        
        const variantPerf = variantPerformance[variant.id];
        const { confidence, significance, uplift } = this.calculateStatistics(
          controlPerformance,
          variantPerf
        );
        
        variantPerf.confidence = confidence;
        variantPerf.significance = significance;
        variantPerf.uplift = uplift;
      }
    }

    // Determine winner
    const sortedVariants = Object.values(variantPerformance)
      .sort((a, b) => b.conversionRate - a.conversionRate);
    
    const winner = sortedVariants[0]?.significance > 0.95 ? sortedVariants[0].variantId : undefined;

    return {
      winner,
      confidence: winner ? variantPerformance[winner].confidence : 0,
      significance: winner ? variantPerformance[winner].significance : 0,
      uplift: winner ? variantPerformance[winner].uplift : 0,
      duration: test.endDate ? test.endDate.getTime() - test.startDate.getTime() : Date.now() - test.startDate.getTime(),
      totalParticipants,
      variantPerformance,
      recommendations: this.generateRecommendations(test, variantPerformance),
    };
  }

  private calculateStatistics(control: VariantPerformance, variant: VariantPerformance) {
    // Simplified statistical calculation
    const controlRate = control.conversionRate;
    const variantRate = variant.conversionRate;
    
    const uplift = controlRate > 0 ? ((variantRate - controlRate) / controlRate) * 100 : 0;
    
    // Mock confidence and significance - in real implementation, use proper statistical tests
    const confidence = Math.min(95, Math.max(50, 80 + Math.random() * 20));
    const significance = confidence / 100;
    
    return { confidence, significance, uplift };
  }

  private generateRecommendations(test: ABTest, performance: Record<string, VariantPerformance>): string[] {
    const recommendations: string[] = [];
    
    const sortedVariants = Object.values(performance)
      .sort((a, b) => b.conversionRate - a.conversionRate);
    
    if (sortedVariants.length > 1) {
      const best = sortedVariants[0];
      const worst = sortedVariants[sortedVariants.length - 1];
      
      if (best.significance > 0.95) {
        recommendations.push(`Implementar la variante ${best.variantId} como ganadora con ${best.uplift.toFixed(1)}% de mejora`);
      } else if (best.significance > 0.8) {
        recommendations.push(`Continuar el test para alcanzar significancia estadística`);
      } else {
        recommendations.push(`Los resultados no son concluyentes, considerar rediseñar el test`);
      }
      
      if (worst.conversionRate < best.conversionRate * 0.5) {
        recommendations.push(`Eliminar la variante ${worst.variantId} por bajo rendimiento`);
      }
    }
    
    return recommendations;
  }

  private saveTests(): void {
    if (typeof window !== 'undefined') {
      const tests = Array.from(this.tests.values());
      localStorage.setItem('ab-tests', JSON.stringify(tests));
    }
  }

  private saveAssignments(): void {
    if (typeof window !== 'undefined') {
      const assignments = Object.fromEntries(this.assignments);
      localStorage.setItem('ab-assignments', JSON.stringify(assignments));
    }
  }

  private loadTests(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ab-tests');
      if (saved) {
        try {
          const tests = JSON.parse(saved) as ABTest[];
          tests.forEach(test => {
            this.tests.set(test.id, test);
          });
        } catch (error) {
          // console.warn('Failed to load A/B tests');
        }
      }
    }
  }

  private loadAssignments(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ab-assignments');
      if (saved) {
        try {
          const assignments = JSON.parse(saved);
          for (const [testId, userAssignments] of Object.entries(assignments)) {
            this.assignments.set(testId, userAssignments as UserAssignment[]);
          }
        } catch (error) {
          // console.warn('Failed to load A/B test assignments');
        }
      }
    }
  }
}

// Export singleton instance
export const abTesting = new ABTestingFramework();
