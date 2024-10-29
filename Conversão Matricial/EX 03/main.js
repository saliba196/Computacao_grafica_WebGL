/*

Teclas para ativação: 
r para ativar a função de desenhar linha.
t para ativar a função de desenhar triângulo.
k para ativar o modo de alteração de cor.
e para ativar o modo de alteração da espessura.
Troca de cor e espessura: 
- Cor (k): As teclas de 0 a 9 
- Espessura (e): As teclas  de 1 a 9 

*/

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
  const pointSizeLocation = gl.getUniformLocation(program, "pointSize");

  const colors = [
    [0, 0, 1], // Azul
    [1, 0.5, 0], // Laranja
    [0, 1, 0], // Verde
    // Additional colors if needed
  ];
  let currentColor = colors[0];
  let pointSize = 5.0;
  let drawMode = "line"; // 'line', 'triangle', 'color', 'thickness'
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

    if (drawMode === "line") {
      handleLineDraw(x, y);
    } else if (drawMode === "triangle") {
      handleTriangleDraw(x, y);
    }
  });

  function handleLineDraw(x, y) {
    clickPoints.push([x, y]);
    if (clickPoints.length === 2) {
      const [start, end] = clickPoints;
      drawBresenhamLine(
        gl,
        start[0],
        start[1],
        end[0],
        end[1],
        positionBuffer,
        colorUniformLocation,
        pointSizeLocation,
        currentColor,
        pointSize
      );
      clickPoints = [];
    }
  }

  function handleTriangleDraw(x, y) {
    clickPoints.push([x, y]);
    if (clickPoints.length === 3) {
      const [p1, p2, p3] = clickPoints;
      drawTriangleBresenham(
        gl,
        p1,
        p2,
        p3,
        positionBuffer,
        colorUniformLocation,
        pointSizeLocation,
        currentColor,
        pointSize
      );
      clickPoints = [];
    }
  }

  document.body.addEventListener("keydown", (event) => {
    const key = event.key;
    if (drawMode === "color" && key >= "0" && key <= "2") {
      currentColor = colors[parseInt(key)];
    } else if (drawMode === "thickness" && key >= "1" && key <= "9") {
      pointSize = parseInt(key) * 2.0; // Define thickness
    } else if (key === "r" || key === "R") {
      setDrawingMode("line");
    } else if (key === "t" || key === "T") {
      setDrawingMode("triangle");
    } else if (key === "k" || key === "K") {
      setDrawingMode("color");
    } else if (key === "e" || key === "E") {
      setDrawingMode("thickness");
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
    pointSizeLocation,
    color,
    size
  ) {
    const points = calculateBresenhamPoints(x0, y0, x1, y1);
    renderPoints(
      gl,
      points,
      positionBuffer,
      colorLocation,
      pointSizeLocation,
      color,
      size
    );
  }

  function drawTriangleBresenham(
    gl,
    p1,
    p2,
    p3,
    positionBuffer,
    colorLocation,
    pointSizeLocation,
    color,
    size
  ) {
    const points = [
      ...calculateBresenhamPoints(p1[0], p1[1], p2[0], p2[1]),
      ...calculateBresenhamPoints(p2[0], p2[1], p3[0], p3[1]),
      ...calculateBresenhamPoints(p3[0], p3[1], p1[0], p1[1]),
    ];
    renderPoints(
      gl,
      points,
      positionBuffer,
      colorLocation,
      pointSizeLocation,
      color,
      size
    );
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

  function renderPoints(
    gl,
    points,
    positionBuffer,
    colorLocation,
    pointSizeLocation,
    color,
    size
  ) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
    gl.uniform3fv(colorLocation, color);
    gl.uniform1f(pointSizeLocation, size);
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
    pointSizeLocation,
    colors[0],
    pointSize
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
