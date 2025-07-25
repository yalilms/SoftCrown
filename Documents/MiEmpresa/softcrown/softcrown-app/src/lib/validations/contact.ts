import { z } from 'zod';

// Personal Info Schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  company: z.string().optional(),
  position: z.string().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
});

// Project Details Schema
export const projectDetailsSchema = z.object({
  projectType: z.enum(['web-development', 'mobile-app', 'ecommerce', 'branding', 'consulting', 'other']),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  features: z.array(z.string()).min(1, 'Selecciona al menos una característica'),
  targetAudience: z.string().min(10, 'Describe tu audiencia objetivo'),
  competitors: z.string().optional(),
  inspiration: z.string().optional(),
});

// Budget Info Schema
export const budgetInfoSchema = z.object({
  range: z.enum(['under-5k', '5k-15k', '15k-30k', '30k-50k', 'over-50k', 'custom']),
  customAmount: z.number().positive().optional(),
  currency: z.enum(['EUR', 'USD']).default('EUR'),
  paymentPreference: z.enum(['upfront', 'milestone', 'monthly', 'completion']),
  hasExistingBudget: z.boolean(),
}).refine((data) => {
  if (data.range === 'custom' && !data.customAmount) {
    return false;
  }
  return true;
}, {
  message: 'Especifica el monto personalizado',
  path: ['customAmount'],
});

// Complete Contact Form Schema
export const contactFormSchema = z.object({
  personalInfo: personalInfoSchema,
  projectDetails: projectDetailsSchema,
  budget: budgetInfoSchema,
  timeline: z.string().min(1, 'Selecciona un timeline'),
  additionalInfo: z.string().optional(),
  preferredContact: z.enum(['email', 'phone', 'whatsapp', 'video-call']),
  marketingConsent: z.boolean(),
});

// Quote Item Schema
export const quoteItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nombre requerido'),
  description: z.string(),
  quantity: z.number().positive('Cantidad debe ser positiva'),
  unitPrice: z.number().positive('Precio debe ser positivo'),
  totalPrice: z.number(),
  category: z.enum(['development', 'design', 'consulting', 'maintenance', 'hosting']),
});

// Quote Schema
export const quoteSchema = z.object({
  id: z.string(),
  leadId: z.string(),
  items: z.array(quoteItemSchema).min(1, 'Agrega al menos un item'),
  subtotal: z.number(),
  tax: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().positive(),
  currency: z.enum(['EUR', 'USD']),
  validUntil: z.date().min(new Date(), 'Fecha debe ser futura'),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired']),
  terms: z.string().min(10, 'Términos requeridos'),
  notes: z.string().optional(),
});

// Chat Message Schema
export const chatMessageSchema = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  senderType: z.enum(['user', 'agent', 'system']),
  content: z.string().min(1, 'Mensaje no puede estar vacío'),
  timestamp: z.date(),
  type: z.enum(['text', 'file', 'image', 'system']),
  fileUrl: z.string().url().optional(),
  fileName: z.string().optional(),
  isRead: z.boolean(),
});

// Calendar Booking Schema
export const calendarBookingSchema = z.object({
  id: z.string(),
  leadId: z.string().optional(),
  contactEmail: z.string().email('Email inválido'),
  contactName: z.string().min(2, 'Nombre requerido'),
  meetingType: z.enum(['consultation', 'demo', 'follow-up', 'project-review']),
  scheduledAt: z.date().min(new Date(), 'Fecha debe ser futura'),
  duration: z.number().positive('Duración debe ser positiva'),
  status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show']),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
  reminders: z.boolean(),
});

// Lead Schema
export const leadSchema = z.object({
  id: z.string(),
  contact: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    company: z.string().optional(),
    position: z.string().optional(),
    website: z.string().url().optional(),
    source: z.enum(['website', 'referral', 'social', 'advertising', 'other']),
    tags: z.array(z.string()),
  }),
  project: z.object({
    type: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    budget: budgetInfoSchema,
    timeline: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    status: z.enum(['new', 'in-review', 'quoted', 'approved', 'in-progress', 'completed', 'cancelled']),
  }),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'nurturing']),
  score: z.number().min(0).max(100),
  interactions: z.array(z.object({
    id: z.string(),
    type: z.enum(['email', 'call', 'meeting', 'chat', 'note']),
    subject: z.string(),
    content: z.string(),
    timestamp: z.date(),
    userId: z.string(),
    attachments: z.array(z.string()).optional(),
    outcome: z.string().optional(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
  assignedTo: z.string().optional(),
  nextFollowUp: z.date().optional(),
  estimatedValue: z.number().min(0),
  probability: z.number().min(0).max(100),
  source: z.string(),
  notes: z.string(),
});

// Form validation helpers
export const validateStep = (step: number, data: any) => {
  switch (step) {
    case 1:
      return personalInfoSchema.safeParse(data);
    case 2:
      return projectDetailsSchema.safeParse(data);
    case 3:
      return budgetInfoSchema.safeParse(data);
    case 4:
      return contactFormSchema.safeParse(data);
    default:
      return { success: false, error: { issues: [{ message: 'Paso inválido' }] } };
  }
};

export type PersonalInfoForm = z.infer<typeof personalInfoSchema>;
export type ProjectDetailsForm = z.infer<typeof projectDetailsSchema>;
export type BudgetInfoForm = z.infer<typeof budgetInfoSchema>;
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type QuoteItemForm = z.infer<typeof quoteItemSchema>;
export type QuoteForm = z.infer<typeof quoteSchema>;
export type ChatMessageForm = z.infer<typeof chatMessageSchema>;
export type CalendarBookingForm = z.infer<typeof calendarBookingSchema>;
export type LeadForm = z.infer<typeof leadSchema>;
