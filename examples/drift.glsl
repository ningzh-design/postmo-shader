// @name Drift
// @postmo 1
// Plays over time instead of looping: uTime runs on in seconds, so the clouds
// never come back to where they started (the loop jumps at its end, by choice).
uniform float speed; // @param Speed 0 0.5 0.01 0.08
uniform float scale; // @param Scale 0.5 4 0.01 1.5
uniform vec3 sky;    // @color Sky #9fc6ff
uniform vec3 cloud;  // @color Cloud #ffffff

void main() {
  vec2 p = aspectP(vUv) * scale + vec2(uTime * speed, 0.0);
  float n = fbm(vec3(p, uTime * speed * 0.3));
  outColor = vec4(mix(sky, cloud, smoothstep(0.0, 0.6, n)), 1.0);
}
