import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard } from '../components/ui/LiquidGlass';
import { Search, Filter, Clock, CheckCircle2, Activity, FileSearch, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  intake:     { label: 'Intake',     color: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)' }, icon: Clock        },
  processing: { label: 'Processing', color: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b', border: 'rgba(245,158,11,0.25)'  }, icon: Activity     },
  review:     { label: 'Review',     color: { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa', border: 'rgba(139,92,246,0.25)'  }, icon: FileSearch   },
  finalized:  { label: 'Finalized',  color: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.25)'  }, icon: CheckCircle2 },
};

export default function Reports() {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list('-created_date', 100),
    retry: 1,
  });

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !search ||
      subject.name?.toLowerCase().includes(search.toLowerCase()) ||
      subject.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subject.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getTargetPage = (subject) => {
    switch (subject.status) {
      case 'intake':     return `SubjectIntake?id=${subject.id}`;
      case 'processing': return `Processing?id=${subject.id}`;
      case 'review':     return `SubjectReview?id=${subject.id}`;
      case 'finalized':  return `DSPReport?id=${subject.id}`;
      default:           return `SubjectIntake?id=${subject.id}`;
    }
  };

  const inputStyle = {
    padding: '9px 14px', fontSize: 13, borderRadius: 10,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.09)'}`,
    color: t.title, outline: 'none', fontFamily: 'inherit',
  };

  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  if (error) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: t.muted, marginBottom: 16 }}>Unable to load data</p>
        <button onClick={() => window.location.reload()} style={{ ...inputStyle, cursor: 'pointer' }}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>All Reports</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>
            {subjects.length} subject profile{subjects.length !== 1 ? 's' : ''} in database
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ width: 14, height: 14, color: t.muted, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 32, width: 220 }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Filter style={{ width: 13, height: 13, color: t.muted, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ ...inputStyle, paddingLeft: 30, paddingRight: 10, cursor: 'pointer', appearance: 'none' }}
            >
              <option value="all">All Status</option>
              <option value="intake">Intake</option>
              <option value="processing">Processing</option>
              <option value="review">Review</option>
              <option value="finalized">Finalized</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...glassCard(t), overflow: 'hidden', padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${dividerColor}` }}>
                {['Subject', 'Status', 'Confidence', 'Data Streams', 'Created', ''].map((h, i) => (
                  <th key={i} style={{
                    textAlign: 'left', padding: '14px 20px',
                    fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: t.label, fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${dividerColor}` }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: '14px 20px' }}>
                        <div style={{ height: 14, width: j === 0 ? 120 : 80, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => {
                  const status = statusConfig[subject.status] || statusConfig.intake;
                  const StatusIcon = status.icon;
                  const streamCount = ['stream_a_text', 'stream_b_audio', 'stream_c_video', 'stream_d_behavioral', 'stream_e_analog']
                    .filter(key => subject[key]?.length > 0).length;

                  const conf = subject.dsp?.confidence_score;

                  return (
                    <tr
                      key={subject.id}
                      style={{ borderBottom: `1px solid ${dividerColor}` }}
                      onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <p style={{ fontWeight: 500, color: t.title, margin: '0 0 3px', fontSize: 14 }}>{subject.name}</p>
                        <p style={{ fontSize: 11, color: t.muted, fontFamily: 'monospace', margin: 0 }}>
                          DSP-{subject.id?.slice(-8).toUpperCase()}
                        </p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                          background: status.color.bg, color: status.color.text, border: `1px solid ${status.color.border}`,
                        }}>
                          <StatusIcon style={{ width: 10, height: 10 }} />
                          {status.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {subject.status === 'finalized' && conf ? (
                          <span style={{
                            fontFamily: 'monospace', fontSize: 14, fontWeight: 500,
                            color: conf >= 80 ? '#10b981' : conf >= 60 ? '#f59e0b' : '#f43f5e',
                          }}>
                            {conf}%
                          </span>
                        ) : (
                          <span style={{ color: t.muted }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 13, color: t.subtitle }}>{streamCount}/5 active</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 13, color: t.muted }}>
                          {format(new Date(subject.created_date), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Link to={createPageUrl(getTargetPage(subject))} style={{ textDecoration: 'none' }}>
                          <button style={{
                            width: 28, height: 28, borderRadius: '50%', border: 'none',
                            background: 'transparent', cursor: 'pointer', color: t.muted,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <ChevronRight style={{ width: 15, height: 15 }} />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                    <Users style={{ width: 36, height: 36, color: t.muted, margin: '0 auto 12px' }} />
                    <p style={{ color: t.muted, margin: '0 0 10px' }}>No subjects found</p>
                    {(search || statusFilter !== 'all') && (
                      <button
                        onClick={() => { setSearch(''); setStatusFilter('all'); }}
                        style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 13 }}
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}