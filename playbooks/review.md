### Review

Read-only. The reviewer is not the lane that executed.

1. Read `source.json`, `design.json`, `applied.json`, and `score.json`.
2. Start two lanes together. Astra checks fidelity against the source and writes `review-fidelity.json` with `agree` and `disputes` (strings that quote score gaps). Opus checks taste against the design and writes `review-taste.json` with `agree` and `disputes`.
3. Wait for both receipts.
4. The parent writes the report. A dispute names the file and the field. A dispute without a field is dropped.
5. Do not edit the project in this playbook.

Grok does not review an execute it performed in the same session. When the parent is Grok, both review lanes are Astra and Opus.
