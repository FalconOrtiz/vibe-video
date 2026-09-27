import { spawn } from "node:child_process";
import { createWriteStream, existsSync } from "node:fs";
import { parseArgs } from "node:util";

const { values } = parseArgs({
  options: {
    input: { type: "string" },
    out: { type: "string" },
  },
});

if (!values.input || !values.out) {
  console.error("Usage: node scripts/probe-media.mjs --input <media> --out <probe.json>");
  process.exit(1);
}
if (!existsSync(values.input)) {
  console.error("Media file is missing.");
  process.exit(1);
}

const ffprobe = process.env.VIBE_FFPROBE || "ffprobe";
const child = spawn(ffprobe, [
  "-hide_banner", "-v", "error",
  "-print_format", "json",
  "-show_format", "-show_streams",
  "--", values.input,
], { stdio: ["ignore", "pipe", "inherit"] });

const out = createWriteStream(values.out);
child.stdout.pipe(out);
child.on("error", (error) => {
  console.error(`ffprobe is missing (${ffprobe}). Set VIBE_FFPROBE or put ffprobe on PATH. ${error.message}`);
  process.exit(1);
});
child.on("close", (code) => {
  if (code !== 0) {
    console.error(`ffprobe failed with exit ${code}`);
    process.exit(code ?? 1);
  }
  console.log(values.out);
});
