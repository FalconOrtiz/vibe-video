import { spawn } from "node:child_process";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    lane: { type: "string" },
    parent: { type: "string" },
    mode: { type: "string", default: "read-only" },
    cwd: { type: "string" },
    "prompt-file": { type: "string" },
    "out-file": { type: "string" },
    receipt: { type: "string" },
    "dry-run": { type: "boolean", default: false },
    force: { type: "boolean", default: false },
  },
});

const lanes = new Set(["astra", "opus", "grok"]);
const parents = new Set(["grok", "claude", "codex"]);
const modes = new Set(["read-only", "workspace"]);

function fail(message) {
  console.error(message);
  process.exit(1);
}

for (const key of ["lane", "parent", "cwd", "prompt-file", "out-file", "receipt"]) {
  if (!values[key]) fail(`Missing --${key}.`);
}
if (!lanes.has(values.lane)) fail("Lane must be astra, opus, or grok.");
if (!parents.has(values.parent)) fail("Parent must be grok, claude, or codex.");
if (!modes.has(values.mode)) fail("Mode must be read-only or workspace.");

const promptFile = resolve(values["prompt-file"]);
const outFile = resolve(values["out-file"]);
const receipt = resolve(values.receipt);
const project = resolve(values.cwd);
if (!existsSync(promptFile)) fail("Prompt file is missing.");
if (!existsSync(project)) fail("Project directory is missing.");
if (/[/\\]windows[/\\]system32[/\\]?$/i.test(project)) {
  fail("Refusing the operating-system directory as the video project.");
}
if (!values.force && (existsSync(outFile) || existsSync(receipt))) {
  fail("Output or receipt already exists. Pass --force only to replace a dead attempt.");
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cfg = JSON.parse(readFileSync(resolve(root, "lanes.json"), "utf8"));
const spec = cfg[values.lane];
if (!spec?.provider || !spec?.model || !spec?.effort) fail("lanes.json is missing this lane.");

function writeReceipt(status, exitCode, argv, elapsedS, note) {
  const body = {
    status,
    lane: values.lane,
    parent: values.parent,
    provider: spec.provider,
    model: spec.model,
    effort: spec.effort,
    mode: values.mode,
    promptFile,
    outFile,
    exitCode,
    argv,
    elapsedS,
    note: note || "The argv records the requested model and effort. It does not record hidden reasoning depth.",
  };
  writeFileSync(receipt, JSON.stringify(body, null, 2));
}

if (values.parent === spec.provider) {
  writeReceipt("native", 3, [], 0);
  console.log("native lane: do this work in the parent session");
  process.exit(3);
}

const permission = values.mode === "workspace" ? "acceptEdits" : "plan";
let exe = spec.provider;
let argv = [];
let feedPrompt = false;
if (spec.provider === "codex") {
  const sandbox = values.mode === "workspace" ? "workspace-write" : "read-only";
  argv = [
    "exec", "-m", spec.model,
    "-c", `model_reasoning_effort="${spec.effort}"`,
    "-s", sandbox,
    "-C", project,
    "--skip-git-repo-check", "--ephemeral",
    "-o", outFile,
    "-",
  ];
  feedPrompt = true;
} else if (spec.provider === "claude") {
  argv = [
    "-p",
    "--model", spec.model,
    "--effort", spec.effort,
    "--output-format", "json",
    "--no-session-persistence",
    "--disable-slash-commands",
    "--permission-mode", permission,
  ];
  feedPrompt = true;
} else if (spec.provider === "grok") {
  const sandbox = values.mode === "workspace" ? "workspace" : "read-only";
  argv = [
    "-m", spec.model,
    "--prompt-file", promptFile,
    "--reasoning-effort", spec.effort,
    "--output-format", "json",
    "--permission-mode", permission,
    "--sandbox", sandbox,
  ];
}

if (values["dry-run"]) {
  writeReceipt("dry-run", 0, argv, 0);
  console.log([exe, ...argv].join(" "));
  process.exit(0);
}

const started = Date.now();
const child = spawn(exe, argv, {
  cwd: project,
  stdio: feedPrompt ? ["pipe", "pipe", "pipe"] : ["ignore", "pipe", "pipe"],
  shell: false,
});
if (feedPrompt) child.stdin.end(readFileSync(promptFile));
let stdout = "";
let stderr = "";
child.stdout.on("data", (chunk) => { stdout += chunk; });
child.stderr.on("data", (chunk) => { stderr += chunk; });
child.on("error", (error) => {
  const elapsed = Math.round((Date.now() - started) / 10) / 100;
  writeReceipt("dropout", 127, argv, elapsed, error.message);
  console.error(error.message);
  process.exit(127);
});
child.on("close", (code) => {
  const elapsed = Math.round((Date.now() - started) / 10) / 100;
  const exitCode = code ?? 1;
  if (spec.provider === "claude" || spec.provider === "codex") {
    writeFileSync(outFile, stdout);
  } else {
    writeFileSync(outFile, stdout);
  }
  if (stderr) writeFileSync(`${outFile}.err`, stderr);
  writeReceipt(exitCode === 0 ? "complete" : "dropout", exitCode, argv, elapsed);
  process.exit(exitCode);
});
