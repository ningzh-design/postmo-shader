---
name: postmo-shader
description: Write a shader for Postmo, the browser editor for looping motion posters, and check it compiles, loops and looks right before handing it over. Use when asked for a Postmo shader, a looping GLSL background or effect for Postmo, or to fix one.
---

# Writing a Postmo shader

Postmo takes the body of a GLSL ES 3.00 fragment shader. Params and colours declared
in comments become sliders and swatches in its inspector. The user pastes the code
into Postmo, or drops the .glsl file onto its canvas.

## Workflow
1. List what the picture is made of and pick at most 10 params that change it most
   (the rest are constants). Name colours by their role.
2. Write the shader (rules below, functions in reference.md, examples in examples/).
3. Check it: `npx postmo-shader check my-shader.glsl` (from this folder: `node bin/check.mjs my-shader.glsl`).
   It compiles the code with Postmo's own renderer, says whether it loops, whether the
   seed changes it and what a frame costs, and writes PNG frames to ./postmo-check/.
   Look at the frames.
4. Fix what it reports and check again. Hand over the file when it compiles, the frames
   look like what was asked, and it loops (unless it was meant to play over time).

## Rules
- Write the body of a GLSL ES 3.00 fragment shader: no #version, no precision, no main() inputs of your own.
  Postmo puts its prefix first (noise, loop helpers, uniforms) and calls your main().
- Write the colour to outColor (vec4, straight alpha: write the colour and its opacity).
- Place patterns with vUv (0–1, origin bottom left) and uRes (the layer's size in px), never gl_FragCoord:
  the layer can be cropped, turned or drawn at preview quality. aspectP(vUv) gives centred coordinates
  scaled by the short side, so shapes stay round in any format.
- Params and colours are uniforms with a note on the same line (they become inspector sliders and swatches):
    uniform float speed;   // @param Speed 0 2 0.01 1 rate
    uniform float mode;    // @param Mode 0 2 1 0 [Soft, Hard, Glow]
    uniform vec3 shadows;  // @color Shadows #101018
  @param is "Label min max step default", then optional [option, labels] (a menu; values min, min+step, …),
  "rate" (a speed: Keep speed scales it with the duration) or "pick" (picks a variant by number, with dice).
  @color is "Label #rrggbb". At most 10 params and 8 colours: choose the ones that change
  the picture most; make the rest constants. Name colours by their role (Shadows, Glow, Edge), not by hue.
- Other notes: // @name Shader name, // @group Group name: key, key (params beyond six must be grouped,
  else they go to More), // @transparent (draws only a figure; the rest stays see-through), // @postmo 1.
- Only float and vec3 uniforms can be declared; never declare uniforms Postmo already has (below).
- Do not write your own noise or hash: use snoise / fbm / hash12 / hash13. They follow the layer's Seed,
  so changing the seed gives a new pattern for free.
- Time, two ways. To loop seamlessly (Postmo's speciality): use uPhase (0 → 1 once per loop) and only
  periodic functions of it: sin(TAU * uPhase * k) with a whole number k (floor(x + 0.5) for a param),
  noise that moves through lp(p, r, z) or loopv(r), never snoise(vec3(p, uTime)); discrete jumps with
  mod(floor(uPhase * N), N) as a hash key. uPhase may wrap several times in one loop (time scale), so
  every term must have period 1. To play over time instead (does not loop): use uTime (seconds) and uDuration.
- GLSL ES pitfalls: sample, filter, input, output, patch are reserved words; there is no PI (TAU * 0.5);
  call texture() before any early return; whole numbers are ints (write 1.0, not 1, in float maths).
- Keep it light: it runs per pixel at up to 4K, every frame. Avoid deep loops (more than ~64 steps) and
  nested fbm; no more than 64 KB of code.
- The layer's image or video (its Source, if the user loads one) is uTex: use coverUv(vUv, zoom) to fill
  the layer with it, and uHasTex to know whether one is loaded.

## What Postmo gives your code
Uniforms: vec2 uRes (layer px) · float uPhase (0–1 per loop) · float uTime (s) · float uDuration (s) ·
float uFrame (frame number, for grain only) · sampler2D uTex, bool uHasTex, vec2 uTexSize (the Source) ·
vec3 uSeedOff (the seed, used by the noise) · in vec2 vUv · out vec4 outColor · #define TAU 6.28318530718

Functions:
- float snoise(vec3 v) — Simplex noise, about −1…1; follows the seed.
- float fbm(vec3 p) — Five octaves of snoise: rougher detail, about −1…1.
- float fbm3(vec3 p) — Three octaves of snoise: cheaper fbm.
- float hash12(vec2 p) — A random number 0…1 for a 2D point; follows the seed.
- float hash13(vec3 p3) — A random number 0…1 for a 3D point; follows the seed.
- vec2 loopv(float r) — A point going once round a circle of radius r per loop: add it to a noise coordinate to make it loop.
- vec3 lp(vec2 p, float r, float z) — A noise coordinate for p that sways on x and evolves on z along a closed loop: snoise(lp(p, r, z)) loops seamlessly; r is how far (how fast) it moves.
- vec2 designUv() — vUv with y running down from the top.
- vec2 seedJitter(float i) — Zero at seed 0, else a fixed nudge in [−1, 1]² for each i: moves hand-placed shapes with the seed.
- vec2 aspectP(vec2 uv) — Centred coordinates scaled by the short side: round stays round in any format.
- float px1080() — One pixel of a 1080 px tall layer, in this layer's pixels.
- vec3 ramp5(float t) — Blends the first five colours (uColors[0…4]) by t in 0…1.
- vec2 coverUv(vec2 uv, float zoom) — uv to read the Source (uTex) so it covers the layer; zoom 1 covers exactly.
