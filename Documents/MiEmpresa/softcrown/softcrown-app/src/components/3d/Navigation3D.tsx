'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, RoundedBox, Sphere, Torus, Box, Cone, Cylinder, Float } from '@react-three/drei';
import { Group, Mesh } from 'three';
import { NavigationItem } from '@/types';
import * as THREE from 'three';

interface Navigation3DProps {
  items: NavigationItem[];
  onItemClick: (href: string) => void;
  activeItem?: string;
  isVisible?: boolean;
}

// Floating geometry types for each navigation item
const geometryTypes = ['sphere', 'torus', 'box', 'cone', 'cylinder', 'octahedron'] as const;
type GeometryType = typeof geometryTypes[number];

const Navigation3D: React.FC<Navigation3DProps> = ({
  items,
  onItemClick,
  activeItem,
  isVisible = true,
}) => {
  const groupRef = useRef<Group>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { size } = useThree();
  
  // Dynamic positioning based on screen size
  const radius = useMemo(() => {
    const baseRadius = 4;
    const scaleFactor = Math.min(size.width / 1920, size.height / 1080);
    return baseRadius * Math.max(0.5, scaleFactor);
  }, [size]);
  
  const angleStep = (Math.PI * 2) / items.length;
  
  // Assign geometry types to items
  const itemsWithGeometry = useMemo(() => 
    items.map((item, index) => ({
      ...item,
      geometry: geometryTypes[index % geometryTypes.length],
      color: [
        '#3b82f6', // blue
        '#d946ef', // purple
        '#06b6d4', // cyan
        '#f59e0b', // amber
        '#10b981', // emerald
        '#ef4444', // red
      ][index % 6],
    })), [items]
  );

  useFrame((state) => {
    if (groupRef.current && isVisible) {
      // Gentle rotation animation
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
      
      // Floating animation for the entire group
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      
      // Dynamic camera interaction
      if (hoveredItem) {
        const targetRotation = state.clock.elapsedTime * 0.1;
        groupRef.current.rotation.z = THREE.MathUtils.lerp(
          groupRef.current.rotation.z,
          Math.sin(targetRotation) * 0.1,
          0.05
        );
      }
    }
  });

  // Component for rendering different geometry types
  const GeometryComponent: React.FC<{ type: GeometryType; isActive: boolean; isHovered: boolean; color: string }> = ({ type, isActive, isHovered, color }) => {
    const scale = isHovered ? 1.2 : isActive ? 1.1 : 1;
    const emissiveIntensity = isActive ? 0.3 : isHovered ? 0.2 : 0.1;
    
    const materialProps = {
      color,
      metalness: 0.4,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity,
      transparent: true,
      opacity: isHovered ? 0.9 : 0.8,
    };

    switch (type) {
      case 'sphere':
        return (
          <Sphere args={[0.5]} scale={scale}>
            <meshStandardMaterial {...materialProps} />
          </Sphere>
        );
      case 'torus':
        return (
          <Torus args={[0.5, 0.2, 16, 32]} scale={scale}>
            <meshStandardMaterial {...materialProps} />
          </Torus>
        );
      case 'box':
        return (
          <Box args={[0.8, 0.8, 0.8]} scale={scale}>
            <meshStandardMaterial {...materialProps} />
          </Box>
        );
      case 'cone':
        return (
          <Cone args={[0.5, 1, 8]} scale={scale}>
            <meshStandardMaterial {...materialProps} />
          </Cone>
        );
      case 'cylinder':
        return (
          <Cylinder args={[0.5, 0.5, 1, 8]} scale={scale}>
            <meshStandardMaterial {...materialProps} />
          </Cylinder>
        );
      case 'octahedron':
        return (
          <mesh scale={scale}>
            <octahedronGeometry args={[0.6]} />
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      default:
        return null;
    }
  };

  return (
    <group
      ref={groupRef}
      scale={isVisible ? 1 : 0.8}
    >
      {itemsWithGeometry.map((item, index) => {
        const angle = index * angleStep;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = Math.sin(index + Date.now() * 0.001) * 0.3; // Individual floating animation
        const isActive = activeItem === item.href;
        const isHovered = hoveredItem === item.name;
        const isSelected = selectedItem === item.name;

        return (
          <group key={item.name} position={[x, y, z]}>
            {/* Floating geometry */}
            <Float
              speed={2}
              rotationIntensity={isHovered ? 2 : 1}
              floatIntensity={isHovered ? 2 : 1}
            >
              <group
                onPointerEnter={() => setHoveredItem(item.name)}
                onPointerLeave={() => setHoveredItem(null)}
                onClick={() => {
                  setSelectedItem(item.name);
                  onItemClick(item.href);
                }}
                onPointerDown={() => setSelectedItem(item.name)}
                onPointerUp={() => setSelectedItem(null)}
              >
                <GeometryComponent
                  type={item.geometry}
                  isActive={isActive}
                  isHovered={isHovered}
                  color={item.color}
                />
              </group>
            </Float>

            {/* Navigation item text with glassmorphism background */}
            <group position={[0, -1.2, 0]}>
              <RoundedBox
                args={[2.2, 0.6, 0.1]}
                radius={0.1}
                smoothness={4}
              >
                <meshStandardMaterial
                  color={isActive ? '#3b82f6' : '#1e293b'}
                  metalness={0.1}
                  roughness={0.8}
                  transparent
                  opacity={isHovered ? 0.9 : 0.7}
                />
              </RoundedBox>
              
              <Text
                position={[0, 0, 0.06]}
                fontSize={0.18}
                color={isActive || isHovered ? '#ffffff' : '#cbd5e1'}
                anchorX="center"
                anchorY="middle"
                font="/fonts/Inter-Medium.woff"
              >
                {item.name}
              </Text>
            </group>

            {/* Active indicator ring */}
            {isActive && (
              <group position={[0, 0, 0]}>
                <Torus args={[1.2, 0.05, 8, 32]}>
                  <meshStandardMaterial
                    color="#3b82f6"
                    emissive="#3b82f6"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.8}
                  />
                </Torus>
              </group>
            )}

            {/* Hover particles system */}
            {isHovered && (
              <group>
                {[...Array(12)].map((_, i) => {
                  const particleAngle = (i / 12) * Math.PI * 2;
                  const particleRadius = 1.5;
                  const px = Math.cos(particleAngle) * particleRadius;
                  const pz = Math.sin(particleAngle) * particleRadius;
                  
                  return (
                    <Float
                      key={i}
                      speed={4}
                      rotationIntensity={3}
                      floatIntensity={2}
                    >
                      <mesh position={[px, Math.random() * 0.5, pz]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial
                          color={item.color}
                          emissive={item.color}
                          emissiveIntensity={0.8}
                          transparent
                          opacity={0.7}
                        />
                      </mesh>
                    </Float>
                  );
                })}
              </group>
            )}

            {/* Selection pulse effect */}
            {isSelected && (
              <group>
                <Sphere args={[1.5]} scale={[1, 0.1, 1]}>
                  <meshStandardMaterial
                    color={item.color}
                    transparent
                    opacity={0.3}
                    emissive={item.color}
                    emissiveIntensity={0.2}
                  />
                </Sphere>
              </group>
            )}
          </group>
        );
      })}

      {/* Central logo/brand element */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[1.5, 1.5, 0.3]} radius={0.2} smoothness={4}>
          <meshStandardMaterial
            color="#d946ef"
            metalness={0.6}
            roughness={0.2}
            emissive="#d946ef"
            emissiveIntensity={0.1}
          />
        </RoundedBox>
        
        <Text
          position={[0, 0, 0.16]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          font="/fonts/Poppins-Bold.woff"
        >
          SC
        </Text>
      </group>
    </group>
  );
};

export default Navigation3D;
