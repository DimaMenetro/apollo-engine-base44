import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * SynthesizedSection — a glass panel that renders one narrative section
 * from the unified dossier. Supports expandable/collapsible state for
 * long-form content with a smooth transition.
 */
export default function SynthesizedSection({ icon, title, content, accentColor, defaultExpanded = true }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!content) return null;

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(40px) saturate(180%)',
      WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
      borderLeft: `3px solid ${accentColor || t.accent}`,
      boxShadow: isDark
        ? 'inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.30), 0 4px 20px rgba(0,0,0,0.20)'
        : 'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.03), 0 4px 20px rgba(60,60,80,0.06)',
      borderRadius: 20,
      overflow: 'hidden',
    }}>
      {/* Header — always visible, clickable to toggle */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', padding: '20px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {icon}
        <h3 style={{
          fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: t.label, margin: 0, flex: 1,
        }}>
          {title}
        </h3>
        {expanded
          ? <ChevronUp style={{ width: 14, height: 14, color: t.muted }} />
          : <ChevronDown style={{ width: 14, height: 14, color: t.muted }} />
        }
      </button>

      {/* Content — collapsible */}
      {expanded && (
        <div style={{ padding: '0 24px 24px' }}>
          <p style={{
            color: t.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, fontSize: 14,
          }}>
            {content}
          </p>
        </div>
      )}
    </div>
  );
}