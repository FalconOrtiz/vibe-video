# Edit model

`scripts/check-edit-model.mjs` is the gate. A document that fails the gate is not a model. Read `examples/source.min.json` for a valid source.

Write one JSON file per artifact. Do not merge a source model and a design into one file.

| `kind` | Who writes it | What it is |
|---|---|---|
| `source` | Astra, after the probe files exist | The source edit, on the source clock |
| `design` | Opus | The edit to build, on the target clock |
| `applied` | Grok, after the build | What the build actually contains |
| `execute-status` | Grok | Engine name, output paths, and check rows |

`schemaVersion` is `1`.

`canvas` has `width`, `height`, `fps`, and `durationS`. Duration is the program being described. A replicate onto a longer video has a longer design duration. That is not a style miss.

`subtitle.mode` is `none`, `burned`, or `sidecar`. Use `burned` only when a frame sample or the operator shows text in the picture. A sidecar file is `sidecar`. Unknown is not a mode. Leave the field unset only when the probe did not look. The gate requires the field, so look, then choose.

`grade.name` is the log or display profile the operator or Resolve reports, such as `s-log3` or `rec709`. Do not invent a profile name.

`audio` may include `eq`, `balance`, and `loudnessLUFS`.

`retargetCanvas` on a design or applied document is `true` only when the operator asked for a different aspect.

`fidelity.target` on a design or applied document is `0.8` or `1`.

`clocks[]` records time. Each clock has `id`, `kind`, `tIn`, and `tOut` with `tOut` greater than `tIn`. Kinds are `beat`, `word`, `hit`, `cut`, and `scene`.

`tracks[]` records picture. Each track has `id`, `kind`, and `clips`. Kinds are `picture`, `overlay`, `type`, `audio`, `grade`, `subtitle`, `d3`, `ai`, and `transition`.

Each clip has `id`, `tIn`, and `tOut`. Add `src`, `inPoint`, `animIn`, `animOut`, `fx`, `blend`, and `transform` when the probe or the design has them. `fx` is a list of effect names. `animIn` and `animOut` name the entrance and the exit.

`resources` is the scene inventory. The checker owns the key list and prints one count per key. Every array is present. An empty array means the pass looked and found none. A missing key means the pass did not look.

| Key | Count these | Each item has |
|---|---|---|
| `logos` | A distinct mark on screen | `name`, `tIn`, `tOut` |
| `screenRecordings` | A captured display | `effect`, `tIn`, `tOut` |
| `transitions` | A join between shots | `name`, `tIn` |
| `luts` | A named look-up table | `name` |
| `colorCorrection` | A grade pass | `tool` |
| `hsl` | A hue, saturation, or luminance qualifier | `target` |
| `motionGraphics` | A designed graphic | `style`, `type`, `tIn`, `tOut` |
| `sfx` | A named sound hit | `name`, `tIn` |
| `fx` | A picture effect | `name`, `tIn`, `tOut` |
| `hud` | A frame, reticle, or status graphic drawn over picture | `type`, `tIn`, `tOut` |

`screenRecordings[].effect` uses `full-frame`, `pip`, `cursor-zoom`, `device-frame`, `masked-cam`, or `callout`. Add a plain word when none of those fit. `motionGraphics.style` names the look, such as `handwritten`, `engraved`, `flat`, `glass`, or `gold-stroke`. `motionGraphics.type` names the job, such as `title`, `diagram`, `kinetic-type`, `sticker`, `logo-sting`, or `lower-third`.

Name a LUT, an HSL target, or an SFX only when a grade file, a Resolve read, or an isolated hit supports it. An onset list is not an SFX list. A logo inside a screen recording is still a logo. The product's own chrome stays on the screen-recording item as `embeddedHud: true`. A frame you draw on top is a `hud` item.

Ids are unique in the document.

An `execute-status` document has `engine`, `outputs` (path strings), and `checks` (`name` plus boolean `ok`). It does not carry clocks.
