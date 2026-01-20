import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

export default function ActionResponseMatrix({ data = [], onChange, editable = false }) {
  const [newScenario, setNewScenario] = useState('');
  const [newResponse, setNewResponse] = useState('');

  const addPrediction = () => {
    if (!newScenario.trim() || !newResponse.trim()) return;
    onChange([...data, { scenario: newScenario, response: newResponse }]);
    setNewScenario('');
    setNewResponse('');
  };

  const removePrediction = (index) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updatePrediction = (index, field, value) => {
    const updated = data.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div 
          key={index}
          className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase text-amber-500 font-medium tracking-wider">IF</span>
                {editable ? (
                  <Input
                    value={item.scenario}
                    onChange={(e) => updatePrediction(index, 'scenario', e.target.value)}
                    placeholder="Scenario X occurs..."
                    className="flex-1 h-8 bg-slate-800/50 border-slate-700 text-slate-200 text-sm"
                  />
                ) : (
                  <span className="text-sm text-slate-300">{item.scenario}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 pl-4">
                <ArrowRight className="h-4 w-4 text-slate-600" />
                <span className="text-xs uppercase text-emerald-500 font-medium tracking-wider">THEN</span>
                {editable ? (
                  <Input
                    value={item.response}
                    onChange={(e) => updatePrediction(index, 'response', e.target.value)}
                    placeholder="Subject likely does Y..."
                    className="flex-1 h-8 bg-slate-800/50 border-slate-700 text-slate-200 text-sm"
                  />
                ) : (
                  <span className="text-sm text-slate-300">{item.response}</span>
                )}
              </div>
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
      ))}

      {editable && (
        <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase text-slate-500 font-medium tracking-wider">IF</span>
            <Input
              value={newScenario}
              onChange={(e) => setNewScenario(e.target.value)}
              placeholder="Enter scenario..."
              className="flex-1 h-8 bg-slate-900/50 border-slate-700 text-slate-200 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 pl-4">
            <ArrowRight className="h-4 w-4 text-slate-700" />
            <span className="text-xs uppercase text-slate-500 font-medium tracking-wider">THEN</span>
            <Input
              value={newResponse}
              onChange={(e) => setNewResponse(e.target.value)}
              placeholder="Predicted response..."
              className="flex-1 h-8 bg-slate-900/50 border-slate-700 text-slate-200 text-sm"
            />
          </div>
          <Button
            onClick={addPrediction}
            disabled={!newScenario.trim() || !newResponse.trim()}
            variant="outline"
            size="sm"
            className="w-full border-slate-700 text-slate-400 hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prediction
          </Button>
        </div>
      )}

      {data.length === 0 && !editable && (
        <p className="text-sm text-slate-500 text-center py-4">
          No predictions defined
        </p>
      )}
    </div>
  );
}