import React, { useState } from 'react';
import { CheckCircle2, Loader2, Circle, AlertTriangle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmotionRadarChart from '../visualizations/EmotionRadarChart';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';

const statusConfig = {
  pending:  { icon: Circle,        spin: false },
  running:  { icon: Loader2,       spin: true  },
  complete: { icon: CheckCircle2,  spin: false },
  conflict: { icon: AlertTriangle, spin: false },
  error:    { icon: AlertTriangle, spin: false },
};

const accentColors = {
  amber:   '#f59e0b',
  violet:  '#8b5cf6',
  rose:    '#f43f5e',
  emerald: '#10b981',
  cyan:    '#06b6d4',
};

const statusColors = {
  pending:  '#64748b',
  running:  '#f59e0b',
  complete: '#10b981',
  conflict: '#f43f5e',
  error:    '#f43f5e',
};

export default function AnalysisModule({ title, description, outputLabel, status = 'pending', result, icon: Icon, color = 'amber', moduleKey }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [expanded, setExpanded] = useState(false);

  const statusInfo  = statusConfig[status];
  const StatusIcon  = statusInfo.icon;
  const accent      = accentColors[color];
  const statusColor = statusColors[status];

  const getEmotionData = () => {
    if (moduleKey !== 'affective_state' || !result) return null;
    try {
      return (result.indicators || [])
        .filter(ind => ind.includes(':'))
        .map(ind => { const [name, scoreStr] = ind.split(':'); return { name: name.trim().toLowerCase(), score: parseFloat(scoreStr) || 0 }; })
        .filter(e => e.score > 0);
    } catch { return null; }
  };

  const emotionData = getEmotionData();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ ...glassCard(t), padding: 20, borderLeft: `2px solid ${accent}40` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        {/* Icon */}
        <div style={{ padding: 10, borderRadius: 10, background: `${accent}15`, flexShrink: 0 }}>
          <Icon style={{ width: 18, height: 18, color: accent }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h3 style={{ fontWeight: 500, color: t.title, fontSize: 14, margin: 0 }}>{title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: statusColor, fontSize: 12 }}>
              <StatusIcon style={{ width: 14, height: 14, animation: statusInfo.spin ? 'spin 1s linear infinite' : 'none' }} />
              <span style={{ textTransform: 'capitalize' }}>{status}</span>
            </div>
          </div>

          <p style={{ fontSize: 13, color: t.muted, margin: '0 0 12px' }}>{description}</p>

          {/* Output badge */}
          <div style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 13, display: 'inline-flex', gap: 6,
            background: `${statusColor}15`,
          }}>
            <span style={{ color: t.muted }}>Output: </span>
            <span style={{ fontWeight: 500, color: (status === 'complete' || status === 'conflict') ? statusColor : t.muted }}>
              {status === 'complete' || status === 'conflict' ? outputLabel : 'Awaiting analysis...'}
            </span>
          </div>

          {/* Results */}
          {result && status === 'complete' && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {result.summary && (
                <div>
                  <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 6 }}>Summary</h4>
                  <p style={{ fontSize: 13, color: t.text, lineHeight: 1.65, margin: 0 }}>{result.summary}</p>
                </div>
              )}

              {emotionData?.length > 0 && (
                <div>
                  <button onClick={() => setExpanded(!expanded)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    background: 'none', border: 'none', cursor: 'pointer', color: t.muted, fontSize: 10,
                    textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6, padding: 0,
                  }}>
                    <span>Emotion Distribution</span>
                    <ChevronDown style={{ width: 12, height: 12, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                        <EmotionRadarChart emotionData={emotionData} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {result.key_patterns?.length > 0 && (
                <div>
                  <h4 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, marginBottom: 8 }}>Key Patterns</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.key_patterns.slice(0, 3).map((pattern, i) => (
                      <li key={i} style={{ fontSize: 13, color: t.text, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: accent, marginTop: 1, flexShrink: 0 }}>•</span>
                        <span>{pattern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}