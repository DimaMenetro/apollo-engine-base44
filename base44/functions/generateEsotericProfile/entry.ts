import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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

    const inputs = subject.esoteric_inputs || {};
    const { full_birth_name, date_of_birth, place_of_birth, time_of_birth, timeframe, mode, focus } = inputs;

    if (!full_birth_name || !date_of_birth || !place_of_birth) {
      return Response.json({
        error: 'HALTED: Missing required inputs. Required: full birth name, date of birth, place of birth.',
        missing: { full_birth_name: !full_birth_name, date_of_birth: !date_of_birth, place_of_birth: !place_of_birth }
      }, { status: 400 });
    }

    const fidelityState = time_of_birth ? 'FULL' : 'REDUCED-FIDELITY';
    const subjectName = subject.name || 'Unknown Subject';
    const executionMode = mode || 'PRESENT-STATE';

    const analysisContext = subject.analysis_results
      ? `Existing Apollo analysis (summary only): ${JSON.stringify({
          stylometric: subject.analysis_results.stylometric_fingerprint?.summary,
          cognitive: subject.analysis_results.cognitive_architecture?.summary,
          affective: subject.analysis_results.affective_state?.summary,
          behavioral: subject.analysis_results.behavioral_loop?.summary,
        })}`
      : '';

    const dspContext = subject.dsp?.executive_summary
      ? `DSP Executive Summary: ${subject.dsp.executive_summary.slice(0, 800)}`
      : '';

    const baseParams = `Subject: ${subjectName}
Full Birth Name: ${full_birth_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not provided — Reduced-Fidelity'}
Place of Birth: ${place_of_birth}
Mode: ${executionMode}${timeframe ? `\nTimeframe: ${timeframe}` : ''}${focus ? `\nFocus: ${focus}` : ''}
${analysisContext}
${dspContext}`;

    // ── CALL 1: Inquiry Frame + Node Alpha (Astrology) + Node Beta (Numerology) ──
    const call1 = base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `EXECUTE CP-012-O-D-ESP — PHASE I–IV

${baseParams}

You are executing CP-012 as a dual esoteric SME. Astrology governs timing/activation/crisis. Numerology governs structure/cycles/recurrence.

PHASE I — Subject Normalization:
Calculate and show: Sun sign, Moon sign (if TOB available), Rising sign (if TOB available), key active transits. Calculate Life Path (reduce full DOB), Expression (Pythagorean, full birth name), Soul Urge (vowels only), current Personal Year. Show all calculations explicitly.

PHASE II — Esoteric Inquiry Frame (mandatory):
Generate and answer 3 governing questions:
1. PRIMARY: What emotional pattern or developmental task is currently being activated?
2. SECONDARY: Is the subject in rupture, reintegration, plateau, or threshold transit?
3. TERTIARY: Which relational/identity pattern is repeating and what astrological/numerological mechanism drives it now?
Answer each with analytical depth grounded in the birth data. (3-4 paragraphs total)

PHASE III — Astrological Interpretation (Node Alpha):
Time-governed psychodynamic map. Reference calculable transits and progressions. Every claim anchored to specific planetary dynamics — no vague symbolic language. (3-4 paragraphs)

PHASE IV — Numerological Interpretation (Node Beta):
Show all calculations (Life Path, Expression, Soul Urge, Personal Year, active Pinnacle/Challenge). Structural cycle architecture, lesson recurrence, threshold meanings. (3 paragraphs)`,
      response_json_schema: {
        type: 'object',
        properties: {
          inquiry_frame: { type: 'string' },
          astrological_interpretation: { type: 'string' },
          numerological_interpretation: { type: 'string' },
        }
      }
    });

    // ── CALL 2: Synthesis + Threshold + Strategic + Limitation + Validation ──
    const call2 = base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `EXECUTE CP-012-O-D-ESP — PHASE V–VII

${baseParams}

You are executing CP-012 as a dual esoteric SME. Astrology governs timing/activation/crisis. Numerology governs structure/cycles/recurrence.

For context on this subject's calculated placements: Sun, Moon, Rising (if TOB available), Life Path, Expression, Soul Urge numbers are calculated from the birth data above.

PHASE V–VI — Unified Emotional Synthesis:
Reconcile astrology (timing/activation) and numerology (structure/lesson) into a coherent merged subject model. Identify: dominant emotional pattern, core adaptation/defense, relational pattern, current threshold state, probable developmental task within the mode timeframe. This is the central interpretive output. If convergent: escalate confidence. If divergent: declare tension explicitly. (4-5 paragraphs)

PHASE VI — Threshold Assessment:
Subject's current phase — rupture, reintegration, plateau, or threshold transit. What is being crossed or compressed. What this period demands. (2-3 paragraphs)

PHASE VII — Strategic Translation:
Every major finding translated into at least one behavioral, relational, or developmental implication. Grounded, specific, practical — not generic advice. (3-4 paragraphs)

LIMITATION STATEMENT: Material constraints — missing TOB impact, calculation limitations, what reduced-fidelity means for this specific reading. (1-2 paragraphs)

SME VALIDATION: Assess each criterion honestly.`,
      response_json_schema: {
        type: 'object',
        properties: {
          unified_emotional_synthesis: { type: 'string' },
          threshold_assessment: { type: 'string' },
          strategic_translation: { type: 'string' },
          limitation_statement: { type: 'string' },
          sme_validation: {
            type: 'object',
            properties: {
              astrology_governed_timing: { type: 'boolean' },
              numerology_governed_structure: { type: 'boolean' },
              emotional_depth_prioritized: { type: 'boolean' },
              practical_translation_achieved: { type: 'boolean' },
              generic_horoscope_drift_avoided: { type: 'boolean' },
              execution_status: { type: 'string' }
            }
          }
        }
      }
    });

    // Run both calls in parallel with a 150s timeout guard
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('CP-012 execution timed out. Please retry.')), 150000)
    );
    const [raw1, raw2] = await Promise.race([Promise.all([call1, call2]), timeout.then(() => { throw new Error('timeout'); })])
      .catch(() => Promise.all([call1, call2]));

    const [raw1, raw2] = await Promise.all([call1, call2]);

    // asServiceRole.integrations wraps the schema result in a `response` key
    const result1 = raw1?.response ?? raw1;
    const result2 = raw2?.response ?? raw2;

    const esotericProfile = {
      ...result1,
      ...result2,
      input_fidelity: fidelityState,
      execution_status: result2.sme_validation?.execution_status || 'COMPLIANT',
      date_executed: new Date().toISOString().split('T')[0],
      include_in_dsp: subject.esoteric_profile?.include_in_dsp || false,
    };

    await base44.asServiceRole.entities.Subject.update(subject_id, {
      esoteric_profile: esotericProfile
    });

    return Response.json({ success: true, esoteric_profile: esotericProfile });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});