### Deconstruct

Read-only. The deliverable is `source` JSON for one video or one named style window.

1. Read `references/edit-model.md` and `references/engines.md`.
2. Put the project outside the operating-system directory. On Windows that directory is `C:\WINDOWS\system32`. Copy or download the source there if the only copy is elsewhere. Keep a full download. Do not trim it to make the probe easier.
3. Run `node scripts/probe-media.mjs --input <file> --out <probe.json>` on the picture. Write loudness JSON and a beat list beside it. Search for sidecar subtitle files. Sample frames for burned text, entrances, exits, logos, screen recordings, motion graphics, and HUD.
4. Launch the Astra lane in read-only mode with the probe paths and `references/edit-model.md`. Astra returns one `source` document.
5. Run `scripts/check-edit-model.mjs` on that document. On failure, send Astra the error lines once, to a new output path. A second failure stops the playbook.
6. Save the passing document as `source.json` in the project.
7. Report canvas, clock counts by kind, track kinds, grade name, subtitle mode, and the `resources` count line from the checker. Point at the probe files.

Skip a second model. Opus and Grok do not rewrite a deconstruction.
