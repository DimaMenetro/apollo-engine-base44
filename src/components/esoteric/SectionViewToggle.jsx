import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { Eye, BarChart3 } from 'lucide-react';

/**
 * SectionViewToggle — small pill toggle for switching between
 * narrative text view and data visualization for a single section.
 */
export default function SectionViewToggle({ mode, onToggle }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const isVisual = mode === 'visual';

  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const activeBg = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.10)';

  const btnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: 4,
    padding: '3px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
    fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: active ? activeBg : 'transparent',
    color: active ? t.title : t.muted,
    transition: 'all 0.2s ease',
  });

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 2,
      padding: 2, borderRadius: 999, background: pillBg,
    }}>
      <button style={btnStyle(!isVisual)} onClick={() => onToggle('text')}>
        <Eye style={{ width: 10, height: 10 }} />
        Text
      </button>
      <button style={btnStyle(isVisual)} onClick={() => onToggle('visual')}>
        <BarChart3 style={{ width: 10, height: 10 }} />
        Visual
      </button>
    </div>
  );
}