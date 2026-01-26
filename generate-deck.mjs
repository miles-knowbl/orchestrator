#!/usr/bin/env node
/**
 * Deck Generator v2 — Bold geometry, gradients, oversized numbers
 */
import PptxGenJSModule from 'pptxgenjs';
import { readFileSync } from 'fs';

const PptxGenJS = PptxGenJSModule.default || PptxGenJSModule;
const textSchema = JSON.parse(readFileSync('deck-text-schema.json', 'utf-8'));

const pptx = new PptxGenJS();
pptx.defineLayout({ name: 'DECK', width: 13.33, height: 7.5 });
pptx.layout = 'DECK';

// -- Palette --
const BLUE = '3B82F6';
const PURPLE = '8B5CF6';
const NAVY = '1E293B';
const DARK = '0F172A';
const AMBER = 'F59E0B';
const GREEN = '10B981';
const SLATE = '334155';
const MUTED = '64748B';
const LIGHT = 'F8FAFC';
const BORDER = 'E2E8F0';
const WHITE = 'FFFFFF';

// -- Gradient helper --
const grad = (c1, c2, angle = 0) => ({
  type: 'gradient', gradientType: 'linear', rotate: angle,
  stops: [{ color: c1, position: 0 }, { color: c2, position: 100 }]
});

const notes = (s, t) => { if (t) s.addNotes(t); };

// -- Decorative dot grid --
function dotGrid(s, startX, startY, cols, rows, gap, color, size = 0.06) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      s.addShape(pptx.ShapeType.ellipse, {
        x: startX + c * gap, y: startY + r * gap, w: size, h: size,
        fill: { color }, line: { pt: 0 }
      });
    }
  }
}

// -- Large decorative circle (partially off-slide for bleed effect) --
function decoCircle(s, x, y, d, color, transparency = 85) {
  s.addShape(pptx.ShapeType.ellipse, {
    x, y, w: d, h: d,
    fill: { color, transparency }, line: { pt: 0 }
  });
}

// -- Accent bar (thicker, gradient) --
function accentBar(s) {
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.1,
    fill: grad(BLUE, PURPLE)
  });
}

// -- Slide number badge --
function slideNum(s, num) {
  s.addText(String(num).padStart(2, '0'), {
    x: 12.2, y: 6.9, w: 0.8, h: 0.4,
    fontSize: 11, fontFace: 'Inter', color: BORDER, align: 'right'
  });
}

// ============================================================================
// SLIDE 1: Title — Hero treatment
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[0].speakerNotes);

  // Large decorative circles
  decoCircle(s, -2.5, -2, 6, BLUE, 92);
  decoCircle(s, 10.5, 4.5, 5, PURPLE, 92);

  // Dot grid — top right
  dotGrid(s, 10.0, 0.4, 8, 6, 0.3, BORDER);

  // Thick gradient bar at top
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: grad(BLUE, PURPLE)
  });

  // Title — oversized
  s.addText('Orchestrator', {
    x: 1.2, y: 1.8, w: 11.0, h: 1.6,
    fontSize: 72, fontFace: 'Inter', bold: true, color: DARK,
    align: 'left'
  });

  // Subtitle
  s.addText('Self-Improving\nEngineering Workflows', {
    x: 1.2, y: 3.4, w: 8.0, h: 1.2,
    fontSize: 28, fontFace: 'Inter', color: MUTED,
    lineSpacingMultiple: 1.2
  });

  // Tagline with accent shape
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 5.0, w: 6.0, h: 0.65,
    fill: grad(BLUE, PURPLE), rectRadius: 0.33
  });
  s.addText('Skills are the atomic primitive.', {
    x: 1.5, y: 5.0, w: 5.4, h: 0.65,
    fontSize: 18, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle'
  });

  // Footer
  s.addText('Superorganism  ·  v0.1.0  ·  Early Access', {
    x: 1.2, y: 6.6, w: 6.0, h: 0.4,
    fontSize: 13, fontFace: 'Inter', color: BORDER
  });
}

// ============================================================================
// SLIDE 2: The Problem
// ============================================================================
{
  const s = pptx.addSlide();
  const sd = textSchema.slides[1];
  notes(s, sd.speakerNotes);
  accentBar(s);
  slideNum(s, 2);

  // Large amber circle — top right decorative
  decoCircle(s, 9.5, -2.5, 5, AMBER, 90);
  dotGrid(s, 0.5, 5.5, 6, 5, 0.25, BORDER);

  // Title — oversized and dramatic
  s.addText('Sound\nfamiliar?', {
    x: 1.0, y: 0.5, w: 5.0, h: 1.6,
    fontSize: 44, fontFace: 'Inter', bold: true, color: DARK,
    lineSpacingMultiple: 1.0
  });

  // Vertical amber accent line
  s.addShape(pptx.ShapeType.rect, {
    x: 6.0, y: 0.6, w: 0.06, h: 5.5,
    fill: { color: AMBER }
  });

  // Bullets — right side
  const bullets = sd.content.bullets;
  const bulletRows = bullets.map(b => ({
    text: b, options: {
      fontSize: 17, fontFace: 'Inter', color: SLATE,
      bullet: { code: '25A0', color: AMBER },
      paraSpaceBefore: 10, paraSpaceAfter: 10
    }
  }));
  s.addText(bulletRows, {
    x: 6.5, y: 0.5, w: 6.3, h: 5.0,
    valign: 'middle'
  });

  // Bottom callout — full width gradient
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 6.2, w: 11.73, h: 0.8,
    fill: grad(AMBER, 'F97316'), rectRadius: 0.1
  });
  s.addText(sd.content.bottom_line, {
    x: 1.2, y: 6.2, w: 11.0, h: 0.8,
    fontSize: 17, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle'
  });
}

// ============================================================================
// SLIDE 3: Core Idea — Before/After
// ============================================================================
{
  const s = pptx.addSlide();
  const sd = textSchema.slides[2];
  notes(s, sd.speakerNotes);
  accentBar(s);
  slideNum(s, 3);

  decoCircle(s, -3, 3.5, 6, BLUE, 94);
  dotGrid(s, 11.0, 0.5, 6, 4, 0.25, BORDER);

  s.addText('What if your practices\nwere code?', {
    x: 1.0, y: 0.4, w: 10.0, h: 1.3,
    fontSize: 38, fontFace: 'Inter', bold: true, color: DARK,
    lineSpacingMultiple: 1.05
  });

  // Concept pill
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 1.85, w: 9.5, h: 0.55,
    fill: { color: 'EFF6FF' }, rectRadius: 0.28
  });
  s.addText('A skill is a versioned, executable unit of engineering practice.', {
    x: 1.3, y: 1.85, w: 9.0, h: 0.55,
    fontSize: 18, fontFace: 'Inter', color: BLUE, valign: 'middle'
  });

  // Table with bold styling
  const tableRows = [
    [
      { text: 'BEFORE', options: { bold: true, color: WHITE, fill: { color: 'DC2626' }, fontSize: 15, fontFace: 'Inter', align: 'center', valign: 'middle' } },
      { text: 'AFTER', options: { bold: true, color: WHITE, fill: grad(GREEN, '059669'), fontSize: 15, fontFace: 'Inter', align: 'center', valign: 'middle' } }
    ],
    ...sd.content.contrast.map(row => [
      { text: row.before, options: { fontSize: 17, fontFace: 'Inter', color: SLATE, fill: { color: 'FEF2F2' }, valign: 'middle' } },
      { text: row.after, options: { fontSize: 17, fontFace: 'Inter', color: SLATE, fill: { color: 'F0FDF4' }, valign: 'middle', bold: true } }
    ])
  ];

  s.addTable(tableRows, {
    x: 1.0, y: 2.7, w: 11.33,
    border: { pt: 0 },
    colW: [5.66, 5.67],
    rowH: [0.55, 0.8, 0.8, 0.8, 0.8],
    margin: [10, 16, 10, 16]
  });
}

// ============================================================================
// SLIDE 4: Anatomy of a Skill
// ============================================================================
{
  const s = pptx.addSlide();
  const sd = textSchema.slides[3];
  notes(s, sd.speakerNotes);
  accentBar(s);
  slideNum(s, 4);

  dotGrid(s, 0.5, 0.5, 5, 4, 0.25, BORDER);

  s.addText('Anatomy of\na Skill', {
    x: 1.0, y: 0.3, w: 5.0, h: 1.4,
    fontSize: 40, fontFace: 'Inter', bold: true, color: DARK, lineSpacingMultiple: 1.0
  });

  // Left code block — with gradient top edge
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 2.0, w: 5.5, h: 0.12,
    fill: grad(BLUE, PURPLE), rectRadius: 0.06
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 2.1, w: 5.5, h: 3.3,
    fill: { color: NAVY }
  });
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 2.0, w: 5.5, h: 3.4,
    fill: { color: NAVY }, rectRadius: 0.1
  });
  // Re-draw gradient bar on top
  s.addShape(pptx.ShapeType.rect, {
    x: 1.0, y: 2.0, w: 5.5, h: 0.08,
    fill: grad(BLUE, PURPLE)
  });
  s.addText('skills/implement/', {
    x: 1.25, y: 2.2, w: 5.0, h: 0.4,
    fontSize: 14, fontFace: 'Courier New', bold: true, color: BLUE
  });
  s.addText('  SKILL.md        # instruction set\n  CHANGELOG.md    # version history\n  references/     # patterns & examples\n  ui.json         # dashboard metadata', {
    x: 1.25, y: 2.7, w: 5.0, h: 2.2,
    fontSize: 15, fontFace: 'Courier New', color: 'CBD5E1',
    paraSpaceBefore: 6, paraSpaceAfter: 6
  });

  // Right code block — YAML
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.9, y: 2.0, w: 5.5, h: 3.4,
    fill: { color: NAVY }, rectRadius: 0.1
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 6.9, y: 2.0, w: 5.5, h: 0.08,
    fill: grad(PURPLE, 'EC4899')
  });
  s.addText('YAML Frontmatter', {
    x: 7.15, y: 2.2, w: 5.0, h: 0.4,
    fontSize: 14, fontFace: 'Courier New', bold: true, color: PURPLE
  });
  s.addText('name: implement\nphase: IMPLEMENT\ncategory: core\nversion: 1.0.0\ndepends_on: [spec, scaffold]\ntags: [coding, core-workflow]', {
    x: 7.15, y: 2.7, w: 5.0, h: 2.2,
    fontSize: 15, fontFace: 'Courier New', color: 'CBD5E1',
    paraSpaceBefore: 6, paraSpaceAfter: 6
  });

  // Process arrow at bottom
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 5.8, w: 11.33, h: 0.6,
    fill: { color: LIGHT }, line: { color: BORDER, pt: 1 }, rectRadius: 0.3
  });
  s.addText('spec → plan → data → service → API → UI → verify', {
    x: 1.3, y: 5.8, w: 10.7, h: 0.6,
    fontSize: 16, fontFace: 'Courier New', color: MUTED, align: 'center', valign: 'middle'
  });
}

// ============================================================================
// SLIDE 5: 38 Skills — Oversized number hero
// ============================================================================
{
  const s = pptx.addSlide();
  const sd = textSchema.slides[4];
  notes(s, sd.speakerNotes);
  accentBar(s);
  slideNum(s, 5);

  // Giant "38" as background element
  s.addText('38', {
    x: -0.5, y: -0.5, w: 6.5, h: 5.0,
    fontSize: 200, fontFace: 'Inter', bold: true, color: BORDER,
    align: 'left', valign: 'top'
  });

  // Title overlaid
  s.addText('Skills.\nFull Lifecycle.', {
    x: 1.0, y: 0.5, w: 5.0, h: 1.4,
    fontSize: 40, fontFace: 'Inter', bold: true, color: DARK,
    lineSpacingMultiple: 1.0
  });

  // 5 category cards — gradient accent bars
  const categories = [
    { label: 'Core', count: '22', c1: BLUE, c2: PURPLE, highlights: 'implement\narchitect\ncode-review\ndeploy\ntest-gen\nsecurity-audit' },
    { label: 'Meta', count: '6', c1: PURPLE, c2: 'A855F7', highlights: 'retrospective\ncalibration\ncontent-analysis' },
    { label: 'Specialized', count: '6', c1: GREEN, c2: '06B6D4', highlights: 'frontend-design\nproposal-builder\ncontext-cultivation' },
    { label: 'Infra', count: '2', c1: AMBER, c2: 'F97316', highlights: 'memory-manager\nloop-to-command' },
    { label: 'Custom', count: '2', c1: 'EF4444', c2: 'EC4899', highlights: 'orchestrator\nskill-design' },
  ];

  const cardW = 2.2;
  const gap = 0.18;
  const startX = (13.33 - (cardW * 5 + gap * 4)) / 2;

  categories.forEach((cat, i) => {
    const x = startX + i * (cardW + gap);
    // Card
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.3, w: cardW, h: 4.2,
      fill: { color: WHITE }, line: { color: BORDER, pt: 1 }, rectRadius: 0.12
    });
    // Gradient bar at top
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.01, y: 2.3, w: cardW - 0.02, h: 0.1,
      fill: grad(cat.c1, cat.c2)
    });
    // Oversized count
    s.addText(cat.count, {
      x, y: 2.5, w: cardW, h: 1.2,
      fontSize: 56, fontFace: 'Inter', bold: true, color: cat.c1, align: 'center'
    });
    // Label
    s.addText(cat.label, {
      x, y: 3.6, w: cardW, h: 0.4,
      fontSize: 15, fontFace: 'Inter', bold: true, color: DARK, align: 'center'
    });
    // Divider
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.5, y: 4.1, w: cardW - 1.0, h: 0.02,
      fill: { color: BORDER }
    });
    // Highlights
    s.addText(cat.highlights, {
      x: x + 0.2, y: 4.3, w: cardW - 0.4, h: 2.0,
      fontSize: 11, fontFace: 'Courier New', color: MUTED, valign: 'top',
      paraSpaceBefore: 3, paraSpaceAfter: 3
    });
  });

  // Callout
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 6.8, w: 5.5, h: 0.5,
    fill: grad(BLUE, PURPLE), rectRadius: 0.25
  });
  s.addText('+ create your own', {
    x: 1.1, y: 6.8, w: 4.9, h: 0.5,
    fontSize: 15, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle'
  });
}

// ============================================================================
// SLIDE 6: Loops — Flow diagram
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[5].speakerNotes);
  accentBar(s);
  slideNum(s, 6);

  decoCircle(s, 10, -3, 5.5, PURPLE, 94);
  dotGrid(s, 0.5, 6.0, 8, 3, 0.25, BORDER);

  s.addText('Loops', {
    x: 1.0, y: 0.3, w: 4.0, h: 1.0,
    fontSize: 44, fontFace: 'Inter', bold: true, color: DARK
  });
  s.addText('Skills composed into phased workflows with quality gates.', {
    x: 1.0, y: 1.1, w: 8.0, h: 0.45,
    fontSize: 17, fontFace: 'Inter', color: MUTED
  });

  // Flow — 2 rows of 5 with gradient nodes
  const phases = [
    { label: 'INIT', sub: 'requirements\nspec' },
    { label: 'SCAFFOLD', sub: 'architect\nscaffold' },
    { label: 'IMPLEMENT', sub: 'implement' },
    { label: 'TEST', sub: 'test-gen' },
    { label: 'VERIFY', sub: 'code-verify' },
    { label: 'VALIDATE', sub: 'validation\nsecurity' },
    { label: 'DOCUMENT', sub: 'document' },
    { label: 'REVIEW', sub: 'code-review' },
    { label: 'SHIP', sub: 'deploy' },
    { label: 'COMPLETE', sub: 'retrospective' },
  ];

  const gates = {
    'INIT': { label: 'H', color: AMBER },
    'SCAFFOLD': { label: 'H', color: AMBER },
    'VERIFY': { label: 'A', color: GREEN },
    'VALIDATE': { label: 'H', color: AMBER },
    'REVIEW': { label: 'H', color: AMBER },
    'SHIP': { label: 'C', color: 'CBD5E1' },
  };

  const nW = 2.0, nH = 1.15, gX = 0.3;
  const rX = (13.33 - (nW * 5 + gX * 4)) / 2;

  phases.forEach((ph, i) => {
    const row = i < 5 ? 0 : 1;
    const col = i < 5 ? i : i - 5;
    const x = rX + col * (nW + gX);
    const y = 1.9 + row * 2.3;

    // Node with gradient
    s.addShape(pptx.ShapeType.roundRect, {
      x, y, w: nW, h: nH,
      fill: grad(BLUE, PURPLE), rectRadius: 0.1
    });
    s.addText(ph.label, {
      x, y, w: nW, h: 0.4,
      fontSize: 12, fontFace: 'Inter', bold: true, color: WHITE, align: 'center', valign: 'middle'
    });
    s.addText(ph.sub, {
      x, y: y + 0.38, w: nW, h: nH - 0.38,
      fontSize: 10, fontFace: 'Courier New', color: 'DBEAFE', align: 'center', valign: 'top'
    });

    // Connector arrow
    if (col < 4 && i < 9) {
      s.addText('›', {
        x: x + nW, y: y + 0.15, w: gX, h: 0.7,
        fontSize: 28, fontFace: 'Inter', bold: true, color: BORDER, align: 'center', valign: 'middle'
      });
    }

    // Gate diamond
    if (gates[ph.label]) {
      const g = gates[ph.label];
      s.addShape(pptx.ShapeType.diamond, {
        x: x + nW / 2 - 0.18, y: y + nH + 0.08, w: 0.36, h: 0.36,
        fill: { color: g.color }
      });
      s.addText(g.label, {
        x: x + nW / 2 - 0.18, y: y + nH + 0.08, w: 0.36, h: 0.36,
        fontSize: 10, fontFace: 'Inter', bold: true, color: WHITE, align: 'center', valign: 'middle'
      });
    }
  });

  // Curved connector between rows
  s.addShape(pptx.ShapeType.arc, {
    x: rX + 4 * (nW + gX) + nW + 0.05, y: 2.4, w: 0.6, h: 2.5,
    fill: { color: BORDER, transparency: 50 }, line: { color: BORDER, pt: 2 }
  });

  // Stats bar
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 6.5, w: 11.33, h: 0.55,
    fill: { color: LIGHT }, rectRadius: 0.28
  });
  s.addText('Engineering Loop v3.0.0     10 phases  ·  13 skills  ·  6 gates     H = Human  A = Auto  C = Conditional', {
    x: 1.3, y: 6.5, w: 10.7, h: 0.55,
    fontSize: 12, fontFace: 'Inter', color: MUTED, align: 'center', valign: 'middle'
  });
}

// ============================================================================
// SLIDE 7: Gates — Bold cards
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[6].speakerNotes);
  accentBar(s);
  slideNum(s, 7);

  decoCircle(s, -2, -2, 5, AMBER, 94);

  s.addText('Gates That\nActually Gate', {
    x: 1.0, y: 0.3, w: 6.0, h: 1.4,
    fontSize: 42, fontFace: 'Inter', bold: true, color: DARK, lineSpacingMultiple: 1.0
  });

  const gCards = [
    { label: 'Human', c1: AMBER, c2: 'F97316', desc: 'Requires explicit\napproval. Spec, arch,\nvalidation, review.', icon: '●' },
    { label: 'Auto', c1: GREEN, c2: '06B6D4', desc: 'Passes if checks pass.\nBuild, tests, lint —\nall green.', icon: '◆' },
    { label: 'Conditional', c1: '94A3B8', c2: 'CBD5E1', desc: 'Auto-passes if no\ntarget configured.', icon: '○' },
  ];

  const gcW = 3.5, gcG = 0.4;
  const gcS = (13.33 - (gcW * 3 + gcG * 2)) / 2;

  gCards.forEach((gc, i) => {
    const x = gcS + i * (gcW + gcG);
    // Card
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.0, w: gcW, h: 3.0,
      fill: { color: WHITE }, line: { color: BORDER, pt: 1 }, rectRadius: 0.15
    });
    // Gradient top
    s.addShape(pptx.ShapeType.rect, {
      x: x + 0.01, y: 2.0, w: gcW - 0.02, h: 0.12,
      fill: grad(gc.c1, gc.c2)
    });
    // Large icon
    s.addText(gc.icon, {
      x, y: 2.3, w: gcW, h: 0.6,
      fontSize: 32, color: gc.c1, align: 'center'
    });
    // Label
    s.addText(gc.label + ' Gate', {
      x, y: 2.85, w: gcW, h: 0.5,
      fontSize: 22, fontFace: 'Inter', bold: true, color: gc.c1, align: 'center'
    });
    // Description
    s.addText(gc.desc, {
      x: x + 0.4, y: 3.5, w: gcW - 0.8, h: 1.3,
      fontSize: 15, fontFace: 'Inter', color: SLATE, valign: 'top',
      paraSpaceBefore: 4, paraSpaceAfter: 4
    });
  });

  // Enforcement callout — gradient
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 5.4, w: 11.73, h: 0.75,
    fill: grad(BLUE, PURPLE), rectRadius: 0.1
  });
  s.addText('The execution engine will not advance past a gate. No exceptions.', {
    x: 1.2, y: 5.4, w: 11.0, h: 0.75,
    fontSize: 20, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle', align: 'center'
  });

  // Human note
  s.addText('Engineers retain final authority. AI assists — humans approve.', {
    x: 1.0, y: 6.4, w: 11.33, h: 0.45,
    fontSize: 15, fontFace: 'Inter', color: MUTED, align: 'center'
  });
}

// ============================================================================
// SLIDE 8: Memory — Nested hierarchy
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[7].speakerNotes);
  accentBar(s);
  slideNum(s, 8);

  dotGrid(s, 10.5, 0.5, 6, 5, 0.25, BORDER);

  s.addText('Memory', {
    x: 1.0, y: 0.3, w: 5.0, h: 0.9,
    fontSize: 44, fontFace: 'Inter', bold: true, color: DARK
  });
  s.addText('Learning that compounds.', {
    x: 1.0, y: 1.05, w: 5.0, h: 0.4,
    fontSize: 18, fontFace: 'Inter', color: MUTED
  });

  // Nested boxes — stacked with gradient outlines
  const tiers = [
    { label: 'Orchestrator Memory', sub: 'Global patterns & decisions', c1: BLUE, c2: PURPLE, x: 0.8, y: 1.8, w: 6.0, h: 3.8 },
    { label: 'Loop Memory', sub: 'Workflow-specific learnings', c1: PURPLE, c2: 'A855F7', x: 1.3, y: 2.6, w: 5.0, h: 2.6 },
    { label: 'Skill Memory', sub: 'Per-skill calibration', c1: GREEN, c2: '06B6D4', x: 1.8, y: 3.3, w: 4.0, h: 1.5 },
  ];

  tiers.forEach(t => {
    s.addShape(pptx.ShapeType.roundRect, {
      x: t.x, y: t.y, w: t.w, h: t.h,
      fill: { color: WHITE, transparency: 60 },
      line: { color: t.c1, pt: 2.5 },
      rectRadius: 0.12
    });
    s.addText(t.label, {
      x: t.x + 0.2, y: t.y + 0.12, w: t.w - 0.4, h: 0.35,
      fontSize: 14, fontFace: 'Inter', bold: true, color: t.c1
    });
    s.addText(t.sub, {
      x: t.x + 0.2, y: t.y + 0.42, w: t.w - 0.4, h: 0.3,
      fontSize: 12, fontFace: 'Inter', color: MUTED
    });
  });

  // Right side — memory types with gradient accent dots
  const memItems = [
    { label: 'Decisions', desc: 'ADR-style records with context', color: BLUE },
    { label: 'Patterns', desc: 'Named solutions with confidence levels', color: PURPLE },
    { label: 'Calibration', desc: 'Estimate vs. actual auto-tracking', color: GREEN },
    { label: 'Handoffs', desc: 'Session continuity across sessions', color: AMBER },
  ];

  memItems.forEach((item, i) => {
    const y = 1.9 + i * 1.05;
    // Accent dot
    s.addShape(pptx.ShapeType.ellipse, {
      x: 7.3, y: y + 0.12, w: 0.2, h: 0.2,
      fill: { color: item.color }
    });
    s.addText(item.label, {
      x: 7.7, y, w: 5.0, h: 0.4,
      fontSize: 18, fontFace: 'Inter', bold: true, color: DARK
    });
    s.addText(item.desc, {
      x: 7.7, y: y + 0.4, w: 5.0, h: 0.35,
      fontSize: 14, fontFace: 'Inter', color: MUTED
    });
  });

  // Green callout
  s.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 6.0, w: 11.73, h: 0.7,
    fill: grad(GREEN, '06B6D4'), rectRadius: 0.1
  });
  s.addText('New team members inherit the accumulated knowledge of everyone before them.', {
    x: 1.2, y: 6.0, w: 11.0, h: 0.7,
    fontSize: 16, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle', align: 'center'
  });
}

// ============================================================================
// SLIDE 9: Improvement Cycle
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[8].speakerNotes);
  accentBar(s);
  slideNum(s, 9);

  decoCircle(s, 10, -2.5, 5, GREEN, 93);

  s.addText('Skills Improve\nThrough Use', {
    x: 1.0, y: 0.3, w: 6.0, h: 1.4,
    fontSize: 42, fontFace: 'Inter', bold: true, color: DARK, lineSpacingMultiple: 1.0
  });

  // Cycle pills — horizontal with gradient
  const steps = [
    { label: 'Execute', c1: BLUE, c2: BLUE },
    { label: 'Score', c1: BLUE, c2: PURPLE },
    { label: 'Analyze', c1: PURPLE, c2: 'A855F7' },
    { label: 'Propose', c1: AMBER, c2: 'F97316' },
    { label: 'Version Up', c1: GREEN, c2: '06B6D4' },
    { label: 'Calibrate', c1: '06B6D4', c2: GREEN },
  ];

  const pW = 1.7, pG = 0.2;
  const pS = (13.33 - (pW * 6 + pG * 5)) / 2;

  steps.forEach((step, i) => {
    const x = pS + i * (pW + pG);
    s.addShape(pptx.ShapeType.roundRect, {
      x, y: 2.1, w: pW, h: 0.7,
      fill: grad(step.c1, step.c2), rectRadius: 0.35
    });
    s.addText(step.label, {
      x, y: 2.1, w: pW, h: 0.7,
      fontSize: 13, fontFace: 'Inter', bold: true, color: WHITE, align: 'center', valign: 'middle'
    });
    if (i < 5) {
      s.addText('→', {
        x: x + pW, y: 2.1, w: pG, h: 0.7,
        fontSize: 16, color: BORDER, align: 'center', valign: 'middle'
      });
    }
  });

  // Loop-back arrow
  s.addText('↻', {
    x: pS + 5 * (pW + pG) + pW + 0.05, y: 1.9, w: 0.6, h: 1.0,
    fontSize: 30, color: MUTED, align: 'center', valign: 'middle'
  });

  // Example card with dark background
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.2, y: 3.3, w: 10.93, h: 2.8,
    fill: { color: NAVY }, rectRadius: 0.15
  });

  s.addText('EXAMPLE', {
    x: 1.6, y: 3.5, w: 3.0, h: 0.35,
    fontSize: 11, fontFace: 'Inter', bold: true, color: MUTED, letterSpacing: 3
  });

  s.addText('Code-review skill misses a race condition', {
    x: 1.6, y: 3.9, w: 10.0, h: 0.45,
    fontSize: 19, fontFace: 'Inter', color: WHITE
  });

  // Command line
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.6, y: 4.5, w: 10.1, h: 0.6,
    fill: { color: DARK }, rectRadius: 0.08
  });
  s.addText([
    { text: '$ ', options: { color: GREEN, fontSize: 14, fontFace: 'Courier New' } },
    { text: 'improve: code-review missed a race condition in the async handler', options: { color: 'CBD5E1', fontSize: 14, fontFace: 'Courier New' } }
  ], {
    x: 1.85, y: 4.5, w: 9.6, h: 0.6, valign: 'middle'
  });

  // Result
  s.addText([
    { text: 'v1.2.0 → v1.3.0', options: { color: GREEN, fontSize: 16, fontFace: 'Inter', bold: true } },
    { text: '  ·  CHANGELOG updated  ·  Next run includes the pattern', options: { color: 'CBD5E1', fontSize: 16, fontFace: 'Inter' } }
  ], {
    x: 1.6, y: 5.3, w: 10.0, h: 0.45
  });

  // Tagline
  s.addText('The 10th time you run a skill, it\'s better than the 1st.', {
    x: 1.0, y: 6.5, w: 11.33, h: 0.5,
    fontSize: 18, fontFace: 'Inter', italic: true, color: BLUE, align: 'right'
  });
}

// ============================================================================
// SLIDE 10: Under the Hood — Oversized stats
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[9].speakerNotes);
  accentBar(s);
  slideNum(s, 10);

  dotGrid(s, 0.5, 0.4, 5, 4, 0.25, BORDER);

  s.addText('Under\nthe Hood', {
    x: 1.0, y: 0.3, w: 5.0, h: 1.4,
    fontSize: 42, fontFace: 'Inter', bold: true, color: DARK, lineSpacingMultiple: 1.0
  });

  // Architecture layers — gradient bars
  const layers = [
    { label: 'MCP Interface', sub: '105+ tools · any MCP client', c1: BLUE, c2: PURPLE },
    { label: 'Services', sub: 'Registry · Composer · Engine · Memory · Learning', c1: PURPLE, c2: 'A855F7' },
    { label: 'Content', sub: '38 skills · 3 loops · 3-tier memory', c1: GREEN, c2: '06B6D4' },
    { label: 'Storage', sub: 'Git + JSON — no database required', c1: AMBER, c2: 'F97316' },
  ];

  layers.forEach((layer, i) => {
    const y = 2.0 + i * 0.95;
    s.addShape(pptx.ShapeType.roundRect, {
      x: 1.0, y, w: 6.0, h: 0.8,
      fill: grad(layer.c1, layer.c2), rectRadius: 0.08
    });
    s.addText(layer.label, {
      x: 1.3, y, w: 2.5, h: 0.8,
      fontSize: 15, fontFace: 'Inter', bold: true, color: WHITE, valign: 'middle'
    });
    s.addText(layer.sub, {
      x: 3.6, y, w: 3.2, h: 0.8,
      fontSize: 12, fontFace: 'Inter', color: 'E0E7FF', valign: 'middle'
    });
  });

  // Oversized stat numbers (right side)
  const stats = [
    { num: '105+', label: 'MCP Tools', color: BLUE },
    { num: '38', label: 'Skills', color: GREEN },
    { num: '~10K', label: 'Lines of Code', color: PURPLE },
    { num: '0', label: 'Databases', color: AMBER },
  ];

  stats.forEach((stat, i) => {
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = 7.8 + col * 2.7;
    const y = 2.0 + row * 2.2;

    // Oversized number
    s.addText(stat.num, {
      x, y, w: 2.5, h: 1.3,
      fontSize: 52, fontFace: 'Inter', bold: true, color: stat.color, align: 'center'
    });
    s.addText(stat.label, {
      x, y: y + 1.2, w: 2.5, h: 0.5,
      fontSize: 13, fontFace: 'Inter', color: MUTED, align: 'center'
    });
  });

  // Tech stack — pill bar
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 6.3, w: 11.33, h: 0.55,
    fill: { color: LIGHT }, line: { color: BORDER, pt: 1 }, rectRadius: 0.28
  });
  s.addText('TypeScript 5.6  ·  Node 18+  ·  Express  ·  MCP SDK  ·  Zod  ·  Dashboard: Next.js 15 + React 19', {
    x: 1.3, y: 6.3, w: 10.7, h: 0.55,
    fontSize: 12, fontFace: 'Courier New', color: MUTED, align: 'center', valign: 'middle'
  });
}

// ============================================================================
// SLIDE 11: Honest Assessment
// ============================================================================
{
  const s = pptx.addSlide();
  const sd = textSchema.slides[10];
  notes(s, sd.speakerNotes);
  accentBar(s);
  slideNum(s, 11);

  s.addText('Honest\nAssessment', {
    x: 1.0, y: 0.3, w: 5.0, h: 1.4,
    fontSize: 42, fontFace: 'Inter', bold: true, color: DARK, lineSpacingMultiple: 1.0
  });

  // Left column — What Works
  s.addShape(pptx.ShapeType.roundRect, {
    x: 1.0, y: 2.0, w: 5.5, h: 3.3,
    fill: { color: WHITE }, line: { color: GREEN, pt: 2 }, rectRadius: 0.15
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 1.01, y: 2.0, w: 5.48, h: 0.12,
    fill: grad(GREEN, '06B6D4')
  });
  s.addText('What Works', {
    x: 1.0, y: 2.2, w: 5.5, h: 0.5,
    fontSize: 20, fontFace: 'Inter', bold: true, color: GREEN, align: 'center'
  });
  const works = sd.content.whatWorks.map(w => ({
    text: w, options: { fontSize: 13, fontFace: 'Inter', color: SLATE, bullet: { code: '2713', color: GREEN }, paraSpaceBefore: 7, paraSpaceAfter: 7 }
  }));
  s.addText(works, { x: 1.3, y: 2.75, w: 4.9, h: 2.4, valign: 'top' });

  // Right column — What's Early
  s.addShape(pptx.ShapeType.roundRect, {
    x: 6.83, y: 2.0, w: 5.5, h: 3.3,
    fill: { color: WHITE }, line: { color: AMBER, pt: 2 }, rectRadius: 0.15
  });
  s.addShape(pptx.ShapeType.rect, {
    x: 6.84, y: 2.0, w: 5.48, h: 0.12,
    fill: grad(AMBER, 'F97316')
  });
  s.addText("What's Early", {
    x: 6.83, y: 2.2, w: 5.5, h: 0.5,
    fontSize: 20, fontFace: 'Inter', bold: true, color: AMBER, align: 'center'
  });
  const early = sd.content.whatsEarly.map(e => ({
    text: e, options: { fontSize: 13, fontFace: 'Inter', color: SLATE, bullet: { code: '25CB', color: AMBER }, paraSpaceBefore: 7, paraSpaceAfter: 7 }
  }));
  s.addText(early, { x: 7.1, y: 2.75, w: 4.9, h: 2.4, valign: 'top' });

  // Adoption timeline — gradient line
  const tW = 2.05, tGap = 0.15;
  const tStart = (13.33 - (tW * 5 + tGap * 4)) / 2;

  s.addShape(pptx.ShapeType.rect, {
    x: tStart, y: 5.9, w: tW * 5 + tGap * 4, h: 0.06,
    fill: grad(BLUE, PURPLE)
  });

  const tLabels = ['Week 1', 'Weeks 2–3', 'Month 1', 'Month 2+', 'Ongoing'];
  const tActions = ['Install &\nexplore', 'Customize\nskills', 'Supervised\nmode', 'Increase\nautonomy', 'Feedback\ncompounds'];

  tLabels.forEach((label, i) => {
    const x = tStart + i * (tW + tGap);
    s.addShape(pptx.ShapeType.ellipse, {
      x: x + tW / 2 - 0.12, y: 5.81, w: 0.24, h: 0.24,
      fill: grad(BLUE, PURPLE)
    });
    s.addText(label, {
      x, y: 6.15, w: tW, h: 0.3,
      fontSize: 12, fontFace: 'Inter', bold: true, color: BLUE, align: 'center'
    });
    s.addText(tActions[i], {
      x, y: 6.45, w: tW, h: 0.55,
      fontSize: 11, fontFace: 'Inter', color: MUTED, align: 'center'
    });
  });
}

// ============================================================================
// SLIDE 12: Let's Try It — CTA
// ============================================================================
{
  const s = pptx.addSlide();
  notes(s, textSchema.slides[11].speakerNotes);

  // Thick gradient bar
  s.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: grad(BLUE, PURPLE)
  });

  // Large decorative circles
  decoCircle(s, -2, -2, 5, BLUE, 93);
  decoCircle(s, 10.5, 4.5, 5, PURPLE, 93);
  dotGrid(s, 10.5, 0.5, 6, 4, 0.3, BORDER);

  // Headline
  s.addText("Pick a real feature.", {
    x: 1.0, y: 1.8, w: 11.33, h: 0.9,
    fontSize: 40, fontFace: 'Inter', bold: true, color: DARK, align: 'center'
  });
  s.addText("We'll run the engineering loop on it — together.", {
    x: 1.0, y: 2.7, w: 11.33, h: 0.7,
    fontSize: 24, fontFace: 'Inter', color: MUTED, align: 'center'
  });

  // Benefits with gradient check circles
  const benefits = [
    'See every phase and gate on your actual code',
    'Explore and customize skills to your patterns',
    'Judge for yourself whether it fits',
  ];

  benefits.forEach((b, i) => {
    const y = 3.9 + i * 0.6;
    s.addShape(pptx.ShapeType.ellipse, {
      x: 3.5, y: y + 0.07, w: 0.28, h: 0.28,
      fill: grad(GREEN, '06B6D4')
    });
    s.addText('✓', {
      x: 3.5, y: y + 0.03, w: 0.28, h: 0.32,
      fontSize: 14, fontFace: 'Inter', bold: true, color: WHITE, align: 'center', valign: 'middle'
    });
    s.addText(b, {
      x: 4.0, y, w: 6.5, h: 0.4,
      fontSize: 18, fontFace: 'Inter', color: SLATE, valign: 'middle'
    });
  });

  // Questions pill
  s.addShape(pptx.ShapeType.roundRect, {
    x: 5.0, y: 5.8, w: 3.33, h: 0.7,
    fill: grad(BLUE, PURPLE), rectRadius: 0.35
  });
  s.addText('Questions?', {
    x: 5.0, y: 5.8, w: 3.33, h: 0.7,
    fontSize: 22, fontFace: 'Inter', bold: true, color: WHITE, align: 'center', valign: 'middle'
  });
}

// ============================================================================
const filename = 'Orchestrator-Deck.pptx';
await pptx.writeFile({ fileName: filename });
console.log(`✓ Generated ${filename} — ${pptx.slides.length} slides`);
