import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * synthesizeDossier — Phase 3b of IP-001-G-D-APL
 *
 * MELLMA-style multi-expert arbitration: takes the DSP (empirical lens)
 * and Esoteric Profile (symbolic lens) and produces a single unified
 * narrative document where insights are woven, not concatenated.
 *
 * The LLM acts as a senior integrative analyst who has BOTH reports
 * on their desk and writes ONE document in a single authoritative voice.
 *
 * EXECUTION MODEL — Asynchronous:
 * Full-fidelity synthesis on Opus can exceed the synchronous request
 * ceiling. This handler validates, marks the subject as `generating`,
 * launches the heavy two-call synthesis in the background via
 * EdgeRuntime.waitUntil, and returns immediately. The UI polls
 * `dossier_status` and renders when it reaches `complete`.
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject_id } = await req.json();
    if (!subject_id) return Response.json({ error: 'subject_id required' }, { status: 400 });

    const subjects = await base44.asServiceRole.entities.Subject.filter({ id: subject_id });
    const subject = subjects?.[0];
    if (!subject) return Response.json({ error: 'Subject not found' }, { status: 404 });

    // ── Ownership guard: enforce RLS boundary manually since we use asServiceRole ──
    // Only the creator or an admin may trigger synthesis / overwrite this dossier.
    if (subject.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dsp = subject.dsp;
    const esp = subject.esoteric_profile;

    // ── Validate both sources exist ─────────────────────────────────────
    if (!dsp?.executive_summary) {
      return Response.json({ error: 'DSP not yet generated. Generate the DSP before synthesizing.' }, { status: 400 });
    }
    if (!esp?.execution_status) {
      return Response.json({ error: 'Esoteric Profile not yet generated. Execute CP-012 before synthesizing.' }, { status: 400 });
    }

    // ── ASYNC KICKOFF ────────────────────────────────────────────────────
    // Mark generating, launch background work, return immediately.
    await base44.asServiceRole.entities.Subject.update(subject_id, {
      dossier_status: 'generating',
      dossier_error: '',
    });

    // Launch background synthesis without awaiting — the isolate keeps the
    // in-flight promise alive while the HTTP response returns immediately.
    runSynthesis(base44, subject);

    return Response.json({ started: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});


// ── BACKGROUND SYNTHESIS ──────────────────────────────────────────────────
// Runs after the HTTP response has been returned. Preserves the exact
// prompts, schemas, and parallel two-call structure. Model pinned to Opus 4.6
// per operator directive — Gemini is forbidden under all circumstances.
async function runSynthesis(base44, subject) {
  const subject_id = subject.id;
  try {
    const dsp = subject.dsp;
    const esp = subject.esoteric_profile;

    // ── Build structured summaries (not raw blobs) to manage token budget ──
    const dspSummary = buildDSPSummary(dsp);
    const espSummary = buildEsotericSummary(esp);

    const today = new Date().toISOString().split('T')[0];
    const subjectName = subject.name || 'Unknown Subject';

    // ── SYNTHESIS PROMPT ─────────────────────────────────────────────────
    // Two staggered calls: (1) narrative sections, (2) convergence map + final assessment
    const llm = (prompt, schema) => base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_opus_4_6',
      prompt,
      response_json_schema: { type: 'object', properties: schema }
    });

    const systemContext = `You are a senior integrative analyst. You have two independent assessments of the same subject on your desk:

1. DEFINITIVE SUBJECT PROFILE (DSP) — Empirical, data-driven psychological portrait derived from multimodal behavioral analysis (text, audio, video, behavioral data, handwriting).
2. ESOTERIC INTELLIGENCE PROFILE (ESP) — Symbolic, archetypal portrait derived from astrological and numerological analysis.

Your task is NOT to summarize them separately or concatenate them. Your task is to SYNTHESIZE them into a single unified document written in ONE authoritative voice, as if you had access to both knowledge domains simultaneously.

CRITICAL RULES:
- Write as one analyst who sees through both lenses, not as a reporter quoting two sources
- When the two lenses agree, state the finding with strengthened confidence and note that convergence
- When they diverge, declare the tension explicitly and explain what the disagreement reveals
- PRESERVE all quantitative data: Big Five scores, probability percentages, CI ranges, transit names, numerological values, personal year numbers
- Every section must weave empirical and symbolic insights together, not present them sequentially
- The tone should be analytical, authoritative, and psychologically sophisticated

SUBJECT: ${subjectName}`;

    // ── Call 1: Narrative Sections ──────────────────────────────────────
    const narrativePrompt = `${systemContext}

DSP DATA:
${dspSummary}

ESOTERIC DATA:
${espSummary}

Produce these unified sections. Each must integrate BOTH lenses into a single woven narrative:

1. UNIFIED IDENTITY PORTRAIT (4-5 paragraphs): Merge the DSP executive summary with the esoteric inquiry frame and unified emotional synthesis. Who IS this person when seen through both lenses simultaneously?

2. PSYCHODYNAMIC ARCHITECTURE (3-4 paragraphs): Merge DSP cognitive architecture (thinking style, epistemic requirements, defense mechanisms) with the astrological interpretation. How do the subject's cognitive patterns align with or diverge from their planetary activations?

3. PERSONALITY & ARCHETYPAL RESONANCE (3-4 paragraphs): Merge the Big Five personality matrix with the numerological interpretation. Reference specific scores alongside cycle positions. Where does the empirical personality confirm or challenge the archetypal structure?

4. BEHAVIORAL TOPOLOGY (3-4 paragraphs): Merge behavioral patterns with the threshold assessment. Is the subject's observed behavioral loop congruent with their esoteric phase? What does the combination reveal?

5. PREDICTIVE CONVERGENCE MODEL (3-4 paragraphs): Merge the action/response matrix (triggers, predicted behaviors, probabilities) with the strategic translation. Where do empirical predictions and esoteric guidance point in the same direction? Where do they diverge?

6. CORE DRIVERS & SHADOW MATERIAL (2-3 paragraphs): Merge motivations/fears with the limitation statement. What drives this person at the deepest level when both lenses are applied?`;

    const narrativeSchema = {
      unified_identity_portrait: { type: 'string' },
      psychodynamic_architecture: { type: 'string' },
      personality_archetypal_resonance: { type: 'string' },
      behavioral_topology: { type: 'string' },
      predictive_convergence_model: { type: 'string' },
      core_drivers_shadow: { type: 'string' },
    };

    // ── Call 2: Convergence Map + Final Assessment ──────────────────────
    const convergencePrompt = `${systemContext}

DSP DATA:
${dspSummary}

ESOTERIC DATA:
${espSummary}

Produce:

1. CONVERGENCE MAP — Analyze where the two lenses agree and disagree:
   - convergence_points: Array of 4-6 objects. Each has: domain (string), dsp_evidence (what the DSP shows), esoteric_evidence (what the ESP shows), significance (why their agreement matters), confidence (0-100).
   - divergence_points: Array of 2-4 objects. Each has: domain (string), dsp_position (what DSP says), esoteric_position (what ESP says), arbitration (your integrative judgment on what the divergence reveals), tension_value (low/medium/high — how significant is the disagreement).
   - overall_alignment_score: Integer 0-100 representing how aligned the two lenses are overall.

2. FINAL UNIFIED ASSESSMENT (5-7 paragraphs): The single-voice definitive portrait of this subject. This is the culmination. It should read as if one brilliant analyst wrote it from complete knowledge. Reference specific data points from both domains naturally. This is the document that makes separate DSP and ESP reports unnecessary.

3. SYNTHESIS CONFIDENCE: Integer 0-100 — your confidence in this synthesis.

4. SYNTHESIS METHODOLOGY NOTE: 2-3 sentences on how the synthesis was conducted, what was prioritized, and any caveats.`;

    const convergenceSchema = {
      convergence_map: {
        type: 'object',
        properties: {
          convergence_points: { type: 'array', items: { type: 'object' } },
          divergence_points: { type: 'array', items: { type: 'object' } },
          overall_alignment_score: { type: 'number' }
        }
      },
      final_unified_assessment: { type: 'string' },
      synthesis_confidence: { type: 'number' },
      synthesis_methodology_note: { type: 'string' },
    };

    // ── Execute both calls in parallel ──────────────────────────────────
    const [narrativeResult, convergenceResult] = await Promise.all([
      llm(narrativePrompt, narrativeSchema),
      llm(convergencePrompt, convergenceSchema),
    ]);

    const unwrap = (r) => r?.response ?? r;
    const narrative = unwrap(narrativeResult);
    const convergence = unwrap(convergenceResult);

    // ── Assemble unified dossier ────────────────────────────────────────
    const unifiedDossier = {
      date_synthesized: today,
      dsp_source_date: dsp.date_of_synthesis || '',
      esoteric_source_date: esp.date_executed || '',
      unified_identity_portrait: narrative.unified_identity_portrait || '',
      psychodynamic_architecture: narrative.psychodynamic_architecture || '',
      personality_archetypal_resonance: narrative.personality_archetypal_resonance || '',
      behavioral_topology: narrative.behavioral_topology || '',
      predictive_convergence_model: narrative.predictive_convergence_model || '',
      core_drivers_shadow: narrative.core_drivers_shadow || '',
      convergence_map: convergence.convergence_map || { convergence_points: [], divergence_points: [], overall_alignment_score: 0 },
      final_unified_assessment: convergence.final_unified_assessment || '',
      synthesis_confidence: convergence.synthesis_confidence || 0,
      synthesis_methodology_note: convergence.synthesis_methodology_note || '',
    };

    // ── Persist ─────────────────────────────────────────────────────────
    await base44.asServiceRole.entities.Subject.update(subject_id, {
      unified_dossier: unifiedDossier,
      dossier_status: 'complete',
      dossier_error: '',
    });

  } catch (error) {
    // Background failure — record it on the subject so the UI can surface it.
    await base44.asServiceRole.entities.Subject.update(subject_id, {
      dossier_status: 'failed',
      dossier_error: error.message || 'Synthesis failed',
    });
  }
}


// ── HELPER: Build structured DSP summary ────────────────────────────────
function buildDSPSummary(dsp) {
  const parts = [];

  parts.push(`CLASSIFICATION: ${dsp.classification || 'Not classified'}`);
  parts.push(`CONFIDENCE: ${dsp.confidence_score || 0}% — ${dsp.confidence_justification || 'No justification'}`);

  if (dsp.executive_summary) {
    parts.push(`\nEXECUTIVE SUMMARY:\n${dsp.executive_summary}`);
  }

  // Personality Matrix — preserve all scores
  if (dsp.personality_matrix) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const traitLines = traits.map(t => {
      const d = dsp.personality_matrix[t];
      if (!d) return null;
      return `  ${t.toUpperCase()}: ${d.score}/100 (${d.label}) — ${d.evidence || 'No evidence'}`;
    }).filter(Boolean);
    if (traitLines.length) {
      parts.push(`\nPERSONALITY MATRIX (Big Five):\n${traitLines.join('\n')}`);
    }
  }

  // Cognitive Architecture
  if (dsp.cognitive_architecture) {
    const ca = dsp.cognitive_architecture;
    const caLines = [];
    if (ca.thinking_style) caLines.push(`  Thinking Style: ${ca.thinking_style}`);
    if (ca.epistemic_requirements) caLines.push(`  Epistemic Requirements: ${ca.epistemic_requirements}`);
    if (ca.defense_mechanisms) caLines.push(`  Defense Mechanisms: ${ca.defense_mechanisms}`);
    if (ca.sub_sections?.length) {
      ca.sub_sections.forEach(s => caLines.push(`  ${s.title}: ${s.content}`));
    }
    if (caLines.length) parts.push(`\nCOGNITIVE ARCHITECTURE:\n${caLines.join('\n')}`);
  }

  // Behavioral Patterns
  if (dsp.behavioral_patterns?.length) {
    const bpLines = dsp.behavioral_patterns.map(p => `  [${p.label}] ${p.description} (Context: ${p.context})`);
    parts.push(`\nBEHAVIORAL PATTERNS:\n${bpLines.join('\n')}`);
  }

  // Action/Response Matrix (predictions)
  if (dsp.action_response_matrix?.length) {
    const armLines = dsp.action_response_matrix.map(p => {
      const prob = p.probability ? `${p.probability}%` : '?';
      const ci = p.confidence_interval ? ` [CI: ${p.confidence_interval.lower}-${p.confidence_interval.upper}]` : '';
      return `  Trigger: ${p.trigger || '?'} → ${p.predicted_behavior || '?'} (P=${prob}${ci})`;
    });
    parts.push(`\nPREDICTIVE MODEL:\n${armLines.join('\n')}`);
  }

  // Motivations & Fears
  if (dsp.motivations?.length) parts.push(`\nMOTIVATIONS: ${dsp.motivations.join('; ')}`);
  if (dsp.fears?.length) parts.push(`FEARS: ${dsp.fears.join('; ')}`);

  // Final Assessment
  if (dsp.final_assessment) {
    parts.push(`\nFINAL ASSESSMENT:\n${dsp.final_assessment}`);
  }

  return parts.join('\n');
}


// ── HELPER: Build structured Esoteric summary ───────────────────────────
function buildEsotericSummary(esp) {
  const parts = [];

  parts.push(`FIDELITY: ${esp.input_fidelity || 'UNKNOWN'}`);
  parts.push(`EXECUTION STATUS: ${esp.execution_status || 'UNKNOWN'}`);
  parts.push(`DATE: ${esp.date_executed || 'Unknown'}`);

  if (esp.inquiry_frame) parts.push(`\nINQUIRY FRAME:\n${esp.inquiry_frame}`);
  if (esp.astrological_interpretation) parts.push(`\nASTROLOGICAL INTERPRETATION (Node Alpha):\n${esp.astrological_interpretation}`);
  if (esp.numerological_interpretation) parts.push(`\nNUMEROLOGICAL INTERPRETATION (Node Beta):\n${esp.numerological_interpretation}`);
  if (esp.unified_emotional_synthesis) parts.push(`\nUNIFIED EMOTIONAL SYNTHESIS:\n${esp.unified_emotional_synthesis}`);
  if (esp.threshold_assessment) parts.push(`\nTHRESHOLD ASSESSMENT:\n${esp.threshold_assessment}`);
  if (esp.strategic_translation) parts.push(`\nSTRATEGIC TRANSLATION:\n${esp.strategic_translation}`);
  if (esp.limitation_statement) parts.push(`\nLIMITATION STATEMENT:\n${esp.limitation_statement}`);

  // SME Validation
  if (esp.sme_validation) {
    const v = esp.sme_validation;
    const checks = [
      `Astrology Governed Timing: ${v.astrology_governed_timing ? 'PASS' : 'FAIL'}`,
      `Numerology Governed Structure: ${v.numerology_governed_structure ? 'PASS' : 'FAIL'}`,
      `Emotional Depth Prioritized: ${v.emotional_depth_prioritized ? 'PASS' : 'FAIL'}`,
      `Practical Translation: ${v.practical_translation_achieved ? 'PASS' : 'FAIL'}`,
      `Generic Drift Avoided: ${v.generic_horoscope_drift_avoided ? 'PASS' : 'FAIL'}`,
    ];
    parts.push(`\nSME VALIDATION: ${v.execution_status || 'UNKNOWN'}\n  ${checks.join('\n  ')}`);
  }

  return parts.join('\n');
}