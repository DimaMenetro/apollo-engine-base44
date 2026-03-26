import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const HUME_API_KEY    = Deno.env.get("HUME_API_KEY");
const ASSEMBLY_API_KEY = Deno.env.get("ASSEMBLYAI_API_KEY");
const HUME_API_URL    = "https://api.hume.ai/v0/batch/jobs";
const ASSEMBLY_API_URL = "https://api.assemblyai.com/v2";
const ASSEMBLY_API_URL_V3 = "https://api.assemblyai.com/v3";

// ── Hume: poll until job completes ─────────────────────────────────────────
async function pollHumeJob(jobId) {
  const jobUrl = `${HUME_API_URL}/${jobId}`;
  let status = 'IN_PROGRESS';
  let attempts = 0;

  while ((status === 'IN_PROGRESS' || status === 'QUEUED') && attempts < 60) {
    await new Promise(r => setTimeout(r, 5000));
    try {
      const res = await fetch(jobUrl, { headers: { 'X-Hume-Api-Key': HUME_API_KEY } });
      if (res.ok) {
        const data = await res.json();
        status = data.state.status;
      } else if (res.status >= 400 && res.status < 500) {
        throw new Error(`Hume polling client error: ${await res.text()}`);
      }
    } catch (e) {
      console.error('Hume poll error:', e.message);
    }
    attempts++;
  }

  if (status !== 'COMPLETED') throw new Error(`Hume job did not complete. Status: ${status}`);
}

// ── AssemblyAI: submit + poll until transcript is ready ────────────────────
async function transcribeWithAssembly(fileUrl) {
  // Submit using v3 API with correct speech_model field
  const submitRes = await fetch(`${ASSEMBLY_API_URL_V3}/transcript`, {
    method: 'POST',
    headers: { 'Authorization': ASSEMBLY_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ audio_url: fileUrl, speech_model: 'universal' }),
  });
  if (!submitRes.ok) throw new Error(`AssemblyAI submit failed: ${await submitRes.text()}`);
  const { id } = await submitRes.json();

  // Poll
  let status = 'processing';
  let result = null;
  let attempts = 0;
  while (status === 'processing' || status === 'queued') {
    if (attempts++ > 60) throw new Error('AssemblyAI transcript timed out');
    await new Promise(r => setTimeout(r, 5000));
    const pollRes = await fetch(`${ASSEMBLY_API_URL_V3}/transcript/${id}`, {
      headers: { 'Authorization': ASSEMBLY_API_KEY },
    });
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

    // ── Run Hume + AssemblyAI in parallel ──────────────────────────────────
    const [humeResult, transcript] = await Promise.allSettled([
      // Hume emotion/prosody
      (async () => {
        const startRes = await fetch(HUME_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Hume-Api-Key': HUME_API_KEY },
          body: JSON.stringify({ models: { prosody: {} }, urls: [file_url] }),
        });
        if (!startRes.ok) throw new Error(`Hume start failed: ${await startRes.text()}`);
        const { job_id } = await startRes.json();
        await pollHumeJob(job_id);
        const predRes = await fetch(`${HUME_API_URL}/${job_id}/predictions`, {
          headers: { 'X-Hume-Api-Key': HUME_API_KEY },
        });
        if (!predRes.ok) throw new Error(`Hume predictions failed: ${await predRes.text()}`);
        return predRes.json();
      })(),
      // AssemblyAI transcription
      transcribeWithAssembly(file_url),
    ]);

    const predictions = humeResult.status === 'fulfilled' ? humeResult.value : null;
    const transcriptText = transcript.status === 'fulfilled' ? transcript.value : null;

    if (humeResult.status === 'rejected') console.error('Hume failed:', humeResult.reason?.message);
    if (transcript.status === 'rejected')  console.error('AssemblyAI failed:', transcript.reason?.message);

    return Response.json({
      predictions,
      transcript: transcriptText,
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