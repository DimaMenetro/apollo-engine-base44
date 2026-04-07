import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { Star } from 'lucide-react';

/**
 * ValidationDashboard — replaces the flat checklist with horizontal gauge bars
 * per criterion plus a compliance arc at top. One visual sweep shows integrity.
 */

const CRITERIA = [
  { key: 'astrology_governed_timing',     label: 'Astrology Governed Timing',     shortLabel: 'Timing' },
  { key: 'numerology_governed_structure',  label: 'Numerology Governed Structure', shortLabel: 'Structure' },
  { key: 'emotional_depth_prioritized',    label: 'Emotional Depth Prioritized',   shortLabel: 'Depth' },
  { key: 'practical_translation_achieved', label: 'Practical Translation Achieved', shortLabel: 'Translation' },
  { key: 'generic_horoscope_drift_avoided',label: 'Generic Drift Avoided',         shortLabel: 'Specificity' },
];

export default function ValidationDashboard({ validation }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!validation) return null;

  const isCompliant = validation.execution_status === 'COMPLIANT';
  const passCount = CRITERIA.filter(c => validation[c.key]).length;
  const total = CRITERIA.length;
  const pct = Math.round((passCount / total) * 100);

  const arcColor = isCompliant ? '#10b981' : '#f43f5e';

  // SVG arc for compliance score
  const radius = 32;
  const circumference = Math.PI * radius; // semi-circle
  const arcLength = (pct / 100) * circumference;

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 16,
      background: isCompliant ? 'rgba(16,185,129,0.04)' : 'rgba(244,63,94,0.04)',
      border: `1px solid ${isCompliant ? 'rgba(16,185,129,0.20)' : 'rgba(244,63,94,0.20)'}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Star style={{ width: 13, height: 13, color: arcColor }} />
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: arcColor }}>
          SME Validation Dashboard
        </span>
        <span style={{
          fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
          padding: '2px 8px', borderRadius: 999, marginLeft: 'auto',
          background: `${arcColor}15`, color: arcColor, border: `1px solid ${arcColor}30`,
        }}>
          {validation.execution_status || 'UNKNOWN'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 18 }}>
        {/* Compliance arc */}
        <div style={{ position: 'relative', width: 72, height: 44, flexShrink: 0 }}>
          <svg width="72" height="44" viewBox="0 0 72 44">
            {/* Track */}
            <path
              d={`M 4 40 A ${radius} ${radius} 0 0 1 68 40`}
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Fill */}
            <path
              d={`M 4 40 A ${radius} ${radius} 0 0 1 68 40`}
              fill="none"
              stroke={arcColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${arcColor}40)` }}
            />
          </svg>
          <div style={{
            position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
            fontSize: 14, fontWeight: 700, fontFamily: 'monospace', color: arcColor,
          }}>
            {passCount}/{total}
          </div>
        </div>

        {/* Criteria bars */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {CRITERIA.map(c => {
            const passed = validation[c.key];
            return (
              <div key={c.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 9, color: t.muted, minWidth: 70, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {c.shortLabel}
                </span>
                {/* Bar track */}
                <div style={{
                  flex: 1, height: 6, borderRadius: 999,
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: passed ? '100%' : '0%',
                    borderRadius: 999,
                    background: passed ? arcColor : 'transparent',
                    transition: 'width 0.5s ease',
                    boxShadow: passed ? `0 0 6px ${arcColor}40` : 'none',
                  }} />
                </div>
                <span style={{
                  fontSize: 9, fontFamily: 'monospace', fontWeight: 600,
                  color: passed ? arcColor : '#f43f5e',
                  minWidth: 28,
                }}>
                  {passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}