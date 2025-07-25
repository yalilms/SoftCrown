// Internal Management System Types
import { User } from './auth';

// Task and Project Management
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type ProjectPhase = 'discovery' | 'design' | 'development' | 'testing' | 'launch' | 'maintenance';

export interface ProjectTask {
  id: string;
  title: string;
  description: string;
  assignee: User;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  dueDate: Date;
  dependencies: string[];
  projectId: string;
  phase: ProjectPhase;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  mentions: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: ProjectTask[];
  order: number;
  limit?: number;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description: string;
  hours: number;
  date: Date;
  billable: boolean;
  hourlyRate?: number;
}

// Lead Management and Pipeline
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadSource = 'website' | 'referral' | 'social' | 'email' | 'phone' | 'event' | 'advertisement';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  estimatedValue: number;
  probability: number;
  assignedTo?: User;
  tags: string[];
  notes: string;
  lastContact?: Date;
  nextFollowUp?: Date;
  createdAt: Date;
  updatedAt: Date;
  activities: LeadActivity[];
  customFields: Record<string, any>;
}

export interface LeadActivity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task';
  title: string;
  description: string;
  date: Date;
  userId: string;
  outcome?: string;
  nextAction?: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isActive: boolean;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  leads: Lead[];
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Communication Hub
export type MessageType = 'email' | 'chat' | 'form' | 'phone' | 'whatsapp';
export type MessageStatus = 'unread' | 'read' | 'replied' | 'forwarded' | 'archived';
export type MessagePriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Message {
  id: string;
  type: MessageType;
  subject: string;
  content: string;
  from: Contact;
  to: Contact[];
  cc?: Contact[];
  bcc?: Contact[];
  status: MessageStatus;
  priority: MessagePriority;
  tags: string[];
  assignedTo?: User;
  threadId?: string;
  parentId?: string;
  attachments: MessageAttachment[];
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
}

export interface MessageAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: MessageType;
  category: string;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutoEscalationRule {
  id: string;
  name: string;
  conditions: EscalationCondition[];
  actions: EscalationAction[];
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EscalationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface EscalationAction {
  type: 'assign' | 'notify' | 'tag' | 'priority' | 'template';
  value: any;
}

// Resource Planning
export interface TeamMember {
  id: string;
  user: User;
  role: string;
  department: string;
  hourlyRate: number;
  capacity: number; // hours per week
  skills: string[];
  availability: Availability[];
  currentWorkload: number;
  isActive: boolean;
}

export interface Availability {
  date: Date;
  hours: number;
  type: 'available' | 'busy' | 'vacation' | 'sick';
  description?: string;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  teamMemberId: string;
  startDate: Date;
  endDate: Date;
  allocatedHours: number;
  actualHours: number;
  role: string;
  notes?: string;
}

export interface ProjectTimeline {
  id: string;
  projectId: string;
  phases: TimelinePhase[];
  milestones: Milestone[];
  dependencies: ProjectDependency[];
  startDate: Date;
  endDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
}

export interface TimelinePhase {
  id: string;
  name: string;
  phase: ProjectPhase;
  startDate: Date;
  endDate: Date;
  progress: number;
  tasks: string[];
  resources: ResourceAllocation[];
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  dueDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
  dependencies: string[];
}

export interface ProjectDependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
  lag: number; // days
}

// Automation and Workflows
export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  executionCount: number;
  lastExecuted?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationTrigger {
  type: 'lead_created' | 'task_completed' | 'project_status_changed' | 'time_based' | 'form_submitted';
  config: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: string;
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'assign_lead' | 'update_status' | 'create_invoice' | 'notify_team';
  config: Record<string, any>;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  phases: WorkflowPhase[];
  estimatedDuration: number;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowPhase {
  id: string;
  name: string;
  order: number;
  tasks: WorkflowTask[];
  estimatedHours: number;
  dependencies: string[];
}

export interface WorkflowTask {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  role: string;
  priority: Priority;
  dependencies: string[];
  deliverables: string[];
}

// Reporting and Analytics
export interface BusinessKPI {
  id: string;
  name: string;
  description: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  category: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  lastUpdated: Date;
}

export interface TeamPerformanceMetric {
  teamMemberId: string;
  name: string;
  role: string;
  tasksCompleted: number;
  hoursLogged: number;
  efficiency: number; // actual vs estimated hours
  qualityScore: number;
  clientSatisfaction: number;
  billableHours: number;
  revenue: number;
  period: DateRange;
}

export interface ProjectProfitability {
  projectId: string;
  projectName: string;
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  hoursEstimated: number;
  hoursActual: number;
  hourlyRate: number;
  clientSatisfaction: number;
  status: string;
  startDate: Date;
  endDate?: Date;
}

export interface ClientSatisfactionScore {
  clientId: string;
  clientName: string;
  overallScore: number;
  communicationScore: number;
  qualityScore: number;
  timelinessScore: number;
  valueScore: number;
  feedbackCount: number;
  lastSurveyDate: Date;
  trend: 'improving' | 'declining' | 'stable';
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

// Integration APIs
export interface IntegrationConfig {
  id: string;
  name: string;
  type: IntegrationType;
  credentials: Record<string, string>;
  settings: Record<string, any>;
  isActive: boolean;
  lastSync?: Date;
  syncStatus: 'success' | 'error' | 'pending';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IntegrationType = 
  | 'google_calendar' 
  | 'mailchimp' 
  | 'accounting' 
  | 'time_tracking' 
  | 'file_storage' 
  | 'crm' 
  | 'payment_gateway';

export interface SyncLog {
  id: string;
  integrationId: string;
  action: 'import' | 'export' | 'sync';
  status: 'success' | 'error' | 'partial';
  recordsProcessed: number;
  recordsSuccess: number;
  recordsError: number;
  errorDetails?: string[];
  startTime: Date;
  endTime: Date;
  duration: number;
}

export interface ExternalCalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: string[];
  location?: string;
  isAllDay: boolean;
  recurrence?: string;
  projectId?: string;
  taskId?: string;
}

// Utility Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  assignee?: string[];
  priority?: Priority[];
  dateRange?: DateRange;
  tags?: string[];
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  title: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  isVisible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
