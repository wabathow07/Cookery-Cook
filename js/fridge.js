const input = document.getElementById("ingredientInput");
const list = document.getElementById("ingredientList");
const searchBtn = document.getElementById("searchBtn");
const suggestions = document.getElementById("ingredientSuggestions");

const availableIngredients = [
  "baking_powder",
  "butter",
  "caesar_dressing",
  "carrot",
  "cheddar_cheese",
  "chicken_breast",
  "chocolate_chip",
  "coconut_milk",
  "cooked_rice",
  "crouton",
  "curry_paste",
  "egg",
  "flour",
  "garlic",
  "ginger",
  "green_bell_pepper",
  "grilled_chicken",
  "ground_beef",
  "lemon",
  "lettuce",
  "milk",
  "olive_oil",
  "onion",
  "pancetta",
  "parmesan_cheese",
  "pepper",
  "potato",
  "red_bell_pepper",
  "romaine_lettuce",
  "salmon_fillet",
  "salt",
  "sesame_oil",
  "shrimp",
  "soy_sauce",
  "spaghetti",
  "sugar",
  "taco_seasoning",
  "taco_shells",
  "tomato",
  "vanilla_extract",
  "vegetable_broth",
  "vegetable_oil",
  "zucchini",
];

// ---- Helpers ----
function prettyName(filename) {
  return filename.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toFilename(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "_");
}

function normalizeForMatch(str) {
  return str.toLowerCase().replace(/[\s_]+/g, "");
}

// =========================
// AUTOCOMPLETE
// =========================
input.addEventListener("input", () => {
  const raw = input.value || "";
  const val = raw.trim().toLowerCase();

  if (!val) {
    suggestions.style.display = "none";
    return;
  }

  const norm = normalizeForMatch(val);

  const matches = availableIngredients.filter((item) =>
    normalizeForMatch(item).startsWith(norm)
  );

  if (matches.length === 0) {
    suggestions.style.display = "none";
    return;
  }

  suggestions.innerHTML = "";
  matches.forEach((filename) => {
    const li = document.createElement("li");
    li.textContent = prettyName(filename);
    li.dataset.filename = filename;

    li.addEventListener("click", () => {
      input.value = prettyName(filename);
      input.dataset.realName = filename;
      suggestions.style.display = "none";
    });

    suggestions.appendChild(li);
  });

  suggestions.style.display = "block";
});

// hide dropdown when clicked outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    suggestions.style.display = "none";
  }
});

// keyboard navigation
input.addEventListener("keydown", (e) => {
  const items = Array.from(suggestions.querySelectorAll("li"));
  if (!items.length) return;

  const active = suggestions.querySelector(".active");

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (!active) items[0].classList.add("active");
    else {
      active.classList.remove("active");
      (active.nextElementSibling || items[0]).classList.add("active");
    }
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (!active) items[items.length - 1].classList.add("active");
    else {
      active.classList.remove("active");
      (active.previousElementSibling || items[items.length - 1]).classList.add(
        "active"
      );
    }
  } else if (e.key === "Enter") {
    e.preventDefault();
    const choose = active || items[0];
    if (choose) choose.click();
  }
});

// =========================
// SAVE / LOAD INGREDIENTS
// =========================
function saveIngredients() {
  const items = [...document.querySelectorAll(".ingredient-item img")];
  const names = items.map((img) => img.dataset.filename);
  localStorage.setItem("fridgeIngredients", JSON.stringify(names));
}

function loadIngredients() {
  const saved = JSON.parse(localStorage.getItem("fridgeIngredients") || "[]");
  saved.forEach((name) => addIngredient(name, true));
}

// =========================
// ADD INGREDIENT
// =========================
function addIngredient(filename, fromLoad = false) {
  // If user clicked add (not loading from storage)
  if (!filename) {
    filename = input.dataset.realName || toFilename(input.value || "");
    filename = filename.replace(/_+/g, "_");

    if (!availableIngredients.includes(filename)) return;
  }

  // =======================================================
  // CHECK FOR DUPLICATE (don't let user add the same item)
  // =======================================================
  const already = [...document.querySelectorAll(".ingredient-item img")].some(
    (img) => img.dataset.filename === filename
  );

  if (already) {
    input.value = "";
    input.dataset.realName = "";
    suggestions.style.display = "none";
    return; // stop — already added
  }

  // =======================================================

  // === create DOM item ===
  const item = document.createElement("div");
  item.className = "ingredient-item";

  const img = document.createElement("img");
  img.src = `assets/ingredients/${filename}.png`;
  img.title = ""; // remove default tooltip
  img.dataset.filename = filename;

  // custom tooltip
  const tooltip = document.createElement("div");
  tooltip.className = "ingredient-tooltip";
  tooltip.textContent = prettyName(filename);

  const del = document.createElement("button");
  del.className = "remove-ingredient";

  const delImg = document.createElement("img");
  delImg.src = "assets/buttons/delete_button.png";
  delImg.draggable = false;

  del.appendChild(delImg);

  item.appendChild(img);
  item.appendChild(del);
  item.appendChild(tooltip); // add tooltip here
  list.appendChild(item);

  del.onclick = () => {
    item.remove();
    if (window.gameAudio) gameAudio.play("remove");
    saveIngredients();
  };

  item.appendChild(img);
  item.appendChild(del);
  list.appendChild(item);

  if (!fromLoad) saveIngredients();

  input.value = "";
  input.dataset.realName = "";
  suggestions.style.display = "none";
}

searchBtn.onclick = () => addIngredient();

// load saved items on page start
window.addEventListener("DOMContentLoaded", loadIngredients);
