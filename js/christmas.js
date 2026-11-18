//snøfall
(() => {
  const snow = document.createElement('canvas');
  snow.style.cssText = 'position:fixed;top:0;left:0;z-index:2;pointer-events:none;';
  document.body.appendChild(snow);
  const ctx = snow.getContext('2d');

  const resize = () => {
    snow.width = window.innerWidth;
    snow.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const flakes = Array.from({ length: 120 }, () => ({
    x: Math.random() * snow.width,
    y: Math.random() * snow.height,
    r: 1 + Math.random() * 3,
    speed: 0.5 + Math.random() * 1.5,
    drift: Math.random() * Math.PI * 2
  }));

  function fall() {
    ctx.clearRect(0, 0, snow.width, snow.height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    flakes.forEach(f => {
      f.y += f.speed;
      f.drift += 0.01;
      f.x += Math.sin(f.drift) * 0.5;
      if (f.y > snow.height) {
        f.y = -f.r;
        f.x = Math.random() * snow.width;
      }
      ctx.moveTo(f.x, f.y);
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    });
    ctx.fill();
    requestAnimationFrame(fall);
  }
  fall();
})();
