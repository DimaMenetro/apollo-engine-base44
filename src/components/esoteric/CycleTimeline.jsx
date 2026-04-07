import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

/**
 * CycleTimeline — horizontal timeline showing the numerological personal year
 * cycle across a 9-year span. Highlights the current year position and maps
 * intensity curves to show activation/dormancy patterns over time.
 * Inspired by The Pattern's temporal cycle concept — rendered as a clean data viz.
 */

// Personal Year energy profiles — each year (1-9) has a characteristic intensity
const YEAR_PROFILES = {
  1: { label: 'Initiation',      energy: 85, nature: 'activation' },
  2: { label: 'Partnership',     energy: 55, nature: 'receptive' },
  3: { label: 'Expression',      energy: 78, nature: 'activation' },
  4: { label: 'Foundation',      energy: 45, nature: 'structural' },
  5: { label: 'Change',          energy: 92, nature: 'activation' },
  6: { label: 'Responsibility',  energy: 60, nature: 'structural' },
  7: { label: 'Introspection',   energy: 35, nature: 'receptive' },
  8: { label: 'Power',           energy: 88, nature: 'activation' },
  9: { label: 'Completion',      energy: 70, nature: 'receptive' },
};

function extractCurrentYear(numText, dateOfBirth) {
  // Try to find "Personal Year X" or "personal year: X" in the text
  if (numText) {
    const match = numText.match(/personal\s*year[:\s]*(\d)/i);
    if (match) return parseInt(match[1]);
  }
  // Fallback: calculate from DOB
  if (dateOfBirth) {
    const now = new Date();
    const year = now.getFullYear();
    // Simple reduction: sum digits of birth month + birth day + current year
    const parts = dateOfBirth.match(/\d+/g);
    if (parts && parts.length >= 2) {
      const month = parseInt(parts[0]) || 1;
      const day = parseInt(parts[1]) || 1;
      let sum = month + day + year;
      while (sum > 9 && sum !== 11 && sum !== 22) {
        sum = String(sum).split('').reduce((a, b) => a + parseInt(b), 0);
      }
      return sum > 9 ? 9 : sum;
    }
  }
  return null;
}

function parseTimeframe(timeframe) {
  if (!timeframe) return null;
  const years = timeframe.match(/(\d{4})/g);
  if (years && years.length >= 2) {
    return { start: parseInt(years[0]), end: parseInt(years[1]) };
  }
  return null;
}

export default function CycleTimeline({ numText, dateOfBirth, timeframe }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const currentYear = new Date().getFullYear();

  const personalYear = useMemo(() => extractCurrentYear(numText, dateOfBirth), [numText, dateOfBirth]);
  const tf = useMemo(() => parseTimeframe(timeframe), [timeframe]);

  // Build 9-year cycle data centered around current year or timeframe
  const data = useMemo(() => {
    const startYear = tf?.start || currentYear - 4;
    const endYear = tf?.end || currentYear + 4;
    const points = [];

    for (let y = startYear; y <= endYear; y++) {
      // Determine personal year for this calendar year
      let py = personalYear ? ((personalYear + (y - currentYear)) % 9) : ((y % 9) || 9);
      if (py <= 0) py += 9;
      const profile = YEAR_PROFILES[py];
      points.push({
        year: y,
        energy: profile.energy,
        label: profile.label,
        personalYear: py,
        isCurrent: y === currentYear,
        nature: profile.nature,
      });
    }
    return points;
  }, [personalYear, tf, currentYear]);

  const natureColors = {
    activation: '#f59e0b',
    receptive: '#8b5cf6',
    structural: '#06b6d4',
  };

  if (!personalYear && !tf) return null;

  return (
    <div style={{
      padding: '20px 24px',
      borderRadius: 16,
      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.50)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.14em', color: t.label }}>
          Numerological Cycle Map
        </div>
        {personalYear && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', borderRadius: 999,
            background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
          }}>
            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: '#06b6d4' }}>
              PY{personalYear}
            </span>
            <span style={{ fontSize: 9, color: '#06b6d4', opacity: 0.8 }}>
              {YEAR_PROFILES[personalYear]?.label}
            </span>
          </div>
        )}
      </div>

      <div style={{ width: '100%', height: 160 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="cycleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.30} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="year"
              tick={{ fontSize: 9, fill: t.muted }}
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
                const pt = props.payload;
                return [`PY${pt.personalYear} · ${pt.label} (${value}%)`, 'Energy'];
              }}
              labelFormatter={(label) => `${label}`}
            />
            <ReferenceLine
              x={currentYear}
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 3"
              label={false}
            />
            <Area
              type="monotone"
              dataKey="energy"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#cycleGrad)"
              dot={(props) => {
                const { cx, cy, payload } = props;
                const isCurrent = payload.isCurrent;
                return (
                  <circle
                    key={payload.year}
                    cx={cx}
                    cy={cy}
                    r={isCurrent ? 6 : 3}
                    fill={isCurrent ? '#f59e0b' : natureColors[payload.nature] || '#8b5cf6'}
                    stroke={isCurrent ? '#f59e0b' : 'none'}
                    strokeWidth={isCurrent ? 2 : 0}
                    style={isCurrent ? { filter: 'drop-shadow(0 0 6px rgba(245,158,11,0.5))' } : {}}
                  />
                );
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Nature legend */}
      <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
        {Object.entries(natureColors).map(([nature, color]) => (
          <div key={nature} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 9, color: t.muted, textTransform: 'capitalize' }}>{nature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}