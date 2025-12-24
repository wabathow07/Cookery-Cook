// Load last cooked recipe name from localStorage
const lastRecipe = localStorage.getItem("currentRecipe");

const box = document.getElementById("finalDishBox");

if (lastRecipe) {
  const id = lastRecipe.toLowerCase().replace(/\s+/g, "_");

  const img = document.createElement("img");
  img.src = `assets/dishes/${id}_final.png`;
  img.className = "final-dish-img";

  box.appendChild(img);
} else {
  box.innerHTML = `<p style="color:white;font-size:24px;">
    No dish found.
  </p>`;
}
