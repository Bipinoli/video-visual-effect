export function setupWebGL(canvasElement) {
  const gl = canvas.getContext("webgl"); 
  if (!gl) alert("We depend on WebGL for effect. Your browser currently doesn't support WebGL.");

}
