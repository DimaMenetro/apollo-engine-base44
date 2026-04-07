import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@4.0.0';

// ── COLOR THEMES ─────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: [9, 9, 15],
    cardBg: [18, 20, 30],
    text: [203, 213, 225],
    title: [241, 245, 249],
    muted: [71, 85, 105],
    accent: [245, 158, 11],
    violet: [139, 92, 246],
    green: [16, 185, 129],
    rose: [244, 63, 94],
    cyan: [6, 182, 212],
    border: [30, 35, 50],
    barTrack: [30, 35, 50],
  },
  light: {
    bg: [248, 248, 252],
    cardBg: [255, 255, 255],
    text: [60, 60, 67],
    title: [28, 28, 30],
    muted: [142, 142, 147],
    accent: [217, 119, 6],
    violet: [124, 58, 237],
    green: [5, 150, 105],
    rose: [225, 29, 72],
    cyan: [8, 145, 178],
    border: [220, 220, 230],
    barTrack: [230, 230, 238],
  },
};

// ── HELPERS ───────────────────────────────────────────────────────────────────
function rgb(c) { return c; }

function drawPageBg(doc, theme) {
  const [w, h] = [doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight()];
  doc.setFillColor(...rgb(theme.bg));
  doc.rect(0, 0, w, h, 'F');
}

function ensureSpace(doc, needed, theme, margin) {
  const pageH = doc.internal.pageSize.getHeight();
  if (margin.y + needed > pageH - 20) {
    doc.addPage();
    drawPageBg(doc, theme);
    margin.y = 20;
  }
}

function drawCard(doc, theme, x, y, w, h) {
  doc.setFillColor(...rgb(theme.cardBg));
  doc.roundedRect(x, y, w, h, 4, 4, 'F');
  doc.setDrawColor(...rgb(theme.border));
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 4, 4, 'S');
}

function drawBar(doc, theme, x, y, w, score, color) {
  const h = 3;
  doc.setFillColor(...rgb(theme.barTrack));
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F');
  const fillW = Math.max(2, (score / 100) * w);
  doc.setFillColor(...rgb(color));
  doc.roundedRect(x, y, fillW, h, 1.5, 1.5, 'F');
}

function drawConfidenceArc(doc, theme, cx, cy, radius, score) {
  // Draw background circle
  doc.setDrawColor(...rgb(theme.border));
  doc.setLineWidth(2);
  doc.circle(cx, cy, radius, 'S');
  // Draw score arc using small line segments
  const color = score >= 80 ? theme.green : score >= 60 ? theme.accent : theme.rose;
  doc.setDrawColor(...rgb(color));
  doc.setLineWidth(2.5);
  const startAngle = -Math.PI / 2;
  const endAngle = startAngle + (2 * Math.PI * score / 100);
  const steps = Math.max(20, Math.floor(score / 2));
  for (let i = 0; i < steps; i++) {
    const a1 = startAngle + (endAngle - startAngle) * (i / steps);
    const a2 = startAngle + (endAngle - startAngle) * ((i + 1) / steps);
    doc.line(
      cx + radius * Math.cos(a1), cy + radius * Math.sin(a1),
      cx + radius * Math.cos(a2), cy + radius * Math.sin(a2)
    );
  }
  // Score text
  doc.setFontSize(16);
  doc.setTextColor(...rgb(color));
  doc.text(`${score}%`, cx, cy + 2, { align: 'center' });
}

function sectionHeader(doc, theme, margin, icon, title, color) {
  ensureSpace(doc, 14, theme, margin);
  doc.setFontSize(8);
  doc.setTextColor(...rgb(color || theme.accent));
  doc.text(icon, margin.left, margin.y);
  doc.text(title.toUpperCase(), margin.left + 6, margin.y);
  margin.y += 8;
}

function wrappedText(doc, theme, margin, text, opts = {}) {
  const maxW = opts.maxW || 170;
  const fontSize = opts.fontSize || 9;
  const color = opts.color || theme.text;
  doc.setFontSize(fontSize);
  doc.setTextColor(...rgb(color));
  const lines = doc.splitTextToSize(text || '', maxW);
  for (const line of lines) {
    ensureSpace(doc, 5, theme, margin);
    doc.text(line, opts.x || margin.left, margin.y);
    margin.y += fontSize * 0.45;
  }
  margin.y += 2;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject_id, mode, color_theme } = await req.json();
    // mode: 'dsp' | 'esoteric' | 'merged'
    // color_theme: 'dark' | 'light'
    if (!subject_id) return Response.json({ error: 'subject_id required' }, { status: 400 });

    const subjects = await base44.asServiceRole.entities.Subject.filter({ id: subject_id });
    const subject = subjects?.[0];
    if (!subject) return Response.json({ error: 'Subject not found' }, { status: 404 });

    const theme = THEMES[color_theme] || THEMES.dark;
    const dsp = subject.dsp || {};
    const esp = subject.esoteric_profile || null;
    const exportMode = mode || 'dsp';

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = { left: 20, y: 20 };
    const contentW = pageW - 40;

    drawPageBg(doc, theme);

    // ══════════════════════════════════════════════════════════════════════════
    // COVER PAGE
    // ══════════════════════════════════════════════════════════════════════════
    margin.y = 50;

    // Title
    doc.setFontSize(10);
    doc.setTextColor(...rgb(theme.muted));
    doc.text('APOLLO PROFILING ENGINE', pageW / 2, margin.y, { align: 'center' });
    margin.y += 12;

    doc.setFontSize(24);
    doc.setTextColor(...rgb(theme.title));
    const docTitle = exportMode === 'esoteric' ? 'Esoteric Intelligence Profile'
      : exportMode === 'merged' ? 'Unified Subject Dossier'
      : 'Definitive Subject Profile';
    doc.text(docTitle, pageW / 2, margin.y, { align: 'center' });
    margin.y += 10;

    // Subject name
    doc.setFontSize(18);
    doc.setTextColor(...rgb(theme.accent));
    doc.text(subject.name || 'Unknown', pageW / 2, margin.y, { align: 'center' });
    margin.y += 16;

    // Metadata block
    const metaLines = [];
    if (dsp.document_id) metaLines.push(['DOCUMENT ID', dsp.document_id]);
    metaLines.push(['PROTOCOL', dsp.protocol_version || 'CP-003-O-D-APL v2.1']);
    metaLines.push(['DATE', dsp.date_of_synthesis || new Date().toISOString().split('T')[0]]);
    if (exportMode !== 'dsp' && esp) metaLines.push(['ESOTERIC', 'CP-012-O-D-ESP']);

    for (const [label, val] of metaLines) {
      doc.setFontSize(7);
      doc.setTextColor(...rgb(theme.muted));
      doc.text(label, pageW / 2 - 30, margin.y);
      doc.setFontSize(9);
      doc.setTextColor(...rgb(theme.text));
      doc.text(val, pageW / 2 + 5, margin.y);
      margin.y += 6;
    }
    margin.y += 8;

    // Confidence arc (if DSP)
    if (exportMode !== 'esoteric' && dsp.confidence_score) {
      drawConfidenceArc(doc, theme, pageW / 2, margin.y + 18, 16, dsp.confidence_score);
      margin.y += 42;
      if (dsp.confidence_justification) {
        doc.setFontSize(7);
        doc.setTextColor(...rgb(theme.muted));
        const justLines = doc.splitTextToSize(dsp.confidence_justification, 120);
        for (const l of justLines) {
          doc.text(l, pageW / 2, margin.y, { align: 'center' });
          margin.y += 3.5;
        }
      }
      margin.y += 6;
    }

    // Classification
    if (exportMode !== 'esoteric' && dsp.classification) {
      doc.setFontSize(7);
      doc.setTextColor(...rgb(theme.muted));
      doc.text('CLASSIFICATION', pageW / 2, margin.y, { align: 'center' });
      margin.y += 6;
      doc.setFontSize(14);
      doc.setTextColor(...rgb(theme.accent));
      doc.text(dsp.classification, pageW / 2, margin.y, { align: 'center' });
      margin.y += 12;
    }

    // Divider
    doc.setDrawColor(...rgb(theme.border));
    doc.setLineWidth(0.3);
    doc.line(pageW / 2 - 30, margin.y, pageW / 2 + 30, margin.y);
    margin.y += 8;

    doc.setFontSize(7);
    doc.setTextColor(...rgb(theme.muted));
    const modeLabel = exportMode === 'merged' ? 'UNIFIED DOSSIER — DSP + CP-012 ESOTERIC'
      : exportMode === 'esoteric' ? 'CP-012-O-D-ESP ESOTERIC INTELLIGENCE'
      : 'DEFINITIVE SUBJECT PROFILE';
    doc.text(modeLabel, pageW / 2, margin.y, { align: 'center' });

    // ══════════════════════════════════════════════════════════════════════════
    // DSP CONTENT
    // ══════════════════════════════════════════════════════════════════════════
    if (exportMode !== 'esoteric') {
      doc.addPage();
      drawPageBg(doc, theme);
      margin.y = 20;

      // Executive Summary
      sectionHeader(doc, theme, margin, '■', 'EXECUTIVE SUMMARY', theme.accent);
      wrappedText(doc, theme, margin, dsp.executive_summary || 'No summary available.');
      margin.y += 4;

      // Personality Matrix
      sectionHeader(doc, theme, margin, '◆', 'PERSONALITY MATRIX', theme.violet);
      const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
      const traitLabels = { openness: 'Openness', conscientiousness: 'Conscientiousness', extraversion: 'Extraversion', agreeableness: 'Agreeableness', neuroticism: 'Neuroticism' };
      for (const trait of traits) {
        const data = dsp.personality_matrix?.[trait] || {};
        const score = data.score || 50;
        const barColor = score >= 70 ? theme.green : score >= 40 ? theme.accent : theme.rose;

        ensureSpace(doc, 22, theme, margin);
        // Trait name + score
        doc.setFontSize(10);
        doc.setTextColor(...rgb(theme.title));
        doc.text(traitLabels[trait], margin.left, margin.y);
        doc.setTextColor(...rgb(theme.muted));
        doc.text(`${score}%`, margin.left + contentW, margin.y, { align: 'right' });
        margin.y += 4;
        // Bar
        drawBar(doc, theme, margin.left, margin.y, contentW, score, barColor);
        margin.y += 5;
        // Evidence
        if (data.evidence) {
          doc.setFontSize(7);
          doc.setTextColor(...rgb(theme.muted));
          const evLines = doc.splitTextToSize(`"${data.evidence}"`, contentW);
          for (const l of evLines) {
            doc.text(l, margin.left, margin.y);
            margin.y += 3;
          }
        }
        // Indicators
        if (data.indicators?.length > 0) {
          doc.setFontSize(7);
          doc.setTextColor(...rgb(theme.muted));
          for (const ind of data.indicators) {
            ensureSpace(doc, 4, theme, margin);
            doc.text(`• ${ind}`, margin.left + 2, margin.y);
            margin.y += 3.5;
          }
        }
        margin.y += 3;
      }

      // Cognitive Architecture
      sectionHeader(doc, theme, margin, '◆', 'COGNITIVE ARCHITECTURE', theme.violet);
      const cogArch = dsp.cognitive_architecture || {};
      const cogFields = [
        ['THINKING STYLE', cogArch.thinking_style],
        ['EPISTEMIC REQUIREMENTS', cogArch.epistemic_requirements],
        ['DEFENSE MECHANISMS', cogArch.defense_mechanisms],
      ];
      for (const [label, val] of cogFields) {
        if (!val) continue;
        ensureSpace(doc, 10, theme, margin);
        doc.setFontSize(7);
        doc.setTextColor(...rgb(theme.muted));
        doc.text(label, margin.left, margin.y);
        margin.y += 4;
        wrappedText(doc, theme, margin, val);
      }
      if (cogArch.sub_sections?.length > 0) {
        for (const sub of cogArch.sub_sections) {
          ensureSpace(doc, 10, theme, margin);
          doc.setFontSize(7);
          doc.setTextColor(...rgb(theme.muted));
          doc.text((sub.title || '').toUpperCase(), margin.left, margin.y);
          margin.y += 4;
          wrappedText(doc, theme, margin, sub.content);
        }
      }

      // Behavioral Patterns
      if (dsp.behavioral_patterns?.length > 0) {
        sectionHeader(doc, theme, margin, '▸', 'BEHAVIORAL PATTERNS', theme.green);
        for (const pat of dsp.behavioral_patterns) {
          ensureSpace(doc, 18, theme, margin);
          doc.setFontSize(9);
          doc.setTextColor(...rgb(theme.accent));
          doc.text(pat.label || '', margin.left, margin.y);
          margin.y += 4;
          wrappedText(doc, theme, margin, pat.description);
          if (pat.context) {
            doc.setFontSize(7);
            doc.setTextColor(...rgb(theme.muted));
            const ctxLines = doc.splitTextToSize(pat.context, contentW);
            for (const l of ctxLines) {
              ensureSpace(doc, 4, theme, margin);
              doc.text(l, margin.left, margin.y);
              margin.y += 3.5;
            }
            margin.y += 2;
          }
        }
      }

      // Predictive Model
      if (dsp.action_response_matrix?.length > 0) {
        sectionHeader(doc, theme, margin, '▸', 'PREDICTIVE MODEL', theme.green);
        for (const pred of dsp.action_response_matrix) {
          const trigger = pred.trigger || pred.scenario || '';
          const behavior = pred.predicted_behavior || pred.response || '';
          const prob = pred.probability || 75;
          const probColor = prob >= 80 ? theme.green : prob >= 60 ? theme.accent : theme.rose;

          ensureSpace(doc, 24, theme, margin);
          // Trigger
          doc.setFontSize(7);
          doc.setTextColor(...rgb(theme.accent));
          doc.text('TRIGGER', margin.left, margin.y);
          margin.y += 3.5;
          wrappedText(doc, theme, margin, trigger, { fontSize: 8 });

          // Predicted behavior
          doc.setFontSize(7);
          doc.setTextColor(...rgb(theme.green));
          doc.text('PREDICTED BEHAVIOR', margin.left, margin.y);
          margin.y += 3.5;
          wrappedText(doc, theme, margin, behavior, { fontSize: 8 });

          // Probability badge
          doc.setFontSize(8);
          doc.setTextColor(...rgb(probColor));
          doc.text(`Probability: ${prob}%`, margin.left, margin.y);
          if (pred.confidence_interval) {
            doc.setTextColor(...rgb(theme.muted));
            doc.text(`  CI: [${pred.confidence_interval.lower || 0}%, ${pred.confidence_interval.upper || 0}%]`, margin.left + 35, margin.y);
          }
          margin.y += 4;
          // Probability bar
          drawBar(doc, theme, margin.left, margin.y, 80, prob, probColor);
          margin.y += 6;

          if (pred.temporal_factors) {
            doc.setFontSize(7);
            doc.setTextColor(...rgb(theme.violet));
            doc.text('TEMPORAL: ', margin.left, margin.y);
            doc.setTextColor(...rgb(theme.muted));
            const tfLines = doc.splitTextToSize(pred.temporal_factors, contentW - 20);
            doc.text(tfLines[0] || '', margin.left + 18, margin.y);
            margin.y += 4;
          }
          margin.y += 2;
        }
      }

      // Motivations & Fears
      const hasMot = dsp.motivations?.length > 0;
      const hasFears = dsp.fears?.length > 0;
      if (hasMot || hasFears) {
        sectionHeader(doc, theme, margin, '◉', 'CORE DRIVERS', theme.green);
        if (hasMot) {
          doc.setFontSize(8);
          doc.setTextColor(...rgb(theme.green));
          doc.text('MOTIVATIONS', margin.left, margin.y);
          margin.y += 4;
          for (const m of dsp.motivations) {
            ensureSpace(doc, 4, theme, margin);
            doc.setFontSize(8);
            doc.setTextColor(...rgb(theme.text));
            doc.text(`▸ ${m}`, margin.left + 2, margin.y);
            margin.y += 4;
          }
          margin.y += 2;
        }
        if (hasFears) {
          doc.setFontSize(8);
          doc.setTextColor(...rgb(theme.rose));
          doc.text('FEARS', margin.left, margin.y);
          margin.y += 4;
          for (const f of dsp.fears) {
            ensureSpace(doc, 4, theme, margin);
            doc.setFontSize(8);
            doc.setTextColor(...rgb(theme.text));
            doc.text(`▸ ${f}`, margin.left + 2, margin.y);
            margin.y += 4;
          }
          margin.y += 2;
        }
      }

      // Final Assessment
      if (dsp.final_assessment) {
        sectionHeader(doc, theme, margin, '■', 'FINAL ASSESSMENT', theme.accent);
        wrappedText(doc, theme, margin, dsp.final_assessment);
      }

      // Conflicts
      if (subject.conflicts_detected?.length > 0) {
        sectionHeader(doc, theme, margin, '⚠', 'ANALYSIS CONFLICTS', theme.rose);
        for (const c of subject.conflicts_detected) {
          ensureSpace(doc, 8, theme, margin);
          wrappedText(doc, theme, margin, c.description, { color: theme.rose, fontSize: 8 });
          if (c.resolution) {
            wrappedText(doc, theme, margin, `Resolution: ${c.resolution}`, { color: theme.muted, fontSize: 7 });
          }
        }
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // ESOTERIC CONTENT
    // ══════════════════════════════════════════════════════════════════════════
    if ((exportMode === 'esoteric' || exportMode === 'merged') && esp) {
      doc.addPage();
      drawPageBg(doc, theme);
      margin.y = 20;

      if (exportMode === 'merged') {
        // Transition page for merged mode
        margin.y = 60;
        doc.setFontSize(8);
        doc.setTextColor(...rgb(theme.muted));
        doc.text('SUPPLEMENTARY LAYER', pageW / 2, margin.y, { align: 'center' });
        margin.y += 8;
        doc.setFontSize(16);
        doc.setTextColor(...rgb(theme.violet));
        doc.text('Esoteric Intelligence Profile', pageW / 2, margin.y, { align: 'center' });
        margin.y += 6;
        doc.setFontSize(8);
        doc.setTextColor(...rgb(theme.muted));
        doc.text('CP-012-O-D-ESP', pageW / 2, margin.y, { align: 'center' });
        margin.y += 5;
        doc.setTextColor(...rgb(theme.muted));
        doc.text(`Fidelity: ${esp.input_fidelity || 'N/A'}  •  Status: ${esp.execution_status || 'N/A'}  •  Executed: ${esp.date_executed || 'N/A'}`, pageW / 2, margin.y, { align: 'center' });
        margin.y += 14;

        doc.addPage();
        drawPageBg(doc, theme);
        margin.y = 20;
      } else {
        // Standalone esoteric header
        doc.setFontSize(7);
        doc.setTextColor(...rgb(theme.muted));
        doc.text(`Fidelity: ${esp.input_fidelity || 'N/A'}  •  Status: ${esp.execution_status || 'N/A'}  •  Executed: ${esp.date_executed || 'N/A'}`, margin.left, margin.y);
        margin.y += 8;
      }

      const espSections = [
        ['✦', 'ESOTERIC INQUIRY FRAME', esp.inquiry_frame, theme.violet],
        ['☉', 'ASTROLOGICAL INTERPRETATION (NODE ALPHA)', esp.astrological_interpretation, theme.accent],
        ['#', 'NUMEROLOGICAL INTERPRETATION (NODE BETA)', esp.numerological_interpretation, theme.cyan],
        ['◈', 'UNIFIED EMOTIONAL SYNTHESIS', esp.unified_emotional_synthesis, theme.violet],
        ['↗', 'THRESHOLD ASSESSMENT', esp.threshold_assessment, theme.accent],
        ['→', 'STRATEGIC TRANSLATION', esp.strategic_translation, theme.green],
        ['⚠', 'LIMITATION STATEMENT', esp.limitation_statement, theme.muted],
      ];

      for (const [icon, title, content, color] of espSections) {
        if (!content) continue;
        sectionHeader(doc, theme, margin, icon, title, color);
        wrappedText(doc, theme, margin, content);
        margin.y += 3;
      }

      // SME Validation
      if (esp.sme_validation) {
        sectionHeader(doc, theme, margin, '✓', 'SME VALIDATION CHECK', theme.green);
        const checks = [
          ['Astrology Governed Timing', esp.sme_validation.astrology_governed_timing],
          ['Numerology Governed Structure', esp.sme_validation.numerology_governed_structure],
          ['Emotional Depth Prioritized', esp.sme_validation.emotional_depth_prioritized],
          ['Practical Translation Achieved', esp.sme_validation.practical_translation_achieved],
          ['Generic Horoscope Drift Avoided', esp.sme_validation.generic_horoscope_drift_avoided],
        ];
        for (const [label, val] of checks) {
          ensureSpace(doc, 5, theme, margin);
          const passed = val === true;
          doc.setFontSize(8);
          doc.setTextColor(...rgb(passed ? theme.green : theme.rose));
          doc.text(passed ? '✓' : '✗', margin.left, margin.y);
          doc.setTextColor(...rgb(theme.text));
          doc.text(label, margin.left + 6, margin.y);
          margin.y += 5;
        }
        margin.y += 2;
        doc.setFontSize(8);
        doc.setTextColor(...rgb(theme.muted));
        doc.text(`Execution Status: ${esp.sme_validation.execution_status || 'N/A'}`, margin.left, margin.y);
        margin.y += 6;
      }
    }

    // ══════════════════════════════════════════════════════════════════════════
    // FOOTER ON EVERY PAGE
    // ══════════════════════════════════════════════════════════════════════════
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pH = doc.internal.pageSize.getHeight();
      doc.setFontSize(6);
      doc.setTextColor(...rgb(theme.muted));
      doc.text('APOLLO PROFILING ENGINE • CONFIDENTIAL', pageW / 2, pH - 8, { align: 'center' });
      doc.text(`Page ${i} of ${totalPages}`, pageW / 2, pH - 4, { align: 'center' });
    }

    // Return PDF
    const pdfBytes = doc.output('arraybuffer');
    const filename = `${(subject.name || 'subject').replace(/\s+/g, '_')}_${exportMode}_${new Date().toISOString().split('T')[0]}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});