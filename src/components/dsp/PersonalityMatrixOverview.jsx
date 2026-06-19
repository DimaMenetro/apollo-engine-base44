import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import Collapsible from './Collapsible';
import { firstSentences } from './summarize';

const TRAITS = [
  { key: 'openness',          label: 'Openness' },
  { key: 'conscientiousness', label: 'Conscientiousness' },
  { key: 'extraversion',      label: 'Extraversion' },
  { key: 'agreeableness',     label: 'Agreeableness' },
  { key: 'neuroticism',       label: 'Neuroticism' },
];

function barColorFor(score) {
  if (score >= 70) return '#10b981';
  if (score >= 40) return '#f59e0b';
  return '#f43f5e';
}

// Summary-first read of the Big Five. Each trait shows name, %, colored bar and a
// one-line interpretation excerpt; expanding reveals the full original evidence +
// every indicator. No generated content is removed or altered.
export default function PersonalityMatrixOverview({ data }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!data) return null;

  const trackBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const innerCard = {
    padding: '14px 16px',
    borderRadius: 14,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {TRAITS.map((trait) => {
        const trait_data = data[trait.key] || {};
        const score = trait_data.score ?? 50;
        const evidence = trait_data.evidence || '';
        const indicators = trait_data.indicators || [];
        const color = barColorFor(score);
        const summary = firstSentences(evidence, { maxChars: 130, maxSentences: 1 });
        const hasMore = !!evidence || indicators.length > 0;

        const header = (
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 7 }}>
              <h4 style={{ fontSize: 14, fontWeight: 500, color: t.title, margin: 0 }}>{trait.label}</h4>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color, flexShrink: 0 }}>{score}%</span>
            </div>
            <div
              role="meter"
              aria-label={`${trait.label}: ${score} percent`}
              aria-valuenow={score}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ height: 5, borderRadius: 999, background: trackBg, overflow: 'hidden', marginBottom: summary ? 8 : 0 }}
            >
              <div style={{ height: '100%', borderRadius: 999, background: color, width: `${score}%`, transition: 'width 0.5s ease' }} />
            </div>
            {summary && (
              <p style={{ fontSize: 12.5, color: t.muted, lineHeight: 1.5, margin: 0 }}>{summary}</p>
            )}
          </div>
        );

        if (!hasMore) {
          return <div key={trait.key} style={innerCard}>{header}</div>;
        }

        return (
          <div key={trait.key} style={innerCard}>
            <Collapsible
              t={t}
              isDark={isDark}
              accent={color}
              header={header}
              toggleLabel={`Show full ${trait.label} analysis`}
            >
              {evidence && (
                <p style={{ fontSize: 13, color: t.text, fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 10px' }}>
                  "{evidence}"
                </p>
              )}
              {indicators.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {indicators.map((ind, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ color, fontSize: 11, marginTop: 3, flexShrink: 0 }} aria-hidden="true">•</span>
                      <span style={{ fontSize: 13, color: t.muted, lineHeight: 1.55 }}>{ind}</span>
                    </div>
                  ))}
                </div>
              )}
            </Collapsible>
          </div>
        );
      })}
    </div>
  );
}