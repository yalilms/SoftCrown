'use client';

import { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface ScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
}

interface ScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  isInView: boolean;
  progress: number;
  hasTriggered: boolean;
}

export const useScrollAnimation = (
  options: ScrollAnimationOptions = {}
): ScrollAnimationReturn => {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { 
    amount: threshold,
    margin: rootMargin,
    once: triggerOnce 
  });
  const [progress, setProgress] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (isInView && !hasTriggered) {
      const timer = setTimeout(() => {
        setHasTriggered(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, hasTriggered, delay]);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;

      const element = ref.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on element position
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      if (elementTop <= windowHeight && elementTop + elementHeight >= 0) {
        const visibleHeight = Math.min(elementHeight, windowHeight - Math.max(elementTop, 0));
        const scrollProgress = Math.min(1, Math.max(0, visibleHeight / elementHeight));
        setProgress(scrollProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    ref,
    isInView,
    progress,
    hasTriggered,
  };
};

// Hook for staggered animations
export const useStaggeredAnimation = (
  itemCount: number,
  baseDelay: number = 0.1
) => {
  const [triggeredItems, setTriggeredItems] = useState<boolean[]>(
    new Array(itemCount).fill(false)
  );

  const triggerItem = (index: number) => {
    setTriggeredItems(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const triggerAll = () => {
    triggeredItems.forEach((_, index) => {
      setTimeout(() => {
        triggerItem(index);
      }, index * baseDelay * 1000);
    });
  };

  const reset = () => {
    setTriggeredItems(new Array(itemCount).fill(false));
  };

  return {
    triggeredItems,
    triggerItem,
    triggerAll,
    reset,
  };
};

// Hook for scroll-based counter animation
export const useCounterAnimation = (
  endValue: number,
  duration: number = 2000,
  startOnView: boolean = true
) => {
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { ref, isInView } = useScrollAnimation({ threshold: 0.3 });

  useEffect(() => {
    if ((startOnView && isInView) || (!startOnView && isActive)) {
      let startTime: number;
      let animationFrame: number;

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = Math.floor(easeOutQuart * endValue);
        
        setCount(currentCount);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      };
    }
  }, [endValue, duration, isInView, startOnView, isActive]);

  return {
    ref,
    count,
    isInView,
    start: () => setIsActive(true),
    reset: () => {
      setCount(0);
      setIsActive(false);
    },
  };
};
