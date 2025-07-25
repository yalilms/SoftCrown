'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Settings } from 'lucide-react';
import ThemeCustomizer from './ThemeCustomizer';

export default function ThemeCustomizerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative group bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Background Glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"
            animate={{ scale: isHovered ? 1.2 : 1 }}
          />
          
          {/* Icon */}
          <motion.div
            animate={{ rotate: isHovered ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            <Palette className="w-6 h-6" />
          </motion.div>

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.8 }}
                className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg"
              >
                Personalizar Tema
                <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ripple Effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: isHovered ? 2 : 0, opacity: isHovered ? 0 : 0 }}
            transition={{ duration: 0.6 }}
          />
        </motion.button>

        {/* Settings Icon Indicator */}
        <motion.div
          className="absolute -top-1 -right-1 bg-orange-500 text-white rounded-full p-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.5, type: 'spring' }}
        >
          <Settings className="w-3 h-3" />
        </motion.div>
      </motion.div>

      {/* Theme Customizer Panel */}
      <ThemeCustomizer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
