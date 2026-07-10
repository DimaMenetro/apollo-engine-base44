import React from 'react';
import { Loader2 } from 'lucide-react';

const STAGES = ['identity', 'psychodynamic', 'personality', 'behavioral', 'predictive', 'drivers', 'convergence_map', 'final_assessment', 'confidence_methodology'];

const LABELS = {
  identity: 'Unified Identity Portrait',
  psychodynamic: 'Psychodynamic Architecture',
  personality: 'Personality & Archetypal Resonance',
  behavioral: 'Behavioral Topology',
  predictive: 'Predictive Convergence Model',
  drivers: 'Core Drivers & Shadow',
  convergence_map: 'Convergence Map',
  final_assessment: 'Final Unified Assessment',
  confidence_methodology: 'Confidence & Methodology',
};

export default function SynthesisStageStatus({ job, isQueued }) {
  const idx = job ? STAGES.indexOf(job.stage) : -1;
  const stageNum = idx >= 0 ? idx + 1 : 1;
  const label = job ? (LABELS[job.stage] || job.stage) : '';

  return (
    <div style={{
      marginBottom: 16, padding: '10px 14px', borderRadius: 10,
      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
      fontSize: 13, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite', flexShrink: 0 }} />
      <span>
        {!job
          ? (isQueued
              ? 'Synthesis is queued — a worker will pick it up momentarily. You can safely leave this page.'
              : 'Synthesis is running on the server — the dossier will appear here automatically when complete.')
          : `Synthesizing stage ${stageNum} of ${STAGES.length}: ${label}. The dossier will appear automatically when all stages complete — you can safely leave this page.`}
      </span>
    </div>
  );
}