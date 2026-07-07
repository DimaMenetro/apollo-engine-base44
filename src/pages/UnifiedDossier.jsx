import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { Loader2, Layers, RefreshCw, FileText, Brain, User, GitBranch, Target, Shield, CheckCircle2, Star } from 'lucide-react';
import DossierHeader from '../components/dossier/DossierHeader';
import DossierDSPSection from '../components/dossier/DossierDSPSection';
import DossierEsotericSection from '../components/dossier/DossierEsotericSection';
import SynthesizedSection from '../components/dossier/SynthesizedSection';
import ConvergenceMap from '../components/dossier/ConvergenceMap';
import StalenessIndicator from '../components/dossier/StalenessIndicator';
import SynthesisConfidenceMeter from '../components/dossier/SynthesisConfidenceMeter';
import ConvergenceRadar from '../components/dossier/ConvergenceRadar';
import PersonalityArchetypalChart from '../components/dossier/PersonalityArchetypalChart';
import UnifiedTimeline from '../components/dossier/UnifiedTimeline';
import { useAccessory } from '../components/ui/AccessoryContext';

export default function UnifiedDossier() {
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const { startProcessing, updateProgress, finishProcessing, failProcessing } = useAccessory();

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthError, setSynthError] = useState(null);

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
    retry: 1,
    // Poll every 4s while a background synthesis is running.
    refetchInterval: (query) => {
      const s = query.state.data?.[0];
      const st = s?.dossier_status;
      return (st === 'queued' || st === 'running' || st === 'generating') ? 4000 : false;
    },
  });

  const subject = subjectData?.[0];
  const dsp = subject?.dsp || {};
  const esotericProfile = subject?.esoteric_profile;
  const unifiedDossier = subject?.unified_dossier;

  const hasDSP = !!(dsp?.executive_summary);
  const hasEsoteric = !!(esotericProfile?.execution_status);
  const hasSynthesis = !!(unifiedDossier?.date_synthesized && unifiedDossier?.unified_identity_portrait);
  const canSynthesize = hasDSP && hasEsoteric;

  // Background synthesis runs asynchronously on the server; this reflects its
  // lifecycle via the polled dossier_status field.
  const isQueued = subject?.dossier_status === 'queued';
  // 'running' (worker has claimed the job, LLM synthesis in flight) and the
  // legacy 'generating' are treated identically as active synthesis.
  const isGenerating = subject?.dossier_status === 'running' || subject?.dossier_status === 'generating';
  const isBusy = isSynthesizing || isQueued || isGenerating;
  const backgroundError = subject?.dossier_status === 'failed' ? subject?.dossier_error : null;

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setSynthError(null);
    startProcessing(subjectId, subject.name, 'Dossier Synthesis');
    updateProgress('Synthesizing unified dossier...', 10);
    try {
      // Enqueue a durable job. The worker (kicked immediately + scheduled
      // safety net) runs the synthesis. Polling tracks dossier_status.
      const res = await base44.functions.invoke('enqueueDossierSynthesis', { subject_id: subjectId });
      if (res.data?.error) {
        setSynthError(res.data.error);
        failProcessing(subjectId);
      } else {
        updateProgress('Synthesis queued...', 30);
        queryClient.invalidateQueries(['subject', subjectId]);
      }
    } catch (e) {
      setSynthError(e.message || 'Synthesis failed');
      failProcessing(subjectId);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // React to background status transitions surfaced by polling.
  useEffect(() => {
    if (subject?.dossier_status === 'complete') {
      finishProcessing(subjectId);
    } else if (subject?.dossier_status === 'failed') {
      failProcessing(subjectId);
      if (subject?.dossier_error) setSynthError(subject.dossier_error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject?.dossier_status]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#10b981', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: t.muted, marginBottom: 16 }}>Subject not found</p>
      </div>
    );
  }

  // ── SYNTHESIZED VIEW ─────────────────────────────────────────────────────
  const SECTIONS = [
    { key: 'unified_identity_portrait',       title: 'Unified Identity Portrait',          icon: <User style={{ width: 15, height: 15, color: '#10b981' }} />,        accent: '#10b981' },
    { key: 'psychodynamic_architecture',       title: 'Psychodynamic Architecture',         icon: <Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />,       accent: '#8b5cf6' },
    { key: 'personality_archetypal_resonance', title: 'Personality & Archetypal Resonance', icon: <Star style={{ width: 15, height: 15, color: '#f59e0b' }} />,        accent: '#f59e0b' },
    { key: 'behavioral_topology',              title: 'Behavioral Topology',                icon: <GitBranch style={{ width: 15, height: 15, color: '#06b6d4' }} />,   accent: '#06b6d4' },
    { key: 'predictive_convergence_model',     title: 'Predictive Convergence Model',       icon: <Target style={{ width: 15, height: 15, color: '#10b981' }} />,      accent: '#10b981' },
    { key: 'core_drivers_shadow',              title: 'Core Drivers & Shadow',              icon: <Shield style={{ width: 15, height: 15, color: '#f43f5e' }} />,      accent: '#f43f5e' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      <DossierHeader
        subject={subject}
        subjectId={subjectId}
        hasDSP={hasDSP}
        hasEsoteric={hasEsoteric}
        hasSynthesis={hasSynthesis}
        unifiedDossier={unifiedDossier}
      />

      {/* Synthesis controls */}
      {canSynthesize && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={handleSynthesize}
            disabled={isBusy}
            style={{
              ...(hasSynthesis ? glassBtnSecondary(t) : glassBtn(t)),
              padding: '10px 22px', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: isBusy ? 0.6 : 1,
            }}
          >
            {isBusy
              ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />{isGenerating ? 'Synthesizing in background…' : isQueued ? 'Queued…' : 'Starting…'}</>
              : hasSynthesis
                ? <><RefreshCw style={{ width: 15, height: 15 }} />Re-Synthesize</>
                : <><Layers style={{ width: 15, height: 15 }} />Synthesize Dossier</>
            }
          </button>

          {hasSynthesis && (
            <StalenessIndicator
              unifiedDossier={unifiedDossier}
              dsp={dsp}
              esotericProfile={esotericProfile}
            />
          )}
        </div>
      )}

      {(isQueued || isGenerating) && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
          fontSize: 13, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
          {isQueued
            ? 'Synthesis is queued. A worker will pick it up momentarily — the dossier will appear here automatically. You can safely leave this page.'
            : 'Full-fidelity synthesis is running on the server. This can take a few minutes — the dossier will appear here automatically when complete. You can safely leave this page.'}
        </div>
      )}

      {(synthError || backgroundError) && (
        <div style={{
          marginBottom: 16, padding: '10px 14px', borderRadius: 10,
          background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)',
          fontSize: 13, color: '#f43f5e',
        }}>
          Synthesis failed: {synthError || backgroundError}
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {hasSynthesis ? (
          <>
            {/* Synthesis Confidence */}
            {unifiedDossier.synthesis_confidence != null && (
              <SynthesisConfidenceMeter
                confidence={unifiedDossier.synthesis_confidence}
                methodologyNote={unifiedDossier.synthesis_methodology_note}
              />
            )}

            {/* Phase 3d — Composite Visuals */}
            <ConvergenceRadar convergenceMap={unifiedDossier.convergence_map} />
            <PersonalityArchetypalChart
              personalityMatrix={dsp?.personality_matrix}
              numText={esotericProfile?.numerological_interpretation}
            />
            <UnifiedTimeline
              behavioralPatterns={dsp?.behavioral_patterns}
              thresholdAssessment={esotericProfile?.threshold_assessment}
              actionResponseMatrix={dsp?.action_response_matrix}
            />

            {/* Narrative sections */}
            {SECTIONS.map(({ key, title, icon, accent }) => (
              <SynthesizedSection
                key={key}
                icon={icon}
                title={title}
                content={unifiedDossier[key]}
                accentColor={accent}
              />
            ))}

            {/* Convergence Map */}
            <ConvergenceMap convergenceMap={unifiedDossier.convergence_map} />

            {/* Final Unified Assessment */}
            {unifiedDossier.final_unified_assessment && (
              <SynthesizedSection
                icon={<CheckCircle2 style={{ width: 15, height: 15, color: '#10b981' }} />}
                title="Final Unified Assessment"
                content={unifiedDossier.final_unified_assessment}
                accentColor="#10b981"
              />
            )}
          </>
        ) : (
          <>
            {/* Legacy fallback — concatenated DSP + Esoteric */}
            {!canSynthesize && (
              <div style={{
                ...glassCard(t), padding: 24, textAlign: 'center',
              }}>
                <Layers style={{ width: 36, height: 36, color: t.muted, margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 14, color: t.text, marginBottom: 6 }}>
                  Synthesis requires both a DSP and an Esoteric Profile
                </p>
                <p style={{ fontSize: 12, color: t.muted }}>
                  {!hasDSP && 'Generate a DSP first. '}
                  {!hasEsoteric && 'Execute CP-012 to create an Esoteric Profile.'}
                </p>
              </div>
            )}

            {canSynthesize && (
              <div style={{
                padding: '14px 18px', borderRadius: 12,
                background: isDark ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.04)',
                border: '1px solid rgba(16,185,129,0.15)',
                fontSize: 12, color: '#10b981', textAlign: 'center',
              }}>
                Both DSP and Esoteric Profile are available. Click "Synthesize Dossier" above to generate an integrated analysis.
                Below is the legacy concatenated view.
              </div>
            )}

            {hasDSP && <DossierDSPSection subject={subject} dsp={dsp} />}
            {hasEsoteric && <DossierEsotericSection esp={esotericProfile} esotericInputs={subject?.esoteric_inputs} />}
          </>
        )}
      </div>
    </div>
  );
}