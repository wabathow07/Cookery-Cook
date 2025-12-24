const chicken = document.getElementById("chicken");
const startBtn = document.getElementById("startBtn");

chicken.addEventListener("click", () => {
  chicken.src = "assets/interactives/screaming_chick.png";
  chicken.style.transform = "translateY(-3.7px)";
  new Audio("assets/click.mp3").play();
  setTimeout(() => {
    chicken.src = "assets/interactives/normal_chick.png";
    chicken.style.transform = "translateY(0)"; // return to normal
  }, 200);
});

startBtn.addEventListener("click", () => {
  location.href = "fridge.html";
});

// ripple
document.addEventListener("click", (e) => {
  const ripple = document.createElement("div");
  ripple.className = "click-ripple";

  ripple.style.left = `${e.clientX}px`;
  ripple.style.top = `${e.clientY}px`;

  document.body.appendChild(ripple);

  // Remove after animation
  setTimeout(() => {
    ripple.remove();
  }, 700);
});


