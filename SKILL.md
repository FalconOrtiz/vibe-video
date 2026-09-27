---
name: vibe-video
description: >
  This skill should be used when the user runs /vibe-video, says "vibe edit" or
  "vibe editing", or asks to reverse engineer, deconstruct, or descomponer a
  video or an edit style, replicate that style at 80% or 100% on other footage,
  apply one effect from a prompt, babysit a render, review a cut, analyze a
  source, give a point of view on a cut, or justify an edit decision. It routes
  GPT-6 Astra, Claude Opus 5.5, and Grok 4.7 across HyperFrames, Remotion,
  ffmpeg, and a connected DaVinci Resolve MCP when the job needs the editor.
---

# Vibe Video

Vibe editing copies an edit's grammar. A source is measured, written as a model, redesigned onto a target, and built with the engine that already fits the job. The MP4 is one output. The project files stay editable.

## Rules

1. Copy the matched playbook's steps into the todolist before other work. A skipped step stays in the list with `skip:` and the reason.
2. Launch foreign lanes only through `scripts/lane.mjs`. Read `references/model-lanes.md` before the first launch.
3. Run `scripts/check-edit-model.mjs` before a later phase reads a model. Run `scripts/score-fidelity.mjs` before saying 80% or 100%.
4. Give each lane its own prompt, output, and receipt. Start lanes that the parallel map marks as together, then wait.
5. Keep DaVinci, Blender, and UEFN calls on the parent. External lanes get files.
6. Follow the engine skill named in `references/engines.md`. Do not restate it.
7. Do not author a video project inside the operating-system directory. On Windows that directory is `C:\WINDOWS\system32`.

## Playbooks

| Operator ask | Playbook |
|---|---|
| Reverse engineer, deconstruct, descomponer, or "what is this edit" saved as a model | `playbooks/deconstruct.md` |
| Redesign the UX, the UI, the type, the grade, or a Remotion composition without rendering | `playbooks/redesign.md` |
| Build the current design | `playbooks/execute.md` |
| Same style on another video, 80%, or 100% | `playbooks/replicate.md` |
| One effect from a sentence or a short reference | `playbooks/effect.md` |
| Babysit a render, get this conform green | `playbooks/babysit.md` |
| Review this cut | `playbooks/review.md` |
| Analysis only, no new edit | `playbooks/analysis.md` |
| Point of view on one cut choice | `playbooks/pov.md` |
| Justify or "why this cut" | `playbooks/justify.md` |

A full replicate is deconstruct, then redesign, then execute. Do not collapse those into one prompt.

## Lanes

| Lane | Does | Does not |
|---|---|---|
| Astra | Read the probes. Write the source model. Answer analysis, fidelity review, and file-based justification | Design the target. Render |
| Opus | Graphic edit: resources, shots, motion graphics, Remotion, UX, UI, and animation. Taste review and point of view stay here | Render the final file. Read the Resolve MCP |
| Grok | Probe, build, babysit, and read live MCPs | Grade its own execute in the review playbook |

Every lane uses `defaultModel` in `lanes.json` unless that lane sets its own `model`. The default is `claude-opus-5-5` at `xhigh`. Copy `lanes.local.example.json` to `lanes.local.json` to set one lane's provider, model, effort, or `auth` (`oauth` or `key`). When a lane has no working login, every lane uses the first available key or OAuth and that login's model.

From a Grok parent, do the Grok lane in this session. Still launch Astra and Opus through the script.

## Files the project keeps

`source.json`, `design.json`, `applied.json`, `score.json`, and `execute-status.json`. Probe JSON stays beside them. Receipts stay beside the lane outputs and are not overwritten.

## Reply

Name the playbook, the engine, the media path, and the score `pass` value when a score exists. List strict gaps and style gaps from `score.json`. Quote the checker `resources` count line. Quote a receipt's model and elapsed seconds when a lane ran. Do not claim a hidden reasoning depth was observed.

## References

- `references/model-lanes.md` for launch, parallel phases, and MCP.
- `references/edit-model.md` for the JSON vocabulary.
- `references/fidelity.md` for what 0.8 and 1 mean.
- `references/engines.md` for ffmpeg, HyperFrames, Remotion, Resolve, After Effects, Premiere, Blender, and UEFN.
- `references/sources.md` for the public posts that fixed these rules.
- `examples/source.min.json` for a valid source document.
- `node scripts/self-test.mjs` to rerun the structural checks. `scripts/self-test.ps1` calls that same file.
