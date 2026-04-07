import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';

/**
 * ThresholdPhaseArc — horizontal arc gauge showing the subject's current
 * phase position: rupture → reintegration → plateau → threshold transit.
 * Parses the threshold_assessment text to determine which phase is active.
 */

const PHASES = [
  { key: 'rupture',        label: 'Rupture',          color: '#f43f5e', icon: '◇' },
  { key: 'reintegration',  label: 'Reintegration',    color: '#f59e0b', icon: '◈' },
  { key: 'plateau',        label: 'Plateau',          color: '#06b6d4', icon: '◆' },
  { key: 'threshold',      label: 'Threshold Transit', color: '#8b5cf6', icon: '◉' },
];

function detectPhase(text) {
  if (!text) return -1;
  const lower = text.toLowerCase();
  // Priority order: most specific match first
  if (lower.includes('threshold transit') || lower.includes('threshold')) return 3;
  if (lower.includes('plateau'))         return 2;
  if (lower.includes('reintegrat'))      return 1;
  if (lower.includes('rupture'))         return 0;
  // Fallback heuristics
  if (lower.includes('crisis') || lower.includes('disruption') || lower.includes('collapse')) return 0;
  if (lower.includes('healing') || lower.includes('rebuild') || lower.includes('recover'))    return 1;
  if (lower.includes('stable') || lower.includes('consolidat') || lower.includes('rest'))     return 2;
  if (lower.includes('transit') || lower.includes('crossing') || lower.includes('emergence')) return 3;
  return -1;
}

export default function ThresholdPhaseArc({ thresholdText }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const activeIndex = useMemo(() => detectPhase(thresholdText), [thresholdText]);

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 16,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.label, marginBottom: 16 }}>
        Current Phase Position
      </div>

      {/* Track */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 0, marginBottom: 14 }}>
        {/* Background track */}
        <div style={{
          position: 'absolute', top: '50%', left: 0, right: 0, height: 3, transform: 'translateY(-50%)',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          borderRadius: 999,
        }} />
        {/* Active fill — from left to active node */}
        {activeIndex >= 0 && (
          <div style={{
            position: 'absolute', top: '50%', left: 0, height: 3, transform: 'translateY(-50%)',
            width: `${(activeIndex / (PHASES.length - 1)) * 100}%`,
            background: `linear-gradient(90deg, ${PHASES[0].color}66, ${PHASES[activeIndex].color})`,
            borderRadius: 999,
            transition: 'width 0.6s ease',
          }} />
        )}

        {/* Phase nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', position: 'relative', zIndex: 1 }}>
          {PHASES.map((phase, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <div key={phase.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                {/* Node dot */}
                <div style={{
                  width: isActive ? 28 : 14,
                  height: isActive ? 28 : 14,
                  borderRadius: '50%',
                  background: isActive
                    ? phase.color
                    : isPast
                      ? `${phase.color}60`
                      : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)',
                  border: isActive ? `2px solid ${phase.color}` : 'none',
                  boxShadow: isActive ? `0 0 16px ${phase.color}50, 0 0 4px ${phase.color}30` : 'none',
                  transition: 'all 0.4s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {isActive && (
                    <span style={{ fontSize: 12, color: '#fff', lineHeight: 1 }}>{phase.icon}</span>
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontSize: 9,
                  fontWeight: isActive ? 700 : 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: isActive ? phase.color : isPast ? `${phase.color}99` : t.muted,
                  textAlign: 'center',
                  maxWidth: 72,
                  transition: 'color 0.3s ease',
                }}>
                  {phase.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status pill */}
      {activeIndex >= 0 && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: `${PHASES[activeIndex].color}15`,
          border: `1px solid ${PHASES[activeIndex].color}30`,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: PHASES[activeIndex].color,
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 600, color: PHASES[activeIndex].color }}>
            {PHASES[activeIndex].label.toUpperCase()} PHASE ACTIVE
          </span>
        </div>
      )}
    </div>
  );
}