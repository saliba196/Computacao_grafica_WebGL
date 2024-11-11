const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

if (!gl) {
  throw new Error("WebGL não suportado");
}

// GLSL do Vertex Shader (adicionamos uma variável de escala)
const vertexShaderGLSL = `
attribute vec2 position;
uniform float scale;

void main() {
    gl_Position = vec4(position * scale, 0.0, 1.0);
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

// Posições dos vértices para a flor
const verticesFlor = new Float32Array([
  // Centro da flor (círculo simplificado como um hexágono)
  -0.1, 0.1, 0.1, 0.1, 0.2, 0.0, 0.1, -0.1, -0.1, -0.1, -0.2, 0.0,

  // Pétala superior
  -0.2, 0.3, 0.0, 0.5, 0.2, 0.3,

  // Pétala inferior
  -0.2, -0.3, 0.0, -0.5, 0.2, -0.3,

  // Pétala esquerda
  -0.4, 0.1, -0.6, 0.0, -0.4, -0.1,

  // Pétala direita
  0.4, 0.1, 0.6, 0.0, 0.4, -0.1,

  // Caule (retângulo)
  -0.05, -0.6, 0.05, -0.6, 0.05, -0.8, -0.05, -0.6, 0.05, -0.8, -0.05, -0.8,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesFlor, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const colorLocation = gl.getUniformLocation(program, "u_color");
const scaleLocation = gl.getUniformLocation(program, "scale");

// Animação de escala para as pétalas
let scale = 1.0;
let increasing = true;

function animate() {
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Controle de escala para "pulsação" das pétalas
  if (increasing) {
    scale += 0.01;
    if (scale >= 1.2) increasing = false;
  } else {
    scale -= 0.01;
    if (scale <= 0.8) increasing = true;
  }

  // Função para desenhar uma parte da flor
  function desenharParte(cor, offset, count, escala) {
    gl.uniform4fv(colorLocation, cor);
    gl.uniform1f(scaleLocation, escala);
    gl.drawArrays(gl.TRIANGLES, offset, count);
  }

  // Desenhar a flor com escala variável para as pétalas
  desenharParte([1.0, 1.0, 0.0, 1.0], 0, 6, 1.0); // Centro da flor (amarelo, sem pulsação)
  desenharParte([1.0, 0.0, 0.0, 1.0], 6, 3, scale); // Pétala superior (vermelho, animado)
  desenharParte([1.0, 0.0, 0.0, 1.0], 9, 3, scale); // Pétala inferior (vermelho, animado)
  desenharParte([1.0, 0.0, 0.0, 1.0], 12, 3, scale); // Pétala esquerda (vermelho, animado)
  desenharParte([1.0, 0.0, 0.0, 1.0], 15, 3, scale); // Pétala direita (vermelho, animado)
  desenharParte([0.0, 1.0, 0.0, 1.0], 18, 6, 1.0); // Caule (verde, sem pulsação)

  requestAnimationFrame(animate);
}

// Iniciar a animação
animate();
