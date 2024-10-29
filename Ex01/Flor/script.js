const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL não suportado");
}


const vertexShaderGLSL = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;


const fragmentShaderGLSL = `
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`;


function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderGLSL);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderGLSL);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);


const verticesFlor = new Float32Array([
  // Centro da flor 
  -0.1, 0.1, 0.1, 0.1, 0.2, 0.0, 0.1, -0.1, -0.1, -0.1, -0.2, 0.0,

  // Pétala superior
  -0.2, 0.3, 0.0, 0.5, 0.2, 0.3,

  // Pétala inferior
  -0.2, -0.3, 0.0, -0.5, 0.2, -0.3,

  // Pétala esquerda
  -0.4, 0.1, -0.6, 0.0, -0.4, -0.1,

  // Pétala direita
  0.4, 0.1, 0.6, 0.0, 0.4, -0.1,

  // Caule 
  -0.05, -0.6, 0.05, -0.6, 0.05, -0.8, -0.05, -0.6, 0.05, -0.8, -0.05, -0.8,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesFlor, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Função para desenhar uma parte da flor com uma cor específica
function desenharParte(cor, offset, count) {
  const colorLocation = gl.getUniformLocation(program, "u_color");
  gl.uniform4fv(colorLocation, cor);
  gl.drawArrays(gl.TRIANGLES, offset, count);
}


gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


desenharParte([1.0, 1.0, 0.0, 1.0], 0, 6); // Centro da flor (amarelo)
desenharParte([1.0, 0.0, 0.0, 1.0], 6, 3); // Pétala superior (vermelho)
desenharParte([1.0, 0.0, 0.0, 1.0], 9, 3); // Pétala inferior (vermelho)
desenharParte([1.0, 0.0, 0.0, 1.0], 12, 3); // Pétala esquerda (vermelho)
desenharParte([1.0, 0.0, 0.0, 1.0], 15, 3); // Pétala direita (vermelho)
desenharParte([0.0, 1.0, 0.0, 1.0], 18, 6); // Caule (verde)
