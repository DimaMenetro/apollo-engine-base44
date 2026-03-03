import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { ArrowLeft, Lock, Loader2, FileText, Brain, GitBranch, AlertTriangle, Edit3, Save, CheckCircle2 } from 'lucide-react';
import PersonalityMatrix from '../components/review/PersonalityMatrix';
import ActionResponseMatrix from '../components/review/ActionResponseMatrix';
import MotivationsSection from '../components/review/MotivationsSection';
import DataStreamUploader from '../components/intake/DataStreamUploader';
import { motion } from 'framer-motion';
import { formatDocumentId } from '../components/utils/formatDocumentId';

export default function SubjectReview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const [isEditing, setIsEditing] = useState(true);
  const [dsp, setDsp] = useState({
    document_id: '', protocol_version: 'CP-003-O-D-APL v2.1', date_of_synthesis: '',
    confidence_score: 75, executive_summary: '', classification: '',
    personality_matrix: {}, cognitive_architecture: { thinking_style: '', epistemic_requirements: '', defense_mechanisms: '' },
    behavioral_patterns: [], cognitive_map: {}, action_response_matrix: [], motivations: [], fears: [],
  });

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId, retry: 1,
  });

  const subject = subjectData?.[0];

  useEffect(() => {
    if (subject?.dsp) setDsp(prev => ({ ...prev, ...subject.dsp }));
  }, [subject]);

  useEffect(() => {
    if (subject?.analysis_results && !subject.dsp?.executive_summary) generateDraftDSP();
  }, [subject?.analysis_results]);

  const generateDraftDSP = async () => {
    if (!subject?.analysis_results) return;
    const analysisContext = JSON.stringify(subject.analysis_results);
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on the following analysis results for subject "${subject.name}", generate a comprehensive psychological profile draft:\n\nAnalysis Results:\n${analysisContext}\n\nGenerate: executive summary, classification, Big Five personality scores, cognitive architecture, behavioral patterns, behavioral predictions, motivations, fears, confidence score.`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" }, classification: { type: "string" }, confidence_score: { type: "number" },
          personality_matrix: { type: "object", properties: { openness: { type: "object" }, conscientiousness: { type: "object" }, extraversion: { type: "object" }, agreeableness: { type: "object" }, neuroticism: { type: "object" } } },
          cognitive_architecture: { type: "object", properties: { thinking_style: { type: "string" }, epistemic_requirements: { type: "string" }, defense_mechanisms: { type: "string" } } },
          behavioral_patterns: { type: "array", items: { type: "object", properties: { label: { type: "string" }, description: { type: "string" }, context: { type: "string" } } } },
          predictions: { type: "array", items: { type: "object", properties: { trigger: { type: "string" }, context: { type: "string" }, predicted_behavior: { type: "string" }, probability: { type: "number" }, confidence_interval: { type: "object", properties: { lower: { type: "number" }, upper: { type: "number" } } }, temporal_factors: { type: "string" } } } },
          motivations: { type: "array", items: { type: "string" } },
          fears: { type: "array", items: { type: "string" } }
        }
      }
    });

    const today = new Date().toISOString().split('T')[0];
    setDsp({
      document_id: `DSP-${subject.id?.slice(-6) || '000'}-CP-003-APL`,
      protocol_version: 'CP-003-O-D-APL v2.1',
      date_of_synthesis: today,
      confidence_score: response.confidence_score || 75,
      executive_summary: response.executive_summary || '',
      classification: response.classification || '',
      personality_matrix: response.personality_matrix || {},
      cognitive_architecture: response.cognitive_architecture || { thinking_style: '', epistemic_requirements: '', defense_mechanisms: '' },
      behavioral_patterns: response.behavioral_patterns || [],
      cognitive_map: {},
      action_response_matrix: response.predictions || [],
      motivations: response.motivations || [],
      fears: response.fears || [],
    });
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => { queryClient.invalidateQueries(['subject', subjectId]); queryClient.invalidateQueries(['subjects']); },
  });

  const handleSaveDraft = async () => {
    await updateMutation.mutateAsync({ dsp, status: 'review' });
    setIsEditing(false);
  };

  const handleFinalize = async () => {
    await updateMutation.mutateAsync({ dsp, status: 'finalized' });
    navigate(createPageUrl(`DSPReport?id=${subjectId}`));
  };

  const handleStreamFilesChange = (streamKey, newFiles) => {
    updateMutation.mutate({ [streamKey]: newFiles });
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
        <button onClick={() => navigate(createPageUrl('Dashboard'))} style={{ ...glassBtnSecondary(t), padding: '10px 24px', fontSize: 14 }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const textareaStyle = {
    width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 14, lineHeight: 1.6,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
    color: t.title, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const inputStyle = {
    width: '100%', borderRadius: 10, padding: '10px 14px', fontSize: 14,
    background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.09)'}`,
    color: t.title, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };

  const labelStyle = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, display: 'block', marginBottom: 8 };
  const sectionCard = { ...glassCard(t), padding: 24 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Review: {subject.name}</h1>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 6, fontFamily: 'monospace' }}>
              {formatDocumentId(dsp.document_id || `DSP-${subject.id?.slice(-6) || '000'}-CP-003-APL`)} • Draft Profile
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {isEditing ? (
            <button
              onClick={handleSaveDraft}
              disabled={updateMutation.isPending}
              style={{ ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
            >
              {updateMutation.isPending ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 14, height: 14 }} />}
              Save Draft
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{ ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
            >
              <Edit3 style={{ width: 14, height: 14 }} /> Edit
            </button>
          )}
          <button
            onClick={handleFinalize}
            disabled={updateMutation.isPending}
            style={{ ...glassBtn(t), padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}
          >
            <Lock style={{ width: 14, height: 14 }} /> Finalize DSP
          </button>
        </div>
      </div>

      {/* Conflicts */}
      {subject.conflicts_detected?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20, padding: 16, borderRadius: 14, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <AlertTriangle style={{ width: 16, height: 16, color: '#f43f5e' }} />
            <span style={{ fontWeight: 600, color: '#f43f5e', fontSize: 14 }}>Review Required: Conflicts Detected</span>
          </div>
          {subject.conflicts_detected.map((c, i) => (
            <p key={i} style={{ fontSize: 13, color: isDark ? '#fda4af' : '#be123c', marginLeft: 26, margin: '0 0 2px 26px' }}>{c.description}</p>
          ))}
        </motion.div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Confidence + Classification */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={sectionCard}>
            <label style={labelStyle}>Confidence Score</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 36, fontWeight: 300, color: '#f59e0b' }}>{dsp.confidence_score}%</span>
              {isEditing && (
                <input type="range" min="0" max="100" value={dsp.confidence_score}
                  onChange={(e) => setDsp({ ...dsp, confidence_score: parseInt(e.target.value) })}
                  style={{ flex: 1, accentColor: '#f59e0b' }}
                />
              )}
            </div>
          </div>
          <div style={sectionCard}>
            <label style={labelStyle}>Classification</label>
            {isEditing ? (
              <input value={dsp.classification} onChange={(e) => setDsp({ ...dsp, classification: e.target.value })}
                placeholder="e.g., High-Functioning Strategic Thinker" style={inputStyle} />
            ) : (
              <p style={{ fontSize: 18, fontWeight: 300, color: t.title, margin: 0 }}>{dsp.classification || '—'}</p>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FileText style={{ width: 15, height: 15, color: '#f59e0b' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>Executive Summary</h3>
          </div>
          {isEditing ? (
            <textarea value={dsp.executive_summary} onChange={(e) => setDsp({ ...dsp, executive_summary: e.target.value })}
              placeholder="Comprehensive overview of the subject's psychological profile..."
              style={{ ...textareaStyle, minHeight: 180 }} />
          ) : (
            <p style={{ color: t.text, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0 }}>{dsp.executive_summary || 'No summary available'}</p>
          )}
        </div>

        {/* Personality Matrix */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>Personality Matrix (Big Five)</h3>
          </div>
          <PersonalityMatrix data={dsp.personality_matrix} onChange={(data) => setDsp({ ...dsp, personality_matrix: data })} editable={isEditing} />
        </div>

        {/* Predictive Model */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>Predictive Model (Action/Response Matrix)</h3>
          </div>
          <ActionResponseMatrix data={dsp.action_response_matrix} onChange={(data) => setDsp({ ...dsp, action_response_matrix: data })} editable={isEditing} />
        </div>

        {/* Cognitive Architecture */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <Brain style={{ width: 15, height: 15, color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>Cognitive Architecture</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[['thinking_style', 'Thinking Style', 'How the subject processes information...'], ['epistemic_requirements', 'Epistemic Requirements', 'What the subject needs to know...'], ['defense_mechanisms', 'Defense Mechanisms', 'Identified mechanisms (e.g., DARVO, Splitting)...']].map(([key, label, placeholder]) => (
              <div key={key}>
                <label style={labelStyle}>{label}</label>
                {isEditing ? (
                  <textarea value={dsp.cognitive_architecture?.[key] || ''}
                    onChange={(e) => setDsp({ ...dsp, cognitive_architecture: { ...dsp.cognitive_architecture, [key]: e.target.value } })}
                    placeholder={placeholder} style={{ ...textareaStyle, minHeight: 80 }} />
                ) : (
                  <p style={{ color: t.text, lineHeight: 1.7, margin: 0 }}>{dsp.cognitive_architecture?.[key] || 'Not analyzed'}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Behavioral Patterns */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <GitBranch style={{ width: 15, height: 15, color: '#10b981' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>Behavioral Patterns</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {dsp.behavioral_patterns?.map((pattern, index) => (
              <div key={index} style={{ padding: 16, borderRadius: 12, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}` }}>
                {[['label', 'Pattern Label', false], ['description', 'Description', true], ['context', 'Context / Frequency', false]].map(([field, lbl, isArea]) => (
                  <div key={field} style={{ marginBottom: field !== 'context' ? 10 : 0 }}>
                    <label style={labelStyle}>{lbl}</label>
                    {isEditing ? (
                      isArea ? (
                        <textarea value={pattern[field] || ''} onChange={(e) => { const updated = [...dsp.behavioral_patterns]; updated[index] = { ...pattern, [field]: e.target.value }; setDsp({ ...dsp, behavioral_patterns: updated }); }}
                          style={{ ...textareaStyle, minHeight: 60 }} />
                      ) : (
                        <input value={pattern[field] || ''} onChange={(e) => { const updated = [...dsp.behavioral_patterns]; updated[index] = { ...pattern, [field]: e.target.value }; setDsp({ ...dsp, behavioral_patterns: updated }); }}
                          style={inputStyle} />
                      )
                    ) : (
                      <p style={{ color: field === 'label' ? t.accent : field === 'context' ? t.muted : t.text, fontSize: field === 'context' ? 12 : 14, margin: 0 }}>{pattern[field]}</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => setDsp({ ...dsp, behavioral_patterns: [...(dsp.behavioral_patterns || []), { label: '', description: '', context: '' }] })}
                style={{ ...glassBtnSecondary(t), padding: '9px 16px', fontSize: 13, width: '100%', justifyContent: 'center' }}
              >
                Add Pattern
              </button>
            )}
            {!isEditing && (!dsp.behavioral_patterns || dsp.behavioral_patterns.length === 0) && (
              <p style={{ fontSize: 13, color: t.muted, textAlign: 'center', padding: '16px 0' }}>No patterns documented</p>
            )}
          </div>
        </div>

        {/* Motivations & Fears */}
        <div style={sectionCard}>
          <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: '0 0 20px' }}>Core Drivers</h3>
          <MotivationsSection
            motivations={dsp.motivations} fears={dsp.fears}
            onMotivationsChange={(data) => setDsp({ ...dsp, motivations: data })}
            onFearsChange={(data) => setDsp({ ...dsp, fears: data })}
            editable={isEditing}
          />
        </div>

        {/* Additional Evidence */}
        {isEditing && (
          <div style={sectionCard}>
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: '0 0 20px' }}>Additional Evidence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {['stream_a_text', 'stream_b_audio', 'stream_c_video', 'stream_d_behavioral', 'stream_e_analog'].map(streamKey => (
                <DataStreamUploader key={streamKey} streamKey={streamKey} files={subject[streamKey] || []}
                  onFilesChange={(files) => handleStreamFilesChange(streamKey, files)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}