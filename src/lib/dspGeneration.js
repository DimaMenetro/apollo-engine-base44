import { base44 } from '@/api/base44Client';

// ─── DSP GENERATION — TWO STRUCTURED-OUTPUT PASSES ───────────────────────────
// This is ONE logical DSP operation. It is divided into two calls for exactly
// one reason: the combined fully-typed DSP + Phase-6 simulation schema exceeds
// the provider's structured-output grammar limit (request rejected at schema
// compilation, before generation). Verified 2026-08-11: the request path
// contains no duplicated schema/tool payload — the grammar size is real.
//
// Neither pass weakens the fully-typed-schema contract (the Aug 11 hollow-DSP
// fix) and no simulation field was dropped.
//
// Pass 2 consumes the COMPLETED subject model from pass 1 — a genuine
// architectural benefit of the split, but not its justification.

const traitSchema = {
  type: 'object',
  properties: {
    score: { type: 'integer' },
    label: { type: 'string' },
    evidence: { type: 'string' },
    indicators: { type: 'array', items: { type: 'string' } },
  },
  required: ['score', 'label', 'evidence', 'indicators'],
};

const subjectModelSchema = {
  type: 'object',
  properties: {
    executive_summary: { type: 'string' },
    classification: { type: 'string' },
    confidence_score: { type: 'integer' },
    confidence_justification: { type: 'string' },
    personality_matrix: {
      type: 'object',
      properties: {
        openness: traitSchema,
        conscientiousness: traitSchema,
        extraversion: traitSchema,
        agreeableness: traitSchema,
        neuroticism: traitSchema,
      },
      required: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'],
    },
    cognitive_architecture: {
      type: 'object',
      properties: {
        thinking_style: { type: 'string' },
        epistemic_requirements: { type: 'string' },
        defense_mechanisms: { type: 'string' },
        sub_sections: {
          type: 'array',
          items: {
            type: 'object',
            properties: { title: { type: 'string' }, content: { type: 'string' } },
            required: ['title', 'content'],
          },
        },
      },
      required: ['thinking_style', 'epistemic_requirements', 'defense_mechanisms', 'sub_sections'],
    },
    behavioral_patterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          description: { type: 'string' },
          context: { type: 'string' },
        },
        required: ['label', 'description', 'context'],
      },
    },
    motivations: { type: 'array', items: { type: 'string' } },
    fears: { type: 'array', items: { type: 'string' } },
    final_assessment: { type: 'string' },
  },
  required: ['executive_summary', 'classification', 'confidence_score', 'confidence_justification', 'personality_matrix', 'cognitive_architecture', 'behavioral_patterns', 'motivations', 'fears', 'final_assessment'],
};

const simulationSchema = {
  type: 'object',
  properties: {
    predictions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          trigger: { type: 'string' },
          context: { type: 'string' },
          observed_basis: { type: 'string' },
          architecture_mechanism: { type: 'string' },
          trajectory: { type: 'array', items: { type: 'string' } },
          branches: {
            type: 'array',
            items: {
              type: 'object',
              properties: { condition: { type: 'string' }, path: { type: 'string' } },
              required: ['condition', 'path'],
            },
          },
          accelerants: { type: 'string' },
          interrupters: { type: 'string' },
          least_certain: { type: 'string' },
          inference_class: { type: 'string', enum: ['pattern_recurrence', 'forward_inference'] },
          predicted_behavior: { type: 'string' },
          probability: { type: 'integer' },
          confidence_interval: {
            type: 'object',
            properties: { lower: { type: 'integer' }, upper: { type: 'integer' } },
            required: ['lower', 'upper'],
          },
          temporal_factors: { type: 'string' },
        },
        required: ['trigger', 'context', 'observed_basis', 'architecture_mechanism', 'trajectory', 'branches', 'accelerants', 'interrupters', 'least_certain', 'inference_class', 'predicted_behavior', 'probability', 'confidence_interval', 'temporal_factors'],
      },
    },
  },
  required: ['predictions'],
};

// Some models return a string; some wrap the object in a `response` key.
function normalize(raw) {
  const parsed = (typeof raw === 'string') ? JSON.parse(raw) : raw;
  return (parsed && parsed.response && typeof parsed.response === 'object') ? parsed.response : parsed;
}

async function invoke(prompt, schema) {
  const raw = await base44.integrations.Core.InvokeLLM({
    model: 'claude_sonnet_4_6',
    prompt,
    response_json_schema: schema,
  });
  return normalize(raw);
}

// ── PASS 1 — build the subject model ────────────────────────────────────────
async function runSubjectModelPass(subjectName, analysisContext) {
  const prompt = `Generate the SUBJECT MODEL portion of a Definitive Subject Profile (DSP) for "${subjectName}" based on the analysis data below. Return a JSON object with ALL these fields populated with substantive content.

ANALYSIS DATA:
${analysisContext}

REQUIRED OUTPUT FIELDS:
- executive_summary: 3-5 paragraph synthesis of core psychology
- classification: 5-10 word psychological type label
- confidence_score: integer 0-100
- confidence_justification: 2-3 sentences on confidence level
- personality_matrix: object with openness, conscientiousness, extraversion, agreeableness, neuroticism — each having score (int 0-100), label, evidence (2-3 sentences), indicators (array of 4-6 strings)
- cognitive_architecture: object with thinking_style, epistemic_requirements, defense_mechanisms (each 2-3 sentences), sub_sections (array of 4-6 objects with title and content)
- behavioral_patterns: array of 4-6 objects with label, description, context
- motivations: array of 5-7 strings
- fears: array of 4-6 strings
- final_assessment: 4-6 paragraph definitive portrait

This model will be used as the SIMULATION SUBSTRATE in a following pass, so make the cognitive architecture and behavioral patterns mechanistically explicit: describe the loops, not just the labels — what condition activates a pattern, what internal function it serves, and what resolves it.

Be thorough, specific, and analytical. Ground every claim in evidence. All scores must be integers 0-100.`;

  return invoke(prompt, subjectModelSchema);
}

// ── PASS 2 — run the completed subject model forward ────────────────────────
async function runSimulationPass(subjectName, analysisContext, model) {
  const modelBlock = JSON.stringify({
    classification: model.classification,
    executive_summary: model.executive_summary,
    personality_matrix: model.personality_matrix,
    cognitive_architecture: model.cognitive_architecture,
    behavioral_patterns: model.behavioral_patterns,
    motivations: model.motivations,
    fears: model.fears,
  });

  const prompt = `You have a COMPLETED cognitive model of "${subjectName}". Your task is to RUN THAT MODEL FORWARD — to simulate what this person does next in situations that have not happened yet.

COMPLETED SUBJECT MODEL (your simulation substrate — derive from THIS):
${modelBlock}

SUPPORTING EVIDENCE (for grounding only — do not merely re-describe it):
${analysisContext}

Produce "predictions": an array of 4-6 SUBJECT SIMULATIONS.

CRITICAL: a prediction is NOT a restatement of observed behavior — a known pattern alone is just history wearing a fake mustache. Use observed patterns as MECHANISMS, then run the subject model above forward against a future scenario to derive what happens NEXT. Each simulation must be traceable to specific structures in the model (named traits, scores, loops, defenses, drivers) rather than extrapolated straight from the raw evidence.

Each object:
- trigger: an anticipated FUTURE scenario or upcoming situation (novel/unobserved situations encouraged)
- context: situational factors shaping this scenario
- observed_basis: the known historical pattern(s) this simulation draws on (1-2 sentences; "" if extrapolating beyond observed data)
- architecture_mechanism: WHICH traits and loops from the model generate this forecast and WHY — cite specific trait scores and named mechanisms (2-3 sentences)
- trajectory: ordered array of 3-6 strings — the probable behavioral SEQUENCE over time (e.g., initial somatic/emotional reaction → internal evaluation → outward behavior → recalibration → resolution). The sequence is the product, not the probability.
- branches: array of 1-3 objects with condition (what pushes the subject off the primary path) and path (the alternative sequence)
- accelerants: what would speed up or intensify the primary trajectory (1-2 sentences)
- interrupters: what would break or de-escalate it (1-2 sentences)
- least_certain: where this simulation is weakest / least supported (1-2 sentences)
- inference_class: "pattern_recurrence" (stable observed mechanism expected to recur) or "forward_inference" (architecture extrapolated into unobserved territory)
- predicted_behavior: one-sentence headline of the trajectory's most likely outcome
- probability (int 0-100), confidence_interval ({lower, upper}), temporal_factors

This subject is predictable only within the modeled regions of their behavioral state-space. Say plainly in least_certain where a simulation leaves those regions.`;

  return invoke(prompt, simulationSchema);
}

// ── PUBLIC: one logical DSP operation, two structured-output calls ──────────
// Returns the complete DSP object. Nothing is persisted here — the caller
// saves the merged result once, so a partial run never overwrites a good DSP.
export async function generateDSP({ subject, analysisContext, onProgress }) {
  onProgress?.('Building subject model...', 25);
  const model = await runSubjectModelPass(subject.name, analysisContext);

  onProgress?.('Running architecture forward...', 60);
  const sims = await runSimulationPass(subject.name, analysisContext, model);

  return {
    document_id: `DSP-${subject.id?.slice(-6) || '000'}-CP-003-APL`,
    protocol_version: 'CP-003-O-D-APL v2.1',
    date_of_synthesis: new Date().toISOString().split('T')[0],
    confidence_score: model.confidence_score || 75,
    confidence_justification: model.confidence_justification || '',
    executive_summary: model.executive_summary || '',
    classification: model.classification || '',
    personality_matrix: model.personality_matrix || {},
    cognitive_architecture: model.cognitive_architecture || { thinking_style: '', epistemic_requirements: '', defense_mechanisms: '', sub_sections: [] },
    behavioral_patterns: model.behavioral_patterns || [],
    cognitive_map: {},
    action_response_matrix: sims.predictions || [],
    motivations: model.motivations || [],
    fears: model.fears || [],
    final_assessment: model.final_assessment || '',
  };
}