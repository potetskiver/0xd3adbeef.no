const cols = 12;
const rows = 24;
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
let username = "";
let promptingName = false;

// Scoring constants
const SCORE_SOFT_DROP = 1;      // Each manual down movement
const SCORE_HARD_DROP = 2;      // Each spacebar drop row
const SCORE_LINE_CLEAR = [100, 300, 500, 800]; // 1,2,3,4 lines

// --- Username ---
function updateUsername() {
  let storedName = localStorage.getItem("username");
  if (storedName && storedName.trim() !== "") {
    username = storedName;
    promptingName = false;
  } else if (!promptingName) {
    promptingName = true;
    username = prompt("Hva vil du kalle deg?");
    if (username && username.trim() !== "") {
      localStorage.setItem("username", username);
      promptingName = false;
    } else {
      username = "Usatt";
      promptingName = false;
    }
  }
  document.getElementById("username").innerText = `Navn: ${username}`;
}

function clearUsername() {
  localStorage.removeItem("username");
  username = "";
  updateUsername();
  initGame();
}

document.getElementById("clear-username").addEventListener("click", clearUsername);

// --- Score ---
function updateScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("highscore").innerText = `Highscore: ${highscore}`;
}

// --- Highscore ---
function loadHighScore() {
  let savedScore = localStorage.getItem("tetris-highscore");
  return savedScore ? parseInt(savedScore) : 0;
}

async function saveHighScore() {
  updateScore();
  if (!username) updateUsername();
  if (!tetrisToken) await getTetrisToken();

  fetch("/tetrisAPI/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-game-token": tetrisToken
    },
    body: JSON.stringify({ name: username, score: highscore })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) console.log("Score submitted!");
    else console.warn("Score submission failed", data.error);
  })
  .catch(err => console.error("Error submitting score:", err));
  tetrisToken = "";
}

async function getHighScore(name) {
  if (!name) {
    name = localStorage.getItem("username");
    if (!name) return 0;
  }
  try {
    const res = await fetch(`/tetrisAPI/score/${encodeURIComponent(name)}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.score === "number" ? data.score : 0;
  } catch (err) {
    console.error("Error fetching highscore:", err);
    return 0;
  }
}

async function updateLeaderboard() {
  try {
    const res = await fetch("/tetrisAPI/leaderboard");
    if (!res.ok) throw new Error("Failed to fetch leaderboard");
    const data = await res.json();
    const left = document.getElementById("leaderboard-list-left");
    const right = document.getElementById("leaderboard-list-right");
    const leaderText = document.getElementById("leaderboard-leader");
    left.innerHTML = "";
    right.innerHTML = "";
    if (data.length === 0) {
      leaderText.innerText = "No scores yet!";
      return;
    }
    data.slice(0, 10).forEach((entry, i) => {
      const li = document.createElement("li");
      li.innerText = `${i + 1}. ${entry.name}: ${entry.score}`;
      left.appendChild(li);
    });
    data.slice(10, 20).forEach((entry, i) => {
      const li = document.createElement("li");
      li.innerText = `${i + 11}. ${entry.name}: ${entry.score}`;
      right.appendChild(li);
    });
    const topPlayer = data[0];
    leaderText.innerText = `${topPlayer.name} leder!`;
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

var leaderboardInterval = setInterval(updateLeaderboard, 30000);

// --- Init ---
async function initGame() {
  if (!username) updateUsername();
  highscore = await getHighScore(username);
  updateLeaderboard();
  updateScore();
  draw();
}
initGame();

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
  if (lines) {
    score += SCORE_LINE_CLEAR[Math.min(lines, SCORE_LINE_CLEAR.length) - 1];
  }
}

function rotate(shape) {
  const rows = shape.length;
  const cols = shape[0].length;
  let rotated = [];
  for (let c = 0; c < cols; c++) {
    rotated[c] = [];
    for (let r = rows - 1; r >= 0; r--) {
      rotated[c][rows - 1 - r] = shape[r][c];
    }
  }
  return rotated;
}

function tryRotate() {
  const rotated = rotate(current);
  if (!collides(x, y, rotated)) {
    current = rotated;
    return;
  }
  const kicks = [
    {dx: -1, dy: 0},
    {dx: 1, dy: 0},
    {dx: 0, dy: -1},
    {dx: 0, dy: 1}
  ];
  for (const kick of kicks) {
    if (!collides(x + kick.dx, y + kick.dy, rotated)) {
      x += kick.dx;
      y += kick.dy;
      current = rotated;
      return;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // what the fuck
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
  if (gameOver) {
    updateScore();
    if (score > highscore) {
      highscore = score;
      saveHighScore();
    }
    return;
  }

  if (!collides(x, y + 1, current)) {
    y++;
  } else {
    merge();
    clearLines();
    spawnTetromino();
  }

  draw();
}

let softDropInterval = null;

window.addEventListener("keydown", e => {
  if (gameOver) {
    grid = Array.from({length: rows}, () => Array(cols).fill(0));
    score = 0;
    gameOver = false;
    spawnTetromino();
    draw();
    return;
  }
  if (e.key === "ArrowDown" || e.key === "s") {
    if (!softDropInterval) {
      softDropInterval = setInterval(() => {
        if (!collides(x, y + 1, current)) {
          y++;
          score += SCORE_SOFT_DROP;
          updateScore();
          draw();
        }
      }, 40);
    }
    if (!collides(x, y + 1, current)) {
      y++;
      score += SCORE_SOFT_DROP;
      updateScore();
      draw();
    }
  } else if (e.key === "ArrowLeft" || e.key === "a") {
    if (!collides(x - 1, y, current)) x--;
    draw();
  } else if (e.key === "ArrowRight" || e.key === "d") {
    if (!collides(x + 1, y, current)) x++;
    draw();
  } else if (e.key === "ArrowUp" || e.key === "w") {
    const rotated = rotate(current);
    if (!collides(x, y, rotated)) current = rotated;
    draw();
  } else if (e.code === "Space") {
    let dropRows = 0;
    while (!collides(x, y + 1, current)) {
      y++;
      dropRows++;
    }
    score += dropRows * SCORE_HARD_DROP;
    updateScore();
    merge();
    clearLines();
    spawnTetromino();
    draw();
  }
});

window.addEventListener("keyup", e => {
  if (e.key === "ArrowDown" || e.key === "s") {
    // Stop fast soft drop when key released
    if (softDropInterval) {
      clearInterval(softDropInterval);
      softDropInterval = null;
    }
  }
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

let tetrisToken = "";

async function getTetrisToken() {
  try {
    const res = await fetch("/tetrisAPI/get-token");
    const data = await res.json();
    tetrisToken = data.token;
  } catch (err) {
    console.error("Could not get Tetris token", err);
    tetrisToken = "";
  }
}