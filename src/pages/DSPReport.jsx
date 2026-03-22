import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { 
  ArrowLeft, 
  Loader2,
  FileText,
  Brain,
  GitBranch,
  Target,
  Shield,
  Download,
  Lock,
  CheckCircle2,
  RefreshCw,
  Star
} from 'lucide-react';
import EsotericOutputDisplay from '../components/esoteric/EsotericOutputDisplay';
import PersonalityMatrix from '../components/review/PersonalityMatrix';
import ActionResponseMatrix from '../components/review/ActionResponseMatrix';
import { format } from 'date-fns';
import { formatDocumentId } from '../components/utils/formatDocumentId';

export default function DSPReport() {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
    retry: 1,
  });

  const subject = subjectData?.[0];
  const dsp = subject?.dsp || {};

  const getConfidenceStyle = (score) => {
    if (score >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)' };
    if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)' };
    return { color: '#f43f5e', bg: 'rgba(244,63,94,0.10)', border: 'rgba(244,63,94,0.30)' };
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: t.muted, marginBottom: 16 }}>Subject not found</p>
        <button
          onClick={() => navigate(createPageUrl('Dashboard'))}
          style={{ ...glassBtnSecondary(t), padding: '10px 24px', fontSize: 14 }}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const conf = getConfidenceStyle(dsp.confidence_score || 0);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            style={{
              width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.muted,
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>
              Definitive Subject Profile
            </h1>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{subject.name}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate(createPageUrl(`SubjectReview?id=${subjectId}`))}
            style={{ ...glassBtnSecondary(t), padding: '9px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <RefreshCw style={{ width: 15, height: 15 }} />
            Regenerate
          </button>
          <button
            onClick={() => window.print()}
            style={{ ...glassBtnSecondary(t), padding: '9px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Download style={{ width: 15, height: 15 }} />
            Export
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        
        {/* Header Card */}
        <div style={{
          ...glassCard(t),
          padding: 28,
          borderTop: `2px solid rgba(245,158,11,0.45)`,
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
              <div>
                {/* Badges */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(16,185,129,0.12)', color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <Lock style={{ width: 10, height: 10 }} />
                    FINALIZED
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    padding: '4px 10px', borderRadius: 999,
                    background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    color: t.muted,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <CheckCircle2 style={{ width: 10, height: 10 }} />
                    VERIFIED
                  </span>
                </div>
                
                <h2 style={{ fontSize: 30, fontWeight: 300, color: t.title, margin: '0 0 12px' }}>
                  {subject.name}
                </h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    ['Document ID', formatDocumentId(dsp.document_id || `DSP-${subject.id?.slice(-6) || '000'}-CP-003-APL`)],
                    ['Protocol', dsp.protocol_version || 'CP-003-O-D-APL v2.1'],
                    ['Date of Synthesis', dsp.date_of_synthesis || new Date().toISOString().split('T')[0]],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, minWidth: 130 }}>
                        {label}:
                      </span>
                      <span style={{ fontSize: 13, fontFamily: 'monospace', color: t.text }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confidence score */}
              <div style={{
                padding: '20px 28px', borderRadius: 16, textAlign: 'center', minWidth: 130,
                background: conf.bg, border: `1px solid ${conf.border}`,
              }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: conf.color, opacity: 0.8, marginBottom: 6 }}>
                  Confidence
                </p>
                <p style={{ fontSize: 32, fontWeight: 300, color: conf.color, margin: 0 }}>
                  {dsp.confidence_score || 0}%
                </p>
                {dsp.confidence_justification && (
                  <p style={{ fontSize: 11, color: conf.color, opacity: 0.75, marginTop: 8, lineHeight: 1.5, textAlign: 'left', maxWidth: 200 }}>
                    {dsp.confidence_justification}
                  </p>
                )}
              </div>
            </div>

            {dsp.classification && (
              <div style={{ paddingTop: 20, borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 8 }}>
                  Classification
                </p>
                <p style={{ fontSize: 20, fontWeight: 400, color: t.accent, margin: 0 }}>{dsp.classification}</p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <Section t={t} isDark={isDark} icon={<FileText style={{ width: 15, height: 15, color: '#f59e0b' }} />} title="Executive Summary">
          <p style={{ color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>
            {dsp.executive_summary || 'No summary available'}
          </p>
        </Section>

        {/* Personality Matrix */}
        <Section t={t} isDark={isDark} icon={<Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />} title="Personality Matrix">
          <PersonalityMatrix data={dsp.personality_matrix} editable={false} />
        </Section>

        {/* Cognitive Architecture */}
        {dsp.cognitive_architecture && (
          <Section t={t} isDark={isDark} icon={<Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />} title="Cognitive Architecture">
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
              {dsp.cognitive_architecture?.sub_sections?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 4 }}>
                  {dsp.cognitive_architecture.sub_sections.map((section, i) => (
                    <div key={i}>
                      <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 6 }}>{section.title}</h4>
                      <p style={{ color: t.text, lineHeight: 1.7, margin: 0 }}>{section.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Behavioral Patterns */}
        {dsp.behavioral_patterns?.length > 0 && (
          <Section t={t} isDark={isDark} icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Behavioral Patterns">
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
          </Section>
        )}

        {/* Predictive Model */}
        <Section t={t} isDark={isDark} icon={<GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />} title="Predictive Model">
          <ActionResponseMatrix data={dsp.action_response_matrix || []} editable={false} />
        </Section>

        {/* Motivations & Fears */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <Section t={t} isDark={isDark} icon={<Target style={{ width: 15, height: 15, color: '#10b981' }} />} title="Core Motivations">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dsp.motivations?.length > 0 ? dsp.motivations.map((item, i) => (
                <div key={i} style={{
                  padding: '8px 14px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(16,185,129,0.10)', color: '#10b981',
                  border: '1px solid rgba(16,185,129,0.20)',
                }}>
                  {item}
                </div>
              )) : <p style={{ fontSize: 13, color: t.muted }}>No motivations identified</p>}
            </div>
          </Section>

          <Section t={t} isDark={isDark} icon={<Shield style={{ width: 15, height: 15, color: '#f43f5e' }} />} title="Core Fears">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dsp.fears?.length > 0 ? dsp.fears.map((item, i) => (
                <div key={i} style={{
                  padding: '8px 14px', borderRadius: 10, fontSize: 13,
                  background: 'rgba(244,63,94,0.10)', color: '#f43f5e',
                  border: '1px solid rgba(244,63,94,0.20)',
                }}>
                  {item}
                </div>
              )) : <p style={{ fontSize: 13, color: t.muted }}>No fears identified</p>}
            </div>
          </Section>
        </div>

        {/* Conflicts */}
        {subject.conflicts_detected?.length > 0 && (
          <div style={{
            ...glassCard(t),
            padding: 24,
            border: `1px solid rgba(244,63,94,0.30)`,
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

        {/* Final Assessment */}
        {dsp.final_assessment && (
          <Section t={t} isDark={isDark} icon={<CheckCircle2 style={{ width: 15, height: 15, color: '#f59e0b' }} />} title="Final Assessment">
            <p style={{ color: t.text, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0 }}>{dsp.final_assessment}</p>
          </Section>
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center', paddingTop: 32, marginTop: 8,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.label, margin: '0 0 4px' }}>
            Apollo Profiling Engine • Definitive Subject Profile
          </p>
          <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
            Generated {format(new Date(), 'PPP')}
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ t, isDark, icon, title, children }) {
  return (
    <div style={{ ...sectionStyle(t, isDark), padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        {icon}
        <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function sectionStyle(t, isDark) {
  return {
    background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.70)'}`,
    boxShadow: isDark
      ? 'inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.30), 0 4px 20px rgba(0,0,0,0.20)'
      : 'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.03), 0 4px 20px rgba(60,60,80,0.06)',
    borderRadius: 20,
  };
}