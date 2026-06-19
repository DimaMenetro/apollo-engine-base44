import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import Collapsible from './Collapsible';
import { firstSentences } from './summarize';

// Summary-first behavioral pattern cards. Collapsed: title + short description excerpt.
// Expanded: full original description + full context/provenance. Nothing removed.
export default function BehavioralPatternsView({ patterns = [] }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!patterns.length) return null;

  const card = {
    padding: 16,
    borderRadius: 14,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {patterns.map((pattern, i) => {
        const description = pattern.description || '';
        const context = pattern.context || '';
        const summary = firstSentences(description, { maxChars: 200, maxSentences: 2 });
        const hasMore =
          (summary.replace(/…$/, '').trim().length < description.trim().length) || !!context;

        const header = (
          <div>
            <h4 style={{ fontSize: 13.5, fontWeight: 500, color: t.accent, margin: '0 0 5px' }}>{pattern.label}</h4>
            {summary && <p style={{ fontSize: 13, color: t.text, lineHeight: 1.55, margin: 0 }}>{summary}</p>}
          </div>
        );

        if (!hasMore) return <div key={i} style={card}>{header}</div>;

        return (
          <div key={i} style={card}>
            <Collapsible t={t} isDark={isDark} accent={t.accent} header={header} toggleLabel={`Show full pattern: ${pattern.label}`}>
              {description && summary !== description && (
                <p style={{ fontSize: 13.5, color: t.text, lineHeight: 1.65, margin: '0 0 8px' }}>{description}</p>
              )}
              {context && (
                <p style={{ fontSize: 12, color: t.muted, fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>{context}</p>
              )}
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}