import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionResponseMatrix({ data = [], onChange, editable = false }) {
  const [newPrediction, setNewPrediction] = useState({
    trigger: '',
    context: '',
    predicted_behavior: '',
    probability: 75,
    confidence_interval: { lower: 60, upper: 85 },
    temporal_factors: '',
    alternative_responses: []
  });

  const addPrediction = () => {
    if (!newPrediction.trigger.trim() || !newPrediction.predicted_behavior.trim()) return;
    onChange([...data, { ...newPrediction }]);
    setNewPrediction({
      trigger: '',
      context: '',
      predicted_behavior: '',
      probability: 75,
      confidence_interval: { lower: 60, upper: 85 },
      temporal_factors: '',
      alternative_responses: []
    });
  };

  const removePrediction = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updatePrediction = (index, field, value) => {
    const updated = data.map((item, i) => {
      if (i !== index) return item;
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return { ...item, [parent]: { ...item[parent], [child]: value } };
      }
      return { ...item, [field]: value };
    });
    onChange(updated);
  };

  const getProbabilityColor = (prob) => {
    if (prob >= 80) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
    if (prob >= 60) return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        // Support legacy format
        const isLegacy = item.scenario && item.response;
        const trigger = isLegacy ? item.scenario : item.trigger;
        const behavior = isLegacy ? item.response : item.predicted_behavior;
        const probability = item.probability || 75;
        const context = item.context || '';
        const temporal = item.temporal_factors || '';
        const confInterval = item.confidence_interval || { lower: probability - 15, upper: probability + 10 };

        return (
          <div 
            key={index}
            className="p-5 bg-slate-900/50 rounded-xl border border-slate-800 space-y-4"
          >
            {/* Header with Probability */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Trigger */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs uppercase text-amber-500 font-medium tracking-wider">TRIGGER EVENT</span>
                  </div>
                  {editable ? (
                    <Input
                      value={trigger}
                      onChange={(e) => updatePrediction(index, isLegacy ? 'scenario' : 'trigger', e.target.value)}
                      placeholder="e.g., Confronted with unexpected criticism"
                      className="bg-slate-800/50 border-slate-700 text-slate-200"
                    />
                  ) : (
                    <p className="text-slate-300">{trigger}</p>
                  )}
                </div>

                {/* Context */}
                {(context || editable) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-3.5 w-3.5 text-slate-600" />
                      <span className="text-xs uppercase text-slate-600 font-medium tracking-wider">CONTEXTUAL FACTORS</span>
                    </div>
                    {editable ? (
                      <Textarea
                        value={context}
                        onChange={(e) => updatePrediction(index, 'context', e.target.value)}
                        placeholder="e.g., In public setting with authority figures present"
                        className="min-h-[60px] bg-slate-800/50 border-slate-700 text-slate-300 text-sm"
                      />
                    ) : context ? (
                      <p className="text-sm text-slate-400">{context}</p>
                    ) : null}
                  </div>
                )}

                {/* Predicted Behavior */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs uppercase text-emerald-500 font-medium tracking-wider">PREDICTED BEHAVIOR</span>
                  </div>
                  {editable ? (
                    <Textarea
                      value={behavior}
                      onChange={(e) => updatePrediction(index, isLegacy ? 'response' : 'predicted_behavior', e.target.value)}
                      placeholder="e.g., Will deflect responsibility and shift blame to external factors while maintaining composed demeanor"
                      className="min-h-[60px] bg-slate-800/50 border-slate-700 text-slate-200"
                    />
                  ) : (
                    <p className="text-slate-300">{behavior}</p>
                  )}
                </div>

                {/* Temporal Factors */}
                {(temporal || editable) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3.5 w-3.5 text-violet-500" />
                      <span className="text-xs uppercase text-violet-500 font-medium tracking-wider">TEMPORAL FACTORS</span>
                    </div>
                    {editable ? (
                      <Input
                        value={temporal}
                        onChange={(e) => updatePrediction(index, 'temporal_factors', e.target.value)}
                        placeholder="e.g., Response typically emerges within 2-5 seconds, sustained for 10+ minutes"
                        className="bg-slate-800/50 border-slate-700 text-slate-300 text-sm"
                      />
                    ) : temporal ? (
                      <p className="text-sm text-slate-400">{temporal}</p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Probability Card */}
              <div className="flex flex-col items-end gap-3">
                <div className={cn(
                  "px-4 py-3 rounded-xl border text-center min-w-[120px]",
                  getProbabilityColor(probability)
                )}>
                  <p className="text-xs uppercase tracking-wider opacity-70 mb-1">Probability</p>
                  <p className="text-2xl font-light">{probability}%</p>
                  {editable && (
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={probability}
                      onChange={(e) => updatePrediction(index, 'probability', parseInt(e.target.value))}
                      className="w-full h-1 mt-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                  )}
                </div>

                {/* Confidence Interval */}
                <div className="text-center text-xs text-slate-500">
                  <span className="font-mono">CI: [{confInterval.lower}%, {confInterval.upper}%]</span>
                  {editable && (
                    <div className="flex gap-1 mt-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={confInterval.lower}
                        onChange={(e) => updatePrediction(index, 'confidence_interval.lower', parseInt(e.target.value))}
                        className="w-12 h-6 px-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300"
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={confInterval.upper}
                        onChange={(e) => updatePrediction(index, 'confidence_interval.upper', parseInt(e.target.value))}
                        className="w-12 h-6 px-1 text-xs bg-slate-800 border border-slate-700 rounded text-slate-300"
                      />
                    </div>
                  )}
                </div>

                {editable && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePrediction(index)}
                    className="h-8 w-8 text-slate-500 hover:text-rose-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {editable && (
        <div className="p-5 border-2 border-dashed border-slate-800 rounded-xl space-y-4">
          <h4 className="text-sm font-medium text-slate-400">Add New Prediction</h4>
          
          <div>
            <label className="text-xs uppercase tracking-wider text-amber-500 mb-2 block">
              Trigger Event *
            </label>
            <Input
              value={newPrediction.trigger}
              onChange={(e) => setNewPrediction({ ...newPrediction, trigger: e.target.value })}
              placeholder="What event triggers this behavior?"
              className="bg-slate-900/50 border-slate-700 text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-600 mb-2 block">
              Contextual Factors
            </label>
            <Textarea
              value={newPrediction.context}
              onChange={(e) => setNewPrediction({ ...newPrediction, context: e.target.value })}
              placeholder="Environmental, social, or situational factors that influence the response"
              className="min-h-[60px] bg-slate-900/50 border-slate-700 text-slate-300 text-sm"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-emerald-500 mb-2 block">
              Predicted Behavior *
            </label>
            <Textarea
              value={newPrediction.predicted_behavior}
              onChange={(e) => setNewPrediction({ ...newPrediction, predicted_behavior: e.target.value })}
              placeholder="Describe the expected behavioral response in detail"
              className="min-h-[80px] bg-slate-900/50 border-slate-700 text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-violet-500 mb-2 block">
              Temporal Factors
            </label>
            <Input
              value={newPrediction.temporal_factors}
              onChange={(e) => setNewPrediction({ ...newPrediction, temporal_factors: e.target.value })}
              placeholder="Timing, duration, and temporal patterns"
              className="bg-slate-900/50 border-slate-700 text-slate-300 text-sm"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-600 mb-2 block">
                Probability %
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newPrediction.probability}
                onChange={(e) => setNewPrediction({ ...newPrediction, probability: parseInt(e.target.value) || 0 })}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-600 mb-2 block">
                CI Lower %
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newPrediction.confidence_interval.lower}
                onChange={(e) => setNewPrediction({ 
                  ...newPrediction, 
                  confidence_interval: { ...newPrediction.confidence_interval, lower: parseInt(e.target.value) || 0 }
                })}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-600 mb-2 block">
                CI Upper %
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newPrediction.confidence_interval.upper}
                onChange={(e) => setNewPrediction({ 
                  ...newPrediction, 
                  confidence_interval: { ...newPrediction.confidence_interval, upper: parseInt(e.target.value) || 0 }
                })}
                className="bg-slate-900/50 border-slate-700 text-slate-200"
              />
            </div>
          </div>

          <Button
            onClick={addPrediction}
            disabled={!newPrediction.trigger.trim() || !newPrediction.predicted_behavior.trim()}
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-400 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prediction Model
          </Button>
        </div>
      )}

      {data.length === 0 && !editable && (
        <p className="text-sm text-slate-500 text-center py-8">
          No predictive models defined
        </p>
      )}
    </div>
  );
}