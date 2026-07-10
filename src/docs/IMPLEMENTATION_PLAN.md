# Apollo Profiling Engine — Master Implementation Plan
## Document ID: IP-001-G-D-APL
## Last Updated: 2026-07-10
## Status: ACTIVE

---

## PHASE 5 — Synthesis Pipeline Reliability & Integrity ✅ (2026-07-10)

Janus-ratified 5-fix package addressing partial dossiers, false "synthesizing" states, Frankenstein data-mixing on re-synthesis, and the drifting nav bar. **Context fidelity preserved absolutely — every stage still receives the full DSP+ESP context (context slicing declared a disallowed move).**

| Fix | Change | Files |
|-----|--------|-------|
| 1 — Staging buffer + atomic promotion | Stages write to new `Subject.unified_dossier_draft`; final stage promotes the complete draft to `unified_dossier` in ONE write. Stage 1 resets the draft. Prior complete dossier stays intact until full replacement exists — partial runs can never mix months or leave holes. | `entities/Subject.jsonc`, `functions/processDossierJobs` |
| 2 — Attempts cap at claim | Zombie-loop fix: a worker killed mid-flight never reaches the catch block, so the `max_attempts` cap is now also enforced at claim time — job fails honestly ("stopped at stage N after M attempts") instead of reclaiming forever. | `functions/processDossierJobs` |
| 3 — Timeout mitigation | `max_attempts` 3→5 (enqueue + worker fallbacks); final assessment prompt 5-7 → **4-6 dense paragraphs** (generation time scales with output length). Caught errors now prefixed `[stage: X]` for forensics. | `functions/enqueueDossierSynthesis`, `functions/processDossierJobs` |
| 3b — Evidence-adaptive models | `pickSynthesisModel()`: combined DSP+ESP summary ≥ 12,000 chars → `claude_opus_4_8`; lighter → `claude-sonnet-5` (no "Sonnet 4.8" exists; Sonnet 5 is the current top Sonnet). Replaces hard-coded `claude_opus_4_6`. Cuts credit burn on light subjects. | `functions/processDossierJobs` |
| 4 — Honest stage-level UI | New `SynthesisStageStatus` component polls the active `DossierJob` and shows "Synthesizing stage N of 9: {section}". Failure messages carry the dying stage. | `components/dossier/SynthesisStageStatus`, `pages/UnifiedDossier` |
| 5 — Nav bar drift | Removed `whileInView` from the fixed `GlassTabBar` `<motion.nav>` — it re-fired the y:20→0 entrance during scroll on an always-in-view fixed element, yanking the bar mid-screen. | `components/ui/GlassTabBar` |

**Watchdog correction (for the record):** the scheduled safety-net worker ("Dossier Job Worker (safety net)", every 5 min) **does exist and runs** — the hangs came from the zombie loop (Fix 2), not a missing watchdog.

**⚠️ TESTING BLOCKED:** integration credits exhausted until 2026-07-30 (or tier upgrade) — full end-to-end synthesis verification (esp. whether 4-6 paragraphs clears the 120s wall on the densest subjects) must run after credits return. Queue mechanics deploy-validated only.

---

## PHASE 4 — DSP & Dossier Readability Refinement ✅ (2026-06-19)

Presentation-layer only. No backend / prompt / schema / export changes. Restructured the dense analytical middle of the DSP Report and Unified Dossier (legacy DSP section) into summary-first, expandable Apollo-glass components. Executive Summary, Final Assessment, and Predictive Model percentages left fully intact.

**New components (`components/dsp/`):**
- `Collapsible.jsx` — accessible expand/collapse primitive (aria-expanded/controls, reduced-motion aware)
- `summarize.js` — excerpt helpers (truncate-only, never rewrites generated text)
- `PersonalityMatrixOverview.jsx` — 5 traits compact (name/%/bar/1-line), expand → full evidence + indicators
- `CognitiveArchitectureView.jsx` — compact process flow from existing fields/sub_sections; expand nodes → full text; falls back to original layout when unparseable
- `BehavioralPatternsView.jsx` — summary-first pattern cards, expand → full description + context
- `DriversView.jsx` — pairs motivations↔fears by semantic axis when clear; unpaired remain standalone; expand → full wording
- `ConfidenceDetails.jsx` — long confidence justification tucked into expandable area; % stays prominent

**Wired into:** `pages/DSPReport`, `components/dossier/DossierDSPSection` (legacy fallback). Bottom padding increased (80→140) so nav/search never obscures final lines. Original editable `components/review/PersonalityMatrix` untouched (still used by SubjectReview).

---

## INCIDENT LOG

| Date | Incident | Root Cause | Resolution |
|------|----------|-----------|------------|
| 2026-06-13 | DSP creation failed silently / errored | Default LLM provider (OpenAI) tightened JSON-schema validation — now requires every `properties` key to be in a `required` array. The DSP schema had none, causing a 400 `invalid_json_schema`. | Switched DSP generation in `pages/SubjectReview` to `claude_sonnet_4_6` (consistent with synthesizeDossier). Also hardened response unwrapping to handle the `{ response: {...} }` wrapper so DSP fields populate correctly. |
| 2026-07-06 | Bio-signal analysis (`analyzeAudio`) dead — Hume Expression Measurement API sunset | Hume's Expression Measurement API was discontinued, breaking all audio/video emotion analysis in the Affective State module. | Migrated emotion analysis to **Imentiv AI** while keeping **AssemblyAI** for transcription (dual-API architecture). `analyzeAudio` now branches by file extension → `/v2/audios` or `/v2/videos`, submits via `media_url` multipart form (+ required `title`/`description`), polls `/v1/{audios\|videos}/{id}` to completion. **Auth is `X-API-Key` + non-empty `Referer` header** (NOT Bearer — Bearer routes to a JWT verifier and fails with "missing sub claim"). Response shape: `predictions.average_audio_emotions` + `predictions.segment_audio_emotions[]` (per-speaker timeline). Frontend contract `{ predictions, transcript }` unchanged — `Processing.jsx` consumes `predictions` generically, no shape coupling. |
| 2026-07-07 | Dossier synthesis froze subjects in an ambiguous state — "nothing changed" when a worker died | The queue worker set `Subject.dossier_status` only to a generic in-progress value and relied on the job entity alone for forensics; a worker dying mid-flight left no clear Subject-level marker of where it stopped. | Added a durable **`running`** state to the `Subject.dossier_status` enum. `processDossierJobs` now persists `Subject.dossier_status = 'running'` (alongside the job flip to `running` + `started_at`) **before** the expensive LLM synthesis begins. UI (`UnifiedDossier`) treats `running` and legacy `generating` identically as active synthesis (polling, busy state, banner, button). Verified live: Subject reaches `running` within ~2s of the worker kick, before any LLM call. NOTE: the underlying 120s Opus proxy-timeout (two parallel Opus calls exceed the single-invocation window) is a **separate open issue** — recommended fix is splitting the two Opus calls across worker passes. |
| 2026-07-07 | **SECURITY (high, CWE-306):** `processDossierJobs` queue worker was an unauthenticated HTTP endpoint — anyone could POST to force-trigger high-cost Opus synthesis and mutate job state (cost-exhaustion / DoS / financial loss). | Added a dual-gate authorization check at the top of the handler, **before** any job is gathered, claimed, or any LLM call runs. A request passes only if it (a) carries a valid `X-Worker-Secret` header matching the `WORKER_SECRET` env var (used by the internal enqueue kick + self re-kick invokes and any scheduled tick), or (b) comes from an authenticated **admin** (manual operator kick). All other callers get **401** immediately. Both internal `functions.invoke('processDossierJobs', …)` calls (in `enqueueDossierSynthesis` and the worker's own stage re-kick) now pass the `X-Worker-Secret` header. Verified: admin-context call returns 200 with empty queue; anonymous/no-secret path returns 401 before any state mutation. |
| 2026-07-08 | Bio-Signal (Affective State) module errored on multi-file subjects despite valid credits & working APIs. | **Two compounding causes.** (1) Imentiv intermittently returns transient `500`s during processing; combined with sequential per-file `analyzeAudio` invokes for subjects with multiple audio/video files, cumulative wall-time exceeded the timeout. (2) In `Processing.jsx` `preprocessFiles`, a single media file failing **threw**, aborting the entire module — so one flaky file discarded all the files that had already succeeded. | **(a) Backend patience/latency:** `analyzeAudio` Imentiv + AssemblyAI polls changed from `60 × 5s` → `100 × 3s` (300s budget, faster settle). **(b) Frontend per-file resilience:** the media branch in `preprocessFiles` now records a `SKIPPED` note and **continues** instead of throwing — surviving files still analyze; the module only fails if nothing survives. Verified: 98s voicemail (previously timing out) now completes 200. |
| 2026-07-06 | Esoteric profile (`generateEsotericProfile`) returned **504 Gateway Timeout** — "nothing changes" on execute | The function ran 4 dense `gemini_3_flash` LLM calls as **two serial `Promise.all` batches** (A+B, then C+D). Total wall-time = slowest(A,B) + slowest(C,D), which under concurrent LLM load exceeded the synchronous function gateway timeout (~150s). The gateway killed the request with a 504 **before** the `Subject.update` write executed → profile never persisted, UI showed no change. | The 4 calls are mutually independent (share only `baseParams`), so collapsed both batches into **one single `Promise.all` of all 4**. Total time now ≈ slowest single call. Verified: execution dropped **47.6s → 30.7s**, 200 OK, complete profile persisted. No schema/frontend/prompt-content change — pure concurrency restructuring. |

---

## PHASE TRACKER

| # | Phase | Status | Date Completed |
|---|-------|--------|----------------|
| 1 | DSP Report Visual Aids | ✅ DONE | 2026-04 |
| 2 | Esoteric Profile Visual Aids | ✅ DONE | 2026-04 |
| 2a | Text ↔ Visual Toggle System | ✅ DONE | 2026-04 |
| 2b | Dual-Node Chart (Alpha/Beta/Overlay) | ✅ DONE | 2026-04 |
| 3 | Unified Dossier Synthesis Engine | ✅ DONE | 2026-05-24 |
| 3a | Entity schema update (unified_dossier field) | ✅ DONE | 2026-04-07 |
| 3b | Backend: synthesizeDossier.js | ✅ DONE | 2026-04-07 |
| 3c | Rebuild UnifiedDossier page | ✅ DONE | 2026-05-03 |
| 3d | Composite visuals for merged data | ✅ DONE | 2026-05-24 |
| 3e | Export update (merged mode uses synthesis) | ✅ DONE | 2026-05-24 |

---

## PHASE 1 — DSP Report Visual Aids ✅

**What was built:**
- PersonalityMatrix — horizontal bar gauges per Big Five trait with score, evidence, indicators
- ActionResponseMatrix — prediction cards with probability gauges, confidence intervals, temporal factors
- Confidence score display in header card with color-coded thresholds
- Behavioral pattern cards with context/frequency

**Components:** `components/review/PersonalityMatrix`, `components/review/ActionResponseMatrix`

---

## PHASE 2 — Esoteric Profile Visual Aids ✅

**What was built (5 components):**

| Component | File | Purpose |
|-----------|------|---------|
| FidelityMeter | `components/esoteric/FidelityMeter` | Signal-bar quality indicator (FULL/REDUCED/HALTED) |
| ThresholdPhaseArc | `components/esoteric/ThresholdPhaseArc` | Horizontal phase track (rupture → reintegration → plateau → threshold transit) |
| NodeConvergenceRadar | `components/esoteric/NodeConvergenceRadar` | Recharts radar overlay of Node Alpha vs Beta with convergence % |
| CycleTimeline | `components/esoteric/CycleTimeline` | Numerological 9-year energy curve with current-year marker |
| ValidationDashboard | `components/esoteric/ValidationDashboard` | SME compliance arc + per-criterion gauge bars |

**Additional Phase 2 work:**
- `SectionViewToggle` — Text ↔ Visual pill toggle per section
- `DualNodeChart` — Tabbed panel (Convergence | Node α | Node β) for dual-view analysis
- `EsotericOutputDisplay` refactored to support toggle state per section

---

## PHASE 3 — Unified Dossier Synthesis Engine 🔲 NEXT

### Janus Analysis (Approved 2026-04-07)

**CORPUS — The Problem:**
The current Unified Dossier page (`pages/UnifiedDossier`) and the export's "merged" mode both concatenate DSP + Esoteric sections sequentially. This is stapling, not synthesis. A skilled analyst with both reports on their desk would write ONE document in a single voice — not append one after the other.

**COGITO — The Architecture:**
The MELLMA framework (ScienceDirect, Feb 2026) demonstrates that multi-expert LLM arbitration requires a dedicated synthesis step. Simply aggregating outputs is insufficient for handling inter-model disagreement. The synthesis LLM must:
- Identify convergence points (where DSP and Esoteric independently agree)
- Identify divergence points (where they see different things)
- Arbitrate — produce a unified narrative that weaves both, annotating source domains
- Preserve quantitative data (Big Five scores, probabilities, CI ranges, transit names, numerological values)

**ANIMUS — The Intent:**
The Unified Dossier should feel like it was written by one mind that had access to both knowledge domains simultaneously. Not "DSP says X, Esoteric says Y" but "The subject's empirical behavioral pattern of X resonates with the archetypal Y, and their convergence at Z is particularly significant."

**ACTUS — The Plan:**

### Step 3a: Entity Schema Update
Add `unified_dossier` field to Subject entity:
```json
"unified_dossier": {
  "type": "object",
  "properties": {
    "date_synthesized": { "type": "string" },
    "dsp_source_date": { "type": "string" },
    "esoteric_source_date": { "type": "string" },
    "unified_identity_portrait": { "type": "string" },
    "psychodynamic_architecture": { "type": "string" },
    "personality_archetypal_resonance": { "type": "string" },
    "behavioral_topology": { "type": "string" },
    "predictive_convergence_model": { "type": "string" },
    "core_drivers_shadow": { "type": "string" },
    "convergence_map": {
      "type": "object",
      "properties": {
        "convergence_points": { "type": "array", "items": { "type": "object" } },
        "divergence_points": { "type": "array", "items": { "type": "object" } },
        "overall_alignment_score": { "type": "number" }
      }
    },
    "final_unified_assessment": { "type": "string" },
    "synthesis_confidence": { "type": "number" },
    "synthesis_methodology_note": { "type": "string" }
  }
}
```

### Step 3b: Backend Function — synthesizeDossier.js
- Takes `subject_id` as input
- Reads both `dsp` and `esoteric_profile` from Subject
- Validates both exist and have content
- Sends structured summaries (not raw blobs) to LLM with meta-analysis prompt
- Prompt instructs LLM to act as senior integrative analyst
- Returns structured JSON matching the unified_dossier schema
- Persists result to Subject entity
- Tracks source dates for staleness detection

### Step 3c: Rebuild UnifiedDossier Page
- "Synthesize Dossier" button (manual trigger, credit-consuming)
- Staleness indicator if DSP or Esoteric was updated after last synthesis
- Renders synthesized sections, NOT raw DSP/Esoteric sections
- Each section shows unified narrative
- Convergence/Divergence map as a dedicated visual section

### Step 3d: Composite Visuals ✅
- **ConvergenceRadar** — Recharts radar overlaying per-domain agreement (confidence) and tension (from divergence severity) on shared axes. Data from `unified_dossier.convergence_map`.
- **PersonalityArchetypalChart** — Side-by-side bar chart: Big Five scores (DSP) vs. archetypal resonance (keyword-heuristic from esoteric numerological interpretation). Shows alignment delta per trait.
- **UnifiedTimeline** — Conceptual timeline with esoteric threshold phase marker, observed behavioral patterns (left column), and predicted trajectories from action/response matrix (right column).
- **SynthesisConfidenceMeter** — Already existed from 3c. No changes needed.
- All three new visuals placed on UnifiedDossier page between confidence meter and narrative sections. All return `null` gracefully on missing data.

### Step 3e: Export Update ✅
- "merged" mode in exportDSP.js renders unified_dossier data when synthesis exists
- Falls back to concatenation if synthesis hasn't been run yet (legacy behavior preserved)
- PDF includes: synthesis confidence arc, convergence/divergence map with alignment bar, 6 narrative sections, final unified assessment
- ExportDropdown label dynamically shows "Unified Dossier" vs "Full Dossier (Legacy)" based on synthesis state
- All 4 export scenarios tested: synthesized merged, legacy merged, DSP-only, esoteric-only — all 200 OK

### Risk Mitigations
| Risk | Mitigation |
|------|-----------|
| LLM loses specificity from either source | Prompt requires preserving all quantitative data, transit names, numerological values |
| Token limits if both profiles are large | Send structured summaries, not raw text blobs |
| User regenerates one source but not dossier | Track source dates, show "stale" indicator |
| Synthesis contradicts source data | Include source transparency toggle on page |

---

## DESIGN PRINCIPLES (Established via Research)

### From Broader App Landscape Research (2026-04-07)
Apps studied: Co-Star, The Pattern, Sanctuary, CHANI, Selfgazer, SoularMap, Astro Future, NUiT, Nixtio concept, AstroVibe concept

**Key takeaways applied to Apollo:**
1. **Visuals are primary analytical tools, not decoration** — charts must drive from real data
2. **Temporal scope switching** (CHANI pattern) — same data through different time windows
3. **Embodied data mapping** (SoularMap pattern) — abstract data mapped onto tangible spatial forms
4. **Earned restraint** (Selfgazer pattern) — deep content needs breathing room, not visual competition
5. **Multi-ring concentric visualization** (Astro Future) — layered data as concentric overlays
6. **Ring/arc gauges per domain** (Nixtio/AstroVibe) — elegant domain scoring without radar charts
7. **Dynamic time-aware elements** (Sanctuary) — visuals that change based on when you're looking

---

## COMPLETED COMPONENTS REGISTRY

| Component | Path | Domain |
|-----------|------|--------|
| PersonalityMatrix | `components/review/PersonalityMatrix` | DSP |
| ActionResponseMatrix | `components/review/ActionResponseMatrix` | DSP |
| MotivationsSection | `components/review/MotivationsSection` | DSP |
| FidelityMeter | `components/esoteric/FidelityMeter` | Esoteric |
| ThresholdPhaseArc | `components/esoteric/ThresholdPhaseArc` | Esoteric |
| NodeConvergenceRadar | `components/esoteric/NodeConvergenceRadar` | Esoteric |
| CycleTimeline | `components/esoteric/CycleTimeline` | Esoteric |
| ValidationDashboard | `components/esoteric/ValidationDashboard` | Esoteric |
| SectionViewToggle | `components/esoteric/SectionViewToggle` | Esoteric |
| DualNodeChart | `components/esoteric/DualNodeChart` | Esoteric |
| EsotericOutputDisplay | `components/esoteric/EsotericOutputDisplay` | Esoteric |
| ExportDropdown | `components/export/ExportDropdown` | Export |
| ExportPreviewModal | `components/export/ExportPreviewModal` | Export |
| DossierHeader | `components/dossier/DossierHeader` | Dossier |
| DossierDSPSection | `components/dossier/DossierDSPSection` | Dossier |
| DossierEsotericSection | `components/dossier/DossierEsotericSection` | Dossier |
| SynthesizedSection | `components/dossier/SynthesizedSection` | Dossier/Synthesis |
| ConvergenceMap | `components/dossier/ConvergenceMap` | Dossier/Synthesis |
| StalenessIndicator | `components/dossier/StalenessIndicator` | Dossier/Synthesis |
| SynthesisConfidenceMeter | `components/dossier/SynthesisConfidenceMeter` | Dossier/Synthesis |
| ConvergenceRadar | `components/dossier/ConvergenceRadar` | Dossier/Synthesis (3d) |
| PersonalityArchetypalChart | `components/dossier/PersonalityArchetypalChart` | Dossier/Synthesis (3d) |
| UnifiedTimeline | `components/dossier/UnifiedTimeline` | Dossier/Synthesis (3d) |

---

---

**⚠️ BEFORE ANY WORK: Read `docs/KYTHEION_OPERATING_DIRECTIVES.md` first. It contains hard procedural rules and an incident log that survives across sessions.**

---

*This document is the source of truth for implementation state. Update it whenever a phase completes or a new phase is approved.*