'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useContact, useFormStep } from '@/contexts/ContactContext';
import { PersonalInfoForm } from '@/lib/validations/contact';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  BuildingOfficeIcon,
  BriefcaseIcon,
  GlobeAltIcon 
} from '@heroicons/react/24/outline';

export function PersonalInfoStep() {
  const { state, dispatch } = useContact();
  const { updateStep } = useFormStep();
  
  const [formData, setFormData] = useState<PersonalInfoForm>({
    firstName: state.formData.personalInfo?.firstName || '',
    lastName: state.formData.personalInfo?.lastName || '',
    email: state.formData.personalInfo?.email || '',
    phone: state.formData.personalInfo?.phone || '',
    company: state.formData.personalInfo?.company || '',
    position: state.formData.personalInfo?.position || '',
    website: state.formData.personalInfo?.website || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Real-time validation
  useEffect(() => {
    updateStep(1, formData);
  }, [formData, updateStep]);

  const handleChange = (field: keyof PersonalInfoForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Mark field as touched
    if (!touchedFields[field]) {
      setTouchedFields(prev => ({ ...prev, [field]: true }));
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof PersonalInfoForm) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } }
  };

  const InputField = ({ 
    field, 
    label, 
    type = 'text', 
    placeholder, 
    icon: Icon, 
    required = false 
  }: {
    field: keyof PersonalInfoForm;
    label: string;
    type?: string;
    placeholder: string;
    icon: React.ComponentType<any>;
    required?: boolean;
  }) => {
    const hasError = touchedFields[field] && fieldErrors[field];
    const value = formData[field] || '';

    return (
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            className="relative"
          >
            <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={type}
              value={value}
              onChange={(e) => handleChange(field, e.target.value)}
              onBlur={() => handleBlur(field)}
              placeholder={placeholder}
              className={`
                w-full pl-10 pr-4 py-3 border rounded-xl transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                ${hasError 
                  ? 'border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-600' 
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                }
                text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
              `}
            />
            
            {/* Success indicator */}
            {touchedFields[field] && !hasError && value && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </motion.div>
            )}
          </motion.div>
          
          {/* Error message */}
          {hasError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400 mt-1"
            >
              {fieldErrors[field]}
            </motion.p>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-gray-600 dark:text-gray-300">
          Comencemos conociendo un poco sobre ti. Esta información nos ayudará a personalizar nuestra propuesta.
        </p>
      </motion.div>

      {/* Form Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Required Fields */}
        <InputField
          field="firstName"
          label="Nombre"
          placeholder="Tu nombre"
          icon={UserIcon}
          required
        />
        
        <InputField
          field="lastName"
          label="Apellidos"
          placeholder="Tus apellidos"
          icon={UserIcon}
          required
        />
        
        <InputField
          field="email"
          label="Email"
          type="email"
          placeholder="tu@email.com"
          icon={EnvelopeIcon}
          required
        />
        
        <InputField
          field="phone"
          label="Teléfono"
          type="tel"
          placeholder="+34 600 000 000"
          icon={PhoneIcon}
          required
        />

        {/* Optional Fields */}
        <InputField
          field="company"
          label="Empresa"
          placeholder="Nombre de tu empresa"
          icon={BuildingOfficeIcon}
        />
        
        <InputField
          field="position"
          label="Cargo"
          placeholder="Tu posición en la empresa"
          icon={BriefcaseIcon}
        />
      </div>

      {/* Website Field - Full Width */}
      <InputField
        field="website"
        label="Sitio Web"
        type="url"
        placeholder="https://tuempresa.com"
        icon={GlobeAltIcon}
      />

      {/* Help Text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              ¿Por qué necesitamos esta información?
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Utilizamos estos datos para personalizar nuestra propuesta y establecer el mejor canal de comunicación contigo. 
              Tu información está protegida y nunca será compartida con terceros.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '25%' }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
      />
    </div>
  );
}
