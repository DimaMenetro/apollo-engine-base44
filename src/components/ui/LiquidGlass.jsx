// Apollo Liquid Glass Design System
// Based on DS-001-G-D-LGT v2.1 — Adapted for Apollo Profiling Engine
// Inspired by Apple WWDC25 Liquid Glass language.
// Single source of truth for all glass materials. Never hand-write glass styles inline.

// ─── LIGHT THEME TOKENS ───────────────────────────────────────────────────────
// Aesthetic: Apple Liquid Glass light — near-transparent frosted panels,
// razor-thin specular edge on top, very soft shadow below.
// Background is a neutral warm-white so the glass reads as true glass, not paper.
export const light = {
  // Clean near-white canvas — neutral so backdrop blur refracts orb colours cleanly
  page:            'linear-gradient(160deg, #f2f2f7 0%, #eeeef3 50%, #f0eef5 100%)',

  // Orbs — soft pastels, low opacity — they tint through the blur
  orb1:            'radial-gradient(circle, rgba(245,158,11,0.22) 0%, transparent 65%)',
  orb2:            'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 65%)',
  orb3:            'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 65%)',

  // Card: ultra-thin frosted glass — like Apple's system sheets
  // The top edge highlight is the key "Liquid Glass" signature
  card:            'rgba(255,255,255,0.30)',
  cardBorder:      'rgba(255,255,255,0.60)',
  cardShadow:      [
    'inset 0 1.5px 0 0 rgba(255,255,255,0.90)',   // top specular rim
    'inset 0 -1px 0 0 rgba(0,0,0,0.04)',           // bottom inner shadow
    '0 1px 0 0 rgba(255,255,255,0.80)',             // outer top shimmer
    '0 8px 32px rgba(60,60,80,0.07)',               // soft ambient drop
    '0 2px 4px rgba(0,0,0,0.04)',                   // crisp micro shadow
  ].join(', '),

  // Surface: inner panels — even more transparent
  surface:         'rgba(255,255,255,0.20)',
  surfaceBorder:   'rgba(255,255,255,0.45)',
  surfaceShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.80), inset 0 -1px 0 0 rgba(0,0,0,0.03)',

  // Tab bar: Apple-style frosted pill — thick glass, strong edge highlight
  tabBar:          'rgba(255,255,255,0.45)',
  tabBarBorder:    'rgba(255,255,255,0.70)',
  tabBarShadow:    [
    'inset 0 1.5px 0 0 rgba(255,255,255,0.95)',
    'inset 0 -1px 0 0 rgba(0,0,0,0.04)',
    '0 8px 32px rgba(60,60,80,0.08)',
    '0 2px 8px rgba(0,0,0,0.04)',
  ].join(', '),

  // Active tab capsule: solid raised white — like the Apple Podcasts reference
  tabActive:       'rgba(255,255,255,0.82)',
  tabActiveBorder: 'rgba(255,255,255,0.95)',
  tabActiveShadow: [
    'inset 0 1.5px 0 0 rgba(255,255,255,1.0)',
    'inset 0 -1px 0 0 rgba(0,0,0,0.05)',
    '0 4px 12px rgba(0,0,0,0.10)',
    '0 1px 3px rgba(0,0,0,0.06)',
  ].join(', '),

  // Accessory lozenge — same language as tab bar
  accessory:       'rgba(255,255,255,0.40)',
  accessoryBorder: 'rgba(255,255,255,0.68)',
  accessoryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.90), inset 0 -1px 0 0 rgba(0,0,0,0.03), 0 4px 16px rgba(60,60,80,0.07)',

  // Primary: Apollo amber
  btn:             'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
  btnBorder:       'rgba(255,255,255,0.35)',
  btnShadow:       'inset 0 1.5px 0 0 rgba(255,255,255,0.45), inset 0 -1px 0 0 rgba(0,0,0,0.20), 0 6px 20px rgba(245,158,11,0.35)',

  // Secondary / ghost — glass-on-glass
  btnSecondary:    'rgba(255,255,255,0.35)',
  btnSecondaryBorder: 'rgba(255,255,255,0.60)',
  btnSecondaryShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.85), inset 0 -1px 0 0 rgba(0,0,0,0.04)',

  successBg:       'rgba(236,253,245,0.50)',
  successBorder:   'rgba(110,231,183,0.40)',
  errorBg:         'rgba(255,241,242,0.55)',
  errorBorder:     'rgba(253,164,175,0.40)',

  // Typography — system gray, matches Apple HIG
  title:           '#1c1c1e',
  subtitle:        '#3c3c43',
  text:            '#3c3c43',
  muted:           '#8e8e93',
  label:           '#6c6c70',
  accent:          '#d97706',

  tabText:         '#6c6c70',
  tabTextActive:   '#1c1c1e',
};

// ─── DARK THEME TOKENS (Apollo Primary) ───────────────────────────────────────
export const dark = {
  page:            'linear-gradient(145deg, #09090f 0%, #0d0f18 40%, #0a0c14 100%)',
  // Apollo-specific orb colors: amber / violet / cyan
  orb1:            'radial-gradient(circle, rgba(245,158,11,0.28) 0%, transparent 70%)',
  orb2:            'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
  orb3:            'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)',

  // Card: tight Liquid Glass — like the Apple Music bottom accessory in dark mode.
  // Very low fill, the specular top rim + ambient glow below does the work.
  card:            'rgba(255,255,255,0.055)',
  cardBorder:      'rgba(255,255,255,0.09)',
  cardShadow:      [
    'inset 0 1px 0 0 rgba(255,255,255,0.10)',  // top specular
    'inset 0 -1px 0 0 rgba(0,0,0,0.40)',        // bottom inner dark edge
    '0 8px 32px rgba(0,0,0,0.32)',              // ambient drop
    '0 1px 3px rgba(0,0,0,0.22)',               // micro crisp
  ].join(', '),

  surface:         'rgba(255,255,255,0.04)',
  surfaceBorder:   'rgba(255,255,255,0.08)',
  surfaceShadow:   'inset 0 1px 0 0 rgba(255,255,255,0.09), inset 0 -1px 0 0 rgba(0,0,0,0.30)',

  // Tab bar pill — heavier glass so it floats above the dark content
  tabBar:          'rgba(28,28,36,0.72)',
  tabBarBorder:    'rgba(255,255,255,0.10)',
  tabBarShadow:    [
    'inset 0 1px 0 0 rgba(255,255,255,0.12)',
    'inset 0 -1px 0 0 rgba(0,0,0,0.45)',
    '0 8px 32px rgba(0,0,0,0.40)',
    '0 2px 8px rgba(0,0,0,0.28)',
  ].join(', '),

  // Active tab: solid raised capsule — like Apple Podcasts dark reference
  tabActive:       'rgba(255,255,255,0.13)',
  tabActiveBorder: 'rgba(255,255,255,0.18)',
  tabActiveShadow: [
    'inset 0 1px 0 0 rgba(255,255,255,0.14)',
    'inset 0 -1px 0 0 rgba(0,0,0,0.25)',
    '0 2px 8px rgba(0,0,0,0.22)',
  ].join(', '),

  // Accessory lozenge — matches tab bar material
  accessory:       'rgba(28,28,36,0.78)',
  accessoryBorder: 'rgba(255,255,255,0.10)',
  accessoryShadow: [
    'inset 0 1px 0 0 rgba(255,255,255,0.10)',
    'inset 0 -1px 0 0 rgba(0,0,0,0.42)',
    '0 6px 24px rgba(0,0,0,0.36)',
  ].join(', '),

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