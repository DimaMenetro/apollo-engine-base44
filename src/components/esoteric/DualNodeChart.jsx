import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import NodeConvergenceRadar from './NodeConvergenceRadar';

/**
 * DualNodeChart — side-by-side panel showing Node Alpha (Astrology) and
 * Node Beta (Numerology) summaries, with the convergence radar below as
 * the synthesis overlay. Provides a tabbed "Alpha | Beta | Overlay" view.
 */

const TABS = [
  { key: 'overlay', label: 'Convergence', color: '#10b981' },
  { key: 'alpha',   label: 'Node α', color: '#f59e0b' },
  { key: 'beta',    label: 'Node β', color: '#06b6d4' },
];

export default function DualNodeChart({ astroText, numText }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [activeTab, setActiveTab] = useState('overlay');

  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)';
  const pillBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const tabBtn = (tab) => {
    const isActive = activeTab === tab.key;
    return {
      display: 'flex', alignItems: 'center', gap: 4,
      padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
      fontSize: 9, fontWeight: isActive ? 700 : 500, letterSpacing: '0.08em',
      textTransform: 'uppercase',
      background: isActive ? `${tab.color}20` : 'transparent',
      color: isActive ? tab.color : t.muted,
      transition: 'all 0.2s ease',
    };
  };

  // Extract first ~300 chars as a quick-glance summary
  const summarize = (text) => {
    if (!text) return 'No data available';
    const sentences = text.split(/[.!?]+/).filter(Boolean);
    let summary = '';
    for (const s of sentences) {
      if ((summary + s).length > 300) break;
      summary += s.trim() + '. ';
    }
    return summary.trim() || text.slice(0, 300) + '…';
  };

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 16,
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Header + tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.label }}>
          Dual-Node Analysis
        </div>
        <div style={{ display: 'inline-flex', gap: 2, padding: 2, borderRadius: 999, background: pillBg }}>
          {TABS.map(tab => (
            <button key={tab.key} style={tabBtn(tab)} onClick={() => setActiveTab(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'overlay' && (
        <NodeConvergenceRadar astroText={astroText} numText={numText} />
      )}

      {activeTab === 'alpha' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f59e0b' }}>
              Node Alpha · Astrological Interpretation
            </span>
          </div>
          <p style={{ fontSize: 13, color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
            {astroText || 'No astrological interpretation available'}
          </p>
        </div>
      )}

      {activeTab === 'beta' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#06b6d4' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#06b6d4' }}>
              Node Beta · Numerological Interpretation
            </span>
          </div>
          <p style={{ fontSize: 13, color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
            {numText || 'No numerological interpretation available'}
          </p>
        </div>
      )}
    </div>
  );
}