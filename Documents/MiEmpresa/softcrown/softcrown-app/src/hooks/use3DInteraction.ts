'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSpring, SpringValue } from 'framer-motion';

interface Mouse3DPosition {
  x: number;
  y: number;
  normalizedX: number;
  normalizedY: number;
}

interface Transform3D {
  rotateX: SpringValue<number>;
  rotateY: SpringValue<number>;
  scale: SpringValue<number>;
  z: SpringValue<number>;
}

interface Use3DInteractionOptions {
  maxRotation?: number;
  scaleFactor?: number;
  springConfig?: {
    stiffness: number;
    damping: number;
    mass: number;
  };
  enableZ?: boolean;
  resetOnLeave?: boolean;
}

interface Use3DInteractionReturn {
  ref: React.RefObject<HTMLElement>;
  transform: Transform3D;
  mousePosition: Mouse3DPosition;
  isHovered: boolean;
  isPressed: boolean;
  bind: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseDown: () => void;
    onMouseUp: () => void;
  };
}

export const use3DInteraction = (
  options: Use3DInteractionOptions = {}
): Use3DInteractionReturn => {
  const {
    maxRotation = 15,
    scaleFactor = 1.05,
    springConfig = { stiffness: 300, damping: 30, mass: 1 },
    enableZ = true,
    resetOnLeave = true,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [mousePosition, setMousePosition] = useState<Mouse3DPosition>({
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
  });

  // Spring animations for smooth 3D transforms
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);
  const scale = useSpring(1, springConfig);
  const z = useSpring(0, springConfig);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scale.set(scaleFactor);
    if (enableZ) z.set(50);
  }, [scale, scaleFactor, z, enableZ]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
    
    if (resetOnLeave) {
      rotateX.set(0);
      rotateY.set(0);
      scale.set(1);
      if (enableZ) z.set(0);
    }
  }, [rotateX, rotateY, scale, z, resetOnLeave, enableZ]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Normalize coordinates (-1 to 1)
    const normalizedX = mouseX / (rect.width / 2);
    const normalizedY = mouseY / (rect.height / 2);

    setMousePosition({
      x: mouseX,
      y: mouseY,
      normalizedX,
      normalizedY,
    });

    // Apply 3D rotation based on mouse position
    const rotationY = normalizedX * maxRotation;
    const rotationX = -normalizedY * maxRotation;

    rotateX.set(rotationX);
    rotateY.set(rotationY);
  }, [rotateX, rotateY, maxRotation]);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
    scale.set(scaleFactor * 0.95);
  }, [scale, scaleFactor]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
    scale.set(isHovered ? scaleFactor : 1);
  }, [scale, scaleFactor, isHovered]);

  return {
    ref,
    transform: {
      rotateX,
      rotateY,
      scale,
      z,
    },
    mousePosition,
    isHovered,
    isPressed,
    bind: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onMouseMove: handleMouseMove,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
    },
  };
};

// Hook for floating 3D elements
export const useFloating3D = (
  intensity: number = 1,
  speed: number = 1
) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      setTime(elapsed * speed);
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [speed]);

  const floatingTransform = {
    y: Math.sin(time) * intensity * 10,
    rotateX: Math.sin(time * 0.5) * intensity * 5,
    rotateY: Math.cos(time * 0.3) * intensity * 5,
    rotateZ: Math.sin(time * 0.7) * intensity * 2,
  };

  return floatingTransform;
};

// Hook for drag and drop 3D interactions
export const useDrag3D = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setInitialPosition({ x: clientX, y: clientY });
  }, []);

  const updateDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const deltaX = clientX - initialPosition.x;
    const deltaY = clientY - initialPosition.y;

    setDragPosition({ x: deltaX, y: deltaY });
  }, [isDragging, initialPosition]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setDragPosition({ x: 0, y: 0 });
  }, []);

  const resetPosition = useCallback(() => {
    setDragPosition({ x: 0, y: 0 });
  }, []);

  return {
    isDragging,
    dragPosition,
    bind: {
      onMouseDown: startDrag,
      onMouseMove: updateDrag,
      onMouseUp: endDrag,
      onTouchStart: startDrag,
      onTouchMove: updateDrag,
      onTouchEnd: endDrag,
    },
    resetPosition,
  };
};
