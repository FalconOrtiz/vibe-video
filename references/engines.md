# Engines

Pick the first row that matches.

| Condition | Engine | Next read |
|---|---|---|
| The operator names an engine | That engine | The row below for that engine |
| The folder has `hyperframes.json` | HyperFrames | The installed `hyperframes` skill |
| The folder has a Remotion `package.json` | Remotion | Author inside that project |
| A Resolve project is the deliverable, or the job is a log grade on media already in Resolve | DaVinci Resolve | The Resolve section below |
| A `.aep` or `.prproj` is the deliverable | After Effects or Premiere | Record the target. Build only when a live control path exists |
| A `d3` track names Blender | Blender MCP | `search_tool` for `blender` before any call |
| A `d3` track names UEFN | UEFN MCP | `search_tool` for `uefn` before any call |
| No row above matches | HyperFrames | The installed `hyperframes` skill |

ffmpeg is the probe and the mezzanine tool. It is not the editorial engine.

A talking-head rebuild that must keep an existing brand skill hands the build to that skill after `source` JSON passes the gate. Do not restate that skill. On a machine that has `vibe-video-edit`, that skill is the Falcon brand handoff.

## Tools on PATH

- `ffprobe` and `ffmpeg` must be on `PATH`. Set `VIBE_FFPROBE` or `VIBE_FFMPEG` when the binary lives somewhere else.
- HyperFrames CLI is the `hyperframes` command from the HyperFrames install. Read that skill before writing composition HTML.
- Remotion has no required global install. Run `npx remotion` only inside a project that depends on it. A missing project is a dropout when the operator asked for Remotion.
- Do not author a video project inside the operating-system directory. On Windows that directory is `C:\WINDOWS\system32`.

## Probe

Run `node scripts/probe-media.mjs --input <file> --out <probe.json>` before Astra reads a local file. For loudness, run ffmpeg `loudnorm` print mode and save the JSON next to the probe. For beats, detect from the audio file and save timestamps. Astra may name a clock only when a probe file or a frame sample supports it.

Search the folder for `.srt` and `.vtt` before calling subtitles burned.

## HyperFrames and Remotion

Read the HyperFrames skill before writing composition HTML. Load `/hyperframes-core` before timing attributes. Load `/hyperframes-animation`, `/hyperframes-keyframes`, `/hyperframes-audio`, and `/hyperframes-registry` for the feature the design names. Search the registry before hand-building a named look.

Remotion work is a project in the video folder. Opus writes the composition, the shots, and the motion. Grok renders the final file. `npm install` in this repo installs the Remotion agent skills. A port from Remotion source to HyperFrames uses the `remotion-to-hyperframes` skill only when the operator asks to port.

## DaVinci Resolve

Call `search_tool` for `davinci-resolve` before `use_tool`. Use the handshake that the connected server documents. A failed handshake does not move the job to HyperFrames.

Read log profile names from the clip or from the operator. Write that name into `grade.name`.

## After Effects and Premiere

Record the engine on the design when the operator names it. Do not invent a scripting bridge. When no live control path exists, say so and stop that engine. Offer HyperFrames only as a separate decision the operator already made, or leave the design file as the handoff.

## AI plates

A design clip with track kind `ai` is a generated plate. Follow the `imagine` skill for the image or the video plate. Do not describe a plate as camera original.
