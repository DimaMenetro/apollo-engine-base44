import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTheme } from '../components/theme/ThemeProvider';
import { light, dark, glassCard, glassBtn, glassBtnSecondary } from '../components/ui/LiquidGlass';
import { ArrowLeft, ArrowRight, Save, Loader2, UserPlus } from 'lucide-react';
import DataStreamUploader from '../components/intake/DataStreamUploader';

export default function SubjectIntake() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const urlParams = new URLSearchParams(window.location.search);
  const subjectId = urlParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    stream_a_text: [],
    stream_b_audio: [],
    stream_c_video: [],
    stream_d_behavioral: [],
    stream_e_analog: [],
  });

  const { data: existingSubject, isLoading: loadingSubject } = useQuery({
    queryKey: ['subject', subjectId],
    queryFn: () => base44.entities.Subject.filter({ id: subjectId }),
    enabled: !!subjectId,
    retry: 1,
  });

  useEffect(() => {
    if (existingSubject?.[0]) {
      const subject = existingSubject[0];
      setFormData({
        name: subject.name || '',
        stream_a_text: subject.stream_a_text || [],
        stream_b_audio: subject.stream_b_audio || [],
        stream_c_video: subject.stream_c_video || [],
        stream_d_behavioral: subject.stream_d_behavioral || [],
        stream_e_analog: subject.stream_e_analog || [],
      });
    }
  }, [existingSubject]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries(['subjects']);
      navigate(createPageUrl(`Processing?id=${created.id}`));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Subject.update(subjectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subjects']);
      queryClient.invalidateQueries(['subject', subjectId]);
      navigate(createPageUrl(`Processing?id=${subjectId}`));
    },
  });

  const handleSubmit = () => {
    const dataWithStatus = { ...formData, status: 'processing' };
    if (subjectId) updateMutation.mutate(dataWithStatus);
    else createMutation.mutate(dataWithStatus);
  };

  const handleSaveDraft = () => {
    const dataWithStatus = { ...formData, status: 'intake' };
    if (subjectId) updateMutation.mutate(dataWithStatus);
    else createMutation.mutate(dataWithStatus);
  };

  const updateStream = (streamKey, files) => {
    setFormData(prev => ({ ...prev, [streamKey]: files }));
  };

  const hasData = Object.keys(formData).filter(k => k.startsWith('stream_')).some(k => formData[k].length > 0);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingSubject) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 style={{ width: 32, height: 32, color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', fontSize: 15, borderRadius: 10,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
    color: t.title, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => navigate(createPageUrl('Dashboard'))}
          style={{
            width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
            background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.muted,
          }}
        >
          <ArrowLeft style={{ width: 18, height: 18 }} />
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 300, color: t.title, margin: 0 }}>
            {subjectId ? 'Edit Subject' : 'New Subject Intake'}
          </h1>
          <p style={{ fontSize: 13, color: t.muted, marginTop: 6 }}>Upload multimodal data for analysis</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Subject Name */}
        <div style={{ ...glassCard(t), padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 8, borderRadius: 10, background: 'rgba(245,158,11,0.12)' }}>
              <UserPlus style={{ width: 18, height: 18, color: '#f59e0b' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 500, color: t.title, margin: 0 }}>Subject Identifier</h2>
              <p style={{ fontSize: 12, color: t.muted, margin: '3px 0 0' }}>Provide a name or codename for this subject</p>
            </div>
          </div>
          <input
            placeholder="Enter subject name or identifier..."
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            style={inputStyle}
          />
        </div>

        {/* Data Streams */}
        <div style={{ ...glassCard(t), padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 500, color: t.title, margin: '0 0 20px' }}>Data Streams</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['stream_a_text', 'stream_b_audio', 'stream_c_video', 'stream_d_behavioral', 'stream_e_analog'].map(streamKey => (
              <DataStreamUploader
                key={streamKey}
                streamKey={streamKey}
                files={formData[streamKey]}
                onFilesChange={(files) => updateStream(streamKey, files)}
              />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={handleSaveDraft}
            disabled={!formData.name || isSaving}
            style={{
              ...glassBtnSecondary(t), padding: '10px 22px', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: (!formData.name || isSaving) ? 0.5 : 1,
            }}
          >
            {isSaving ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: 15, height: 15 }} />}
            Save Draft
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!formData.name || !hasData || isSaving}
            style={{
              ...glassBtn(t), padding: '10px 22px', fontSize: 14,
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: (!formData.name || !hasData || isSaving) ? 0.5 : 1,
            }}
          >
            {isSaving ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} /> : <>Begin Processing <ArrowRight style={{ width: 15, height: 15 }} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}