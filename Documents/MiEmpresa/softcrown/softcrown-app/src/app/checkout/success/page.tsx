'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  EnvelopeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { withAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

const CheckoutSuccessPage = () => {
  const router = useRouter();

  // Mock order data - in real app, this would come from URL params or API
  const orderData = {
    orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
    email: 'cliente@ejemplo.com',
    total: 1299.00,
    estimatedDelivery: '7-10 días laborables',
    items: [
      { name: 'Sitio Web Básico', quantity: 1, price: 899 },
      { name: 'Diseño de Logo Profesional', quantity: 1, price: 299 },
      { name: 'Certificado SSL Premium', quantity: 1, price: 99 },
    ]
  };

  useEffect(() => {
    // Track conversion event
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        transaction_id: orderData.orderNumber,
        value: orderData.total,
        currency: 'EUR',
        items: orderData.items.map(item => ({
          item_name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircleIcon className="w-20 h-20 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2">
                ¡Pedido Confirmado!
              </h1>
              <p className="text-green-100 text-lg">
                Gracias por confiar en SoftCrown
              </p>
            </div>

            {/* Order Details */}
            <div className="p-8 space-y-8">
              {/* Order Number */}
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Número de Pedido
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  #{orderData.orderNumber}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resumen del Pedido
                </h3>
                <div className="space-y-3">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Cantidad: {item.quantity}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        €{item.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                      <span>Total</span>
                      <span>€{orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  ¿Qué sigue ahora?
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Confirmación por Email
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Hemos enviado los detalles del pedido a <strong>{orderData.email}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Tiempo de Entrega
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tu proyecto estará listo en <strong>{orderData.estimatedDelivery}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Comunicación Directa
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Nuestro equipo se pondrá en contacto contigo en las próximas 24 horas
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Ver Mi Dashboard
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/tienda')}
                  >
                    Seguir Comprando
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push('/contacto')}
                  >
                    Contactar Soporte
                  </Button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Información Importante
                </h4>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Tu pedido ha sido procesado y asignado a nuestro equipo de desarrollo
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Recibirás actualizaciones regulares sobre el progreso de tu proyecto
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Puedes seguir el estado de tu pedido desde tu dashboard personal
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    Nuestro soporte está disponible 24/7 para cualquier consulta
                  </li>
                </ul>
              </div>

              {/* Social Sharing */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  ¿Te gustó nuestro servicio? ¡Compártelo con tus amigos!
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://twitter.com/intent/tweet?text=Acabo%20de%20contratar%20servicios%20profesionales%20en%20SoftCrown%20%F0%9F%9A%80', '_blank')}
                  >
                    Compartir en Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open('https://www.linkedin.com/sharing/share-offsite/?url=https://softcrown.com', '_blank')}
                  >
                    Compartir en LinkedIn
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(CheckoutSuccessPage, ['client', 'admin']);
