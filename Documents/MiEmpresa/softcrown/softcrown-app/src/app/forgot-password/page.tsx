'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail as EnvelopeIcon, 
  AlertCircle as ExclamationCircleIcon,
  CheckCircle as CheckCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  Key as KeyIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Clear error when email changes
  useEffect(() => {
    if (error || validationError) {
      setError(null);
      setValidationError(null);
    }
  }, [email]);

  const validateEmail = (): boolean => {
    if (!email) {
      setValidationError('El email es requerido');
      return false;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationError('Email inválido');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      
      // For demo purposes, show the token
      // console.log('Password reset token:', result.token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al enviar el email de recuperación';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {/* Back to Login Link */}
        <div>
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Volver al login
          </Link>
        </div>

        {/* Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-6"
          >
            <KeyIcon className="h-8 w-8 text-white" />
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isSubmitted ? '¡Email Enviado!' : 'Recuperar Contraseña'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isSubmitted 
              ? 'Revisa tu bandeja de entrada para continuar'
              : 'Te enviaremos un enlace para restablecer tu contraseña'
            }
          </p>
        </div>

        {/* Success State */}
        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8 text-center"
          >
            <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Instrucciones Enviadas
            </h3>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Si existe una cuenta con el email <strong>{email}</strong>, 
              recibirás un enlace para restablecer tu contraseña en unos minutos.
            </p>

            <div className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ¿No ves el email? Revisa tu carpeta de spam o correo no deseado.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Enviar de nuevo
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  Volver al login
                </Button>
              </div>
            </div>

            {/* Demo Token Display */}
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                <strong>Demo:</strong> En producción, el enlace se enviaría por email. 
                Para probar, usa el enlace: 
                <Link 
                  href="/reset-password?token=demo-token" 
                  className="underline ml-1"
                >
                  Restablecer contraseña
                </Link>
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
              >
                <div className="flex">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8"
            >
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        validationError
                          ? 'border-red-300 bg-red-50 dark:bg-red-900/20'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                      } text-gray-900 dark:text-white`}
                      placeholder="tu@email.com"
                    />
                  </div>
                  {validationError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validationError}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full py-3 text-base font-medium"
                  size="lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
                </Button>
              </form>

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Recibirás un email con instrucciones para restablecer tu contraseña.
                </p>
              </div>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ¿Recordaste tu contraseña?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
