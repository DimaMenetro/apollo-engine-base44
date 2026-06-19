import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassBtnSecondary } from '../ui/LiquidGlass';

export default function ActionResponseMatrix({ data = [], onChange, editable = false }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const [newPrediction, setNewPrediction] = useState({
    trigger: '', context: '', predicted_behavior: '',
    probability: 75, confidence_interval: { lower: 60, upper: 85 }, temporal_factors: '',
  });

  const addPrediction = () => {
    if (!newPrediction.trigger.trim() || !newPrediction.predicted_behavior.trim()) return;
    onChange([...data, { ...newPrediction }]);
    setNewPrediction({ trigger: '', context: '', predicted_behavior: '', probability: 75, confidence_interval: { lower: 60, upper: 85 }, temporal_factors: '' });
  };

  const removePrediction = (index) => onChange(data.filter((_, i) => i !== index));

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

  const getProbabilityStyle = (prob) => {
    if (prob >= 80) return { color: '#10b981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.25)' };
    if (prob >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.25)' };
    return { color: '#f43f5e', bg: 'rgba(244,63,94,0.10)', border: 'rgba(244,63,94,0.25)' };
  };

  const cardBg    = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const inputStyle = {
    width: '100%', padding: '8px 12px', fontSize: 13, borderRadius: 8,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
    color: t.title, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: 60, lineHeight: 1.6 };
  const sectionLabel = (color) => ({ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((item, index) => {
        const isLegacy = item.scenario && item.response;
        const trigger = isLegacy ? item.scenario : item.trigger;
        const behavior = isLegacy ? item.response : item.predicted_behavior;
        const probability = item.probability || 75;
        const context = item.context || '';
        const temporal = item.temporal_factors || '';
        const confInterval = item.confidence_interval || { lower: probability - 15, upper: probability + 10 };
        const probStyle = getProbabilityStyle(probability);

        // Read-only mode: probability sits inline top-right, text uses full width.
        if (!editable) {
          return (
            <div key={index} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${cardBorder}` }}>
              {/* Top row: trigger (full width) + compact probability badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={sectionLabel('#f59e0b')}>TRIGGER EVENT</div>
                  <p style={{ color: t.text, margin: 0, fontSize: 14 }}>{trigger}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <div style={{ padding: '10px 18px', borderRadius: 12, textAlign: 'center', minWidth: 96, background: probStyle.bg, border: `1px solid ${probStyle.border}` }}>
                    <p style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: probStyle.color, opacity: 0.8, margin: '0 0 2px' }}>Probability</p>
                    <p style={{ fontSize: 24, fontWeight: 300, color: probStyle.color, margin: 0 }}>{probability}%</p>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.muted }}>
                    CI: [{confInterval.lower}%, {confInterval.upper}%]
                  </span>
                </div>
              </div>

              {/* Full-width content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {context && (
                  <div>
                    <div style={sectionLabel(t.label)}>
                      <AlertCircle style={{ width: 11, height: 11 }} />
                      CONTEXTUAL FACTORS
                    </div>
                    <p style={{ color: t.muted, margin: 0, fontSize: 13 }}>{context}</p>
                  </div>
                )}
                <div>
                  <div style={sectionLabel('#10b981')}>
                    <TrendingUp style={{ width: 11, height: 11 }} />
                    PREDICTED BEHAVIOR
                  </div>
                  <p style={{ color: t.text, margin: 0, fontSize: 14, lineHeight: 1.65 }}>{behavior}</p>
                </div>
                {temporal && (
                  <div>
                    <div style={sectionLabel('#8b5cf6')}>
                      <Clock style={{ width: 11, height: 11 }} />
                      TEMPORAL FACTORS
                    </div>
                    <p style={{ color: t.muted, margin: 0, fontSize: 13 }}>{temporal}</p>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div key={index} style={{ padding: 20, borderRadius: 16, background: cardBg, border: `1px solid ${cardBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Left: content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Trigger */}
                <div>
                  <div style={sectionLabel('#f59e0b')}>TRIGGER EVENT</div>
                  {editable ? (
                    <input value={trigger} onChange={(e) => updatePrediction(index, isLegacy ? 'scenario' : 'trigger', e.target.value)}
                      placeholder="e.g., Confronted with unexpected criticism" style={inputStyle} />
                  ) : (
                    <p style={{ color: t.text, margin: 0, fontSize: 14 }}>{trigger}</p>
                  )}
                </div>

                {/* Context */}
                {(context || editable) && (
                  <div>
                    <div style={sectionLabel(t.label)}>
                      <AlertCircle style={{ width: 11, height: 11 }} />
                      CONTEXTUAL FACTORS
                    </div>
                    {editable ? (
                      <textarea value={context} onChange={(e) => updatePrediction(index, 'context', e.target.value)}
                        placeholder="Environmental, social, or situational factors..." style={textareaStyle} />
                    ) : context ? (
                      <p style={{ color: t.muted, margin: 0, fontSize: 13 }}>{context}</p>
                    ) : null}
                  </div>
                )}

                {/* Predicted Behavior */}
                <div>
                  <div style={sectionLabel('#10b981')}>
                    <TrendingUp style={{ width: 11, height: 11 }} />
                    PREDICTED BEHAVIOR
                  </div>
                  {editable ? (
                    <textarea value={behavior} onChange={(e) => updatePrediction(index, isLegacy ? 'response' : 'predicted_behavior', e.target.value)}
                      placeholder="Describe the expected behavioral response..." style={textareaStyle} />
                  ) : (
                    <p style={{ color: t.text, margin: 0, fontSize: 14, lineHeight: 1.65 }}>{behavior}</p>
                  )}
                </div>

                {/* Temporal */}
                {(temporal || editable) && (
                  <div>
                    <div style={sectionLabel('#8b5cf6')}>
                      <Clock style={{ width: 11, height: 11 }} />
                      TEMPORAL FACTORS
                    </div>
                    {editable ? (
                      <input value={temporal} onChange={(e) => updatePrediction(index, 'temporal_factors', e.target.value)}
                        placeholder="Timing, duration, and temporal patterns" style={inputStyle} />
                    ) : temporal ? (
                      <p style={{ color: t.muted, margin: 0, fontSize: 13 }}>{temporal}</p>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Right: probability + CI */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                <div style={{ padding: '14px 20px', borderRadius: 14, textAlign: 'center', minWidth: 110, background: probStyle.bg, border: `1px solid ${probStyle.border}` }}>
                  <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: probStyle.color, opacity: 0.8, margin: '0 0 4px' }}>Probability</p>
                  <p style={{ fontSize: 26, fontWeight: 300, color: probStyle.color, margin: 0 }}>{probability}%</p>
                  {editable && (
                    <input type="range" min="0" max="100" value={probability}
                      onChange={(e) => updatePrediction(index, 'probability', parseInt(e.target.value))}
                      style={{ width: '100%', marginTop: 8, accentColor: probStyle.color }} />
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: t.muted }}>
                    CI: [{confInterval.lower}%, {confInterval.upper}%]
                  </span>
                  {editable && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                      <input type="number" min="0" max="100" value={confInterval.lower}
                        onChange={(e) => updatePrediction(index, 'confidence_interval.lower', parseInt(e.target.value))}
                        style={{ width: 48, padding: '2px 6px', fontSize: 11, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, color: t.title, outline: 'none' }} />
                      <input type="number" min="0" max="100" value={confInterval.upper}
                        onChange={(e) => updatePrediction(index, 'confidence_interval.upper', parseInt(e.target.value))}
                        style={{ width: 48, padding: '2px 6px', fontSize: 11, borderRadius: 6, background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, color: t.title, outline: 'none' }} />
                    </div>
                  )}
                </div>

                {editable && (
                  <button onClick={() => removePrediction(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.muted, padding: 4 }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Add new prediction form */}
      {editable && (
        <div style={{ padding: 20, borderRadius: 16, border: `2px dashed ${cardBorder}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h4 style={{ fontSize: 12, fontWeight: 600, color: t.label, margin: 0 }}>Add New Prediction</h4>

          <div>
            <label style={{ ...sectionLabel('#f59e0b'), marginBottom: 6 }}>Trigger Event *</label>
            <input value={newPrediction.trigger} onChange={(e) => setNewPrediction({ ...newPrediction, trigger: e.target.value })}
              placeholder="What event triggers this behavior?" style={inputStyle} />
          </div>

          <div>
            <label style={{ ...sectionLabel(t.label), marginBottom: 6 }}>Contextual Factors</label>
            <textarea value={newPrediction.context} onChange={(e) => setNewPrediction({ ...newPrediction, context: e.target.value })}
              placeholder="Environmental, social, or situational factors..." style={textareaStyle} />
          </div>

          <div>
            <label style={{ ...sectionLabel('#10b981'), marginBottom: 6 }}>Predicted Behavior *</label>
            <textarea value={newPrediction.predicted_behavior} onChange={(e) => setNewPrediction({ ...newPrediction, predicted_behavior: e.target.value })}
              placeholder="Describe the expected behavioral response in detail" style={{ ...textareaStyle, minHeight: 80 }} />
          </div>

          <div>
            <label style={{ ...sectionLabel('#8b5cf6'), marginBottom: 6 }}>Temporal Factors</label>
            <input value={newPrediction.temporal_factors} onChange={(e) => setNewPrediction({ ...newPrediction, temporal_factors: e.target.value })}
              placeholder="Timing, duration, temporal patterns" style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {[['Probability %', 'probability', 'number'], ['CI Lower %', 'confidence_interval.lower', 'number'], ['CI Upper %', 'confidence_interval.upper', 'number']].map(([lbl, field, type]) => (
              <div key={field}>
                <label style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: t.label, display: 'block', marginBottom: 6 }}>{lbl}</label>
                <input type={type} min="0" max="100"
                  value={field.includes('.') ? newPrediction.confidence_interval[field.split('.')[1]] : newPrediction[field]}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    if (field.includes('.')) {
                      const child = field.split('.')[1];
                      setNewPrediction({ ...newPrediction, confidence_interval: { ...newPrediction.confidence_interval, [child]: val } });
                    } else {
                      setNewPrediction({ ...newPrediction, [field]: val });
                    }
                  }}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>

          <button onClick={addPrediction} disabled={!newPrediction.trigger.trim() || !newPrediction.predicted_behavior.trim()}
            style={{ ...glassBtnSecondary(t), padding: '9px 16px', fontSize: 13, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 7, opacity: (!newPrediction.trigger.trim() || !newPrediction.predicted_behavior.trim()) ? 0.5 : 1 }}>
            <Plus style={{ width: 14, height: 14 }} />
            Add Prediction Model
          </button>
        </div>
      )}

      {data.length === 0 && !editable && (
        <p style={{ fontSize: 13, color: t.muted, textAlign: 'center', padding: '32px 0' }}>No predictive models defined</p>
      )}
    </div>
  );
}