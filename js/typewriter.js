const textToType = "0xd3adbeef";
let charIndex = 0;
const speed = 200; // Milliseconds per character

function typeWriter() {
  if (charIndex < textToType.length) {
    document.getElementById("maintext").innerHTML =
      textToType.substring(0, charIndex + 1) + '<span id="cursor">|</span>';
    charIndex++;
    setTimeout(typeWriter, speed);
  } else {
    blinkCursor();

    const buttonRows = document.querySelectorAll('.button-row');
    buttonRows.forEach(row => row.classList.add('fade-in'));

    const footer = document.querySelector('.footer');
    if (footer) {
      footer.classList.add('fade-in');
    }
  }
}

function blinkCursor() {
  const cursor = document.getElementById("cursor");
  if (cursor) {
    cursor.style.visibility = cursor.style.visibility === "hidden" ? "visible" : "hidden";
    setTimeout(blinkCursor, 500);
  }
}

setTimeout(() => { 
  typeWriter();
}, 250);