import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Loader2, Moon, Sun, FileText, Star, Layers } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassBtnSecondary } from '../ui/LiquidGlass';

/**
 * ExportDropdown — reusable export button with mode + theme selection.
 * Props:
 *   subjectId   - required
 *   hasDSP      - boolean, whether DSP exists
 *   hasEsoteric - boolean, whether esoteric profile exists
 *   defaultMode - 'dsp' | 'esoteric' | 'merged' (which tab to default to)
 */
export default function ExportDropdown({ subjectId, hasDSP, hasEsoteric, defaultMode = 'dsp' }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportTheme, setExportTheme] = useState(isDark ? 'dark' : 'light');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleExport = async (mode) => {
    setExporting(true);
    try {
      // Use raw fetch with blob response type since base44.functions.invoke
      // returns JSON by default and would corrupt binary PDF data
      const response = await base44.functions.invoke('exportDSP', {
        subject_id: subjectId,
        mode,
        color_theme: exportTheme,
      }, { responseType: 'blob' });

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(subjectId || 'export').slice(-6)}_${mode}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + (error.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  const dropBg = isDark ? 'rgba(18,20,30,0.95)' : 'rgba(255,255,255,0.97)';
  const dropBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';
  const itemHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const modes = [];
  if (hasDSP) modes.push({ key: 'dsp', label: 'DSP Report', icon: FileText, color: '#f59e0b' });
  if (hasEsoteric) modes.push({ key: 'esoteric', label: 'Esoteric Profile', icon: Star, color: '#8b5cf6' });
  if (hasDSP && hasEsoteric) modes.push({ key: 'merged', label: 'Full Dossier', icon: Layers, color: '#10b981' });

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        disabled={exporting}
        style={{ ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}
      >
        {exporting
          ? <Loader2 style={{ width: 15, height: 15, animation: 'spin 1s linear infinite' }} />
          : <Download style={{ width: 15, height: 15 }} />
        }
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
          {/* Theme toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderBottom: `1px solid ${dropBorder}`,
          }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: t.muted }}>
              Export Theme
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setExportTheme('light')}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: exportTheme === 'light' ? 'rgba(245,158,11,0.20)' : 'transparent',
                  color: exportTheme === 'light' ? '#f59e0b' : t.muted,
                }}
              >
                <Sun style={{ width: 14, height: 14 }} />
              </button>
              <button
                onClick={() => setExportTheme('dark')}
                style={{
                  width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: exportTheme === 'dark' ? 'rgba(139,92,246,0.20)' : 'transparent',
                  color: exportTheme === 'dark' ? '#8b5cf6' : t.muted,
                }}
              >
                <Moon style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>

          {/* Export modes */}
          {modes.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => handleExport(key)}
              disabled={exporting}
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
              <Download style={{ width: 12, height: 12, color: t.muted, marginLeft: 'auto' }} />
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
  );
}