import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';

const colorMap = {
  amber:   { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  emerald: { text: '#10b981', bg: 'rgba(16,185,129,0.12)'  },
  violet:  { text: '#8b5cf6', bg: 'rgba(139,92,246,0.12)'  },
  rose:    { text: '#f43f5e', bg: 'rgba(244,63,94,0.12)'   },
  slate:   { text: '#94a3b8', bg: 'rgba(148,163,184,0.10)' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) {
  const { isDark } = useTheme();
  const t   = isDark ? dark : light;
  const hue = colorMap[color] || colorMap.amber;

  return (
    <div
      style={{
        ...glassCard(t),
        padding:    24,
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor:     'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)';    }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.label, marginBottom: 8 }}>
            {title}
          </p>
          <p style={{ fontSize: 32, fontWeight: 300, color: t.title, lineHeight: 1 }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ fontSize: 13, color: t.subtitle, marginTop: 4 }}>{subtitle}</p>
          )}
          {trend !== undefined && (
            <p style={{ fontSize: 11, marginTop: 6, color: trend > 0 ? '#4ade80' : '#f87171' }}>
              {trend > 0 ? '+' : ''}{trend}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div style={{ padding: 12, borderRadius: 12, background: hue.bg, color: hue.text, flexShrink: 0 }}>
            <Icon style={{ width: 20, height: 20 }} />
          </div>
        )}
      </div>
    </div>
  );
}