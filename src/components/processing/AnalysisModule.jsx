import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Loader2, 
  Circle,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionRadarChart from '../visualizations/EmotionRadarChart';

const statusConfig = {
  pending: { icon: Circle, color: 'text-slate-600', bg: 'bg-slate-600/20' },
  running: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/20', spin: true },
  complete: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  conflict: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/20' },
  error: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/20' },
};

export default function AnalysisModule({ 
  title, 
  description, 
  outputLabel,
  status = 'pending',
  result,
  icon: Icon,
  color = 'amber',
  moduleKey
}) {
  const [expanded, setExpanded] = useState(false);
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;

  const colorClasses = {
    amber: 'border-amber-500/30',
    violet: 'border-violet-500/30',
    rose: 'border-rose-500/30',
    emerald: 'border-emerald-500/30',
    cyan: 'border-cyan-500/30',
  };

  const iconColors = {
    amber: 'text-amber-500 bg-amber-500/10',
    violet: 'text-violet-500 bg-violet-500/10',
    rose: 'text-rose-500 bg-rose-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    cyan: 'text-cyan-500 bg-cyan-500/10',
  };

  // Extract emotion data for radar chart (affective_state module)
  const getEmotionData = () => {
    if (moduleKey !== 'affective_state' || !result) return null;
    
    // Parse emotion data from Hume.ai results
    try {
      const indicators = result.indicators || [];
      return indicators
        .filter(ind => ind.includes(':'))
        .map(ind => {
          const [name, scoreStr] = ind.split(':');
          return { 
            name: name.trim().toLowerCase(), 
            score: parseFloat(scoreStr) || 0 
          };
        })
        .filter(e => e.score > 0);
    } catch {
      return null;
    }
  };

  const emotionData = getEmotionData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel rounded-3xl p-5 border-l-2 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5",
        colorClasses[color],
        status === 'running' && 'glow-amber'
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-2.5 rounded-lg", iconColors[color])}>
          <Icon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-medium text-slate-200">{title}</h3>
            <div className={cn("flex items-center gap-2 text-xs", statusInfo.color)}>
              <StatusIcon className={cn("h-4 w-4", statusInfo.spin && "animate-spin")} />
              <span className="capitalize">{status}</span>
            </div>
          </div>
          
          <p className="text-sm text-slate-500 mb-3">{description}</p>
          
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm",
            statusInfo.bg
          )}>
            <span className="text-slate-400">Output: </span>
            <span className={cn(
              "font-medium",
              status === 'complete' ? 'text-emerald-400' : 
              status === 'conflict' ? 'text-rose-400' : 'text-slate-500'
            )}>
              {status === 'complete' || status === 'conflict' ? outputLabel : 'Awaiting analysis...'}
            </span>
          </div>
          
          {result && status === 'complete' && (
            <div className="mt-4 space-y-3">
              {result.summary && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Summary</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{result.summary}</p>
                </div>
              )}
              
              {emotionData && emotionData.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center justify-between w-full text-xs uppercase tracking-wider text-slate-500 mb-2 hover:text-amber-500 transition-colors"
                  >
                    <span>Emotion Distribution</span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <EmotionRadarChart emotionData={emotionData} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              
              {result.key_patterns?.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-2">Key Patterns</h4>
                  <ul className="space-y-1">
                    {result.key_patterns.slice(0, 3).map((pattern, i) => (
                      <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}