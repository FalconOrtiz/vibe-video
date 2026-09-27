### Execute

The deliverable is the edit plus `applied.json` and `execute-status.json`.

1. Read `design.json`. Run `scripts/check-edit-model.mjs`. Stop if it fails.
2. Read the matching engine row in `references/engines.md` and the skill that row names. Follow that skill for the build. Do not restate it.
3. Do the Grok lane in the parent session when the parent is Grok. Otherwise launch the Grok lane with `-Mode workspace` and a prompt that names the design file and the engine skill path.
4. Build only inside the project directory.
5. Write `applied.json` with `kind` `applied` and the same `fidelity.target` as the design. Run the checker.
6. Run `scripts/score-fidelity.mjs source.json applied.json`. Save the JSON as `score.json`.
7. Write `execute-status.json` and run the checker. `checks` includes the checker, the score script, and the engine check the skill requires (`hyperframes check`, a Remotion render, or a Resolve timeline id).
8. Report the output media path, the score `pass` value, and the gaps.

A failing score stays in the report. Do not change the design inside this playbook to force a pass. Climb by running redesign again with the gaps named.
