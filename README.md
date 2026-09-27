# vibe-video

Installable agent skill for vibe editing. It measures a source edit, writes that grammar as JSON, and rebuilds it on other footage. The MP4 is one output. The project files stay editable.

The tree matches a skill package: `SKILL.md`, `playbooks/`, `references/`, `scripts/`, and `examples/`.

## Install

Node.js 22 or newer is required. `ffprobe` must be on `PATH` before a probe. Codex, Claude, and Grok CLIs are required only for the lane you launch.

Claude Code, Codex, or Grok:

```bash
npx skills add FalconOrtiz/vibe-video
```

A manual install copies this repository into the skill directory:

| Host | Directory |
|---|---|
| Grok | `~/.grok/skills/vibe-video` |
| Claude Code | `~/.claude/skills/vibe-video` |

Restart the session. The slash command is `/vibe-video`.

## Check

```bash
node scripts/self-test.mjs
```

`SELF-TEST OK` is the green state. The check covers the edit-model gate, the fidelity scores, the lane dry-run, and every path named in the skill.

## What the operator says

| Ask | Playbook |
|---|---|
| Reverse engineer or deconstruct | `playbooks/deconstruct.md` |
| Redesign without rendering | `playbooks/redesign.md` |
| Build the current design | `playbooks/execute.md` |
| Same style on another video | `playbooks/replicate.md` |
| One effect | `playbooks/effect.md` |
| Babysit a render | `playbooks/babysit.md` |
| Review a cut | `playbooks/review.md` |
| Analysis only | `playbooks/analysis.md` |
| Point of view | `playbooks/pov.md` |
| Justify a cut | `playbooks/justify.md` |

Model ids live in `lanes.json`. Change that file to pin different model ids. Do not type a model id into a playbook.
