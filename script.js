const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const clearCompletedBtn = document.getElementById("clear-completed");

const totalCount = document.getElementById("total-count");
const doneCount = document.getElementById("done-count");
const progressCount = document.getElementById("progress-count");

const STORAGE_KEY = "focusflow_tasks_v1";

let tasks = loadTasks();
render();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  tasks.unshift({
    id: crypto.randomUUID(),
    text,
    done: false
  });

  taskInput.value = "";
  saveTasks();
  render();
});

clearCompletedBtn.addEventListener("click", () => {
  tasks = tasks.filter((task) => !task.done);
  saveTasks();
  render();
});

function render() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  for (const task of tasks) {
    const item = document.createElement("li");
    item.className = `task${task.done ? " done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.type = "button";
    del.setAttribute("aria-label", `Delete ${task.text}`);
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    item.append(checkbox, text, del);
    taskList.append(item);
  }

  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  totalCount.textContent = String(total);
  doneCount.textContent = String(done);
  progressCount.textContent = `${progress}%`;
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, done: !task.done } : task
  );
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  render();
}

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (task) => task && typeof task.id === "string" && typeof task.text === "string"
    );
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}