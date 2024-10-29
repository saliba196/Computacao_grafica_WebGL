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

const verticesPalhaco = new Float32Array([
  // Rosto
  -0.4, 0.2, 0.0, 0.5, 0.4, 0.2, 0.4, -0.2, 0.0, -0.5, -0.4, -0.2,

  // Nariz 
  -0.1, 0.0, 0.1, 0.0, 0.0, 0.1,

  // Olho esquerdo
  -0.25, 0.15, -0.15, 0.15, -0.15, 0.25, -0.25, 0.15, -0.15, 0.25, -0.25, 0.25,

  // Olho direito 
  0.15, 0.15, 0.25, 0.15, 0.25, 0.25, 0.15, 0.15, 0.25, 0.25, 0.15, 0.25,

  // Boca 
  -0.2, -0.3, 0.2, -0.3, 0.0, -0.1,

  // Chapéu 
  -0.5, 0.2, 0.5, 0.2, 0.0, 0.7,
]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, verticesPalhaco, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Função para desenhar uma parte do palhaço com uma cor específica
function desenharParte(cor, offset, count) {
  const colorLocation = gl.getUniformLocation(program, "u_color");
  gl.uniform4fv(colorLocation, cor);
  gl.drawArrays(gl.TRIANGLES, offset, count);
}


gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Desenhar 
desenharParte([1.0, 0.8, 0.6, 1.0], 0, 6); // Rosto 
desenharParte([1.0, 0.0, 0.0, 1.0], 6, 3); // Nariz (vermelho)
desenharParte([0.0, 0.0, 0.0, 1.0], 9, 6); // Olhos (preto)
desenharParte([1.0, 0.0, 0.0, 1.0], 15, 3); // Boca (vermelho)
desenharParte([0.0, 0.0, 1.0, 1.0], 18, 3); // Chapéu (azul)
