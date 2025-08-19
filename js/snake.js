const snakeKeys = [
    "s", "n",
    "a", "k",
    "e"
];

let snakeIndex = 0;

document.addEventListener("keydown", function(e) {
  if (e.key === snakeKeys[snakeIndex]) {
    snakeIndex++;
    if (snakeIndex === snakeKeys.length) {
      showSnake();
      snakeIndex = 0;
    }
  } else {
    snakeIndex = 0;
  }
});

function showSnake() {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.8)";
  overlay.style.display = "flex";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  // Use integer pixel size for canvas
  const canvasSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.3);
  const gridSize = canvasSize / 16;
  const cells = 16;
  const canvas = document.createElement("canvas");
  canvas.width = canvasSize;
  canvas.height = canvasSize;
  canvas.style.border = "4px solid #0f0";
  canvas.style.background = "#222";
  //canvas.style.borderRadius = "24px";
  canvas.style.boxShadow = "0 8px 32px rgba(0,255,0,0.2)";
  canvas.style.position = "relative";
  overlay.appendChild(canvas);

  document.body.appendChild(overlay);

  // Remove overlay on click or after 60 seconds
  overlay.addEventListener("click", () => overlay.remove());

  // Snake game logic
  const ctx = canvas.getContext("2d");
  let snake = [{x: Math.floor(cells/2), y: Math.floor(cells/2)}];
  let direction = {x: 1, y: 0};
  let food = spawnFood();
  let growing = 0;
  let gameOver = false;
  let lastDirectionChange = 0;
  let score = 0;

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

    ctx.fillStyle = "#fff";
    ctx.font = `bold ${canvasSize/12}px sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(`Score: ${score}`, canvasSize / 2, canvasSize / 10);

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
    if (gameOver) { 
      score = 0; 
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
    if (snake.some(s => s.x === head.x && s.y === head.y) && now - lastDirectionChange > 80) {
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
      gameOver = false;
      draw();
      return;
    }else if(!gameOver && e == null) { 
        return; 
    }
    if (now - lastDirectionChange < 30) return;
    if (e.key === "ArrowUp" || e.key === "w" && direction.y !== 1) {
      direction = {x: 0, y: -1};
      lastDirectionChange = now;
    } else if (e.key === "ArrowDown" || e.key === "s" && direction.y !== -1) {
      direction = {x: 0, y: 1};
      lastDirectionChange = now;
    } else if (e.key === "ArrowLeft" || e.key === "a" && direction.x !== 1) {
      direction = {x: -1, y: 0};
      lastDirectionChange = now;
    } else if (e.key === "ArrowRight" || e.key === "d" && direction.x !== -1) {
      direction = {x: 1, y: 0};
      lastDirectionChange = now;
    }
  }

  // Game loop
  let interval = setInterval(update, 100);

  // Clean up listeners when overlay is removed
  overlay.addEventListener("remove", () => {
    clearInterval(interval);
    window.removeEventListener("keydown", handleKey);
  });

  // Custom remove event for cleanup
  const observer = new MutationObserver(() => {
    if (!document.body.contains(overlay)) {
      clearInterval(interval);
      window.removeEventListener("keydown", handleKey);
      observer.disconnect();
    }
  });
  observer.observe(document.body, {childList: true});

  draw();
}