import React from 'react';
import { cn } from '@/lib/utils';

const traits = [
  { key: 'openness', label: 'Openness', description: 'Creativity, curiosity, willingness to try new things' },
  { key: 'conscientiousness', label: 'Conscientiousness', description: 'Organization, dependability, self-discipline' },
  { key: 'extraversion', label: 'Extraversion', description: 'Sociability, assertiveness, positive emotions' },
  { key: 'agreeableness', label: 'Agreeableness', description: 'Cooperation, trust, helpfulness' },
  { key: 'neuroticism', label: 'Neuroticism', description: 'Emotional instability, anxiety, moodiness' },
];

export default function PersonalityMatrix({ data, onChange, editable = false }) {
  const getScore = (key) => data?.[key]?.score || 50;
  const getEvidence = (key) => data?.[key]?.evidence || '';

  const handleChange = (key, field, value) => {
    if (!editable) return;
    onChange({
      ...data,
      [key]: {
        ...data?.[key],
        [field]: value
      }
    });
  };

  const getBarColor = (score) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-5">
      {traits.map((trait) => {
        const score = getScore(trait.key);
        return (
          <div key={trait.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-200">{trait.label}</h4>
                <p className="text-xs text-slate-500">{trait.description}</p>
              </div>
              <span className="text-sm font-mono text-slate-400">{score}%</span>
            </div>
            
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500", getBarColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
            
            {editable ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => handleChange(trait.key, 'score', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <textarea
                  placeholder="Evidence supporting this assessment..."
                  value={getEvidence(trait.key)}
                  onChange={(e) => handleChange(trait.key, 'evidence', e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-300 placeholder:text-slate-600 resize-none"
                  rows={2}
                />
              </div>
            ) : getEvidence(trait.key) && (
              <p className="text-xs text-slate-500 italic">
                "{getEvidence(trait.key)}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}