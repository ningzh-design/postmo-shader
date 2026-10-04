# postmo-shader

Write shaders for [Postmo](https://postmo.pages.dev) with an AI.

- `SKILL.md`: an Agent Skill (Claude Code, Claude.ai and other tools that read skills).
  Put this folder in your skills directory, or point your tool at it.
- `postmo-shader.txt`: the same rules as plain text, to paste into any AI chat.
  (Postmo's code window has it too: name menu → Copy AI instructions.)
- `reference.md`: every uniform and function Postmo gives a shader.
- `examples/`: shaders that loop (Rings, Flow, Tiles, Ripple) and one that plays over time (Drift).
- `postmo-shader check`: compiles a shader with Postmo's own renderer in headless
  Chrome and reports what Postmo would say: errors by line, params and colours,
  whether it loops, whether the seed changes it, what a frame costs. It writes
  PNG frames to `./postmo-check/<name>/` so you (or the AI) can look.

```bash
npx postmo-shader check my-shader.glsl
```

It uses Google Chrome when installed, otherwise Playwright's Chromium
(`npx playwright install chromium`). The renderer is Postmo's own: the check
downloads it from `https://postmo.pages.dev/kit/runner.js` and caches it in
`~/.cache/postmo-shader/`, so it always matches the live editor and works
offline after the first run. It is Postmo's code, not part of this package
or its licence.

Options: `--out dir`, `--size 540x675`, `--param key=value` (repeatable),
`--json`, and `--runner path-or-url` (or `POSTMO_RUNNER`) to check against
another build of Postmo.

## In Postmo

Paste the code onto the canvas, drop the `.glsl` file onto it, or use Open (⌘O).
Params declared with `// @param` become sliders; colours with `// @color` become swatches.

The syntax version is in each file as `// @postmo 1`.
