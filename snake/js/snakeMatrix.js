const canvas = document.getElementById('matrix');
const ctxMatrix = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const fontSize = 20;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(0);

function draw() {
  ctxMatrix.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctxMatrix.fillRect(0, 0, canvas.width, canvas.height);

  ctxMatrix.fillStyle = "#39FF14"; // Neon green color
  ctxMatrix.font = fontSize + "px monospace";

  let active = false; // track if animation should keep going

  drops.forEach((y, index) => {
    const text = String.fromCharCode(33 + Math.random() * 94);
    const x = index * fontSize;
    ctxMatrix.fillText(text, x, y);

    if (y < canvas.height) {
      drops[index] = y + fontSize;
      active = true; // still moving
    }
  });

  // stop when all columns have reached the bottom
  if (!active) {
    clearInterval(rainInterval);
  }
}

const rainInterval = setInterval(draw, 24);

window.addEventListener('resize', () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});
