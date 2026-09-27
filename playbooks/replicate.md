### Replicate

Copy a source edit's grammar onto a target at `0.8` or `1`.

1. Confirm the source, the target footage, and the fidelity number. Default the number to `0.8` when the operator says "the same style" and does not say 100%. Use `1` when they say 100% or "exact".
2. Run the deconstruct playbook on the source.
3. Run picture probe, loudness, and subtitle search on the target together. Wait for all three.
4. Run the redesign playbook. The brief includes the target probe paths and the fidelity number.
5. Run the execute playbook.
6. Report `score.json` in full enough to show `pass`, `target`, and both gap lists.

Do not call the result 100% or 80% unless `score.json` has `"pass": true` for that target.
