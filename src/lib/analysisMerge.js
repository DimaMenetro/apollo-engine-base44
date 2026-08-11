// ─── APOLLO ANALYSIS PRESERVATION / MERGE SEMANTICS ──────────────────────────
// A processing run must NOT begin from an epistemically empty subject merely
// because JavaScript initializes `results = {}`. The old runAnalysis() replaced
// Subject.analysis_results with only the modules that completed during that run,
// so a valid prior module result silently vanished when its module had no new
// evidence, was not rerun, or failed.
//
// Rules implemented here:
//   • Start from the subject's currently valid analysis_results.
//   • Replace a module ONLY when it successfully completes a new analysis
//     intended to supersede the old one.
//   • A module not rerun is preserved untouched.
//   • A module whose rerun FAILED keeps its previous valid result and is
//     reported as a failed refresh — never silently deleted.

export function mergeAnalysisResults({ previous, fresh, failedRefreshes }) {
  const merged = { ...(previous || {}) };
  for (const [key, result] of Object.entries(fresh)) {
    merged[key] = result; // successful supersede
  }
  const preservedAfterFailure = (failedRefreshes || []).filter(k => merged[k] && !fresh[k]);
  return { merged, preservedAfterFailure };
}

// Conflict detection must run against the FINAL EFFECTIVE module set — not only
// the modules regenerated during this run. Otherwise preserving a valid older
// Behavioral Loop while regenerating Stylometry would skip a check that should
// still occur. Logic itself is unchanged from the original implementation.
export function detectConflicts(effectiveResults) {
  const r = effectiveResults || {};
  const conflicts = [];

  if (r.stylometric_fingerprint && r.behavioral_loop) {
    const textFlags = r.stylometric_fingerprint?.flags || [];
    const behaviorFlags = r.behavioral_loop?.flags || [];
    if (textFlags.some(f => f.toLowerCase().includes('positive')) && behaviorFlags.some(f => f.toLowerCase().includes('negative'))) {
      conflicts.push({
        type: 'text_behavior_mismatch',
        description: 'Words conflict with Actions - prioritizing behavioral analysis',
        resolution: 'Actions prioritized over stated intentions',
      });
    }
  }

  if (r.stylometric_fingerprint && r.affective_state) {
    const textConf = r.stylometric_fingerprint?.confidence || 0;
    const affectConf = r.affective_state?.confidence || 0;
    if (Math.abs(textConf - affectConf) > 30) {
      conflicts.push({
        type: 'deception_flag',
        description: 'High Prob Deception - Bio-Signal conflicts with Text',
        resolution: 'Flagged for manual review',
      });
    }
  }

  return conflicts;
}