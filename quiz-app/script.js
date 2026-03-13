const ALL = [
  { q: "What does CSS stand for?", a: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System"], c: 1, cat: "css", d: "easy" },
  { q: "Which method converts JSON text to an object?", a: ["JSON.parse", "JSON.stringify", "JSON.objectify"], c: 0, cat: "js", d: "easy" },
  { q: "Which HTML tag links JavaScript?", a: ["<javascript>", "<js>", "<script>"], c: 2, cat: "html", d: "easy" },
  { q: "Which CSS unit is relative to root font-size?", a: ["em", "rem", "vh"], c: 1, cat: "css", d: "medium" },
  { q: "What does Array.prototype.map return?", a: ["A new transformed array", "A boolean", "Nothing"], c: 0, cat: "js", d: "medium" },
  { q: "What attribute improves image LCP?", a: ["priority", "decoding", "fetchpriority"], c: 2, cat: "html", d: "hard" },
  { q: "Which JS concept enables closures?", a: ["Lexical scoping", "Hoisting only", "Type coercion"], c: 0, cat: "js", d: "hard" }
];

const HIGH_KEY = "quiz_pro_highscore_v2";
const highEl = document.getElementById("high");
const qEl = document.getElementById("q");
const choicesEl = document.getElementById("choices");
const stepEl = document.getElementById("step");
const timerEl = document.getElementById("timer");
const streakEl = document.getElementById("streak");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next");
const barFill = document.getElementById("bar-fill");
const setup = document.getElementById("setup");
const quizWrap = document.getElementById("quiz");

let qs = [];
let i = 0;
let score = 0;
let streak = 0;
let locked = false;
let timeLeft = 20;
let timer;

highEl.textContent = localStorage.getItem(HIGH_KEY) || "0";

setup.addEventListener("submit", (e) => {
  e.preventDefault();
  const cat = document.getElementById("category").value;
  const diff = document.getElementById("difficulty").value;
  qs = pickQuestions(cat, diff);
  if (!qs.length) qs = pickQuestions("all", "mixed");
  i = 0; score = 0; streak = 0;
  setup.classList.add("hidden");
  quizWrap.classList.remove("hidden");
  render();
});

nextBtn.addEventListener("click", () => {
  if (!locked) { feedbackEl.textContent = "Choose an answer first."; return; }
  i++;
  if (i >= qs.length) return finish();
  render();
});

function pickQuestions(cat, diff) {
  let rows = ALL.filter((q) => cat === "all" || q.cat === cat);
  rows = rows.filter((q) => diff === "mixed" || q.d === diff);
  return shuffle([...rows]).slice(0, 5);
}

function render() {
  locked = false;
  feedbackEl.textContent = "";
  const item = qs[i];
  stepEl.textContent = `Question ${i + 1} / ${qs.length}`;
  streakEl.textContent = `Streak: ${streak}`;
  barFill.style.width = `${Math.round((i / qs.length) * 100)}%`;
  qEl.textContent = item.q;
  choicesEl.innerHTML = "";

  item.a.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => choose(idx, btn));
    choicesEl.appendChild(btn);
  });

  clearInterval(timer);
  timeLeft = 20;
  timerEl.textContent = `${timeLeft}s`;
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      autoLock();
    }
  }, 1000);
}

function choose(index, btn) {
  if (locked) return;
  locked = true;
  clearInterval(timer);
  const correct = qs[i].c;
  if (index === correct) {
    score++;
    streak++;
    btn.classList.add("correct");
    feedbackEl.textContent = streak >= 2 ? `Correct. ${streak} streak.` : "Correct.";
  } else {
    streak = 0;
    btn.classList.add("wrong");
    choicesEl.children[correct].classList.add("correct");
    feedbackEl.textContent = "Not quite.";
  }
  streakEl.textContent = `Streak: ${streak}`;
}

function autoLock() {
  if (locked) return;
  locked = true;
  streak = 0;
  const correct = qs[i].c;
  choicesEl.children[correct].classList.add("correct");
  feedbackEl.textContent = "Time up.";
  streakEl.textContent = `Streak: ${streak}`;
}

function finish() {
  clearInterval(timer);
  const prevHigh = Number(localStorage.getItem(HIGH_KEY) || "0");
  if (score > prevHigh) {
    localStorage.setItem(HIGH_KEY, String(score));
    highEl.textContent = String(score);
  }
  barFill.style.width = "100%";
  qEl.textContent = `Quiz complete. Score: ${score}/${qs.length}`;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = "Nice run. Start a new round below.";
  nextBtn.textContent = "Play Again";
  nextBtn.onclick = () => location.reload();
}

function shuffle(arr) {
  for (let x = arr.length - 1; x > 0; x--) {
    const y = Math.floor(Math.random() * (x + 1));
    [arr[x], arr[y]] = [arr[y], arr[x]];
  }
  return arr;
}
