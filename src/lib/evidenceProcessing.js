import { base44 } from '@/api/base44Client';
import { validateFileUrl } from '@/lib/validateFileUrl';

// ─── APOLLO EVIDENCE PROCESSING ───────────────────────────────────────────────
// Replaces the March-era hard cap `fileUrls.slice(0, 3)` in Processing.jsx,
// which silently and POSITIONALLY excluded every source after the third.
//
// Invariant enforced here: every admissible source assigned to a module ends in
// exactly ONE auditable disposition — processed | failed | unsupported | skipped
// (with an explicit technical reason). No silent truncation. No positional
// exclusion. Source ORDER is preserved for auditability but never determines
// INCLUSION.
//
// Batch boundaries are an implementation detail, never an epistemic boundary:
// a 2-source subject and a 22-source subject traverse the same logical analysis
// (evidence → bounded batches → per-batch analysis → module-wide synthesis →
// ONE canonical module result). Downstream DSP consumers never see batching.
//
// ── VERIFIED CONSTRAINTS (measured 2026-08-11 against real subject files) ────
// There is NO three-file provider limit; the old cap had no technical basis.
//   4 PDFs   → accepted, all 4 genuinely read, 14s
//   8 PDFs   → accepted, all 8 genuinely read, 19s
//   5 images → accepted, all 5 genuinely read,  8s
//  12 images → accepted, all 12 genuinely read, 31s
// Latency scales with attachment count, and the real analytical prompts emit far
// more output than those probes did. The live corpus already contains subjects
// with 22 analog and 183 behavioral sources, so unbounded single-invocation
// submission is NOT safe. Batch sizes below sit under the verified ceilings with
// deliberate headroom for full-length analytical output.

const DOC_BATCH_SIZE   = 6;      // verified safe at 8; headroom for long output
const IMAGE_BATCH_SIZE = 8;      // verified safe at 12; headroom for long output
const TEXT_BATCH_CHARS = 60000;  // preprocessed transcript/CSV payload per batch

const DOC_EXTS   = ['csv', 'pdf', 'txt', 'md'];
const IMAGE_EXTS = ['png', 'jpg', 'jpeg'];
const MEDIA_EXTS = ['m4a', 'mp3', 'wav', 'mp4', 'mov'];

const fileNameOf = (url) => url.split('/').pop();
const extOf = (url) => fileNameOf(url).toLowerCase().split('.').pop();

function classify(url) {
  const ext = extOf(url);
  if (ext === 'xlsx') return 'spreadsheet';
  if (MEDIA_EXTS.includes(ext)) return 'media';
  if (DOC_EXTS.includes(ext)) return 'document';
  if (IMAGE_EXTS.includes(ext)) return 'image';
  return 'unsupported';
}

// Deterministic source-set fingerprint (FNV-1a) so Apollo can distinguish
// "this module represents the CURRENT corpus" from "preserved older result".
export function fingerprintSources(urls) {
  const canonical = [...urls].sort().join('|');
  let h = 0x811c9dc5;
  for (let i = 0; i < canonical.length; i++) {
    h ^= canonical.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fnv1a-${h.toString(16).padStart(8, '0')}-${urls.length}`;
}

const BATCH_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    key_patterns: { type: 'array', items: { type: 'string' } },
    indicators: { type: 'array', items: { type: 'string' } },
    confidence: { type: 'number' },
    flags: { type: 'array', items: { type: 'string' } },
    processing_notes: { type: 'string' },
  },
  required: ['summary', 'key_patterns', 'indicators', 'confidence', 'flags', 'processing_notes'],
};

// ── Stage 1 — per-source preprocessing, per-source resilience ────────────────
// Media and XLSX are converted to text payloads one file at a time. A single
// source failing is recorded as `failed` and NEVER aborts the module.
async function preprocessSources(urls) {
  const dispositions = [];   // one entry per source, input order preserved
  const directDocs = [];
  const directImages = [];
  const textPayloads = [];

  for (const url of urls) {
    const name = fileNameOf(url);
    const kind = classify(url);

    if (kind === 'document') { directDocs.push(url); dispositions.push({ source: name, kind, disposition: 'processed', detail: 'submitted directly to analysis' }); continue; }
    if (kind === 'image')    { directImages.push(url); dispositions.push({ source: name, kind, disposition: 'processed', detail: 'submitted directly to analysis' }); continue; }

    if (kind === 'unsupported') {
      dispositions.push({ source: name, kind, disposition: 'unsupported', detail: `format .${extOf(url)} is not supported by any Apollo analysis path` });
      continue;
    }

    if (kind === 'spreadsheet') {
      try {
        validateFileUrl(url); // SSRF guard: trusted https storage hosts only
        const csvData = await base44.integrations.Core.InvokeLLM({
          prompt: 'Convert this XLSX file to CSV format. Extract the first sheet. Return ONLY the CSV data with comma-separated values, no explanation.',
          file_urls: [url],
        });
        textPayloads.push({ source: name, label: `Behavioral data from ${name} (converted from XLSX)`, body: String(csvData) });
        dispositions.push({ source: name, kind, disposition: 'processed', detail: 'XLSX converted to CSV' });
      } catch (error) {
        // Previously this THREW and destroyed the entire module. Now recorded
        // and skipped, per the auditable-disposition invariant.
        dispositions.push({ source: name, kind, disposition: 'failed', detail: `XLSX conversion failed: ${error.message}` });
      }
      continue;
    }

    // media — preserves the July per-file resilience fix and Imentiv+AssemblyAI dual processing
    try {
      const acoustic = await base44.functions.invoke('analyzeAudio', { file_url: url });
      const emotionData = acoustic.data?.predictions ?? acoustic.data;
      const transcript = acoustic.data?.transcript || null;
      const mediaType = ['mp4', 'mov'].includes(extOf(url)) ? 'Video' : 'Audio';
      textPayloads.push({
        source: name,
        label: `${mediaType} analysis for ${name}`,
        body: `Emotion Data: ${JSON.stringify(emotionData)}\n${transcript ? `Verbatim Transcript: ${transcript}` : 'Transcript: unavailable'}`,
      });
      dispositions.push({
        source: name, kind, disposition: 'processed',
        detail: transcript
          ? 'emotion analyzed via Imentiv + transcript generated via AssemblyAI'
          : 'emotion analyzed via Imentiv, transcript unavailable',
      });
    } catch (error) {
      dispositions.push({ source: name, kind, disposition: 'failed', detail: `media processing failed: ${error.message}` });
    }
  }

  return { dispositions, directDocs, directImages, textPayloads };
}

// ── Stage 2 — bounded batch planning ────────────────────────────────────────
function planBatches({ directDocs, directImages, textPayloads }) {
  const batches = [];
  const chunk = (arr, size) => {
    const out = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
  };

  for (const group of chunk(directDocs, DOC_BATCH_SIZE)) {
    batches.push({ fileUrls: group, textPayloads: [], sources: group.map(fileNameOf) });
  }
  for (const group of chunk(directImages, IMAGE_BATCH_SIZE)) {
    batches.push({ fileUrls: group, textPayloads: [], sources: group.map(fileNameOf) });
  }

  let current = [];
  let currentChars = 0;
  for (const payload of textPayloads) {
    const size = payload.body.length;
    if (current.length > 0 && currentChars + size > TEXT_BATCH_CHARS) {
      batches.push({ fileUrls: [], textPayloads: current, sources: current.map(p => p.source) });
      current = []; currentChars = 0;
    }
    current.push(payload);
    currentChars += size;
  }
  if (current.length > 0) {
    batches.push({ fileUrls: [], textPayloads: current, sources: current.map(p => p.source) });
  }

  return batches;
}

// ── Stage 3 — per-batch analysis ────────────────────────────────────────────
// CRITICAL: the module's analytical instruction is ALWAYS sent. The old code did
// `preprocessedData.prompt || prompt`, which silently DISCARDED the module's
// instruction whenever media/XLSX preprocessing produced an enhanced prompt —
// so media-bearing modules were never actually told what to analyze.
async function analyzeBatch({ instruction, batch, index, total }) {
  const scope = total > 1
    ? `\n\nThis is evidence batch ${index + 1} of ${total} for this module. Analyze ONLY the evidence provided here; a later synthesis pass will integrate all batches. Do not speculate about evidence you cannot see.`
    : '';

  const manifest = `\n\nSOURCES IN THIS BATCH (${batch.sources.length}): ${batch.sources.join(', ')}`;

  const payload = batch.textPayloads.length > 0
    ? '\n\nPREPROCESSED EVIDENCE:' + batch.textPayloads.map(p => `\n\n${p.label}:\n${p.body}`).join('')
    : '';

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `${instruction}${scope}${manifest}${payload}`,
    file_urls: batch.fileUrls,
    response_json_schema: BATCH_SCHEMA,
  });

  return (typeof response === 'string') ? JSON.parse(response) : response;
}

// ── Stage 4 — module-wide synthesis (reduction) ──────────────────────────────
// A genuine evidence-wide synthesis, NOT a concatenation of batch summaries.
// Contradictions between batches are preserved, never averaged away.
async function reduceBatches({ instruction, batchResults, dispositions }) {
  const failed = dispositions.filter(d => d.disposition !== 'processed');

  const prompt = `You are performing the FINAL module-wide synthesis for an Apollo analysis module.

The module's analytical task was:
${instruction}

The complete evidence corpus for this module could not fit in one invocation, so it was analyzed in ${batchResults.length} bounded batches. Below is every batch result with the sources it covered.

BATCH RESULTS:
${batchResults.map((b, i) => `\n--- Batch ${i + 1} (sources: ${b.sources.join(', ')}) ---\n${JSON.stringify(b.result)}`).join('\n')}

${failed.length > 0 ? `SOURCES NOT SUCCESSFULLY ANALYZED (must be acknowledged as gaps, not ignored):\n${failed.map(f => `- ${f.source}: ${f.disposition} — ${f.detail}`).join('\n')}` : 'All sources were successfully analyzed.'}

Produce ONE canonical module result representing the ENTIRE evidence corpus. Requirements:
- Synthesize across batches — do NOT concatenate or restate the batch summaries in sequence.
- Where batches AGREE, state the pattern as corpus-wide and note that it replicates across independent sources.
- Where batches CONTRADICT each other, PRESERVE the contradiction explicitly and say which sources support each side. Never average or smooth conflicting findings into a false middle.
- Batch boundaries are a technical artifact. Never refer to "batches" in your output; speak about the evidence and its sources.
- confidence must reflect the whole corpus, including coverage gaps from any failed sources.
- In processing_notes, state how many sources informed this synthesis and explicitly name any that did not.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    response_json_schema: BATCH_SCHEMA,
  });

  return (typeof response === 'string') ? JSON.parse(response) : response;
}

// ── PUBLIC: analyze a module's COMPLETE evidence corpus ─────────────────────
// Returns { result, coverage }. Throws only if NOTHING could be analyzed, so the
// caller can preserve the module's previous valid result.
export async function analyzeModuleEvidence({ instruction, fileUrls, onStage }) {
  const { dispositions, directDocs, directImages, textPayloads } = await preprocessSources(fileUrls);

  const batches = planBatches({ directDocs, directImages, textPayloads });
  const batchResults = [];
  const batchFailures = [];

  for (let i = 0; i < batches.length; i++) {
    onStage?.(batches.length > 1 ? `evidence ${i + 1}/${batches.length}` : 'analyzing evidence');
    try {
      const result = await analyzeBatch({ instruction, batch: batches[i], index: i, total: batches.length });
      batchResults.push({ sources: batches[i].sources, result });
    } catch (error) {
      batchFailures.push({ sources: batches[i].sources, message: error.message });
      // Mark every source in the failed batch as failed — never silently absent.
      for (const src of batches[i].sources) {
        const d = dispositions.find(x => x.source === src);
        if (d) { d.disposition = 'failed'; d.detail = `analysis failed: ${error.message}`; }
      }
    }
  }

  if (batchResults.length === 0) {
    throw new Error(
      batchFailures[0]?.message ||
      (fileUrls.length === 0 ? 'No evidence assigned to this module' : 'No evidence could be analyzed')
    );
  }

  let merged;
  if (batchResults.length === 1) {
    merged = batchResults[0].result;
  } else {
    onStage?.('synthesizing evidence');
    merged = await reduceBatches({ instruction, batchResults, dispositions });
  }

  const processed   = dispositions.filter(d => d.disposition === 'processed');
  const failed      = dispositions.filter(d => d.disposition === 'failed');
  const unsupported = dispositions.filter(d => d.disposition === 'unsupported' || d.disposition === 'skipped');

  const coverage = {
    total_sources: dispositions.length,
    processed_count: processed.length,
    failed_count: failed.length,
    unsupported_count: unsupported.length,
    batches_run: batches.length,
    batches_succeeded: batchResults.length,
    source_dispositions: dispositions,
    source_set_fingerprint: fingerprintSources(fileUrls),
    evidence_assessed_at: new Date().toISOString(),
  };

  return {
    result: {
      ...merged,
      preprocessing_info: dispositions
        .map(d => `${d.source}: ${d.disposition.toUpperCase()} — ${d.detail}`)
        .join(' | '),
      evidence_coverage: coverage,
    },
    coverage,
  };
}

// Human-readable coverage line for the operator, e.g. "4/5 processed · 1 failed".
export function coverageLabel(coverage) {
  if (!coverage) return null;
  const parts = [`${coverage.processed_count}/${coverage.total_sources} sources processed`];
  if (coverage.failed_count > 0) parts.push(`${coverage.failed_count} failed`);
  if (coverage.unsupported_count > 0) parts.push(`${coverage.unsupported_count} unsupported`);
  return parts.join(' · ');
}