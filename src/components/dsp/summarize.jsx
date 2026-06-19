// Presentation-only helpers. These NEVER rewrite or invent content —
// they only derive a shorter *excerpt* of existing generated text for the
// collapsed summary view. The full original text is always rendered on expand.

/**
 * Returns the first 1–N sentences of `text`, capped at ~maxChars.
 * If the text is already short, returns it unchanged.
 * Returns '' for empty/missing input.
 */
export function firstSentences(text, { maxChars = 180, maxSentences = 2 } = {}) {
  if (!text || typeof text !== 'string') return '';
  const clean = text.trim();
  if (clean.length <= maxChars) return clean;

  // Split on sentence boundaries while keeping it simple/safe.
  const sentences = clean.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [clean];
  let out = '';
  let count = 0;
  for (const s of sentences) {
    if (count >= maxSentences) break;
    if ((out + s).length > maxChars && out.length > 0) break;
    out += s;
    count += 1;
  }
  out = out.trim();
  if (!out) out = clean.slice(0, maxChars).trim();
  // Add ellipsis only if we actually truncated.
  return out.length < clean.length ? `${out.replace(/[.,;:\s]+$/, '')}…` : out;
}

/** True when the summary excerpt differs from the full text (i.e. expansion adds value). */
export function isTruncated(full, summary) {
  if (!full) return false;
  return summary.replace(/…$/, '').trim().length < full.trim().length;
}