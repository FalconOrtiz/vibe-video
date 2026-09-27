# Fidelity

A replicate copies the edit grammar onto other footage. It does not copy the source's absolute timestamps onto a video of a different length. Same-timeline work, such as one effect at a named time, keeps the target clock in the design.

`1` means the strict carrier set matches. `0.8` means the style carrier set matches. The sets, the density windows, and the aspect rule are in `scripts/score-fidelity.mjs`. Run that script. Quote its JSON. Do not invent a percentage beside it.

A passing `0.8` still prints strict gaps. Keep those gaps in the report. The operator uses them to decide whether to climb from `0.8` to `1`.

`retargetCanvas: true` records an aspect change the operator asked for. A silent aspect change fails the style set.

Frame-pixel identity is not a carrier. Viewers score pacing, transitions, type entrances, grade, and sound balance. When both documents have `resources`, the score also compares screen-recording effect, motion-graphic style, motion-graphic type, transition name, HUD type, and LUT name. A replaced logo name is not a miss. A generative restyle of the photographed world is a different job. Do it only when the operator asks to replace picture content.

A score without an `applied` document is not a result.
