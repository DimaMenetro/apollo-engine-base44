import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassCard } from '../ui/LiquidGlass';
import { Star } from 'lucide-react';
import EsotericOutputDisplay from '../esoteric/EsotericOutputDisplay';

export default function DossierEsotericSection({ esp, esotericInputs }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  return (
    <div style={{ ...glassCard(t), padding: 24, borderTop: '2px solid rgba(139,92,246,0.40)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Star style={{ width: 15, height: 15, color: '#8b5cf6' }} />
        <div>
          <h3 style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#8b5cf6', margin: 0 }}>
            Esoteric Intelligence Layer
          </h3>
          <p style={{ fontSize: 10, color: t.muted, margin: '2px 0 0', fontFamily: 'monospace' }}>CP-012-O-D-ESP</p>
        </div>
      </div>
      <EsotericOutputDisplay profile={esp} esotericInputs={esotericInputs} />
    </div>
  );
}