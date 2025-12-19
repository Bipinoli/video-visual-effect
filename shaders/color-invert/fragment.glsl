precision mediump float;

varying vec2 v_uv;

void main() {
  vec4 color = vec4(v_uv.x, v_uv.y, 0.0, 1.0);
  gl_FragColor = color;
}
