import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { FileText, Brain, GitBranch, Target, CheckCircle2 } from 'lucide-react';
import ActionResponseMatrix from '../review/ActionResponseMatrix';
import PersonalityMatrixOverview from '../dsp/PersonalityMatrixOverview';
import CognitiveArchitectureView from '../dsp/CognitiveArchitectureView';
import BehavioralPatternsView from '../dsp/BehavioralPatternsView';
import DriversView from '../dsp/DriversView';

function SectionPanel({ icon, title, children }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
      boxShadow: isDark
        ? 'inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.30), 0 4px 20px rgba(0,0,0,0.20)'
        : 'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.03), 0 4px 20px rgba(60,60,80,0.06)',
      borderRadius: 20, padding: 24,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {icon}
        <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function DossierDSPSection({ subject, dsp }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  return (
    <>
      {/* Executive Summary */}
      <SectionPanel icon={<FileText style={{ width: 15, height: 15, color: '#f59e0b' }} />} title="Executive Summary">
        <p style={{ color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
          {dsp.executive_summary || 'No summary available'}
        </p>
      </SectionPanel>

      {/* Personality Matrix */}
      <SectionPanel icon={<Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />} title="Personality Matrix">
        <PersonalityMatrixOverview data={dsp.personality_matrix} />
      </SectionPanel>

      {/* Cognitive Architecture */}
      {dsp.cognitive_architecture && (
        <SectionPanel icon={<Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />} title="Cognitive Architecture">
          {(() => {
            const ca = dsp.cognitive_architecture;
            const hasFlow = !!(ca.thinking_style || ca.epistemic_requirements || ca.defense_mechanisms || ca.sub_sections?.length);
            if (hasFlow) return <CognitiveArchitectureView cognitiveArchitecture={ca} />;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  ['Thinking Style', ca.thinking_style],
                  ['Epistemic Requirements', ca.epistemic_requirements],
                  ['Defense Mechanisms', ca.defense_mechanisms],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label}>
                    <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 6 }}>{label}</h4>
                    <p style={{ color: t.text, lineHeight: 1.7, margin: 0 }}>{value}</p>
                  </div>
                ))}
              </div>
            );
          })()}
        </SectionPanel>
      )}

      {/* Behavioral Patterns */}
      {dsp.behavioral_patterns?.length > 0 && (
        <SectionPanel icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Behavioral Patterns">
          <BehavioralPatternsView patterns={dsp.behavioral_patterns} />
        </SectionPanel>
      )}

      {/* Predictive Model */}
      <SectionPanel icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Predictive Model">
        <ActionResponseMatrix data={dsp.action_response_matrix || []} editable={false} />
      </SectionPanel>

      {/* Core Drivers — motivations & fears, paired by semantic axis where clear */}
      <SectionPanel icon={<Target style={{ width: 15, height: 15, color: '#10b981' }} />} title="Core Drivers">
        <DriversView motivations={dsp.motivations || []} fears={dsp.fears || []} />
      </SectionPanel>

      {/* Final Assessment */}
      {dsp.final_assessment && (
        <SectionPanel icon={<CheckCircle2 style={{ width: 15, height: 15, color: '#f59e0b' }} />} title="Final Assessment">
          <p style={{ color: t.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{dsp.final_assessment}</p>
        </SectionPanel>
      )}

      {/* Conflicts */}
      {subject.conflicts_detected?.length > 0 && (
        <div style={{
          background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: `1px solid rgba(244,63,94,0.30)`, borderRadius: 20, padding: 24,
        }}>
          <h3 style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#f43f5e', marginBottom: 16 }}>
            Analysis Conflicts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {subject.conflicts_detected.map((conflict, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, background: 'rgba(244,63,94,0.08)' }}>
                <p style={{ fontSize: 13, color: isDark ? '#fda4af' : '#be123c', margin: '0 0 4px' }}>{conflict.description}</p>
                <p style={{ fontSize: 11, color: isDark ? 'rgba(253,164,175,0.6)' : '#9f1239', margin: 0 }}>Resolution: {conflict.resolution}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}