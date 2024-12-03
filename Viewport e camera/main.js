function main() {
  const canvas = document.querySelector("#canvas");
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });

  if (!gl) {
    throw new Error("WebGL not supported");
  }

  var vertexShaderSource = document.querySelector("#vertex-shader").text;
  var fragmentShaderSource = document.querySelector("#fragment-shader").text;

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  var program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();

  const positionLocation = gl.getAttribLocation(program, `position`);
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

  const colorBuffer = gl.createBuffer();

  const colorLocation = gl.getAttribLocation(program, `color`);
  gl.enableVertexAttribArray(colorLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

  const matrixUniformLocation = gl.getUniformLocation(program, `matrix`);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let vertexData = [];
  vertexData = setSquareVertices([-0.5, -0.5], 1.0, 1.0);

  // Define a cor verde
  let colorData = [];
  const greenColor = [0.0, 1.0, 0.0];
  colorData = setSquareColor(greenColor);

  let matrix = m4.identity();

  function drawSquare() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    matrix = m4.identity();
    matrix = m4.multiply(matrix, set2dClippingWindow(-1.0, 1.0, -1.0, 1.0));
    matrix = m4.multiply(matrix, set2dViewingMatrix([0.0, 0.0], 0.0));
    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  }
  let time = 0;
  let scale = 1.0;

  function animate() {
    time += 0.02;
    scale = 1 + 0.5 * Math.sin(time);

    gl.clear(gl.COLOR_BUFFER_BIT);

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    gl.viewport(0, canvasHeight / 2, canvasWidth / 2, canvasHeight / 2);
    drawWithCameraConfig([-scale, scale, -scale, scale], [0.0, 0.0], 0.0);

    gl.viewport(
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth / 2,
      canvasHeight / 2
    );
    drawWithCameraConfig([-1.0, 1.0, -1.0, 1.0], [0.0, 0.0], time * 45);

    gl.viewport(0, 0, canvasWidth / 2, canvasHeight / 2);
    drawWithCameraConfig([-1.0, 1.0, -1.0, 1.0], [0.5 * scale, 0.0], 0.0);

    gl.viewport(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight / 2);
    drawWithCameraConfig([-1.0, 1.0, -1.0, 1.0], [0.0, 0.5 * scale], 0.0);

    requestAnimationFrame(animate);
  }

  function drawWithCameraConfig(clippingWindow, cameraPosition, rotationAngle) {
    matrix = m4.identity();
    matrix = m4.multiply(matrix, set2dClippingWindow(...clippingWindow));
    matrix = m4.multiply(
      matrix,
      set2dViewingMatrix(cameraPosition, rotationAngle)
    );
    gl.uniformMatrix4fv(matrixUniformLocation, false, matrix);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
  }

  animate();
}
