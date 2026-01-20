import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  ArrowLeft, 
  Lock,
  Loader2,
  FileText,
  Brain,
  GitBranch,
  AlertTriangle,
  Edit3,
  Save,
  CheckCircle2
} from 'lucide-react';
import PersonalityMatrix from '../components/review/PersonalityMatrix';
import ActionResponseMatrix from '../components/review/ActionResponseMatrix';
import MotivationsSection from '../components/review/MotivationsSection';
import { motion } from 'framer-motion';

export default function SubjectReview() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const [isEditing, setIsEditing] = useState(true);
  const [dsp, setDsp] = useState({
    confidence_score: 75,
    executive_summary: '',
    classification: '',
    personality_matrix: {},
    cognitive_map: {},
    action_response_matrix: [],
    motivations: [],
    fears: [],
  });

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
    retry: 1,
  });

  const subject = subjectData?.[0];

  useEffect(() => {
    if (subject?.dsp) {
      setDsp({
        ...dsp,
        ...subject.dsp
      });
    }
  }, [subject]);

  useEffect(() => {
    if (subject?.analysis_results && !subject.dsp?.executive_summary) {
      generateDraftDSP();
    }
  }, [subject?.analysis_results]);

  const generateDraftDSP = async () => {
    if (!subject?.analysis_results) return;

    const analysisContext = JSON.stringify(subject.analysis_results);
    
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Based on the following analysis results for subject "${subject.name}", generate a comprehensive psychological profile draft:

Analysis Results:
${analysisContext}

Generate:
1. Executive Summary (2-3 paragraphs describing the subject's overall psychological profile)
2. Classification (single phrase like "High-Functioning Strategic Thinker" or "Risk-Averse Methodical Planner")
3. Big Five Personality scores (0-100) with brief evidence for each:
   - Openness
   - Conscientiousness  
   - Extraversion
   - Agreeableness
   - Neuroticism
4. 3-5 IF/THEN predictions (e.g., IF confronted with criticism THEN likely to deflect)
5. 3-5 core motivations
6. 3-5 core fears
7. Confidence score (0-100)`,
      response_json_schema: {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          classification: { type: "string" },
          confidence_score: { type: "number" },
          personality_matrix: {
            type: "object",
            properties: {
              openness: { type: "object", properties: { score: { type: "number" }, evidence: { type: "string" } } },
              conscientiousness: { type: "object", properties: { score: { type: "number" }, evidence: { type: "string" } } },
              extraversion: { type: "object", properties: { score: { type: "number" }, evidence: { type: "string" } } },
              agreeableness: { type: "object", properties: { score: { type: "number" }, evidence: { type: "string" } } },
              neuroticism: { type: "object", properties: { score: { type: "number" }, evidence: { type: "string" } } },
            }
          },
          predictions: { type: "array", items: { type: "object", properties: { scenario: { type: "string" }, response: { type: "string" } } } },
          motivations: { type: "array", items: { type: "string" } },
          fears: { type: "array", items: { type: "string" } }
        }
      }
    });

    setDsp({
      confidence_score: response.confidence_score || 75,
      executive_summary: response.executive_summary || '',
      classification: response.classification || '',
      personality_matrix: response.personality_matrix || {},
      cognitive_map: {},
      action_response_matrix: response.predictions || [],
      motivations: response.motivations || [],
      fears: response.fears || [],
    });
  };

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subject', subjectId]);
      queryClient.invalidateQueries(['subjects']);
    },
  });

  const handleSaveDraft = async () => {
    await updateMutation.mutateAsync({ dsp, status: 'review' });
    setIsEditing(false);
  };

  const handleFinalize = async () => {
    await updateMutation.mutateAsync({ dsp, status: 'finalized' });
    navigate(createPageUrl(`DSPReport?id=${subjectId}`));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500">Subject not found</p>
        <Button 
          variant="outline" 
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="mt-4"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(createPageUrl('Dashboard'))}
            className="text-slate-400 hover:text-slate-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-light text-slate-100">
              Review: {subject.name}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              DSP-{subject.id?.slice(-8).toUpperCase()} • Draft Profile
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <Button
              onClick={handleSaveDraft}
              disabled={updateMutation.isPending}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save Draft
            </Button>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <Button
            onClick={handleFinalize}
            disabled={updateMutation.isPending}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2"
          >
            <Lock className="h-4 w-4" />
            Finalize DSP
          </Button>
        </div>
      </div>

      {/* Conflicts Warning */}
      {subject.conflicts_detected?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <span className="font-medium text-rose-400">Review Required: Conflicts Detected</span>
          </div>
          {subject.conflicts_detected.map((conflict, i) => (
            <p key={i} className="text-sm text-rose-300/80 ml-8">{conflict.description}</p>
          ))}
        </motion.div>
      )}

      {/* DSP Content */}
      <div className="space-y-6">
        {/* Confidence & Classification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6">
            <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
              Confidence Score
            </label>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-light text-amber-500">{dsp.confidence_score}%</span>
              {isEditing && (
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={dsp.confidence_score}
                  onChange={(e) => setDsp({ ...dsp, confidence_score: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              )}
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6">
            <label className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
              Classification
            </label>
            {isEditing ? (
              <Input
                value={dsp.classification}
                onChange={(e) => setDsp({ ...dsp, classification: e.target.value })}
                placeholder="e.g., High-Functioning Strategic Thinker"
                className="bg-slate-900/50 border-slate-700 text-slate-200 text-lg font-light"
              />
            ) : (
              <p className="text-xl font-light text-slate-200">{dsp.classification || '—'}</p>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Executive Summary
            </h3>
          </div>
          {isEditing ? (
            <Textarea
              value={dsp.executive_summary}
              onChange={(e) => setDsp({ ...dsp, executive_summary: e.target.value })}
              placeholder="Comprehensive overview of the subject's psychological profile..."
              className="min-h-[200px] bg-slate-900/50 border-slate-700 text-slate-300 leading-relaxed"
            />
          ) : (
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {dsp.executive_summary || 'No summary available'}
            </p>
          )}
        </div>

        {/* Personality Matrix */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Personality Matrix (Big Five)
            </h3>
          </div>
          <PersonalityMatrix
            data={dsp.personality_matrix}
            onChange={(data) => setDsp({ ...dsp, personality_matrix: data })}
            editable={isEditing}
          />
        </div>

        {/* Action/Response Matrix */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Predictive Model (Action/Response Matrix)
            </h3>
          </div>
          <ActionResponseMatrix
            data={dsp.action_response_matrix}
            onChange={(data) => setDsp({ ...dsp, action_response_matrix: data })}
            editable={isEditing}
          />
        </div>

        {/* Motivations & Fears */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider mb-6">
            Core Drivers
          </h3>
          <MotivationsSection
            motivations={dsp.motivations}
            fears={dsp.fears}
            onMotivationsChange={(data) => setDsp({ ...dsp, motivations: data })}
            onFearsChange={(data) => setDsp({ ...dsp, fears: data })}
            editable={isEditing}
          />
        </div>
      </div>
    </div>
  );
}