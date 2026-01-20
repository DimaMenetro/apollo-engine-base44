import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter,
  Clock,
  CheckCircle2,
  Activity,
  FileSearch,
  ChevronRight,
  Users
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  intake: { label: 'Intake', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: Clock },
  processing: { label: 'Processing', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Activity },
  review: { label: 'Review', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30', icon: FileSearch },
  finalized: { label: 'Finalized', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
};

export default function Reports() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => base44.entities.Subject.list('-created_date', 100),
    retry: 1,
  });

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500 mb-4">Unable to load data</p>
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

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = !search || 
      subject.name?.toLowerCase().includes(search.toLowerCase()) ||
      subject.id?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subject.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getTargetPage = (subject) => {
    switch (subject.status) {
      case 'intake': return `SubjectIntake?id=${subject.id}`;
      case 'processing': return `Processing?id=${subject.id}`;
      case 'review': return `SubjectReview?id=${subject.id}`;
      case 'finalized': return `DSPReport?id=${subject.id}`;
      default: return `SubjectIntake?id=${subject.id}`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light text-slate-100">All Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            {subjects.length} subject profile{subjects.length !== 1 ? 's' : ''} in database
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search subjects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64 bg-slate-900/50 border-slate-700 text-slate-200 placeholder:text-slate-600"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700 text-slate-200">
              <Filter className="h-4 w-4 mr-2 text-slate-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="intake">Intake</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="finalized">Finalized</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Subject
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Confidence
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Data Streams
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  Created
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-slate-800/50">
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32 bg-slate-800" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-24 bg-slate-800 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-12 bg-slate-800" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-28 bg-slate-800" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 bg-slate-800" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-5 bg-slate-800" /></td>
                  </tr>
                ))
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => {
                  const status = statusConfig[subject.status] || statusConfig.intake;
                  const StatusIcon = status.icon;
                  const streamCount = ['stream_a_text', 'stream_b_audio', 'stream_c_video', 'stream_d_behavioral', 'stream_e_analog']
                    .filter(key => subject[key]?.length > 0).length;
                  
                  return (
                    <tr 
                      key={subject.id}
                      className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-200">{subject.name}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            DSP-{subject.id?.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("border", status.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {subject.status === 'finalized' && subject.dsp?.confidence_score ? (
                          <span className={cn(
                            "font-mono",
                            subject.dsp.confidence_score >= 80 ? 'text-emerald-400' :
                            subject.dsp.confidence_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                          )}>
                            {subject.dsp.confidence_score}%
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-400">
                          {streamCount}/5 active
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-500">
                          {format(new Date(subject.created_date), 'MMM d, yyyy')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={createPageUrl(getTargetPage(subject))}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-amber-500"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">No subjects found</p>
                    {search || statusFilter !== 'all' ? (
                      <Button
                        variant="link"
                        onClick={() => { setSearch(''); setStatusFilter('all'); }}
                        className="text-amber-500 mt-2"
                      >
                        Clear filters
                      </Button>
                    ) : null}
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