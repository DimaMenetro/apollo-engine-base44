import React from 'react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark } from '../ui/LiquidGlass';
import { ArrowDown } from 'lucide-react';
import Collapsible from './Collapsible';
import { firstSentences } from './summarize';

// Builds an ordered set of nodes from the existing cognitive architecture data.
// Order: thinking_style, epistemic_requirements, defense_mechanisms, then sub_sections.
function buildNodes(ca) {
  const nodes = [];
  if (ca.thinking_style) nodes.push({ title: 'Thinking Style', content: ca.thinking_style });
  if (ca.epistemic_requirements) nodes.push({ title: 'Epistemic Requirements', content: ca.epistemic_requirements });
  if (ca.defense_mechanisms) nodes.push({ title: 'Defense Mechanisms', content: ca.defense_mechanisms });
  (ca.sub_sections || []).forEach((s) => {
    if (s && (s.title || s.content)) nodes.push({ title: s.title || 'Detail', content: s.content || '' });
  });
  return nodes;
}

export default function CognitiveArchitectureView({ cognitiveArchitecture }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const ca = cognitiveArchitecture || {};
  const nodes = buildNodes(ca);

  // Fallback: nothing parseable → render nothing here (caller handles original layout).
  if (nodes.length === 0) return null;

  const accent = '#8b5cf6';
  const nodeCard = {
    padding: '14px 16px',
    borderRadius: 14,
    background: isDark ? 'rgba(139,92,246,0.07)' : 'rgba(139,92,246,0.05)',
    border: `1px solid ${isDark ? 'rgba(139,92,246,0.20)' : 'rgba(139,92,246,0.18)'}`,
    flex: '1 1 200px',
    minWidth: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.label, margin: 0 }}>
        Process Flow
      </p>

      {/* Responsive: stacks vertically on mobile, wraps horizontally on wider screens */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'stretch' }}>
        {nodes.map((node, i) => {
          const summary = firstSentences(node.content, { maxChars: 110, maxSentences: 1 });
          const showExpand = !!node.content && summary.replace(/…$/, '').trim().length < node.content.trim().length;

          const header = (
            <div>
              <h4 style={{ fontSize: 12.5, fontWeight: 600, color: t.title, margin: '0 0 4px' }}>{node.title}</h4>
              {summary && <p style={{ fontSize: 12, color: t.muted, lineHeight: 1.5, margin: 0 }}>{summary}</p>}
            </div>
          );

          return (
            <React.Fragment key={i}>
              <div style={nodeCard}>
                {showExpand ? (
                  <Collapsible t={t} isDark={isDark} accent={accent} header={header} toggleLabel={`Show full analysis: ${node.title}`}>
                    <p style={{ fontSize: 13, color: t.text, lineHeight: 1.65, margin: 0 }}>{node.content}</p>
                  </Collapsible>
                ) : (
                  <>
                    {header}
                    {node.content && summary !== node.content && (
                      <p style={{ fontSize: 13, color: t.text, lineHeight: 1.65, margin: '8px 0 0' }}>{node.content}</p>
                    )}
                  </>
                )}
              </div>
              {i < nodes.length - 1 && (
                <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accent, opacity: 0.5 }}>
                  <ArrowDown style={{ width: 16, height: 16 }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}