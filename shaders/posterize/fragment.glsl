precision mediump float;

varying vec2 v_uv;
uniform sampler2D u_image;
uniform float u_strength; // [0.0 - 1.0]

void main() {
  vec3 color = texture2D(u_image, v_uv).rgb;
  float levels = 6.0 - 4.0 * u_strength;
  color = floor(color * levels) / levels;
  gl_FragColor = vec4(color, 1.0);
}

