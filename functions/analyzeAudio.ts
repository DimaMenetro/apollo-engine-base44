import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const HUME_API_KEY = Deno.env.get("HUME_API_KEY");
const HUME_API_URL = "https://api.hume.ai/v0/batch/jobs";

// Helper function to poll for job completion
async function pollJob(jobId) {
  const jobUrl = `${HUME_API_URL}/${jobId}`;
  let status = 'IN_PROGRESS';
  let attempts = 0;
  const maxAttempts = 60; // Poll for up to 5 minutes

  while ((status === 'IN_PROGRESS' || status === 'QUEUED') && attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
    try {
      const res = await fetch(jobUrl, {
        method: 'GET',
        headers: { 'X-Hume-Api-Key': HUME_API_KEY },
      });
      if (!res.ok) {
        const errorBody = await res.text();
        console.error(`Polling failed with status ${res.status}:`, errorBody);
        // Continue polling on server errors, but fail on client errors
        if (res.status >= 400 && res.status < 500) {
           throw new Error(`Failed to get job status: ${errorBody}`);
        }
      } else {
        const data = await res.json();
        status = data.state.status;
      }
    } catch (e) {
      console.error('Error during polling:', e.message);
      // Don't exit loop on network error, just keep trying
    }
    attempts++;
  }

  if (status !== 'COMPLETED') {
    throw new Error(`Job ${jobId} did not complete. Final status: ${status}`);
  }
}


Deno.serve(async (req) => {
  // Handle CORS preflight request
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
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { file_url } = await req.json();
    if (!file_url) {
      return new Response(JSON.stringify({ error: 'file_url is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Start the job
    const startJobResponse = await fetch(HUME_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hume-Api-Key': HUME_API_KEY,
      },
      body: JSON.stringify({
        models: {
          prosody: {},
        },
        urls: [file_url],
      }),
    });

    if (!startJobResponse.ok) {
        const errorBody = await startJobResponse.text();
        console.error("Hume Job Start Failed:", errorBody);
        return new Response(JSON.stringify({ error: `Failed to start Hume job: ${errorBody}` }), {
            status: startJobResponse.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }
    
    const { job_id } = await startJobResponse.json();

    // Poll for job completion
    await pollJob(job_id);

    // Get predictions
    const predictionsResponse = await fetch(`${HUME_API_URL}/${job_id}/predictions`, {
      method: 'GET',
      headers: { 'X-Hume-Api-Key': HUME_API_KEY },
    });

    if (!predictionsResponse.ok) {
        const errorBody = await predictionsResponse.text();
        return new Response(JSON.stringify({ error: `Failed to get predictions: ${errorBody}` }), {
            status: predictionsResponse.status,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    const predictions = await predictionsResponse.json();

    return new Response(JSON.stringify(predictions), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (error) {
    console.error('Error in analyzeAudio function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});