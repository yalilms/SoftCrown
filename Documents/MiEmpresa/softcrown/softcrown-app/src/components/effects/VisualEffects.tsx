'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualEffectsProps {
  enableParticles?: boolean;
  enableOrbs?: boolean;
  enableGrid?: boolean;
  theme?: 'light' | 'dark';
}

const VisualEffects: React.FC<VisualEffectsProps> = ({
  enableParticles = true,
  enableOrbs = true,
  enableGrid = true,
  theme = 'dark',
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [windowDimensions, setWindowDimensions] = useState({ width: 1200, height: 800 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    updateWindowDimensions();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', updateWindowDimensions);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateWindowDimensions);
    };
  }, []);

  useEffect(() => {
    if (enableParticles && isClient) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * windowDimensions.width,
        y: Math.random() * windowDimensions.height,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    }
  }, [enableParticles, isClient, windowDimensions]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Animated Grid Background */}
      {enableGrid && (
        <div className="absolute inset-0 opacity-20 dark:opacity-10">
          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern
                id="grid"
                width="60"
                height="60"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 60 0 L 0 0 0 60"
                  fill="none"
                  stroke={theme === 'dark' ? '#3b82f6' : '#6366f1'}
                  strokeWidth="1"
                  opacity="0.3"
                />
              </pattern>
              <radialGradient id="gridGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopOpacity="0.5" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#gridGradient)" />
          </svg>
        </div>
      )}

      {/* Floating Orbs */}
      {enableOrbs && (
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-xl opacity-30"
              style={{
                background: `linear-gradient(45deg, ${
                  ['#3b82f6', '#d946ef', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'][i]
                }, transparent)`,
                width: `${100 + i * 50}px`,
                height: `${100 + i * 50}px`,
              }}
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -100, 50, 0],
                scale: [1, 1.2, 0.8, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: "linear",
                delay: i * 2,
              }}
              initial={{
                x: isClient ? Math.random() * windowDimensions.width : Math.random() * 1200,
                y: isClient ? Math.random() * windowDimensions.height : Math.random() * 800,
              }}
            />
          ))}
        </div>
      )}

      {/* Interactive Mouse Particles */}
      {enableParticles && (
        <div className="absolute inset-0">
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-1 h-1 bg-primary rounded-full opacity-60"
                initial={{
                  x: particle.x,
                  y: particle.y,
                  scale: 0,
                }}
                animate={{
                  x: mousePosition.x + (Math.random() - 0.5) * 100,
                  y: mousePosition.y + (Math.random() - 0.5) * 100,
                  scale: [0, 1, 0],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                  duration: 2,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mouse Glow Effect */}
      <motion.div
        className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${
            theme === 'dark' 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'rgba(99, 102, 241, 0.1)'
          } 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          x: mousePosition.x - 192,
          y: mousePosition.y - 192,
        }}
        transition={{
          type: "spring",
          stiffness: 50,
          damping: 20,
        }}
      />

      {/* Glassmorphism Overlay Elements */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute glass rounded-full opacity-20"
            style={{
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            animate={{
              x: [0, windowDimensions.width - 300, 0],
              y: [0, windowDimensions.height - 300, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 30 + i * 10,
              repeat: Infinity,
              ease: "linear",
              delay: i * 5,
            }}
            initial={{
              x: isClient ? Math.random() * (windowDimensions.width - 300) : Math.random() * 900,
              y: isClient ? Math.random() * (windowDimensions.height - 300) : Math.random() * 500,
            }}
          />
        ))}
      </div>

      {/* Ambient Light Rays */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute opacity-10"
            style={{
              width: '2px',
              height: '100vh',
              background: `linear-gradient(to bottom, transparent, ${
                theme === 'dark' ? '#3b82f6' : '#6366f1'
              }, transparent)`,
              left: `${20 + i * 25}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VisualEffects;
