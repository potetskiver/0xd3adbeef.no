const canvasSize = Math.floor(Math.min(window.innerWidth, window.innerHeight) * 0.55);
const cells = 32;
const gridSize = canvasSize / cells;
const snakeCanvas = document.getElementById("snake");
snakeCanvas.width = canvasSize;
snakeCanvas.height = canvasSize;
snakeCanvas.style.border = "4px solid #0f0";
snakeCanvas.style.background = "#222";
snakeCanvas.style.boxShadow = "0 8px 32px rgba(0,255,0,0.2)";
snakeCanvas.style.position = "relative";

document.documentElement.style.setProperty("--canvas-size", canvasSize + "px");


// Snake game logic
const ctx = snakeCanvas.getContext("2d");
let snake = [{x: Math.floor(cells/2), y: Math.floor(cells/2)}];
let food = spawnFood();
let growing = 0;
let gameOver = false;
let score = 0;
let oldscore = score;

let direction = {x: 1, y: 0};
let inputQueue = [];

let username = '';

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
  if (gameOver) { 
    oldscore = score;
    score = 0;

    if(oldscore > highscore){
      highscore = oldscore;
      saveHighScore();
    }

    updateUsername();
    updateScore();
    //updateLeaderboard();
    return;
  }

  // Move snake

  while (inputQueue.length > 0) {
    const nextDir = inputQueue.shift();
    if (!(nextDir.x === -direction.x && nextDir.y === -direction.y)) {
      direction = nextDir;
      break;
    }
  }

  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};

  // Check wall collision
  if (head.x < 0 || head.x >= cells || head.y < 0 || head.y >= cells) {
    gameOver = true;
    draw();
    return;
  }

  // Check self collision
  if (snake.some(s => s.x === head.x && s.y === head.y)) {
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

  if(score > highscore){
      highscore = score;
      updateScore();
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
    inputQueue = [];
    food = spawnFood();
    growing = 0;
    oldscore = score;
    score = 0;
    updateScore();
    saveHighScore();
    gameOver = false;
    draw();
    return;
  }else if(!gameOver && e == null) { 
      return; 
  }

  let newDir;
  if (e.key === "ArrowUp" || e.key === "w") newDir = {x: 0, y: -1};
  else if (e.key === "ArrowDown" || e.key === "s") newDir = {x: 0, y: 1};
  else if (e.key === "ArrowLeft" || e.key === "a") newDir = {x: -1, y: 0};
  else if (e.key === "ArrowRight" || e.key === "d") newDir = {x: 1, y: 0};

  if (newDir) {
    if (inputQueue.length < 2) {
      inputQueue.push(newDir);
    }
  }
}

// Game loop
let interval = setInterval(update, 100);

let gameToken = "";

function getGameToken() {
  return fetch("/api/get-token")
    .then(res => res.json())
    .then(data => {
      gameToken = data.token;
    });
}


function updateScore() {
  document.getElementById("score").innerText = `Score: ${score}`;
  document.getElementById("highscore").innerText = `Highscore: ${highscore}`;
}

function loadHighScore() {
  let savedScore = localStorage.getItem("highscore");
  return savedScore ? parseInt(savedScore) : 0;
}

async function saveHighScore() {
    updateScore();

    if (!username || username == null) {
        updateUsername(); // ensure both exist
        return;
    }

    if (!gameToken) {
        await getGameToken();
    }

    fetch("/api/submit", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-game-token": gameToken
        },
        body: JSON.stringify({ name: username, score: highscore })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) console.log("Score submitted!");
        else console.warn("Score submission failed", data.error);
    })
    .catch(err => console.error("Error submitting score:", err));
    gameToken = "";
}

async function getHighScore(name) {
    // Use stored username if none provided
    if (!name) {
        name = localStorage.getItem("username");
        if (!name) return 0;
    }

    try {
        const res = await fetch(`/api/score/${encodeURIComponent(name)}`);
        if (!res.ok) {
            console.warn(`Failed to fetch highscore for ${name}: ${res.status}`);
            return 0;
        }

        const data = await res.json();
        // Ensure data.score is a number
        return typeof data.score === "number" ? data.score : 0;
    } catch (err) {
        console.error("Error fetching highscore:", err);
        return 0;
    }
    
}


function updateUsername() {
    // Load from localStorage
    let storedName = localStorage.getItem("username");

    if (storedName && storedName.trim() !== "") {
        username = storedName;
    } else {
        // Ask user
        username = prompt("Hva vil du kalle deg?");
        if (username && username.trim() !== "") {
            localStorage.setItem("username", username);
        } else {
            username = "Usatt"; // fallback
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

async function updateLeaderboard() {
    try {
        const res = await fetch("/api/leaderboard");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();
        const list = document.getElementById("leaderboard-list");
        const leaderText = document.getElementById("leaderboard-leader");
        list.innerHTML = "";

        if (data.length === 0) {
            leaderText.innerText = "No scores yet!";
            return;
        }

        data.slice(0, 15).forEach(entry => {
            const li = document.createElement("li");
            li.innerText = `${entry.name}: ${entry.score}`;
            list.appendChild(li);
        });

        // Show current leader
        const topPlayer = data[0];
        leaderText.innerText = `${topPlayer.name} leder!`;

    } catch (err) {
        console.error("Error loading leaderboard:", err);
    }
}

setInterval(updateLeaderboard, 30000); // Update every half-minute


async function initGame() {
    // Ensure username exists
    if (!username) {
        updateUsername();
    }

    // Wait for highscore from server
    highscore = await getHighScore(username);

    updateLeaderboard();
    updateScore();
    draw();
}

initGame();