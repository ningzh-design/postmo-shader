// @name Ripple
// @postmo 1
// The layer's Source (an image or video the user loads in the inspector) seen
// through rings of water; without one, a soft gradient stands in.
uniform float rings;    // @param Rings 1 40 0.5 12
uniform float strength; // @param Strength 0 0.08 0.001 0.02
uniform float waves;    // @param Waves per loop 1 6 1 2
uniform vec3 top;       // @color Top #ffd2a6
uniform vec3 bottom;    // @color Bottom #3b2a6b

void main() {
  // The seed moves the centre (seedJitter is zero at seed 0).
  vec2 p = aspectP(vUv) - seedJitter(1.0) * 0.3;
  float d = length(p);
  float w = sin(TAU * (d * rings - uPhase * floor(waves + 0.5)));
  vec2 uv = vUv + normalize(p + 1e-5) * w * strength * smoothstep(0.9, 0.0, d);
  vec3 c = uHasTex ? texture(uTex, coverUv(uv, 1.0)).rgb : mix(bottom, top, uv.y);
  outColor = vec4(c * (0.92 + 0.08 * w), 1.0);
}
