'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useScrollAnimation, useCounterAnimation } from '@/hooks/useScrollAnimation';
import { use3DInteraction } from '@/hooks/use3DInteraction';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  className?: string;
}

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 50,
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay + speed);

      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, delay, speed, onComplete, isComplete]);

  return (
    <span className="relative">
      {displayText}
      {!isComplete && (
        <motion.span
          className="inline-block w-0.5 h-8 bg-primary ml-1"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
};

const Logo3D: React.FC = () => {
  return (
    <div className="flex items-center justify-center w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-2xl">
      <span className="text-4xl font-bold text-white">SC</span>
    </div>
  );
};

const InteractiveParticle: React.FC<{ 
  index: number; 
  mouseX: number; 
  mouseY: number;
  isActive: boolean;
}> = ({ index, mouseX, mouseY, isActive }) => {
  const baseX = (index % 10) * 100;
  const baseY = Math.floor(index / 10) * 100;
  
  const distanceFromMouse = Math.sqrt(
    Math.pow(mouseX - baseX, 2) + Math.pow(mouseY - baseY, 2)
  );
  
  const influence = Math.max(0, 1 - distanceFromMouse / 200);
  const offsetX = (mouseX - baseX) * influence * 0.3;
  const offsetY = (mouseY - baseY) * influence * 0.3;

  return (
    <motion.div
      className="absolute w-2 h-2 bg-primary/40 rounded-full"
      style={{
        left: baseX + offsetX,
        top: baseY + offsetY,
      }}
      animate={{
        scale: isActive ? 1 + influence : 1,
        opacity: 0.4 + influence * 0.6,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
    />
  );
};

const StatsCounter: React.FC<{
  label: string;
  value: number;
  suffix?: string;
  delay?: number;
}> = ({ label, value, suffix = '', delay = 0 }) => {
  const { ref, count } = useCounterAnimation(value, 2000, true);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
    >
      <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </div>
    </motion.div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.2 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseActive, setIsMouseActive] = useState(false);
  const [typewriterComplete, setTypewriterComplete] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const { 
    ref: heroRef, 
    transform, 
    bind 
  } = use3DInteraction({
    maxRotation: 2,
    scaleFactor: 1.02,
    resetOnLeave: true,
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  // Detect client-side rendering to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = heroRef.current?.getBoundingClientRect();
      if (rect) {
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const x = e.clientX - centerX;
        const y = e.clientY - centerY;
        
        mouseX.set(x);
        mouseY.set(y);
        setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setIsMouseActive(true);
      }
    };

    const handleMouseLeave = () => {
      setIsMouseActive(false);
    };

    const heroElement = heroRef.current;
    if (heroElement) {
      heroElement.addEventListener('mousemove', handleMouseMove);
      heroElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (heroElement) {
        heroElement.removeEventListener('mousemove', handleMouseMove);
        heroElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [mouseX, mouseY, heroRef]);

  return (
    <section
      ref={ref}
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-background via-background/95 to-primary/5",
        className
      )}
    >
      {/* Interactive Particles Background - Only render on client */}
      {isClient && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 50 }, (_, i) => (
            <InteractiveParticle
              key={i}
              index={i}
              mouseX={mousePosition.x}
              mouseY={mousePosition.y}
              isActive={isMouseActive}
            />
          ))}
        </div>
      )}

      {/* Background Logo Element */}
      <div className="absolute inset-0 opacity-20 flex items-center justify-center">
        <Logo3D />
      </div>

      {/* Main Content */}
      <motion.div
        ref={heroRef}
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        {...bind}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: isInView ? 1 : 0, y: isInView ? 0 : 50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Main Heading with Typewriter Effect */}
        <motion.h1 
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6"
          style={{ transform: 'translateZ(50px)' }}
        >
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            <TypewriterText
              text="SoftCrown"
              delay={500}
              speed={100}
              onComplete={() => setTypewriterComplete(true)}
            />
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
          style={{ transform: 'translateZ(30px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: typewriterComplete ? 1 : 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <TypewriterText
            text="Transformamos ideas en experiencias digitales extraordinarias. Desarrollo web innovador con tecnologías de vanguardia."
            delay={0}
            speed={30}
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          style={{ transform: 'translateZ(20px)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: typewriterComplete ? 1 : 0, y: typewriterComplete ? 0 : 20 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <Button
            variant="gradient"
            size="xl"
            className="group relative overflow-hidden"
          >
            <span className="relative z-10">Comenzar Proyecto</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100"
              transition={{ duration: 0.3 }}
            />
          </Button>
          
          <Button
            variant="outline"
            size="xl"
            className="group"
          >
            <span>Ver Portfolio</span>
            <motion.svg
              className="ml-2 w-5 h-5 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </motion.svg>
          </Button>
        </motion.div>

        {/* Stats Counters */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          style={{ transform: 'translateZ(10px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <StatsCounter label="Proyectos Completados" value={150} suffix="+" delay={0} />
          <StatsCounter label="Clientes Satisfechos" value={80} suffix="+" delay={0.2} />
          <StatsCounter label="Años de Experiencia" value={8} suffix="+" delay={0.4} />
          <StatsCounter label="Tecnologías Dominadas" value={25} suffix="+" delay={0.6} />
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-primary rounded-full flex justify-center"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
