import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["--yes", "skills", "add", "remotion-dev/skills", "--skill", "*", "--agent", "claude-code", "codex", "grok", "-y", "--copy"],
  { stdio: "inherit", shell: true },
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status ?? 1);
