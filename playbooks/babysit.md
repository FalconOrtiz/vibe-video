### Babysit

Drive one in-flight render or conform until the engine check passes or a blocker is named. This playbook does not redesign.

1. Read `execute-status.json` and the engine row. Identify the running command or the Resolve timeline.
2. Do the work on the Grok lane. Poll the retained process or the engine status. Do not open a second render for the same output path.
3. On a tool failure, fix the command or the project file when the fix is the same build. A style change is out of this playbook. Stop and name the gap.
4. When the engine check passes, run `scripts/score-fidelity.mjs` if `source.json` and `applied.json` exist. Update `execute-status.json`.
5. Report the check name, the pass or the blocker, and the media path.

A babysit starts only when the operator asks to watch a render, get a cut green, or finish a conform already in flight.
