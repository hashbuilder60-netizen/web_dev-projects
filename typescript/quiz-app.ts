const ALL = [
  {
    q: "What does CSS stand for?",
    a: ["Creative Style Sheets", "Cascading Style Sheets", "Computer Style System"],
    c: 1,
    cat: "css",
    d: "easy",
    exp: "CSS means Cascading Style Sheets, where rules can cascade by specificity and source order."
  },
  {
    q: "Which method converts JSON text to an object?",
    a: ["JSON.parse", "JSON.stringify", "JSON.objectify"],
    c: 0,
    cat: "js",
    d: "easy",
    exp: "JSON.parse converts JSON text into a JavaScript object."
  },
  {
    q: "Which HTML tag links JavaScript?",
    a: ["<javascript>", "<js>", "<script>"],
    c: 2,
    cat: "html",
    d: "easy",
    exp: "The script tag is the standard HTML element for JavaScript."
  },
  {
    q: "Which CSS unit is relative to root font-size?",
    a: ["em", "rem", "vh"],
    c: 1,
    cat: "css",
    d: "medium",
    exp: "rem is based on the root (html) font size, while em is based on the current element."
  },
  {
    q: "What does Array.prototype.map return?",
    a: ["A new transformed array", "A boolean", "Nothing"],
    c: 0,
    cat: "js",
    d: "medium",
    exp: "map always returns a new array containing transformed items."
  },
  {
    q: "What attribute improves image request priority in modern browsers?",
    a: ["priority", "decoding", "fetchpriority"],
    c: 2,
    cat: "html",
    d: "hard",
    exp: "fetchpriority can hint importance for loading resources like LCP images."
  },
  {
    q: "Which JS concept enables closures?",
    a: ["Lexical scoping", "Hoisting only", "Type coercion"],
    c: 0,
    cat: "js",
    d: "hard",
    exp: "Closures work because functions keep access to lexical scope where they were created."
  }
] as const;

type Question = (typeof ALL)[number];

type QuizState = {
  questions: Question[];
  index: number;
  score: number;
  streak: number;
  locked: boolean;
  timeLeft: number;
  timer: number | null;
  finished: boolean;
};

const HIGH_KEY = "quiz_pro_highscore_v3";
const highEl = document.getElementById("high") as HTMLElement | null;
const qEl = document.getElementById("q") as HTMLElement | null;
const choicesEl = document.getElementById("choices") as HTMLElement | null;
const stepEl = document.getElementById("step") as HTMLElement | null;
const timerEl = document.getElementById("timer") as HTMLElement | null;
const streakEl = document.getElementById("streak") as HTMLElement | null;
const feedbackEl = document.getElementById("feedback") as HTMLElement | null;
const explanationEl = document.getElementById("explanation") as HTMLElement | null;
const nextBtn = document.getElementById("next") as HTMLButtonElement | null;
const barFill = document.getElementById("bar-fill") as HTMLElement | null;
const setup = document.getElementById("setup") as HTMLFormElement | null;
const quizWrap = document.getElementById("quiz") as HTMLElement | null;

const state: QuizState = {
  questions: [],
  index: 0,
  score: 0,
  streak: 0,
  locked: false,
  timeLeft: 20,
  timer: null,
  finished: false
};

if (highEl) highEl.textContent = localStorage.getItem(HIGH_KEY) || "0";

setup?.addEventListener("submit", (e) => {
  e.preventDefault();
  const cat = (document.getElementById("category") as HTMLSelectElement | null)?.value ?? "all";
  const diff = (document.getElementById("difficulty") as HTMLSelectElement | null)?.value ?? "mixed";
  const count = Number((document.getElementById("count") as HTMLSelectElement | null)?.value ?? 5);

  state.questions = pickQuestions(cat, diff, count);
  if (!state.questions.length) state.questions = pickQuestions("all", "mixed", count);

  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.finished = false;

  setup.classList.add("hidden");
  quizWrap?.classList.remove("hidden");
  if (nextBtn) nextBtn.textContent = "Next";
  render();
});

nextBtn?.addEventListener("click", () => {
  if (state.finished) {
    location.reload();
    return;
  }
  if (!state.locked) {
    if (feedbackEl) feedbackEl.textContent = "Choose an answer first.";
    return;
  }
  state.index += 1;
  if (state.index >= state.questions.length) {
    finish();
    return;
  }
  render();
});

function pickQuestions(cat: string, diff: string, count: number): Question[] {
  let rows = ALL.filter((q) => cat === "all" || q.cat === cat);
  rows = rows.filter((q) => diff === "mixed" || q.d === diff);
  return shuffle([...rows]).slice(0, Math.min(count, rows.length));
}

function render() {
  state.locked = false;
  if (feedbackEl) feedbackEl.textContent = "";
  if (explanationEl) explanationEl.textContent = "";
  const item = state.questions[state.index];

  if (stepEl) stepEl.textContent = `Question ${state.index + 1} / ${state.questions.length}`;
  if (streakEl) streakEl.textContent = `Streak: ${state.streak}`;
  if (barFill) barFill.style.width = `${Math.round((state.index / state.questions.length) * 100)}%`;
  if (qEl) qEl.textContent = item.q;
  if (choicesEl) choicesEl.innerHTML = "";

  item.a.forEach((label, idx) => {
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.type = "button";
    btn.textContent = label;
    btn.addEventListener("click", () => choose(idx, btn));
    choicesEl?.appendChild(btn);
  });

  if (state.timer) clearInterval(state.timer);
  state.timeLeft = 20;
  if (timerEl) timerEl.textContent = `${state.timeLeft}s`;
  state.timer = window.setInterval(() => {
    state.timeLeft -= 1;
    if (timerEl) timerEl.textContent = `${state.timeLeft}s`;
    if (state.timeLeft <= 0) {
      if (state.timer) clearInterval(state.timer);
      autoLock();
    }
  }, 1000);
}

function choose(index: number, btn: HTMLButtonElement) {
  if (state.locked) return;
  state.locked = true;
  if (state.timer) clearInterval(state.timer);
  const item = state.questions[state.index];
  const correct = item.c;

  if (index === correct) {
    state.score += 1;
    state.streak += 1;
    btn.classList.add("correct");
    if (feedbackEl) feedbackEl.textContent = state.streak >= 2 ? `Correct. ${state.streak} streak.` : "Correct.";
  } else {
    state.streak = 0;
    btn.classList.add("wrong");
    const correctBtn = choicesEl?.children[correct] as HTMLElement | undefined;
    correctBtn?.classList.add("correct");
    if (feedbackEl) feedbackEl.textContent = "Not quite.";
  }

  if (explanationEl) explanationEl.textContent = item.exp;
  if (streakEl) streakEl.textContent = `Streak: ${state.streak}`;
}

function autoLock() {
  if (state.locked) return;
  state.locked = true;
  state.streak = 0;
  const item = state.questions[state.index];
  const correctBtn = choicesEl?.children[item.c] as HTMLElement | undefined;
  correctBtn?.classList.add("correct");
  if (feedbackEl) feedbackEl.textContent = "Time up.";
  if (explanationEl) explanationEl.textContent = item.exp;
  if (streakEl) streakEl.textContent = `Streak: ${state.streak}`;
}

function finish() {
  if (state.timer) clearInterval(state.timer);
  state.finished = true;
  const prevHigh = Number(localStorage.getItem(HIGH_KEY) || "0");
  if (state.score > prevHigh) {
    localStorage.setItem(HIGH_KEY, String(state.score));
    if (highEl) highEl.textContent = String(state.score);
  }
  if (barFill) barFill.style.width = "100%";
  if (qEl) qEl.textContent = `Quiz complete. Score: ${state.score}/${state.questions.length}`;
  if (choicesEl) choicesEl.innerHTML = "";
  if (feedbackEl) feedbackEl.textContent = "Nice run. Click Play Again for another round.";
  if (explanationEl) explanationEl.textContent = "";
  if (nextBtn) nextBtn.textContent = "Play Again";
}

function shuffle<T>(arr: T[]): T[] {
  for (let x = arr.length - 1; x > 0; x -= 1) {
    const y = Math.floor(Math.random() * (x + 1));
    [arr[x], arr[y]] = [arr[y], arr[x]];
  }
  return arr;
}
