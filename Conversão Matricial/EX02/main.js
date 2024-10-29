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
    // Add additional colors if needed
  ];
  let currentColor = colors[0];
  let drawMode = "line"; // 'line' or 'triangle'
  let clickPoints = [];

  function setDrawingMode(mode) {
    drawMode = mode;
    clickPoints = [];
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  canvas.addEventListener("mousedown", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / canvas.height) * 2 + 1;

    clickPoints.push([x, y]);

    if (drawMode === "line" && clickPoints.length === 2) {
      const [start, end] = clickPoints;
      drawBresenhamLine(
        gl,
        start[0],
        start[1],
        end[0],
        end[1],
        positionBuffer,
        colorUniformLocation,
        currentColor
      );
      clickPoints = [];
    } else if (drawMode === "triangle" && clickPoints.length === 3) {
      const [p1, p2, p3] = clickPoints;
      drawTriangleBresenham(
        gl,
        p1,
        p2,
        p3,
        positionBuffer,
        colorUniformLocation,
        currentColor
      );
      clickPoints = [];
    }
  });

  document.body.addEventListener("keydown", (event) => {
    const key = event.key;
    if (key >= "0" && key <= "2") {
      // Only keys 0, 1, and 2 for color
      currentColor = colors[parseInt(key)];
    } else if (key === "r" || key === "R") {
      setDrawingMode("line");
    } else if (key === "t" || key === "T") {
      setDrawingMode("triangle");
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
    const points = calculateBresenhamPoints(x0, y0, x1, y1);
    renderPoints(gl, points, positionBuffer, colorLocation, color);
  }

  function drawTriangleBresenham(
    gl,
    p1,
    p2,
    p3,
    positionBuffer,
    colorLocation,
    color
  ) {
    const points = [
      ...calculateBresenhamPoints(p1[0], p1[1], p2[0], p2[1]),
      ...calculateBresenhamPoints(p2[0], p2[1], p3[0], p3[1]),
      ...calculateBresenhamPoints(p3[0], p3[1], p1[0], p1[1]),
    ];
    renderPoints(gl, points, positionBuffer, colorLocation, color);
  }

  function calculateBresenhamPoints(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    let sx = x0 < x1 ? 0.01 : -0.01;
    let sy = y0 < y1 ? 0.01 : -0.01;
    let err = dx - dy;

    while (true) {
      points.push(x0, y0);
      if (Math.abs(x0 - x1) < 0.01 && Math.abs(y0 - y1) < 0.01) break;
      let e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        y0 += sy;
      }
    }

    return points;
  }

  function renderPoints(gl, points, positionBuffer, colorLocation, color) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.uniform3fv(colorLocation, color);
    gl.drawArrays(gl.POINTS, 0, points.length / 2);
  }

  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Start with an initial blue line at (0,0) - (0,0)
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
