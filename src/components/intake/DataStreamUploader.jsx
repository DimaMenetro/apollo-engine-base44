import React, { useState, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileText, 
  Music, 
  Video, 
  BarChart3, 
  PenTool,
  X,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const streamConfig = {
  stream_a_text: {
    label: 'Text Data',
    description: 'Logs, emails, transcripts',
    icon: FileText,
    accept: '.txt,.pdf,.doc,.docx,.csv',
    color: 'amber',
  },
  stream_b_audio: {
    label: 'Audio Data',
    description: 'Voice recordings (WAV/MP3/M4A)',
    icon: Music,
    accept: '.wav,.mp3,.m4a,.aac',
    color: 'violet',
  },
  stream_c_video: {
    label: 'Video Data',
    description: 'Visual footage (MP4/MOV)',
    icon: Video,
    accept: '.mp4,.mov,.avi,.webm',
    color: 'rose',
  },
  stream_d_behavioral: {
    label: 'Behavioral Data',
    description: 'Decision logs, purchase history, any format',
    icon: BarChart3,
    accept: '*',
    color: 'emerald',
  },
  stream_e_analog: {
    label: 'Analog Data',
    description: 'Handwriting samples',
    icon: PenTool,
    accept: '.png,.jpg,.jpeg,.pdf',
    color: 'cyan',
  },
};

const colorClasses = {
  amber: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/50',
  violet: 'border-violet-500/30 bg-violet-500/5 hover:border-violet-500/50',
  rose: 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50',
  emerald: 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50',
  cyan: 'border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50',
};

const iconColorClasses = {
  amber: 'text-amber-500',
  violet: 'text-violet-500',
  rose: 'text-rose-500',
  emerald: 'text-emerald-500',
  cyan: 'text-cyan-500',
};

export default function DataStreamUploader({ streamKey, files, onFilesChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const config = streamConfig[streamKey];
  const Icon = config.icon;

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    
    // Validate file sizes before upload
    const MAX_VIDEO_SIZE_MB = 500; // Up to ~5 minutes at high quality
    const MAX_FILE_SIZE_MB = 50;
    
    for (const file of fileList) {
      const fileSizeMB = file.size / (1024 * 1024);
      const isVideo = file.type.startsWith('video/') || ['.mp4', '.mov', '.avi', '.webm'].some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (isVideo && fileSizeMB > MAX_VIDEO_SIZE_MB) {
        alert(`Video file "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Maximum: ${MAX_VIDEO_SIZE_MB}MB (~5 minutes). Please compress or trim the video.`);
        return;
      }
      
      if (!isVideo && fileSizeMB > MAX_FILE_SIZE_MB) {
        alert(`File "${file.name}" is too large (${fileSizeMB.toFixed(1)}MB). Maximum: ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }
    }
    
    setUploading(true);
    setUploadProgress('');
    try {
      const newUrls = [];
      const totalFiles = fileList.length;
      
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        setUploadProgress(`Uploading ${file.name} (${fileSizeMB}MB) - ${i + 1}/${totalFiles}`);
        
        let retries = 0;
        const maxRetries = 3;
        let uploaded = false;
        
        while (retries < maxRetries && !uploaded) {
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            newUrls.push(file_url);
            uploaded = true;
          } catch (error) {
            retries++;
            if (retries < maxRetries) {
              setUploadProgress(`Retry ${retries}/${maxRetries} - ${file.name} (${fileSizeMB}MB)`);
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
            } else {
              throw new Error(`Failed to upload ${file.name}: ${error.message || 'Network timeout - file may be too large'}`);
            }
          }
        }
      }
      
      onFilesChange([...files, ...newUrls]);
      setUploadProgress('');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Upload failed. Large video files may timeout - try compressing or using a smaller file.');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleUpload(droppedFiles);
    }
  }, [files, handleUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
          colorClasses[config.color],
          dragOver && "border-opacity-100 scale-[1.02]",
          files.length > 0 && "pb-4"
        )}
      >
        <input
          type="file"
          accept={config.accept}
          multiple
          onChange={(e) => {
            if (e.target.files?.length > 0) {
              handleUpload(Array.from(e.target.files));
              e.target.value = '';
            }
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-3 rounded-xl bg-slate-900/50",
            iconColorClasses[config.color]
          )}>
            <Icon className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-slate-200">{config.label}</h4>
            <p className="text-sm text-slate-500">{config.description}</p>
          </div>
          
          {uploading ? (
            <div className="flex flex-col items-end">
              <Loader2 className="h-5 w-5 text-slate-500 animate-spin" />
              {uploadProgress && (
                <span className="text-xs text-slate-500 mt-1 text-right max-w-[200px] truncate">
                  {uploadProgress}
                </span>
              )}
            </div>
          ) : files.length > 0 ? (
            <div className="flex items-center gap-2 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm">{files.length} file{files.length > 1 ? 's' : ''}</span>
            </div>
          ) : (
            <Upload className="h-5 w-5 text-slate-600" />
          )}
        </div>
        
        {files.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
            {files.map((url, index) => (
              <div 
                key={index}
                className="flex items-center justify-between px-3 py-2 bg-slate-900/50 rounded-lg text-sm"
              >
                <span className="text-slate-400 truncate flex-1 mr-4">
                  {url.split('/').pop()}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-slate-600 hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}