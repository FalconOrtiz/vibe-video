import { readFileSync } from "node:fs";

const CLOCK = new Set(["beat", "word", "hit", "cut", "scene"]);
const TRACK = new Set([
  "picture",
  "overlay",
  "type",
  "audio",
  "grade",
  "subtitle",
  "d3",
  "ai",
  "transition",
]);
const KIND = new Set(["source", "design", "applied", "execute-status"]);
const SUBTITLE = new Set(["none", "burned", "sidecar"]);
const RESOURCE_KEYS = [
  "logos",
  "screenRecordings",
  "transitions",
  "luts",
  "colorCorrection",
  "hsl",
  "motionGraphics",
  "sfx",
  "fx",
  "hud",
];
const RESOURCE_FIELDS = {
  logos: ["name"],
  screenRecordings: ["effect"],
  transitions: ["name"],
  luts: ["name"],
  colorCorrection: ["tool"],
  hsl: ["target"],
  motionGraphics: ["style", "type"],
  sfx: ["name"],
  fx: ["name"],
  hud: ["type"],
};
const RESOURCE_SPAN = new Set(["logos", "screenRecordings", "motionGraphics", "fx", "hud"]);

function fail(errors) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

const file = process.argv[2];
if (!file) fail(["usage: node check-edit-model.mjs <file.json>"]);

let doc;
try {
  doc = JSON.parse(readFileSync(file, "utf8"));
} catch (error) {
  fail([`invalid json: ${error.message}`]);
}

const errors = [];
const need = (ok, message) => {
  if (!ok) errors.push(message);
};

need(doc.schemaVersion === 1, "schemaVersion must be 1");
need(KIND.has(doc.kind), "kind is not a known document kind");

if (doc.kind === "execute-status") {
  need(typeof doc.engine === "string" && doc.engine.length > 0, "engine required");
  need(Array.isArray(doc.outputs), "outputs must be an array");
  need(Array.isArray(doc.checks), "checks must be an array");
  for (const [index, check] of (doc.checks ?? []).entries()) {
    need(
      check && typeof check.name === "string" && typeof check.ok === "boolean",
      `checks[${index}] needs name and ok`,
    );
  }
  if (errors.length) fail(errors);
  console.log("ok");
  process.exit(0);
}

const canvas = doc.canvas;
need(
  canvas &&
    Number.isFinite(canvas.width) &&
    Number.isFinite(canvas.height) &&
    Number.isFinite(canvas.fps) &&
    Number.isFinite(canvas.durationS) &&
    canvas.width > 0 &&
    canvas.height > 0 &&
    canvas.fps > 0 &&
    canvas.durationS > 0,
  "canvas width, height, fps, and durationS must be numbers above 0",
);
need(doc.subtitle && SUBTITLE.has(doc.subtitle.mode), "subtitle.mode must be none, burned, or sidecar");
need(Array.isArray(doc.clocks), "clocks must be an array");
need(Array.isArray(doc.tracks), "tracks must be an array");

const ids = new Set();
function takeId(id, where) {
  need(typeof id === "string" && id.length > 0, `${where} id required`);
  if (typeof id !== "string") return;
  need(!ids.has(id), `duplicate id ${id}`);
  ids.add(id);
}

for (const [index, clock] of (doc.clocks ?? []).entries()) {
  takeId(clock?.id, `clocks[${index}]`);
  need(CLOCK.has(clock?.kind), `clocks[${index}].kind invalid`);
  need(
    Number.isFinite(clock?.tIn) && Number.isFinite(clock?.tOut) && clock.tOut > clock.tIn,
    `clocks[${index}] tOut must be greater than tIn`,
  );
}

for (const [index, track] of (doc.tracks ?? []).entries()) {
  takeId(track?.id, `tracks[${index}]`);
  need(TRACK.has(track?.kind), `tracks[${index}].kind invalid`);
  need(Array.isArray(track?.clips), `tracks[${index}].clips must be an array`);
  for (const [clipIndex, clip] of (track?.clips ?? []).entries()) {
    takeId(clip?.id, `tracks[${index}].clips[${clipIndex}]`);
    need(
      Number.isFinite(clip?.tIn) && Number.isFinite(clip?.tOut) && clip.tOut > clip.tIn,
      `tracks[${index}].clips[${clipIndex}] tOut must be greater than tIn`,
    );
  }
}

if (doc.kind === "design" || doc.kind === "applied") {
  need(
    doc.fidelity && (doc.fidelity.target === 0.8 || doc.fidelity.target === 1),
    "fidelity.target must be 0.8 or 1",
  );
}

need(doc.resources && typeof doc.resources === "object", "resources object required");
const resources = doc.resources ?? {};
for (const key of RESOURCE_KEYS) {
  need(Array.isArray(resources[key]), `resources.${key} must be an array`);
  for (const [index, item] of (resources[key] ?? []).entries()) {
    const where = `resources.${key}[${index}]`;
    takeId(item?.id, where);
    for (const field of RESOURCE_FIELDS[key]) {
      need(typeof item?.[field] === "string" && item[field].length > 0, `${where}.${field} required`);
    }
    if (RESOURCE_SPAN.has(key) || key === "transitions" || key === "sfx") {
      need(Number.isFinite(item?.tIn), `${where}.tIn required`);
    }
    if (RESOURCE_SPAN.has(key)) {
      need(Number.isFinite(item?.tOut) && item.tOut > item.tIn, `${where} tOut must be greater than tIn`);
    } else if (Number.isFinite(item?.tOut)) {
      need(item.tOut > item.tIn, `${where} tOut must be greater than tIn`);
    }
  }
}

if (errors.length) fail(errors);
const counts = RESOURCE_KEYS.map((key) => `${key}=${resources[key].length}`).join(" ");
console.log("ok");
console.log(`resources ${counts}`);
