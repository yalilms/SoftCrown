'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, Html } from '@react-three/drei';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useDrag3D, useFloating3D } from '@/hooks/use3DInteraction';
import { useGestures } from '@/hooks/useGestures';
import { cn } from '@/lib/utils';

interface TechStackProps {
  className?: string;
}

interface Technology {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'tools' | 'cloud';
  icon: string;
  color: string;
  skillLevel: number; // 1-5
  description: string;
  projects: number;
  position: [number, number, number];
}

interface SkillMatch {
  tech: string;
  match: number;
  reason: string;
}

const technologies: Technology[] = [
  // Frontend
  {
    id: 'react',
    name: 'React',
    category: 'frontend',
    icon: '⚛️',
    color: '#61DAFB',
    skillLevel: 5,
    description: 'Biblioteca JavaScript para interfaces de usuario',
    projects: 45,
    position: [-2, 1, 0],
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'frontend',
    icon: '▲',
    color: '#000000',
    skillLevel: 5,
    description: 'Framework React para producción',
    projects: 38,
    position: [2, 1, 0],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'frontend',
    icon: '📘',
    color: '#3178C6',
    skillLevel: 5,
    description: 'JavaScript tipado para mejor desarrollo',
    projects: 42,
    position: [0, 2, 0],
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'frontend',
    icon: '🎨',
    color: '#06B6D4',
    skillLevel: 5,
    description: 'Framework CSS utility-first',
    projects: 40,
    position: [-1, 0, 1],
  },
  {
    id: 'threejs',
    name: 'Three.js',
    category: 'frontend',
    icon: '🎮',
    color: '#000000',
    skillLevel: 4,
    description: 'Biblioteca JavaScript para gráficos 3D',
    projects: 15,
    position: [1, 0, 1],
  },
  
  // Backend
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'backend',
    icon: '🟢',
    color: '#339933',
    skillLevel: 4,
    description: 'Runtime JavaScript del lado del servidor',
    projects: 35,
    position: [-2, -1, 0],
  },
  {
    id: 'python',
    name: 'Python',
    category: 'backend',
    icon: '🐍',
    color: '#3776AB',
    skillLevel: 4,
    description: 'Lenguaje versátil para backend y AI',
    projects: 28,
    position: [2, -1, 0],
  },
  {
    id: 'graphql',
    name: 'GraphQL',
    category: 'backend',
    icon: '📊',
    color: '#E10098',
    skillLevel: 4,
    description: 'Lenguaje de consulta para APIs',
    projects: 22,
    position: [0, -2, 0],
  },
  
  // Database
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    icon: '🍃',
    color: '#47A248',
    skillLevel: 4,
    description: 'Base de datos NoSQL orientada a documentos',
    projects: 30,
    position: [-1, -1, -1],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    icon: '🐘',
    color: '#336791',
    skillLevel: 4,
    description: 'Sistema de gestión de bases de datos relacionales',
    projects: 25,
    position: [1, -1, -1],
  },
  
  // Cloud & Tools
  {
    id: 'aws',
    name: 'AWS',
    category: 'cloud',
    icon: '☁️',
    color: '#FF9900',
    skillLevel: 3,
    description: 'Servicios de computación en la nube',
    projects: 20,
    position: [-2, 0, -1],
  },
  {
    id: 'docker',
    name: 'Docker',
    category: 'tools',
    icon: '🐳',
    color: '#2496ED',
    skillLevel: 4,
    description: 'Plataforma de contenedores',
    projects: 32,
    position: [2, 0, -1],
  },
];

const FloatingTechIcon: React.FC<{
  tech: Technology;
  isSelected: boolean;
  onSelect: () => void;
  isDragging: boolean;
}> = ({ tech, isSelected, onSelect, isDragging }) => {
  const meshRef = useRef<any>(null);
  const floating = useFloating3D(0.5, 0.8);

  useFrame((state) => {
    if (meshRef.current && !isDragging) {
      meshRef.current.position.y = tech.position[1] + floating.y * 0.1;
      meshRef.current.rotation.x = floating.rotateX * 0.01;
      meshRef.current.rotation.z = floating.rotateZ * 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group
        ref={meshRef}
        position={tech.position}
        onClick={onSelect}
      >
        {/* Icon Background */}
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color={tech.color}
            transparent
            opacity={isSelected ? 0.8 : 0.6}
            emissive={tech.color}
            emissiveIntensity={isSelected ? 0.3 : 0.1}
          />
        </mesh>

        {/* Skill Level Rings */}
        {Array.from({ length: tech.skillLevel }, (_, i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <torusGeometry args={[0.4 + i * 0.1, 0.02, 8, 32]} />
            <meshStandardMaterial
              color={tech.color}
              transparent
              opacity={0.3 - i * 0.05}
            />
          </mesh>
        ))}

        {/* HTML Label */}
        <Html
          position={[0, -0.6, 0]}
          center
          distanceFactor={10}
          occlude
        >
          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {tech.icon} {tech.name}
            </span>
          </div>
        </Html>

        {/* Selection Indicator */}
        {isSelected && (
          <mesh>
            <torusGeometry args={[0.5, 0.05, 8, 32]} />
            <meshStandardMaterial
              color="#3b82f6"
              emissive="#3b82f6"
              emissiveIntensity={0.5}
            />
          </mesh>
        )}
      </group>
    </Float>
  );
};

const TechMatcher: React.FC<{
  technologies: Technology[];
  onMatch: (matches: SkillMatch[]) => void;
}> = ({ technologies, onMatch }) => {
  const [projectType, setProjectType] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');

  const calculateMatches = () => {
    const matches: SkillMatch[] = [];
    
    technologies.forEach(tech => {
      let matchScore = 0;
      let reasons: string[] = [];

      // Project type matching
      if (projectType === 'web-app' && tech.category === 'frontend') {
        matchScore += 30;
        reasons.push('Ideal para aplicaciones web');
      }
      if (projectType === 'api' && tech.category === 'backend') {
        matchScore += 30;
        reasons.push('Perfecto para desarrollo de APIs');
      }
      if (projectType === 'ecommerce' && ['frontend', 'database'].includes(tech.category)) {
        matchScore += 25;
        reasons.push('Esencial para e-commerce');
      }

      // Budget considerations
      if (budget === 'low' && tech.skillLevel >= 4) {
        matchScore += 20;
        reasons.push('Tecnología madura y eficiente');
      }
      if (budget === 'high' && tech.skillLevel === 5) {
        matchScore += 25;
        reasons.push('Tecnología premium para proyectos ambiciosos');
      }

      // Timeline considerations
      if (timeline === 'fast' && tech.projects > 30) {
        matchScore += 20;
        reasons.push('Amplia experiencia para desarrollo rápido');
      }

      // Skill level bonus
      matchScore += tech.skillLevel * 5;

      if (matchScore > 20) {
        matches.push({
          tech: tech.name,
          match: Math.min(matchScore, 100),
          reason: reasons.join(', ') || 'Tecnología recomendada',
        });
      }
    });

    matches.sort((a, b) => b.match - a.match);
    onMatch(matches.slice(0, 5));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        🎯 Technology Matcher
      </h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Proyecto
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona un tipo</option>
            <option value="web-app">Aplicación Web</option>
            <option value="mobile-app">App Móvil</option>
            <option value="ecommerce">E-commerce</option>
            <option value="api">API/Backend</option>
            <option value="landing">Landing Page</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Presupuesto
          </label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona presupuesto</option>
            <option value="low">Bajo ($1K - $5K)</option>
            <option value="medium">Medio ($5K - $15K)</option>
            <option value="high">Alto ($15K+)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Timeline
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Selecciona timeline</option>
            <option value="fast">Rápido (2-4 semanas)</option>
            <option value="medium">Medio (1-3 meses)</option>
            <option value="long">Largo (3+ meses)</option>
          </select>
        </div>
      </div>

      <button
        onClick={calculateMatches}
        disabled={!projectType || !budget || !timeline}
        className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-300"
      >
        Encontrar Tecnologías Ideales
      </button>
    </div>
  );
};

const TechStack: React.FC<TechStackProps> = ({ className }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [draggedTech, setDraggedTech] = useState<string | null>(null);
  const [skillMatches, setSkillMatches] = useState<SkillMatch[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const { bind: dragBind } = useDrag3D();
  const { bind: gestureBind } = useGestures();

  const categories = [
    { id: 'all', name: 'Todas', icon: '🔧' },
    { id: 'frontend', name: 'Frontend', icon: '🎨' },
    { id: 'backend', name: 'Backend', icon: '⚙️' },
    { id: 'database', name: 'Database', icon: '🗄️' },
    { id: 'cloud', name: 'Cloud', icon: '☁️' },
    { id: 'tools', name: 'Tools', icon: '🛠️' },
  ];

  const filteredTechnologies = filterCategory === 'all' 
    ? technologies 
    : technologies.filter(tech => tech.category === filterCategory);

  const handleTechSelect = (tech: Technology) => {
    setSelectedTech(selectedTech?.id === tech.id ? null : tech);
  };

  const handleSkillMatch = (matches: SkillMatch[]) => {
    setSkillMatches(matches);
  };

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
              Stack Tecnológico
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Dominamos las tecnologías más avanzadas para crear soluciones robustas, 
            escalables y de alto rendimiento.
          </p>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.id)}
              className={cn(
                "px-6 py-3 rounded-full font-medium transition-all duration-300",
                filterCategory === category.id
                  ? "bg-primary text-white shadow-lg scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600"
              )}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 3D Tech Visualization */}
          <div className="lg:col-span-2">
            <motion.div
              className="relative h-96 bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: isInView ? 1 : 0, scale: isInView ? 1 : 0.9 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              {...gestureBind}
            >
              <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
                <ambientLight intensity={0.6} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                {filteredTechnologies.map((tech) => (
                  <FloatingTechIcon
                    key={tech.id}
                    tech={tech}
                    isSelected={selectedTech?.id === tech.id}
                    onSelect={() => handleTechSelect(tech)}
                    isDragging={draggedTech === tech.id}
                  />
                ))}
              </Canvas>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 text-white/70 text-sm">
                <p>🖱️ Click para seleccionar • 📱 Arrastra para rotar</p>
              </div>
            </motion.div>

            {/* Selected Tech Details */}
            <AnimatePresence>
              {selectedTech && (
                <motion.div
                  className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{selectedTech.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedTech.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {selectedTech.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Nivel de Experiencia</div>
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: 5 }, (_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-3 h-3 rounded-full",
                                  i < selectedTech.skillLevel ? "bg-primary" : "bg-gray-200 dark:bg-gray-600"
                                )}
                              />
                            ))}
                            <span className="ml-2 text-sm font-medium">
                              {selectedTech.skillLevel}/5
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Proyectos Realizados</div>
                          <div className="text-2xl font-bold text-primary">
                            {selectedTech.projects}+
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Technology Matcher */}
          <div className="space-y-6">
            <TechMatcher
              technologies={technologies}
              onMatch={handleSkillMatch}
            />

            {/* Skill Matches Results */}
            <AnimatePresence>
              {skillMatches.length > 0 && (
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                    🎯 Tecnologías Recomendadas
                  </h4>
                  
                  <div className="space-y-3">
                    {skillMatches.map((match, index) => (
                      <motion.div
                        key={match.tech}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {match.tech}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {match.reason}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {match.match}%
                          </div>
                          <div className="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-primary to-accent"
                              initial={{ width: 0 }}
                              animate={{ width: `${match.match}%` }}
                              transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
