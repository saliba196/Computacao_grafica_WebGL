function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    throw new Error("WebGL not supported");
  }

  const vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
  const fragmentShaderSource = document.querySelector(
    "#fragment-shader-2d"
  ).text;

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
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  const colorUniformLocation = gl.getUniformLocation(program, "color");

  const colors = [
    [0, 0, 1], // Azul
    [1, 0.5, 0], // Laranja
    [0, 1, 0], // Verde
    [1, 0, 0], // Vermelho
    [0, 1, 1], // Ciano
    [1, 0, 1], // Magenta
    [0.5, 0.5, 0.5], // Cinza
    [1, 1, 0], // Amarelo
    [0.5, 0, 0.5], // Roxo
    [0.5, 1, 0.5], // Verde claro
  ];
  let currentColor = colors[0];

  let startX = 0,
    startY = 0,
    endX = 0,
    endY = 0;
  let isSecondClick = false;

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

    if (!isSecondClick) {
      startX = x;
      startY = y;
      endX = x;
      endY = y;
    } else {
      endX = x;
      endY = y;
      drawBresenhamLine(
        gl,
        startX,
        startY,
        endX,
        endY,
        positionBuffer,
        colorUniformLocation,
        currentColor
      );
    }
    isSecondClick = !isSecondClick;
  });

  document.body.addEventListener("keydown", (event) => {
    const key = parseInt(event.key);
    if (key >= 0 && key < colors.length) {
      currentColor = colors[key];
      drawBresenhamLine(
        gl,
        startX,
        startY,
        endX,
        endY,
        positionBuffer,
        colorUniformLocation,
        currentColor
      );
    }
  });

  function drawBresenhamLine(
    gl,
    x0,
    y0,
    x1,
    y1,
    positionBuffer,
    colorLocation,
    color
  ) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      points.push(x0, y0);
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx * 0.01;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy * 0.01;
      }
    }

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.uniform3fv(colorLocation, color);
    gl.drawArrays(gl.POINTS, 0, points.length / 2);
  }

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  drawBresenhamLine(
    gl,
    0,
    0,
    0,
    0,
    positionBuffer,
    colorUniformLocation,
    colors[0]
  );
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(gl.getShaderInfoLog(shader));
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
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }
  return program;
}

main();
