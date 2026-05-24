import React, { useState, useRef, useEffect } from 'react';
import { Download, Loader2, FileText, Star, Layers, Eye } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassBtnSecondary } from '../ui/LiquidGlass';
import ExportPreviewModal from './ExportPreviewModal';

/**
 * ExportDropdown — reusable export button with mode selection.
 * Clicking a mode opens a preview modal with theme toggle before download.
 */
export default function ExportDropdown({ subjectId, hasDSP, hasEsoteric, hasUnified, defaultMode = 'dsp' }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(null); // { mode, label } or null
  const ref = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleModeClick = (mode, label) => {
    setOpen(false);
    setPreview({ mode, label });
  };

  const dropBg = isDark ? 'rgba(18,20,30,0.95)' : 'rgba(255,255,255,0.97)';
  const dropBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const itemHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const modes = [];
  if (hasDSP) modes.push({ key: 'dsp', label: 'DSP Report', icon: FileText, color: '#f59e0b' });
  if (hasEsoteric) modes.push({ key: 'esoteric', label: 'Esoteric Profile', icon: Star, color: '#8b5cf6' });
  if (hasDSP && hasEsoteric) modes.push({ key: 'merged', label: hasUnified ? 'Unified Dossier' : 'Full Dossier (Legacy)', icon: Layers, color: '#10b981' });

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{ ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <Download style={{ width: 15, height: 15 }} />
          Export
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: '110%', right: 0, minWidth: 220, zIndex: 100,
            background: dropBg, border: `1px solid ${dropBorder}`, borderRadius: 14,
            backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)',
            boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.50)' : '0 12px 40px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}>
            {/* Mode selection — opens preview */}
            {modes.map(({ key, label, icon: Icon, color }) => (
              <button
                key={key}
                onClick={() => handleModeClick(key, label)}
                style={{
                  width: '100%', padding: '12px 14px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: 'transparent', color: t.text, fontSize: 13,
                  borderBottom: `1px solid ${dropBorder}`,
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = itemHover}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Icon style={{ width: 15, height: 15, color, flexShrink: 0 }} />
                <span>{label}</span>
                <Eye style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
              </button>
            ))}

            {modes.length === 0 && (
              <div style={{ padding: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: t.muted }}>No profiles available to export</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview modal — renders outside the dropdown for proper z-index */}
      {preview && (
        <ExportPreviewModal
          subjectId={subjectId}
          mode={preview.mode}
          modeLabel={preview.label}
          initialTheme="light"
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}