# What a Postmo shader can use

The prefix Postmo puts before your code (syntax version 1).

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
