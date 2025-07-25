'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { motion } from 'framer-motion-3d';

interface FloatingGeometryProps {
  geometry: 'box' | 'sphere' | 'torus' | 'cone' | 'cylinder';
  position?: [number, number, number];
  color?: string;
  size?: number;
  rotationSpeed?: number;
  floatSpeed?: number;
  floatRange?: number;
}

const FloatingGeometry: React.FC<FloatingGeometryProps> = ({
  geometry = 'box',
  position = [0, 0, 0],
  color = '#3b82f6',
  size = 1,
  rotationSpeed = 0.01,
  floatSpeed = 0.02,
  floatRange = 0.5,
}) => {
  const meshRef = useRef<Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      // Rotation animation
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed * 0.7;
      
      // Floating animation
      meshRef.current.position.y = 
        initialY + Math.sin(state.clock.elapsedTime * floatSpeed) * floatRange;
    }
  });

  const renderGeometry = () => {
    const commonProps = {
      ref: meshRef,
      position,
      castShadow: true,
      receiveShadow: true,
    };

    switch (geometry) {
      case 'sphere':
        return (
          <mesh {...commonProps}>
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
        );
      case 'torus':
        return (
          <mesh {...commonProps}>
            <torusGeometry args={[size, size * 0.4, 16, 100]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
        );
      case 'cone':
        return (
          <mesh {...commonProps}>
            <coneGeometry args={[size, size * 2, 8]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
        );
      case 'cylinder':
        return (
          <mesh {...commonProps}>
            <cylinderGeometry args={[size, size, size * 2, 8]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
        );
      default: // box
        return (
          <mesh {...commonProps}>
            <boxGeometry args={[size, size, size]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.4} />
          </mesh>
        );
    }
  };

  return renderGeometry();
};

export default FloatingGeometry;
