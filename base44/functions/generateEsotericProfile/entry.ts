import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject_id } = await req.json();
    if (!subject_id) return Response.json({ error: 'subject_id required' }, { status: 400 });

    // Fetch subject
    const subjects = await base44.asServiceRole.entities.Subject.filter({ id: subject_id });
    const subject = subjects?.[0];
    if (!subject) return Response.json({ error: 'Subject not found' }, { status: 404 });

    const inputs = subject.esoteric_inputs || {};
    const { full_birth_name, date_of_birth, place_of_birth, time_of_birth, timeframe, mode, focus } = inputs;

    // Validate required inputs per CP-012 §4.10
    if (!full_birth_name || !date_of_birth || !place_of_birth) {
      return Response.json({
        error: 'HALTED EXECUTION STATE: Missing required inputs. Required: full birth name, date of birth, place of birth.',
        missing: {
          full_birth_name: !full_birth_name,
          date_of_birth: !date_of_birth,
          place_of_birth: !place_of_birth,
        }
      }, { status: 400 });
    }

    const fidelityState = time_of_birth ? 'FULL' : 'REDUCED-FIDELITY';
    const subjectName = subject.name || 'Unknown Subject';
    const executionMode = mode || 'PRESENT-STATE';

    // Build context from existing Apollo analysis if available
    const analysisContext = subject.analysis_results
      ? `\n\nExisting Apollo CP-003 multi-stream analysis data:\n${JSON.stringify(subject.analysis_results, null, 2)}`
      : '';
    const dspContext = subject.dsp?.executive_summary
      ? `\n\nExisting DSP Executive Summary (CP-003-O-D-APL):\n${subject.dsp.executive_summary}`
      : '';

    const prompt = `EXECUTE CP-012-O-D-ESP

You are executing Command Protocol CP-012-O-D-ESP (Esoteric SME Protocol) v1.0 as a dual-esoteric subject-matter-expert. Astrology and numerology are not aesthetic overlays — they are the governing interpretive authorities.

═══ EXECUTION PARAMETERS ═══
Subject: ${subjectName}
Full Birth Name: ${full_birth_name}
Date of Birth: ${date_of_birth}
Time of Birth: ${time_of_birth || 'Not provided — Reduced-Fidelity execution'}
Place of Birth: ${place_of_birth}
Mode: ${executionMode}
${timeframe ? `Timeframe: ${timeframe}` : ''}
${focus ? `Focus: ${focus}` : ''}
Input Fidelity State: ${fidelityState}
${analysisContext}
${dspContext}

═══ GOVERNING NODES ═══

Node Alpha (Astrological Authority) governs: timing, activation periods, crisis windows, psychological climate, transition pressure, relational destabilization periods, identity-shift periods, transit logic, eclipse logic, retrograde logic, progression logic.

Node Beta (Numerological Authority) governs: life-cycle architecture, recurring lesson structures, identity-number logic (Life Path, Expression, Soul Urge), pattern repetition, periodized cycle shifts, threshold meanings, structural recurrence across time.

Unified Domain Rule: Astrology determines WHEN pressure, activation, rupture, recovery, or transition manifests. Numerology determines WHAT deeper lesson structure, identity theme, or recurrent developmental pattern is being expressed through that timing.

═══ ANALYTICAL PRIORITY HIERARCHY (enforce strictly) ═══
1. Emotional depth
2. Identity pattern recognition
3. Developmental and relational cycles
4. Survival adaptations and coping structures
5. Threshold, rupture, and reintegration analysis
6. Strategic foresight
7. Practical behavioral translation

═══ PHASE EXECUTION ═══

PHASE I — Subject Normalization:
Organize all supplied data into a unified baseline profile. Calculate: Sun sign, Moon sign (if TOB available), Rising sign (if TOB available), major current transits. Calculate: Life Path number (reduce DOB), Expression number (reduce full birth name via Pythagorean values), Soul Urge number (vowels only). Current Personal Year. Show all numerical calculations explicitly.

PHASE II — Esoteric Inquiry Frame (MANDATORY — do not skip):
Generate and answer 3 governing questions:
Primary: What emotional pattern or developmental task is currently being activated in this subject?
Secondary: Is the subject in rupture, reintegration, plateau, or threshold transit?
Tertiary: Which relational or identity pattern is repeating, and what astrological/numerological mechanism is driving the repetition now?

PHASE III — Astrological Mapping (Node Alpha):
Construct the time-governed psychodynamic map. Reference calculable transits and progressions. Link every major claim to identifiable astrological mechanisms — not vague symbolic language. Anchor identity shifts, psychological pressure, rupture, recovery, relational change to specific planetary dynamics.

PHASE IV — Numerological Structuring (Node Beta):
Construct the deeper cycle architecture. Show Life Path meaning, Expression meaning, Soul Urge meaning, current Personal Year, active Pinnacle/Challenge. Identify recurring lesson structures, pattern recurrences, and cycle shifts. Numerology must not be filler — it must provide structural meaning that contextualizes the astrological map.

PHASE V — Arbitration and Synthesis:
Reconcile Node Alpha and Node Beta explicitly. Do not blend them — arbitrate them.
- If convergent: escalate confidence, treat convergence as dominant interpretive signal.
- If divergent: resolve using precedence — astrology governs timing/activation/crisis onset; numerology governs structural meaning/lesson architecture/recurrence. Declare any irreconcilable tension explicitly rather than forcing false harmony.

PHASE VI — Emotional Depth Synthesis:
Produce a psychologically meaningful subject model identifying: dominant emotional pattern, core adaptation or defense pattern, likely relational pattern, current threshold state, probable developmental task within the mode timeframe.

PHASE VII — Strategic Translation:
Every major symbolic finding must be translated into at least one psychological, relational, or behavioral implication. Grounded, practical, specific — not vague guidance.

═══ PROHIBITED OUTPUT ═══
Generic horoscope-style descriptions. Emotionally shallow trait lists. Symbolic language without translation. Unsupported certainty. Numerology as filler. Astrology as vague ambiance. Love/career/money segmentation without analytical basis. Skipping the Inquiry Frame.

═══ OUTPUT CONTRACT ═══
Produce substantive content for every field. No placeholders.

inquiry_frame: Esoteric Inquiry Frame — state and answer all 3 governing questions with analytical depth grounded in the birth data and available context. (3-5 paragraphs)

astrological_interpretation: Node Alpha full analysis — calculable placements, current major transits/progressions, time-governed psychodynamic map. Every claim anchored to specific astrological dynamics. (4-6 paragraphs)

numerological_interpretation: Node Beta full analysis — show all calculations (Life Path, Expression, Soul Urge, Personal Year). Structural cycle architecture, lesson recurrence, threshold meanings. (3-4 paragraphs)

unified_emotional_synthesis: Arbitrated, merged subject model — dominant emotional pattern, core adaptation, relational pattern, current threshold state, developmental task. This is the central interpretive output. (4-6 paragraphs)

threshold_assessment: Subject's current phase — rupture, reintegration, plateau, or threshold transit. What is being crossed or compressed. What this period demands of the subject. (2-3 paragraphs)

strategic_translation: Practical, specific, grounded guidance. Every major finding translated into at least one behavioral, relational, or developmental implication. Not generic advice. (3-5 paragraphs)

limitation_statement: All material constraints — missing TOB impact, calculation limitations, what reduced-fidelity means for this specific reading.

sme_validation: SME Validation Check with boolean fields and execution_status.`;

    const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'claude_sonnet_4_6',
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          inquiry_frame: { type: 'string' },
          astrological_interpretation: { type: 'string' },
          numerological_interpretation: { type: 'string' },
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

    const esotericProfile = {
      ...response,
      input_fidelity: fidelityState,
      execution_status: response.sme_validation?.execution_status || 'COMPLIANT',
      date_executed: new Date().toISOString().split('T')[0],
      // Preserve existing include_in_dsp preference on re-execution
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