// @name Rings
// @postmo 1
// Params and colours: a uniform with a note. They show up in the inspector.
uniform float speed;  // @param Speed 0 3 1 1
uniform float rings;  // @param Rings 1 24 0.1 8
uniform float warp;   // @param Warp 0 1 0.01 0.35
uniform vec3 shadows; // @color Shadows #0e0b1f
uniform vec3 glow;    // @color Glow #ff7a3d
uniform vec3 edge;    // @color Edge #ffe7b0

// Time: uPhase goes 0 → 1 once per loop. Anything made from it loops
// seamlessly: sin(TAU * uPhase * k) with a whole k, noise through lp(p, r, z).
// For motion that runs on instead, use uTime (seconds) and uDuration.
// Place patterns with vUv (0–1) and uRes (pixels), not gl_FragCoord.
void main() {
  vec2 p = aspectP(vUv);
  float n = snoise(lp(p * 1.5, 0.6, 0.0));
  float r = length(p) * rings + warp * 2.0 * n - uPhase * floor(speed + 0.5) * 4.0;
  float band = 0.5 + 0.5 * sin(TAU * r / 4.0);
  vec3 c = mix(shadows, glow, smoothstep(0.2, 0.8, band));
  c = mix(c, edge, smoothstep(0.92, 1.0, band));
  outColor = vec4(c, 1.0);
}
