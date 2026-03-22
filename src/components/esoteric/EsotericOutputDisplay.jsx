import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { CheckCircle2, XCircle, Star } from 'lucide-react';

const SECTIONS = [
  { key: 'inquiry_frame',              label: 'Esoteric Inquiry Frame',       color: '#8b5cf6' },
  { key: 'astrological_interpretation',label: 'Astrological Interpretation',  color: '#f59e0b', tag: 'Node Alpha' },
  { key: 'numerological_interpretation',label: 'Numerological Interpretation', color: '#06b6d4', tag: 'Node Beta' },
  { key: 'unified_emotional_synthesis', label: 'Unified Emotional Synthesis',  color: '#10b981' },
  { key: 'threshold_assessment',        label: 'Threshold Assessment',         color: '#f43f5e' },
  { key: 'strategic_translation',       label: 'Strategic Translation',        color: '#f59e0b' },
  { key: 'limitation_statement',        label: 'Limitation Statement',         color: '#64748b' },
];

export default function EsotericOutputDisplay({ profile }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const validation = profile.sme_validation || {};
  const validationItems = [
    ['Astrology governed timing',     validation.astrology_governed_timing],
    ['Numerology governed structure', validation.numerology_governed_structure],
    ['Emotional depth prioritized',   validation.emotional_depth_prioritized],
    ['Practical translation achieved',validation.practical_translation_achieved],
    ['Generic horoscope drift avoided',validation.generic_horoscope_drift_avoided],
  ];
  const isCompliant = validation.execution_status === 'COMPLIANT';

  const cardStyle = (accentColor) => ({
    padding: 20,
    borderRadius: 16,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderLeft: `3px solid ${accentColor}`,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Execution Header */}
      <div style={{
        padding: '12px 18px',
        borderRadius: 12,
        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center',
      }}>
        {[
          ['Input Fidelity', profile.input_fidelity],
          ['Date Executed', profile.date_executed],
          ['Execution Status', profile.execution_status],
        ].map(([label, value]) => value ? (
          <div key={label}>
            <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, display: 'block', marginBottom: 2 }}>{label}</span>
            <span style={{
              fontSize: 12, fontFamily: 'monospace', fontWeight: 600,
              color: label === 'Execution Status'
                ? (value === 'COMPLIANT' ? '#10b981' : '#f43f5e')
                : t.text
            }}>{value}</span>
          </div>
        ) : null)}
      </div>

      {/* Content Sections */}
      {SECTIONS.map(({ key, label, color, tag }) => {
        const content = profile[key];
        if (!content) return null;
        return (
          <div key={key} style={cardStyle(color)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color }}>
                {label}
              </span>
              {tag && (
                <span style={{
                  fontSize: 9, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 999,
                  background: `${color}18`, color, border: `1px solid ${color}35`,
                }}>
                  {tag}
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{content}</p>
          </div>
        );
      })}

      {/* SME Validation Check */}
      {profile.sme_validation && (
        <div style={{
          padding: 20, borderRadius: 16,
          background: isCompliant ? 'rgba(16,185,129,0.06)' : 'rgba(244,63,94,0.06)',
          border: `1px solid ${isCompliant ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Star style={{ width: 13, height: 13, color: isCompliant ? '#10b981' : '#f43f5e' }} />
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: isCompliant ? '#10b981' : '#f43f5e' }}>
              SME Validation Check
            </span>
            <span style={{
              fontSize: 10, fontFamily: 'monospace', fontWeight: 700, padding: '2px 8px', borderRadius: 999, marginLeft: 'auto',
              background: isCompliant ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)',
              color: isCompliant ? '#10b981' : '#f43f5e',
              border: `1px solid ${isCompliant ? 'rgba(16,185,129,0.30)' : 'rgba(244,63,94,0.30)'}`,
            }}>
              {validation.execution_status || 'UNKNOWN'}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {validationItems.map(([label, passed]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {passed
                  ? <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981', flexShrink: 0 }} />
                  : <XCircle style={{ width: 13, height: 13, color: '#f43f5e', flexShrink: 0 }} />
                }
                <span style={{ fontSize: 12, color: t.text }}>{label}</span>
                <span style={{ fontSize: 11, fontFamily: 'monospace', marginLeft: 'auto', color: passed ? '#10b981' : '#f43f5e' }}>
                  {passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}