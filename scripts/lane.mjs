import { spawn } from "node:child_process";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
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
const localPath = resolve(root, "lanes.local.json");
const local = existsSync(localPath) ? JSON.parse(readFileSync(localPath, "utf8")) : {};
const spec = resolveLane(values.lane, cfg, local);
if (!spec?.provider || !spec?.model || !spec?.effort) fail("lanes.json is missing this lane.");

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function authInventory() {
  const home = homedir();
  const found = [];
  const claude = readJson(join(home, ".claude", ".credentials.json"));
  if (claude?.claudeAiOauth?.accessToken) found.push({ provider: "claude", mode: "oauth" });
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) found.push({ provider: "claude", mode: "key" });
  const codex = readJson(join(home, ".codex", "auth.json"));
  if (codex?.auth_mode === "chatgpt" && codex?.tokens?.access_token) found.push({ provider: "codex", mode: "oauth" });
  if (process.env.OPENAI_API_KEY || codex?.OPENAI_API_KEY) found.push({ provider: "codex", mode: "key" });
  const grok = readJson(join(home, ".grok", "auth.json"));
  const grokEntry = grok && Object.values(grok).find((entry) => entry && typeof entry === "object");
  if (grokEntry?.auth_mode === "oidc") found.push({ provider: "grok", mode: "oauth" });
  if (grokEntry?.auth_mode === "api_key" || process.env.XAI_API_KEY) found.push({ provider: "grok", mode: "key" });
  return found;
}

function providerForModel(model) {
  if (model.startsWith("claude")) return "claude";
  if (model.startsWith("gpt")) return "codex";
  if (model.startsWith("grok")) return "grok";
  return null;
}

function hasAuth(inventory, provider, mode) {
  return inventory.some((item) => item.provider === provider && (mode === "auto" || item.mode === mode));
}

function sharedAuth(inventory) {
  const order = [
    ["claude", "oauth"], ["claude", "key"],
    ["grok", "oauth"], ["grok", "key"],
    ["codex", "oauth"], ["codex", "key"],
  ];
  for (const [provider, mode] of order) {
    if (hasAuth(inventory, provider, mode)) return { provider, mode };
  }
  return null;
}

function resolveLane(lane, fileCfg, localCfg) {
  const agents = fileCfg.agents || fileCfg;
  const base = agents[lane];
  if (!base) return null;
  const over = localCfg.agents?.[lane] || {};
  const inventory = authInventory();
  const defaultModel = fileCfg.defaultModel || "claude-opus-5-5";
  const model = over.model || base.model || defaultModel;
  let provider = over.provider || base.provider || providerForModel(model);
  const authWant = over.auth || base.auth || "auto";
  let auth = null;
  let shared = false;
  if (provider && hasAuth(inventory, provider, authWant)) {
    auth = inventory.find((item) => item.provider === provider && (authWant === "auto" || item.mode === authWant));
  } else {
    auth = sharedAuth(inventory);
    shared = true;
    if (auth) provider = auth.provider;
  }
  const nativeModel = { claude: defaultModel, codex: "gpt-6-astra", grok: "grok-4.7" };
  let modelOut = over.model || base.model || defaultModel;
  if (!over.model && !base.model && provider && provider !== providerForModel(defaultModel)) {
    modelOut = nativeModel[provider] || defaultModel;
  }
  return {
    provider,
    model: modelOut,
    effort: over.effort || base.effort || fileCfg.defaultEffort || "xhigh",
    maxTokens: over.maxTokens || base.maxTokens || fileCfg.defaultMaxTokens || 128000,
    authMode: auth?.mode || "missing",
    authShared: shared,
    jobs: base.jobs || [],
  };
}

function writeReceipt(status, exitCode, argv, elapsedS, note) {
  const body = {
    status,
    lane: values.lane,
    parent: values.parent,
    provider: spec.provider,
    model: spec.model,
    effort: spec.effort,
    authMode: spec.authMode,
    authShared: spec.authShared,
    mode: values.mode,
    promptFile,
    outFile,
    exitCode,
    argv,
    elapsedS,
    note: note || "The argv records the requested model and effort. It does not record hidden reasoning depth.",
  };
  if (spec.maxTokens) body.maxTokens = spec.maxTokens;
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
