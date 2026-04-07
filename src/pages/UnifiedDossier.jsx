import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { Loader2, Layers } from 'lucide-react';
import ExportDropdown from '../components/export/ExportDropdown';
import DossierDSPSection from '../components/dossier/DossierDSPSection';
import DossierEsotericSection from '../components/dossier/DossierEsotericSection';
import DossierHeader from '../components/dossier/DossierHeader';
import { format } from 'date-fns';

export default function UnifiedDossier() {
  const navigate = useNavigate();
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
  const esp = subject?.esoteric_profile || null;
  const hasDSP = !!dsp?.executive_summary;
  const hasEsoteric = !!esp?.execution_status;

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
        <button onClick={() => navigate(createPageUrl('Dashboard'))} style={{ ...glassBtnSecondary(t), padding: '10px 24px', fontSize: 14 }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (!hasDSP && !hasEsoteric) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <Layers style={{ width: 40, height: 40, color: t.muted, margin: '0 auto 16px', opacity: 0.4 }} />
        <h3 style={{ color: t.subtitle, marginBottom: 8, fontWeight: 400 }}>No dossier data available</h3>
        <p style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>
          Generate a DSP or Esoteric Profile first to view the unified dossier.
        </p>
        <button onClick={() => navigate(createPageUrl(`SubjectReview?id=${subjectId}`))} style={{ ...glassBtnSecondary(t), padding: '10px 24px', fontSize: 14 }}>
          Go to Review
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <DossierHeader
        subject={subject}
        subjectId={subjectId}
        hasDSP={hasDSP}
        hasEsoteric={hasEsoteric}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* DSP Section */}
        {hasDSP && <DossierDSPSection subject={subject} dsp={dsp} />}

        {/* Transition divider when both exist */}
        {hasDSP && hasEsoteric && (
          <div style={{
            textAlign: 'center', padding: '20px 0',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.muted, margin: 0 }}>
              Supplementary Layer
            </p>
          </div>
        )}

        {/* Esoteric Section */}
        {hasEsoteric && <DossierEsotericSection esp={esp} />}

        {/* Footer */}
        <div style={{
          textAlign: 'center', paddingTop: 32, marginTop: 8,
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        }}>
          <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: t.label, margin: '0 0 4px' }}>
            Apollo Profiling Engine • Unified Subject Dossier
          </p>
          <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>
            Generated {format(new Date(), 'PPP')}
          </p>
        </div>
      </div>
    </div>
  );
}