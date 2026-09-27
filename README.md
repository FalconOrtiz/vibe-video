# vibe-video

Installable agent skill for vibe editing. It measures a source edit, writes that grammar as JSON, and rebuilds it on other footage. The MP4 is one output. The project files stay editable.

The tree matches a skill package: `SKILL.md`, `playbooks/`, `references/`, `scripts/`, and `examples/`.

## Install

Node.js 22 or newer is required. `ffprobe` must be on `PATH` before a probe. Codex, Claude, and Grok CLIs are required only for the lane you launch.

Copy the repository, then install. `npm install` also installs the Remotion agent skills (`remotion-dev/skills`) into this project.

```bash
git clone https://github.com/FalconOrtiz/vibe-video.git
cd vibe-video
npm install
```

Claude Code, Codex, or Grok can also load the skill with:

```bash
npx skills add FalconOrtiz/vibe-video
```

A manual copy of the skill directory still needs `npm install` in that copy so the Remotion skills install.

The skill directory on each host:

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

`lanes.json` sets one default model for every lane: `claude-opus-5-5` at `xhigh`. Copy `lanes.local.example.json` to `lanes.local.json` when one lane needs its own provider, model, `oauth` / `key` login, or a subscription. Cursor Ultra and OpenCode are subscriptions: one login can run many models, and the lane keeps the model you named. A lane with no login and no subscription falls back to the first key or OAuth on the machine, and every lane uses that login's model.
