import React, { useState } from 'react';
import { Plus, X, Target, Shield } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';

export default function MotivationsSection({ motivations = [], fears = [], onMotivationsChange, onFearsChange, editable = false }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const [newMotivation, setNewMotivation] = useState('');
  const [newFear, setNewFear] = useState('');

  const addItem = (type) => {
    if (type === 'motivation' && newMotivation.trim()) { onMotivationsChange([...motivations, newMotivation.trim()]); setNewMotivation(''); }
    else if (type === 'fear' && newFear.trim())        { onFearsChange([...fears, newFear.trim()]);                  setNewFear(''); }
  };

  const removeItem = (type, index) => {
    if (type === 'motivation') onMotivationsChange(motivations.filter((_, i) => i !== index));
    else                       onFearsChange(fears.filter((_, i) => i !== index));
  };

  const inputStyle = {
    flex: 1, padding: '8px 12px', fontSize: 13, borderRadius: 8,
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
    color: t.title, outline: 'none', fontFamily: 'inherit',
  };

  const renderList = ({ items, type, accentColor, bgColor, borderColor, icon: Icon, title, placeholder, newVal, setNewVal }) => (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Icon style={{ width: 15, height: 15, color: accentColor }} />
        <h4 style={{ fontSize: 13, fontWeight: 500, color: t.title, margin: 0 }}>{title}</h4>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item, index) => (
          <div key={index} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 10,
            background: bgColor, border: `1px solid ${borderColor}`,
          }}>
            <span style={{ flex: 1, fontSize: 13, color: accentColor }}>{item}</span>
            {editable && (
              <button onClick={() => removeItem(type, index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: accentColor, opacity: 0.5, padding: 0 }}>
                <X style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        ))}

        {editable && (
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newVal} onChange={(e) => setNewVal(e.target.value)}
              placeholder={placeholder} style={inputStyle}
              onKeyDown={(e) => e.key === 'Enter' && addItem(type)} />
            <button onClick={() => addItem(type)} disabled={!newVal.trim()} style={{
              padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: bgColor, color: accentColor, opacity: !newVal.trim() ? 0.4 : 1,
            }}>
              <Plus style={{ width: 14, height: 14 }} />
            </button>
          </div>
        )}

        {items.length === 0 && !editable && (
          <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>No {title.toLowerCase()} identified</p>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
      {renderList({ items: motivations, type: 'motivation', accentColor: '#10b981', bgColor: 'rgba(16,185,129,0.10)', borderColor: 'rgba(16,185,129,0.20)', icon: Target,  title: 'Core Motivations', placeholder: 'Add motivation...', newVal: newMotivation, setNewVal: setNewMotivation })}
      {renderList({ items: fears,       type: 'fear',       accentColor: '#f43f5e', bgColor: 'rgba(244,63,94,0.10)',  borderColor: 'rgba(244,63,94,0.20)',  icon: Shield, title: 'Core Fears',       placeholder: 'Add fear...',       newVal: newFear,        setNewVal: setNewFear })}
    </div>
  );
}