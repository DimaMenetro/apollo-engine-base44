import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  FileText,
  Brain,
  PenTool,
  Activity,
  GitBranch,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import AnalysisModule from '../components/processing/AnalysisModule';
import { motion, AnimatePresence } from 'framer-motion';

const analysisModules = [
  {
    key: 'stylometric_fingerprint',
    title: 'Module 4.1: Text Logic',
    description: 'Extract syntax patterns + word choice',
    outputLabel: 'Stylometric Fingerprint',
    icon: FileText,
    color: 'amber',
    requiredStream: 'stream_a_text',
  },
  {
    key: 'cognitive_architecture',
    title: 'Module 4.2: Cognitive Logic',
    description: 'Map reasoning chains + defense mechanisms',
    outputLabel: 'Cognitive Architecture',
    icon: Brain,
    color: 'violet',
    requiredStream: 'stream_a_text',
  },
  {
    key: 'psychomotor_state',
    title: 'Module 4.3: Graphology Logic',
    description: 'Analyze stroke/pressure from handwriting',
    outputLabel: 'Psychomotor State',
    icon: PenTool,
    color: 'cyan',
    requiredStream: 'stream_e_analog',
  },
  {
    key: 'affective_state',
    title: 'Module 4.4: Bio-Signal Logic',
    description: 'Audio pitch/tone + video micro-expressions',
    outputLabel: 'Affective State',
    icon: Activity,
    color: 'rose',
    requiredStream: 'stream_b_audio',
  },
  {
    key: 'behavioral_loop',
    title: 'Module 4.5: Agentic Logic',
    description: 'Analyze timing of actions + recursive habits',
    outputLabel: 'Behavioral Loop',
    icon: GitBranch,
    color: 'emerald',
    requiredStream: 'stream_d_behavioral',
  },
];

export default function Processing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const [moduleStatuses, setModuleStatuses] = useState({});
  const [analysisResults, setAnalysisResults] = useState({});
  const [conflicts, setConflicts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentModule, setCurrentModule] = useState(0);

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
  });

  const subject = subjectData?.[0];

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subject', subjectId]);
      queryClient.invalidateQueries(['subjects']);
    },
  });

  const runAnalysis = async () => {
    if (!subject) return;
    
    setIsProcessing(true);
    const results = {};
    const detectedConflicts = [];

    for (let i = 0; i < analysisModules.length; i++) {
      const module = analysisModules[i];
      setCurrentModule(i);
      
      // Check if required stream has data
      const hasData = subject[module.requiredStream]?.length > 0;
      
      if (!hasData) {
        setModuleStatuses(prev => ({ ...prev, [module.key]: 'pending' }));
        continue;
      }

      setModuleStatuses(prev => ({ ...prev, [module.key]: 'running' }));
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Run LLM analysis
      const fileUrls = subject[module.requiredStream] || [];
      
      const prompt = getAnalysisPrompt(module.key, subject.name);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: fileUrls.slice(0, 3), // Limit files
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_patterns: { type: "array", items: { type: "string" } },
            indicators: { type: "array", items: { type: "string" } },
            confidence: { type: "number" },
            flags: { type: "array", items: { type: "string" } }
          }
        }
      });

      results[module.key] = response;
      setAnalysisResults(prev => ({ ...prev, [module.key]: response }));
      setModuleStatuses(prev => ({ ...prev, [module.key]: 'complete' }));
    }

    // Check for conflicts between modules
    if (results.stylometric_fingerprint && results.behavioral_loop) {
      // Check if text sentiment conflicts with behavioral patterns
      const textFlags = results.stylometric_fingerprint?.flags || [];
      const behaviorFlags = results.behavioral_loop?.flags || [];
      
      if (textFlags.some(f => f.toLowerCase().includes('positive')) && 
          behaviorFlags.some(f => f.toLowerCase().includes('negative'))) {
        detectedConflicts.push({
          type: 'text_behavior_mismatch',
          description: 'Words conflict with Actions - prioritizing behavioral analysis',
          resolution: 'Actions prioritized over stated intentions'
        });
      }
    }

    if (results.stylometric_fingerprint && results.affective_state) {
      // Check for deception indicators
      const textConf = results.stylometric_fingerprint?.confidence || 0;
      const affectConf = results.affective_state?.confidence || 0;
      
      if (Math.abs(textConf - affectConf) > 30) {
        detectedConflicts.push({
          type: 'deception_flag',
          description: 'High Prob Deception - Bio-Signal conflicts with Text',
          resolution: 'Flagged for manual review'
        });
        setModuleStatuses(prev => ({ ...prev, affective_state: 'conflict' }));
      }
    }

    setConflicts(detectedConflicts);
    
    // Save results to subject
    await updateMutation.mutateAsync({
      analysis_results: results,
      conflicts_detected: detectedConflicts,
      status: 'review'
    });

    setIsProcessing(false);
  };

  const getAnalysisPrompt = (moduleKey, subjectName) => {
    const prompts = {
      stylometric_fingerprint: `Analyze the attached text data for subject "${subjectName}". Extract:
- Writing style patterns (sentence length, vocabulary complexity, formality)
- Word choice tendencies and emotional tone
- Linguistic fingerprint characteristics
- Any notable deviations or inconsistencies`,
      
      cognitive_architecture: `Analyze the attached content for subject "${subjectName}" to map cognitive patterns:
- Reasoning chains and logical flow
- Defense mechanisms (projection, rationalization, deflection)
- Decision-making patterns
- Cognitive biases present`,
      
      psychomotor_state: `Analyze the attached handwriting sample for subject "${subjectName}":
- Stroke patterns and pressure indicators
- Baseline stability and slant
- Letter formation consistency
- Psychomotor state indicators`,
      
      affective_state: `Analyze the attached audio/video for subject "${subjectName}":
- Vocal pitch variations and tone
- Micro-expression indicators
- Emotional baseline assessment
- Congruence between verbal and non-verbal cues`,
      
      behavioral_loop: `Analyze the attached behavioral data for subject "${subjectName}":
- Action timing patterns
- Recursive habits and routines
- Decision velocity
- Behavioral triggers and responses`
    };
    
    return prompts[moduleKey];
  };

  const progress = Object.values(moduleStatuses).filter(s => s === 'complete' || s === 'conflict').length;
  const totalWithData = analysisModules.filter(m => subject?.[m.requiredStream]?.length > 0).length;
  const progressPercent = totalWithData > 0 ? (progress / totalWithData) * 100 : 0;

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
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-light text-slate-100">
            Processing: {subject.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            DSP-{subject.id?.slice(-8).toUpperCase()}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="glass-panel rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Analysis Progress</span>
          <span className="text-sm text-amber-500">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-slate-800" />
        
        {isProcessing && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-slate-500 mt-3"
          >
            Running {analysisModules[currentModule]?.title}...
          </motion.p>
        )}
      </div>

      {/* Conflicts Alert */}
      <AnimatePresence>
        {conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <span className="font-medium text-rose-400">Conflicts Detected</span>
            </div>
            {conflicts.map((conflict, i) => (
              <div key={i} className="text-sm text-rose-300/80 ml-8">
                <p>{conflict.description}</p>
                <p className="text-rose-400/60 text-xs mt-1">Resolution: {conflict.resolution}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Modules */}
      <div className="space-y-4 mb-8">
        {analysisModules.map((module) => {
          const hasData = subject[module.requiredStream]?.length > 0;
          return (
            <AnalysisModule
              key={module.key}
              title={module.title}
              description={module.description}
              outputLabel={module.outputLabel}
              icon={module.icon}
              color={module.color}
              status={!hasData ? 'pending' : moduleStatuses[module.key] || 'pending'}
              result={analysisResults[module.key]}
            />
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate(createPageUrl(`SubjectIntake?id=${subjectId}`))}
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Edit Data
        </Button>
        
        {subject.status === 'review' ? (
          <Button
            onClick={() => navigate(createPageUrl(`SubjectReview?id=${subjectId}`))}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2"
          >
            Review DSP Draft <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={runAnalysis}
            disabled={isProcessing}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Activity className="h-4 w-4" />
                Run Analysis
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}