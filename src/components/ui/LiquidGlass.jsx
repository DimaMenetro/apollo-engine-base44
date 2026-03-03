// Apollo Liquid Glass Design System
// Based on DS-001-G-D-LGT v2.1 — Adapted for Apollo Profiling Engine
// Single source of truth for all glass materials. Never hand-write glass styles inline.

// ─── LIGHT THEME TOKENS ───────────────────────────────────────────────────────
export const light = {
  page:            'linear-gradient(145deg, #e8edf5 0%, #dde4ef 40%, #e4dff0 100%)',
  orb1:            'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)',
  orb2:            'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
  orb3:            'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',

  card:            'rgba(255,255,255,0.42)',
  cardBorder:      'rgba(255,255,255,0.55)',
  cardShadow:      'inset 0 1px 0 0 rgba(255,255,255,0.85), inset 0 -1px 0 0 rgba(0,0,0,0.06), 0 8px 32px rgba(100,110,160,0.10), 0 1px 3px rgba(0,0,0,0.05)',

  surface:         'rgba(255,255,255,0.32)',
  surfaceBorder:   'rgba(255,255,255,0.45)',
  surfaceShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.75), inset 0 -1px 0 0 rgba(0,0,0,0.04)',

  tabBar:          'rgba(255,255,255,0.50)',
  tabBarBorder:    'rgba(255,255,255,0.60)',
  tabBarShadow:    'inset 0 1px 0 0 rgba(255,255,255,0.90), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 6px 24px rgba(100,110,160,0.08)',

  tabActive:       'rgba(255,255,255,0.65)',
  tabActiveBorder: 'rgba(255,255,255,0.75)',
  tabActiveShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.90), inset 0 -1px 0 0 rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.05)',

  accessory:       'rgba(255,255,255,0.45)',
  accessoryBorder: 'rgba(255,255,255,0.55)',
  accessoryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.88), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 4px 16px rgba(100,110,160,0.08)',

  // Primary action: Apollo amber
  btn:             'linear-gradient(145deg, rgba(245,158,11,0.88) 0%, rgba(217,119,6,0.93) 100%)',
  btnBorder:       'rgba(255,255,255,0.28)',
  btnShadow:       'inset 0 1px 0 0 rgba(255,255,255,0.32), inset 0 -1px 0 0 rgba(0,0,0,0.14), 0 6px 20px rgba(245,158,11,0.28)',

  // Secondary / ghost button
  btnSecondary:    'linear-gradient(145deg, rgba(71,85,105,0.15) 0%, rgba(51,65,85,0.20) 100%)',
  btnSecondaryBorder: 'rgba(0,0,0,0.12)',
  btnSecondaryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.50), inset 0 -1px 0 0 rgba(0,0,0,0.06)',

  successBg:       'rgba(240,253,244,0.55)',
  successBorder:   'rgba(134,239,172,0.4)',
  errorBg:         'rgba(254,226,226,0.5)',
  errorBorder:     'rgba(252,165,165,0.4)',

  title:           '#1e293b',
  subtitle:        '#64748b',
  text:            '#334155',
  muted:           '#94a3b8',
  label:           '#94a3b8',
  accent:          '#d97706',

  tabText:         '#64748b',
  tabTextActive:   '#1e293b',
};

// ─── DARK THEME TOKENS (Apollo Primary) ───────────────────────────────────────
export const dark = {
  page:            'linear-gradient(145deg, #09090f 0%, #0d0f18 40%, #0a0c14 100%)',
  // Apollo-specific orb colors: amber / violet / cyan
  orb1:            'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)',
  orb2:            'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
  orb3:            'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',

  card:            'rgba(255,255,255,0.055)',
  cardBorder:      'rgba(255,255,255,0.08)',
  cardShadow:      'inset 0 1px 0 0 rgba(255,255,255,0.09), inset 0 -1px 0 0 rgba(0,0,0,0.35), 0 8px 32px rgba(0,0,0,0.30), 0 1px 3px rgba(0,0,0,0.20)',

  surface:         'rgba(255,255,255,0.045)',
  surfaceBorder:   'rgba(255,255,255,0.07)',
  surfaceShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.07), inset 0 -1px 0 0 rgba(0,0,0,0.25)',

  tabBar:          'rgba(255,255,255,0.065)',
  tabBarBorder:    'rgba(255,255,255,0.10)',
  tabBarShadow:    'inset 0 1px 0 0 rgba(255,255,255,0.10), inset 0 -1px 0 0 rgba(0,0,0,0.30), 0 6px 24px rgba(0,0,0,0.25)',

  tabActive:       'rgba(255,255,255,0.10)',
  tabActiveBorder: 'rgba(255,255,255,0.15)',
  tabActiveShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.12), inset 0 -1px 0 0 rgba(0,0,0,0.20), 0 2px 6px rgba(0,0,0,0.18)',

  accessory:       'rgba(255,255,255,0.055)',
  accessoryBorder: 'rgba(255,255,255,0.09)',
  accessoryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.09), inset 0 -1px 0 0 rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.22)',

  // Primary action: Apollo amber — warm and punchy against the dark canvas
  btn:             'linear-gradient(145deg, rgba(245,158,11,0.90) 0%, rgba(217,119,6,0.95) 100%)',
  btnBorder:       'rgba(255,255,255,0.15)',
  btnShadow:       'inset 0 1px 0 0 rgba(255,255,255,0.18), inset 0 -1px 0 0 rgba(0,0,0,0.30), 0 6px 20px rgba(245,158,11,0.30)',

  btnSecondary:    'linear-gradient(145deg, rgba(148,163,184,0.10) 0%, rgba(100,116,139,0.14) 100%)',
  btnSecondaryBorder: 'rgba(255,255,255,0.09)',
  btnSecondaryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.08), inset 0 -1px 0 0 rgba(0,0,0,0.22)',

  successBg:       'rgba(20,83,45,0.20)',
  successBorder:   'rgba(74,222,128,0.20)',
  errorBg:         'rgba(127,29,29,0.20)',
  errorBorder:     'rgba(248,113,113,0.20)',

  title:           '#f1f5f9',
  subtitle:        '#94a3b8',
  text:            '#cbd5e1',
  muted:           '#475569',
  label:           '#64748b',
  accent:          '#f59e0b',

  tabText:         '#64748b',
  tabTextActive:   '#e2e8f0',
};

// ─── STYLE FACTORIES ──────────────────────────────────────────────────────────

/** Primary glass card — heavy blur, 28px contoured corners */
export const glassCard = (t) => ({
  background:           t.card,
  backdropFilter:       'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border:               `1px solid ${t.cardBorder}`,
  boxShadow:            t.cardShadow,
  borderRadius:         28,
});

/** Secondary glass surface — lighter blur, 20px corners */
export const glassSurface = (t) => ({
  background:           t.surface,
  backdropFilter:       'blur(24px) saturate(160%)',
  WebkitBackdropFilter: 'blur(24px) saturate(160%)',
  border:               `1px solid ${t.surfaceBorder}`,
  boxShadow:            t.surfaceShadow,
  borderRadius:         20,
});

/** Tab bar glass — heaviest blur, full capsule pill */
export const glassTabBar = (t) => ({
  background:           t.tabBar,
  backdropFilter:       'blur(50px) saturate(200%)',
  WebkitBackdropFilter: 'blur(50px) saturate(200%)',
  border:               `1px solid ${t.tabBarBorder}`,
  boxShadow:            t.tabBarShadow,
  borderRadius:         999,
});

/** Active tab indicator capsule */
export const glassTabActive = (t) => ({
  background:           t.tabActive,
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${t.tabActiveBorder}`,
  boxShadow:            t.tabActiveShadow,
  borderRadius:         999,
});

/** Accessory bar — full pill lozenge */
export const glassAccessory = (t) => ({
  background:           t.accessory,
  backdropFilter:       'blur(40px) saturate(180%)',
  WebkitBackdropFilter: 'blur(40px) saturate(180%)',
  border:               `1px solid ${t.accessoryBorder}`,
  boxShadow:            t.accessoryShadow,
  borderRadius:         999,
});

/** Primary action button (Apollo amber) — full pill */
export const glassBtn = (t) => ({
  background:           t.btn,
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${t.btnBorder}`,
  boxShadow:            t.btnShadow,
  borderRadius:         999,
  color:                'rgba(15,23,42,0.95)',
  fontWeight:           600,
  cursor:               'pointer',
});

/** Secondary / ghost button — full pill */
export const glassBtnSecondary = (t) => ({
  background:           t.btnSecondary,
  backdropFilter:       'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border:               `1px solid ${t.btnSecondaryBorder}`,
  boxShadow:            t.btnSecondaryShadow,
  borderRadius:         999,
  color:                t.text,
  fontWeight:           500,
  cursor:               'pointer',
});

/** Error state container */
export const glassError = (t) => ({
  background:  t.errorBg,
  border:      `1px solid ${t.errorBorder}`,
  boxShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.06)',
  borderRadius: 24,
});

/** Success state container */
export const glassSuccess = (t) => ({
  background:  t.successBg,
  border:      `1px solid ${t.successBorder}`,
  boxShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.06)',
  borderRadius: 24,
});