import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard, glassBtnSecondary } from '../ui/LiquidGlass';
import { ArrowLeft, Layers, Lock, CheckCircle2 } from 'lucide-react';
import ExportDropdown from '../export/ExportDropdown';
import { formatDocumentId } from '../utils/formatDocumentId';

export default function DossierHeader({ subject, subjectId, hasDSP, hasEsoteric, hasSynthesis, unifiedDossier }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const dsp = subject?.dsp || {};

  const getConfidenceStyle = (score) => {
    if (score >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.30)' };
    if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.30)' };
    return { color: '#f43f5e', bg: 'rgba(244,63,94,0.10)', border: 'rgba(244,63,94,0.30)' };
  };

  const conf = getConfidenceStyle(dsp.confidence_score || 0);

  return (
    <>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted,
            }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers style={{ width: 16, height: 16, color: '#10b981' }} />
              <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Unified Dossier</h1>
            </div>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 4 }}>{subject.name}</p>
          </div>
        </div>

        <ExportDropdown
          subjectId={subjectId}
          hasDSP={hasDSP}
          hasEsoteric={hasEsoteric}
          hasUnified={hasSynthesis}
          defaultMode="merged"
        />
      </div>

      {/* Identity card */}
      {hasDSP && (
        <div style={{ ...glassCard(t), padding: 28, borderTop: '2px solid rgba(16,185,129,0.40)', marginBottom: 20 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
            <div>
              {/* Badges */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {subject.status === 'finalized' && (
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
                )}
                {hasEsoteric && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(139,92,246,0.12)', color: '#8b5cf6',
                    border: '1px solid rgba(139,92,246,0.25)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <CheckCircle2 style={{ width: 10, height: 10 }} />
                    CP-012 ATTACHED
                  </span>
                )}
                {hasSynthesis && (
                  <span style={{
                    fontSize: 11, fontWeight: 600, letterSpacing: '0.08em',
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(16,185,129,0.12)', color: '#10b981',
                    border: '1px solid rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <CheckCircle2 style={{ width: 10, height: 10 }} />
                    SYNTHESIZED
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: 28, fontWeight: 300, color: t.title, margin: '0 0 12px' }}>{subject.name}</h2>

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

              {dsp.classification && (
                <div style={{ marginTop: 16 }}>
                  <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 4 }}>Classification</p>
                  <p style={{ fontSize: 18, fontWeight: 400, color: t.accent, margin: 0 }}>{dsp.classification}</p>
                </div>
              )}
            </div>

            {/* Confidence */}
            {dsp.confidence_score != null && (
              <div style={{
                padding: '20px 28px', borderRadius: 16, textAlign: 'center', minWidth: 130,
                background: conf.bg, border: `1px solid ${conf.border}`,
              }}>
                <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: conf.color, opacity: 0.8, marginBottom: 6 }}>Confidence</p>
                <p style={{ fontSize: 32, fontWeight: 300, color: conf.color, margin: 0 }}>{dsp.confidence_score}%</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}