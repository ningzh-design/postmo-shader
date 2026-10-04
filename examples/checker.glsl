// @name Checker
// @postmo 1
// Params and colours: a uniform with a note. They show up in the inspector.
uniform float speed;   // @param Speed 0 3 1 1
uniform float squares; // @param Squares 2 30 1 8
uniform float warp;    // @param Warp 0 1 0.01 0.35
uniform vec3 shadows;  // @color Shadows #111111
uniform vec3 glow;     // @color Glow #58ff3e
uniform vec3 edge;     // @color Edge #e9edec

// Time: uPhase goes 0 → 1 once per loop. Anything made from it loops
// seamlessly: sin(TAU * uPhase * k) with a whole k, noise through lp(p, r, z).
// For motion that runs on instead, use uTime (seconds) and uDuration.
// Place patterns with vUv (0–1) and uRes (pixels), not gl_FragCoord.
void main() {
  vec2 p = aspectP(vUv);
  // Bend the board with looping noise, then slide it a whole number of squares per loop.
  vec2 w = vec2(snoise(lp(p * 1.3, 0.6, 0.0)), snoise(lp(p * 1.3 + 5.0, 0.6, 3.0)));
  vec2 g = (p + warp * 0.25 * w) * squares + vec2(uPhase * floor(speed + 0.5) * 2.0, 0.0);
  vec2 f = fract(g) - 0.5, aa = fwidth(g);
  vec2 s = smoothstep(-aa, aa, f) * 2.0 - 1.0;
  float tile = 0.5 - 0.5 * s.x * s.y;
  vec3 c = mix(shadows, glow, tile);
  float lip = 1.0 - smoothstep(0.0, 2.0 * aa.y, abs(f.y + 0.44));
  c = mix(c, edge, lip * tile);
  outColor = vec4(c, 1.0);
}
