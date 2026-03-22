import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard } from '../components/ui/LiquidGlass';
import { Search, Filter, Clock, CheckCircle2, Activity, FileSearch, ChevronRight, Users, Star } from 'lucide-react';
import { format } from 'date-fns';

const statusConfig = {
  intake:     { label: 'Intake',     color: { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', border: 'rgba(100,116,139,0.25)' }, icon: Clock        },
  processing: { label: 'Processing', color: { bg: 'rgba(245,158,11,0.15)',  text: '#f59e0b', border: 'rgba(245,158,11,0.25)'  }, icon: Activity     },
  review:     { label: 'Review',     color: { bg: 'rgba(139,92,246,0.15)',  text: '#a78bfa', border: 'rgba(139,92,246,0.25)'  }, icon: FileSearch   },
  finalized:  { label: 'Finalized',  color: { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.25)'  }, icon: CheckCircle2 },
};

const fidelityColors = {
  'FULL':             { color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  'REDUCED-FIDELITY': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
};

export default function Reports() {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const [tab, setTab] = useState('dsp');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list('-created_date', 100),
    retry: 1,
  });

  const esotericSubjects = subjects.filter(s => s.esoteric_profile?.date_executed);

  const filteredDSP = subjects.filter(subject => {
    const matchesSearch = !search ||
      subject.name?.toLowerCase().includes(search.toLowerCase()) ||
      subject.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subject.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredESP = esotericSubjects.filter(subject =>
    !search || subject.name?.toLowerCase().includes(search.toLowerCase())
  );

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

  const tabBtnStyle = (active, accentColor) => ({
    padding: '8px 20px', borderRadius: 999, fontSize: 13, fontWeight: active ? 600 : 400,
    border: active ? `1px solid ${accentColor}40` : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    background: active ? `${accentColor}18` : 'transparent',
    color: active ? accentColor : t.muted,
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
    transition: 'all 0.15s ease',
  });

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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Reports</h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>
            {subjects.length} subject{subjects.length !== 1 ? 's' : ''} · {esotericSubjects.length} CP-012 profile{esotericSubjects.length !== 1 ? 's' : ''}
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
          {tab === 'dsp' && (
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
          )}
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('dsp')} style={tabBtnStyle(tab === 'dsp', '#f59e0b')}>
          <FileSearch style={{ width: 14, height: 14 }} />
          DSP Reports
          <span style={{
            fontSize: 10, fontFamily: 'monospace', padding: '1px 6px', borderRadius: 999,
            background: tab === 'dsp' ? 'rgba(245,158,11,0.20)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: tab === 'dsp' ? '#f59e0b' : t.muted,
          }}>
            {subjects.length}
          </span>
        </button>
        <button onClick={() => setTab('esp')} style={tabBtnStyle(tab === 'esp', '#8b5cf6')}>
          <Star style={{ width: 14, height: 14 }} />
          CP-012 Profiles
          <span style={{
            fontSize: 10, fontFamily: 'monospace', padding: '1px 6px', borderRadius: 999,
            background: tab === 'esp' ? 'rgba(139,92,246,0.20)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            color: tab === 'esp' ? '#8b5cf6' : t.muted,
          }}>
            {esotericSubjects.length}
          </span>
        </button>
      </div>

      {/* ── DSP Reports Tab ── */}
      {tab === 'dsp' && (
        <div style={{ ...glassCard(t), overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${dividerColor}` }}>
                  {['Subject', 'Status', 'Confidence', 'Data Streams', 'Created', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
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
                ) : filteredDSP.length > 0 ? (
                  filteredDSP.map((subject) => {
                    const status = statusConfig[subject.status] || statusConfig.intake;
                    const StatusIcon = status.icon;
                    const streamCount = ['stream_a_text', 'stream_b_audio', 'stream_c_video', 'stream_d_behavioral', 'stream_e_analog']
                      .filter(key => subject[key]?.length > 0).length;
                    const conf = subject.dsp?.confidence_score;

                    return (
                      <tr key={subject.id} style={{ borderBottom: `1px solid ${dividerColor}` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 500, color: t.title, margin: '0 0 3px', fontSize: 14 }}>{subject.name}</p>
                          <p style={{ fontSize: 11, color: t.muted, fontFamily: 'monospace', margin: 0 }}>DSP-{subject.id?.slice(-8).toUpperCase()}</p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: status.color.bg, color: status.color.text, border: `1px solid ${status.color.border}` }}>
                            <StatusIcon style={{ width: 10, height: 10 }} />
                            {status.label}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          {subject.status === 'finalized' && conf ? (
                            <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 500, color: conf >= 80 ? '#10b981' : conf >= 60 ? '#f59e0b' : '#f43f5e' }}>
                              {conf}%
                            </span>
                          ) : <span style={{ color: t.muted }}>—</span>}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 13, color: t.subtitle }}>{streamCount}/5 active</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 13, color: t.muted }}>{format(new Date(subject.created_date), 'MMM d, yyyy')}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <Link to={createPageUrl(getTargetPage(subject))} style={{ textDecoration: 'none' }}>
                            <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: t.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        <button onClick={() => { setSearch(''); setStatusFilter('all'); }} style={{ background: 'none', border: 'none', color: t.accent, cursor: 'pointer', fontSize: 13 }}>
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
      )}

      {/* ── CP-012 Profiles Tab ── */}
      {tab === 'esp' && (
        <div style={{ ...glassCard(t), overflow: 'hidden', padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${dividerColor}` }}>
                  {['Subject', 'Fidelity', 'Status', 'In DSP', 'Executed', ''].map((h, i) => (
                    <th key={i} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${dividerColor}` }}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} style={{ padding: '14px 20px' }}>
                          <div style={{ height: 14, width: j === 0 ? 120 : 80, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredESP.length > 0 ? (
                  filteredESP.map((subject) => {
                    const ep = subject.esoteric_profile;
                    const fidelityStyle = fidelityColors[ep.input_fidelity] || fidelityColors['REDUCED-FIDELITY'];
                    const isCompliant = ep.execution_status === 'COMPLIANT';

                    return (
                      <tr key={subject.id} style={{ borderBottom: `1px solid ${dividerColor}` }}
                        onMouseEnter={(e) => e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 20px' }}>
                          <p style={{ fontWeight: 500, color: t.title, margin: '0 0 3px', fontSize: 14 }}>{subject.name}</p>
                          <p style={{ fontSize: 11, color: t.muted, fontFamily: 'monospace', margin: 0 }}>CP-012-O-D-ESP</p>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: fidelityStyle.bg, color: fidelityStyle.color, border: `1px solid ${fidelityStyle.border}` }}>
                            {ep.input_fidelity || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, background: isCompliant ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)', color: isCompliant ? '#10b981' : '#f43f5e', border: `1px solid ${isCompliant ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}` }}>
                            {ep.execution_status || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 13, color: ep.include_in_dsp ? '#8b5cf6' : t.muted }}>
                            {ep.include_in_dsp ? '● Included' : '○ Standalone'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ fontSize: 13, color: t.muted }}>{ep.date_executed || '—'}</span>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <Link to={createPageUrl(`EsotericProfile?id=${subject.id}`)} style={{ textDecoration: 'none' }}>
                            <button style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', cursor: 'pointer', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      <Star style={{ width: 36, height: 36, color: '#8b5cf6', margin: '0 auto 12px', opacity: 0.3 }} />
                      <p style={{ color: t.muted, margin: '0 0 6px' }}>No CP-012 profiles yet</p>
                      <p style={{ fontSize: 12, color: t.muted }}>Open any subject and run Esoteric Profile to generate one</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}