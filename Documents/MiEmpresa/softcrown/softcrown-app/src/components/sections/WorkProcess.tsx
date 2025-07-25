'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollAnimation, useCounterAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface WorkProcessProps {
  className?: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  duration: string;
  deliverables: string[];
  tools: string[];
  details: {
    activities: string[];
    timeline: string;
    outcome: string;
  };
  color: string;
}

interface EstimateData {
  projectType: string;
  complexity: string;
  features: string[];
  timeline: string;
  budget: string;
}

const processSteps: ProcessStep[] = [
  {
    id: 'discovery',
    title: 'Descubrimiento y Análisis',
    description: 'Entendemos tu visión, objetivos y requisitos específicos del proyecto.',
    icon: '🔍',
    duration: '1-2 semanas',
    deliverables: ['Documento de requisitos', 'Análisis competitivo', 'Arquitectura técnica'],
    tools: ['Figma', 'Miro', 'Notion'],
    details: {
      activities: [
        'Reuniones de descubrimiento con stakeholders',
        'Análisis de la competencia y mercado',
        'Definición de user personas y user journeys',
        'Arquitectura de información',
        'Selección del stack tecnológico'
      ],
      timeline: '7-14 días',
      outcome: 'Roadmap claro y especificaciones técnicas detalladas'
    },
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'design',
    title: 'Diseño UI/UX',
    description: 'Creamos wireframes, prototipos y el diseño visual completo.',
    icon: '🎨',
    duration: '2-3 semanas',
    deliverables: ['Wireframes', 'Prototipos interactivos', 'Design System', 'Assets finales'],
    tools: ['Figma', 'Adobe Creative Suite', 'Principle'],
    details: {
      activities: [
        'Wireframing y arquitectura de información',
        'Diseño de interfaz de usuario (UI)',
        'Prototipado interactivo',
        'Testing de usabilidad',
        'Creación del design system'
      ],
      timeline: '14-21 días',
      outcome: 'Diseño completo listo para desarrollo'
    },
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'development',
    title: 'Desarrollo',
    description: 'Codificamos tu proyecto usando las mejores prácticas y tecnologías modernas.',
    icon: '💻',
    duration: '4-8 semanas',
    deliverables: ['Código fuente', 'Documentación técnica', 'Tests automatizados'],
    tools: ['React/Next.js', 'TypeScript', 'Tailwind CSS', 'Jest'],
    details: {
      activities: [
        'Setup del entorno de desarrollo',
        'Desarrollo frontend y backend',
        'Integración de APIs y servicios',
        'Implementación de tests',
        'Code reviews y optimización'
      ],
      timeline: '28-56 días',
      outcome: 'Aplicación completamente funcional'
    },
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 'testing',
    title: 'Testing y QA',
    description: 'Realizamos pruebas exhaustivas para garantizar calidad y rendimiento.',
    icon: '🧪',
    duration: '1-2 semanas',
    deliverables: ['Plan de testing', 'Reportes de bugs', 'Métricas de rendimiento'],
    tools: ['Jest', 'Cypress', 'Lighthouse', 'BrowserStack'],
    details: {
      activities: [
        'Testing funcional y de integración',
        'Testing de rendimiento y carga',
        'Testing cross-browser y dispositivos',
        'Testing de accesibilidad',
        'Corrección de bugs y optimizaciones'
      ],
      timeline: '7-14 días',
      outcome: 'Aplicación estable y optimizada'
    },
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 'deployment',
    title: 'Despliegue y Lanzamiento',
    description: 'Ponemos tu proyecto en producción con monitoreo y soporte completo.',
    icon: '🚀',
    duration: '1 semana',
    deliverables: ['Aplicación en producción', 'Documentación de despliegue', 'Plan de monitoreo'],
    tools: ['Vercel', 'AWS', 'Docker', 'GitHub Actions'],
    details: {
      activities: [
        'Configuración del entorno de producción',
        'Despliegue automatizado',
        'Configuración de monitoreo',
        'Testing en producción',
        'Capacitación del equipo cliente'
      ],
      timeline: '5-7 días',
      outcome: 'Aplicación live y completamente operativa'
    },
    color: 'from-red-500 to-pink-500',
  },
  {
    id: 'maintenance',
    title: 'Mantenimiento y Soporte',
    description: 'Brindamos soporte continuo, actualizaciones y mejoras.',
    icon: '🛠️',
    duration: 'Continuo',
    deliverables: ['Soporte 24/7', 'Actualizaciones', 'Reportes mensuales'],
    tools: ['Monitoring Tools', 'Analytics', 'Support System'],
    details: {
      activities: [
        'Monitoreo proactivo del sistema',
        'Actualizaciones de seguridad',
        'Optimizaciones de rendimiento',
        'Nuevas funcionalidades',
        'Soporte técnico especializado'
      ],
      timeline: 'Ongoing',
      outcome: 'Sistema siempre actualizado y funcionando óptimamente'
    },
    color: 'from-gray-500 to-slate-500',
  },
];

const ProcessTimeline: React.FC<{
  steps: ProcessStep[];
  activeStep: number;
  onStepClick: (index: number) => void;
}> = ({ steps, activeStep, onStepClick }) => {
  const { ref, progress } = useScrollAnimation({ threshold: 0.3 });

  return (
    <div ref={ref} className="relative">
      {/* Timeline Line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200 dark:bg-gray-700">
        <motion.div
          className="w-full bg-gradient-to-b from-primary to-accent"
          initial={{ height: 0 }}
          animate={{ height: `${progress * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-8">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            className="relative flex items-start space-x-6 cursor-pointer group"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={() => onStepClick(index)}
          >
            {/* Step Icon */}
            <div className={cn(
              "relative z-10 flex items-center justify-center w-16 h-16 rounded-full text-2xl transition-all duration-300",
              index <= activeStep
                ? `bg-gradient-to-br ${step.color} text-white shadow-lg scale-110`
                : "bg-white dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-600 group-hover:border-primary group-hover:text-primary"
            )}>
              {step.icon}
              
              {/* Pulse animation for active step */}
              {index === activeStep && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className={cn(
                "p-6 rounded-2xl border transition-all duration-300",
                index === activeStep
                  ? "bg-white dark:bg-gray-800 border-primary shadow-lg scale-105"
                  : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 group-hover:border-primary/50 group-hover:shadow-md"
              )}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {step.duration}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {step.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Entregables:
                    </h4>
                    <ul className="space-y-1">
                      {step.deliverables.map((deliverable, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Herramientas:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.tools.map((tool, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const EstimateCalculator: React.FC = () => {
  const [estimate, setEstimate] = useState<EstimateData>({
    projectType: '',
    complexity: '',
    features: [],
    timeline: '',
    budget: '',
  });
  const [result, setResult] = useState<{
    timeline: string;
    budget: string;
    confidence: number;
  } | null>(null);

  const projectTypes = [
    { id: 'landing', name: 'Landing Page', baseWeeks: 2, baseCost: 1500 },
    { id: 'webapp', name: 'Web Application', baseWeeks: 6, baseCost: 5000 },
    { id: 'ecommerce', name: 'E-commerce', baseWeeks: 8, baseCost: 7000 },
    { id: 'mobile', name: 'Mobile App', baseWeeks: 10, baseCost: 8000 },
    { id: 'custom', name: 'Custom Solution', baseWeeks: 12, baseCost: 10000 },
  ];

  const complexityLevels = [
    { id: 'simple', name: 'Simple', multiplier: 1 },
    { id: 'medium', name: 'Medium', multiplier: 1.5 },
    { id: 'complex', name: 'Complex', multiplier: 2.2 },
  ];

  const availableFeatures = [
    { id: 'auth', name: 'Authentication', weeks: 1, cost: 800 },
    { id: 'payments', name: 'Payment Integration', weeks: 2, cost: 1200 },
    { id: 'admin', name: 'Admin Dashboard', weeks: 3, cost: 2000 },
    { id: 'api', name: 'Custom API', weeks: 2, cost: 1500 },
    { id: 'cms', name: 'Content Management', weeks: 2, cost: 1000 },
    { id: 'analytics', name: 'Analytics Integration', weeks: 1, cost: 600 },
    { id: 'seo', name: 'Advanced SEO', weeks: 1, cost: 500 },
    { id: 'pwa', name: 'PWA Features', weeks: 1, cost: 800 },
  ];

  const calculateEstimate = () => {
    const projectType = projectTypes.find(p => p.id === estimate.projectType);
    const complexity = complexityLevels.find(c => c.id === estimate.complexity);
    
    if (!projectType || !complexity) return;

    let totalWeeks = projectType.baseWeeks * complexity.multiplier;
    let totalCost = projectType.baseCost * complexity.multiplier;

    // Add features
    estimate.features.forEach(featureId => {
      const feature = availableFeatures.find(f => f.id === featureId);
      if (feature) {
        totalWeeks += feature.weeks * complexity.multiplier;
        totalCost += feature.cost * complexity.multiplier;
      }
    });

    // Calculate confidence based on complexity and features
    let confidence = 85;
    if (complexity.id === 'complex') confidence -= 15;
    if (estimate.features.length > 4) confidence -= 10;

    setResult({
      timeline: `${Math.ceil(totalWeeks)} semanas`,
      budget: `$${Math.ceil(totalCost).toLocaleString()}`,
      confidence: Math.max(confidence, 60),
    });
  };

  const handleFeatureToggle = (featureId: string) => {
    setEstimate(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        🧮 Calculadora de Estimación
      </h3>

      <div className="space-y-6">
        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Proyecto
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projectTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setEstimate(prev => ({ ...prev, projectType: type.id }))}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  estimate.projectType === type.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-gray-600 hover:border-primary/50"
                )}
              >
                <div className="font-medium">{type.name}</div>
                <div className="text-sm text-gray-500">
                  {type.baseWeeks} sem • ${type.baseCost.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Complejidad
          </label>
          <div className="grid grid-cols-3 gap-3">
            {complexityLevels.map(level => (
              <button
                key={level.id}
                onClick={() => setEstimate(prev => ({ ...prev, complexity: level.id }))}
                className={cn(
                  "p-3 rounded-lg border text-center transition-all duration-200",
                  estimate.complexity === level.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-gray-600 hover:border-primary/50"
                )}
              >
                <div className="font-medium">{level.name}</div>
                <div className="text-sm text-gray-500">
                  {level.multiplier}x
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Características Adicionales
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableFeatures.map(feature => (
              <button
                key={feature.id}
                onClick={() => handleFeatureToggle(feature.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all duration-200",
                  estimate.features.includes(feature.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-gray-600 hover:border-primary/50"
                )}
              >
                <div className="font-medium text-sm">{feature.name}</div>
                <div className="text-xs text-gray-500">
                  +{feature.weeks} sem • +${feature.cost}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={calculateEstimate}
          disabled={!estimate.projectType || !estimate.complexity}
          className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
        >
          Calcular Estimación
        </button>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">
                📊 Estimación del Proyecto
              </h4>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Timeline</div>
                  <div className="text-xl font-bold text-primary">{result.timeline}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Presupuesto</div>
                  <div className="text-xl font-bold text-primary">{result.budget}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Confianza: {result.confidence}%
                </span>
                <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${result.confidence}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * Esta es una estimación preliminar. El presupuesto final puede variar según los requisitos específicos.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const WorkProcess: React.FC<WorkProcessProps> = ({ className }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [activeStep, setActiveStep] = useState(0);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  // Auto-advance timeline simulation
  useEffect(() => {
    if (isInView) {
      const interval = setInterval(() => {
        setActiveStep(prev => (prev + 1) % processSteps.length);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isInView]);

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setExpandedStep(expandedStep === index ? null : index);
  };

  return (
    <section
      ref={ref}
      className={cn(
        "py-20 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900 dark:to-background",
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
              Nuestro Proceso de Trabajo
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Un proceso estructurado y transparente que garantiza resultados excepcionales 
            en cada etapa del desarrollo de tu proyecto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <ProcessTimeline
              steps={processSteps}
              activeStep={activeStep}
              onStepClick={handleStepClick}
            />

            {/* Expanded Step Details */}
            <AnimatePresence>
              {expandedStep !== null && (
                <motion.div
                  className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">{processSteps[expandedStep].icon}</span>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {processSteps[expandedStep].title} - Detalles
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Actividades Principales
                      </h4>
                      <ul className="space-y-2">
                        {processSteps[expandedStep].details.activities.map((activity, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2 mt-2 flex-shrink-0" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Timeline Detallado
                      </h4>
                      <div className="text-2xl font-bold text-primary mb-2">
                        {processSteps[expandedStep].details.timeline}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Tiempo estimado para completar esta fase del proyecto.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Resultado Esperado
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {processSteps[expandedStep].details.outcome}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Estimate Calculator */}
          <div>
            <EstimateCalculator />
          </div>
        </div>

        {/* Process Summary */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 30 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🎯 Garantía de Calidad
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
              Cada proyecto pasa por nuestro riguroso proceso de calidad que incluye 
              code reviews, testing automatizado, y validación continua con el cliente.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">99.5%</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Uptime Garantizado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Soporte Técnico</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">30 días</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Garantía Post-Launch</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WorkProcess;
