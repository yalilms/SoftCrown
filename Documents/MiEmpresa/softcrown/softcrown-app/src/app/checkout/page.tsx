'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckIcon,
  CreditCardIcon,
  UserIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { withAuth, useAuth } from '@/contexts/AuthContext';
import { useEcommerce } from '@/contexts/EcommerceContext';
import { CheckoutForm } from '@/types/ecommerce';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const CheckoutPage = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { state: ecommerceState, clearCart } = useEcommerce();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CheckoutForm>({
    email: authState.user?.email || '',
    firstName: authState.user?.name?.split(' ')[0] || '',
    lastName: authState.user?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    billingAddress: {
      firstName: '',
      lastName: '',
      company: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'España',
      phone: '',
    },
    useShippingAddress: false,
    paymentMethod: '',
    notes: '',
    subscribeNewsletter: false,
    agreeTerms: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const cart = ecommerceState.cart;

  useEffect(() => {
    if (!cart || cart.items.length === 0) {
      router.push('/carrito');
    }
  }, [cart, router]);

  if (!cart || cart.items.length === 0) {
    return null;
  }

  const steps = [
    { id: 1, name: 'Información Personal', icon: UserIcon },
    { id: 2, name: 'Dirección', icon: MapPinIcon },
    { id: 3, name: 'Pago', icon: CreditCardIcon },
    { id: 4, name: 'Confirmación', icon: CheckIcon },
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.email) newErrors.email = 'Email requerido';
      if (!formData.firstName) newErrors.firstName = 'Nombre requerido';
      if (!formData.lastName) newErrors.lastName = 'Apellido requerido';
    } else if (step === 2) {
      if (!formData.billingAddress.street) newErrors['billingAddress.street'] = 'Dirección requerida';
      if (!formData.billingAddress.city) newErrors['billingAddress.city'] = 'Ciudad requerida';
      if (!formData.billingAddress.postalCode) newErrors['billingAddress.postalCode'] = 'Código postal requerido';
    } else if (step === 3) {
      if (!formData.paymentMethod) newErrors.paymentMethod = 'Método de pago requerido';
    } else if (step === 4) {
      if (!formData.agreeTerms) newErrors.agreeTerms = 'Debe aceptar los términos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      clearCart();
      router.push('/checkout/success');
    } catch (error) {
      setErrors({ submit: 'Error al procesar el pedido' });
    } finally {
      setIsProcessing(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
            currentStep >= step.id
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'border-gray-300 text-gray-400'
          }`}>
            {currentStep > step.id ? (
              <CheckIcon className="w-5 h-5" />
            ) : (
              <step.icon className="w-5 h-5" />
            )}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-2 transition-colors ${
              currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Información Personal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Dirección de Facturación
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.billingAddress.street}
                onChange={(e) => setFormData({
                  ...formData,
                  billingAddress: { ...formData.billingAddress, street: e.target.value }
                })}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors['billingAddress.street'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors['billingAddress.street'] && (
                <p className="text-red-500 text-sm mt-1">{errors['billingAddress.street']}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, city: e.target.value }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors['billingAddress.city'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors['billingAddress.city'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['billingAddress.city']}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={formData.billingAddress.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    billingAddress: { ...formData.billingAddress, postalCode: e.target.value }
                  })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    errors['billingAddress.postalCode'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errors['billingAddress.postalCode'] && (
                  <p className="text-red-500 text-sm mt-1">{errors['billingAddress.postalCode']}</p>
                )}
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Método de Pago
            </h2>
            
            <div className="space-y-4">
              {['card', 'paypal', 'bank_transfer'].map((method) => (
                <label
                  key={method}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.paymentMethod === method
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={formData.paymentMethod === method}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="mr-4"
                  />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {method === 'card' ? 'Tarjeta de Crédito/Débito' :
                       method === 'paypal' ? 'PayPal' :
                       'Transferencia Bancaria'}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.paymentMethod && <p className="text-red-500 text-sm">{errors.paymentMethod}</p>}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Confirmar Pedido
            </h2>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Resumen del Pedido
              </h3>
              
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {item.product.name} x{item.quantity}
                    </div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      €{item.totalPrice.toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>€{cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                className="mt-1"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Acepto los términos y condiciones
              </span>
            </label>
            {errors.agreeTerms && <p className="text-red-500 text-sm">{errors.agreeTerms}</p>}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <StepIndicator />
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <AnimatePresence mode="wait">
              {renderStep()}
            </AnimatePresence>
            
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={nextStep}>
                  Siguiente
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  loading={isProcessing}
                  disabled={isProcessing}
                >
                  Finalizar Pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CheckoutPage, ['client', 'admin']);
