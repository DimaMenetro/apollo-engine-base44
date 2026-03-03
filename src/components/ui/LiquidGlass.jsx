// Apollo Liquid Glass Design System
// Based on DS-001-G-D-LGT v2.1 — Adapted for Apollo Profiling Engine
// Single source of truth for all glass materials. Never hand-write glass styles inline.

// ─── LIGHT THEME TOKENS ───────────────────────────────────────────────────────
// Aesthetic: warm frosted bone-white — like brushed aluminium lit from above.
// Apollo accent (amber) stays alive as a warm blush beneath the glass layers.
export const light = {
  // Warm creamy canvas — very slightly warm so amber orbs feel natural
  page:            'linear-gradient(160deg, #f5f0eb 0%, #ede8e0 35%, #ece8f2 70%, #e8edf5 100%)',

  // Orbs — same hues as dark but more delicate opacity (they're tinting, not glowing)
  orb1:            'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 65%)',
  orb2:            'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 65%)',
  orb3:            'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%)',

  // Cards: heavy frosted white — the backdrop blur turns orb colours into a warm blush
  card:            'rgba(255,255,255,0.52)',
  cardBorder:      'rgba(255,255,255,0.80)',
  cardShadow:      'inset 0 1.5px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.05), 0 8px 32px rgba(80,70,60,0.08), 0 2px 6px rgba(0,0,0,0.04)',

  // Surface: slightly more transparent — used for inner panels
  surface:         'rgba(255,255,255,0.38)',
  surfaceBorder:   'rgba(255,255,255,0.65)',
  surfaceShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.88), inset 0 -1px 0 0 rgba(0,0,0,0.04)',

  // Tab bar: lush milky pill
  tabBar:          'rgba(255,255,255,0.62)',
  tabBarBorder:    'rgba(255,255,255,0.82)',
  tabBarShadow:    'inset 0 1.5px 0 0 rgba(255,255,255,0.98), inset 0 -1px 0 0 rgba(0,0,0,0.04), 0 8px 30px rgba(80,70,60,0.07)',

  // Active tab: clean raised capsule
  tabActive:       'rgba(255,255,255,0.88)',
  tabActiveBorder: 'rgba(255,255,255,0.95)',
  tabActiveShadow: 'inset 0 1px 0 0 rgba(255,255,255,1.0), inset 0 -1px 0 0 rgba(0,0,0,0.04), 0 3px 10px rgba(0,0,0,0.06)',

  // Accessory lozenge
  accessory:       'rgba(255,255,255,0.55)',
  accessoryBorder: 'rgba(255,255,255,0.78)',
  accessoryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.95), inset 0 -1px 0 0 rgba(0,0,0,0.04), 0 4px 16px rgba(80,70,60,0.07)',

  // Primary: Apollo amber — slightly richer in light mode for contrast
  btn:             'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
  btnBorder:       'rgba(255,255,255,0.40)',
  btnShadow:       'inset 0 1px 0 0 rgba(255,255,255,0.40), inset 0 -1px 0 0 rgba(0,0,0,0.18), 0 6px 20px rgba(245,158,11,0.32)',

  // Secondary / ghost
  btnSecondary:    'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(245,240,235,0.65) 100%)',
  btnSecondaryBorder: 'rgba(0,0,0,0.09)',
  btnSecondaryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.90), inset 0 -1px 0 0 rgba(0,0,0,0.06)',

  successBg:       'rgba(236,253,245,0.60)',
  successBorder:   'rgba(110,231,183,0.45)',
  errorBg:         'rgba(255,241,242,0.60)',
  errorBorder:     'rgba(253,164,175,0.45)',

  // Typography — warm dark slate (not pure black)
  title:           '#1c1917',
  subtitle:        '#57534e',
  text:            '#44403c',
  muted:           '#a8a29e',
  label:           '#78716c',
  accent:          '#d97706',

  tabText:         '#78716c',
  tabTextActive:   '#1c1917',
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