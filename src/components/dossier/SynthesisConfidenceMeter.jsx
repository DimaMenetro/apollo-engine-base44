import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';

/**
 * SynthesisConfidenceMeter — compact visual showing the synthesis
 * confidence score and methodology note.
 */
export default function SynthesisConfidenceMeter({ confidence, methodologyNote }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const color = confidence >= 80 ? '#10b981'
    : confidence >= 60 ? '#f59e0b'
    : '#f43f5e';

  const barWidth = Math.max(4, Math.min(100, confidence));

  return (
    <div style={{
      padding: '16px 20px', borderRadius: 14,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.label }}>
          Synthesis Confidence
        </span>
        <span style={{ fontSize: 18, fontWeight: 300, fontFamily: 'monospace', color }}>
          {confidence}%
        </span>
      </div>

      {/* Bar */}
      <div style={{
        height: 4, borderRadius: 2, width: '100%',
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 2, width: `${barWidth}%`,
          background: color,
          boxShadow: `0 0 8px ${color}40`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {methodologyNote && (
        <p style={{ fontSize: 11, color: t.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
          {methodologyNote}
        </p>
      )}
    </div>
  );
}