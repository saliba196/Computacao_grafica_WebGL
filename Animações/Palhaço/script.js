const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL não suportado");
}

// GLSL do Vertex Shader (com variável de deslocamento vertical)
const vertexShaderGLSL = `
attribute vec2 position;
uniform float offsetY;

void main() {
    gl_Position = vec4(position.x, position.y + offsetY, 0.0, 1.0);
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

// Definir as posições dos vértices para o palhaço
const verticesPalhaco = new Float32Array([
  // Rosto (círculo simplificado como um hexágono)
  -0.4, 0.2, 0.0, 0.5, 0.4, 0.2, 0.4, -0.2, 0.0, -0.5, -0.4, -0.2,

  // Nariz (círculo pequeno como triângulo)
  -0.1, 0.0, 0.1, 0.0, 0.0, 0.1,

  // Olho esquerdo (quadrado)
  -0.25, 0.15, -0.15, 0.15, -0.15, 0.25, -0.25, 0.15, -0.15, 0.25, -0.25, 0.25,

  // Olho direito (quadrado)
  0.15, 0.15, 0.25, 0.15, 0.25, 0.25, 0.15, 0.15, 0.25, 0.25, 0.15, 0.25,

  // Boca (triângulo para o sorriso)
  -0.2, -0.3, 0.2, -0.3, 0.0, -0.1,

  // Chapéu (triângulo no topo)
  -0.5, 0.2, 0.5, 0.2, 0.0, 0.7,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesPalhaco, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getUniformLocation(program, "u_color");
const offsetYLocation = gl.getUniformLocation(program, "offsetY");

// Variáveis para animar o salto
let offsetY = 0.0;
let direction = 1; // 1 para cima, -1 para baixo
const jumpSpeed = 0.02;
const jumpHeight = 0.3;

function animate() {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Atualizar o deslocamento vertical para o efeito de salto
  offsetY += direction * jumpSpeed;
  if (offsetY >= jumpHeight || offsetY <= 0.0) {
    direction *= -1; // Inverter direção ao atingir a altura máxima ou mínima
  }

  // Função para desenhar uma parte do palhaço
  function desenharParte(cor, offset, count) {
    gl.uniform4fv(colorLocation, cor);
    gl.uniform1f(offsetYLocation, offsetY);
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  // Desenhar o palhaço com o deslocamento vertical animado
  desenharParte([1.0, 0.8, 0.6, 1.0], 0, 6); // Rosto (cor de pele)
  desenharParte([1.0, 0.0, 0.0, 1.0], 6, 3); // Nariz (vermelho)
  desenharParte([0.0, 0.0, 0.0, 1.0], 9, 6); // Olhos (preto)
  desenharParte([1.0, 0.0, 0.0, 1.0], 15, 3); // Boca (vermelho)
  desenharParte([0.0, 0.0, 1.0, 1.0], 18, 3); // Chapéu (azul)

  requestAnimationFrame(animate);
}

// Iniciar a animação
animate();
