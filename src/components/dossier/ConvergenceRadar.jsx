import React, { useMemo } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Legend,
} from 'recharts';
import { Waypoints } from 'lucide-react';

/**
 * ConvergenceRadar — Phase 3d visual #1
 * Overlays DSP and Esoteric agreement per analytical domain
 * on a shared radar chart. Data comes from the unified_dossier
 * convergence_map.convergence_points (each with domain + confidence).
 *
 * Divergence points are plotted as a secondary axis to show where
 * the two lenses disagree, mapped to tension severity.
 */

const TENSION_SCORE = { low: 25, medium: 55, high: 85 };

export default function ConvergenceRadar({ convergenceMap }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const data = useMemo(() => {
    if (!convergenceMap) return [];
    const { convergence_points = [], divergence_points = [] } = convergenceMap;

    // Build a domain → scores map
    const domainMap = {};

    convergence_points.forEach(pt => {
      if (!pt.domain) return;
      domainMap[pt.domain] = {
        domain: pt.domain,
        agreement: pt.confidence ?? 70,
        tension: 0,
      };
    });

    divergence_points.forEach(pt => {
      if (!pt.domain) return;
      if (!domainMap[pt.domain]) {
        domainMap[pt.domain] = { domain: pt.domain, agreement: 0, tension: 0 };
      }
      domainMap[pt.domain].tension = TENSION_SCORE[pt.tension_value] || 40;
    });

    return Object.values(domainMap);
  }, [convergenceMap]);

  if (!data.length) return null;

  const scoreColor = (convergenceMap?.overall_alignment_score ?? 0) >= 75
    ? '#10b981'
    : (convergenceMap?.overall_alignment_score ?? 0) >= 50
      ? '#f59e0b'
      : '#f43f5e';

  return (
    <div style={{ ...glassCard(t), padding: 24, borderTop: `2px solid ${scoreColor}40` }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Waypoints style={{ width: 14, height: 14, color: scoreColor }} />
        <span style={{
          fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: t.label,
        }}>
          Domain Convergence Radar
        </span>
      </div>

      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="72%">
            <PolarGrid
              stroke={isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}
              strokeDasharray="3 3"
            />
            <PolarAngleAxis
              dataKey="domain"
              tick={{ fontSize: 9, fill: t.muted, fontWeight: 500 }}
            />
            <Radar
              name="Agreement"
              dataKey="agreement"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.15}
              strokeWidth={2}
              dot={{ r: 3, fill: '#10b981' }}
            />
            <Radar
              name="Tension"
              dataKey="tension"
              stroke="#f43f5e"
              fill="#f43f5e"
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="5 3"
              dot={{ r: 2.5, fill: '#f43f5e' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, color: t.muted }}
              iconSize={8}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Domain callouts for high tension */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
        {data.filter(d => d.tension >= 55).map(d => (
          <div key={d.domain} style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 9,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.20)',
            color: '#f43f5e', fontFamily: 'monospace',
          }}>
            ⚡ {d.domain}
          </div>
        ))}
      </div>
    </div>
  );
}