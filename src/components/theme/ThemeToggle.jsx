import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        width: 40,
        height: 40,
        borderRadius: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.65)'}`,
        boxShadow: `inset 0 1px 0 0 rgba(255,255,255,${isDark ? '0.06' : '0.70'})`,
        transition: 'all 0.3s ease',
        outline: 'none',
      }}
    >
      <motion.div
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0.5, rotate: -30, opacity: 0 }}
        animate={{ scale: 1,   rotate: 0,   opacity: 1 }}
        exit={{    scale: 0.5, rotate: 30,  opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {isDark ? (
          <Moon style={{ width: 17, height: 17, color: '#94a3b8' }} />
        ) : (
          <Sun style={{ width: 17, height: 17, color: '#475569' }} />
        )}
      </motion.div>
    </button>
  );
}