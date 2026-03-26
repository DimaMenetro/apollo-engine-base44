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

  const preprocessFiles = async (fileUrls, moduleKey) => {
    const info = [];
    const processedUrls = [];
    let enhancedPrompt = null;

    for (const url of fileUrls.slice(0, 3)) {
      const fileName = url.split('/').pop().toLowerCase();
      const ext = fileName.split('.').pop();

      if (ext === 'xlsx') {
        try {
          const csvData = await base44.integrations.Core.InvokeLLM({
            prompt: `Convert this XLSX file to CSV format. Extract the first sheet. Return ONLY the CSV data with comma-separated values, no explanation.`,
            file_urls: [url],
          });
          info.push(`XLSX converted to CSV: ${fileName}`);
          enhancedPrompt = (enhancedPrompt || '') + `\n\nBehavioral data from ${fileName} (converted from XLSX):\n${csvData}`;
        } catch (error) {
          info.push(`XLSX conversion failed for ${fileName}.`);
          throw new Error(`XLSX conversion failed: ${fileName}`);
        }
        continue;
      }

      if (['m4a', 'mp3', 'wav', 'mp4', 'mov'].includes(ext)) {
        try {
          const acousticAnalysis = await base44.functions.invoke('analyzeAudio', { file_url: url });
          const humeData = acousticAnalysis.data?.predictions ?? acousticAnalysis.data;
          const transcript = acousticAnalysis.data?.transcript || null;
          if (transcript) {
            info.push(`${ext.toUpperCase()} processed: prosody analyzed + transcript generated via AssemblyAI for ${fileName}`);
          } else {
            info.push(`${ext.toUpperCase()} processed: prosody analyzed, transcript unavailable for ${fileName}`);
          }
          const mediaType = (ext === 'mp4' || ext === 'mov') ? 'Video' : 'Audio';
          enhancedPrompt = (enhancedPrompt || '') + `\n\n${mediaType} analysis for ${fileName}:\nEmotion Data: ${JSON.stringify(humeData)}\n${transcript ? `Verbatim Transcript: ${transcript}` : 'Transcript: unavailable'}`;
        } catch (error) {
          info.push(`${ext.toUpperCase()} processing failed for ${fileName}: ${error.message}`);
          throw new Error(`${ext === 'mp4' || ext === 'mov' ? 'Video' : 'Audio'} processing failed: ${fileName}`);
        }
        continue;
      }

      if (['csv', 'pdf', 'png', 'jpg', 'jpeg', 'txt', 'md'].includes(ext)) {
        processedUrls.push(url);
        info.push(`${ext.toUpperCase()} processed: ${fileName}`);
        continue;
      }

      info.push(`Unsupported format: ${fileName} (${ext}).`);
    }

    return { fileUrls: processedUrls, prompt: enhancedPrompt, info: info.join(' | ') };
  };

  const getAnalysisPrompt = (moduleKey, subjectName) => ({
    stylometric_fingerprint: `Analyze the attached text data for subject "${subjectName}". Extract writing style patterns, word choice tendencies, emotional tone, linguistic fingerprint characteristics, and any notable deviations.`,
    cognitive_architecture:  `Analyze the attached content for subject "${subjectName}" to map cognitive patterns: reasoning chains, defense mechanisms, decision-making patterns, and cognitive biases.`,
    psychomotor_state:       `Analyze the attached handwriting sample for subject "${subjectName}": stroke patterns, pressure indicators, baseline stability, slant, letter formation consistency.`,
    affective_state:         `Analyze the attached audio/video for subject "${subjectName}": vocal pitch variations, facial micro-expressions, emotional baseline, congruence between verbal and non-verbal cues.`,
    behavioral_loop:         `Analyze the attached behavioral data for subject "${subjectName}": action timing patterns, recursive habits, decision velocity, behavioral triggers and responses.`,
  }[moduleKey]);

  const runAnalysis = async () => {
    if (!subject) return;
    setIsProcessing(true);
    startProcessing(subjectId, subject.name);
    const results = {};
    const detectedConflicts = [];

    for (let i = 0; i < analysisModules.length; i++) {
      const module = analysisModules[i];
      setCurrentModule(i);
      const hasData = module.requiredStreams
        ? module.requiredStreams.some(s => subject[s]?.length > 0)
        : subject[module.requiredStream]?.length > 0;

      if (!hasData) { setModuleStatuses(prev => ({ ...prev, [module.key]: 'pending' })); continue; }

      setModuleStatuses(prev => ({ ...prev, [module.key]: 'running' }));

      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateProgress(module.title, Math.round(((i + 0.5) / analysisModules.length) * 100));

        const fileUrls = module.requiredStreams
          ? module.requiredStreams.flatMap(s => subject[s] || [])
          : (subject[module.requiredStream] || []);
        const preprocessedData = await preprocessFiles(fileUrls, module.key);
        const prompt = getAnalysisPrompt(module.key, subject.name);

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: preprocessedData.prompt || prompt,
          file_urls: preprocessedData.fileUrls,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              key_patterns: { type: "array", items: { type: "string" } },
              indicators: { type: "array", items: { type: "string" } },
              confidence: { type: "number" },
              flags: { type: "array", items: { type: "string" } },
              processing_notes: { type: "string" }
            }
          }
        });

        results[module.key] = { ...response, preprocessing_info: preprocessedData.info };
        setAnalysisResults(prev => ({ ...prev, [module.key]: results[module.key] }));
        setModuleStatuses(prev => ({ ...prev, [module.key]: 'complete' }));
        setErrorDetails(prev => ({ ...prev, [module.key]: null }));
        updateProgress(module.title, Math.round(((i + 1) / analysisModules.length) * 100));
      } catch (error) {
        setModuleStatuses(prev => ({ ...prev, [module.key]: 'error' }));
        setErrorDetails(prev => ({ ...prev, [module.key]: error.message || 'Analysis failed' }));
      }
    }

    if (results.stylometric_fingerprint && results.behavioral_loop) {
      const textFlags = results.stylometric_fingerprint?.flags || [];
      const behaviorFlags = results.behavioral_loop?.flags || [];
      if (textFlags.some(f => f.toLowerCase().includes('positive')) && behaviorFlags.some(f => f.toLowerCase().includes('negative'))) {
        detectedConflicts.push({ type: 'text_behavior_mismatch', description: 'Words conflict with Actions - prioritizing behavioral analysis', resolution: 'Actions prioritized over stated intentions' });
      }
    }

    if (results.stylometric_fingerprint && results.affective_state) {
      const textConf = results.stylometric_fingerprint?.confidence || 0;
      const affectConf = results.affective_state?.confidence || 0;
      if (Math.abs(textConf - affectConf) > 30) {
        detectedConflicts.push({ type: 'deception_flag', description: 'High Prob Deception - Bio-Signal conflicts with Text', resolution: 'Flagged for manual review' });
        setModuleStatuses(prev => ({ ...prev, affective_state: 'conflict' }));
      }
    }

    setConflicts(detectedConflicts);
    await updateMutation.mutateAsync({ analysis_results: results, conflicts_detected: detectedConflicts, status: 'review' });
    setIsProcessing(false);
    finishProcessing(subjectId);
  };

  const progress = Object.values(moduleStatuses).filter(s => s === 'complete' || s === 'conflict').length;
  const totalWithData = analysisModules.filter(m => subject?.[m.requiredStream]?.length > 0).length;
  const progressPercent = totalWithData > 0 ? (progress / totalWithData) * 100 : 0;

  const moduleHasData = (module) =>
    module.requiredStreams
      ? module.requiredStreams.some(s => subject?.[s]?.length > 0)
      : subject?.[module.requiredStream]?.length > 0;

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
              {analysisResults[module.key]?.preprocessing_info && status === 'complete' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: 6, padding: 12, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}>
                  <p style={{ fontSize: 12, color: '#10b981', margin: 0 }}>{analysisResults[module.key].preprocessing_info}</p>
                </motion.div>
              )}
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

        {subject.status === 'review' ? (
          <button
            onClick={() => navigate(createPageUrl(`SubjectReview?id=${subjectId}`))}
            style={{ ...glassBtn(t), padding: '10px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Review DSP Draft <ArrowRight style={{ width: 15, height: 15 }} />
          </button>
        ) : (
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
        )}
      </div>
    </div>
  );
}