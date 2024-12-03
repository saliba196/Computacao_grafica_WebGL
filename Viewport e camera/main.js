function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    console.error("WebGL não está disponível.");
    return;
  }

  const vertexShaderSource = document.querySelector("#vertex-shader").text;
  const fragmentShaderSource = document.querySelector("#fragment-shader").text;

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

  const colorBuffer = gl.createBuffer();
  const colorLocation = gl.getAttribLocation(program, "color");
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

  const matrixLocation = gl.getUniformLocation(program, "matrix");

  // Configuração dos vértices e cores de um quadrado
  const squareVertices = [
    -0.1, -0.1, 0.0, 0.1, -0.1, 0.0, -0.1, 0.1, 0.0, -0.1, 0.1, 0.0, 0.1, -0.1,
    0.0, 0.1, 0.1, 0.0,
  ];
  const squareColors = Array(6).fill([0, 0, 1]).flat(); // Azul

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(squareVertices),
    gl.STATIC_DRAW
  );
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(squareColors),
    gl.STATIC_DRAW
  );

  function drawScene() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Quadrado 1: Zoom da câmera
    const cameraDistance = 1.5 + Math.sin(Date.now() * 0.001) * 0.5;
    drawSquare(
      matrixLocation,
      m4.perspective(Math.PI / 4, 1, 0.1, 10),
      m4.translation(0, 0, -cameraDistance),
      -0.75,
      0.75
    );

    // Quadrado 2: Movimento lateral
    const lateralMove = Math.sin(Date.now() * 0.002) * 2;
    drawSquare(
      matrixLocation,
      m4.perspective(Math.PI / 4, 1, 0.1, 10),
      m4.translation(lateralMove, 0, -2),
      -0.75,
      -0.75
    );

    // Quadrado 3: Rotação da câmera
    const angle = (Date.now() * 0.012) % 360;
    const rotationMatrix = m4.yRotation(degToRad(angle));
    drawSquare(
      matrixLocation,
      m4.perspective(Math.PI / 4, 1, 0.1, 10),
      m4.multiply(rotationMatrix, m4.translation(0, 0, -1.5)),
      0.75,
      0.75
    );

    // Quadrado 4: Movimento vertical
    const verticalMove = Math.cos(Date.now() * 0.002) * 2;
    drawSquare(
      matrixLocation,
      m4.perspective(Math.PI / 4, 1, 0.1, 10),
      m4.translation(0, verticalMove, -2),
      0.75,
      -0.75
    );

    requestAnimationFrame(drawScene);
  }

  function drawSquare(matrixLocation, projectionMatrix, viewMatrix, x, y) {
    const matrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.viewport(
      ((x + 1) / 2) * canvas.width,
      ((y + 1) / 2) * canvas.height,
      canvas.width / 2,
      canvas.height / 2
    );

    gl.uniformMatrix4fv(matrixLocation, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  drawScene();
}

// Funções auxiliares
function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
  }
  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  return program;
}

const m4 = {
  perspective: function (fov, aspect, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);
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
      (near + far) * rangeInv,
      -1,
      0,
      0,
      near * far * rangeInv * 2,
      0,
    ];
  },
  translation: function (tx, ty, tz) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, tx, ty, tz, 1];
  },
  yRotation: function (angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1];
  },
  multiply: function (a, b) {
    const result = [];
    for (let i = 0; i < 4; ++i) {
      for (let j = 0; j < 4; ++j) {
        let sum = 0.0;
        for (let k = 0; k < 4; ++k) {
          sum += a[i * 4 + k] * b[k * 4 + j];
        }
        result[i * 4 + j] = sum;
      }
    }
    return result;
  },
};

main();
