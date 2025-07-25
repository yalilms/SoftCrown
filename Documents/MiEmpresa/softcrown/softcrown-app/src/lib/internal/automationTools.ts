// Automation Tools Service
import {
  AutomationRule,
  AutomationTrigger,
  AutomationCondition,
  AutomationAction,
  WorkflowTemplate,
  WorkflowPhase,
  Lead,
  LeadStatus,
  LeadSource,
  LeadActivity,
  Pipeline,
  PipelineStage
} from '@/types/internal';
import { User } from '@/types/auth';

export interface CreateAutomationRuleRequest {
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface LeadScoringCriteria {
  companySize: { small: number; medium: number; large: number };
  budget: { low: number; medium: number; high: number };
  timeline: { immediate: number; short: number; long: number };
  authority: { influencer: number; decision_maker: number; champion: number };
  need: { low: number; medium: number; high: number };
  source: Record<LeadSource, number>;
}

export class AutomationToolsService {
  private automationRules: Map<string, AutomationRule> = new Map();
  private workflowTemplates: Map<string, WorkflowTemplate> = new Map();
  private leads: Map<string, Lead> = new Map();
  private pipelines: Map<string, Pipeline> = new Map();
  private users: Map<string, User> = new Map();
  private executionLog: Array<{
    ruleId: string;
    executedAt: Date;
    success: boolean;
    error?: string;
  }> = [];

  private leadScoringCriteria: LeadScoringCriteria = {
    companySize: { small: 5, medium: 10, large: 15 },
    budget: { low: 5, medium: 15, high: 25 },
    timeline: { immediate: 20, short: 15, long: 5 },
    authority: { influencer: 5, decision_maker: 20, champion: 15 },
    need: { low: 5, medium: 15, high: 25 },
    source: {
      website: 10,
      referral: 20,
      social: 8,
      email: 12,
      phone: 15,
      event: 18,
      advertisement: 6,
    },
  };

  constructor() {
    this.initializeMockData();
  }

  // Automation Rules Management
  async createAutomationRule(request: CreateAutomationRuleRequest): Promise<{ success: boolean; rule?: AutomationRule; error?: string }> {
    try {
      const ruleId = this.generateRuleId();
      const rule: AutomationRule = {
        id: ruleId,
        name: request.name,
        description: request.description,
        trigger: request.trigger,
        conditions: request.conditions,
        actions: request.actions,
        isActive: request.isActive,
        executionCount: 0,
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.automationRules.set(ruleId, rule);
      return { success: true, rule };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create automation rule',
      };
    }
  }

  async getAutomationRules(isActive?: boolean): Promise<AutomationRule[]> {
    let rules = Array.from(this.automationRules.values());
    if (isActive !== undefined) {
      rules = rules.filter(rule => rule.isActive === isActive);
    }
    return rules.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Lead Management and Scoring
  async createLead(leadData: Partial<Lead>): Promise<{ success: boolean; lead?: Lead; error?: string }> {
    try {
      const leadId = this.generateLeadId();
      const lead: Lead = {
        id: leadId,
        name: leadData.name || '',
        email: leadData.email || '',
        phone: leadData.phone,
        company: leadData.company,
        position: leadData.position,
        source: leadData.source || 'website',
        status: 'new',
        score: 0,
        estimatedValue: leadData.estimatedValue || 0,
        probability: 10,
        tags: leadData.tags || [],
        notes: leadData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        activities: [],
        customFields: leadData.customFields || {},
      };

      lead.score = await this.calculateLeadScore(lead);
      this.leads.set(leadId, lead);
      await this.triggerAutomation('lead_created', lead);

      return { success: true, lead };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lead',
      };
    }
  }

  async calculateLeadScore(lead: Lead): Promise<number> {
    let score = 0;

    // Source scoring
    score += this.leadScoringCriteria.source[lead.source] || 0;

    // Custom fields scoring
    const customFields = lead.customFields || {};
    
    if (customFields.companySize) {
      score += this.leadScoringCriteria.companySize[customFields.companySize as keyof typeof this.leadScoringCriteria.companySize] || 0;
    }

    if (customFields.budget) {
      score += this.leadScoringCriteria.budget[customFields.budget as keyof typeof this.leadScoringCriteria.budget] || 0;
    }

    // Activity scoring
    const recentActivities = lead.activities.filter(activity =>
      activity.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    score += recentActivities.length * 2;

    return Math.min(100, Math.max(0, score));
  }

  async assignLead(leadId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const lead = this.leads.get(leadId);
      const user = this.users.get(userId);
      
      if (!lead) return { success: false, error: 'Lead not found' };
      if (!user) return { success: false, error: 'User not found' };

      lead.assignedTo = user;
      lead.updatedAt = new Date();
      this.leads.set(leadId, lead);

      const activity: LeadActivity = {
        id: this.generateActivityId(),
        type: 'note',
        title: 'Lead Assigned',
        description: `Lead assigned to ${user.name}`,
        date: new Date(),
        userId: user.id,
      };
      lead.activities.push(activity);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to assign lead',
      };
    }
  }

  // Pipeline Management
  async createPipeline(name: string, stages: PipelineStage[]): Promise<{ success: boolean; pipeline?: Pipeline; error?: string }> {
    try {
      const pipelineId = this.generatePipelineId();
      const pipeline: Pipeline = {
        id: pipelineId,
        name,
        stages: stages.sort((a, b) => a.order - b.order),
        leads: [],
        conversionRate: 0,
        averageDealSize: 0,
        averageSalesCycle: 0,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.pipelines.set(pipelineId, pipeline);
      return { success: true, pipeline };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create pipeline',
      };
    }
  }

  // Workflow Templates
  async createWorkflowTemplate(name: string, description: string, category: string, phases: WorkflowPhase[]): Promise<{ success: boolean; template?: WorkflowTemplate; error?: string }> {
    try {
      const templateId = this.generateTemplateId();
      const estimatedDuration = phases.reduce((sum, phase) => sum + phase.estimatedHours, 0);

      const template: WorkflowTemplate = {
        id: templateId,
        name,
        description,
        category,
        phases,
        estimatedDuration,
        isActive: true,
        usageCount: 0,
        createdBy: 'current-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.workflowTemplates.set(templateId, template);
      return { success: true, template };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create workflow template',
      };
    }
  }

  async getWorkflowTemplates(category?: string): Promise<WorkflowTemplate[]> {
    let templates = Array.from(this.workflowTemplates.values()).filter(t => t.isActive);
    if (category) {
      templates = templates.filter(t => t.category === category);
    }
    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  // Automation Execution
  async triggerAutomation(triggerType: string, data: any): Promise<void> {
    const applicableRules = Array.from(this.automationRules.values())
      .filter(rule => rule.isActive && rule.trigger.type === triggerType);

    for (const rule of applicableRules) {
      try {
        if (this.evaluateConditions(rule.conditions, data)) {
          await this.executeActions(rule.actions, data);
          
          rule.executionCount += 1;
          rule.lastExecuted = new Date();
          this.automationRules.set(rule.id, rule);

          this.executionLog.push({
            ruleId: rule.id,
            executedAt: new Date(),
            success: true,
          });
        }
      } catch (error) {
        this.executionLog.push({
          ruleId: rule.id,
          executedAt: new Date(),
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }

  private evaluateConditions(conditions: AutomationCondition[], data: any): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(data, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value;
        case 'not_equals':
          return fieldValue !== condition.value;
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value);
        case 'less_than':
          return Number(fieldValue) < Number(condition.value);
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(condition.value).toLowerCase());
        default:
          return false;
      }
    });
  }

  private async executeActions(actions: AutomationAction[], data: any): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'send_email':
          console.log('Sending automated email:', action.config, data);
          break;
        case 'create_task':
          console.log('Creating automated task:', action.config, data);
          break;
        case 'assign_lead':
          if (data.id && action.config.userId) {
            await this.assignLead(data.id, action.config.userId);
          }
          break;
        case 'update_status':
          console.log('Updating status:', action.config, data);
          break;
        case 'create_invoice':
          console.log('Creating automated invoice:', action.config, data);
          break;
        case 'notify_team':
          console.log('Notifying team:', action.config, data);
          break;
      }
    }
  }

  // Helper methods
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private initializeMockData(): void {
    // Initialize mock users
    const mockUsers: User[] = [
      {
        id: 'user1',
        email: 'sales@softcrown.com',
        name: 'Sales Manager',
        role: 'admin',
        avatar: '/avatars/sales.jpg',
        isActive: true,
        emailVerified: true,
        projects: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockUsers.forEach(user => this.users.set(user.id, user));

    // Initialize mock automation rules
    const mockRules: AutomationRule[] = [
      {
        id: 'rule1',
        name: 'Auto-assign high-value leads',
        description: 'Automatically assign leads with estimated value > €5000 to sales manager',
        trigger: { type: 'lead_created', config: {} },
        conditions: [{ field: 'estimatedValue', operator: 'greater_than', value: 5000 }],
        actions: [{ type: 'assign_lead', config: { userId: 'user1' } }],
        isActive: true,
        executionCount: 15,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    mockRules.forEach(rule => this.automationRules.set(rule.id, rule));
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLeadId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActivityId(): string {
    return `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generatePipelineId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const automationToolsService = new AutomationToolsService();
