import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';

/**
 * FidelityMeter — authoritative signal-bar indicator showing data completeness.
 * FULL = 4 bars, REDUCED-FIDELITY = 2 bars, HALTED = 0 bars (red).
 * Replaces the old plain-text fidelity line with a visual quality meter.
 */

const LEVELS = {
  'FULL':              { bars: 4, color: '#10b981', label: 'Full Fidelity' },
  'REDUCED-FIDELITY':  { bars: 2, color: '#f59e0b', label: 'Reduced Fidelity' },
  'HALTED':            { bars: 0, color: '#f43f5e', label: 'Halted' },
};

export default function FidelityMeter({ fidelity, executionStatus, dateExecuted }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const level = LEVELS[fidelity] || LEVELS['HALTED'];
  const isCompliant = executionStatus === 'COMPLIANT';
  const statusColor = isCompliant ? '#10b981' : '#f43f5e';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      padding: '14px 20px',
      borderRadius: 14,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Signal bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            style={{
              width: 5,
              height: 6 + i * 4,
              borderRadius: 2,
              background: i <= level.bars ? level.color : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Fidelity label */}
      <div>
        <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: level.color }}>
          {level.label}
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

      {/* Execution status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%', background: statusColor,
          boxShadow: `0 0 8px ${statusColor}40`,
        }} />
        <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 600, color: statusColor }}>
          {executionStatus || 'UNKNOWN'}
        </span>
      </div>

      {/* Date — pushed right */}
      {dateExecuted && (
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: t.muted, marginLeft: 'auto' }}>
          {dateExecuted}
        </span>
      )}
    </div>
  );
}