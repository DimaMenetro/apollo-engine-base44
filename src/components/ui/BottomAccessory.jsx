import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, CheckCircle2, AlertCircle, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { glassAccessory } from './LiquidGlass';
import { useAccessory } from './AccessoryContext';
import { createPageUrl } from '../../utils';

/**
 * BottomAccessory — context-aware floating bar that sits directly above the tab bar.
 * Reads from AccessoryContext. Shows processing status, completion, or errors.
 *
 * Props:
 *   t — theme token object from LiquidGlass
 */
export default function BottomAccessory({ t }) {
  const { status, moduleTitle, progress, subjectId, subjectName } = useAccessory();

  const isVisible = status !== 'idle';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{    opacity: 0, y: 20, scale: 0.92 }}
          animate={{    opacity: 1, y: 0,  scale: 1    }}
          exit={{       opacity: 0, y: 20, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          style={{
            ...glassAccessory(t),
            display:        'flex',
            alignItems:     'center',
            gap:            10,
            padding:        '9px 16px',
            maxWidth:       440,
            width:          '100%',
          }}
        >
          {/* Status icon */}
          {status === 'running' && (
            <Loader2
              style={{ width: 15, height: 15, color: t.accent, flexShrink: 0 }}
              className="animate-spin"
            />
          )}
          {status === 'completed' && (
            <CheckCircle2
              style={{ width: 15, height: 15, color: '#4ade80', flexShrink: 0 }}
            />
          )}
          {status === 'failed' && (
            <AlertCircle
              style={{ width: 15, height: 15, color: '#f87171', flexShrink: 0 }}
            />
          )}

          {/* Text content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {status === 'running' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: t.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {moduleTitle || 'Initializing…'}
                </span>
                {progress > 0 && (
                  <span style={{ fontSize: 11, color: t.accent, flexShrink: 0 }}>
                    {Math.round(progress)}%
                  </span>
                )}
              </div>
            )}
            {status === 'running' && subjectName && (
              <div style={{ fontSize: 10, color: t.muted, marginTop: 1 }}>
                {subjectName}
              </div>
            )}
            {status === 'completed' && (
              <span style={{ fontSize: 12, fontWeight: 500, color: t.text }}>
                Analysis complete
              </span>
            )}
            {status === 'failed' && (
              <span style={{ fontSize: 12, fontWeight: 500, color: '#f87171' }}>
                Analysis failed
              </span>
            )}
          </div>

          {/* Progress bar (running only) */}
          {status === 'running' && progress > 0 && (
            <div
              style={{
                width: 48,
                height: 4,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                style={{
                  height: '100%',
                  background: t.accent,
                  borderRadius: 999,
                }}
              />
            </div>
          )}

          {/* Navigation link */}
          {status === 'completed' && subjectId && (
            <Link
              to={createPageUrl(`SubjectReview?id=${subjectId}`)}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        2,
                fontSize:   11,
                fontWeight: 600,
                color:      t.accent,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              Review <ChevronRight style={{ width: 12, height: 12 }} />
            </Link>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}