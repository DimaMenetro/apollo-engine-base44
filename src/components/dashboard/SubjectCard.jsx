import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, CheckCircle2, Activity, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const statusConfig = {
  intake: { label: 'Intake', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock },
  processing: { label: 'Processing', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Activity },
  review: { label: 'Review', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: FileSearch },
  finalized: { label: 'Finalized', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

export default function SubjectCard({ subject }) {
  const status = statusConfig[subject.status] || statusConfig.intake;
  const StatusIcon = status.icon;
  
  const dataStreams = [
    { key: 'stream_a_text', label: 'TXT' },
    { key: 'stream_b_audio', label: 'AUD' },
    { key: 'stream_c_video', label: 'VID' },
    { key: 'stream_d_behavioral', label: 'BEH' },
    { key: 'stream_e_analog', label: 'ANA' },
  ];

  const getTargetPage = () => {
    switch (subject.status) {
      case 'intake': return `SubjectIntake?id=${subject.id}`;
      case 'processing': return `Processing?id=${subject.id}`;
      case 'review': return `SubjectReview?id=${subject.id}`;
      case 'finalized': return `DSPReport?id=${subject.id}`;
      default: return `SubjectIntake?id=${subject.id}`;
    }
  };

  return (
    <Link 
      to={createPageUrl(getTargetPage())}
      className="block glass-panel rounded-3xl p-5 hover:bg-slate-900/40 transition-all duration-300 group hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-medium text-slate-100 group-hover:text-amber-500 transition-colors">
            {subject.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            DSP-{subject.id?.slice(-8).toUpperCase()}
          </p>
        </div>
        <Badge variant="outline" className={cn("border", status.color)}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {status.label}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        {dataStreams.map((stream) => {
          const hasData = subject[stream.key]?.length > 0;
          return (
            <div
              key={stream.key}
              className={cn(
                "text-[10px] font-mono px-2 py-1 rounded",
                hasData 
                  ? "bg-amber-500/20 text-amber-400" 
                  : "bg-slate-800/50 text-slate-600"
              )}
            >
              {stream.label}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{format(new Date(subject.created_date), 'MMM d, yyyy')}</span>
        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}