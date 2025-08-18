const textToType = "0xd3adbeef";
let charIndex = 0;
const speed = 150; // Milliseconds per character

function typeWriter() {
  if (charIndex < textToType.length) {
    document.getElementById("maintext").innerHTML =
      textToType.substring(0, charIndex + 1) + '<span id="cursor">|</span>';
    charIndex++;
    setTimeout(typeWriter, speed);
  } else {
    blinkCursor();
  }
}

function blinkCursor() {
  const cursor = document.getElementById("cursor");
  if (cursor) {
    cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
    setTimeout(blinkCursor, 500);
  }
}

typeWriter();