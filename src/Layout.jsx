import React from 'react';
import { ThemeProvider, useTheme } from './components/theme/ThemeProvider';
import { AccessoryProvider } from './components/ui/AccessoryContext';
import AmbientOrbs from './components/ui/AmbientOrbs';
import GlassTabBar from './components/ui/GlassTabBar';
import ThemeToggle from './components/theme/ThemeToggle';
import { light, dark } from './components/ui/LiquidGlass';
import { Radar } from 'lucide-react';
import SubjectTopNav from './components/ui/SubjectTopNav';

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
          background:           isDark ? 'rgba(10,12,18,0.60)' : 'rgba(255,255,255,0.55)',
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

      {/* ── Subject sub-navigation (appears on subject-scoped pages) ───────── */}
      <SubjectTopNav currentPageName={currentPageName} />

      {/* ── Page content ────────────────────────────────────────────────────── */}
      {/* paddingBottom: 120 ensures content clears the floating tab bar */}
      <div style={{ position: 'relative', zIndex: 1, paddingBottom: 120 }}>
        <div className="p-6 md:p-8">
          {children}
        </div>
      </div>

      {/* ── Floating glass tab bar (includes BottomAccessory slot) ─────────── */}
      <GlassTabBar currentPageName={currentPageName} />

    </div>
  );
}