import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { resolveLane } from "./lane.mjs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let fail = 0;

function expect(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}`);
  if (!ok) fail = 1;
}

function node(args) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  return result.status ?? 1;
}

const laneFile = JSON.parse(readFileSync(join(root, "lanes.json"), "utf8"));
const cursorOnly = [{ provider: "cursor", mode: "oauth" }];
const viaCursor = resolveLane("astra", laneFile, {}, cursorOnly);
expect("cursor subscription keeps the default model", viaCursor.provider === "cursor" && viaCursor.model === "claude-opus-5-5");
const otherModel = resolveLane("astra", laneFile, { agents: { astra: { model: "gpt-6-astra", subscription: "cursor" } } }, cursorOnly);
expect("one subscription can run another model", otherModel.provider === "cursor" && otherModel.model === "gpt-6-astra");
const openOnly = [{ provider: "opencode", mode: "key" }];
const viaOpen = resolveLane("opus", laneFile, {}, openOnly);
expect("opencode subscription keeps the default model", viaOpen.provider === "opencode" && viaOpen.model === "claude-opus-5-5");

expect("source accepts", node(["scripts/check-edit-model.mjs", "examples/source.min.json"]) === 0);
expect("bad clock rejects", node(["scripts/check-edit-model.mjs", "examples/bad.json"]) === 1);
expect("exact match passes strict", node(["scripts/score-fidelity.mjs", "examples/source.min.json", "examples/applied.match.json"]) === 0);
expect("grade miss fails strict", node(["scripts/score-fidelity.mjs", "examples/source.min.json", "examples/applied.grade-miss.json"]) === 2);
expect("scaled style passes 0.8", node(["scripts/score-fidelity.mjs", "examples/source.min.json", "examples/applied.scale.json"]) === 0);

const tmp = mkdtempSync(join(tmpdir(), "vibe-video-"));
const prompt = join(tmp, "prompt.txt");
writeFileSync(prompt, "return json");

function dry(lane, parent, tag) {
  const out = join(tmp, `${tag}.out`);
  const receipt = join(tmp, `${tag}.receipt.json`);
  return node([
    "scripts/lane.mjs",
    "--lane", lane,
    "--parent", parent,
    "--mode", "read-only",
    "--cwd", root,
    "--prompt-file", prompt,
    "--out-file", out,
    "--receipt", receipt,
    "--dry-run",
  ]);
}

expect("astra dry-run from grok", dry("astra", "grok", "astra") === 0);
const astra = readFileSync(join(tmp, "astra.receipt.json"), "utf8");
expect("astra uses the shared default model", astra.includes('"status": "dry-run"') && astra.includes("claude-opus-5-5"));

expect("opus dry-run from grok", dry("opus", "grok", "opus") === 0);
const opus = readFileSync(join(tmp, "opus.receipt.json"), "utf8");
expect("opus argv pins claude-opus-5-5", opus.includes('"status": "dry-run"') && opus.includes("claude-opus-5-5"));

expect("grok lane uses the shared default model", dry("grok", "grok", "grok") === 0);
const grokLane = readFileSync(join(tmp, "grok.receipt.json"), "utf8");
expect("grok lane pins claude-opus-5-5", grokLane.includes("claude-opus-5-5"));

expect("claude parent keeps the lane native", dry("opus", "claude", "native") === 3);
expect("native receipt", readFileSync(join(tmp, "native.receipt.json"), "utf8").includes("native"));

const osDir = process.platform === "win32" ? "C:\\WINDOWS\\system32" : "/usr";
const refused = node([
  "scripts/lane.mjs",
  "--lane", "astra",
  "--parent", "grok",
  "--cwd", osDir,
  "--prompt-file", prompt,
  "--out-file", join(tmp, "os.out"),
  "--receipt", join(tmp, "os.receipt.json"),
  "--dry-run",
]);
expect("os directory refused", refused === 1);

function walk(dir, acc) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      if (name === "examples") continue;
      walk(path, acc);
    } else if (/\.(md|mjs|json|ps1)$/.test(name)) acc.push(path);
  }
}
const files = [];
walk(root, files);
const blob = files.map((path) => readFileSync(path, "utf8")).join("\n");
const refs = [...blob.matchAll(/(?:playbooks|references|scripts|examples)\/[A-Za-z0-9._-]+/g)].map((m) => m[0]);
const missing = [...new Set(refs)].filter((ref) => !statExists(join(root, ref)));
function statExists(path) {
  try { statSync(path); return true; } catch { return false; }
}
expect("skill links resolve", missing.length === 0);
for (const ref of missing) console.log(`MISSING ${ref}`);

rmSync(tmp, { recursive: true, force: true });
if (fail) process.exit(1);
console.log("SELF-TEST OK");
