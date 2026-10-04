# postmo-shader

Write shaders for [Postmo](https://postmo.dev) with an AI.

- `SKILL.md`: an Agent Skill (Claude Code, Claude.ai and other tools that read skills).
  Put this folder in your skills directory, or point your tool at it.
- `postmo-shader.txt`: the same rules as plain text, to paste into any AI chat.
  (Postmo's code window has it too: name menu → Copy AI instructions.)
- `reference.md`: every uniform and function Postmo gives a shader.
- `examples/`: shaders that loop (Rings, Flow, Tiles, Ripple) and one that plays over time (Drift).
- `bin/check.mjs`: compiles a shader with Postmo's own renderer in headless
  Chrome and reports what Postmo would say: errors by line, params and colours,
  whether it loops, whether the seed changes it, what a frame costs. It writes
  PNG frames to `./postmo-check/<name>/` so you (or the AI) can look.

## Running the check

Needs [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/ningzh-design/postmo-shader.git
cd postmo-shader
npm install
node bin/check.mjs examples/checker.glsl
```

Then check your own file the same way: `node bin/check.mjs path/to/my-shader.glsl`.
It reads what Postmo reads: Postmo's own format, and Shadertoy, WebGL 1 /
The Book of Shaders and ISF code, which Postmo converts on import (the check
says what it changed). A shader without `// @name` is named after its file.

It uses Google Chrome when installed, otherwise Playwright's Chromium
(`npx playwright install chromium`). The renderer is Postmo's own: the check
downloads it from `https://postmo.dev/kit/runner.js` and caches it in
`~/.cache/postmo-shader/`, so it always matches the live editor and works
offline after the first run. It is Postmo's code, not part of this repository
or its licence.

Options: `--out dir`, `--size 540x675`, `--param key=value` (repeatable),
`--json`, and `--runner path-or-url` (or `POSTMO_RUNNER`) to check against
another build of Postmo.

## In Postmo

Paste the code onto the canvas, drop the `.glsl` file onto it, or use Open (⌘O).
Params declared with `// @param` become sliders; colours with `// @color` become swatches.

The syntax version is in each file as `// @postmo 1`.
