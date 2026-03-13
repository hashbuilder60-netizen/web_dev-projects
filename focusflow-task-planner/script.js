const $ = (id) => document.getElementById(id);
const el = {
  form: $("task-form"), input: $("task-input"), due: $("task-date"), priority: $("task-priority"),
  search: $("search"), status: $("status-filter"), sort: $("sort-by"), clear: $("clear-completed"),
  list: $("task-list"), empty: $("empty"), total: $("total"), completed: $("completed"), overdue: $("overdue"), progress: $("progress")
};
const KEY = "focusflow_pro_v2";
let tasks = load();
render();

el.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = el.input.value.trim();
  if (!title) return;
  tasks.unshift({
    id: crypto.randomUUID(),
    title,
    due: el.due.value || null,
    priority: el.priority.value,
    done: false,
    createdAt: Date.now()
  });
  el.form.reset();
  el.priority.value = "medium";
  save();
  render();
});

[el.search, el.status, el.sort].forEach((node) => node.addEventListener("input", render));
el.clear.addEventListener("click", () => { tasks = tasks.filter((t) => !t.done); save(); render(); });

function visibleTasks() {
  const q = el.search.value.trim().toLowerCase();
  const status = el.status.value;
  const sort = el.sort.value;
  const priorityRank = { high: 0, medium: 1, low: 2 };

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
  el.list.innerHTML = "";
  el.empty.hidden = rows.length > 0;

  rows.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task${task.done ? " done" : ""}`;

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.addEventListener("change", () => {
      tasks = tasks.map((t) => t.id === task.id ? { ...t, done: !t.done } : t);
      save(); render();
    });

    const titleWrap = document.createElement("div");
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = task.title;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = task.due ? `Due ${task.due}` : "No due date";
    titleWrap.append(title, meta);

    const pill = document.createElement("span");
    pill.className = `priority ${task.priority}`;
    pill.textContent = task.priority;

    const del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      save(); render();
    });

    li.append(check, titleWrap, pill, del);
    el.list.appendChild(li);
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => !t.done && t.due && t.due < today).length;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  el.total.textContent = String(total);
  el.completed.textContent = String(completed);
  el.overdue.textContent = String(overdue);
  el.progress.textContent = `${progress}%`;
}

function load() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(tasks)); }