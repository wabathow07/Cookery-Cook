const PER_PAGE = 3;

// Convert recipe name → file-friendly id
function recipeId(name) {
  return name.toLowerCase().replace(/\s+/g, "_");
}

// Load user ingredients from localStorage
function loadUserIngredients() {
  const raw = localStorage.getItem("fridgeIngredients");
  if (!raw) return new Set();
  try {
    const arr = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

// Check if ALL ingredients match
function isFullMatch(recipe, userSet) {
  return recipe.ingredients.every((i) => userSet.has(i));
}

// Count matching ingredients
function countMatches(recipe, userSet) {
  return recipe.ingredients.filter((i) => userSet.has(i)).length;
}

async function init() {
  const container = document.getElementById("recipesContainer");
  const fullImageBox = document.getElementById("recipeDescription");
  const leftBtn = document.getElementById("pageLeft");
  const rightBtn = document.getElementById("pageRight");

  // Load recipe list from your JSON file
  const res = await fetch("assets/data/recipes.json");
  const recipes = await res.json();

  // Load user ingredients
  const user = loadUserIngredients();

  // First find full matches
  let matched = recipes.filter((r) => isFullMatch(r, user));

  // If none → show partial matches sorted by most matches
  if (matched.length === 0) {
    matched = recipes
      .map((r) => ({
        recipe: r,
        count: countMatches(r, user),
      }))
      .filter((o) => o.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((o) => o.recipe);
  }

  let page = 0;

  function renderPage() {
    container.innerHTML = "";
    fullImageBox.innerHTML = ""; // clear full recipe right side

    const start = page * PER_PAGE;
    const slice = matched.slice(start, start + PER_PAGE);

    slice.forEach((recipe) => {
      const id = recipeId(recipe.name);

      const btn = document.createElement("button");
      btn.style.cssText =
        "background:none;border:none;padding:0;margin:0;cursor:pointer;";

      const img = document.createElement("img");
      img.src = `assets/recipes/${id}_preview.png`;
      img.classList.add("recipe-preview");
      btn.appendChild(img);

      // Click → show full recipe image
      btn.onclick = () => {
        const full = document.createElement("img");
        full.src = `assets/recipes/${id}_full_recipe.png`;
        full.className = "full-recipe-image";

        fullImageBox.innerHTML = "";
        fullImageBox.appendChild(full);

        if (window.gameAudio) gameAudio.play("click");

        localStorage.setItem("currentRecipe", id);
      };

      container.appendChild(btn);
    });

    const totalPages = Math.ceil(matched.length / PER_PAGE);
    leftBtn.style.opacity = page > 0 ? 1 : 0.3;
    rightBtn.style.opacity = page < totalPages - 1 ? 1 : 0.3;
  }

  leftBtn.onclick = () => {
    if (page > 0) page--;
    renderPage();
  };

  rightBtn.onclick = () => {
    const totalPages = Math.ceil(matched.length / PER_PAGE);
    if (page < totalPages - 1) page++;
    renderPage();
  };

  renderPage();
}

bookmark.addEventListener("click", () => {
  // bookmark flies out
  bookmark.classList.add("clicked");

  // blur screen AFTER bookmark leaves
  setTimeout(() => {
    screenWrap.classList.add("screen-blur");
    document.querySelector(".bg-layer").classList.add("blurred");
  }, 500);

  // change background while blurred
  setTimeout(() => {
    const bg = document.querySelector(".bg-layer");
    bg.style.backgroundImage = "url('assets/backgrounds/recipes_screen0.png')";
  }, 800);

  // unblur smoothly
  setTimeout(() => {
    screenWrap.classList.remove("screen-blur");
    document.querySelector(".bg-layer").classList.remove("blurred");
  }, 1300);
});

init();
