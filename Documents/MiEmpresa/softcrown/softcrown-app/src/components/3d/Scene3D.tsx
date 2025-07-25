'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';

interface Scene3DProps {
  children: React.ReactNode;
  className?: string;
  enableControls?: boolean;
  cameraPosition?: [number, number, number];
  ambientLightIntensity?: number;
}

const Scene3D: React.FC<Scene3DProps> = ({
  children,
  className = '',
  enableControls = true,
  cameraPosition = [0, 0, 5],
  ambientLightIntensity = 0.5,
}) => {
  return (
    <motion.div
      className={`w-full h-full ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <PerspectiveCamera
          makeDefault
          position={cameraPosition}
          fov={75}
          near={0.1}
          far={1000}
        />
        
        {/* Lighting */}
        <ambientLight intensity={ambientLightIntensity} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        {/* Environment */}
        <Environment preset="city" />
        
        {/* Controls */}
        {enableControls && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={10}
          />
        )}
        
        {/* Scene content */}
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </motion.div>
  );
};

export default Scene3D;
