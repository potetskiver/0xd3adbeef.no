const cols = 10;
const rows = 20;
const maxWidth = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.45);
const gridSize = 24;
const canvasWidth = gridSize * cols;
const canvasHeight = gridSize * rows;
const tetrisCanvas = document.getElementById("tetris");
tetrisCanvas.width = canvasWidth;
tetrisCanvas.height = canvasHeight;
tetrisCanvas.style.border = "4px solid #0f0";
tetrisCanvas.style.background = "#222";
tetrisCanvas.style.boxShadow = "0 8px 32px rgba(0,255,0,0.2)";
tetrisCanvas.style.position = "relative";

const ctx = tetrisCanvas.getContext("2d");

// Tetromino shapes
const tetrominoes = [
  [[1,1,1,1]], // I
  [[1,1,0],[0,1,1]], // Z
  [[0,1,1],[1,1,0]], // S
  [[1,1],[1,1]], // O
  [[1,1,1],[0,1,0]], // T
  [[1,0,0],[1,1,1]], // J
  [[0,0,1],[1,1,1]], // L
];
const colors = ["cyan","red","green","yellow","purple","blue","orange"];

let grid = Array.from({length: rows}, () => Array(cols).fill(0));
let current, currentColor, x, y, gameOver = false, score = 0, highscore = 0;

function spawnTetromino() {
  const idx = Math.floor(Math.random() * tetrominoes.length);
  current = tetrominoes[idx].map(row => [...row]);
  currentColor = colors[idx];
  x = Math.floor(cols/2) - Math.floor(current[0].length/2);
  y = 0;
  if (collides(x, y, current)) {
    gameOver = true;
  }
}

function collides(nx, ny, shape) {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        let gx = nx + c, gy = ny + r;
        if (gx < 0 || gx >= cols || gy >= rows || (gy >= 0 && grid[gy][gx])) {
          return true;
        }
      }
    }
  }
  return false;
}

function merge() {
  for (let r = 0; r < current.length; r++) {
    for (let c = 0; c < current[r].length; c++) {
      if (current[r][c]) {
        grid[y + r][x + c] = colors.indexOf(currentColor) + 1;
      }
    }
  }
}

function clearLines() {
  let lines = 0;
  for (let r = rows - 1; r >= 0; r--) {
    if (grid[r].every(cell => cell)) {
      grid.splice(r, 1);
      grid.unshift(Array(cols).fill(0));
      lines++;
      r++;
    }
  }
  if (lines) score += lines * 100;
}

function rotate(shape) {
  // Clockwise rotation
  return shape[0].map((_, i) => shape.map(row => row[row.length - 1 - i]));
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) {
        ctx.fillStyle = colors[grid[r][c]-1];
        ctx.fillRect(c * gridSize, r * gridSize, gridSize, gridSize);
        ctx.strokeStyle = "#222";
        ctx.strokeRect(c * gridSize, r * gridSize, gridSize, gridSize);
      }
    }
  }

  // Draw current tetromino
  if (!gameOver) {
    ctx.fillStyle = currentColor;
    for (let r = 0; r < current.length; r++) {
      for (let c = 0; c < current[r].length; c++) {
        if (current[r][c]) {
          ctx.fillRect((x + c) * gridSize, (y + r) * gridSize, gridSize, gridSize);
          ctx.strokeStyle = "#222";
          ctx.strokeRect((x + c) * gridSize, (y + r) * gridSize, gridSize, gridSize);
        }
      }
    }
  }

  // Game over text
  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${canvasWidth/10}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvasWidth/2, canvasHeight/2-50);
    ctx.fillText("Press any key", canvasWidth/2, canvasHeight/2);
    ctx.fillText("to restart!", canvasWidth/2, canvasHeight/2+50);
  }
}

function update() {
  if (gameOver) return;

  if (!collides(x, y + 1, current)) {
    y++;
  } else {
    merge();
    clearLines();
    spawnTetromino();
  }
  draw();
}

window.addEventListener("keydown", e => {
  if (gameOver) {
    grid = Array.from({length: rows}, () => Array(cols).fill(0));
    score = 0;
    gameOver = false;
    spawnTetromino();
    draw();
    return;
  }
  if (e.key === "ArrowLeft" || e.key === "a") {
    if (!collides(x - 1, y, current)) x--;
  } else if (e.key === "ArrowRight" || e.key === "d") {
    if (!collides(x + 1, y, current)) x++;
  } else if (e.key === "ArrowDown" || e.key === "s") {
    if (!collides(x, y + 1, current)) y++;
  } else if (e.key === "ArrowUp" || e.key === "w") {
    const rotated = rotate(current);
    if (!collides(x, y, rotated)) current = rotated;
  } else if (e.code === "Space") {
    // Instant drop
    while (!collides(x, y + 1, current)) {
      y++;
    }
    merge();
    clearLines();
    spawnTetromino();
  }
  draw();
});

// Game loop
let interval;
function startGame() {
  spawnTetromino();
  draw();
  if (interval) clearInterval(interval);
  interval = setInterval(update, 400);
}
startGame();