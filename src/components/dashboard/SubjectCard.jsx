import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock, CheckCircle2, Activity, FileSearch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';

const statusConfig = {
  intake:     { label: 'Intake',     color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',    icon: Clock        },
  processing: { label: 'Processing', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',    icon: Activity     },
  review:     { label: 'Review',     color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: FileSearch   },
  finalized:  { label: 'Finalized',  color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

const dataStreams = [
  { key: 'stream_a_text',       label: 'TXT' },
  { key: 'stream_b_audio',      label: 'AUD' },
  { key: 'stream_c_video',      label: 'VID' },
  { key: 'stream_d_behavioral', label: 'BEH' },
  { key: 'stream_e_analog',     label: 'ANA' },
];

export default function SubjectCard({ subject }) {
  const { isDark } = useTheme();
  const t      = isDark ? dark : light;
  const status = statusConfig[subject.status] || statusConfig.intake;
  const StatusIcon = status.icon;

  const getTargetPage = () => {
    switch (subject.status) {
      case 'intake':     return `SubjectIntake?id=${subject.id}`;
      case 'processing': return `Processing?id=${subject.id}`;
      case 'review':     return `SubjectReview?id=${subject.id}`;
      case 'finalized':  return `DSPReport?id=${subject.id}`;
      default:           return `SubjectIntake?id=${subject.id}`;
    }
  };

  return (
    <Link to={createPageUrl(getTargetPage())} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          ...glassCard(t),
          padding:    20,
          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontWeight: 500, color: t.title, fontSize: 15, marginBottom: 4 }}>
              {subject.name}
            </h3>
            <p style={{ fontSize: 11, color: t.muted, fontFamily: 'monospace' }}>
              DSP-{subject.id?.slice(-8).toUpperCase()}
            </p>
          </div>
          <Badge variant="outline" className={cn('border', status.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Stream indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          {dataStreams.map((stream) => {
            const hasData = subject[stream.key]?.length > 0;
            return (
              <div
                key={stream.key}
                style={{
                  fontSize:     10,
                  fontFamily:   'monospace',
                  padding:      '2px 6px',
                  borderRadius: 4,
                  background:   hasData ? 'rgba(245,158,11,0.18)' : 'rgba(100,116,139,0.12)',
                  color:        hasData ? '#f59e0b'               : '#475569',
                }}
              >
                {stream.label}
              </div>
            );
          })}
        </div>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 12, color: t.muted }}>
            {format(new Date(subject.created_date), 'MMM d, yyyy')}
          </span>
          <ChevronRight style={{ width: 16, height: 16, color: t.muted }} />
        </div>
      </div>
    </Link>
  );
}