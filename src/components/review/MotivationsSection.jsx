import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Target, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MotivationsSection({ 
  motivations = [], 
  fears = [], 
  onMotivationsChange, 
  onFearsChange,
  editable = false 
}) {
  const [newMotivation, setNewMotivation] = useState('');
  const [newFear, setNewFear] = useState('');

  const addItem = (type) => {
    if (type === 'motivation' && newMotivation.trim()) {
      onMotivationsChange([...motivations, newMotivation.trim()]);
      setNewMotivation('');
    } else if (type === 'fear' && newFear.trim()) {
      onFearsChange([...fears, newFear.trim()]);
      setNewFear('');
    }
  };

  const removeItem = (type, index) => {
    if (type === 'motivation') {
      onMotivationsChange(motivations.filter((_, i) => i !== index));
    } else {
      onFearsChange(fears.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Motivations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-4 w-4 text-emerald-500" />
          <h4 className="text-sm font-medium text-slate-200">Core Motivations</h4>
        </div>
        
        <div className="space-y-2">
          {motivations.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg"
            >
              <span className="flex-1 text-sm text-emerald-300">{item}</span>
              {editable && (
                <button
                  onClick={() => removeItem('motivation', index)}
                  className="text-emerald-400/50 hover:text-rose-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          
          {editable && (
            <div className="flex items-center gap-2">
              <Input
                value={newMotivation}
                onChange={(e) => setNewMotivation(e.target.value)}
                placeholder="Add motivation..."
                className="flex-1 h-9 bg-slate-900/50 border-slate-700 text-slate-200 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addItem('motivation')}
              />
              <Button
                onClick={() => addItem('motivation')}
                disabled={!newMotivation.trim()}
                size="sm"
                variant="ghost"
                className="h-9 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {motivations.length === 0 && !editable && (
            <p className="text-xs text-slate-500 py-2">No motivations identified</p>
          )}
        </div>
      </div>

      {/* Fears */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-4 w-4 text-rose-500" />
          <h4 className="text-sm font-medium text-slate-200">Core Fears</h4>
        </div>
        
        <div className="space-y-2">
          {fears.map((item, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg"
            >
              <span className="flex-1 text-sm text-rose-300">{item}</span>
              {editable && (
                <button
                  onClick={() => removeItem('fear', index)}
                  className="text-rose-400/50 hover:text-rose-400 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          
          {editable && (
            <div className="flex items-center gap-2">
              <Input
                value={newFear}
                onChange={(e) => setNewFear(e.target.value)}
                placeholder="Add fear..."
                className="flex-1 h-9 bg-slate-900/50 border-slate-700 text-slate-200 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && addItem('fear')}
              />
              <Button
                onClick={() => addItem('fear')}
                disabled={!newFear.trim()}
                size="sm"
                variant="ghost"
                className="h-9 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {fears.length === 0 && !editable && (
            <p className="text-xs text-slate-500 py-2">No fears identified</p>
          )}
        </div>
      </div>
    </div>
  );
}