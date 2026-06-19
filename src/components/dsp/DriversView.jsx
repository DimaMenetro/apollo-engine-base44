import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { Target, Shield } from 'lucide-react';
import Collapsible from './Collapsible';
import { firstSentences } from './summarize';

// Semantic axes used to pair a motivation with its opposing fear.
// A pair is only formed when BOTH items clearly match the same axis keyword set.
const AXES = [
  { id: 'attachment',  label: 'Attachment & Rejection',     kw: ['attach', 'intima', 'romanti', 'love', 'reject', 'abandon', 'connect', 'belong'] },
  { id: 'agency',      label: 'Agency & Helplessness',      kw: ['agenc', 'control', 'autonom', 'power', 'helpless', 'powerless', 'uncertain'] },
  { id: 'disclosure',  label: 'Disclosure & Distrust',      kw: ['disclos', 'open', 'honest', 'trust', 'distrust', 'betray', 'vulnerab'] },
  { id: 'competence',  label: 'Competence & Dependency',    kw: ['compet', 'master', 'achiev', 'success', 'depend', 'inadequa', 'failure', 'incompet'] },
  { id: 'stability',   label: 'Stability & Abandonment',    kw: ['stabil', 'secur', 'safe', 'consist', 'abandon', 'loss', 'instab'] },
  { id: 'authenticity',label: 'Authenticity & Judgment',    kw: ['authentic', 'genuine', 'true self', 'judg', 'shame', 'expos', 'humiliat'] },
  { id: 'connection',  label: 'Connection & Isolation',     kw: ['connect', 'social', 'relation', 'isolat', 'lonel', 'alone', 'exclu'] },
];

function axisFor(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const axis of AXES) {
    if (axis.kw.some((k) => lower.includes(k))) return axis.id;
  }
  return null;
}

// Returns { pairs: [{axisLabel, motivation, fear}], soloMotivations: [], soloFears: [] }
function pairDrivers(motivations, fears) {
  const m = motivations.map((text) => ({ text, axis: axisFor(text), used: false }));
  const f = fears.map((text) => ({ text, axis: axisFor(text), used: false }));
  const pairs = [];

  for (const axis of AXES) {
    const mi = m.find((x) => !x.used && x.axis === axis.id);
    const fi = f.find((x) => !x.used && x.axis === axis.id);
    if (mi && fi) {
      mi.used = true;
      fi.used = true;
      pairs.push({ axisLabel: axis.label, motivation: mi.text, fear: fi.text });
    }
  }

  return {
    pairs,
    soloMotivations: m.filter((x) => !x.used).map((x) => x.text),
    soloFears: f.filter((x) => !x.used).map((x) => x.text),
  };
}

function DriverLine({ kind, text, t }) {
  const color = kind === 'motivation' ? '#10b981' : '#f43f5e';
  const Icon = kind === 'motivation' ? Target : Shield;
  const summary = firstSentences(text, { maxChars: 120, maxSentences: 1 });
  const hasMore = summary.replace(/…$/, '').trim().length < text.trim().length;

  const header = (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <Icon style={{ width: 13, height: 13, color, marginTop: 2, flexShrink: 0 }} aria-hidden="true" />
      <div>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color, fontWeight: 600, display: 'block', marginBottom: 2 }}>
          {kind === 'motivation' ? 'Motivation' : 'Fear'}
        </span>
        <span style={{ fontSize: 13, color: t.text, lineHeight: 1.5 }}>{summary}</span>
      </div>
    </div>
  );

  if (!hasMore) return header;
  return (
    <Collapsible
      t={t}
      isDark={false}
      accent={color}
      header={header}
      toggleLabel={`Show full ${kind}`}
    >
      <p style={{ fontSize: 13, color: t.text, lineHeight: 1.6, margin: 0, paddingLeft: 22 }}>{text}</p>
    </Collapsible>
  );
}

export default function DriversView({ motivations = [], fears = [] }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!motivations.length && !fears.length) {
    return <p style={{ fontSize: 13, color: t.muted }}>No core drivers identified</p>;
  }

  const { pairs, soloMotivations, soloFears } = pairDrivers(motivations, fears);

  const pairedCard = {
    padding: 16,
    borderRadius: 14,
    background: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.025)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
  };
  const soloCard = (kind) => ({
    padding: '12px 16px',
    borderRadius: 12,
    background: kind === 'motivation' ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
    border: `1px solid ${kind === 'motivation' ? 'rgba(16,185,129,0.20)' : 'rgba(244,63,94,0.20)'}`,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {pairs.map((p, i) => (
        <div key={`pair-${i}`} style={pairedCard}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: t.subtitle, margin: '0 0 12px', textTransform: 'uppercase' }}>
            {p.axisLabel}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <DriverLine kind="motivation" text={p.motivation} t={t} />
            <div style={{ height: 1, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }} />
            <DriverLine kind="fear" text={p.fear} t={t} />
          </div>
        </div>
      ))}

      {soloMotivations.map((text, i) => (
        <div key={`m-${i}`} style={soloCard('motivation')}>
          <DriverLine kind="motivation" text={text} t={t} />
        </div>
      ))}
      {soloFears.map((text, i) => (
        <div key={`f-${i}`} style={soloCard('fear')}>
          <DriverLine kind="fear" text={text} t={t} />
        </div>
      ))}
    </div>
  );
}