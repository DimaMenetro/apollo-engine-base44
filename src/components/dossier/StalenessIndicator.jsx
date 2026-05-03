import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * StalenessIndicator — compares unified_dossier source dates against
 * the current DSP and Esoteric dates. If either source has been
 * regenerated since the last synthesis, shows a "stale" warning.
 */
export default function StalenessIndicator({ unifiedDossier, dsp, esotericProfile }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!unifiedDossier?.date_synthesized) return null;

  const dspStale = dsp?.date_of_synthesis && unifiedDossier.dsp_source_date
    && dsp.date_of_synthesis !== unifiedDossier.dsp_source_date;

  const espStale = esotericProfile?.date_executed && unifiedDossier.esoteric_source_date
    && esotericProfile.date_executed !== unifiedDossier.esoteric_source_date;

  const isStale = dspStale || espStale;

  if (!isStale) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
        background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
        border: '1px solid rgba(16,185,129,0.20)',
      }}>
        <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#10b981' }}>
          Synthesis current — sources unchanged since {unifiedDossier.date_synthesized}
        </span>
      </div>
    );
  }

  const staleItems = [];
  if (dspStale) staleItems.push('DSP');
  if (espStale) staleItems.push('Esoteric Profile');

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 10,
      background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
      border: '1px solid rgba(245,158,11,0.25)',
    }}>
      <AlertTriangle style={{ width: 14, height: 14, color: '#f59e0b', flexShrink: 0 }} />
      <div>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#f59e0b' }}>
          Synthesis may be stale
        </span>
        <p style={{ fontSize: 11, color: isDark ? 'rgba(245,158,11,0.75)' : '#92400e', margin: '2px 0 0' }}>
          {staleItems.join(' and ')} updated since last synthesis ({unifiedDossier.date_synthesized}). Consider re-synthesizing.
        </p>
      </div>
    </div>
  );
}