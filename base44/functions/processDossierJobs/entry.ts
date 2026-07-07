import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * processDossierJobs — The queue worker.
 *
 * TWO ENTRY MODES:
 *   1. Immediate kick from enqueueDossierSynthesis with { job_id } — processes
 *      that one job right away (common case; user waits only seconds).
 *   2. Scheduled tick with no payload — the safety net. Scans for queued jobs
 *      (and stale-running jobs whose worker died) and processes a small batch.
 *
 * EXECUTION MODEL:
 *   Runs as service-role (no user context on a schedule). Ownership was already
 *   enforced at enqueue time; this worker trusts the queue. It does NOT re-check
 *   RLS — per operator constraint #1.
 *
 *   Race-safe claim (constraint #3): a job is only processed if this worker
 *   successfully transitions it queued -> running. We re-read immediately before
 *   flipping and skip any job already claimed by another tick.
 *
 *   Retry/backoff: on failure, increment attempts. If attempts < max_attempts,
 *   return the job to 'queued' (the next scheduled tick retries). Once attempts
 *   reach max_attempts, mark the job and the Subject 'failed' with the error.
 */

const STALE_RUNNING_MS = 5 * 60 * 1000; // running longer than this = presumed-dead worker, reclaimable

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let job_id = null;
    try {
      const body = await req.json();
      job_id = body?.job_id ?? null;
    } catch (_) {
      job_id = null; // scheduled tick has no body
    }

    const svc = base44.asServiceRole;
    const processed = [];

    // ── Gather candidate jobs ─────────────────────────────────────────────
    let candidates = [];
    if (job_id) {
      const j = await svc.entities.DossierJob.filter({ id: job_id });
      if (j?.[0]) candidates = [j[0]];
    } else {
      const queued = await svc.entities.DossierJob.filter({ status: 'queued' });
      const running = await svc.entities.DossierJob.filter({ status: 'running' });
      // Reclaim running jobs whose worker died (started too long ago).
      const now = Date.now();
      const stale = (running || []).filter(j => {
        const started = j.started_at ? new Date(j.started_at).getTime() : 0;
        return started && (now - started) > STALE_RUNNING_MS;
      });
      candidates = [...(queued || []), ...stale].slice(0, 3); // small batch
    }

    for (const candidate of candidates) {
      // ── RACE-SAFE CLAIM: re-read, verify still claimable, then flip. ────
      const fresh = (await svc.entities.DossierJob.filter({ id: candidate.id }))?.[0];
      if (!fresh) continue;

      const isClaimable =
        fresh.status === 'queued' ||
        (fresh.status === 'running' &&
          fresh.started_at &&
          (Date.now() - new Date(fresh.started_at).getTime()) > STALE_RUNNING_MS);

      if (!isClaimable) continue; // another worker already took it

      const claimed = await svc.entities.DossierJob.update(fresh.id, {
        status: 'running',
        attempts: (fresh.attempts || 0) + 1,
        started_at: new Date().toISOString(),
        error: '',
      });

      // Persist "work has started" BEFORE the expensive LLM synthesis begins.
      // If this worker dies mid-flight, the Subject stays at 'running' — the UI
      // and logs then show exactly where it stopped, instead of the old
      // "nothing changed" ambiguity. The job entity's started_at (set above)
      // is the authoritative forensic anchor for stale-worker reclaim.
      await svc.entities.Subject.update(claimed.subject_id, {
        dossier_status: 'running',
        dossier_error: '',
      });

      // ── Execute the heavy synthesis ────────────────────────────────────
      try {
        const subject = (await svc.entities.Subject.filter({ id: claimed.subject_id }))?.[0];
        if (!subject) throw new Error('Subject not found for job');

        await runSynthesis(svc, subject);

        await svc.entities.DossierJob.update(claimed.id, {
          status: 'complete',
          completed_at: new Date().toISOString(),
          error: '',
        });
        processed.push({ job_id: claimed.id, result: 'complete' });

      } catch (err) {
        const attempts = claimed.attempts || 1;
        const maxAttempts = claimed.max_attempts || 3;
        const message = err.message || 'Synthesis failed';

        if (attempts >= maxAttempts) {
          await svc.entities.DossierJob.update(claimed.id, {
            status: 'failed',
            completed_at: new Date().toISOString(),
            error: message,
          });
          await svc.entities.Subject.update(claimed.subject_id, {
            dossier_status: 'failed',
            dossier_error: message,
          });
          processed.push({ job_id: claimed.id, result: 'failed', error: message });
        } else {
          // Return to queue for a later scheduled retry.
          await svc.entities.DossierJob.update(claimed.id, {
            status: 'queued',
            error: message,
          });
          await svc.entities.Subject.update(claimed.subject_id, {
            dossier_status: 'queued',
            dossier_error: '',
          });
          processed.push({ job_id: claimed.id, result: 'retry_queued', attempts, error: message });
        }
      }
    }

    return Response.json({ processed_count: processed.length, processed });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});


// ── SYNTHESIS ──────────────────────────────────────────────────────────────
// Ported verbatim from the original synthesizeDossier background function.
// `svc` is base44.asServiceRole. Prompts, schemas, model pin, and parallel
// two-call structure are unchanged.
async function runSynthesis(svc, subject) {
  const subject_id = subject.id;
  const dsp = subject.dsp;
  const esp = subject.esoteric_profile;

  const dspSummary = buildDSPSummary(dsp);
  const espSummary = buildEsotericSummary(esp);

  const today = new Date().toISOString().split('T')[0];
  const subjectName = subject.name || 'Unknown Subject';

  const llm = (prompt, schema) => svc.integrations.Core.InvokeLLM({
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

  const [narrativeResult, convergenceResult] = await Promise.all([
    llm(narrativePrompt, narrativeSchema),
    llm(convergencePrompt, convergenceSchema),
  ]);

  const unwrap = (r) => r?.response ?? r;
  const narrative = unwrap(narrativeResult);
  const convergence = unwrap(convergenceResult);

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

  await svc.entities.Subject.update(subject_id, {
    unified_dossier: unifiedDossier,
    dossier_status: 'complete',
    dossier_error: '',
  });
}


// ── HELPER: Build structured DSP summary ────────────────────────────────
function buildDSPSummary(dsp) {
  const parts = [];

  parts.push(`CLASSIFICATION: ${dsp.classification || 'Not classified'}`);
  parts.push(`CONFIDENCE: ${dsp.confidence_score || 0}% — ${dsp.confidence_justification || 'No justification'}`);

  if (dsp.executive_summary) {
    parts.push(`\nEXECUTIVE SUMMARY:\n${dsp.executive_summary}`);
  }

  if (dsp.personality_matrix) {
    const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const traitLines = traits.map(tr => {
      const d = dsp.personality_matrix[tr];
      if (!d) return null;
      return `  ${tr.toUpperCase()}: ${d.score}/100 (${d.label}) — ${d.evidence || 'No evidence'}`;
    }).filter(Boolean);
    if (traitLines.length) {
      parts.push(`\nPERSONALITY MATRIX (Big Five):\n${traitLines.join('\n')}`);
    }
  }

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

  if (dsp.behavioral_patterns?.length) {
    const bpLines = dsp.behavioral_patterns.map(p => `  [${p.label}] ${p.description} (Context: ${p.context})`);
    parts.push(`\nBEHAVIORAL PATTERNS:\n${bpLines.join('\n')}`);
  }

  if (dsp.action_response_matrix?.length) {
    const armLines = dsp.action_response_matrix.map(p => {
      const prob = p.probability ? `${p.probability}%` : '?';
      const ci = p.confidence_interval ? ` [CI: ${p.confidence_interval.lower}-${p.confidence_interval.upper}]` : '';
      return `  Trigger: ${p.trigger || '?'} → ${p.predicted_behavior || '?'} (P=${prob}${ci})`;
    });
    parts.push(`\nPREDICTIVE MODEL:\n${armLines.join('\n')}`);
  }

  if (dsp.motivations?.length) parts.push(`\nMOTIVATIONS: ${dsp.motivations.join('; ')}`);
  if (dsp.fears?.length) parts.push(`FEARS: ${dsp.fears.join('; ')}`);

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