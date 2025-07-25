'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/auth';
import Button from '@/components/ui/Button';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Get token from URL params
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam) {
      setToken(tokenParam);
      setEmail(emailParam);
      verifyEmail(tokenParam);
    } else {
      setError('Token de verificación no válido o faltante');
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      await authService.verifyEmail(verificationToken);
      setIsVerified(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al verificar el email';
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('No se puede reenviar la verificación sin un email válido');
      return;
    }

    try {
      // In production, this would call an API to resend verification email
      // console.log('Resending verification email to:', email);
      // For demo purposes, we'll just show a success message
      alert('Email de verificación reenviado. Revisa tu bandeja de entrada.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al reenviar el email de verificación';
      setError(message);
    }
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
            className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
              isVerified 
                ? 'bg-green-600' 
                : error 
                ? 'bg-red-600' 
                : 'bg-blue-600'
            }`}
          >
            {isVerifying ? (
              <ClockIcon className="h-8 w-8 text-white animate-spin" />
            ) : isVerified ? (
              <CheckCircleIcon className="h-8 w-8 text-white" />
            ) : error ? (
              <ExclamationCircleIcon className="h-8 w-8 text-white" />
            ) : (
              <EnvelopeIcon className="h-8 w-8 text-white" />
            )}
          </motion.div>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isVerifying 
              ? 'Verificando Email...' 
              : isVerified 
              ? '¡Email Verificado!' 
              : error 
              ? 'Error de Verificación'
              : 'Verificar Email'
            }
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isVerifying 
              ? 'Por favor espera mientras verificamos tu email'
              : isVerified 
              ? 'Tu email ha sido verificado correctamente'
              : error 
              ? 'Hubo un problema al verificar tu email'
              : 'Verificando tu dirección de email'
            }
          </p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-8"
        >
          {/* Verifying State */}
          {isVerifying && (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
              </div>
              <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
                Esto puede tomar unos segundos...
              </p>
            </div>
          )}

          {/* Success State */}
          {isVerified && (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                ¡Verificación Exitosa!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Tu dirección de email ha sido verificada correctamente. 
                Ahora puedes acceder a todas las funcionalidades de tu cuenta.
              </p>

              {email && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800 dark:text-green-200">
                    <strong>Email verificado:</strong> {email}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full py-3 text-base font-medium"
                  size="lg"
                >
                  Iniciar Sesión
                </Button>
                
                <Button
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full py-3 text-base font-medium"
                  size="lg"
                >
                  Ir al Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isVerifying && (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                <ExclamationCircleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Error de Verificación
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Posibles causas:
                </p>
                <ul className="text-sm text-gray-600 dark:text-gray-400 text-left space-y-1">
                  <li>• El enlace de verificación ha expirado</li>
                  <li>• El enlace ya fue utilizado anteriormente</li>
                  <li>• El enlace está malformado o es inválido</li>
                  <li>• Tu email ya está verificado</li>
                </ul>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  {email && (
                    <Button
                      onClick={handleResendVerification}
                      variant="outline"
                      className="flex-1"
                    >
                      Reenviar Verificación
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => router.push('/login')}
                    className="flex-1"
                  >
                    Ir al Login
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* No Token State */}
          {!token && !isVerifying && (
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-6">
                <ExclamationCircleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Token de Verificación Requerido
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Para verificar tu email, necesitas acceder a través del enlace 
                enviado a tu dirección de correo electrónico.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>¿No encuentras el email?</strong><br />
                  Revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/register')}
                  className="w-full py-3 text-base font-medium"
                  size="lg"
                >
                  Crear Nueva Cuenta
                </Button>
                
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full py-3 text-base font-medium"
                  size="lg"
                >
                  Iniciar Sesión
                </Button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Help Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ¿Necesitas ayuda?{' '}
            <Link
              href="/contact"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Contacta con soporte
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
