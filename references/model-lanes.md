# Model lanes

`lanes.json` owns the provider, model id, effort, and job list. `scripts/lane.mjs` owns the process flags. `scripts/lane.ps1` calls that same file. Do not type a model id into a playbook or a prompt.

| Lane | Jobs |
|---|---|
| Astra | Deconstruct, analysis, fidelity review, justification from files |
| Opus | Redesign, taste review, point of view |
| Grok | Probe, execute, babysit, justification that needs a live MCP |

## Launch

Give every lane its own prompt file, output file, and receipt. Start independent lanes together. Wait for every receipt before a later phase reads those outputs.

```text
node scripts/lane.mjs --lane astra --parent <grok|claude|codex> --mode read-only --cwd <project> --prompt-file <file> --out-file <file> --receipt <file>
```

`-Parent` is the harness running this skill. When the parent provider equals the lane provider, the script exits 3 and writes a `native` receipt. Do that work in the parent session. From a Grok parent, Astra and Opus still go through the script. The Grok lane does not.

`-Mode read-only` is the default for Astra and Opus. `-Mode workspace` is for a lane that must write the project. Prefer read-only plus an output file the parent saves after `check-edit-model.mjs` passes.

A failed launch writes nothing into the project model. Keep the receipt. A retry uses new output and receipt paths.

The receipt stores the argv, the exit code, and the elapsed seconds. It does not store hidden reasoning depth. A `dry-run` receipt is not a model result.

## Parallel map

| Phase | Together | Then |
|---|---|---|
| Probe | Picture, loudness, and subtitle file search | Astra deconstruct |
| Review | Astra fidelity and Opus taste | Parent report |
| Several named effects with no shared clip | One Astra extract per effect | Opus specs, then Grok applies |

Opus does not start a replicate until the source model passes the gate. Grok does not build until the design passes the gate.

## MCP

External lanes do not receive the parent MCP set. DaVinci Resolve, Blender, and UEFN stay on the parent. When the parent is Grok, the Grok lane reads them. Hand Astra and Opus the probe files and the model files, not a live editor session.

## Prompt shape

Tell the lane to return one JSON document and no other text. Name the schema file and the probe files. Tell it not to launch another agent and not to change the model.
