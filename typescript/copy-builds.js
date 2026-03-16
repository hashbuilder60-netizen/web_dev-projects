const fs = require("fs");
const path = require("path");

const map = {
  "focusflow-task-planner.js": "focusflow-task-planner/script.js",
  "landing-page-starter.js": "landing-page-starter/script.js",
  "portfolio-website.js": "portfolio-website/script.js",
  "ecommerce-product-page.js": "ecommerce-product-page/script.js",
  "blog-homepage.js": "blog-homepage/script.js",
  "quiz-app.js": "quiz-app/script.js",
  "weather-app.js": "weather-app/script.js"
};

const distDir = path.join(__dirname, "dist");

for (const [file, target] of Object.entries(map)) {
  const src = path.join(distDir, file);
  const dest = path.join(path.resolve(__dirname, ".."), target);
  if (!fs.existsSync(src)) {
    console.error(`Missing build: ${src}`);
    process.exitCode = 1;
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log(`Updated ${target}`);
}
