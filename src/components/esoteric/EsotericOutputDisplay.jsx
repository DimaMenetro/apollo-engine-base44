import React, { useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import FidelityMeter from './FidelityMeter';
import ThresholdPhaseArc from './ThresholdPhaseArc';
import CycleTimeline from './CycleTimeline';
import ValidationDashboard from './ValidationDashboard';
import DualNodeChart from './DualNodeChart';
import SectionViewToggle from './SectionViewToggle';

/**
 * Sections that have a paired visual aid.
 * key → visual component rendered when mode === 'visual'
 */
const VISUAL_MAP = {
  threshold_assessment: true,
  numerological_interpretation: true,
};

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

  // Per-section view mode state: 'text' (default) or 'visual'
  const [viewModes, setViewModes] = useState({});
  const getMode = (key) => viewModes[key] || 'text';
  const setMode = (key, mode) => setViewModes(prev => ({ ...prev, [key]: mode }));

  if (!profile) return null;

  const cardStyle = (accentColor) => ({
    padding: 20,
    borderRadius: 16,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.55)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderLeft: `3px solid ${accentColor}`,
  });

  const hasNodes = profile.astrological_interpretation && profile.numerological_interpretation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Fidelity Meter */}
      <FidelityMeter
        fidelity={profile.input_fidelity}
        executionStatus={profile.execution_status}
        dateExecuted={profile.date_executed}
      />

      {/* Content Sections — with text ↔ visual toggle on sections that have paired visuals */}
      {SECTIONS.map(({ key, label, color, tag }) => {
        const content = profile[key];
        if (!content) return null;

        const hasVisual = VISUAL_MAP[key];
        const mode = getMode(key);

        // Skip individual Alpha/Beta cards when Dual Node Chart is showing
        // (they're already inside DualNodeChart)
        // — but only when user is in text mode; the cards still render for text reading
        return (
          <React.Fragment key={key}>
            <div style={cardStyle(color)}>
              {/* Header row — label + optional toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
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
                {hasVisual && (
                  <div style={{ marginLeft: 'auto' }}>
                    <SectionViewToggle mode={mode} onToggle={(m) => setMode(key, m)} />
                  </div>
                )}
              </div>

              {/* Content — text or visual based on mode */}
              {mode === 'text' ? (
                <p style={{ fontSize: 13, color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{content}</p>
              ) : (
                /* Inline visual for this section */
                <>
                  {key === 'threshold_assessment' && (
                    <ThresholdPhaseArc thresholdText={profile.threshold_assessment} />
                  )}
                  {key === 'numerological_interpretation' && (
                    <CycleTimeline
                      numText={profile.numerological_interpretation}
                      dateOfBirth={esotericInputs?.date_of_birth}
                      timeframe={esotericInputs?.timeframe}
                    />
                  )}
                </>
              )}
            </div>

            {/* Dual Node Chart — appears after Node Beta, always visible when both nodes exist */}
            {key === 'numerological_interpretation' && hasNodes && (
              <DualNodeChart
                astroText={profile.astrological_interpretation}
                numText={profile.numerological_interpretation}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* SME Validation Dashboard */}
      {profile.sme_validation && (
        <ValidationDashboard validation={profile.sme_validation} />
      )}
    </div>
  );
}