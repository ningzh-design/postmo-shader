// @name Flow
// @postmo 1
// Ink carried by a slow field: noise warps noise, every term moving along lp()
// loops, so the loop is seamless at any speed.
uniform float scale;    // @param Scale 0.5 4 0.01 1.6
uniform float speed;    // @param Speed 0 1.5 0.01 0.5 rate
uniform float warp;     // @param Warp 0 2 0.01 0.9
uniform float contrast; // @param Contrast 0.5 3 0.01 1.4
uniform float soft;     // @param Softness 0.01 0.4 0.01 0.12
uniform vec3 deep;      // @color Shadows #0b1026
uniform vec3 ink;       // @color Ink #2f5bff
uniform vec3 light;     // @color Light #f2efe4
// @group Finish: contrast, soft

void main() {
  vec2 p = aspectP(vUv) * scale;
  vec2 q = vec2(snoise(lp(p, speed, 0.0)), snoise(lp(p + 5.2, speed, 3.1)));
  float n = fbm(lp(p + warp * q, speed * 0.5, 7.0));
  float t = clamp(0.5 + 0.5 * n * contrast, 0.0, 1.0);
  vec3 c = mix(deep, ink, smoothstep(0.4 - soft, 0.4 + soft, t));
  c = mix(c, light, smoothstep(0.78 - soft, 0.78 + soft, t));
  outColor = vec4(c, 1.0);
}
