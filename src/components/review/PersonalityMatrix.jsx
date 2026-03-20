import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';

const traits = [
  { key: 'openness',          label: 'Openness',          description: 'Creativity, curiosity, willingness to try new things' },
  { key: 'conscientiousness', label: 'Conscientiousness', description: 'Organization, dependability, self-discipline' },
  { key: 'extraversion',      label: 'Extraversion',      description: 'Sociability, assertiveness, positive emotions' },
  { key: 'agreeableness',     label: 'Agreeableness',     description: 'Cooperation, trust, helpfulness' },
  { key: 'neuroticism',       label: 'Neuroticism',       description: 'Emotional instability, anxiety, moodiness' },
];

export default function PersonalityMatrix({ data, onChange, editable = false }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const getScore    = (key) => data?.[key]?.score    || 50;
  const getEvidence = (key) => data?.[key]?.evidence || '';

  const handleChange = (key, field, value) => {
    if (!editable) return;
    onChange({ ...data, [key]: { ...data?.[key], [field]: value } });
  };

  const getBarColor = (score) => {
    if (score >= 70) return '#10b981';
    if (score >= 40) return '#f59e0b';
    return '#f43f5e';
  };

  const trackBg     = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textareaStyle = {
    width: '100%', padding: '8px 12px', fontSize: 12, lineHeight: 1.5, borderRadius: 8,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
    color: t.text, outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {traits.map((trait) => {
        const score    = getScore(trait.key);
        const barColor = getBarColor(score);

        return (
          <div key={trait.key}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 500, color: t.title, margin: '0 0 2px' }}>{trait.label}</h4>
                <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>{trait.description}</p>
              </div>
              <span style={{ fontSize: 13, fontFamily: 'monospace', color: t.subtitle }}>{score}%</span>
            </div>

            {/* Track */}
            <div style={{ height: 5, borderRadius: 999, background: trackBg, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ height: '100%', borderRadius: 999, background: barColor, width: `${score}%`, transition: 'width 0.5s ease' }} />
            </div>

            {editable ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input type="range" min="0" max="100" value={score}
                  onChange={(e) => handleChange(trait.key, 'score', parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: barColor }} />
                <textarea rows={2} placeholder="Evidence supporting this assessment..."
                  value={getEvidence(trait.key)}
                  onChange={(e) => handleChange(trait.key, 'evidence', e.target.value)}
                  style={textareaStyle} />
              </div>
            ) : (
              <>
                {getEvidence(trait.key) && (
                  <p style={{ fontSize: 12, color: t.muted, fontStyle: 'italic', margin: '0 0 8px' }}>
                    "{getEvidence(trait.key)}"
                  </p>
                )}
                {data?.[trait.key]?.indicators?.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {data[trait.key].indicators.map((indicator, i) => (
                      <div key={i} style={{ display: 'flex', gap: 7, alignItems: 'flex-start' }}>
                        <span style={{ color: barColor, fontSize: 11, marginTop: 2, flexShrink: 0 }}>•</span>
                        <span style={{ fontSize: 12, color: t.muted, lineHeight: 1.5 }}>{indicator}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}