// @name Tiles
// @postmo 1
// A grid of tiles that switch on in steps: the step number is
// mod(floor(uPhase * steps), steps), so the last step leads back to the first.
// (Not `step` as a name: it is a GLSL function.)
uniform float cells;   // @param Cells 2 24 1 8
uniform float steps;   // @param Steps per loop 1 32 1 8
uniform float fill;    // @param Fill 0 1 0.01 0.45
uniform float gap;     // @param Gap 0 0.4 0.01 0.08
uniform float shape;   // @param Shape 0 2 1 0 [Square, Circle, Diamond]
uniform vec3 ground;   // @color Ground #101010
uniform vec3 tile;     // @color Tile #f4f1ea
uniform vec3 accent;   // @color Accent #ff4a1c

void main() {
  vec2 p = aspectP(vUv) * floor(cells + 0.5) + 0.5;
  vec2 cell = floor(p), f = fract(p) - 0.5;
  float tick = mod(floor(uPhase * floor(steps + 0.5)), floor(steps + 0.5));
  float r = hash13(vec3(cell, tick));
  float m = shape < 0.5 ? max(abs(f.x), abs(f.y)) : shape < 1.5 ? length(f) : abs(f.x) + abs(f.y);
  float on = step(r, fill) * (1.0 - smoothstep(0.5 - gap - 0.01, 0.5 - gap, m));
  vec3 c = mix(ground, r < fill * 0.15 ? accent : tile, on);
  outColor = vec4(c, 1.0);
}
