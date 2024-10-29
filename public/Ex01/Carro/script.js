const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL não suportado");
}

// GLSL do Vertex Shader
const vertexShaderGLSL = `
attribute vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

// GLSL do Fragment Shader
const fragmentShaderGLSL = `
precision mediump float;

uniform vec4 u_color;

void main() {
    gl_FragColor = u_color;
}
`;

// Criação dos shaders
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

// Definir as posições dos vértices para o carro
const carroVertices = new Float32Array([
  // Corpo do carro (um retângulo grande)
  -0.7, -0.2, 0.7, -0.2, 0.7, 0.2, -0.7, -0.2, 0.7, 0.2, -0.7, 0.2,

  // Teto do carro (retângulo menor)
  -0.4, 0.2, 0.4, 0.2, 0.4, 0.4, -0.4, 0.2, 0.4, 0.4, -0.4, 0.4,

  // Roda esquerda
  -0.5, -0.4, -0.3, -0.4, -0.3, -0.2, -0.5, -0.4, -0.3, -0.2, -0.5, -0.2,

  // Roda direita
  0.3, -0.4, 0.5, -0.4, 0.5, -0.2, 0.3, -0.4, 0.5, -0.2, 0.3, -0.2,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, carroVertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Função para desenhar uma parte do carro com uma cor específica
function desenharParte(cor, offset, count) {
  const colorLocation = gl.getUniformLocation(program, "u_color");
  gl.uniform4fv(colorLocation, cor);
  gl.drawArrays(gl.TRIANGLES, offset, count);
}

// Configurações do viewport
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Desenhar o carro
desenharParte([0.0, 0.0, 1.0, 1.0], 0, 6); // Corpo do carro (azul)
desenharParte([0.8, 0.8, 0.8, 1.0], 6, 6); // Teto do carro (cinza claro)
desenharParte([0.0, 0.0, 0.0, 1.0], 12, 6); // Roda esquerda (preto)
desenharParte([0.0, 0.0, 0.0, 1.0], 18, 6); // Roda direita (preto)
