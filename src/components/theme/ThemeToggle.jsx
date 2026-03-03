import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

/**
 * ThemeToggle — compact glass icon button.
 * Inspired by Apple Liquid Glass pill controls (WWDC25 reference).
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      style={{
        position:             'relative',
        width:                76,
        height:               36,
        borderRadius:         999,
        display:              'flex',
        alignItems:           'center',
        padding:              3,
        cursor:               'pointer',
        // Glass pill container
        background:           isDark
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(255,255,255,0.38)',
        backdropFilter:       'blur(30px) saturate(180%)',
        WebkitBackdropFilter: 'blur(30px) saturate(180%)',
        border:               `1px solid ${isDark ? 'rgba(255,255,255,0.11)' : 'rgba(255,255,255,0.72)'}`,
        boxShadow:            isDark
          ? 'inset 0 1px 0 0 rgba(255,255,255,0.09), inset 0 -1px 0 0 rgba(0,0,0,0.30)'
          : 'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.04)',
        outline:              'none',
        transition:           'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}
    >
      {/* Sliding capsule indicator */}
      <motion.div
        animate={{ x: isDark ? 0 : 38 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        style={{
          position:             'absolute',
          left:                 3,
          width:                30,
          height:               28,
          borderRadius:         999,
          background:           isDark
            ? 'rgba(255,255,255,0.13)'
            : 'rgba(255,255,255,0.85)',
          backdropFilter:       'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border:               `1px solid ${isDark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.95)'}`,
          boxShadow:            isDark
            ? 'inset 0 1px 0 0 rgba(255,255,255,0.14), 0 2px 6px rgba(0,0,0,0.22)'
            : 'inset 0 1px 0 0 rgba(255,255,255,1.0), 0 2px 8px rgba(0,0,0,0.10)',
        }}
      />

      {/* Moon icon (left slot — active in dark) */}
      <div style={{
        width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, flexShrink: 0,
      }}>
        <Moon style={{
          width: 14, height: 14,
          color: isDark ? '#e2e8f0' : '#a8a29e',
          transition: 'color 0.3s ease',
        }} />
      </div>

      {/* Sun icon (right slot — active in light) */}
      <div style={{
        width: 30, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1, flexShrink: 0,
      }}>
        <Sun style={{
          width: 14, height: 14,
          color: isDark ? '#475569' : '#1c1917',
          transition: 'color 0.3s ease',
        }} />
      </div>
    </button>
  );
}