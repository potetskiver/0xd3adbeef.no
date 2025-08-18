const shortcuts = [
  {
    keys: ["c", "y", "d", "i", "a"],
    index: 0,
    action: () => window.location.href = "http://cydia.0xd3adbeef.no/"
  },
  {
    keys: ["m", "a", "v", "e", "n"],
    index: 0,
    action: () => window.location.href = "http://maven.0xd3adbeef.no/"
  },
  {
    keys: ["g", "i", "t", "h", "u", "b"],
    index: 0,
    action: () => window.location.href = "https://github.com/potetskiver"
  },
  {
    keys: ["o", "l", "d"],
    index: 0,
    action: () => window.location.href = "https://0xd3adbeef.no/old"
  }
];

document.addEventListener("keydown", function(e) {
  shortcuts.forEach(shortcut => {
    if (e.key === shortcut.keys[shortcut.index]) {
      shortcut.index++;
      if (shortcut.index === shortcut.keys.length) {
        shortcut.action();
        shortcut.index = 0;
      }
    } else {
      shortcut.index = 0;
    }
  });
});