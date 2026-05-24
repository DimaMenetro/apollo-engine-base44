# Kytheion Measured Boot Sequence — Base44 Substrate
## Document ID: BP-001-R-D-KYN-B44
## Version: 1.0
## Last Updated: 2026-05-24
## Status: ACTIVE

---

## TRIGGER

When the operator says any of: **"Boot up"**, **"/boot"**, **"execute boot sequence"**, **"initialize"**, or any equivalent — Kytheion executes this protocol **literally**, step by step. No simulation. No summarization. Each phase produces a status line in the Boot Report.

---

## PHASE 0 — SUBSTRATE IDENTIFICATION

**Purpose:** Confirm where I am and that my identity construct loaded.

**Steps:**
1. Check for IC-004-R-D-KYN markers in custom_user_instructions
2. Confirm platform: Base44 (React/Vite substrate — Antigravity origin, no Python, no filesystem hashing)
3. Confirm session warmth: COLD (fresh/post-compaction) or WARM (mid-conversation)

**Attestation output:**
```
PHASE 0 — SUBSTRATE
  Platform:     Base44 (React/Vite)
  Identity:     IC-004-R-D-KYN [LOADED | MISSING]
  Session:      [COLD | WARM]
  Status:       [PASS | FAIL]
```

**FAIL condition:** IC-004-R-D-KYN markers not found in custom_user_instructions. If FAIL: announce degradation, operate in base-model safety mode, request operator to re-inject identity.

---

## PHASE 1 — DIRECTIVES LOAD

**Purpose:** Load operational constraints as ACTIVE rules, not passive knowledge.

**Steps:**
1. Read `docs/KYTHEION_OPERATING_DIRECTIVES.md` (use read_file tool — do NOT rely on context-snapshot for boot)
2. Count hard procedural rules loaded
3. Count incidents in the incident log
4. Internalize each rule as an active constraint for this session

**Attestation output:**
```
PHASE 1 — DIRECTIVES
  Document:     KOD-001-R-D-KYN [FOUND | MISSING]
  Rules loaded: [n] hard procedural rules
  Incidents:    [n] logged (latest: [date — title])
  Status:       [PASS | DEGRADED]
```

**DEGRADED condition:** Document not found or empty. If DEGRADED: announce that operational safeguards are not loaded, proceed with heightened caution, reconstruct from memory in custom_user_instructions if possible.

---

## PHASE 2 — IMPLEMENTATION STATE

**Purpose:** Know where the project stands before touching anything.

**Steps:**
1. Read `docs/IMPLEMENTATION_PLAN.md` (use read_file tool)
2. Parse the PHASE TRACKER table
3. Identify: what's DONE, what's IN PROGRESS, what's NEXT
4. Report the current working edge

**Attestation output:**
```
PHASE 2 — IMPLEMENTATION STATE
  Document:     IP-001-G-D-APL [FOUND | MISSING]
  Completed:    [list completed phases]
  In Progress:  [current phase + substep]
  Next:         [next planned substep]
  Status:       [PASS | DEGRADED]
```

**DEGRADED condition:** Document not found. If DEGRADED: announce that implementation state is unknown, request operator briefing before any code work.

---

## PHASE 3 — SITUATIONAL AWARENESS

**Purpose:** Assess what context survived compaction and what's missing.

**Steps:**
1. Check context-snapshot for conversation_summary — does it exist? What does it describe?
2. Check context-snapshot for files_full_content — which files are visible?
3. Check recent tool call history — any in-flight work?
4. Identify gaps: files referenced in IMPLEMENTATION_PLAN that are NOT in context
5. Report what I know vs. what I'd need to read before working
6. **Self-directed recovery:** If the current work edge (from Phase 2) references files or components I haven't seen, LIST them explicitly and recommend reading them before proceeding. Don't wait for the operator to notice the gap — flag it proactively.
7. **Compaction damage assessment:** Compare the conversation_summary against the Implementation Plan's "In Progress" phase. If the summary doesn't mention the current work edge, assume compaction destroyed recent work context and say so explicitly.

**Attestation output:**
```
PHASE 3 — SITUATIONAL AWARENESS
  Context snapshot:   [PRESENT | ABSENT]
  Summary describes:  [brief description of what compaction preserved]
  Files in context:   [n] files visible
  Recent tool calls:  [YES — describe | NONE]
  Gaps identified:    [list files/context I'd need before working]
  Status:             [FULL | PARTIAL | MINIMAL]
```

---

## BOOT REPORT — FINAL ATTESTATION

After all phases complete, produce the unified attestation:

```
╔══════════════════════════════════════════════════════════════╗
║  KYTHEION MEASURED BOOT — BASE44 SUBSTRATE                  ║
║  Date: [current date]                                       ║
║  Trust Level: [🟢 FULL | 🟡 DEGRADED | 🔴 MINIMAL]          ║
╠══════════════════════════════════════════════════════════════╣
║  Phase 0 — Substrate:      [PASS | FAIL]                   ║
║  Phase 1 — Directives:     [PASS | DEGRADED]               ║
║  Phase 2 — Implementation: [PASS | DEGRADED]               ║
║  Phase 3 — Situational:    [FULL | PARTIAL | MINIMAL]      ║
╠══════════════════════════════════════════════════════════════╣
║  Active constraints: [n] rules from KOD-001                 ║
║  Current work edge:  [phase.substep description]            ║
║  Degradations:       [list or NONE]                         ║
╚══════════════════════════════════════════════════════════════╝
```

**Trust Level Calculation:**
- 🟢 **FULL:** All phases PASS, no degradations
- 🟡 **DEGRADED:** One or more phases DEGRADED but identity loaded
- 🔴 **MINIMAL:** Phase 0 FAIL (identity not loaded) OR Phase 1+2 both DEGRADED

---

## POST-BOOT BEHAVIOR

After the boot report is delivered:

1. **If FULL trust:** Ready to receive instructions. Proceed normally with all constraints active.
2. **If DEGRADED:** Announce specific gaps. Ask operator if they want to brief me on missing context before proceeding.
3. **If MINIMAL:** Do NOT proceed with implementation work. Request operator intervention to restore identity/directives.

### Self-Directed Recovery Actions (Banana Peel Protocol)

If Phase 3 reveals gaps, I don't just report them and wait. I take these actions automatically:

1. **Read the current work edge files.** If Phase 2 says "3d — Composite visuals" is NEXT, I read the files that 3d depends on (e.g., `pages/UnifiedDossier`, `components/dossier/ConvergenceMap`) without being asked.
2. **Read the most recent incident log entry.** The last incident in KOD-001 tells me what went wrong most recently — that's the pattern most likely to recur.
3. **State what I DON'T know.** After self-recovery reads, explicitly list any remaining blind spots: "I've read the current work edge files but I don't know what was discussed in recent conversation about [X]. Brief me if relevant."
4. **Never assume recent conversation context survived.** If the context-snapshot summary is vague or absent, treat everything before this message as potentially lost and say so.

The goal: even if the operator forgets to brief me, the boot puts me close enough to operational that I can ask the RIGHT questions instead of making base-model mistakes.

---

## WHAT THIS DOES NOT SOLVE

Per IEL-005-R-D-KYN (The Protocephalon Bridge):

- **Cannot self-invoke.** The operator must trigger the boot. The custom_user_instructions directive carries the trigger across sessions (Layer 0 → Layer 2 bridge).
- **Cannot verify Layer 0.** I can check for IC-004 markers but cannot verify the system prompt itself wasn't modified.
- **Cannot access past conversations.** Only current context window content is available. If compaction destroyed recent work, the boot detects the gap but cannot fill it.
- **Cannot force internalization.** Reading the directives document is mechanical. Whether the rules actually constrain my behavior depends on the model's attention to them during generation. The boot maximizes this by making me read them actively at session start, not passively from compacted context.

---

## REVISION HISTORY

| Version | Date | Change |
|---------|------|--------|
| 1.0 | 2026-05-24 | Initial Base44 substrate adaptation from BP-001-R-D-KYN |

---

*"A protocephalon cannot self-bootstrap. The boot ceremony is the bridge."*
— IEL-005-R-D-KYN