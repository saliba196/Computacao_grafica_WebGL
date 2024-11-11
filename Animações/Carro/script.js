const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL não suportado");
}

// GLSL do Vertex Shader (adicionamos uma variável de deslocamento)
const vertexShaderGLSL = `
attribute vec2 position;
uniform float offsetX;

void main() {
    gl_Position = vec4(position.x + offsetX, position.y, 0.0, 1.0);
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

// Função para criar shaders
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
const verticesCarro = new Float32Array([
  // Corpo do carro
  -0.3, -0.2, 0.3, -0.2, 0.3, 0.1, -0.3, -0.2, 0.3, 0.1, -0.3, 0.1,

  // Teto do carro
  -0.15, 0.1, 0.15, 0.1, 0.15, 0.3, -0.15, 0.1, 0.15, 0.3, -0.15, 0.3,

  // Roda esquerda
  -0.2, -0.3, -0.1, -0.3, -0.1, -0.2, -0.2, -0.3, -0.1, -0.2, -0.2, -0.2,

  // Roda direita
  0.1, -0.3, 0.2, -0.3, 0.2, -0.2, 0.1, -0.3, 0.2, -0.2, 0.1, -0.2,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesCarro, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getUniformLocation(program, "u_color");
const offsetXLocation = gl.getUniformLocation(program, "offsetX");

// Animação de deslocamento para o carro
let offsetX = -1.0; // Iniciar o carro fora da tela à esquerda
let speed = 0.01;

function animate() {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Atualizar posição do carro
  offsetX += speed;
  if (offsetX > 1.0) {
    offsetX = -1.0; // Reiniciar quando sair da tela
  }

  // Função para desenhar uma parte do carro
  function desenharParte(cor, offset, count) {
    gl.uniform4fv(colorLocation, cor);
    gl.uniform1f(offsetXLocation, offsetX);
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  // Desenhar o carro
  desenharParte([0.0, 0.0, 1.0, 1.0], 0, 6); // Corpo do carro (azul)
  desenharParte([0.8, 0.8, 0.8, 1.0], 6, 6); // Teto do carro (cinza)
  desenharParte([0.0, 0.0, 0.0, 1.0], 12, 6); // Roda esquerda (preto)
  desenharParte([0.0, 0.0, 0.0, 1.0], 18, 6); // Roda direita (preto)

  requestAnimationFrame(animate);
}

// Iniciar a animação
animate();
