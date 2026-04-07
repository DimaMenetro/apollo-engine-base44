import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';

/**
 * NodeConvergenceRadar — overlays Node Alpha (astrology) and Node Beta (numerology)
 * on a shared radar to reveal convergence and divergence across five analytical dimensions.
 * Extracts dimensional scores via keyword heuristics from the raw text.
 */

const DIMENSIONS = [
  { key: 'emotional',  label: 'Emotional Intensity' },
  { key: 'structural', label: 'Structural Stability' },
  { key: 'activation', label: 'Activation Level' },
  { key: 'growth',     label: 'Growth Potential' },
  { key: 'resistance', label: 'Resistance' },
];

const KEYWORD_MAP = {
  emotional:  { high: ['intense','emotional','passion','volatile','deep feeling','anguish','turmoil','fervent'],
                low:  ['detach','cold','numb','suppress','withdraw','flat'] },
  structural: { high: ['stable','discipline','structure','foundation','consistent','order','grounded'],
                low:  ['chaos','unstable','erratic','fragment','dissolv','scatter'] },
  activation: { high: ['active','drive','energy','motivated','dynamic','surge','momentum','ignite'],
                low:  ['passive','stagnant','inert','dormant','low energy','depletion'] },
  growth:     { high: ['growth','transform','evolv','expand','ascend','potential','breakthrough','blossom'],
                low:  ['stunt','regress','stuck','blocked','constrain','diminish'] },
  resistance: { high: ['resist','defend','block','deny','avoid','refuse','guard','cling'],
                low:  ['accept','open','surrender','flow','embrace','adapt','yield'] },
};

function scoreDimension(text, dimension) {
  if (!text) return 50;
  const lower = text.toLowerCase();
  const map = KEYWORD_MAP[dimension];
  let score = 50;
  map.high.forEach(kw => { if (lower.includes(kw)) score += 8; });
  map.low.forEach(kw => { if (lower.includes(kw)) score -= 8; });
  return Math.max(10, Math.min(95, score));
}

export default function NodeConvergenceRadar({ astroText, numText }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const data = useMemo(() => {
    return DIMENSIONS.map(dim => ({
      dimension: dim.label,
      alpha: scoreDimension(astroText, dim.key),
      beta: scoreDimension(numText, dim.key),
    }));
  }, [astroText, numText]);

  // Calculate convergence score — how closely the two nodes agree
  const convergence = useMemo(() => {
    const diffs = data.map(d => Math.abs(d.alpha - d.beta));
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return Math.round(100 - avgDiff);
  }, [data]);

  const convColor = convergence >= 75 ? '#10b981' : convergence >= 50 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 16,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.label }}>
          Node Convergence Map
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '3px 10px', borderRadius: 999,
          background: `${convColor}15`, border: `1px solid ${convColor}30`,
        }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: convColor }}>
            {convergence}%
          </span>
          <span style={{ fontSize: 9, color: convColor, opacity: 0.8 }}>CONVERGENCE</span>
        </div>
      </div>

      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fontSize: 9, fill: t.muted, fontWeight: 500 }}
            />
            <Radar
              name="Node α · Astrology"
              dataKey="alpha"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 3, fill: '#f59e0b' }}
            />
            <Radar
              name="Node β · Numerology"
              dataKey="beta"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.12}
              strokeWidth={2}
              dot={{ r: 3, fill: '#06b6d4' }}
              strokeDasharray="5 3"
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: t.muted }}
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Divergence callouts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {data.filter(d => Math.abs(d.alpha - d.beta) > 20).map(d => (
          <div key={d.dimension} style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 9,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)',
            color: '#f43f5e', fontFamily: 'monospace',
          }}>
            ⚡ {d.dimension}: Δ{Math.abs(d.alpha - d.beta)}
          </div>
        ))}
      </div>
    </div>
  );
}