let existingGL = null;
let existingArrayBuffer = null;
let existingTexture = null;
let existingShader = {
  vertexShader: null,
  fragmentShader: null,
  shaderProgram: null
};


export async function setupWebGL(canvasElement, shaderPath) {
  if (!existingGL) {
    const gl = canvasElement.getContext("webgl"); 
    if (!gl) {
      alert("We apply visual effects via WebGL. Your browser currently doesn't support WebGL.");
      return;
    }
    existingGL = gl;
  }
  const gl = existingGL;
  if (existingShader.shaderProgram) {
    gl.deleteShader(existingShader.vertexShader);
    gl.deleteShader(existingShader.fragmentShader);
    gl.deleteProgram(existingShader.shaderProgram);
    existingShader.vertexShader = null;
    existingShader.fragmentShader = null;
    existingShader.shaderProgram = null;
  }
  const vertShaderSrc = await loadShaderSource(`${shaderPath}/vertex.glsl`);
  const fragShaderSrc = await loadShaderSource(`${shaderPath}/fragment.glsl`);
  const vertShader = compileShader(gl, gl.VERTEX_SHADER, vertShaderSrc);
  const fragShader = compileShader(gl, gl.FRAGMENT_SHADER, fragShaderSrc);
  if (!vertShader || !fragShader) {
    console.log("Error! WebGL setup failed due to failed shader compilation!");
    return;
  }
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertShader);
  gl.attachShader(shaderProgram, fragShader);
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error(`Error! failed to link shader programs. ${gl.getProgramInfoLog(shaderProgram)}`);
    gl.deleteshader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(shaderProgram);
    return;
  }
  existingShader.shaderProgram = shaderProgram;
  existingShader.vertexShader = vertShader;
  existingShader.fragmentShader = fragShader;

  if (!existingArrayBuffer) {
    // two triangles covering the whole
    const positions = [
      -1.0, 1.0, //top left
      1.0, 1.0, // top right
      -1.0, -1.0, // bottom left

      1.0, 1.0, // top right
      -1.0, -1.0, // bottom left
      1.0, -1.0 // bottom right
    ];
    const arrBuff = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, arrBuff);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    existingArrayBuffer = arrBuff;
  }

  if (!existingTexture) {
    // based on: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Animating_textures_in_WebGL
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    const onePixel = new Uint8Array([255, 0, 0, 255]); // single red pixel
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, onePixel);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    existingTexture = texture;
  }

  gl.useProgram(shaderProgram);
  gl.viewport(0, 0, canvasElement.width, canvasElement.height);

  const positionLoc = gl.getAttribLocation(shaderProgram, "a_position");
  if (positionLoc == -1) {
    console.error(`Error! couldn't locate 'a_position' in shaderProgram`);
    return;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, existingArrayBuffer);
  gl.enableVertexAttribArray(positionLoc);
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

  const imageLoc = gl.getUniformLocation(shaderProgram, "u_image");
  if (!imageLoc) {
    console.error(`Error! couldn't locate 'u_image' in shaderProgram`);
    return;
  }
  gl.uniform1i(imageLoc, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


export function renderVideo(effectStrength, canvasElement, videoElement) {
  if (!existingGL || !existingShader.shaderProgram) {
    return;
  }
  function render(time) {
    const gl = existingGL;
    gl.useProgram(existingShader.shaderProgram);
    const timeLoc = gl.getUniformLocation(existingShader.shaderProgram, "u_time"); 
    if (timeLoc) {
      gl.uniform1f(timeLoc, time * 0.001); // ms -> s
    }
    const strengthLoc = gl.getUniformLocation(existingShader.shaderProgram, "u_strength"); 
    if (strengthLoc) {
      gl.uniform1f(strengthLoc, effectStrength.strength);
    }
    updateTexture(canvasElement, videoElement);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}



function updateTexture(canvasElement, videoElement) {
  if (existingGL) {
    const gl = existingGL;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, existingTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}




function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Error! shader compile failed: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}


async function loadShaderSource(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch from ${url}`);
  return await resp.text();
}
