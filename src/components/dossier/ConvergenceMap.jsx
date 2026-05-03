import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';
import { Link2, Unlink, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * ConvergenceMap — renders the convergence/divergence analysis between
 * the DSP (empirical) and Esoteric (symbolic) lenses. Includes the
 * alignment score arc and expandable point cards.
 */
export default function ConvergenceMap({ convergenceMap }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [showDivergence, setShowDivergence] = useState(true);
  const [showConvergence, setShowConvergence] = useState(true);

  if (!convergenceMap) return null;

  const {
    convergence_points = [],
    divergence_points = [],
    overall_alignment_score = 0,
  } = convergenceMap;

  const scoreColor = overall_alignment_score >= 75
    ? '#10b981'
    : overall_alignment_score >= 50
      ? '#f59e0b'
      : '#f43f5e';

  // SVG arc for alignment score
  const arcRadius = 52;
  const arcStroke = 6;
  const circumference = Math.PI * arcRadius; // half-circle
  const progress = (overall_alignment_score / 100) * circumference;

  return (
    <div style={{ ...glassCard(t), padding: 28, borderTop: `2px solid ${scoreColor}40` }}>
      {/* Header with alignment arc */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', width: 120, height: 68 }}>
          <svg width="120" height="68" viewBox="0 0 120 68">
            {/* Track */}
            <path
              d={`M ${60 - arcRadius} 62 A ${arcRadius} ${arcRadius} 0 0 1 ${60 + arcRadius} 62`}
              fill="none"
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              strokeWidth={arcStroke}
              strokeLinecap="round"
            />
            {/* Progress */}
            <path
              d={`M ${60 - arcRadius} 62 A ${arcRadius} ${arcRadius} 0 0 1 ${60 + arcRadius} 62`}
              fill="none"
              stroke={scoreColor}
              strokeWidth={arcStroke}
              strokeLinecap="round"
              strokeDasharray={`${progress} ${circumference}`}
              style={{ filter: `drop-shadow(0 0 6px ${scoreColor}50)` }}
            />
          </svg>
          <div style={{
            position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 22, fontWeight: 300, color: scoreColor, fontFamily: 'monospace' }}>
              {overall_alignment_score}
            </span>
            <span style={{ fontSize: 9, color: scoreColor, opacity: 0.7 }}>%</span>
          </div>
        </div>

        <div>
          <h3 style={{
            fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: t.label, margin: '0 0 6px',
          }}>
            Lens Alignment
          </h3>
          <p style={{ fontSize: 12, color: t.muted, margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
            Measures agreement between the empirical DSP and symbolic Esoteric interpretations across shared analytical domains.
          </p>
        </div>
      </div>

      {/* Convergence Points */}
      {convergence_points.length > 0 && (
        <div style={{ marginBottom: divergence_points.length > 0 ? 20 : 0 }}>
          <button
            onClick={() => setShowConvergence(c => !c)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 0 12px', textAlign: 'left',
            }}
          >
            <Link2 style={{ width: 13, height: 13, color: '#10b981' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#10b981' }}>
              Convergence Points ({convergence_points.length})
            </span>
            {showConvergence
              ? <ChevronUp style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
              : <ChevronDown style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
            }
          </button>

          {showConvergence && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {convergence_points.map((point, i) => (
                <PointCard
                  key={i}
                  type="convergence"
                  domain={point.domain}
                  fields={[
                    { label: 'DSP Evidence', value: point.dsp_evidence },
                    { label: 'Esoteric Evidence', value: point.esoteric_evidence },
                    { label: 'Significance', value: point.significance },
                  ]}
                  score={point.confidence}
                  isDark={isDark}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Divergence Points */}
      {divergence_points.length > 0 && (
        <div>
          <button
            onClick={() => setShowDivergence(d => !d)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 0 12px', textAlign: 'left',
            }}
          >
            <Unlink style={{ width: 13, height: 13, color: '#f59e0b' }} />
            <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#f59e0b' }}>
              Divergence Points ({divergence_points.length})
            </span>
            {showDivergence
              ? <ChevronUp style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
              : <ChevronDown style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
            }
          </button>

          {showDivergence && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {divergence_points.map((point, i) => (
                <PointCard
                  key={i}
                  type="divergence"
                  domain={point.domain}
                  fields={[
                    { label: 'DSP Position', value: point.dsp_position },
                    { label: 'Esoteric Position', value: point.esoteric_position },
                    { label: 'Arbitration', value: point.arbitration },
                  ]}
                  tension={point.tension_value}
                  isDark={isDark}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PointCard({ type, domain, fields, score, tension, isDark, t }) {
  const isConv = type === 'convergence';
  const accentColor = isConv ? '#10b981' : '#f59e0b';
  const tensionColors = { low: '#10b981', medium: '#f59e0b', high: '#f43f5e' };

  return (
    <div style={{
      padding: 16, borderRadius: 14,
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      borderLeft: `3px solid ${accentColor}30`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: t.title }}>{domain}</span>
        {score != null && (
          <span style={{
            fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 999,
            background: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}30`,
          }}>
            {score}%
          </span>
        )}
        {tension && (
          <span style={{
            fontSize: 10, fontFamily: 'monospace', padding: '2px 8px', borderRadius: 999,
            background: `${tensionColors[tension] || '#f59e0b'}15`,
            color: tensionColors[tension] || '#f59e0b',
            border: `1px solid ${tensionColors[tension] || '#f59e0b'}30`,
            textTransform: 'uppercase',
          }}>
            {tension} tension
          </span>
        )}
      </div>

      {fields.filter(f => f.value).map((field, i) => (
        <div key={i} style={{ marginBottom: i < fields.length - 1 ? 8 : 0 }}>
          <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label }}>
            {field.label}
          </span>
          <p style={{ fontSize: 12, color: t.text, lineHeight: 1.6, margin: '3px 0 0' }}>{field.value}</p>
        </div>
      ))}
    </div>
  );
}