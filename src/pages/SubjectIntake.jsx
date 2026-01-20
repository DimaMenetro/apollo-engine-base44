import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  Loader2,
  UserPlus
} from 'lucide-react';
import DataStreamUploader from '../components/intake/DataStreamUploader';

export default function SubjectIntake() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
    if (subjectId) {
      updateMutation.mutate(dataWithStatus);
    } else {
      createMutation.mutate(dataWithStatus);
    }
  };

  const handleSaveDraft = () => {
    const dataWithStatus = { ...formData, status: 'intake' };
    if (subjectId) {
      updateMutation.mutate(dataWithStatus);
    } else {
      createMutation.mutate(dataWithStatus);
    }
  };

  const updateStream = (streamKey, files) => {
    setFormData(prev => ({ ...prev, [streamKey]: files }));
  };

  const hasData = Object.keys(formData)
    .filter(k => k.startsWith('stream_'))
    .some(k => formData[k].length > 0);

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (loadingSubject) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl('Dashboard'))}
          className="text-slate-400 hover:text-slate-200"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-light text-slate-100">
            {subjectId ? 'Edit Subject' : 'New Subject Intake'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Upload multimodal data for analysis
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-8">
        {/* Subject Name */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <UserPlus className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h2 className="font-medium text-slate-200">Subject Identifier</h2>
              <p className="text-sm text-slate-500">Provide a name or codename for this subject</p>
            </div>
          </div>
          <Input
            placeholder="Enter subject name or identifier..."
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-600"
          />
        </div>

        {/* Data Streams */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-medium text-slate-200 mb-6">Data Streams</h2>
          <div className="space-y-4">
            <DataStreamUploader
              streamKey="stream_a_text"
              files={formData.stream_a_text}
              onFilesChange={(files) => updateStream('stream_a_text', files)}
            />
            <DataStreamUploader
              streamKey="stream_b_audio"
              files={formData.stream_b_audio}
              onFilesChange={(files) => updateStream('stream_b_audio', files)}
            />
            <DataStreamUploader
              streamKey="stream_c_video"
              files={formData.stream_c_video}
              onFilesChange={(files) => updateStream('stream_c_video', files)}
            />
            <DataStreamUploader
              streamKey="stream_d_behavioral"
              files={formData.stream_d_behavioral}
              onFilesChange={(files) => updateStream('stream_d_behavioral', files)}
            />
            <DataStreamUploader
              streamKey="stream_e_analog"
              files={formData.stream_e_analog}
              onFilesChange={(files) => updateStream('stream_e_analog', files)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={!formData.name || isSaving}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Draft
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={!formData.name || !hasData || isSaving}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Begin Processing <ArrowRight className="h-4 w-4" /></>}
          </Button>
        </div>
      </div>
    </div>
  );
}