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

    // ── CALL 1: Inquiry Frame + Astrology + Numerology ──
    const call1 = base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `CP-012-O-D-ESP PHASE I–IV

${baseParams}

Rules: Astrology = timing/activation. Numerology = structure/cycles. No vague symbolic language. Every claim anchored to specific mechanisms.

PHASE I (show calculations): Sun/Moon/Rising (use TOB if provided). Life Path (reduce DOB), Expression (Pythagorean, full name), Soul Urge (vowels), Personal Year.

PHASE II — Inquiry Frame: Answer 3 questions with analytical depth:
1. What emotional pattern / developmental task is currently activated?
2. Is subject in rupture, reintegration, plateau, or threshold transit?
3. Which relational/identity pattern is repeating and what mechanism drives it now?

PHASE III — Astrological Interpretation: Time-governed psychodynamic map anchored to current transits/progressions. 3 paragraphs.

PHASE IV — Numerological Interpretation: Show all calculations. Structural cycle architecture, lesson recurrence, threshold meanings. 2-3 paragraphs.`,
      response_json_schema: {
        type: 'object',
        properties: {
          inquiry_frame: { type: 'string' },
          astrological_interpretation: { type: 'string' },
          numerological_interpretation: { type: 'string' },
        }
      }
    });

    // ── CALL 2: Synthesis + Threshold + Strategic + Validation ──
    const call2 = base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt: `CP-012-O-D-ESP PHASE V–VII

${baseParams}

Rules: Astrology = timing/activation. Numerology = structure/cycles. Reconcile both — if divergent, declare tension explicitly, never force false harmony.

PHASE V–VI — Unified Emotional Synthesis: Merge both nodes into one subject model. Dominant emotional pattern, core adaptation/defense, relational pattern, current threshold state, developmental task for this mode/timeframe. 4 paragraphs.

PHASE VI — Threshold Assessment: Current phase (rupture/reintegration/plateau/threshold transit). What is being crossed. What this period demands. 2 paragraphs.

PHASE VII — Strategic Translation: Each major finding translated to a concrete behavioral, relational, or developmental implication. Specific, practical. 3 paragraphs.

LIMITATION STATEMENT: TOB impact, calculation constraints, fidelity caveats. 1 paragraph.

SME VALIDATION: Honest boolean assessment of each criterion.`,
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

    // Run both calls in parallel
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