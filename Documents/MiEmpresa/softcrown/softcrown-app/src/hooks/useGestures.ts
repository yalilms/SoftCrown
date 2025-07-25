'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface GestureState {
  isActive: boolean;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  deltaPosition: { x: number; y: number };
  velocity: { x: number; y: number };
  direction: 'left' | 'right' | 'up' | 'down' | null;
  distance: number;
  duration: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface PinchGesture {
  scale: number;
  center: { x: number; y: number };
  distance: number;
}

interface UseGesturesOptions {
  swipeThreshold?: number;
  velocityThreshold?: number;
  pinchThreshold?: number;
  enableSwipe?: boolean;
  enablePinch?: boolean;
  enableLongPress?: boolean;
  longPressDuration?: number;
}

interface UseGesturesReturn {
  gestureState: GestureState;
  bind: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
  };
  onSwipe: (callback: (gesture: SwipeGesture) => void) => void;
  onPinch: (callback: (gesture: PinchGesture) => void) => void;
  onLongPress: (callback: () => void) => void;
  onTap: (callback: () => void) => void;
}

export const useGestures = (
  options: UseGesturesOptions = {}
): UseGesturesReturn => {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.5,
    pinchThreshold = 0.1,
    enableSwipe = true,
    enablePinch = true,
    enableLongPress = true,
    longPressDuration = 500,
  } = options;

  const [gestureState, setGestureState] = useState<GestureState>({
    isActive: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
    deltaPosition: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    direction: null,
    distance: 0,
    duration: 0,
  });

  const startTimeRef = useRef<number>(0);
  const lastPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTimeRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTouchesRef = useRef<TouchList | null>(null);

  // Callback refs
  const swipeCallbackRef = useRef<((gesture: SwipeGesture) => void) | null>(null);
  const pinchCallbackRef = useRef<((gesture: PinchGesture) => void) | null>(null);
  const longPressCallbackRef = useRef<(() => void) | null>(null);
  const tapCallbackRef = useRef<(() => void) | null>(null);

  const getPosition = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      return {
        x: e.touches[0]?.clientX || 0,
        y: e.touches[0]?.clientY || 0,
      };
    }
    return { x: e.clientX, y: e.clientY };
  }, []);

  const calculateDistance = useCallback((pos1: { x: number; y: number }, pos2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
  }, []);

  const getDirection = useCallback((delta: { x: number; y: number }): 'left' | 'right' | 'up' | 'down' | null => {
    const absX = Math.abs(delta.x);
    const absY = Math.abs(delta.y);

    if (absX < swipeThreshold && absY < swipeThreshold) return null;

    if (absX > absY) {
      return delta.x > 0 ? 'right' : 'left';
    } else {
      return delta.y > 0 ? 'down' : 'up';
    }
  }, [swipeThreshold]);

  const handleStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    const position = getPosition(e);
    const now = Date.now();

    startTimeRef.current = now;
    lastPositionRef.current = position;
    lastTimeRef.current = now;

    if ('touches' in e) {
      initialTouchesRef.current = e.touches;
    }

    setGestureState({
      isActive: true,
      startPosition: position,
      currentPosition: position,
      deltaPosition: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      direction: null,
      distance: 0,
      duration: 0,
    });

    // Start long press timer
    if (enableLongPress && longPressCallbackRef.current) {
      longPressTimerRef.current = setTimeout(() => {
        longPressCallbackRef.current?.();
      }, longPressDuration);
    }
  }, [getPosition, enableLongPress, longPressDuration]);

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!gestureState.isActive) return;

    const position = getPosition(e);
    const now = Date.now();
    const timeDelta = now - lastTimeRef.current;

    if (timeDelta === 0) return;

    const deltaPosition = {
      x: position.x - gestureState.startPosition.x,
      y: position.y - gestureState.startPosition.y,
    };

    const velocity = {
      x: (position.x - lastPositionRef.current.x) / timeDelta,
      y: (position.y - lastPositionRef.current.y) / timeDelta,
    };

    const distance = calculateDistance(gestureState.startPosition, position);
    const direction = getDirection(deltaPosition);
    const duration = now - startTimeRef.current;

    setGestureState(prev => ({
      ...prev,
      currentPosition: position,
      deltaPosition,
      velocity,
      direction,
      distance,
      duration,
    }));

    lastPositionRef.current = position;
    lastTimeRef.current = now;

    // Cancel long press if moved too much
    if (distance > 10 && longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle pinch gesture for touch events
    if ('touches' in e && e.touches.length === 2 && enablePinch && pinchCallbackRef.current) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = calculateDistance(
        { x: touch1.clientX, y: touch1.clientY },
        { x: touch2.clientX, y: touch2.clientY }
      );

      if (initialTouchesRef.current && initialTouchesRef.current.length === 2) {
        const initialTouch1 = initialTouchesRef.current[0];
        const initialTouch2 = initialTouchesRef.current[1];
        const initialDistance = calculateDistance(
          { x: initialTouch1.clientX, y: initialTouch1.clientY },
          { x: initialTouch2.clientX, y: initialTouch2.clientY }
        );

        const scale = currentDistance / initialDistance;
        const center = {
          x: (touch1.clientX + touch2.clientX) / 2,
          y: (touch1.clientY + touch2.clientY) / 2,
        };

        if (Math.abs(scale - 1) > pinchThreshold) {
          pinchCallbackRef.current({
            scale,
            center,
            distance: currentDistance,
          });
        }
      }
    }
  }, [gestureState, getPosition, calculateDistance, getDirection, enablePinch, pinchThreshold]);

  const handleEnd = useCallback(() => {
    if (!gestureState.isActive) return;

    const { deltaPosition, velocity, distance, duration, direction } = gestureState;

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Handle swipe gesture
    if (enableSwipe && swipeCallbackRef.current && direction) {
      const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      
      if (distance > swipeThreshold || velocityMagnitude > velocityThreshold) {
        swipeCallbackRef.current({
          direction,
          distance,
          velocity: velocityMagnitude,
          duration,
        });
      }
    }

    // Handle tap gesture
    if (tapCallbackRef.current && distance < 10 && duration < 300) {
      tapCallbackRef.current();
    }

    setGestureState(prev => ({
      ...prev,
      isActive: false,
    }));

    initialTouchesRef.current = null;
  }, [gestureState, enableSwipe, swipeThreshold, velocityThreshold]);

  // Event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleStart(e);
  }, [handleStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleMove(e);
  }, [handleMove]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    handleEnd();
  }, [handleEnd]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    handleStart(e);
  }, [handleStart]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleMove(e);
  }, [handleMove]);

  const handleMouseUp = useCallback(() => {
    handleEnd();
  }, [handleEnd]);

  // Callback setters
  const onSwipe = useCallback((callback: (gesture: SwipeGesture) => void) => {
    swipeCallbackRef.current = callback;
  }, []);

  const onPinch = useCallback((callback: (gesture: PinchGesture) => void) => {
    pinchCallbackRef.current = callback;
  }, []);

  const onLongPress = useCallback((callback: () => void) => {
    longPressCallbackRef.current = callback;
  }, []);

  const onTap = useCallback((callback: () => void) => {
    tapCallbackRef.current = callback;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  return {
    gestureState,
    bind: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
    onSwipe,
    onPinch,
    onLongPress,
    onTap,
  };
};

// Hook for carousel gestures
export const useCarouselGestures = (
  itemCount: number,
  onNext: () => void,
  onPrevious: () => void
) => {
  const { bind, onSwipe } = useGestures({
    swipeThreshold: 50,
    velocityThreshold: 0.3,
  });

  onSwipe((gesture) => {
    if (gesture.direction === 'left') {
      onNext();
    } else if (gesture.direction === 'right') {
      onPrevious();
    }
  });

  return bind;
};
