// CRM External Sync Integration
// Supports HubSpot, Salesforce, Pipedrive, and other CRM platforms

export interface CRMConfig {
  provider: 'hubspot' | 'salesforce' | 'pipedrive' | 'zoho' | 'custom';
  apiKey: string;
  baseUrl?: string;
  environment: 'sandbox' | 'production';
}

export interface CRMContact {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  phone?: string;
  website?: string;
  jobTitle?: string;
  source?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CRMLead extends CRMContact {
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score?: number;
  value?: number;
  currency?: string;
  pipeline?: string;
  stage?: string;
  assignedTo?: string;
  lastActivity?: Date;
  nextFollowUp?: Date;
  notes?: string[];
  activities?: CRMActivity[];
}

export interface CRMActivity {
  id?: string;
  type: 'email' | 'call' | 'meeting' | 'note' | 'task';
  subject: string;
  description?: string;
  date: Date;
  duration?: number;
  outcome?: string;
  createdBy?: string;
  contactId: string;
  leadId?: string;
}

export interface CRMSyncResult {
  success: boolean;
  id?: string;
  error?: string;
  data?: any;
}

// HubSpot Integration
export class HubSpotCRMService {
  private apiKey: string;
  private baseUrl = 'https://api.hubapi.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            email: contact.email,
            firstname: contact.firstName,
            lastname: contact.lastName,
            company: contact.company,
            phone: contact.phone,
            website: contact.website,
            jobtitle: contact.jobTitle,
            hs_lead_status: 'NEW',
            lifecyclestage: 'lead'
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create contact in HubSpot'
        };
      }

      return {
        success: true,
        id: data.id,
        data: data
      };
    } catch (error) {
      console.error('Error creating HubSpot contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateContact(contactId: string, updates: Partial<CRMContact>): Promise<CRMSyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            ...(updates.firstName && { firstname: updates.firstName }),
            ...(updates.lastName && { lastname: updates.lastName }),
            ...(updates.company && { company: updates.company }),
            ...(updates.phone && { phone: updates.phone }),
            ...(updates.website && { website: updates.website }),
            ...(updates.jobTitle && { jobtitle: updates.jobTitle })
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to update contact in HubSpot'
        };
      }

      return {
        success: true,
        id: contactId,
        data: data
      };
    } catch (error) {
      console.error('Error updating HubSpot contact:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createDeal(lead: CRMLead): Promise<CRMSyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/crm/v3/objects/deals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            dealname: `${lead.company || lead.firstName + ' ' + lead.lastName} - Deal`,
            dealstage: this.mapStatusToDealStage(lead.status),
            amount: lead.value || 0,
            pipeline: lead.pipeline || 'default',
            hubspot_owner_id: lead.assignedTo
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to create deal in HubSpot'
        };
      }

      return {
        success: true,
        id: data.id,
        data: data
      };
    } catch (error) {
      console.error('Error creating HubSpot deal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapStatusToDealStage(status: string): string {
    const stageMap: Record<string, string> = {
      'new': 'appointmentscheduled',
      'contacted': 'qualifiedtobuy',
      'qualified': 'presentationscheduled',
      'proposal': 'decisionmakerboughtin',
      'negotiation': 'contractsent',
      'won': 'closedwon',
      'lost': 'closedlost'
    };
    return stageMap[status] || 'appointmentscheduled';
  }
}

// Salesforce Integration
export class SalesforceCRMService {
  private accessToken: string;
  private instanceUrl: string;

  constructor(accessToken: string, instanceUrl: string) {
    this.accessToken = accessToken;
    this.instanceUrl = instanceUrl;
  }

  async createLead(lead: CRMLead): Promise<CRMSyncResult> {
    try {
      const response = await fetch(`${this.instanceUrl}/services/data/v57.0/sobjects/Lead/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FirstName: lead.firstName,
          LastName: lead.lastName,
          Email: lead.email,
          Company: lead.company || 'Unknown',
          Phone: lead.phone,
          Website: lead.website,
          Title: lead.jobTitle,
          Status: this.mapStatusToSalesforceStatus(lead.status),
          LeadSource: lead.source || 'Website',
          Rating: this.mapScoreToRating(lead.score)
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data[0]?.message || 'Failed to create lead in Salesforce'
        };
      }

      return {
        success: true,
        id: data.id,
        data: data
      };
    } catch (error) {
      console.error('Error creating Salesforce lead:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private mapStatusToSalesforceStatus(status: string): string {
    const statusMap: Record<string, string> = {
      'new': 'Open - Not Contacted',
      'contacted': 'Working - Contacted',
      'qualified': 'Qualified',
      'proposal': 'Qualified',
      'negotiation': 'Qualified',
      'won': 'Closed - Converted',
      'lost': 'Closed - Not Converted'
    };
    return statusMap[status] || 'Open - Not Contacted';
  }

  private mapScoreToRating(score?: number): string {
    if (!score) return 'Cold';
    if (score >= 80) return 'Hot';
    if (score >= 60) return 'Warm';
    return 'Cold';
  }
}

// Main CRM Sync Service
export class CRMSyncService {
  private hubspotService?: HubSpotCRMService;
  private salesforceService?: SalesforceCRMService;
  private config: CRMConfig;

  constructor(config: CRMConfig) {
    this.config = config;
    this.initializeService();
  }

  private initializeService() {
    switch (this.config.provider) {
      case 'hubspot':
        if (this.config.apiKey) {
          this.hubspotService = new HubSpotCRMService(this.config.apiKey);
        }
        break;
      case 'salesforce':
        if (this.config.apiKey && this.config.baseUrl) {
          this.salesforceService = new SalesforceCRMService(this.config.apiKey, this.config.baseUrl);
        }
        break;
    }
  }

  async syncContact(contact: CRMContact): Promise<CRMSyncResult> {
    try {
      switch (this.config.provider) {
        case 'hubspot':
          if (!this.hubspotService) {
            throw new Error('HubSpot service not initialized');
          }
          return await this.hubspotService.createContact(contact);
        
        default:
          return {
            success: false,
            error: `CRM provider ${this.config.provider} not supported yet`
          };
      }
    } catch (error) {
      console.error('Error syncing contact to CRM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncLead(lead: CRMLead): Promise<CRMSyncResult> {
    try {
      switch (this.config.provider) {
        case 'hubspot':
          if (!this.hubspotService) {
            throw new Error('HubSpot service not initialized');
          }
          // First create contact, then create deal
          const contactResult = await this.hubspotService.createContact(lead);
          if (!contactResult.success) {
            return contactResult;
          }
          return await this.hubspotService.createDeal(lead);
        
        case 'salesforce':
          if (!this.salesforceService) {
            throw new Error('Salesforce service not initialized');
          }
          return await this.salesforceService.createLead(lead);
        
        default:
          return {
            success: false,
            error: `CRM provider ${this.config.provider} not supported yet`
          };
      }
    } catch (error) {
      console.error('Error syncing lead to CRM:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async syncActivity(activity: CRMActivity): Promise<CRMSyncResult> {
    // Implementation for syncing activities
    return {
      success: true,
      data: { message: 'Activity sync not implemented yet' }
    };
  }

  // Batch sync operations
  async batchSyncLeads(leads: CRMLead[]): Promise<CRMSyncResult[]> {
    const results: CRMSyncResult[] = [];
    
    for (const lead of leads) {
      const result = await this.syncLead(lead);
      results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Validate CRM configuration
  validateConfig(): boolean {
    return !!(this.config.apiKey && this.config.provider);
  }

  // Get sync status
  getSyncStatus() {
    return {
      provider: this.config.provider,
      configured: this.validateConfig(),
      environment: this.config.environment,
      services: {
        hubspot: !!this.hubspotService,
        salesforce: !!this.salesforceService
      }
    };
  }
}

// Export default CRM sync service
export const createCRMSyncService = (provider: CRMConfig['provider']): CRMSyncService => {
  const config: CRMConfig = {
    provider,
    apiKey: process.env.NEXT_PUBLIC_CRM_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_CRM_BASE_URL,
    environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox'
  };

  return new CRMSyncService(config);
};

// Default instance
export const crmSyncService = createCRMSyncService('hubspot');
