import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { CheckCircle2, XCircle, Star } from 'lucide-react';
import FidelityMeter from './FidelityMeter';
import ThresholdPhaseArc from './ThresholdPhaseArc';
import NodeConvergenceRadar from './NodeConvergenceRadar';
import CycleTimeline from './CycleTimeline';
import ValidationDashboard from './ValidationDashboard';

const SECTIONS = [
  { key: 'inquiry_frame',              label: 'Esoteric Inquiry Frame',       color: '#8b5cf6' },
  { key: 'astrological_interpretation',label: 'Astrological Interpretation',  color: '#f59e0b', tag: 'Node Alpha' },
  { key: 'numerological_interpretation',label: 'Numerological Interpretation', color: '#06b6d4', tag: 'Node Beta' },
  { key: 'unified_emotional_synthesis', label: 'Unified Emotional Synthesis',  color: '#10b981' },
  { key: 'threshold_assessment',        label: 'Threshold Assessment',         color: '#f43f5e' },
  { key: 'strategic_translation',       label: 'Strategic Translation',        color: '#f59e0b' },
  { key: 'limitation_statement',        label: 'Limitation Statement',         color: '#64748b' },
];

export default function EsotericOutputDisplay({ profile, esotericInputs }) {
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
      {/* Fidelity Meter — replaces old execution header */}
      <FidelityMeter
        fidelity={profile.input_fidelity}
        executionStatus={profile.execution_status}
        dateExecuted={profile.date_executed}
      />

      {/* Content Sections — with visual aids injected at strategic points */}
      {SECTIONS.map(({ key, label, color, tag }) => {
        const content = profile[key];
        if (!content) return null;
        return (
          <React.Fragment key={key}>
            <div style={cardStyle(color)}>
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

            {/* Visual aid: Node Convergence Radar — after Node Beta (numerology), before synthesis */}
            {key === 'numerological_interpretation' && profile.astrological_interpretation && (
              <NodeConvergenceRadar
                astroText={profile.astrological_interpretation}
                numText={profile.numerological_interpretation}
              />
            )}

            {/* Visual aid: Cycle Timeline — after numerology section */}
            {key === 'numerological_interpretation' && (
              <CycleTimeline
                numText={profile.numerological_interpretation}
                dateOfBirth={esotericInputs?.date_of_birth}
                timeframe={esotericInputs?.timeframe}
              />
            )}

            {/* Visual aid: Threshold Phase Arc — after threshold assessment */}
            {key === 'threshold_assessment' && (
              <ThresholdPhaseArc thresholdText={profile.threshold_assessment} />
            )}
          </React.Fragment>
        );
      })}

      {/* SME Validation Dashboard — visual gauge version */}
      {profile.sme_validation && (
        <ValidationDashboard validation={profile.sme_validation} />
      )}
    </div>
  );
}