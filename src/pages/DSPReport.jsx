import React, { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Loader2,
  FileText,
  Brain,
  GitBranch,
  Target,
  Shield,
  Download,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';
import PersonalityMatrix from '../components/review/PersonalityMatrix';
import ActionResponseMatrix from '../components/review/ActionResponseMatrix';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function DSPReport() {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
  });

  const subject = subjectData?.[0];
  const dsp = subject?.dsp || {};

  const getConfidenceColor = (score) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (score >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
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
              Definitive Subject Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {subject.name}
            </p>
          </div>
        </div>
        
        <Button
          variant="outline"
          className="border-slate-700 text-slate-300 hover:bg-slate-800"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* Header Card */}
        <div className="glass-panel rounded-2xl p-6 border-t-2 border-amber-500/50">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 gap-1">
                  <Lock className="h-3 w-3" />
                  FINALIZED
                </Badge>
                <Badge variant="outline" className="border-slate-700 text-slate-400 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  VERIFIED
                </Badge>
              </div>
              
              <h2 className="text-3xl font-light text-slate-100 mb-2">
                {subject.name}
              </h2>
              
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="font-mono">DSP-{subject.id?.slice(-8).toUpperCase()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(subject.updated_date || subject.created_date), 'PPP')}
                </span>
              </div>
            </div>
            
            <div className={cn(
              "px-6 py-4 rounded-xl border text-center min-w-[140px]",
              getConfidenceColor(dsp.confidence_score || 0)
            )}>
              <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Confidence</p>
              <p className="text-3xl font-light">{dsp.confidence_score || 0}%</p>
            </div>
          </div>
          
          {dsp.classification && (
            <div className="mt-6 pt-6 border-t border-slate-800">
              <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">Classification</p>
              <p className="text-xl font-light text-amber-400">{dsp.classification}</p>
            </div>
          )}
        </div>

        {/* Executive Summary */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-amber-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Executive Summary
            </h3>
          </div>
          <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
            {dsp.executive_summary || 'No summary available'}
          </p>
        </div>

        {/* Personality Matrix */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="h-4 w-4 text-violet-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Personality Matrix
            </h3>
          </div>
          <PersonalityMatrix data={dsp.personality_matrix} editable={false} />
        </div>

        {/* Predictive Model */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <GitBranch className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
              Predictive Model
            </h3>
          </div>
          <ActionResponseMatrix data={dsp.action_response_matrix || []} editable={false} />
        </div>

        {/* Motivations & Fears */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
                Core Motivations
              </h3>
            </div>
            <div className="space-y-2">
              {dsp.motivations?.length > 0 ? (
                dsp.motivations.map((item, i) => (
                  <div 
                    key={i}
                    className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm text-emerald-300"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No motivations identified</p>
              )}
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-rose-500" />
              <h3 className="text-sm font-medium text-slate-200 uppercase tracking-wider">
                Core Fears
              </h3>
            </div>
            <div className="space-y-2">
              {dsp.fears?.length > 0 ? (
                dsp.fears.map((item, i) => (
                  <div 
                    key={i}
                    className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-sm text-rose-300"
                  >
                    {item}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No fears identified</p>
              )}
            </div>
          </div>
        </div>

        {/* Conflicts */}
        {subject.conflicts_detected?.length > 0 && (
          <div className="glass-panel rounded-2xl p-6 border border-rose-500/30">
            <h3 className="text-sm font-medium text-rose-400 uppercase tracking-wider mb-4">
              Analysis Conflicts
            </h3>
            <div className="space-y-3">
              {subject.conflicts_detected.map((conflict, i) => (
                <div key={i} className="p-3 bg-rose-500/10 rounded-lg">
                  <p className="text-sm text-rose-300">{conflict.description}</p>
                  <p className="text-xs text-rose-400/60 mt-1">Resolution: {conflict.resolution}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-slate-800">
          <p className="text-xs text-slate-600 uppercase tracking-wider">
            Apollo Profiling Engine • Definitive Subject Profile
          </p>
          <p className="text-xs text-slate-700 mt-1">
            Generated {format(new Date(), 'PPP')}
          </p>
        </div>
      </div>
    </div>
  );
}