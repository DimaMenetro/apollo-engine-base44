import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const IMENTIV_API_KEY  = Deno.env.get("IMENTIV_API_KEY");
const ASSEMBLY_API_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");
const IMENTIV_API_URL  = "https://api.imentiv.ai";
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2";

// Imentiv requires X-API-Key + a non-empty Referer on every request (per OpenAPI spec).
const IMENTIV_HEADERS = {
  "X-API-Key": IMENTIV_API_KEY,
  "Referer": "https://apollo.base44.app/",
};

// ── Media type detection by file extension ────────────────────────────────
const VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "webm", "mpeg", "mpg", "m4v"];
const AUDIO_EXTENSIONS = ["wav", "mp3", "m4a", "ogg", "oga", "flac", "aac", "wma"];

function detectMediaKind(fileUrl) {
  const clean = (fileUrl || "").split("?")[0].split("#")[0];
  const ext = clean.split(".").pop()?.toLowerCase() || "";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (AUDIO_EXTENSIONS.includes(ext)) return "audio";
  return "audio";
}

// ── Imentiv: submit media by URL, poll insight endpoint until complete ─────
// kind = "audio" | "video". Returns the raw insight object from Imentiv.
async function analyzeWithImentiv(fileUrl, kind) {
  const submitPath = kind === "video" ? "/v2/videos" : "/v2/audios";
  const collection = kind === "video" ? "videos" : "audios";

  // ── Submit ────────────────────────────────────────────────────────────
  // Imentiv accepts a publicly accessible media URL as a multipart form field.
  // 'title' is a required field on the submit form.
  const form = new FormData();
  form.append("media_url", fileUrl);
  form.append("title", `Apollo ${kind} analysis ${Date.now()}`);
  form.append("description", `Apollo Profiling Engine ${kind} emotion analysis`);

  const submitRes = await fetch(`${IMENTIV_API_URL}${submitPath}`, {
    method: "POST",
    headers: IMENTIV_HEADERS,
    body: form,
  });
  if (!submitRes.ok) {
    throw new Error(`Imentiv ${kind} submit failed (${submitRes.status}): ${await submitRes.text()}`);
  }
  const submitData = await submitRes.json();
  console.log(`Imentiv ${kind} submit response:`, JSON.stringify(submitData, null, 2));

  const resourceId =
    submitData?.id ||
    submitData?.[kind === "video" ? "video_id" : "audio_id"] ||
    submitData?.data?.id ||
    submitData?.result?.id;

  if (!resourceId) {
    throw new Error(`Imentiv ${kind} submit returned no id. Raw: ${JSON.stringify(submitData)}`);
  }

  // ── Poll ──────────────────────────────────────────────────────────────
  let attempts = 0;
  while (attempts++ < 60) {
    await new Promise((r) => setTimeout(r, 5000));

    const pollRes = await fetch(`${IMENTIV_API_URL}/v1/${collection}/${resourceId}`, {
      headers: IMENTIV_HEADERS,
    });
    if (!pollRes.ok) {
      if (pollRes.status >= 400 && pollRes.status < 500) {
        throw new Error(`Imentiv ${kind} poll client error (${pollRes.status}): ${await pollRes.text()}`);
      }
      console.error(`Imentiv ${kind} poll transient error (${pollRes.status}), retrying`);
      continue;
    }

    const data = await pollRes.json();
    const status = (
      data?.status ||
      data?.state ||
      data?.processing_status ||
      data?.data?.status ||
      ""
    ).toString().toLowerCase();

    if (["completed", "complete", "success", "succeeded", "done", "finished", "processed"].includes(status)) {
      return data;
    }
    if (["failed", "error", "errored"].includes(status)) {
      throw new Error(`Imentiv ${kind} processing failed. Status: ${status}. Raw: ${JSON.stringify(data)}`);
    }
    // No recognizable status but insights already present → accept
    if (!status && (data?.emotions || data?.insights || data?.speakers || data?.analytics)) {
      return data;
    }
  }

  throw new Error(`Imentiv ${kind} analysis timed out after 60 attempts`);
}

// ── AssemblyAI: submit + poll until transcript is ready (UNCHANGED) ─────────
async function transcribeWithAssembly(fileUrl) {
  const submitRes = await fetch(`${ASSEMBLY_API_URL}/transcript`, {
    method: 'POST',
    headers: { 'Authorization': ASSEMBLY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_url: fileUrl, speech_models: ['universal-3-pro'] }),
  });
  if (!submitRes.ok) throw new Error(`AssemblyAI submit failed: ${await submitRes.text()}`);
  const { id } = await submitRes.json();

  let status = 'processing';
  let result = null;
  let attempts = 0;
  while (status === 'processing' || status === 'queued') {
    if (attempts++ > 60) throw new Error('AssemblyAI transcript timed out');
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`${ASSEMBLY_API_URL}/transcript/${id}`, {
      headers: { 'Authorization': ASSEMBLY_API_KEY },
    });
    if (!pollRes.ok) throw new Error(`AssemblyAI poll failed: ${await pollRes.text()}`);
    result = await pollRes.json();
    status = result.status;
  }

  if (status === 'error') throw new Error(`AssemblyAI error: ${result.error}`);
  return result.text || '';
}

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400 });

    const kind = detectMediaKind(file_url);
    console.log(`analyzeAudio: processing ${kind} — ${file_url}`);

    // ── Imentiv (emotion/prosody) + AssemblyAI (transcription) in parallel ──
    const [imentivResult, transcript] = await Promise.allSettled([
      analyzeWithImentiv(file_url, kind),
      transcribeWithAssembly(file_url),
    ]);

    const predictions    = imentivResult.status === 'fulfilled' ? imentivResult.value : null;
    const transcriptText = transcript.status === 'fulfilled' ? transcript.value : null;

    if (imentivResult.status === 'rejected') {
      console.error('Imentiv failed:', imentivResult.reason?.message);
      throw new Error(`Imentiv emotional analysis failed: ${imentivResult.reason?.message}`);
    }
    if (transcript.status === 'rejected') {
      console.error('AssemblyAI failed:', transcript.reason?.message);
      throw new Error(`AssemblyAI transcription failed: ${transcript.reason?.message}`);
    }

    console.log('Imentiv result:', JSON.stringify(predictions, null, 2));
    console.log('AssemblyAI transcript:', transcriptText);

    if (!predictions && !transcriptText) {
      throw new Error('Both Imentiv and AssemblyAI failed to process the file');
    }

    return Response.json({
      predictions,
      transcript: transcriptText,
      media_kind: kind,
    }, {
      status: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('analyzeAudio error:', error);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
});