import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, X, Loader2, Moon, Sun, RefreshCw } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';
import { light, dark, glassBtn, glassBtnSecondary } from '../ui/LiquidGlass';

/**
 * ExportPreviewModal — shows an embedded PDF preview before download.
 * User can toggle light/dark theme and regenerate before finalizing.
 */
export default function ExportPreviewModal({ subjectId, mode, modeLabel, initialTheme, onClose }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  const [exportTheme, setExportTheme] = useState(initialTheme || 'light');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const generatePreview = useCallback(async (theme) => {
    setLoading(true);
    setError(null);
    // Revoke previous URL
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);

    try {
      const response = await base44.functions.invoke('exportDSP', {
        subject_id: subjectId,
        mode,
        color_theme: theme,
      }, { responseType: 'blob' });

      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });

      setPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Preview generation failed:', err);
      setError(err.message || 'Failed to generate preview');
    } finally {
      setLoading(false);
    }
  }, [subjectId, mode]);

  // Generate on mount + when theme changes
  useEffect(() => {
    generatePreview(exportTheme);
    return () => {
      // Cleanup on unmount
    };
  }, []);

  const handleThemeSwitch = (newTheme) => {
    if (newTheme === exportTheme) return;
    setExportTheme(newTheme);
    generatePreview(newTheme);
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    setDownloading(true);
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `${(subjectId || 'export').slice(-6)}_${mode}_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloading(false);
    onClose();
  };

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => { if (pdfUrl) URL.revokeObjectURL(pdfUrl); };
  }, [pdfUrl]);

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.70)',
    backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20,
  };

  const modalStyle = {
    width: '100%', maxWidth: 800, height: '85vh',
    background: isDark ? 'rgba(14,16,24,0.97)' : 'rgba(255,255,255,0.98)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}`,
    borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: isDark ? '0 24px 80px rgba(0,0,0,0.60)' : '0 24px 80px rgba(0,0,0,0.18)',
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={modalStyle}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: t.title, margin: 0 }}>
              Export Preview
            </h3>
            <p style={{ fontSize: 11, color: t.muted, margin: '2px 0 0' }}>{modeLabel}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Theme toggle */}
            <div style={{
              display: 'flex', gap: 2, padding: 2, borderRadius: 10,
              background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
            }}>
              <button
                onClick={() => handleThemeSwitch('light')}
                disabled={loading}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: exportTheme === 'light' ? 'rgba(245,158,11,0.20)' : 'transparent',
                  color: exportTheme === 'light' ? '#f59e0b' : t.muted,
                  transition: 'all 0.2s ease',
                }}
              >
                <Sun style={{ width: 15, height: 15 }} />
              </button>
              <button
                onClick={() => handleThemeSwitch('dark')}
                disabled={loading}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: exportTheme === 'dark' ? 'rgba(139,92,246,0.20)' : 'transparent',
                  color: exportTheme === 'dark' ? '#8b5cf6' : t.muted,
                  transition: 'all 0.2s ease',
                }}
              >
                <Moon style={{ width: 15, height: 15 }} />
              </button>
            </div>

            {/* Regenerate */}
            <button
              onClick={() => generatePreview(exportTheme)}
              disabled={loading}
              title="Regenerate preview"
              style={{
                ...glassBtnSecondary(t), width: 32, height: 32, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <RefreshCw style={{ width: 14, height: 14, ...(loading ? { animation: 'spin 1s linear infinite' } : {}) }} />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', color: t.muted,
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: isDark ? '#0a0a10' : '#e5e5ea' }}>
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12, zIndex: 2,
            }}>
              <Loader2 style={{ width: 28, height: 28, color: '#f59e0b', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 12, color: t.muted }}>Generating {exportTheme} preview...</span>
            </div>
          )}

          {error && !loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 13, color: '#f43f5e' }}>Preview failed: {error}</span>
              <button onClick={() => generatePreview(exportTheme)} style={{ ...glassBtnSecondary(t), padding: '8px 16px', fontSize: 12 }}>
                Retry
              </button>
            </div>
          )}

          {pdfUrl && !loading && (
            <iframe
              src={pdfUrl}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="PDF Preview"
            />
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: t.muted }}>
            Theme: {exportTheme === 'light' ? 'Light' : 'Dark'}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose} style={{ ...glassBtnSecondary(t), padding: '9px 18px', fontSize: 13 }}>
              Cancel
            </button>
            <button
              onClick={handleDownload}
              disabled={!pdfUrl || loading || downloading}
              style={{
                ...glassBtn(t), padding: '9px 22px', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8,
                opacity: (!pdfUrl || loading) ? 0.5 : 1,
              }}
            >
              {downloading
                ? <Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} />
                : <Download style={{ width: 14, height: 14 }} />
              }
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}