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

// ── CORS: allow only trusted origins (no wildcard on authenticated fn) ──────
const ALLOWED_ORIGINS = [
  "https://apollo.base44.app",
  "https://app.base44.com",
  "https://base44.app",
];

function corsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  // Reflect ONLY explicitly allowlisted origins — never a wildcard-matched
  // subdomain, since this endpoint returns authenticated user data.
  const allowed = ALLOWED_ORIGINS.includes(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGINS[0],
    "Vary": "Origin",
  };
}

// ── SSRF guard: only allow https URLs on Base44 storage, no private hosts ───
function isPrivateHost(host) {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;
  // IPv4 literal ranges (private, loopback, link-local, unspecified)
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1]), parseInt(m[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;          // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true;          // 192.168.0.0/16
  }
  // IPv6 loopback / link-local / unique-local literals
  if (h === "::1" || h.startsWith("[::1") || h.startsWith("[fe80") || h.startsWith("[fc") || h.startsWith("[fd")) return true;
  return false;
}

function validateFileUrl(fileUrl) {
  let u;
  try {
    u = new URL(fileUrl);
  } catch {
    throw new Error("Invalid file_url");
  }
  if (u.protocol !== "https:") throw new Error("file_url must use https");
  if (isPrivateHost(u.hostname)) throw new Error("file_url host is not permitted");
  const host = u.hostname.toLowerCase();
  const allowed = /(^|\.)base44\.(app|com)$/.test(host)
    || /(^|\.)googleapis\.com$/.test(host)
    || /(^|\.)storage\.googleapis\.com$/.test(host);
  if (!allowed) throw new Error("file_url host is not an allowed storage domain");
}

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
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...cors,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401, headers: cors });

    const { file_url } = await req.json();
    if (!file_url) return Response.json({ error: 'file_url is required' }, { status: 400, headers: cors });

    // ── SSRF guard: reject internal / non-storage URLs before any fetch ──
    try {
      validateFileUrl(file_url);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400, headers: cors });
    }

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
      headers: cors,
    });

  } catch (error) {
    console.error('analyzeAudio error:', error);
    return Response.json({ error: error.message }, {
      status: 500,
      headers: cors,
    });
  }
});