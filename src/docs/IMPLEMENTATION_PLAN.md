# Apollo Profiling Engine — Master Implementation Plan
## Document ID: IP-001-G-D-APL
## Last Updated: 2026-04-07
## Status: ACTIVE

---

## PHASE TRACKER

| # | Phase | Status | Date Completed |
|---|-------|--------|----------------|
| 1 | DSP Report Visual Aids | ✅ DONE | 2026-04 |
| 2 | Esoteric Profile Visual Aids | ✅ DONE | 2026-04 |
| 2a | Text ↔ Visual Toggle System | ✅ DONE | 2026-04 |
| 2b | Dual-Node Chart (Alpha/Beta/Overlay) | ✅ DONE | 2026-04 |
| 3 | Unified Dossier Synthesis Engine | 🔲 NEXT | — |
| 3a | Entity schema update (unified_dossier field) | 🔲 PENDING | — |
| 3b | Backend: synthesizeDossier.js | 🔲 PENDING | — |
| 3c | Rebuild UnifiedDossier page | 🔲 PENDING | — |
| 3d | Composite visuals for merged data | 🔲 PENDING | — |
| 3e | Export update (merged mode uses synthesis) | 🔲 PENDING | — |

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

### Step 3d: Composite Visuals
- Convergence/Divergence radar (overlay empirical + symbolic scores)
- Combined personality-archetypal resonance chart
- Unified timeline (DSP behavioral patterns + Esoteric cycle positions)
- Synthesis confidence indicator

### Step 3e: Export Update
- "merged" mode in exportDSP.js renders unified_dossier data
- Falls back to concatenation if synthesis hasn't been run yet
- PDF includes both narrative sections and static visual equivalents (bars, arcs drawn as PDF primitives)

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

---

*This document is the source of truth for implementation state. Update it whenever a phase completes or a new phase is approved.*