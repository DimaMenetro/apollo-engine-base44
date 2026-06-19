import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import Collapsible from './Collapsible';
import { firstSentences } from './summarize';

// Keeps the confidence % prominent (rendered by caller) and tucks the long
// justification into an expandable "Confidence Details" area. Full text preserved.
export default function ConfidenceDetails({ justification, color }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  if (!justification) return null;

  const summary = firstSentences(justification, { maxChars: 90, maxSentences: 1 });
  const hasMore = summary.replace(/…$/, '').trim().length < justification.trim().length;

  const header = (
    <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color, opacity: 0.85 }}>
      Confidence Details
    </span>
  );

  if (!hasMore) {
    return (
      <p style={{ fontSize: 11, color, opacity: 0.75, marginTop: 8, lineHeight: 1.5, textAlign: 'left', maxWidth: 200 }}>
        {justification}
      </p>
    );
  }

  return (
    <div style={{ marginTop: 10, textAlign: 'left', maxWidth: 220 }}>
      <Collapsible t={t} isDark={isDark} accent={color} header={header} toggleLabel="Show confidence justification">
        <p style={{ fontSize: 11.5, color: t.text, opacity: 0.9, lineHeight: 1.6, margin: 0 }}>{justification}</p>
      </Collapsible>
    </div>
  );
}