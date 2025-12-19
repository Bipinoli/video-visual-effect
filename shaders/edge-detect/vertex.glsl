attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  // transform [-1, 1] to [0, 1] UV space
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
