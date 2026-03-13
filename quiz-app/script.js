const QUESTIONS = [
  { q: "What does CSS stand for?", a: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System"], c: 1 },
  { q: "Which method converts JSON text to an object?", a: ["JSON.parse", "JSON.stringify", "JSON.objectify"], c: 0 },
  { q: "Which keyword creates block-scoped variables?", a: ["var", "const", "int"], c: 1 },
  { q: "Which HTML tag links JavaScript?", a: ["<javascript>", "<js>", "<script>"], c: 2 },
  { q: "Which array method transforms each item?", a: ["forEach", "map", "filter"], c: 1 }
];

const HIGH_KEY = "quiz_pro_highscore";
const highEl = document.getElementById("high");
const qEl = document.getElementById("q");
const choicesEl = document.getElementById("choices");
const stepEl = document.getElementById("step");
const timerEl = document.getElementById("timer");
const feedbackEl = document.getElementById("feedback");
const nextBtn = document.getElementById("next");
const barFill = document.getElementById("bar-fill");

let qs = shuffle([...QUESTIONS]);
let i = 0;
let score = 0;
let locked = false;
let timeLeft = 20;
let timer;

highEl.textContent = localStorage.getItem(HIGH_KEY) || "0";
render();

nextBtn.addEventListener("click", () => {
  if (!locked) {
    feedbackEl.textContent = "Choose an answer first.";
    return;
  }
  i++;
  if (i >= qs.length) return finish();
  render();
});

function render() {
  locked = false;
  feedbackEl.textContent = "";
  const item = qs[i];
  stepEl.textContent = `Question ${i + 1} / ${qs.length}`;
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
    btn.classList.add("correct");
    feedbackEl.textContent = "Correct.";
  } else {
    btn.classList.add("wrong");
    choicesEl.children[correct].classList.add("correct");
    feedbackEl.textContent = "Not quite.";
  }
}

function autoLock() {
  if (locked) return;
  locked = true;
  const correct = qs[i].c;
  choicesEl.children[correct].classList.add("correct");
  feedbackEl.textContent = "Time up.";
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
  feedbackEl.textContent = "Great work. Click restart to try again.";
  nextBtn.textContent = "Restart";
  nextBtn.onclick = () => location.reload();
}

function shuffle(arr) {
  for (let x = arr.length - 1; x > 0; x--) {
    const y = Math.floor(Math.random() * (x + 1));
    [arr[x], arr[y]] = [arr[y], arr[x]];
  }
  return arr;
}