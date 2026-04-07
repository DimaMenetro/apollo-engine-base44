import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { FileText, Brain, GitBranch, Target, Shield, CheckCircle2 } from 'lucide-react';
import PersonalityMatrix from '../review/PersonalityMatrix';
import ActionResponseMatrix from '../review/ActionResponseMatrix';

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
        <PersonalityMatrix data={dsp.personality_matrix} editable={false} />
      </SectionPanel>

      {/* Cognitive Architecture */}
      {dsp.cognitive_architecture && (
        <SectionPanel icon={<Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />} title="Cognitive Architecture">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              ['Thinking Style', dsp.cognitive_architecture.thinking_style],
              ['Epistemic Requirements', dsp.cognitive_architecture.epistemic_requirements],
              ['Defense Mechanisms', dsp.cognitive_architecture.defense_mechanisms],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label}>
                <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 6 }}>{label}</h4>
                <p style={{ color: t.text, lineHeight: 1.7, margin: 0 }}>{value}</p>
              </div>
            ))}
            {dsp.cognitive_architecture?.sub_sections?.map((section, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 6 }}>{section.title}</h4>
                <p style={{ color: t.text, lineHeight: 1.7, margin: 0 }}>{section.content}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}

      {/* Behavioral Patterns */}
      {dsp.behavioral_patterns?.length > 0 && (
        <SectionPanel icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Behavioral Patterns">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dsp.behavioral_patterns.map((pattern, index) => (
              <div key={index} style={{
                padding: 16, borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
              }}>
                <h4 style={{ fontSize: 13, fontWeight: 500, color: t.accent, marginBottom: 6 }}>{pattern.label}</h4>
                <p style={{ color: t.text, lineHeight: 1.6, marginBottom: 6, fontSize: 14 }}>{pattern.description}</p>
                <p style={{ fontSize: 12, color: t.muted, fontStyle: 'italic', margin: 0 }}>{pattern.context}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}

      {/* Predictive Model */}
      <SectionPanel icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Predictive Model">
        <ActionResponseMatrix data={dsp.action_response_matrix || []} editable={false} />
      </SectionPanel>

      {/* Motivations & Fears */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <SectionPanel icon={<Target style={{ width: 15, height: 15, color: '#10b981' }} />} title="Core Motivations">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dsp.motivations?.length > 0 ? dsp.motivations.map((item, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(16,185,129,0.10)', color: '#10b981',
                border: '1px solid rgba(16,185,129,0.20)',
              }}>{item}</div>
            )) : <p style={{ fontSize: 13, color: t.muted }}>No motivations identified</p>}
          </div>
        </SectionPanel>

        <SectionPanel icon={<Shield style={{ width: 15, height: 15, color: '#f43f5e' }} />} title="Core Fears">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dsp.fears?.length > 0 ? dsp.fears.map((item, i) => (
              <div key={i} style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 13,
                background: 'rgba(244,63,94,0.10)', color: '#f43f5e',
                border: '1px solid rgba(244,63,94,0.20)',
              }}>{item}</div>
            )) : <p style={{ fontSize: 13, color: t.muted }}>No fears identified</p>}
          </div>
        </SectionPanel>
      </div>

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