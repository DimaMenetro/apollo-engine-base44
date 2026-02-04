import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Activity, 
  FileCheck, 
  AlertTriangle,
  Plus,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import SubjectCard from '../components/dashboard/SubjectCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list('-created_date', 50),
    retry: 1,
  });

  const stats = {
    total: subjects.length,
    processing: subjects.filter(s => s.status === 'processing').length,
    finalized: subjects.filter(s => s.status === 'finalized').length,
    flagged: subjects.filter(s => s.conflicts_detected?.length > 0).length,
  };

  const recentSubjects = subjects.slice(0, 6);
  const processingSubjects = subjects.filter(s => s.status === 'processing');

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500 mb-4">Unable to load subjects data</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="border-slate-700 text-slate-300"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-light text-slate-100">Operations Center</h1>
          <p className="text-sm text-slate-500 mt-1">
            Multimodal Profiling & Prediction Engine
          </p>
        </div>
        <Link to={createPageUrl('SubjectIntake')}>
          <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2">
            <Plus className="h-4 w-4" />
            New Subject
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Subjects"
          value={isLoading ? '—' : stats.total}
          icon={Users}
          color="slate"
        />
        <StatCard
          title="In Processing"
          value={isLoading ? '—' : stats.processing}
          icon={Activity}
          color="amber"
        />
        <StatCard
          title="Finalized DSPs"
          value={isLoading ? '—' : stats.finalized}
          icon={FileCheck}
          color="emerald"
        />
        <StatCard
          title="Conflicts Flagged"
          value={isLoading ? '—' : stats.flagged}
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Active Processing */}
      {processingSubjects.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
              Active Processing
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingSubjects.slice(0, 3).map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Subjects */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wider">
            Recent Subjects
          </h2>
          <Link 
            to={createPageUrl('Reports')}
            className="text-xs text-slate-500 hover:text-amber-500 flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-panel rounded-3xl p-5">
                <Skeleton className="h-5 w-32 bg-slate-800 mb-2" />
                <Skeleton className="h-3 w-20 bg-slate-800 mb-4" />
                <div className="flex gap-2 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-8 bg-slate-800 rounded" />
                  ))}
                </div>
                <Skeleton className="h-3 w-24 bg-slate-800" />
              </div>
            ))}
          </div>
        ) : recentSubjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-12 text-center">
            <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-slate-400 mb-2">No subjects yet</h3>
            <p className="text-sm text-slate-600 mb-6">
              Create your first subject profile to begin analysis
            </p>
            <Link to={createPageUrl('SubjectIntake')}>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                <Plus className="h-4 w-4 mr-2" />
                New Subject
              </Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}