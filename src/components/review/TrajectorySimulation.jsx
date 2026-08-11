import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { Cpu, History, GitFork, Zap, ShieldOff, HelpCircle } from 'lucide-react';

// Renders the "tiny Chronologos" simulation fields of a prediction:
// mechanism derivation, forward trajectory sequence, branches, modifiers,
// uncertainty, and the pattern-recurrence vs forward-inference distinction.
// Read-only — these are architecture-derived outputs, edited via regeneration.
export default function TrajectorySimulation({ item }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const hasSimulation = item.architecture_mechanism || item.trajectory?.length > 0;
  if (!hasSimulation) return null;

  const label = (color) => ({ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, color, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 });
  const body = { color: t.text, margin: 0, fontSize: 13, lineHeight: 1.6 };
  const muted = { color: t.muted, margin: 0, fontSize: 13, lineHeight: 1.6 };
  const divider = `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`;

  const isForward = item.inference_class === 'forward_inference';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14, borderTop: divider }}>
      {/* Inference class badge */}
      {item.inference_class && (
        <span style={{
          alignSelf: 'flex-start', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          padding: '3px 10px', borderRadius: 999,
          background: isForward ? 'rgba(139,92,246,0.12)' : 'rgba(6,182,212,0.12)',
          color: isForward ? '#8b5cf6' : '#06b6d4',
          border: `1px solid ${isForward ? 'rgba(139,92,246,0.30)' : 'rgba(6,182,212,0.30)'}`,
        }}>
          {isForward ? 'Forward Inference' : 'Pattern Recurrence'}
        </span>
      )}

      {item.observed_basis && (
        <div>
          <div style={label('#06b6d4')}><History style={{ width: 11, height: 11 }} />Observed Basis</div>
          <p style={muted}>{item.observed_basis}</p>
        </div>
      )}

      {item.architecture_mechanism && (
        <div>
          <div style={label('#8b5cf6')}><Cpu style={{ width: 11, height: 11 }} />Architecture Mechanism</div>
          <p style={body}>{item.architecture_mechanism}</p>
        </div>
      )}

      {/* Trajectory — the predicted sequence is the product */}
      {item.trajectory?.length > 0 && (
        <div>
          <div style={label('#10b981')}><GitFork style={{ width: 11, height: 11 }} />Predicted Trajectory</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {item.trajectory.map((step, i) => (
              <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  flexShrink: 0, width: 20, height: 20, borderRadius: '50%', fontSize: 10, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.25)',
                }}>{i + 1}</span>
                <p style={{ ...body, paddingTop: 1 }}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {item.branches?.length > 0 && (
        <div>
          <div style={label('#f59e0b')}><GitFork style={{ width: 11, height: 11 }} />Alternative Branches</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {item.branches.map((b, i) => (
              <div key={i} style={{ padding: '8px 12px', borderRadius: 10, background: isDark ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
                <p style={{ ...body, fontSize: 12, color: '#f59e0b', marginBottom: 3 }}>IF: {b.condition}</p>
                <p style={{ ...muted, fontSize: 12 }}>→ {b.path}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(item.accelerants || item.interrupters) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {item.accelerants && (
            <div>
              <div style={label('#f43f5e')}><Zap style={{ width: 11, height: 11 }} />Accelerants</div>
              <p style={{ ...muted, fontSize: 12 }}>{item.accelerants}</p>
            </div>
          )}
          {item.interrupters && (
            <div>
              <div style={label('#10b981')}><ShieldOff style={{ width: 11, height: 11 }} />Interrupters</div>
              <p style={{ ...muted, fontSize: 12 }}>{item.interrupters}</p>
            </div>
          )}
        </div>
      )}

      {item.least_certain && (
        <div>
          <div style={label(t.label)}><HelpCircle style={{ width: 11, height: 11 }} />Least Certain</div>
          <p style={{ ...muted, fontSize: 12, fontStyle: 'italic' }}>{item.least_certain}</p>
        </div>
      )}
    </div>
  );
}