'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { ContactForm, FormProgress, Lead, Quote, ChatSession, CalendarBooking } from '@/types/contact';
import { validateStep } from '@/lib/validations/contact';

interface ContactState {
  // Form state
  formData: Partial<ContactForm>;
  progress: FormProgress;
  isSubmitting: boolean;
  errors: Record<string, string>;
  
  // Leads management
  leads: Lead[];
  currentLead: Lead | null;
  
  // Quotes
  quotes: Quote[];
  currentQuote: Quote | null;
  
  // Chat
  chatSessions: ChatSession[];
  activeChatSession: ChatSession | null;
  
  // Calendar
  bookings: CalendarBooking[];
  
  // UI state
  isLoading: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

type ContactAction =
  | { type: 'SET_FORM_DATA'; payload: Partial<ContactForm> }
  | { type: 'UPDATE_STEP'; payload: { step: number; data: any } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' }
  | { type: 'SAVE_PROGRESS' }
  | { type: 'LOAD_PROGRESS'; payload: { formData: Partial<ContactForm>; progress: FormProgress } }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: { id: string; updates: Partial<Lead> } }
  | { type: 'SET_CURRENT_LEAD'; payload: Lead | null }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'ADD_QUOTE'; payload: Quote }
  | { type: 'UPDATE_QUOTE'; payload: { id: string; updates: Partial<Quote> } }
  | { type: 'SET_CURRENT_QUOTE'; payload: Quote | null }
  | { type: 'ADD_CHAT_SESSION'; payload: ChatSession }
  | { type: 'UPDATE_CHAT_SESSION'; payload: { id: string; updates: Partial<ChatSession> } }
  | { type: 'SET_ACTIVE_CHAT'; payload: ChatSession | null }
  | { type: 'ADD_BOOKING'; payload: CalendarBooking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<CalendarBooking> } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id' | 'timestamp' | 'isRead'> }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: ContactState = {
  formData: {},
  progress: {
    currentStep: 1,
    completedSteps: [],
    totalSteps: 4,
    isValid: false,
  },
  isSubmitting: false,
  errors: {},
  leads: [],
  currentLead: null,
  quotes: [],
  currentQuote: null,
  chatSessions: [],
  activeChatSession: null,
  bookings: [],
  isLoading: false,
  notifications: [],
};

function contactReducer(state: ContactState, action: ContactAction): ContactState {
  switch (action.type) {
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case 'UPDATE_STEP':
      const { step, data } = action.payload;
      const validation = validateStep(step, data);
      
      let updatedFormData = { ...state.formData };
      let updatedErrors = { ...state.errors };
      let updatedCompletedSteps = [...state.progress.completedSteps];

      if (validation.success) {
        // Update form data based on step
        switch (step) {
          case 1:
            updatedFormData.personalInfo = data;
            break;
          case 2:
            updatedFormData.projectDetails = data;
            break;
          case 3:
            updatedFormData.budget = data;
            break;
        }
        
        // Mark step as completed
        if (!updatedCompletedSteps.includes(step)) {
          updatedCompletedSteps.push(step);
        }
        
        // Clear errors for this step
        Object.keys(updatedErrors).forEach(key => {
          if (key.startsWith(`step${step}`)) {
            delete updatedErrors[key];
          }
        });
      } else {
        // Set validation errors
        validation.error?.issues.forEach(issue => {
          updatedErrors[`step${step}.${issue.path.join('.')}`] = issue.message;
        });
      }

      return {
        ...state,
        formData: updatedFormData,
        errors: updatedErrors,
        progress: {
          ...state.progress,
          completedSteps: updatedCompletedSteps,
          isValid: validation.success,
        },
      };

    case 'NEXT_STEP':
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep: Math.min(state.progress.currentStep + 1, state.progress.totalSteps),
        },
      };

    case 'PREV_STEP':
      return {
        ...state,
        progress: {
          ...state.progress,
          currentStep: Math.max(state.progress.currentStep - 1, 1),
        },
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.payload,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload,
      };

    case 'RESET_FORM':
      return {
        ...state,
        formData: {},
        progress: {
          currentStep: 1,
          completedSteps: [],
          totalSteps: 4,
          isValid: false,
        },
        errors: {},
        isSubmitting: false,
      };

    case 'SAVE_PROGRESS':
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('contactFormProgress', JSON.stringify({
          formData: state.formData,
          progress: { ...state.progress, savedAt: new Date() },
        }));
      }
      return state;

    case 'LOAD_PROGRESS':
      return {
        ...state,
        formData: action.payload.formData,
        progress: action.payload.progress,
      };

    case 'ADD_LEAD':
      return {
        ...state,
        leads: [...state.leads, action.payload],
      };

    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead =>
          lead.id === action.payload.id
            ? { ...lead, ...action.payload.updates, updatedAt: new Date() }
            : lead
        ),
      };

    case 'SET_CURRENT_LEAD':
      return {
        ...state,
        currentLead: action.payload,
      };

    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter(lead => lead.id !== action.payload),
        currentLead: state.currentLead?.id === action.payload ? null : state.currentLead,
      };

    case 'ADD_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload],
      };

    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote =>
          quote.id === action.payload.id
            ? { ...quote, ...action.payload.updates }
            : quote
        ),
      };

    case 'SET_CURRENT_QUOTE':
      return {
        ...state,
        currentQuote: action.payload,
      };

    case 'ADD_CHAT_SESSION':
      return {
        ...state,
        chatSessions: [...state.chatSessions, action.payload],
      };

    case 'UPDATE_CHAT_SESSION':
      return {
        ...state,
        chatSessions: state.chatSessions.map(session =>
          session.id === action.payload.id
            ? { ...session, ...action.payload.updates }
            : session
        ),
      };

    case 'SET_ACTIVE_CHAT':
      return {
        ...state,
        activeChatSession: action.payload,
      };

    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.payload],
      };

    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === action.payload.id
            ? { ...booking, ...action.payload.updates }
            : booking
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'ADD_NOTIFICATION':
      const newNotification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: new Date(),
        isRead: false,
      };
      return {
        ...state,
        notifications: [newNotification, ...state.notifications],
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true }
            : notification
        ),
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
      };

    default:
      return state;
  }
}

const ContactContext = createContext<{
  state: ContactState;
  dispatch: React.Dispatch<ContactAction>;
} | null>(null);

export function ContactProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contactReducer, initialState);

  // Auto-save progress
  useEffect(() => {
    const autoSave = () => {
      if (Object.keys(state.formData).length > 0) {
        dispatch({ type: 'SAVE_PROGRESS' });
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [state.formData]);

  // Load saved progress on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contactFormProgress');
      if (saved) {
        try {
          const { formData, progress } = JSON.parse(saved);
          dispatch({ type: 'LOAD_PROGRESS', payload: { formData, progress } });
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    }
  }, []);

  return (
    <ContactContext.Provider value={{ state, dispatch }}>
      {children}
    </ContactContext.Provider>
  );
}

export function useContact() {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
}

// Helper hooks
export function useFormStep() {
  const { state, dispatch } = useContact();
  
  const nextStep = () => dispatch({ type: 'NEXT_STEP' });
  const prevStep = () => dispatch({ type: 'PREV_STEP' });
  const updateStep = (step: number, data: any) => dispatch({ type: 'UPDATE_STEP', payload: { step, data } });
  
  return {
    currentStep: state.progress.currentStep,
    totalSteps: state.progress.totalSteps,
    completedSteps: state.progress.completedSteps,
    isValid: state.progress.isValid,
    nextStep,
    prevStep,
    updateStep,
  };
}

export function useLeads() {
  const { state, dispatch } = useContact();
  
  const addLead = (lead: Lead) => dispatch({ type: 'ADD_LEAD', payload: lead });
  const updateLead = (id: string, updates: Partial<Lead>) => dispatch({ type: 'UPDATE_LEAD', payload: { id, updates } });
  const deleteLead = (id: string) => dispatch({ type: 'DELETE_LEAD', payload: id });
  const setCurrentLead = (lead: Lead | null) => dispatch({ type: 'SET_CURRENT_LEAD', payload: lead });
  
  return {
    leads: state.leads,
    currentLead: state.currentLead,
    addLead,
    updateLead,
    deleteLead,
    setCurrentLead,
  };
}

export function useNotifications() {
  const { state, dispatch } = useContact();
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => 
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
  
  const markAsRead = (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  const removeNotification = (id: string) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  
  return {
    notifications: state.notifications,
    addNotification,
    markAsRead,
    removeNotification,
  };
}
