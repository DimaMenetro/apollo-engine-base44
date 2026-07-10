import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

/**
 * enqueueDossierSynthesis — Queue entry point for dossier synthesis.
 *
 * SECURITY MODEL (per operator constraint #1):
 *   Ownership is enforced HERE, at enqueue time, while we still have the
 *   authenticated user. The worker (processDossierJobs) runs as service-role
 *   with no user context, so it CANNOT re-check ownership — it trusts that
 *   every job in the queue was created through this authenticated path.
 *   We stamp created_by_id onto the job as the durable ownership anchor.
 *
 * FLOW:
 *   1. Authenticate + validate subject exists + ownership guard.
 *   2. Validate both source reports (DSP + Esoteric) exist.
 *   3. Reuse an existing open job (idempotency) or create a new queued job.
 *   4. Mark Subject.dossier_status = 'queued'.
 *   5. Immediately kick the worker once (constraint #2) so the common case
 *      starts within seconds. The scheduled worker is the safety net, not
 *      the only execution path.
 *   6. Return fast.
 */

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

    // ── Ownership guard — enforced at enqueue, the authenticated boundary ──
    if (subject.created_by_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // ── Validate both sources exist before queuing ────────────────────────
    if (!subject.dsp?.executive_summary) {
      return Response.json({ error: 'DSP not yet generated. Generate the DSP before synthesizing.' }, { status: 400 });
    }
    if (!subject.esoteric_profile?.execution_status) {
      return Response.json({ error: 'Esoteric Profile not yet generated. Execute CP-012 before synthesizing.' }, { status: 400 });
    }

    // ── Idempotency: reuse an existing open (queued/running) job ──────────
    const openJobs = await base44.asServiceRole.entities.DossierJob.filter({
      subject_id,
      job_type: 'synthesize_dossier',
    });
    let job = (openJobs || []).find(j => j.status === 'queued' || j.status === 'running');

    if (!job) {
      job = await base44.asServiceRole.entities.DossierJob.create({
        subject_id,
        job_type: 'synthesize_dossier',
        status: 'queued',
        stage: 'identity', // first of nine sequential single-section Opus passes
        attempts: 0,
        max_attempts: 5,
        idempotency_key: `${subject_id}:synthesize_dossier`,
        // Ownership anchor — worker trusts this instead of re-checking RLS.
        created_by_id: subject.created_by_id,
      });
    }

    // ── Reflect queued state on the Subject for the polling UI ────────────
    await base44.asServiceRole.entities.Subject.update(subject_id, {
      dossier_status: 'queued',
      dossier_error: '',
    });

    // ── Immediate worker kick (constraint #2) — fire-and-forget is fine
    // here because the durable job record survives even if this invoke is
    // torn down; the scheduled worker will pick it up regardless. ─────────
    try {
      base44.functions.invoke('processDossierJobs', { job_id: job.id }, { headers: { 'X-Worker-Secret': Deno.env.get('WORKER_SECRET') || '' } });
    } catch (_) {
      // Non-fatal: the scheduled safety-net worker will process it.
    }

    return Response.json({ queued: true, job_id: job.id });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});