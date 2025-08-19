const konamiCode = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
];

let konamiIndex = 0;

document.addEventListener("keydown", function(e) {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      showEasterEgg();
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});

function showEasterEgg() {
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

  const img = document.createElement("img");
  img.src = "./images/bonnie.webp";
  img.style.maxWidth = "95vw";
  img.style.maxHeight = "95vh";
  img.style.borderRadius = "16px";
  img.style.boxShadow = "0 4px 24px rgba(0,0,0,0.7)";

  overlay.appendChild(img);

  overlay.addEventListener("click", () => {
    overlay.remove();
  });

  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.remove();
  }, 10000); // Auto-remove after 10 seconds
}