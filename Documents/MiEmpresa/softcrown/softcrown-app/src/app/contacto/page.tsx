'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ContactProvider } from '@/contexts/ContactContext';
import { MultiStepForm } from '@/components/contact/MultiStepForm';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const contactMethods = [
  {
    name: 'Teléfono',
    value: '+34 650 63 65 99',
    href: 'tel:+34650636599',
    icon: PhoneIcon,
    description: 'Llámanos directamente',
    available: '9:00 - 18:00 (Lun-Vie)',
    color: 'green'
  },
  {
    name: 'Email',
    value: 'info@softcrown.com',
    href: 'mailto:info@softcrown.com',
    icon: EnvelopeIcon,
    description: 'Escríbenos un email',
    available: 'Respuesta en 24h',
    color: 'blue'
  },
  {
    name: 'WhatsApp',
    value: '+34 650 63 65 99',
    href: 'https://wa.me/34650636599',
    icon: ChatBubbleLeftRightIcon,
    description: 'Chat instantáneo',
    available: 'Respuesta inmediata',
    color: 'green'
  },
  {
    name: 'Videollamada',
    value: 'Agendar reunión',
    href: '#video-call',
    icon: VideoCameraIcon,
    description: 'Reunión virtual',
    available: 'Previa cita',
    color: 'purple'
  }
];

const stats = [
  { label: 'Proyectos Completados', value: '500+' },
  { label: 'Clientes Satisfechos', value: '99%' },
  { label: 'Años de Experiencia', value: '10+' },
  { label: 'Tiempo de Respuesta', value: '24h' }
];

export default function ContactoPage() {
  return (
    <ContactProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20">
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              >
                Hablemos de tu{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Proyecto
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              >
                Completa nuestro formulario inteligente y recibe una propuesta personalizada 
                en menos de 24 horas. Sin compromisos, solo soluciones a medida.
              </motion.p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-12"
              >
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <MultiStepForm />
              </div>

              {/* Contact Information Sidebar */}
              <div className="space-y-8">
                {/* Contact Methods */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Otras formas de contacto
                  </h3>
                  
                  <div className="space-y-6">
                    {contactMethods.map((method) => (
                      <motion.a
                        key={method.name}
                        href={method.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: contactMethods.indexOf(method) * 0.1 }}
                        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                      >
                        <div className={`
                          flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center
                          bg-${method.color}-100 dark:bg-${method.color}-900/30 
                          group-hover:bg-${method.color}-200 dark:group-hover:bg-${method.color}-900/50
                          transition-colors
                        `}>
                          <method.icon className={`w-6 h-6 text-${method.color}-600 dark:text-${method.color}-400`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {method.name}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-1">
                            {method.description}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {method.value}
                          </p>
                          <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {method.available}
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </motion.div>

                {/* Office Information */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Nuestra Oficina
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Madrid, España
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Trabajamos de forma remota y presencial
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <ClockIcon className="w-5 h-5 text-gray-400 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Horario de Atención
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Lunes a Viernes: 9:00 - 18:00<br />
                          Sábados: 10:00 - 14:00
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Process Overview */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Nuestro Proceso
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Análisis', description: 'Estudiamos tu proyecto en detalle' },
                      { step: '02', title: 'Propuesta', description: 'Creamos una solución personalizada' },
                      { step: '03', title: 'Desarrollo', description: 'Implementamos con metodología ágil' },
                      { step: '04', title: 'Entrega', description: 'Lanzamos y damos soporte continuo' }
                    ].map((item) => (
                      <div key={item.step} className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* FAQ Quick Links */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                >
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Preguntas Frecuentes
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      '¿Cuánto tiempo toma un proyecto?',
                      '¿Ofrecen soporte post-lanzamiento?',
                      '¿Trabajan con startups?',
                      '¿Qué tecnologías utilizan?'
                    ].map((question, index) => (
                      <a
                        key={index}
                        href="/faq"
                        className="block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm transition-colors"
                      >
                        → {question}
                      </a>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href="/faq"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm"
                    >
                      Ver todas las preguntas frecuentes →
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Tienes prisa?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Llámanos directamente y hablemos de tu proyecto ahora mismo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+34650636599"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5 mr-2" />
                  +34 650 63 65 99
                </a>
                <a
                  href="https://wa.me/34650636599"
                  className="inline-flex items-center justify-center px-8 py-4 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </ContactProvider>
  );
}
