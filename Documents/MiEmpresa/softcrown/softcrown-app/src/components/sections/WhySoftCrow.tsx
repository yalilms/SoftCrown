'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import { use3DInteraction } from '@/hooks/use3DInteraction';
import { cn } from '@/lib/utils';

interface WhySoftCrowProps {
  className?: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  stats: {
    label: string;
    value: string;
  };
  benefits: string[];
  color: string;
}

interface ComparisonData {
  feature: string;
  softcrow: string;
  others: string;
  advantage: string;
}

const features: FeatureCard[] = [
  {
    id: 'innovation',
    title: 'Innovación Tecnológica',
    description: 'Utilizamos las últimas tecnologías y frameworks para crear soluciones de vanguardia.',
    icon: '🚀',
    stats: { label: 'Tecnologías Modernas', value: '25+' },
    benefits: ['React 18 & Next.js 14', 'TypeScript Estricto', 'Three.js & WebGL', 'PWA Avanzadas'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'performance',
    title: 'Rendimiento Superior',
    description: 'Optimizamos cada línea de código para garantizar la máxima velocidad y eficiencia.',
    icon: '⚡',
    stats: { label: 'Mejora de Velocidad', value: '300%' },
    benefits: ['Carga < 2 segundos', 'SEO Optimizado', 'Core Web Vitals', 'Caché Inteligente'],
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'design',
    title: 'Diseño Excepcional',
    description: 'Creamos experiencias visuales impactantes con interfaces intuitivas y modernas.',
    icon: '🎨',
    stats: { label: 'Satisfacción UI/UX', value: '98%' },
    benefits: ['Diseño Responsive', 'Micro-interacciones', 'Accesibilidad WCAG', 'Dark/Light Mode'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'support',
    title: 'Soporte Dedicado',
    description: 'Acompañamiento completo desde la conceptualización hasta el mantenimiento continuo.',
    icon: '🛠️',
    stats: { label: 'Tiempo de Respuesta', value: '< 2h' },
    benefits: ['Soporte 24/7', 'Actualizaciones Gratuitas', 'Monitoreo Proactivo', 'Consultoría Técnica'],
    color: 'from-green-500 to-emerald-500',
  },
];

const comparisonData: ComparisonData[] = [
  {
    feature: 'Tiempo de Desarrollo',
    softcrow: '4-6 semanas',
    others: '12-16 semanas',
    advantage: '60% más rápido',
  },
  {
    feature: 'Tecnologías Utilizadas',
    softcrow: 'React 18, Next.js 14, TypeScript',
    others: 'WordPress, jQuery, PHP',
    advantage: 'Stack moderno',
  },
  {
    feature: 'Rendimiento Web',
    softcrow: '95+ Core Web Vitals',
    others: '60-70 promedio',
    advantage: '40% mejor',
  },
  {
    feature: 'Mantenimiento',
    softcrow: 'Automatizado + Monitoreo',
    others: 'Manual + Reactivo',
    advantage: 'Proactivo',
  },
];

const FeatureCard3D: React.FC<{
  feature: FeatureCard;
  index: number;
  isRevealed: boolean;
}> = ({ feature, index, isRevealed }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { ref, transform, bind } = use3DInteraction({
    maxRotation: 15,
    scaleFactor: 1.05,
  });

  return (
    <motion.div
      ref={ref}
      className="relative h-80 perspective-1000"
      initial={{ opacity: 0, y: 50, rotateY: -90 }}
      animate={{
        opacity: isRevealed ? 1 : 0,
        y: isRevealed ? 0 : 50,
        rotateY: isRevealed ? 0 : -90,
      }}
      transition={{
        duration: 0.8,
        delay: index * 0.2,
        ease: "easeOut",
      }}
      {...bind}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          rotateX: transform.rotateX,
          rotateY: transform.rotateY,
          scale: transform.scale,
        }}
      >
        {/* Front Side */}
        <div className="absolute inset-0 backface-hidden">
          <div className={cn(
            "w-full h-full rounded-2xl p-6 text-white relative overflow-hidden",
            "bg-gradient-to-br", feature.color,
            "shadow-2xl border border-white/20"
          )}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 text-6xl">{feature.icon}</div>
              <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-white/10 transform translate-x-16 translate-y-16" />
              <div className="absolute top-1/2 left-0 w-24 h-24 rounded-full bg-white/5 transform -translate-x-12" />
            </div>

            <div className="relative z-10">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/90 mb-6 leading-relaxed">{feature.description}</p>
              
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{feature.stats.value}</div>
                <div className="text-sm text-white/80">{feature.stats.label}</div>
              </div>

              <div className="absolute bottom-4 right-4 text-white/60 text-sm">
                Click para más detalles →
              </div>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className="w-full h-full rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{feature.icon}</span>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Beneficios Clave:</h4>
              {feature.benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center space-x-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
              ← Click para volver
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ComparisonTool: React.FC = () => {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-accent p-6">
        <h3 className="text-2xl font-bold text-white mb-2">SoftCrown vs Competencia</h3>
        <p className="text-white/90">Comparación objetiva de nuestros servicios</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Característica
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-primary">
                SoftCrown
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                Otros
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-green-600">
                Ventaja
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, index) => (
              <motion.tr
                key={index}
                className={cn(
                  "border-b border-gray-200 dark:border-gray-600 cursor-pointer transition-colors",
                  selectedRow === index ? "bg-primary/5" : "hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                onClick={() => setSelectedRow(selectedRow === index ? null : index)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {row.feature}
                </td>
                <td className="px-6 py-4 text-sm text-primary font-semibold">
                  {row.softcrow}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {row.others}
                </td>
                <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                  {row.advantage}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selectedRow !== null && (
          <motion.div
            className="bg-primary/5 p-6 border-t border-primary/20"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Detalle:</strong> Esta ventaja se traduce en mayor eficiencia, 
              menor tiempo de desarrollo y mejor retorno de inversión para nuestros clientes.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WhySoftCrow: React.FC<WhySoftCrowProps> = ({ className }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const { triggeredItems, triggerAll } = useStaggeredAnimation(features.length, 0.2);

  React.useEffect(() => {
    if (isInView) {
      triggerAll();
    }
  }, [isInView, triggerAll]);

  return (
    <section
      ref={ref}
      className={cn(
        "py-20 bg-gradient-to-b from-background to-gray-50 dark:to-gray-900",
        className
      )}
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
              ¿Por qué elegir SoftCrown?
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Combinamos experiencia, innovación y dedicación para crear soluciones 
            digitales que superan las expectativas y impulsan el crecimiento de tu negocio.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <FeatureCard3D
              key={feature.id}
              feature={feature}
              index={index}
              isRevealed={triggeredItems[index]}
            />
          ))}
        </div>

        {/* Comparison Tool */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <ComparisonTool />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            ¿Listo para experimentar la diferencia SoftCrown?
          </p>
          <motion.button
            className="bg-gradient-to-r from-primary to-accent text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Solicitar Consulta Gratuita
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default WhySoftCrow;
