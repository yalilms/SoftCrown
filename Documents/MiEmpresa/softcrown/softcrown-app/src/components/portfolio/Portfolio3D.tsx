'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Text, Box, Sphere, Torus, Cone, Cylinder, Octahedron } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Project, Technology } from '@/types/portfolio';
import * as THREE from 'three';

interface Portfolio3DProps {
  projects: Project[];
  technologies: Technology[];
  onProjectSelect?: (project: Project) => void;
}

interface ProjectCard3DProps {
  project: Project;
  position: [number, number, number];
  index: number;
  onSelect: (project: Project) => void;
}

interface TechSphere3DProps {
  tech: Technology;
  position: [number, number, number];
  index: number;
}

const ProjectCard3D: React.FC<ProjectCard3DProps> = ({ project, position, index, onSelect }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + index) * 0.1;
      
      // Rotation animation
      meshRef.current.rotation.y += 0.005;
      
      // Hover effects
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.1, 1.1, 1.1), 0.1);
        meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
        meshRef.current.rotation.x = 0;
      }
    }
  });

  const categoryColor = project.category.color || '#3B82F6';

  return (
    <group position={position}>
      {/* Main Card */}
      <Box
        ref={meshRef}
        args={[2, 2.5, 0.1]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          setClicked(true);
          onSelect(project);
          setTimeout(() => setClicked(false), 200);
        }}
      >
        <meshStandardMaterial
          color={hovered ? categoryColor : '#ffffff'}
          metalness={0.1}
          roughness={0.2}
          transparent
          opacity={hovered ? 0.9 : 0.8}
        />
      </Box>

      {/* Project Title */}
      <Text
        position={[0, 0.8, 0.06]}
        fontSize={0.15}
        color={hovered ? '#ffffff' : '#000000'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        font="/fonts/inter-bold.woff"
      >
        {project.title}
      </Text>

      {/* Category Badge */}
      <Box
        position={[0, -0.8, 0.06]}
        args={[1.5, 0.3, 0.05]}
      >
        <meshStandardMaterial
          color={categoryColor}
          metalness={0.3}
          roughness={0.1}
        />
      </Box>

      <Text
        position={[0, -0.8, 0.08]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/inter-medium.woff"
      >
        {project.category.name}
      </Text>

      {/* Status Indicator */}
      <Sphere
        position={[0.8, 0.8, 0.06]}
        args={[0.1]}
      >
        <meshStandardMaterial
          color={project.status === 'published' ? '#10B981' : '#F59E0B'}
          emissive={project.status === 'published' ? '#10B981' : '#F59E0B'}
          emissiveIntensity={0.2}
        />
      </Sphere>

      {/* Featured Star */}
      {project.featured && (
        <group position={[0, 1.2, 0.06]}>
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              position={[
                Math.cos((i / 5) * Math.PI * 2) * 0.15,
                Math.sin((i / 5) * Math.PI * 2) * 0.15,
                0
              ]}
              args={[0.05, 0.05, 0.02]}
            >
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={0.3}
              />
            </Box>
          ))}
        </group>
      )}

      {/* Interaction Particles */}
      {hovered && (
        <group>
          {[...Array(8)].map((_, i) => (
            <Sphere
              key={i}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 1.5,
                Math.sin((i / 8) * Math.PI * 2) * 1.5,
                0
              ]}
              args={[0.02]}
            >
              <meshStandardMaterial
                color={categoryColor}
                emissive={categoryColor}
                emissiveIntensity={0.5}
                transparent
                opacity={0.7}
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  );
};

const TechSphere3D: React.FC<TechSphere3DProps> = ({ tech, position, index }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Orbital motion
      const radius = 3;
      const speed = 0.5 + index * 0.1;
      const angle = state.clock.elapsedTime * speed + index * (Math.PI * 2 / 12);
      
      meshRef.current.position.x = Math.cos(angle) * radius;
      meshRef.current.position.z = Math.sin(angle) * radius;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + index) * 0.2;
      
      // Self rotation
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.02;
      
      // Hover effects
      if (hovered) {
        meshRef.current.scale.lerp(new THREE.Vector3(1.5, 1.5, 1.5), 0.1);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  const getGeometry = (category: string) => {
    switch (category) {
      case 'frontend':
        return <Octahedron args={[0.3]} />;
      case 'backend':
        return <Box args={[0.4, 0.4, 0.4]} />;
      case 'database':
        return <Cylinder args={[0.2, 0.3, 0.5, 8]} />;
      case 'devops':
        return <Cone args={[0.3, 0.6, 6]} />;
      case 'design':
        return <Torus args={[0.3, 0.1, 8, 16]} />;
      case 'mobile':
        return <Sphere args={[0.3]} />;
      default:
        return <Box args={[0.3, 0.3, 0.3]} />;
    }
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry(tech.category)}
        <meshStandardMaterial
          color={tech.color}
          metalness={0.3}
          roughness={0.2}
          emissive={hovered ? tech.color : '#000000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Tech Label */}
      {hovered && (
        <Text
          position={[0, -0.8, 0]}
          fontSize={0.2}
          color={tech.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          {tech.name}
        </Text>
      )}

      {/* Proficiency Indicators */}
      {hovered && (
        <group position={[0, -1.2, 0]}>
          {[...Array(5)].map((_, i) => (
            <Sphere
              key={i}
              position={[(i - 2) * 0.15, 0, 0]}
              args={[0.05]}
            >
              <meshStandardMaterial
                color={i < tech.proficiency ? tech.color : '#666666'}
                emissive={i < tech.proficiency ? tech.color : '#000000'}
                emissiveIntensity={i < tech.proficiency ? 0.3 : 0}
              />
            </Sphere>
          ))}
        </group>
      )}
    </group>
  );
};

const Scene3D: React.FC<{
  projects: Project[];
  technologies: Technology[];
  onProjectSelect?: (project: Project) => void;
}> = ({ projects, technologies, onProjectSelect }) => {
  const { camera } = useThree();

  // Position projects in a grid
  const projectPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const cols = Math.ceil(Math.sqrt(projects.length));
    const spacing = 3;
    
    projects.forEach((_, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      const x = (col - cols / 2) * spacing;
      const z = (row - Math.floor(projects.length / cols) / 2) * spacing;
      positions.push([x, 0, z]);
    });
    
    return positions;
  }, [projects]);

  useFrame((state) => {
    // Camera orbit
    const time = state.clock.elapsedTime * 0.1;
    camera.position.x = Math.cos(time) * 10;
    camera.position.z = Math.sin(time) * 10;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <spotLight
        position={[0, 20, 0]}
        angle={0.3}
        penumbra={1}
        intensity={1}
        castShadow
      />

      {/* Projects */}
      {projects.map((project, index) => (
        <ProjectCard3D
          key={project.id}
          project={project}
          position={projectPositions[index]}
          index={index}
          onSelect={onProjectSelect || (() => {})}
        />
      ))}

      {/* Technologies */}
      {technologies.slice(0, 12).map((tech, index) => (
        <TechSphere3D
          key={tech.id}
          tech={tech}
          position={[0, 2, 0]}
          index={index}
        />
      ))}

      {/* Central Platform */}
      <Cylinder
        position={[0, -1, 0]}
        args={[8, 8, 0.2, 32]}
      >
        <meshStandardMaterial
          color="#1F2937"
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={0.3}
        />
      </Cylinder>

      {/* Grid Lines */}
      <gridHelper args={[20, 20, '#374151', '#374151']} position={[0, -0.9, 0]} />
    </>
  );
};

const Portfolio3D: React.FC<Portfolio3DProps> = ({ projects, technologies, onProjectSelect }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Loading Overlay */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 2, duration: 1 }}
          onAnimationComplete={() => setIsLoading(false)}
          className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10"
        >
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Cargando Portfolio 3D</h2>
            <p className="text-gray-400">Preparando la experiencia inmersiva...</p>
          </div>
        </motion.div>
      )}

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        shadows
        className="w-full h-full"
      >
        <Scene3D
          projects={projects}
          technologies={technologies}
          onProjectSelect={onProjectSelect}
        />
      </Canvas>

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 text-white">
          <h1 className="text-2xl font-bold mb-2">Portfolio 3D</h1>
          <p className="text-white/80 text-sm mb-4">
            Explora nuestros proyectos en un entorno 3D interactivo
          </p>
          <div className="space-y-2 text-xs text-white/60">
            <p>🖱️ Navega automáticamente</p>
            <p>🎯 Haz clic en los proyectos para ver detalles</p>
            <p>✨ Pasa el mouse sobre las tecnologías</p>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-6 right-6 z-10">
        <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 text-white">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-xs text-white/60">Proyectos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{technologies.length}</div>
              <div className="text-xs text-white/60">Tecnologías</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio3D;
