### Effect

One named move, from a prompt or from a short reference, applied at a named time.

1. Write the operator sentence and the target time range into `effect-brief.json` (`name`, `tIn`, `tOut`, `sentence`).
2. If a reference clip exists, run deconstruct on that clip only. Astra's prompt says to keep the one move and drop the rest of the timeline.
3. If the only source is the sentence, launch Astra in read-only mode to emit a one-clip `source` document whose `fx` or `animIn` matches the sentence. Probe nothing that does not exist.
4. Launch Opus in read-only mode to write a `design` that changes only that time range on the target model. Other clips stay as they are.
5. Run the checker on the design.
6. Run execute.
7. Report the effect name, the time range, and the score gaps that belong to that clip.

Several effects that do not share a clip start at step 2 together, one folder per effect. Effects that share a clip run one after another.
