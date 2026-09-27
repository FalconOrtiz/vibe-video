### Redesign

The deliverable is `design` JSON. This playbook does not render.

1. Read `source.json`. If it is missing, run the deconstruct playbook first.
2. Read the operator brief: target footage, fidelity `0.8` or `1`, canvas change, and the engine if they named one.
3. Read `references/engines.md` and pick the engine row.
4. Launch the Opus lane in read-only mode. Give it `source.json`, the brief, and `references/edit-model.md`. Opus returns one `design` document on the target clock.
5. Run `scripts/check-edit-model.mjs`. One repair pass on failure. A second failure stops.
6. Save the passing document as `design.json`.
7. Report the engine, the fidelity target, `retargetCanvas`, the resource counts, and every carrier the design changes on purpose. Keep each source resource type. Replace logo names, screen contents, and caption text with the target's own. Do not drop a screen-recording effect, a motion-graphic style, a transition name, or a HUD type to make the swap easier.

A Falcon brand talking-head package stops here and hands `design.json` plus the A-roll to the `vibe-video-edit` skill. Do not author that brand layout in this playbook.
