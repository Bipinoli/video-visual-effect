precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_image;

void main() {
  float px = 1.0 / 512.0;

  vec3 c = texture2D(u_image, v_uv).rgb;
  vec3 cx = texture2D(u_image, v_uv + vec2(px, 0.0)).rgb;
  vec3 cy = texture2D(u_image, v_uv + vec2(0.0, px)).rgb;

  vec3 edge = abs(c - cx) + abs(c - cy);
  gl_FragColor = vec4(edge * 3.0, 1.0);
}
