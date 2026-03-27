(() => {
type Priority = "high" | "medium" | "low";

type Task = {
  id: string;
  title: string;
  due: string | null;
  priority: Priority;
  done: boolean;
  createdAt: number;
};

const $ = (id: string) => document.getElementById(id);

const el = {
  form: $("task-form") as HTMLFormElement | null,
  input: $("task-input") as HTMLInputElement | null,
  due: $("task-date") as HTMLInputElement | null,
  priority: $("task-priority") as HTMLSelectElement | null,
  search: $("search") as HTMLInputElement | null,
  status: $("status-filter") as HTMLSelectElement | null,
  sort: $("sort-by") as HTMLSelectElement | null,
  clear: $("clear-completed") as HTMLButtonElement | null,
  list: $("task-list") as HTMLUListElement | null,
  empty: $("empty") as HTMLElement | null,
  total: $("total") as HTMLElement | null,
  completed: $("completed") as HTMLElement | null,
  overdue: $("overdue") as HTMLElement | null,
  progress: $("progress") as HTMLElement | null,
  listWrap: $("list-wrap") as HTMLElement | null,
  boardWrap: $("board-wrap") as HTMLElement | null,
  listBtn: $("list-view") as HTMLButtonElement | null,
  boardBtn: $("board-view") as HTMLButtonElement | null,
  colHigh: $("col-high") as HTMLElement | null,
  colMedium: $("col-medium") as HTMLElement | null,
  colLow: $("col-low") as HTMLElement | null,
  openCapture: $("open-capture") as HTMLButtonElement | null,
  captureDialog: $("capture-dialog") as HTMLDialogElement | null,
  captureForm: $("capture-form") as HTMLFormElement | null,
  captureInput: $("capture-input") as HTMLInputElement | null,
  closeCapture: $("close-capture") as HTMLButtonElement | null
};

const KEY = "focusflow_pro_v3";
let tasks: Task[] = load();
let view: "list" | "board" = "list";

if (el.form && el.input && el.priority && el.due) {
  el.form.addEventListener("submit", (e) => {
    e.preventDefault();
    createTask(el.input!.value.trim(), el.priority!.value as Priority, el.due!.value || null);
    el.form!.reset();
    el.priority!.value = "medium";
  });
}

if (el.captureForm && el.captureInput && el.captureDialog) {
  el.captureForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createTask(el.captureInput!.value.trim(), "medium", null);
    el.captureDialog!.close();
    el.captureForm!.reset();
  });
}

el.openCapture?.addEventListener("click", () => el.captureDialog?.showModal());
el.closeCapture?.addEventListener("click", () => el.captureDialog?.close());

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "k") {
    e.preventDefault();
    el.captureDialog?.showModal();
  }
});

[el.search, el.status, el.sort].forEach((n) => n?.addEventListener("input", render));
el.clear?.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

el.listBtn?.addEventListener("click", () => setView("list"));
el.boardBtn?.addEventListener("click", () => setView("board"));

render();

function setView(mode: "list" | "board") {
  view = mode;
  el.listWrap?.classList.toggle("hidden", mode !== "list");
  el.boardWrap?.classList.toggle("hidden", mode !== "board");
  el.listBtn?.classList.toggle("active", mode === "list");
  el.boardBtn?.classList.toggle("active", mode === "board");
}

function createTask(title: string, priority: Priority, due: string | null) {
  if (!title) return;
  tasks.unshift({ id: crypto.randomUUID(), title, due, priority, done: false, createdAt: Date.now() });
  save();
  render();
}

function visibleTasks(): Task[] {
  const q = el.search?.value.trim().toLowerCase() ?? "";
  const status = el.status?.value ?? "all";
  const sort = el.sort?.value ?? "created";
  const priorityRank: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

  let rows = tasks.filter((t) => t.title.toLowerCase().includes(q));
  if (status === "active") rows = rows.filter((t) => !t.done);
  if (status === "done") rows = rows.filter((t) => t.done);

  rows.sort((a, b) => {
    if (sort === "priority") return priorityRank[a.priority] - priorityRank[b.priority];
    if (sort === "due") return (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31");
    return b.createdAt - a.createdAt;
  });
  return rows;
}

function render() {
  const rows = visibleTasks();
  if (!el.list || !el.colHigh || !el.colMedium || !el.colLow) return;

  el.list.innerHTML = "";
  el.colHigh.innerHTML = "";
  el.colMedium.innerHTML = "";
  el.colLow.innerHTML = "";
  if (el.empty) el.empty.hidden = rows.length > 0;

  rows.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task${task.done ? " done" : ""}`;
    li.innerHTML = `<input type="checkbox" ${task.done ? "checked" : ""}><div><div class="title"></div><div class="meta"></div></div><span class="priority ${task.priority}">${task.priority}</span><button class="delete" type="button">Delete</button>`;
    (li.querySelector(".title") as HTMLElement).textContent = task.title;
    (li.querySelector(".meta") as HTMLElement).textContent = task.due ? `Due ${task.due}` : "No due date";
    (li.querySelector("input") as HTMLInputElement).addEventListener("change", () => toggle(task.id));
    (li.querySelector(".delete") as HTMLButtonElement).addEventListener("click", () => remove(task.id));
    el.list!.appendChild(li);

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<strong>${task.title}</strong><small>${task.due ? `Due ${task.due}` : "No due date"}</small>`;
    if (task.done) card.style.opacity = ".55";
    if (task.priority === "high") el.colHigh!.appendChild(card);
    if (task.priority === "medium") el.colMedium!.appendChild(card);
    if (task.priority === "low") el.colLow!.appendChild(card);
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => !t.done && t.due && t.due < today).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  if (el.total) el.total.textContent = String(total);
  if (el.completed) el.completed.textContent = String(completed);
  if (el.overdue) el.overdue.textContent = String(overdue);
  if (el.progress) el.progress.textContent = `${progress}%`;
}

function toggle(id: string) {
  tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  save();
  render();
}

function remove(id: string) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function load(): Task[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]") as Task[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}

})();

