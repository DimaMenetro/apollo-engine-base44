import React from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Loader2, 
  Circle,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig = {
  pending: { icon: Circle, color: 'text-slate-600', bg: 'bg-slate-600/20' },
  running: { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/20', spin: true },
  complete: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  conflict: { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/20' },
};

export default function AnalysisModule({ 
  title, 
  description, 
  outputLabel,
  status = 'pending',
  result,
  icon: Icon,
  color = 'amber'
}) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-panel rounded-xl p-5 border-l-2",
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
            <div className="mt-3 pt-3 border-t border-slate-800">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Key Findings</p>
              <p className="text-sm text-slate-400 line-clamp-3">
                {typeof result === 'string' ? result : JSON.stringify(result).slice(0, 150)}...
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}