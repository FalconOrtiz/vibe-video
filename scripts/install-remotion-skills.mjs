import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const result = spawnSync(
  "npx",
  ["--yes", "skills", "add", "remotion-dev/skills", "--skill", "*", "--agent", "claude-code", "codex", "grok", "-g", "-y", "--copy"],
  { stdio: "inherit", shell: true },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if ((result.status ?? 1) !== 0) process.exit(result.status ?? 1);

const source = join(homedir(), ".agents", "skills");
const codex = join(homedir(), ".codex", "skills");
if (existsSync(source)) {
  mkdirSync(codex, { recursive: true });
  for (const name of readdirSync(source)) {
    if (!name.startsWith("remotion-")) continue;
    cpSync(join(source, name), join(codex, name), { recursive: true });
    console.log(`copied ${name} -> ${join(codex, name)}`);
  }
}
process.exit(0);
