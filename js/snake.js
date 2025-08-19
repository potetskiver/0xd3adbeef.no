const canvasSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.5);
const cells = 24;
const gridSize = canvasSize / cells;
const snakeCanvas = document.getElementById("snake");
snakeCanvas.width = canvasSize;
snakeCanvas.height = canvasSize;
snakeCanvas.style.border = "4px solid #0f0";
snakeCanvas.style.background = "#222";
snakeCanvas.style.boxShadow = "0 8px 32px rgba(0,255,0,0.2)";
snakeCanvas.style.position = "relative";


// Snake game logic
const ctx = snakeCanvas.getContext("2d");
let snake = [{x: Math.floor(cells/2), y: Math.floor(cells/2)}];
let direction = {x: 1, y: 0};
let food = spawnFood();
let growing = 0;
let gameOver = false;
let lastDirectionChange = 0;
let score = 0;
let oldscore = score;

function spawnFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * cells),
      y: Math.floor(Math.random() * cells)
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

function draw() {
  ctx.clearRect(0, 0, canvasSize, canvasSize);

  // Draw food
  ctx.fillStyle = "#f00";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);

  // Draw snake
  ctx.fillStyle = "#0f0";
  snake.forEach((s, i) => {
    ctx.globalAlpha = i === 0 ? 1 : 0.8;
    ctx.fillRect(s.x * gridSize, s.y * gridSize, gridSize, gridSize);
  });
  ctx.globalAlpha = 1;

  // Game over text
  if (gameOver) {
    ctx.fillStyle = "#fff";
    ctx.font = `bold ${canvasSize/10}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("Game Over!", canvasSize/2, canvasSize/2-50);
    ctx.fillText("Press any key to", canvasSize/2, canvasSize/2);
    ctx.fillText("restart!", canvasSize/2, canvasSize/2+50);
  }
}

function update() {
  const now = Date.now();
  if (gameOver) { 
    oldscore = score;
    score = 0;
    updateScore();
    return;
  }

  // Move snake
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  // Check wall collision
  if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells) {
    gameOver = true;
    draw();
    return;
  }

  // Check self collision
  if (snake.some(s => s.x === head.x && s.y === head.y) &&  lastDirectionChange > 600) {
    gameOver = true;
    draw();
    return;
  }

  snake.unshift(head);

  // Check food
  if (head.x === food.x && head.y === food.y) {
    growing += 2;
    food = spawnFood();
    score++;
    updateScore();
  }

  if (growing > 0) {
    growing--;
  } else {
    snake.pop();
  }

  draw();
}

// Keyboard controls
window.addEventListener("keydown", handleKey);
function handleKey(e) {
  const now = Date.now();
  if (gameOver && e != null) {
    snake = [{x: Math.floor(cells/2), y: Math.floor(cells/2)}];
    direction = {x: 1, y: 0};
    food = spawnFood();
    growing = 0;
    score = 0;
    oldscore = score;
    updateScore();
    gameOver = false;
    draw();
    return;
  }else if(!gameOver && e == null) { 
      return; 
  }
  if (now - lastDirectionChange < 60) return;
  if (e.key === "ArrowUp" || e.key === "w") {
    if(direction.y !== 1){
      direction = {x: 0, y: -1};
      lastDirectionChange = now;
    }else{
      direction = {x: 0, y: 1};
    }
  } else if (e.key === "ArrowDown" || e.key === "s") {
    if(direction.y !== -1){
      direction = {x: 0, y: 1};
      lastDirectionChange = now;
    }else{
      direction = {x: 0, y: -1};
    }
  } else if (e.key === "ArrowLeft" || e.key === "a") {
    if(direction.x !== 1) {
      direction = {x: -1, y: 0};
      lastDirectionChange = now;
    }else {
      direction = {x: 1, y: 0};
    }
  } else if (e.key === "ArrowRight" || e.key === "d") {
    if(direction.x !== -1) {
      direction = {x: 1, y: 0};
      lastDirectionChange = now;
    }else {
      direction = {x: -1, y: 0};
    }
  }
}

// Game loop
let interval = setInterval(update, 100);

function updateScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
}

draw();