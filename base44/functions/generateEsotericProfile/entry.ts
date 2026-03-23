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

    const dspSummary = subject.dsp?.executive_summary
      ? subject.dsp.executive_summary.slice(0, 600)
      : '';

    const baseParams = `Subject: ${subjectName}
Full Birth Name: ${full_birth_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not provided — Reduced-Fidelity'}
Place of Birth: ${place_of_birth}
Mode: ${executionMode}${timeframe ? `\nTimeframe: ${timeframe}` : ''}${focus ? `\nFocus: ${focus}` : ''}${dspSummary ? `\nDSP Summary: ${dspSummary}` : ''}`;

    const llm = (prompt, schema) => base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gemini_3_flash',
      prompt,
      response_json_schema: { type: 'object', properties: schema }
    });

    // ── 4 CALLS in 2 staggered pairs to avoid rate limits ──
    const [rA, rB] = await Promise.all([

      // A: Inquiry Frame + Calculations
      llm(`CP-012 PHASE I–II\n${baseParams}\n\nINSTRUCTION: Proceed immediately with your best calculations using standard assumptions (tropical zodiac, Placidus houses, Western numerology Pythagorean system). Do NOT ask clarifying questions.\n\nPHASE I: Show astrological calculations (Sun/Moon/Rising using TOB if provided) and numerological calculations (Life Path, Expression, Soul Urge, Personal Year). Show your arithmetic.\n\nPHASE II — Inquiry Frame: Answer these 3 questions with analytical depth (2 paragraphs each):\n1. What emotional pattern / developmental task is currently activated?\n2. Is subject in rupture, reintegration, plateau, or threshold transit?\n3. Which relational/identity pattern is repeating and what mechanism drives it now?\nNo vague symbolic language. Every claim anchored to a specific planetary or numerological mechanism.`,
        { inquiry_frame: { type: 'string' } }),

      // B: Astrological + Numerological Interpretation
      llm(`CP-012 PHASE III–IV\n${baseParams}\n\nINSTRUCTION: Proceed immediately with your best calculations using standard assumptions (tropical zodiac, Placidus houses, Western Pythagorean numerology). Do NOT ask clarifying questions.\n\nPHASE III — Astrological Interpretation (Node Alpha): Time-governed psychodynamic map. Current transits and progressions that are active now. Reference specific degrees and aspects. 3 tight paragraphs.\n\nPHASE IV — Numerological Interpretation (Node Beta): Structural cycle architecture. Life Path lesson, current pinnacle/challenge, personal year meaning. 2 tight paragraphs.\n\nNo vague language. Every claim mechanistically grounded.`,
        { astrological_interpretation: { type: 'string' }, numerological_interpretation: { type: 'string' } }),

    ]);
    const [rC, rD] = await Promise.all([
      // C: Synthesis + Threshold + Strategic
      llm(`CP-012 PHASE V–VII\n${baseParams}\n\nINSTRUCTION: Proceed immediately. Do NOT ask clarifying questions. Use standard astrological and numerological assumptions.\n\nPHASE V–VI — Unified Emotional Synthesis: Reconcile astrology (timing) and numerology (structure) into one subject model. Dominant emotional pattern, core defense, relational pattern, current threshold state. If divergent, declare tension explicitly. 3 paragraphs.\n\nPHASE VI — Threshold Assessment: Current phase (rupture/reintegration/plateau/threshold transit). What is being crossed, what this period demands. 2 paragraphs.\n\nPHASE VII — Strategic Translation: Concrete behavioral, relational, and developmental implications. Specific and practical. 2 paragraphs.`,
        { unified_emotional_synthesis: { type: 'string' }, threshold_assessment: { type: 'string' }, strategic_translation: { type: 'string' } }),

      llm(`CP-012 PHASE VIII\n${baseParams}\n\nINSTRUCTION: Proceed immediately. Do NOT ask clarifying questions.\n\nLIMITATION STATEMENT: In 1 paragraph, describe the material constraints affecting confidence in this reading — missing TOB impact, calculation approximations, fidelity caveats.\n\nSME VALIDATION: Honestly assess whether each criterion was met (true/false) and set execution_status to COMPLIANT or NONCOMPLIANT.`,
        {
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
        }),
    ]);

    const unwrap = (r) => r?.response ?? r;
    const [a, b, c, d] = [unwrap(rA), unwrap(rB), unwrap(rC), unwrap(rD)];

    const esotericProfile = {
      ...a, ...b, ...c, ...d,
      input_fidelity: fidelityState,
      execution_status: d?.sme_validation?.execution_status || 'COMPLIANT',
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