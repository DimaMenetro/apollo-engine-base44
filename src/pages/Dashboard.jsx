import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn } from '../components/ui/LiquidGlass';
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

export default function Dashboard() {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

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
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: t.muted, marginBottom: 16 }}>Unable to load subjects data</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 24px', fontSize: 14, borderRadius: 999, cursor: 'pointer',
            background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
            color: t.text,
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Operations Center</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>
            Multimodal Profiling &amp; Prediction Engine
          </p>
        </div>
        <Link to={createPageUrl('SubjectIntake')} style={{ textDecoration: 'none' }}>
          <button style={{ ...glassBtn(t), padding: '10px 22px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus style={{ width: 16, height: 16 }} />
            New Subject
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <StatCard title="Total Subjects"    value={isLoading ? '—' : stats.total}      icon={Users}          color="slate"   />
        <StatCard title="In Processing"     value={isLoading ? '—' : stats.processing}  icon={Activity}       color="amber"   />
        <StatCard title="Finalized DSPs"    value={isLoading ? '—' : stats.finalized}   icon={FileCheck}      color="emerald" />
        <StatCard title="Conflicts Flagged" value={isLoading ? '—' : stats.flagged}     icon={AlertTriangle}  color="rose"    />
      </div>

      {/* Active Processing */}
      {processingSubjects.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 2s ease-in-out infinite' }} />
            <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
              Active Processing
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {processingSubjects.slice(0, 3).map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Subjects */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
            Recent Subjects
          </h2>
          <Link
            to={createPageUrl('Reports')}
            style={{ fontSize: 12, color: t.muted, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
          >
            View All <ArrowRight style={{ width: 12, height: 12 }} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ ...glassCard(t), padding: 20, height: 130 }} />
            ))}
          </div>
        ) : recentSubjects.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {recentSubjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        ) : (
          <div style={{
            ...glassCard(t),
            padding: 48, textAlign: 'center',
          }}>
            <Users style={{ width: 40, height: 40, color: t.muted, margin: '0 auto 16px' }} />
            <h3 style={{ color: t.subtitle, marginBottom: 8, fontWeight: 400 }}>No subjects yet</h3>
            <p style={{ fontSize: 13, color: t.muted, marginBottom: 24 }}>
              Create your first subject profile to begin analysis
            </p>
            <Link to={createPageUrl('SubjectIntake')} style={{ textDecoration: 'none' }}>
              <button style={{
                padding: '9px 20px', fontSize: 13, borderRadius: 999, cursor: 'pointer',
                background: 'transparent', border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                color: t.text, display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <Plus style={{ width: 14, height: 14 }} />
                New Subject
              </button>
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}