'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCarouselGestures } from '@/hooks/useGestures';
import { cn } from '@/lib/utils';

interface ServicesCarouselProps {
  className?: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  technologies: string[];
  price: string;
  duration: string;
  link: string;
  color: string;
  image: string;
}

const services: Service[] = [
  {
    id: 'web-development',
    title: 'Desarrollo Web Completo',
    description: 'Aplicaciones web modernas y escalables con las últimas tecnologías.',
    icon: '💻',
    features: ['React/Next.js', 'TypeScript', 'Responsive Design', 'SEO Optimizado'],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    price: 'Desde $2,500',
    duration: '4-8 semanas',
    link: '/servicios/desarrollo-web',
    color: 'from-blue-500 to-cyan-500',
    image: '/images/services/web-dev.jpg',
  },
  {
    id: 'mobile-apps',
    title: 'Aplicaciones Móviles',
    description: 'Apps nativas e híbridas para iOS y Android con experiencia excepcional.',
    icon: '📱',
    features: ['React Native', 'Flutter', 'Push Notifications', 'Offline Support'],
    technologies: ['React Native', 'Flutter', 'Firebase', 'Redux'],
    price: 'Desde $3,500',
    duration: '6-12 semanas',
    link: '/servicios/apps-moviles',
    color: 'from-purple-500 to-pink-500',
    image: '/images/services/mobile-apps.jpg',
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Avanzado',
    description: 'Tiendas online completas con gestión de inventario y pagos integrados.',
    icon: '🛒',
    features: ['Shopify/WooCommerce', 'Pagos Seguros', 'Inventario', 'Analytics'],
    technologies: ['Shopify', 'WooCommerce', 'Stripe', 'PayPal'],
    price: 'Desde $4,000',
    duration: '8-16 semanas',
    link: '/servicios/ecommerce',
    color: 'from-green-500 to-emerald-500',
    image: '/images/services/ecommerce.jpg',
  },
  {
    id: 'ui-ux-design',
    title: 'Diseño UI/UX',
    description: 'Interfaces intuitivas y experiencias de usuario excepcionales.',
    icon: '🎨',
    features: ['Wireframing', 'Prototyping', 'User Testing', 'Design Systems'],
    technologies: ['Figma', 'Adobe XD', 'Sketch', 'InVision'],
    price: 'Desde $1,500',
    duration: '2-6 semanas',
    link: '/servicios/diseno-ui-ux',
    color: 'from-orange-500 to-red-500',
    image: '/images/services/ui-ux.jpg',
  },
  {
    id: 'consulting',
    title: 'Consultoría Técnica',
    description: 'Asesoramiento experto en arquitectura y estrategia tecnológica.',
    icon: '🔧',
    features: ['Code Review', 'Architecture', 'Performance', 'Security'],
    technologies: ['AWS', 'Docker', 'CI/CD', 'Monitoring'],
    price: 'Desde $200/hora',
    duration: 'Flexible',
    link: '/servicios/consultoria',
    color: 'from-yellow-500 to-orange-500',
    image: '/images/services/consulting.jpg',
  },
];

const ServiceCard3D: React.FC<{
  service: Service;
  index: number;
  isActive: boolean;
  isVisible: boolean;
  onClick: () => void;
}> = ({ service, index, isActive, isVisible, onClick }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const getTransform = () => {
    if (!isVisible) return 'translateX(100%) rotateY(45deg) scale(0.8)';
    if (isActive) return 'translateX(0%) rotateY(0deg) scale(1)';
    
    const offset = index * 20;
    return `translateX(${offset}%) rotateY(${offset * 0.5}deg) scale(${1 - index * 0.1})`;
  };

  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-pointer preserve-3d"
      style={{
        transform: getTransform(),
        zIndex: isActive ? 10 : 10 - index,
      }}
      animate={{
        transform: getTransform(),
      }}
      transition={{
        duration: 0.6,
        ease: "easeInOut",
      }}
      onClick={onClick}
      whileHover={{ scale: isActive ? 1.02 : 1 }}
    >
      <div className={cn(
        "w-full h-full rounded-3xl overflow-hidden shadow-2xl",
        "bg-gradient-to-br", service.color,
        "border border-white/20 backdrop-blur-sm"
      )}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 right-8 text-8xl">{service.icon}</div>
          <div className="absolute bottom-0 right-0 w-40 h-40 rounded-full bg-white/10 transform translate-x-20 translate-y-20" />
          <div className="absolute top-1/3 left-0 w-32 h-32 rounded-full bg-white/5 transform -translate-x-16" />
        </div>

        <div className="relative z-10 p-8 h-full flex flex-col text-white">
          {/* Header */}
          <div className="mb-6">
            <div className="text-5xl mb-4">{service.icon}</div>
            <h3 className="text-3xl font-bold mb-3">{service.title}</h3>
            <p className="text-white/90 text-lg leading-relaxed">{service.description}</p>
          </div>

          {/* Features */}
          <div className="mb-6 flex-1">
            <h4 className="text-lg font-semibold mb-3">Características:</h4>
            <div className="grid grid-cols-2 gap-2">
              {service.features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center space-x-2 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isActive ? 1 : 0.7, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Tecnologías:</h4>
            <div className="flex flex-wrap gap-2">
              {service.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold">{service.price}</div>
              <div className="text-white/80 text-sm">{service.duration}</div>
            </div>
            <Link
              href={service.link}
              className="bg-white/20 hover:bg-white/30 px-6 py-3 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              Ver Más →
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ServicesCarousel: React.FC<ServicesCarouselProps> = ({ className }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Gesture controls
  const gestureBinds = useCarouselGestures(services.length, nextSlide, prevSlide);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && !isPaused && isInView) {
      autoPlayRef.current = setInterval(nextSlide, 4000);
    } else if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, isPaused, isInView]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(!isPaused);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.x > threshold) {
      prevSlide();
    } else if (info.offset.x < -threshold) {
      nextSlide();
    }
  };

  return (
    <section
      ref={ref}
      className={cn(
        "py-20 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background",
        className
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Nuestros Servicios
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Soluciones completas para todas tus necesidades digitales, 
            desde desarrollo web hasta consultoría especializada.
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          <motion.div
            className="relative h-96 md:h-[500px] perspective-1000 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            {...gestureBinds}
          >
            {services.map((service, index) => {
              const isActive = index === currentIndex;
              const relativeIndex = (index - currentIndex + services.length) % services.length;
              const isVisible = relativeIndex < 3;

              return (
                <ServiceCard3D
                  key={service.id}
                  service={service}
                  index={relativeIndex}
                  isActive={isActive}
                  isVisible={isVisible}
                  onClick={() => goToSlide(index)}
                />
              );
            })}
          </motion.div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20"
            aria-label="Servicio anterior"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 z-20"
            aria-label="Siguiente servicio"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          {services.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              )}
              aria-label={`Ir al servicio ${index + 1}`}
            />
          ))}
        </div>

        {/* Auto-play Controls */}
        <div className="flex justify-center items-center space-x-4 mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            {isAutoPlaying ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                </svg>
                <span className="text-sm">Pausar</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 015 0H17" />
                </svg>
                <span className="text-sm">Reproducir</span>
              </>
            )}
          </button>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {services.length}
          </div>
        </div>

        {/* Service Quick Links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {services.map((service, index) => (
            <Link
              key={service.id}
              href={service.link}
              className={cn(
                "p-4 rounded-xl text-center transition-all duration-300 border",
                index === currentIndex
                  ? "bg-primary text-white border-primary shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md"
              )}
            >
              <div className="text-2xl mb-2">{service.icon}</div>
              <div className="text-sm font-medium">{service.title}</div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesCarousel;
