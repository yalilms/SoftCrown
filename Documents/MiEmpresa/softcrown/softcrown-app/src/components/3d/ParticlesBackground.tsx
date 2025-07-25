'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import { Group } from 'three';
import * as THREE from 'three';

interface ParticlesBackgroundProps {
  count?: number;
  speed?: number;
  size?: number;
  color?: string;
  opacity?: number;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  count = 2000,
  speed = 0.5,
  size = 0.02,
  color = '#3b82f6',
  opacity = 0.6,
}) => {
  const pointsRef = useRef<Group>(null);
  
  // Generate random particle positions
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Create particles in a sphere around the scene
      const radius = Math.random() * 50 + 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    
    return positions;
  }, [count]);
  
  // Generate random particle velocities
  const velocities = useMemo(() => {
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      velocities[i * 3] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
    }
    
    return velocities;
  }, [count, speed]);
  
  // Animate particles
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        // Update positions based on velocities
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];
        
        // Wrap particles around the scene boundaries
        if (Math.abs(positions[i * 3]) > 60) {
          positions[i * 3] = -positions[i * 3];
        }
        if (Math.abs(positions[i * 3 + 1]) > 60) {
          positions[i * 3 + 1] = -positions[i * 3 + 1];
        }
        if (Math.abs(positions[i * 3 + 2]) > 60) {
          positions[i * 3 + 2] = -positions[i * 3 + 2];
        }
        
        // Add subtle wave motion
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.01) * 0.01;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle rotation of the entire particle system
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  
  return (
    <group>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={opacity}
          blending={THREE.AdditiveBlending}
        />
      </Points>
      
      {/* Additional floating orbs for depth */}
      {[...Array(20)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
          ]}
        >
          <sphereGeometry args={[0.1 + Math.random() * 0.2, 16, 16]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.1 + Math.random() * 0.2}
            emissive={color}
            emissiveIntensity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

export default ParticlesBackground;
