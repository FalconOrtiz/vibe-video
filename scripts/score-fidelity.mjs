import { readFileSync } from "node:fs";

// Carrier rules live here. references/fidelity.md points at this file.

function carriers(doc) {
  const transitions = [];
  const animIn = [];
  const animOut = [];
  for (const track of doc.tracks ?? []) {
    for (const clip of track.clips ?? []) {
      if (track.kind === "transition" || track.kind === "picture" || track.kind === "overlay") {
        for (const name of clip.fx ?? []) transitions.push(name);
      }
      if (track.kind === "type") {
        if (clip.animIn) animIn.push(clip.animIn);
        if (clip.animOut) animOut.push(clip.animOut);
      }
    }
  }
  const cuts = (doc.clocks ?? []).filter((clock) => clock.kind === "cut").length;
  const width = doc.canvas.width;
  const height = doc.canvas.height;
  const aspect = width === height ? "square" : width > height ? "horizontal" : "vertical";
  return {
    canvas: { width, height, fps: doc.canvas.fps, aspect },
    subtitle: doc.subtitle?.mode ?? null,
    grade: doc.grade?.name ?? null,
    eq: doc.audio?.eq ?? null,
    balance: doc.audio?.balance ?? null,
    loudness: Number.isFinite(doc.audio?.loudnessLUFS) ? doc.audio.loudnessLUFS : null,
    transitions,
    animIn,
    animOut,
    cutDensity: doc.canvas.durationS > 0 ? cuts / doc.canvas.durationS : null,
    retargetCanvas: doc.retargetCanvas === true,
  };
}

function multi(list) {
  return [...list].sort().join("|");
}

function setOf(list) {
  return [...new Set(list)].sort().join("|");
}

function densityClose(source, applied, ratio) {
  if (source == null || source === 0) return { ok: true, skipped: true };
  if (applied == null) return { ok: false, skipped: false };
  const delta = Math.abs(applied - source) / source;
  return { ok: delta <= ratio, skipped: false, delta };
}

const sourcePath = process.argv[2];
const appliedPath = process.argv[3];
if (!sourcePath || !appliedPath) {
  console.error("usage: node score-fidelity.mjs <source.json> <applied.json>");
  process.exit(1);
}

const sourceDoc = JSON.parse(readFileSync(sourcePath, "utf8"));
const appliedDoc = JSON.parse(readFileSync(appliedPath, "utf8"));
const target = appliedDoc.fidelity?.target;
if (target !== 0.8 && target !== 1) {
  console.error("applied fidelity.target must be 0.8 or 1");
  process.exit(1);
}

const source = carriers(sourceDoc);
const applied = carriers(appliedDoc);
const strictGaps = [];
const styleGaps = [];

if (source.canvas.width !== applied.canvas.width || source.canvas.height !== applied.canvas.height) {
  strictGaps.push(`canvas ${source.canvas.width}x${source.canvas.height} vs ${applied.canvas.width}x${applied.canvas.height}`);
}
if (Math.abs(source.canvas.fps - applied.canvas.fps) > 0.01) {
  strictGaps.push(`fps ${source.canvas.fps} vs ${applied.canvas.fps}`);
}
if (!applied.retargetCanvas && source.canvas.aspect !== applied.canvas.aspect) {
  styleGaps.push(`aspect ${source.canvas.aspect} vs ${applied.canvas.aspect}`);
}
if (applied.retargetCanvas && source.canvas.aspect !== applied.canvas.aspect) {
  styleGaps.push(`canvas retarget ${source.canvas.aspect} to ${applied.canvas.aspect}`);
}

function same(label, a, b, gaps) {
  if (a == null && b == null) return;
  if (a !== b) gaps.push(`${label} ${a} vs ${b}`);
}

same("subtitle", source.subtitle, applied.subtitle, strictGaps);
same("subtitle", source.subtitle, applied.subtitle, styleGaps);
same("grade", source.grade, applied.grade, strictGaps);
same("grade", source.grade, applied.grade, styleGaps);
same("eq", source.eq, applied.eq, strictGaps);
same("balance", source.balance, applied.balance, strictGaps);
same("eq", source.eq, applied.eq, styleGaps);
same("balance", source.balance, applied.balance, styleGaps);

if (source.loudness != null && applied.loudness != null && Math.abs(source.loudness - applied.loudness) > 1) {
  const line = `loudness ${source.loudness} vs ${applied.loudness}`;
  strictGaps.push(line);
  styleGaps.push(line);
}

if (multi(source.transitions) !== multi(applied.transitions)) {
  strictGaps.push(`transitions ${multi(source.transitions)} vs ${multi(applied.transitions)}`);
}
if (setOf(applied.transitions) !== "" && setOf(source.transitions).length) {
  const sourceNames = new Set(source.transitions);
  for (const name of new Set(applied.transitions)) {
    if (!sourceNames.has(name)) styleGaps.push(`transition not in source: ${name}`);
  }
} else if (multi(source.transitions) !== multi(applied.transitions)) {
  styleGaps.push(`transitions ${multi(source.transitions)} vs ${multi(applied.transitions)}`);
}

if (multi(source.animIn) !== multi(applied.animIn)) {
  strictGaps.push(`animIn ${multi(source.animIn)} vs ${multi(applied.animIn)}`);
}
if (setOf(source.animIn) !== setOf(applied.animIn)) {
  styleGaps.push(`animIn set ${setOf(source.animIn)} vs ${setOf(applied.animIn)}`);
}
if (multi(source.animOut) !== multi(applied.animOut)) {
  strictGaps.push(`animOut ${multi(source.animOut)} vs ${multi(applied.animOut)}`);
}
if (setOf(source.animOut) !== setOf(applied.animOut)) {
  styleGaps.push(`animOut set ${setOf(source.animOut)} vs ${setOf(applied.animOut)}`);
}

function resourceTypes(doc) {
  if (!doc.resources) return null;
  const bag = doc.resources;
  return {
    screen: (bag.screenRecordings ?? []).map((item) => item.effect).filter(Boolean),
    motion: (bag.motionGraphics ?? []).map((item) => `${item.style}/${item.type}`).filter((item) => item !== "/"),
    transition: (bag.transitions ?? []).map((item) => item.name).filter(Boolean),
    hud: (bag.hud ?? []).map((item) => item.type).filter(Boolean),
    lut: (bag.luts ?? []).map((item) => item.name).filter(Boolean),
  };
}

const sourceResources = resourceTypes(sourceDoc);
const appliedResources = resourceTypes(appliedDoc);
if (sourceResources && appliedResources) {
  for (const key of ["screen", "motion", "transition", "hud", "lut"]) {
    if (multi(sourceResources[key]) !== multi(appliedResources[key])) {
      strictGaps.push(`resource ${key} ${multi(sourceResources[key])} vs ${multi(appliedResources[key])}`);
    }
    const known = new Set(sourceResources[key]);
    for (const name of new Set(appliedResources[key])) {
      if (!known.has(name)) styleGaps.push(`resource ${key} not in source: ${name}`);
    }
  }
}

const strictDensity = densityClose(source.cutDensity, applied.cutDensity, 0.15);
const styleDensity = densityClose(source.cutDensity, applied.cutDensity, 0.25);
if (!strictDensity.ok) strictGaps.push(`cut density outside 15% (${source.cutDensity} vs ${applied.cutDensity})`);
if (!styleDensity.ok) styleGaps.push(`cut density outside 25% (${source.cutDensity} vs ${applied.cutDensity})`);

const strictPass = strictGaps.length === 0;
const stylePass = styleGaps.length === 0;
const pass = target === 1 ? strictPass : stylePass;
const report = {
  target,
  pass,
  strict: { pass: strictPass, gaps: strictGaps },
  style: { pass: stylePass, gaps: styleGaps },
};
console.log(JSON.stringify(report, null, 2));
process.exit(pass ? 0 : 2);
