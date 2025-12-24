const fs = require("fs");

const folder = "./assets/ingredients/";

const files = fs.readdirSync(folder);

const ingredients = files
  .filter(f => f.endsWith(".png"))
  .map(f => f.replace(".png", ""));

console.log("const availableIngredients =", JSON.stringify(ingredients, null, 2), ";");
