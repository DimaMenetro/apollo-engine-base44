import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { useAccessory } from '../components/ui/AccessoryContext';
import { ArrowLeft, ArrowRight, Loader2, FileText, Brain, PenTool, Activity, GitBranch, AlertTriangle } from 'lucide-react';
import AnalysisModule from '../components/processing/AnalysisModule';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeModuleEvidence, coverageLabel } from '../lib/evidenceProcessing';
import { mergeAnalysisResults, detectConflicts } from '../lib/analysisMerge';

const analysisModules = [
  { key: 'stylometric_fingerprint', title: 'Module 4.1: Text Logic',       description: 'Extract syntax patterns + word choice',              outputLabel: 'Stylometric Fingerprint', icon: FileText,   color: 'amber',   requiredStream: 'stream_a_text'       },
  { key: 'cognitive_architecture',  title: 'Module 4.2: Cognitive Logic',   description: 'Map reasoning chains + defense mechanisms',          outputLabel: 'Cognitive Architecture',  icon: Brain,      color: 'violet',  requiredStream: 'stream_a_text'       },
  { key: 'psychomotor_state',       title: 'Module 4.3: Graphology Logic',  description: 'Analyze stroke/pressure from handwriting',           outputLabel: 'Psychomotor State',       icon: PenTool,    color: 'cyan',    requiredStream: 'stream_e_analog'     },
  { key: 'affective_state',         title: 'Module 4.4: Bio-Signal Logic',  description: 'Audio pitch/tone + video micro-expressions',         outputLabel: 'Affective State',         icon: Activity,   color: 'rose',    requiredStreams: ['stream_b_audio', 'stream_c_video'] },
  { key: 'behavioral_loop',         title: 'Module 4.5: Agentic Logic',     description: 'Analyze timing of actions + recursive habits',       outputLabel: 'Behavioral Loop',         icon: GitBranch,  color: 'emerald', requiredStream: 'stream_d_behavioral' },
];

export default function Processing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const { startProcessing, updateProgress, finishProcessing } = useAccessory();

  const [moduleStatuses, setModuleStatuses] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModule, setCurrentModule] = useState(0);
  const [errorDetails, setErrorDetails] = useState({});

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId, retry: 1,
  });

  const subject = subjectData?.[0];

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subject', subjectId]);
      queryClient.invalidateQueries(['subjects']);
    },
  });

  const getAnalysisPrompt = (moduleKey, subjectName) => ({
    stylometric_fingerprint: `Analyze the attached text data for subject "${subjectName}". Extract writing style patterns, word choice tendencies, emotional tone, linguistic fingerprint characteristics, and any notable deviations.`,
    cognitive_architecture:  `Analyze the attached content for subject "${subjectName}" to map cognitive patterns: reasoning chains, defense mechanisms, decision-making patterns, and cognitive biases.`,
    psychomotor_state:       `Analyze the attached handwriting sample for subject "${subjectName}": stroke patterns, pressure indicators, baseline stability, slant, letter formation consistency.`,
    affective_state:         `Analyze the attached audio/video for subject "${subjectName}": vocal pitch variations, facial micro-expressions, emotional baseline, congruence between verbal and non-verbal cues.`,
    behavioral_loop:         `Analyze the attached behavioral data for subject "${subjectName}": action timing patterns, recursive habits, decision velocity, behavioral triggers and responses.`,
  }[moduleKey]);

  const runAnalysis = async () => {
    if (!subject) return;
    if (subject.status === 'review' && subject.analysis_results) {
      const confirmed = window.confirm(
        'This subject has already been processed and is pending review. Re-running will replace each module that successfully re-analyzes; modules with no new evidence or a failed refresh keep their existing valid results. Continue?'
      );
      if (!confirmed) return;
    }
    setIsProcessing(true);
    startProcessing(subjectId, subject.name);

    // Fresh results are STAGED in memory. Subject.analysis_results is written
    // exactly once, at the end, so a failed run can never leave the subject with
    // a half-written mixture of module state.
    const fresh = {};
    const failedRefreshes = [];

    for (let i = 0; i < analysisModules.length; i++) {
      const module = analysisModules[i];
      setCurrentModule(i);

      const fileUrls = module.requiredStreams
        ? module.requiredStreams.flatMap(s => subject[s] || [])
        : (subject[module.requiredStream] || []);

      // No applicable evidence — the module is NOT rerun, and its previous valid
      // result (if any) is preserved by the merge rather than deleted.
      if (fileUrls.length === 0) {
        setModuleStatuses(prev => ({ ...prev, [module.key]: subject.analysis_results?.[module.key] ? 'complete' : 'pending' }));
        continue;
      }

      setModuleStatuses(prev => ({ ...prev, [module.key]: 'running' }));

      try {
        updateProgress(module.title, Math.round(((i + 0.5) / analysisModules.length) * 100));

        const { result } = await analyzeModuleEvidence({
          instruction: getAnalysisPrompt(module.key, subject.name),
          fileUrls,
          onStage: (stage) => updateProgress(
            `${module.title} — ${stage}`,
            Math.round(((i + 0.5) / analysisModules.length) * 100)
          ),
        });

        fresh[module.key] = result;
        setAnalysisResults(prev => ({ ...prev, [module.key]: result }));
        setModuleStatuses(prev => ({ ...prev, [module.key]: 'complete' }));
        setErrorDetails(prev => ({ ...prev, [module.key]: null }));
        updateProgress(module.title, Math.round(((i + 1) / analysisModules.length) * 100));
      } catch (error) {
        // Failed refresh: the prior valid result is retained, and the operator is
        // told the refresh failed rather than losing the old knowledge silently.
        failedRefreshes.push(module.key);
        setModuleStatuses(prev => ({ ...prev, [module.key]: 'error' }));
        setErrorDetails(prev => ({ ...prev, [module.key]: error.message || 'Analysis failed' }));
      }
    }

    const { merged, preservedAfterFailure } = mergeAnalysisResults({
      previous: subject.analysis_results,
      fresh,
      failedRefreshes,
    });

    // Conflict detection runs on the FINAL EFFECTIVE set, not just fresh modules.
    const detectedConflicts = detectConflicts(merged);
    setConflicts(detectedConflicts);
    if (detectedConflicts.some(c => c.type === 'deception_flag')) {
      setModuleStatuses(prev => ({ ...prev, affective_state: prev.affective_state === 'complete' ? 'conflict' : prev.affective_state }));
    }

    if (Object.keys(merged).length === 0) {
      setIsProcessing(false);
      alert('No modules completed successfully. Check that your files are valid and try again.');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        analysis_results: merged,
        conflicts_detected: detectedConflicts,
        status: 'review',
      });
    } catch (saveError) {
      setIsProcessing(false);
      alert(`Analysis completed but failed to save: ${saveError.message}. Please try again.`);
      return;
    }

    if (preservedAfterFailure.length > 0) {
      const labels = preservedAfterFailure
        .map(k => analysisModules.find(m => m.key === k)?.outputLabel || k)
        .join(', ');
      alert(`Refresh failed for: ${labels}. The previous valid analysis for these modules was PRESERVED, not deleted. Re-run to retry.`);
    }

    setIsProcessing(false);
    finishProcessing(subjectId);
  };

  const moduleHasData = (module) =>
    module.requiredStreams
      ? module.requiredStreams.some(s => subject?.[s]?.length > 0)
      : subject?.[module.requiredStream]?.length > 0;

  const progress = Object.values(moduleStatuses).filter(s => s === 'complete' || s === 'conflict').length;
  // Counts multi-stream modules (Affective State) too — the old expression only
  // read `requiredStream`, so it under-counted the denominator.
  const totalWithData = analysisModules.filter(m => moduleHasData(m)).length;
  const progressPercent = totalWithData > 0 ? Math.min(100, (progress / totalWithData) * 100) : 0;

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

  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => navigate(createPageUrl('Dashboard'))}
          style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Processing: {subject.name}</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6, fontFamily: 'monospace' }}>DSP-{subject.id?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Progress Card */}
      <div style={{ ...glassCard(t), padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: t.subtitle }}>Analysis Progress</span>
          <span style={{ fontSize: 13, color: '#f59e0b', fontWeight: 500 }}>{Math.round(progressPercent)}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #f59e0b, #d97706)', width: `${progressPercent}%`, transition: 'width 0.5s ease' }} />
        </div>
        {isProcessing && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: 12, color: t.muted, marginTop: 10 }}>
            Running {analysisModules[currentModule]?.title}...
          </motion.p>
        )}
      </div>

      {/* Conflicts */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <AlertTriangle style={{ width: 16, height: 16, color: '#f43f5e' }} />
              <span style={{ fontWeight: 600, color: '#f43f5e', fontSize: 14 }}>Conflicts Detected</span>
            </div>
            {conflicts.map((conflict, i) => (
              <div key={i} style={{ marginLeft: 26 }}>
                <p style={{ fontSize: 13, color: isDark ? '#fda4af' : '#be123c', margin: '0 0 2px' }}>{conflict.description}</p>
                <p style={{ fontSize: 11, color: isDark ? 'rgba(253,164,175,0.6)' : '#9f1239', margin: 0 }}>Resolution: {conflict.resolution}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modules */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
        {analysisModules.map((module) => {
          const hasData = moduleHasData(module);
          const status = !hasData ? 'pending' : moduleStatuses[module.key] || 'pending';
          const error = errorDetails[module.key];
          const fileCount = module.requiredStreams
            ? module.requiredStreams.reduce((sum, s) => sum + (subject[s]?.length || 0), 0)
            : (subject[module.requiredStream]?.length || 0);

          return (
            <div key={module.key}>
              <AnalysisModule
                title={module.title}
                description={module.description}
                outputLabel={module.outputLabel}
                icon={module.icon}
                color={module.color}
                status={status}
                result={analysisResults[module.key]}
                moduleKey={module.key}
              />
              {error && status === 'error' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: 6, padding: 12, borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}>
                  <p style={{ fontSize: 12, color: '#f43f5e', margin: '0 0 2px' }}>Error: {error}</p>
                  <p style={{ fontSize: 11, color: t.muted, margin: 0 }}>Files: {fileCount}</p>
                </motion.div>
              )}
              {analysisResults[module.key]?.preprocessing_info && status === 'complete' && (() => {
                const cov = analysisResults[module.key].evidence_coverage;
                const incomplete = cov && (cov.failed_count > 0 || cov.unsupported_count > 0);
                const tint = incomplete ? '244,63,94' : '16,185,129';
                const color = incomplete ? '#f43f5e' : '#10b981';
                return (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 6, padding: 12, borderRadius: 10, background: `rgba(${tint},0.08)`, border: `1px solid rgba(${tint},0.20)` }}>
                    {cov && (
                      <p style={{ fontSize: 12, color, margin: '0 0 4px', fontWeight: 600 }}>
                        {coverageLabel(cov)}{cov.batches_run > 1 ? ` · ${cov.batches_run} batches synthesized` : ''}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: t.muted, margin: 0, lineHeight: 1.5 }}>{analysisResults[module.key].preprocessing_info}</p>
                  </motion.div>
                );
              })()}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={() => navigate(createPageUrl(`SubjectIntake?id=${subjectId}`))}
          style={{ ...glassBtnSecondary(t), padding: '10px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          Edit Data
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {subject.status === 'review' && (
            <button
              onClick={() => navigate(createPageUrl(`SubjectReview?id=${subjectId}`))}
              style={{ ...glassBtnSecondary(t), padding: '10px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Review DSP Draft <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          )}
          <button
            onClick={runAnalysis}
            disabled={isProcessing}
            style={{ ...glassBtn(t), padding: '10px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: isProcessing ? 0.7 : 1 }}
          >
            {isProcessing ? (
              <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Processing...</>
            ) : (
              <><Activity style={{ width: 15, height: 15 }} />Run Analysis</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}