import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';
import { Clock } from 'lucide-react';

/**
 * UnifiedTimeline — Phase 3d visual #3
 * Horizontal timeline merging DSP behavioral patterns (empirical observations)
 * with the esoteric threshold phase assessment (symbolic positioning).
 *
 * The timeline does NOT represent calendar time — it represents a conceptual
 * progression from observed behavior (left) through current phase (center)
 * to predicted trajectory (right).
 *
 * Data sources:
 * - dsp.behavioral_patterns[] → left/center nodes (observed)
 * - esoteric_profile threshold_assessment text → phase marker (center)
 * - dsp.action_response_matrix[] → right nodes (predicted)
 */

const PHASE_KEYWORDS = {
  rupture:        { label: 'Rupture',        color: '#f43f5e', position: 0.15 },
  reintegration:  { label: 'Reintegration',  color: '#f59e0b', position: 0.40 },
  plateau:        { label: 'Plateau',        color: '#06b6d4', position: 0.65 },
  'threshold transit': { label: 'Threshold Transit', color: '#10b981', position: 0.85 },
};

function detectPhase(thresholdText) {
  if (!thresholdText) return null;
  const lower = thresholdText.toLowerCase();
  for (const [key, config] of Object.entries(PHASE_KEYWORDS)) {
    if (lower.includes(key)) return config;
  }
  return null;
}

export default function UnifiedTimeline({ behavioralPatterns, thresholdAssessment, actionResponseMatrix }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const phase = useMemo(() => detectPhase(thresholdAssessment), [thresholdAssessment]);
  const patterns = behavioralPatterns || [];
  const predictions = actionResponseMatrix || [];

  // Build timeline nodes (must be above early return to satisfy Rules of Hooks)
  const nodes = useMemo(() => {
    const items = [];

    patterns.slice(0, 4).forEach((bp, i) => {
      items.push({
        type: 'observed',
        label: bp.label,
        detail: bp.description,
        color: '#f59e0b',
        position: (i + 1) / (patterns.slice(0, 4).length + 1),
      });
    });

    predictions.slice(0, 3).forEach((arm, i) => {
      items.push({
        type: 'predicted',
        label: arm.trigger || `Prediction ${i + 1}`,
        detail: arm.predicted_behavior,
        probability: arm.probability,
        color: '#8b5cf6',
        position: 0,
      });
    });

    return items;
  }, [patterns, predictions]);

  const observed = nodes.filter(n => n.type === 'observed');
  const predicted = nodes.filter(n => n.type === 'predicted');

  if (!patterns.length && !phase && !predictions.length) return null;

  return (
    <div style={{ ...glassCard(t), padding: 24, borderTop: '2px solid rgba(6,182,212,0.25)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Clock style={{ width: 14, height: 14, color: '#06b6d4' }} />
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: t.label,
        }}>
          Unified Behavioral–Phase Timeline
        </span>
      </div>

      {/* Phase bar */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        {/* Track */}
        <div style={{
          height: 4, borderRadius: 999, width: '100%',
          background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        }} />

        {/* Phase marker */}
        {phase && (
          <div style={{
            position: 'absolute', top: -8, left: `${phase.position * 100}%`,
            transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: phase.color, opacity: 0.9,
              boxShadow: `0 0 12px ${phase.color}50`,
              border: `2px solid ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.8)'}`,
            }} />
            <span style={{
              fontSize: 9, fontWeight: 600, color: phase.color,
              marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}>
              {phase.label}
            </span>
          </div>
        )}

        {/* Phase labels along track */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: phase ? 28 : 8, padding: '0 4px',
        }}>
          {Object.values(PHASE_KEYWORDS).map(pk => (
            <span key={pk.label} style={{
              fontSize: 8, color: phase?.label === pk.label ? pk.color : t.muted,
              fontWeight: phase?.label === pk.label ? 600 : 400,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              opacity: phase?.label === pk.label ? 1 : 0.5,
            }}>
              {pk.label}
            </span>
          ))}
        </div>
      </div>

      {/* Two-column: Observed (left) | Predicted (right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Observed */}
        <div>
          <div style={{
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.10em', color: '#f59e0b', marginBottom: 10,
          }}>
            Observed Patterns
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {observed.map((node, i) => (
              <TimelineNode key={i} node={node} isDark={isDark} t={t} />
            ))}
            {observed.length === 0 && (
              <span style={{ fontSize: 11, color: t.muted, fontStyle: 'italic' }}>No behavioral patterns</span>
            )}
          </div>
        </div>

        {/* Predicted */}
        <div>
          <div style={{
            fontSize: 9, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.10em', color: '#8b5cf6', marginBottom: 10,
          }}>
            Predicted Trajectories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {predicted.map((node, i) => (
              <TimelineNode key={i} node={node} isDark={isDark} t={t} />
            ))}
            {predicted.length === 0 && (
              <span style={{ fontSize: 11, color: t.muted, fontStyle: 'italic' }}>No predictions</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineNode({ node, isDark, t }) {
  return (
    <div style={{
      padding: 12, borderRadius: 12,
      background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      borderLeft: `3px solid ${node.color}30`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: t.title }}>{node.label}</span>
        {node.probability != null && (
          <span style={{
            fontSize: 9, fontFamily: 'monospace', padding: '2px 6px', borderRadius: 999,
            background: `${node.color}12`, color: node.color, border: `1px solid ${node.color}25`,
          }}>
            P={node.probability}%
          </span>
        )}
      </div>
      {node.detail && (
        <p style={{ fontSize: 11, color: t.muted, lineHeight: 1.5, margin: 0 }}>
          {node.detail.length > 120 ? node.detail.slice(0, 120) + '…' : node.detail}
        </p>
      )}
    </div>
  );
}