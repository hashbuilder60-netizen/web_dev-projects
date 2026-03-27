"use strict";
(() => {
    const $ = (id) => document.getElementById(id);
    const el = {
        form: $("task-form"),
        input: $("task-input"),
        due: $("task-date"),
        priority: $("task-priority"),
        search: $("search"),
        status: $("status-filter"),
        sort: $("sort-by"),
        clear: $("clear-completed"),
        list: $("task-list"),
        empty: $("empty"),
        total: $("total"),
        completed: $("completed"),
        overdue: $("overdue"),
        progress: $("progress"),
        listWrap: $("list-wrap"),
        boardWrap: $("board-wrap"),
        listBtn: $("list-view"),
        boardBtn: $("board-view"),
        colHigh: $("col-high"),
        colMedium: $("col-medium"),
        colLow: $("col-low"),
        openCapture: $("open-capture"),
        captureDialog: $("capture-dialog"),
        captureForm: $("capture-form"),
        captureInput: $("capture-input"),
        closeCapture: $("close-capture")
    };
    const KEY = "focusflow_pro_v3";
    let tasks = load();
    let view = "list";
    if (el.form && el.input && el.priority && el.due) {
        el.form.addEventListener("submit", (e) => {
            e.preventDefault();
            createTask(el.input.value.trim(), el.priority.value, el.due.value || null);
            el.form.reset();
            el.priority.value = "medium";
        });
    }
    if (el.captureForm && el.captureInput && el.captureDialog) {
        el.captureForm.addEventListener("submit", (e) => {
            e.preventDefault();
            createTask(el.captureInput.value.trim(), "medium", null);
            el.captureDialog.close();
            el.captureForm.reset();
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
    function setView(mode) {
        view = mode;
        el.listWrap?.classList.toggle("hidden", mode !== "list");
        el.boardWrap?.classList.toggle("hidden", mode !== "board");
        el.listBtn?.classList.toggle("active", mode === "list");
        el.boardBtn?.classList.toggle("active", mode === "board");
    }
    function createTask(title, priority, due) {
        if (!title)
            return;
        tasks.unshift({ id: crypto.randomUUID(), title, due, priority, done: false, createdAt: Date.now() });
        save();
        render();
    }
    function visibleTasks() {
        const q = el.search?.value.trim().toLowerCase() ?? "";
        const status = el.status?.value ?? "all";
        const sort = el.sort?.value ?? "created";
        const priorityRank = { high: 0, medium: 1, low: 2 };
        let rows = tasks.filter((t) => t.title.toLowerCase().includes(q));
        if (status === "active")
            rows = rows.filter((t) => !t.done);
        if (status === "done")
            rows = rows.filter((t) => t.done);
        rows.sort((a, b) => {
            if (sort === "priority")
                return priorityRank[a.priority] - priorityRank[b.priority];
            if (sort === "due")
                return (a.due || "9999-12-31").localeCompare(b.due || "9999-12-31");
            return b.createdAt - a.createdAt;
        });
        return rows;
    }
    function render() {
        const rows = visibleTasks();
        if (!el.list || !el.colHigh || !el.colMedium || !el.colLow)
            return;
        el.list.innerHTML = "";
        el.colHigh.innerHTML = "";
        el.colMedium.innerHTML = "";
        el.colLow.innerHTML = "";
        if (el.empty)
            el.empty.hidden = rows.length > 0;
        rows.forEach((task) => {
            const li = document.createElement("li");
            li.className = `task${task.done ? " done" : ""}`;
            li.innerHTML = `<input type="checkbox" ${task.done ? "checked" : ""}><div><div class="title"></div><div class="meta"></div></div><span class="priority ${task.priority}">${task.priority}</span><button class="delete" type="button">Delete</button>`;
            li.querySelector(".title").textContent = task.title;
            li.querySelector(".meta").textContent = task.due ? `Due ${task.due}` : "No due date";
            li.querySelector("input").addEventListener("change", () => toggle(task.id));
            li.querySelector(".delete").addEventListener("click", () => remove(task.id));
            el.list.appendChild(li);
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `<strong>${task.title}</strong><small>${task.due ? `Due ${task.due}` : "No due date"}</small>`;
            if (task.done)
                card.style.opacity = ".55";
            if (task.priority === "high")
                el.colHigh.appendChild(card);
            if (task.priority === "medium")
                el.colMedium.appendChild(card);
            if (task.priority === "low")
                el.colLow.appendChild(card);
        });
        const total = tasks.length;
        const completed = tasks.filter((t) => t.done).length;
        const today = new Date().toISOString().slice(0, 10);
        const overdue = tasks.filter((t) => !t.done && t.due && t.due < today).length;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        if (el.total)
            el.total.textContent = String(total);
        if (el.completed)
            el.completed.textContent = String(completed);
        if (el.overdue)
            el.overdue.textContent = String(overdue);
        if (el.progress)
            el.progress.textContent = `${progress}%`;
    }
    function toggle(id) {
        tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
        save();
        render();
    }
    function remove(id) {
        tasks = tasks.filter((t) => t.id !== id);
        save();
        render();
    }
    function load() {
        try {
            const parsed = JSON.parse(localStorage.getItem(KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }
    function save() {
        localStorage.setItem(KEY, JSON.stringify(tasks));
    }
})();
