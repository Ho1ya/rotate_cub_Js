const cols = 80, rows = 40;
let A = 0, B = 0;

process.stdout.write("\x1b[2J\x1b[?25l");
process.on("SIGINT", () => { 
  process.stdout.write("\x1b[?25h\x1b[0m\n");
  process.exit(0);
});

function rotate(x, y, z, A, B) {
  const cosA = Math.cos(A), sinA = Math.sin(A);
  const cosB = Math.cos(B), sinB = Math.sin(B);

  // вращение вокруг Y
  let x1 = x * cosA - z * sinA;
  let z1 = x * sinA + z * cosA;

  // вращение вокруг X
  let y1 = y * cosB - z1 * sinB;
  let z2 = y * sinB + z1 * cosB;

  return [x1, y1, z2];
}

function project(x, y, z) {
  const scale = 20;
  const dist = 5;
  const f = scale / (z + dist);
  const px = Math.floor(cols / 2 + f * x);
  const py = Math.floor(rows / 2 - f * y);
  return [px, py];
}

function drawFrame() {
  let buffer = Array.from({ length: rows }, () => Array(cols).fill(" "));

  const size = 1;
  const vertices = [
    [-size, -size, -size],
    [ size, -size, -size],
    [ size,  size, -size],
    [-size,  size, -size],
    [-size, -size,  size],
    [ size, -size,  size],
    [ size,  size,  size],
    [-size,  size,  size]
  ];

  const edges = [
    [0,1],[1,2],[2,3],[3,0],
    [4,5],[5,6],[6,7],[7,4],
    [0,4],[1,5],[2,6],[3,7]
  ];

  const rotated = vertices.map(([x,y,z]) => rotate(x,y,z,A,B));
  const projected = rotated.map(([x,y,z]) => project(x,y,z));

  for (let [a,b] of edges) {
    let [x0,y0] = projected[a];
    let [x1,y1] = projected[b];

    const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0>=0 && x0<cols && y0>=0 && y0<rows) buffer[y0][x0] = "#";
      if (x0 === x1 && y0 === y1) break;
      let e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  process.stdout.write("\x1b[H");
  for (let row of buffer) {
    process.stdout.write(row.join("") + "\n");
  }

  A += 0.05;
  B += 0.03;
}

setInterval(drawFrame, 50);