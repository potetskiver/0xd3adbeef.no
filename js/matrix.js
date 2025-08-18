const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters = Array(256).join("0").split("");
const fontSize = 20;
const columns = canvas.width / fontSize;

function draw() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#39FF14"; // Neon green color
  ctx.font = fontSize + "px monospace";

  letters.forEach((y, index) => {
    const text = String.fromCharCode(33 + Math.random() * 94); // ASCII only
    const x = index * fontSize;
    ctx.fillText(text, x, y);
    letters[index] = y > canvas.height + Math.random() * 8000 ? 0 : y + fontSize;
  });
}
setInterval(draw, 24);

window.addEventListener('resize', () => {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
});
