'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useDragControls, PanInfo, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/ui/Button';
import { NavigationItem } from '@/types';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const dragControls = useDragControls();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Scroll tracking for progress bar
  const handleScroll = () => {
    const scrolled = window.scrollY > 20;
    setIsScrolled(scrolled);
    
    // Calculate scroll progress
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled_percentage = (winScroll / height) * 100;
    setScrollProgress(scrolled_percentage);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch gesture handlers
  const handleDragStart = () => {
    // Optional: Add haptic feedback for mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };
  
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const progress = Math.max(0, Math.min(1, info.offset.x / 200));
    setSwipeProgress(progress);
    
    // Auto-open if dragged more than 50px to the right
    if (info.offset.x > 50 && !isMobileMenuOpen) {
      setIsMobileMenuOpen(true);
    }
  };
  
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Determine if menu should open/close based on velocity and offset
    if (velocity > 500 || offset > 100) {
      setIsMobileMenuOpen(true);
    } else if (velocity < -500 || offset < -100) {
      setIsMobileMenuOpen(false);
    } else {
      // Snap to nearest state based on current progress
      setIsMobileMenuOpen(swipeProgress > 0.5);
    }
    
    setSwipeProgress(0);
  };

  const navigationItems: NavigationItem[] = [
    { name: 'Inicio', href: '/', icon: '🏠' },
    { name: 'Servicios', href: '/servicios', icon: '⚡' },
    { name: 'Sobre Nosotros', href: '/sobre-nosotros', icon: '👥' },
    { name: 'Portfolio', href: '/portfolio', icon: '💼' },
    { name: 'Contacto', href: '/contacto', icon: '📧' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  ];

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ name: 'Inicio', href: '/' }];
    
    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const navItem = navigationItems.find(item => item.href === currentPath);
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath });
      } else {
        // Capitalize and format segment
        const name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        breadcrumbs.push({ name, href: currentPath });
      }
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);
      
      // Calculate scroll progress
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled_percentage = (winScroll / height) * 100;
      setScrollProgress(scrolled_percentage);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Touch gesture handling for mobile
  useEffect(() => {
    let startY = 0;
    let startX = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!startY || !startX) return;
      
      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const diffY = startY - currentY;
      const diffX = startX - currentX;
      
      // Horizontal swipe to toggle mobile menu
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        if (diffX > 0) {
          // Swipe left - close menu
          setIsMobileMenuOpen(false);
        } else {
          // Swipe right - open menu
          setIsMobileMenuOpen(true);
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const headerVariants = {
    top: {
      backgroundColor: 'rgba(255, 255, 255, 0)',
      backdropFilter: 'blur(0px)',
      borderColor: 'rgba(255, 255, 255, 0)',
    },
    scrolled: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(20px)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      scale: 0.95,
    },
    open: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

  return (
    <>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary z-[60] origin-left"
        style={{ scaleX }}
      />
      
      <motion.header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300',
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        )}
        variants={headerVariants}
        animate={isScrolled ? 'scrolled' : 'top'}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              className="flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SC</span>
                </div>
                <span className="font-display font-bold text-xl gradient-text">
                  SoftCrown
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <motion.div key={item.name} className="relative group">
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 relative z-10',
                        isActive
                          ? 'text-primary'
                          : 'text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary'
                      )}
                    >
                      <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-md"
                        layoutId="activeNavItem"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Hover glow effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"
                      initial={{ scale: 0.8 }}
                      whileHover={{ scale: 1 }}
                    />
                    
                    {/* Micro-interaction particles */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          className="absolute -top-1 left-1/2 transform -translate-x-1/2"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                        >
                          <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-9 h-9"
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {theme === 'light' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </motion.div>
              </Button>

              {/* CTA Button */}
              <Button variant="gradient" size="sm" className="hidden sm:inline-flex">
                Empezar Proyecto
              </Button>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden w-9 h-9"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <motion.div
                  animate={{ rotate: isMobileMenuOpen ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                    />
                  </svg>
                </motion.div>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Animated Breadcrumbs */}
        {breadcrumbs.length > 1 && (
          <motion.div
            className="border-t border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-sm"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <motion.div
                    key={crumb.href}
                    className="flex items-center space-x-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {index > 0 && (
                      <motion.svg
                        className="w-4 h-4 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </motion.svg>
                    )}
                    <Link
                      href={crumb.href}
                      className={cn(
                        'transition-colors duration-200 hover:text-primary',
                        index === breadcrumbs.length - 1
                          ? 'text-primary font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      )}
                    >
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {crumb.name}
                      </motion.span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}

        {/* Mobile Navigation with Swipe Gestures */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ duration: 0.2 }}
              drag="x"
              dragControls={dragControls}
              dragConstraints={{ left: -300, right: 0 }}
              dragElastic={0.1}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
            >
              <div className="px-4 py-6 space-y-4">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.name}
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={item.href}
                        className={cn(
                          'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                          isActive
                            ? 'text-primary bg-primary/10'
                            : 'text-gray-600 hover:text-primary hover:bg-gray-50 dark:text-gray-300 dark:hover:text-primary dark:hover:bg-gray-800'
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button variant="gradient" className="w-full">
                    Empezar Proyecto
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <div className="h-16" />
    </>
  );
};

export default Header;
