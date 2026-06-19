import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';

// Small accessible expand/collapse primitive used across DSP summary-first cards.
// Renders a header (always visible) and collapsible children. Respects reduced motion.
export default function Collapsible({
  header,
  children,
  defaultOpen = false,
  accent,
  t,
  isDark,
  toggleLabel = 'Toggle details',
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const btnId = useId();

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>{header}</div>
        <button
          id={btnId}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={toggleLabel}
          onClick={() => setOpen((v) => !v)}
          style={{
            flexShrink: 0,
            width: 30,
            height: 30,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`,
            color: accent || t.muted,
          }}
        >
          <ChevronDown
            style={{
              width: 16,
              height: 16,
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: prefersReduced ? 'none' : 'transform 0.25s ease',
            }}
          />
        </button>
      </div>
      {open && (
        <div id={panelId} role="region" aria-labelledby={btnId} style={{ marginTop: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}