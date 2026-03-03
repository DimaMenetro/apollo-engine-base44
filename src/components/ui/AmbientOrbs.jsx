import React from 'react';
import { motion } from 'framer-motion';

/**
 * AmbientOrbs — drifting background color blobs that give the glass surfaces
 * something vibrant to refract. Without these, glass looks flat.
 *
 * Props:
 *   t  — theme token object from LiquidGlass (light or dark)
 */
export default function AmbientOrbs({ t }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {/* Orb 1 — top-left, amber (Apollo primary accent) */}
      <motion.div
        animate={{ x: [0, 120, 0], y: [0, -60, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: -120,
          left: -140,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: t.orb1,
          filter: 'blur(24px)',
        }}
      />

      {/* Orb 2 — bottom-right, violet */}
      <motion.div
        animate={{ x: [0, -90, 0], y: [0, 80, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: t.orb2,
          filter: 'blur(24px)',
        }}
      />

      {/* Orb 3 — center, cyan (Apollo third accent) */}
      <motion.div
        animate={{ x: [0, 70, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          top: '40%',
          left: '30%',
          width: 320,
          height: 320,
          borderRadius: '50%',
          background: t.orb3,
          opacity: 0.55,
          filter: 'blur(32px)',
        }}
      />
    </div>
  );
}