import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer,
  Tooltip, Legend, Cell,
} from 'recharts';
import { Sparkles } from 'lucide-react';

/**
 * PersonalityArchetypalChart — Phase 3d visual #2
 * Combined bar chart showing Big Five personality scores (empirical, from DSP)
 * alongside an archetypal resonance heuristic (derived from esoteric numerological
 * interpretation via keyword scoring). This lets an analyst see at a glance where
 * empirical personality data aligns with or diverges from the archetypal structure.
 */

const TRAITS = [
  { key: 'openness',          short: 'O' },
  { key: 'conscientiousness', short: 'C' },
  { key: 'extraversion',      short: 'E' },
  { key: 'agreeableness',     short: 'A' },
  { key: 'neuroticism',       short: 'N' },
];

// Keyword heuristic to derive approximate archetypal positioning from numerological text
const ARCHETYPE_KEYWORDS = {
  openness:          { high: ['transform','evolv','expand','creative','vision','imagination','spiritual','growth','blossom','curiosity'], low: ['rigid','fixed','convention','traditional','narrow','closed'] },
  conscientiousness: { high: ['discipline','structure','foundation','order','stable','consistent','duty','responsibility','ground','methodical'], low: ['chaos','scatter','erratic','impulsive','disorganized','reckless'] },
  extraversion:      { high: ['active','energy','social','dynamic','engage','connect','surge','momentum','expression','outward'], low: ['introvert','withdraw','solitude','introspect','inward','retreat','quiet'] },
  agreeableness:     { high: ['compassion','harmony','cooperat','empathy','nurtur','support','gentle','yielding','trust','altruistic'], low: ['conflict','resist','defy','oppos','stubborn','combative','self-interest'] },
  neuroticism:       { high: ['anxiety','tension','volatile','turmoil','fear','anguish','overwhelm','fragile','crisis','unstable'], low: ['calm','serene','resilient','stable','balanced','secure','grounded','peaceful'] },
};

function scoreArchetype(text, traitKey) {
  if (!text) return 50;
  const lower = text.toLowerCase();
  const map = ARCHETYPE_KEYWORDS[traitKey];
  let score = 50;
  map.high.forEach(kw => { if (lower.includes(kw)) score += 7; });
  map.low.forEach(kw =>  { if (lower.includes(kw)) score -= 7; });
  return Math.max(5, Math.min(95, score));
}

export default function PersonalityArchetypalChart({ personalityMatrix, numText }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const data = useMemo(() => {
    if (!personalityMatrix) return [];
    return TRAITS.map(trait => ({
      name: trait.short,
      fullName: trait.key.charAt(0).toUpperCase() + trait.key.slice(1),
      empirical: personalityMatrix[trait.key]?.score ?? 50,
      archetypal: scoreArchetype(numText, trait.key),
    }));
  }, [personalityMatrix, numText]);

  if (!data.length) return null;

  // Calculate average delta for divergence callout
  const avgDelta = Math.round(
    data.reduce((sum, d) => sum + Math.abs(d.empirical - d.archetypal), 0) / data.length
  );
  const alignmentLabel = avgDelta <= 10 ? 'High Alignment' : avgDelta <= 20 ? 'Moderate Alignment' : 'Significant Divergence';
  const alignmentColor = avgDelta <= 10 ? '#10b981' : avgDelta <= 20 ? '#f59e0b' : '#f43f5e';

  return (
    <div style={{ ...glassCard(t), padding: 24, borderTop: `2px solid #f59e0b40` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles style={{ width: 14, height: 14, color: '#f59e0b' }} />
          <span style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: t.label,
          }}>
            Personality–Archetypal Resonance
          </span>
        </div>
        <span style={{
          fontSize: 9, fontFamily: 'monospace', padding: '3px 10px', borderRadius: 999,
          background: `${alignmentColor}15`, color: alignmentColor,
          border: `1px solid ${alignmentColor}30`,
        }}>
          Δ{avgDelta} · {alignmentLabel}
        </span>
      </div>

      <div style={{ width: '100%', height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data} barGap={2} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: t.muted, fontWeight: 600 }}
              axisLine={{ stroke: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
              tickLine={false}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{
                background: isDark ? 'rgba(14,16,24,0.95)' : 'rgba(255,255,255,0.97)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)'}`,
                borderRadius: 10, fontSize: 11, color: t.text,
                backdropFilter: 'blur(20px)', padding: '8px 12px',
              }}
              formatter={(value, name, props) => {
                return [`${value}%`, name === 'empirical' ? 'DSP (Empirical)' : 'Archetypal (Esoteric)'];
              }}
              labelFormatter={(label) => {
                const match = data.find(d => d.name === label);
                return match?.fullName || label;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: t.muted }}
              iconSize={8}
              formatter={(value) => value === 'empirical' ? 'DSP' : 'Archetypal'}
            />
            <Bar dataKey="empirical" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="archetypal" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={28} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Divergence callouts */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {data.filter(d => Math.abs(d.empirical - d.archetypal) > 15).map(d => (
          <div key={d.name} style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 9,
            background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)',
            color: '#8b5cf6', fontFamily: 'monospace',
          }}>
            {d.fullName}: Δ{Math.abs(d.empirical - d.archetypal)}
          </div>
        ))}
      </div>
    </div>
  );
}