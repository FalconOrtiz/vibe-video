### Point of view

One stance on one cut choice.

1. Read `source.json` or run analysis first when no model exists.
2. Name the single choice in the prompt (a transition, an entrance, a grade, a canvas).
3. Launch Opus in read-only mode. Opus returns `choice`, `because` (fields it used), and `cost` (what the other option keeps).
4. Report that object. Do not start a redesign unless the operator asks for one.

Astra does not override the stance. When the stance cites a field the source model does not contain, say the field is missing and stop.
