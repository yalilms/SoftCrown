import emailjs from '@emailjs/browser';

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_softcrown',
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || 'template_contact',
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'your_public_key_here'
};

// Initialize EmailJS
export const initEmailJS = () => {
  emailjs.init(EMAILJS_CONFIG.publicKey);
};

// Email template interfaces
export interface EmailTemplate {
  to_email: string;
  to_name: string;
  from_name: string;
  subject: string;
  message: string;
  company?: string;
  phone?: string;
  project_type?: string;
  budget?: string;
  timeline?: string;
}

export interface ContactFormEmail extends EmailTemplate {
  contact_type: 'contact_form';
  form_data: any;
}

export interface QuoteEmail extends EmailTemplate {
  contact_type: 'quote_request';
  quote_data: any;
  total_price: number;
}

export interface FollowUpEmail extends EmailTemplate {
  contact_type: 'follow_up';
  lead_id: string;
  template_type: string;
}

// Send contact form email
export const sendContactFormEmail = async (formData: any): Promise<boolean> => {
  try {
    const templateParams: ContactFormEmail = {
      contact_type: 'contact_form',
      to_email: 'info@softcrown.com',
      to_name: 'SoftCrown Team',
      from_name: `${formData.firstName} ${formData.lastName}`,
      subject: `Nueva consulta de ${formData.company || formData.firstName}`,
      message: formData.projectDescription || 'Sin descripción proporcionada',
      company: formData.company,
      phone: formData.phone,
      project_type: formData.projectType,
      budget: formData.budget,
      timeline: formData.timeline,
      form_data: JSON.stringify(formData)
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Contact form email sent successfully:', result);
    return result.status === 200;
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return false;
  }
};

// Send quote email
export const sendQuoteEmail = async (quoteData: any, contactInfo: any): Promise<boolean> => {
  try {
    const templateParams: QuoteEmail = {
      contact_type: 'quote_request',
      to_email: contactInfo.email,
      to_name: `${contactInfo.firstName} ${contactInfo.lastName}`,
      from_name: 'SoftCrown Team',
      subject: `Cotización para ${quoteData.category} - ${contactInfo.company}`,
      message: `Hemos preparado una cotización personalizada para su proyecto de ${quoteData.category}.`,
      company: contactInfo.company,
      phone: contactInfo.phone,
      project_type: quoteData.category,
      budget: `€${quoteData.total.toLocaleString()}`,
      timeline: quoteData.timeline,
      quote_data: JSON.stringify(quoteData),
      total_price: quoteData.total
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_quote', // Different template for quotes
      templateParams
    );

    console.log('Quote email sent successfully:', result);
    return result.status === 200;
  } catch (error) {
    console.error('Error sending quote email:', error);
    return false;
  }
};

// Send follow-up email
export const sendFollowUpEmail = async (
  leadEmail: string,
  leadName: string,
  templateType: string,
  customMessage: string,
  leadId: string
): Promise<boolean> => {
  try {
    const templateParams: FollowUpEmail = {
      contact_type: 'follow_up',
      to_email: leadEmail,
      to_name: leadName,
      from_name: 'SoftCrown Team',
      subject: getFollowUpSubject(templateType),
      message: customMessage,
      lead_id: leadId,
      template_type: templateType
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_followup', // Different template for follow-ups
      templateParams
    );

    console.log('Follow-up email sent successfully:', result);
    return result.status === 200;
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return false;
  }
};

// Send automated email based on trigger
export const sendAutomatedEmail = async (
  trigger: string,
  leadData: any,
  templateData: any
): Promise<boolean> => {
  try {
    const templateParams = {
      ...templateData,
      trigger_type: trigger,
      lead_data: JSON.stringify(leadData),
      automated: true
    };

    const result = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      'template_automated',
      templateParams
    );

    console.log('Automated email sent successfully:', result);
    return result.status === 200;
  } catch (error) {
    console.error('Error sending automated email:', error);
    return false;
  }
};

// Helper function to get follow-up subject based on template type
const getFollowUpSubject = (templateType: string): string => {
  const subjects = {
    'welcome': '¡Bienvenido a SoftCrown! Próximos pasos',
    'proposal_sent': 'Su propuesta está lista - SoftCrown',
    'follow_up_1': 'Seguimiento de su consulta - SoftCrown',
    'follow_up_2': '¿Podemos ayudarle con su proyecto?',
    'meeting_reminder': 'Recordatorio: Reunión programada',
    'thank_you': 'Gracias por elegirnos - SoftCrown',
    'feedback_request': 'Su opinión es importante para nosotros'
  };

  return subjects[templateType as keyof typeof subjects] || 'Seguimiento - SoftCrown';
};

// Validate email configuration
export const validateEmailConfig = (): boolean => {
  return !!(
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.serviceId !== 'service_softcrown' &&
    EMAILJS_CONFIG.publicKey !== 'your_public_key_here'
  );
};

// Get email sending status
export const getEmailStatus = () => {
  return {
    configured: validateEmailConfig(),
    serviceId: EMAILJS_CONFIG.serviceId,
    hasTemplate: !!EMAILJS_CONFIG.templateId,
    hasPublicKey: !!EMAILJS_CONFIG.publicKey
  };
};
