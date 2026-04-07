import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { ArrowLeft, Loader2, Star, RefreshCw, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import EsotericOutputDisplay from '../components/esoteric/EsotericOutputDisplay';
import ExportDropdown from '../components/export/ExportDropdown';

const MODES = ['RETROSPECTIVE', 'PRESENT-STATE', 'PROSPECTIVE', 'FULL-CYCLE'];

export default function EsotericProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [inputs, setInputs] = useState({
    full_birth_name: '',
    date_of_birth: '',
    place_of_birth: '',
    time_of_birth: '',
    mode: 'PRESENT-STATE',
    timeframe: '',
    focus: '',
  });

  const { data: subjectData, isLoading } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
    retry: 1,
  });

  const subject = subjectData?.[0];

  useEffect(() => {
    if (subject?.esoteric_inputs) {
      setInputs(prev => ({ ...prev, ...subject.esoteric_inputs }));
    }
  }, [subject]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subject', subjectId]);
      queryClient.invalidateQueries(['subjects']);
    },
  });

  const canExecute = inputs.full_birth_name && inputs.date_of_birth && inputs.place_of_birth;

  const handleExecute = async () => {
    setIsExecuting(true);
    setError(null);
    try {
      // Save inputs first
      await updateMutation.mutateAsync({ esoteric_inputs: inputs });
      // Execute CP-012
      const res = await base44.functions.invoke('generateEsotericProfile', { subject_id: subjectId });
      if (res.data?.error) {
        setError(res.data.error);
      } else {
        queryClient.invalidateQueries(['subject', subjectId]);
      }
    } catch (e) {
      setError(e.message || 'Execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleToggleIncludeInDSP = async () => {
    const current = subject?.esoteric_profile?.include_in_dsp || false;
    await updateMutation.mutateAsync({
      esoteric_profile: { ...subject.esoteric_profile, include_in_dsp: !current }
    });
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 14, borderRadius: 10,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
    color: t.title, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle = { fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, display: 'block', marginBottom: 6 };
  const sectionCard = { ...glassCard(t), padding: 24 };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#8b5cf6', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!subject) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ color: t.muted, marginBottom: 16 }}>Subject not found</p>
        <button onClick={() => navigate(createPageUrl('Dashboard'))} style={{ ...glassBtnSecondary(t), padding: '10px 24px', fontSize: 14 }}>
          Return to Dashboard
        </button>
      </div>
    );
  }

  const profile = subject.esoteric_profile;
  const includeInDSP = profile?.include_in_dsp || false;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted }}
          >
            <ArrowLeft style={{ width: 18, height: 18 }} />
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star style={{ width: 16, height: 16, color: '#8b5cf6' }} />
              <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>Esoteric Profile</h1>
            </div>
            <p style={{ fontSize: 13, color: t.muted, marginTop: 4, fontFamily: 'monospace' }}>
              CP-012-O-D-ESP • {subject.name}
            </p>
          </div>
        </div>

        {/* Actions — only visible if a profile exists */}
        {profile && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={handleToggleIncludeInDSP}
              disabled={updateMutation.isPending}
              style={{
                ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
                borderColor: includeInDSP ? 'rgba(139,92,246,0.45)' : undefined,
              }}
            >
              {includeInDSP
                ? <ToggleRight style={{ width: 16, height: 16, color: '#8b5cf6' }} />
                : <ToggleLeft style={{ width: 16, height: 16, color: t.muted }} />
              }
              {includeInDSP ? 'Included in DSP' : 'Include in DSP'}
            </button>
            <ExportDropdown
              subjectId={subjectId}
              hasDSP={!!subject?.dsp?.executive_summary}
              hasEsoteric={!!profile?.execution_status}
              defaultMode="esoteric"
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Inputs Card */}
        <div style={sectionCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <FileText style={{ width: 14, height: 14, color: '#8b5cf6' }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
              Esoteric Inputs — CP-012 §4.10
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
            {/* Required */}
            <div>
              <label style={labelStyle}>Full Birth Name * (Numerology)</label>
              <input value={inputs.full_birth_name} onChange={e => setInputs(p => ({ ...p, full_birth_name: e.target.value }))}
                placeholder="Legal birth name e.g. John Michael Smith" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Date of Birth * (Astrology + Numerology)</label>
              <input value={inputs.date_of_birth} onChange={e => setInputs(p => ({ ...p, date_of_birth: e.target.value }))}
                placeholder="e.g. March 15, 1985" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Place of Birth * (Astrology)</label>
              <input value={inputs.place_of_birth} onChange={e => setInputs(p => ({ ...p, place_of_birth: e.target.value }))}
                placeholder="e.g. Chicago, Illinois, USA" style={inputStyle} />
            </div>
            {/* Preferred */}
            <div>
              <label style={labelStyle}>Time of Birth (Preferred — enables Rising sign)</label>
              <input value={inputs.time_of_birth} onChange={e => setInputs(p => ({ ...p, time_of_birth: e.target.value }))}
                placeholder="e.g. 14:32 or 2:32 PM" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Mode</label>
              <select value={inputs.mode} onChange={e => setInputs(p => ({ ...p, mode: e.target.value }))}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Timeframe (Optional)</label>
              <input value={inputs.timeframe} onChange={e => setInputs(p => ({ ...p, timeframe: e.target.value }))}
                placeholder="e.g. 2023–2026" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Focus Domain (Optional)</label>
            <input value={inputs.focus} onChange={e => setInputs(p => ({ ...p, focus: e.target.value }))}
              placeholder="e.g. identity transition, relationship pattern, threshold diagnosis" style={inputStyle} />
          </div>

          {/* Fidelity indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, padding: '8px 12px', borderRadius: 8, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
            <span style={{ fontSize: 11, color: t.muted }}>Execution state:</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 600, color: canExecute ? (inputs.time_of_birth ? '#10b981' : '#f59e0b') : '#f43f5e' }}>
              {!canExecute ? 'HALTED — Missing required inputs' : inputs.time_of_birth ? 'FULL' : 'REDUCED-FIDELITY (no birth time)'}
            </span>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: '#f43f5e', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            onClick={handleExecute}
            disabled={!canExecute || isExecuting}
            style={{ ...glassBtn(t), padding: '10px 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, opacity: (!canExecute || isExecuting) ? 0.5 : 1, background: canExecute ? 'linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%)' : undefined }}
          >
            {isExecuting
              ? <><Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />Executing CP-012...</>
              : profile
                ? <><RefreshCw style={{ width: 15, height: 15 }} />Re-Execute CP-012</>
                : <><Star style={{ width: 15, height: 15 }} />Execute CP-012-O-D-ESP</>
            }
          </button>
        </div>

        {/* Output */}
        {profile && (
          <div style={sectionCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Star style={{ width: 14, height: 14, color: '#8b5cf6' }} />
              <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
                Esoteric Analysis Output
              </h3>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontFamily: 'monospace', color: t.muted }}>
                {profile.date_executed}
              </span>
            </div>
            <EsotericOutputDisplay profile={profile} />
          </div>
        )}

        {!profile && !isExecuting && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: t.muted }}>
            <Star style={{ width: 36, height: 36, color: '#8b5cf6', margin: '0 auto 12px', opacity: 0.4 }} />
            <p style={{ fontSize: 14, marginBottom: 6 }}>No esoteric profile generated yet</p>
            <p style={{ fontSize: 12 }}>Fill in the required inputs above and execute CP-012 to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}