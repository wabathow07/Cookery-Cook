const animations = {
  spaghetti_carbonara: [
    "boiling_pasta",
    "frying_meat",
    "mixing_eggs",
    "mixing",
    "add_spice",
  ],

  chicken_stir_fry: [
    "chopping",
    "frying_meat",
    "frying_meat",
    "frying_meat",
    "rice",
  ],

  vegetable_curry: [
    "chopping",
    "frying_vegetable",
    "frying_vegetable",
    "boiling",
    "boiling",
  ],

  beef_taco: ["frying_meat", "boiling", "fill_taco_shell", "add_spice"],

  pancake: [
    "mixing",
    "mixing_eggs",
    "flip_pancakes",
    "flip_pancakes",
    "add_spice",
  ],

  caesar_salad: ["chopping", "mixing", "mixing", "serve"],

  tomato_soup: ["chopping", "frying_vegetable", "frying_vegetable", "boiling", "mixing"],

  grilled_salmon: ["add_spice", "frying_meat", "frying_meat", "serve"],

  chocolate_chip_cookie: [
    "mixing",
    "mixing_eggs",
    "mixing",
    "bake",
    "bake",
  ],

  shrimp_fried_rice: [
    "frying_vegetable",
    "frying_vegetable",
    "frying_vegetable",
    "serve",
  ],
};

// ===== COOKING LOGIC =====

const recipeId = localStorage.getItem("currentRecipe");
let step = 1;

const stepImage = document.getElementById("stepImage");
const stepNext = document.getElementById("stepNext");

if (!recipeId) {
  console.warn("No recipe selected!");
} else {
  loadStep();
}

function loadStep() {
  const path = `assets/recipe-text/${recipeId}_${step}.png`;
  stepImage.src = path;

  stepImage.onerror = () => {
    step = 1;
    stepImage.src = `assets/recipe-text/${recipeId}_1.png`;
  };
}

stepNext.onclick = () => {
  step++;
  loadStep();

  animIndex++;
  if (animIndex >= sequence.length) animIndex = 0;
  showAnimation();

  if (window.gameAudio) gameAudio.play("click");

  if (window.gameAudio) gameAudio.play("click");
};

const animationImg = document.getElementById("kitchenAnimation");
const sequence = animations[recipeId] || [];

let animIndex = 0;
function showAnimation() {
  const step = sequence[animIndex];
  animationImg.src = `assets/animations/${step}.gif`;
}

if (sequence.length > 0) {
  showAnimation();
}
