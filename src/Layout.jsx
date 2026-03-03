import React from 'react';
import { ThemeProvider, useTheme } from './components/theme/ThemeProvider';
import { AccessoryProvider } from './components/ui/AccessoryContext';
import AmbientOrbs from './components/ui/AmbientOrbs';
import GlassTabBar from './components/ui/GlassTabBar';
import ThemeToggle from './components/theme/ThemeToggle';
import { light, dark } from './components/ui/LiquidGlass';
import { Radar } from 'lucide-react';

// ─── ROOT LAYOUT ──────────────────────────────────────────────────────────────
// Follows DS-001-G-D-LGT v2.1 architecture:
//   ThemeProvider → AccessoryProvider → AmbientOrbs → TopBar → Content → GlassTabBar

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <AccessoryProvider>
        <LayoutInner currentPageName={currentPageName}>
          {children}
        </LayoutInner>
      </AccessoryProvider>
    </ThemeProvider>
  );
}

function LayoutInner({ children, currentPageName }) {
  const { isDark } = useTheme();
  const t = isDark ? dark : light;

  return (
    <div
      style={{
        minHeight:   '100svh',
        width:       '100%',
        background:  t.page,
        position:    'relative',
        transition:  'background 0.5s ease',
        fontFamily:  "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
        color:       t.text,
      }}
    >
      {/* ── Ambient orbs — fixed z-0, behind all glass ─────────────────────── */}
      <AmbientOrbs t={t} />

      {/* ── Top Accessory Bar — sticky, minimal: brand + theme toggle ──────── */}
      <header
        style={{
          position:             'sticky',
          top:                  0,
          zIndex:               50,
          display:              'flex',
          alignItems:           'center',
          justifyContent:       'space-between',
          padding:              '10px 20px',
          background:           isDark ? 'rgba(10,12,18,0.60)' : 'rgba(255,255,255,0.35)',
          backdropFilter:       'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom:         `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.60)'}`,
          boxShadow:            isDark
            ? 'inset 0 -1px 0 0 rgba(255,255,255,0.04)'
            : 'inset 0 -1px 0 0 rgba(0,0,0,0.02), 0 1px 8px rgba(0,0,0,0.03)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative' }}>
            <Radar style={{ width: 26, height: 26, color: t.accent }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.title, letterSpacing: '-0.01em' }}>
              APOLLO
            </div>
            <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.2em', color: t.muted }}>
              Profiling Engine v1.0
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />
      </header>

      {/* ── Page content ────────────────────────────────────────────────────── */}
      {/* paddingBottom: 120 ensures content clears the floating tab bar */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 120 }}>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>

      {/* ── Floating glass tab bar (includes BottomAccessory slot) ─────────── */}
      <GlassTabBar currentPageName={currentPageName} />

      {/* ── Global glass utility styles ────────────────────────────────────── */}
      {/* CSS variables are owned by globals.css. This block provides runtime   */}
      {/* glass classes for components that still use Tailwind className strings. */}
      <style>{`

        /* glass-panel = glassCard(dark) values */
        .glass-panel {
          background:             rgba(255,255,255,0.055);
          backdrop-filter:        blur(40px) saturate(180%);
          -webkit-backdrop-filter:blur(40px) saturate(180%);
          border:                 1px solid rgba(255,255,255,0.08);
          box-shadow:
            inset 0  1px 0 0 rgba(255,255,255,0.09),
            inset 0 -1px 0 0 rgba(0,0,0,0.35),
            0 8px 32px rgba(0,0,0,0.30),
            0 1px 3px rgba(0,0,0,0.20);
        }

        /* glass-panel-thick = glassSurface(dark) values */
        .glass-panel-thick {
          background:             rgba(255,255,255,0.045);
          backdrop-filter:        blur(24px) saturate(160%);
          -webkit-backdrop-filter:blur(24px) saturate(160%);
          border:                 1px solid rgba(255,255,255,0.07);
          box-shadow:
            inset 0  1px 0 0 rgba(255,255,255,0.07),
            inset 0 -1px 0 0 rgba(0,0,0,0.25);
        }

        /* glass-material utility (backdrop only) */
        .glass-material {
          backdrop-filter:        blur(40px) saturate(180%);
          -webkit-backdrop-filter:blur(40px) saturate(180%);
        }

        /* glow-amber = glassCard(dark) + amber outer glow */
        .glow-amber {
          box-shadow:
            inset 0  1px 0 0 rgba(255,255,255,0.09),
            inset 0 -1px 0 0 rgba(0,0,0,0.35),
            0 0 30px rgba(245,158,11,0.20);
        }

        /* Scrollbar utilities */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}