function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    throw new Error("WebGL not supported");
  }

  const vertexShaderSource = `
    attribute vec3 position;
    attribute vec3 color;
    varying vec3 vColor;
    uniform mat4 matrix;

    void main() {
      gl_Position = matrix * vec4(position, 1.0);
      vColor = color;
    }
  `;

  const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );
  const program = createProgram(gl, vertexShader, fragmentShader);
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();
  const colorLocation = gl.getAttribLocation(program, "color");
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const matrixUniformLocation = gl.getUniformLocation(program, "matrix");

  const vertices = [
    // Front face
    -0.5,
    -0.5,
    0.5,
    0.0,
    1.0,
    0.0, // Bottom-left
    0.5,
    -0.5,
    0.5,
    0.0,
    1.0,
    0.0, // Bottom-right
    0.5,
    0.5,
    0.5,
    0.0,
    1.0,
    0.0, // Top-right
    -0.5,
    0.5,
    0.5,
    0.0,
    1.0,
    0.0, // Top-left
    // Back face
    -0.5,
    -0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
    0.5,
    -0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
    0.5,
    0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
    -0.5,
    0.5,
    -0.5,
    0.0,
    0.0,
    1.0,
  ];

  const indices = [
    0,
    1,
    2,
    0,
    2,
    3, // Front face
    4,
    5,
    6,
    4,
    6,
    7, // Back face
    3,
    2,
    6,
    3,
    6,
    7, // Top face
    0,
    1,
    5,
    0,
    5,
    4, // Bottom face
    1,
    2,
    6,
    1,
    6,
    5, // Right face
    0,
    3,
    7,
    0,
    7,
    4, // Left face
  ];

  const positionData = [];
  const colorData = [];
  for (let i = 0; i < vertices.length; i += 6) {
    positionData.push(vertices[i], vertices[i + 1], vertices[i + 2]);
    colorData.push(vertices[i + 3], vertices[i + 4], vertices[i + 5]);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positionData),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(
    gl.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(indices),
    gl.STATIC_DRAW
  );

  function createPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    return [
      f / aspect,
      0,
      0,
      0,
      0,
      f,
      0,
      0,
      0,
      0,
      (far + near) / (near - far),
      -1,
      0,
      0,
      (2 * far * near) / (near - far),
      0,
    ];
  }

  function animate() {
    const fov = Math.PI / 4;
    const aspect = canvas.width / canvas.height;
    const near = 0.1;
    const far = 10;
    const perspective = createPerspectiveMatrix(fov, aspect, near, far);

    const angle = performance.now() / 1000;
    const rotationY = [
      Math.cos(angle),
      0,
      Math.sin(angle),
      0,
      0,
      1,
      0,
      0,
      -Math.sin(angle),
      0,
      Math.cos(angle),
      0,
      0,
      0,
      0,
      1,
    ];

    const translation = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, -3, 0, 0, 0, 1];

    const matrix = m4.multiply(
      perspective,
      m4.multiply(translation, rotationY)
    );

    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(animate);
  }

  animate();
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  return program;
}
