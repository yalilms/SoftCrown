// Client Communication Hub Service
import {
  Message,
  MessageType,
  MessageStatus,
  MessagePriority,
  Contact,
  MessageTemplate,
  AutoEscalationRule,
  EscalationCondition,
  EscalationAction,
  MessageAttachment,
  PaginatedResponse,
  FilterOptions
} from '@/types/internal';
import { User } from '@/types/auth';

export interface CreateMessageRequest {
  type: MessageType;
  subject: string;
  content: string;
  fromId: string;
  toIds: string[];
  ccIds?: string[];
  bccIds?: string[];
  priority: MessagePriority;
  tags: string[];
  scheduledAt?: Date;
  templateId?: string;
  attachments?: File[];
}

export interface MessageFilters extends FilterOptions {
  type?: MessageType[];
  status?: MessageStatus[];
  priority?: MessagePriority[];
  assignee?: string[];
  unassigned?: boolean;
}

export interface CommunicationStats {
  totalMessages: number;
  unreadMessages: number;
  responseTime: number; // average in hours
  resolutionTime: number; // average in hours
  messagesByType: Record<MessageType, number>;
  messagesByStatus: Record<MessageStatus, number>;
  messagesByPriority: Record<MessagePriority, number>;
  topTags: Array<{ tag: string; count: number }>;
  teamPerformance: Array<{
    userId: string;
    name: string;
    messagesHandled: number;
    averageResponseTime: number;
    satisfaction: number;
  }>;
}

export class CommunicationHubService {
  private messages: Map<string, Message> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private templates: Map<string, MessageTemplate> = new Map();
  private escalationRules: Map<string, AutoEscalationRule> = new Map();
  private users: Map<string, User> = new Map();

  constructor() {
    this.initializeMockData();
  }

  // Message Management
  async createMessage(request: CreateMessageRequest): Promise<{ success: boolean; message?: Message; error?: string }> {
    try {
      const fromContact = this.contacts.get(request.fromId);
      if (!fromContact) {
        return { success: false, error: 'Sender not found' };
      }

      const toContacts = request.toIds.map(id => this.contacts.get(id)).filter(Boolean) as Contact[];
      if (toContacts.length !== request.toIds.length) {
        return { success: false, error: 'Some recipients not found' };
      }

      const messageId = this.generateMessageId();
      const now = new Date();

      // Apply template if specified
      let { subject, content } = request;
      if (request.templateId) {
        const template = this.templates.get(request.templateId);
        if (template) {
          subject = template.subject;
          content = this.processTemplateVariables(template.content, { contact: fromContact });
          
          // Update template usage
          template.usageCount += 1;
          this.templates.set(request.templateId, template);
        }
      }

      const message: Message = {
        id: messageId,
        type: request.type,
        subject,
        content,
        from: fromContact,
        to: toContacts,
        cc: request.ccIds?.map(id => this.contacts.get(id)).filter(Boolean) as Contact[] || [],
        bcc: request.bccIds?.map(id => this.contacts.get(id)).filter(Boolean) as Contact[] || [],
        status: 'unread',
        priority: request.priority,
        tags: request.tags,
        attachments: [], // Would be processed from request.attachments
        scheduledAt: request.scheduledAt,
        sentAt: request.scheduledAt ? undefined : now,
        createdAt: now,
        updatedAt: now,
      };

      this.messages.set(messageId, message);

      // Apply escalation rules
      await this.applyEscalationRules(message);

      // Track analytics
      this.trackMessageCreated(message);

      return { success: true, message };
    } catch (error) {
      console.error('Error creating message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create message',
      };
    }
  }

  async updateMessageStatus(messageId: string, status: MessageStatus, assignedTo?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const message = this.messages.get(messageId);
      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      const oldStatus = message.status;
      message.status = status;
      message.updatedAt = new Date();

      if (status === 'read' && !message.readAt) {
        message.readAt = new Date();
      }

      if (status === 'replied' && !message.repliedAt) {
        message.repliedAt = new Date();
      }

      if (assignedTo) {
        const user = this.users.get(assignedTo);
        if (user) {
          message.assignedTo = user;
        }
      }

      this.messages.set(messageId, message);

      // Track analytics
      this.trackMessageStatusChanged(message, oldStatus, status);

      return { success: true };
    } catch (error) {
      console.error('Error updating message status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update message status',
      };
    }
  }

  async replyToMessage(messageId: string, content: string, fromUserId: string, attachments?: File[]): Promise<{ success: boolean; reply?: Message; error?: string }> {
    try {
      const originalMessage = this.messages.get(messageId);
      if (!originalMessage) {
        return { success: false, error: 'Original message not found' };
      }

      const user = this.users.get(fromUserId);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const userContact: Contact = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      };

      const replyId = this.generateMessageId();
      const reply: Message = {
        id: replyId,
        type: originalMessage.type,
        subject: `Re: ${originalMessage.subject}`,
        content,
        from: userContact,
        to: [originalMessage.from],
        cc: [],
        bcc: [],
        status: 'read',
        priority: originalMessage.priority,
        tags: originalMessage.tags,
        attachments: [], // Would be processed from attachments
        threadId: originalMessage.threadId || originalMessage.id,
        parentId: originalMessage.id,
        sentAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.messages.set(replyId, reply);

      // Update original message status
      originalMessage.status = 'replied';
      originalMessage.repliedAt = new Date();
      originalMessage.updatedAt = new Date();
      this.messages.set(messageId, originalMessage);

      return { success: true, reply };
    } catch (error) {
      console.error('Error replying to message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to reply to message',
      };
    }
  }

  async getMessages(filters: MessageFilters = {}, page = 1, limit = 20): Promise<PaginatedResponse<Message>> {
    let filteredMessages = Array.from(this.messages.values());

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredMessages = filteredMessages.filter(message =>
        message.subject.toLowerCase().includes(searchLower) ||
        message.content.toLowerCase().includes(searchLower) ||
        message.from.name.toLowerCase().includes(searchLower) ||
        message.from.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type && filters.type.length > 0) {
      filteredMessages = filteredMessages.filter(message => filters.type!.includes(message.type));
    }

    if (filters.status && filters.status.length > 0) {
      filteredMessages = filteredMessages.filter(message => filters.status!.includes(message.status));
    }

    if (filters.priority && filters.priority.length > 0) {
      filteredMessages = filteredMessages.filter(message => filters.priority!.includes(message.priority));
    }

    if (filters.assignee && filters.assignee.length > 0) {
      filteredMessages = filteredMessages.filter(message =>
        message.assignedTo && filters.assignee!.includes(message.assignedTo.id)
      );
    }

    if (filters.unassigned) {
      filteredMessages = filteredMessages.filter(message => !message.assignedTo);
    }

    if (filters.tags && filters.tags.length > 0) {
      filteredMessages = filteredMessages.filter(message =>
        filters.tags!.some(tag => message.tags.includes(tag))
      );
    }

    if (filters.dateRange) {
      filteredMessages = filteredMessages.filter(message =>
        message.createdAt >= filters.dateRange!.startDate &&
        message.createdAt <= filters.dateRange!.endDate
      );
    }

    // Sort by creation date (newest first)
    filteredMessages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = filteredMessages.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    return {
      data: paginatedMessages,
      total,
      page,
      limit,
      hasMore: endIndex < total,
    };
  }

  async getMessageThread(messageId: string): Promise<Message[]> {
    const message = this.messages.get(messageId);
    if (!message) return [];

    const threadId = message.threadId || message.id;
    const threadMessages = Array.from(this.messages.values())
      .filter(m => m.threadId === threadId || m.id === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    return threadMessages;
  }

  // Template Management
  async createTemplate(name: string, subject: string, content: string, type: MessageType, category: string, variables: string[], createdBy: string): Promise<{ success: boolean; template?: MessageTemplate; error?: string }> {
    try {
      const templateId = this.generateTemplateId();
      const template: MessageTemplate = {
        id: templateId,
        name,
        subject,
        content,
        type,
        category,
        variables,
        isActive: true,
        usageCount: 0,
        createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.templates.set(templateId, template);

      return { success: true, template };
    } catch (error) {
      console.error('Error creating template:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create template',
      };
    }
  }

  async getTemplates(type?: MessageType, category?: string): Promise<MessageTemplate[]> {
    let templates = Array.from(this.templates.values()).filter(t => t.isActive);

    if (type) {
      templates = templates.filter(t => t.type === type);
    }

    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    return templates.sort((a, b) => b.usageCount - a.usageCount);
  }

  // Escalation Rules
  async createEscalationRule(name: string, conditions: EscalationCondition[], actions: EscalationAction[], priority = 1): Promise<{ success: boolean; rule?: AutoEscalationRule; error?: string }> {
    try {
      const ruleId = this.generateRuleId();
      const rule: AutoEscalationRule = {
        id: ruleId,
        name,
        conditions,
        actions,
        isActive: true,
        priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.escalationRules.set(ruleId, rule);

      return { success: true, rule };
    } catch (error) {
      console.error('Error creating escalation rule:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create escalation rule',
      };
    }
  }

  async applyEscalationRules(message: Message): Promise<void> {
    const rules = Array.from(this.escalationRules.values())
      .filter(rule => rule.isActive)
      .sort((a, b) => a.priority - b.priority);

    for (const rule of rules) {
      if (this.evaluateConditions(message, rule.conditions)) {
        await this.executeActions(message, rule.actions);
      }
    }
  }

  // Contact Management
  async createContact(name: string, email: string, phone?: string, company?: string): Promise<{ success: boolean; contact?: Contact; error?: string }> {
    try {
      const contactId = this.generateContactId();
      const contact: Contact = {
        id: contactId,
        name,
        email,
        phone,
        company,
      };

      this.contacts.set(contactId, contact);

      return { success: true, contact };
    } catch (error) {
      console.error('Error creating contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      };
    }
  }

  async getContacts(search?: string): Promise<Contact[]> {
    let contacts = Array.from(this.contacts.values());

    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchLower) ||
        contact.email.toLowerCase().includes(searchLower) ||
        (contact.company && contact.company.toLowerCase().includes(searchLower))
      );
    }

    return contacts.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Analytics and Reporting
  async getCommunicationStats(dateRange?: { startDate: Date; endDate: Date }): Promise<CommunicationStats> {
    let messages = Array.from(this.messages.values());

    if (dateRange) {
      messages = messages.filter(message =>
        message.createdAt >= dateRange.startDate && message.createdAt <= dateRange.endDate
      );
    }

    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => m.status === 'unread').length;

    // Calculate response time (mock calculation)
    const respondedMessages = messages.filter(m => m.repliedAt);
    const responseTime = respondedMessages.length > 0
      ? respondedMessages.reduce((sum, m) => {
          const responseTimeHours = m.repliedAt && m.createdAt
            ? (m.repliedAt.getTime() - m.createdAt.getTime()) / (1000 * 60 * 60)
            : 0;
          return sum + responseTimeHours;
        }, 0) / respondedMessages.length
      : 0;

    // Calculate resolution time (mock - assuming resolved when status is 'archived')
    const resolvedMessages = messages.filter(m => m.status === 'archived');
    const resolutionTime = resolvedMessages.length > 0
      ? resolvedMessages.reduce((sum, m) => {
          const resolutionTimeHours = m.updatedAt && m.createdAt
            ? (m.updatedAt.getTime() - m.createdAt.getTime()) / (1000 * 60 * 60)
            : 0;
          return sum + resolutionTimeHours;
        }, 0) / resolvedMessages.length
      : 0;

    // Group by type, status, priority
    const messagesByType = messages.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {} as Record<MessageType, number>);

    const messagesByStatus = messages.reduce((acc, m) => {
      acc[m.status] = (acc[m.status] || 0) + 1;
      return acc;
    }, {} as Record<MessageStatus, number>);

    const messagesByPriority = messages.reduce((acc, m) => {
      acc[m.priority] = (acc[m.priority] || 0) + 1;
      return acc;
    }, {} as Record<MessagePriority, number>);

    // Top tags
    const tagCounts = new Map<string, number>();
    messages.forEach(m => {
      m.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Team performance (mock data)
    const teamPerformance = Array.from(this.users.values()).map(user => ({
      userId: user.id,
      name: user.name,
      messagesHandled: Math.floor(Math.random() * 50) + 10,
      averageResponseTime: Math.random() * 4 + 1,
      satisfaction: Math.random() * 2 + 3, // 3-5 scale
    }));

    return {
      totalMessages,
      unreadMessages,
      responseTime,
      resolutionTime,
      messagesByType,
      messagesByStatus,
      messagesByPriority,
      topTags,
      teamPerformance,
    };
  }

  // Private helper methods
  private initializeMockData(): void {
    // Initialize mock users
    const mockUsers: User[] = [
      {
        id: 'user1',
        email: 'admin@softcrown.com',
        name: 'Admin User',
        role: 'admin',
        avatar: '/avatars/admin.jpg',
        company: 'SoftCrown',
        phone: '+34 600 000 001',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        isActive: true,
        lastLogin: new Date(),
        projects: [],
      },
      {
        id: 'user2',
        email: 'support@softcrown.com',
        name: 'Support Agent',
        role: 'admin',
        avatar: '/avatars/support.jpg',
        company: 'SoftCrown',
        phone: '+34 600 000 002',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: true,
        isActive: true,
        lastLogin: new Date(),
        projects: [],
      },
    ];

    mockUsers.forEach(user => this.users.set(user.id, user));

    // Initialize mock contacts
    const mockContacts: Contact[] = [
      {
        id: 'contact1',
        name: 'Juan Pérez',
        email: 'juan@empresa.com',
        phone: '+34 600 123 456',
        company: 'Empresa ABC',
      },
      {
        id: 'contact2',
        name: 'María García',
        email: 'maria@startup.com',
        phone: '+34 600 789 012',
        company: 'Startup XYZ',
      },
    ];

    mockContacts.forEach(contact => this.contacts.set(contact.id, contact));

    // Initialize mock templates
    const mockTemplates: MessageTemplate[] = [
      {
        id: 'template1',
        name: 'Bienvenida Cliente',
        subject: 'Bienvenido a SoftCrown, {{contact.name}}',
        content: 'Hola {{contact.name}},\n\nGracias por contactar con SoftCrown. Estamos emocionados de trabajar contigo.\n\nSaludos,\nEquipo SoftCrown',
        type: 'email',
        category: 'onboarding',
        variables: ['contact.name'],
        isActive: true,
        usageCount: 15,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'template2',
        name: 'Seguimiento Propuesta',
        subject: 'Seguimiento de tu propuesta - {{contact.company}}',
        content: 'Hola {{contact.name}},\n\nEsperamos que hayas tenido tiempo de revisar nuestra propuesta. ¿Tienes alguna pregunta?\n\nQuedamos a tu disposición.\n\nSaludos,\nEquipo SoftCrown',
        type: 'email',
        category: 'follow-up',
        variables: ['contact.name', 'contact.company'],
        isActive: true,
        usageCount: 8,
        createdBy: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockTemplates.forEach(template => this.templates.set(template.id, template));

    // Initialize mock escalation rules
    const mockRules: AutoEscalationRule[] = [
      {
        id: 'rule1',
        name: 'Urgente sin asignar',
        conditions: [
          { field: 'priority', operator: 'equals', value: 'urgent' },
          { field: 'assignedTo', operator: 'equals', value: null },
        ],
        actions: [
          { type: 'assign', value: 'user1' },
          { type: 'notify', value: ['user1', 'user2'] },
        ],
        isActive: true,
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockRules.forEach(rule => this.escalationRules.set(rule.id, rule));

    // Initialize mock messages
    const mockMessages: Partial<Message>[] = [
      {
        type: 'email',
        subject: 'Consulta sobre desarrollo web',
        content: 'Hola, estoy interesado en desarrollar una página web para mi empresa. ¿Podrían enviarme información?',
        from: mockContacts[0],
        to: [{ id: 'softcrown', name: 'SoftCrown', email: 'info@softcrown.com' }],
        status: 'unread',
        priority: 'normal',
        tags: ['consulta', 'web'],
        attachments: [],
      },
      {
        type: 'form',
        subject: 'Formulario de contacto - Startup XYZ',
        content: 'Nombre: María García\nEmpresa: Startup XYZ\nServicio: E-commerce\nPresupuesto: 5000-10000€',
        from: mockContacts[1],
        to: [{ id: 'softcrown', name: 'SoftCrown', email: 'info@softcrown.com' }],
        status: 'read',
        priority: 'high',
        tags: ['formulario', 'ecommerce'],
        attachments: [],
        assignedTo: mockUsers[1],
      },
    ];

    mockMessages.forEach((messageData, index) => {
      const messageId = `message${index + 1}`;
      const message: Message = {
        id: messageId,
        cc: [],
        bcc: [],
        createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        sentAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
        ...messageData as Message,
      };
      this.messages.set(messageId, message);
    });
  }

  private processTemplateVariables(content: string, variables: Record<string, any>): string {
    let processedContent = content;
    
    Object.entries(variables).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([subKey, subValue]) => {
          const placeholder = `{{${key}.${subKey}}}`;
          processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(subValue));
        });
      } else {
        const placeholder = `{{${key}}}`;
        processedContent = processedContent.replace(new RegExp(placeholder, 'g'), String(value));
      }
    });

    return processedContent;
  }

  private evaluateConditions(message: Message, conditions: EscalationCondition[]): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(message, condition.field);
      
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

  private getFieldValue(message: Message, field: string): any {
    const fieldParts = field.split('.');
    let value: any = message;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    return value;
  }

  private async executeActions(message: Message, actions: EscalationAction[]): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'assign':
          const user = this.users.get(action.value);
          if (user) {
            message.assignedTo = user;
            message.updatedAt = new Date();
            this.messages.set(message.id, message);
          }
          break;
        case 'notify':
          // In a real app, this would send notifications
          // TODO: Implement actual notification system
          break;
        case 'tag':
          if (!message.tags.includes(action.value)) {
            message.tags.push(action.value);
            message.updatedAt = new Date();
            this.messages.set(message.id, message);
          }
          break;
        case 'priority':
          message.priority = action.value;
          message.updatedAt = new Date();
          this.messages.set(message.id, message);
          break;
        case 'template':
          // Would send template response
          // TODO: Implement template response system
          break;
      }
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRuleId(): string {
    return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateContactId(): string {
    return `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private trackMessageCreated(message: Message): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'message_created', {
        message_type: message.type,
        priority: message.priority,
        has_attachments: message.attachments.length > 0,
      });
    }
  }

  private trackMessageStatusChanged(message: Message, oldStatus: MessageStatus, newStatus: MessageStatus): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'message_status_changed', {
        message_id: message.id,
        from_status: oldStatus,
        to_status: newStatus,
        message_type: message.type,
      });
    }
  }
}

// Export singleton instance
export const communicationHubService = new CommunicationHubService();
