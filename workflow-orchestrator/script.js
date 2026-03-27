"use strict";
(() => {
    class WorkflowOrchestrator {
        constructor() {
            this.storageKey = "workflow_orchestrator_v1";
            this.steps = [];
            this.logs = [];
            this.history = [];
            this.future = [];
            this.selectedId = null;
            this.running = false;
            this.elements = {
                workflowList: this.getById("workflow-list"),
                workflowSummary: this.getById("workflow-summary"),
                selectedLabel: this.getById("selected-label"),
                logList: this.getById("log-list"),
                form: this.getById("inspector-form"),
                title: this.getById("step-title"),
                owner: this.getById("step-owner"),
                status: this.getById("step-status"),
                eta: this.getById("step-eta"),
                deleteButton: this.getById("delete-step"),
                simulateRun: this.getById("simulate-run"),
                exportJson: this.getById("export-json"),
                addStep: this.getById("add-step"),
                undo: this.getById("undo"),
                redo: this.getById("redo"),
                templateButtons: this.getMany(".template-btn"),
                importJson: this.getById("import-json"),
                importDialog: this.getById("import-dialog"),
                importText: this.getById("import-text"),
                applyImport: this.getById("apply-import")
            };
            this.restore();
            this.bind();
            this.render();
        }
        getById(id) {
            const element = document.getElementById(id);
            if (!(element instanceof HTMLElement)) {
                throw new Error(`Missing required element: ${id}`);
            }
            return element;
        }
        getMany(selector) {
            return Array.from(document.querySelectorAll(selector));
        }
        bind() {
            this.elements.templateButtons.forEach((button) => {
                button.addEventListener("click", () => {
                    const template = button.dataset.template ?? "release";
                    this.applyTemplate(template);
                });
            });
            this.elements.addStep.addEventListener("click", () => {
                this.commitHistory();
                this.steps.push(this.createStep("New step", "Ops owner", "queued", "2h"));
                this.selectStep(this.steps[this.steps.length - 1].id);
                this.persist();
                this.render();
            });
            this.elements.form.addEventListener("submit", (event) => {
                event.preventDefault();
                if (!this.selectedId) {
                    return;
                }
                this.commitHistory();
                const nextTitle = this.elements.title.value.trim();
                this.steps = this.steps.map((step) => {
                    if (step.id !== this.selectedId) {
                        return step;
                    }
                    return {
                        ...step,
                        title: nextTitle || step.title,
                        owner: this.elements.owner.value.trim() || step.owner,
                        status: this.elements.status.value,
                        eta: this.elements.eta.value.trim() || step.eta
                    };
                });
                this.log(`Updated step "${nextTitle || "Untitled"}".`);
                this.persist();
                this.render();
            });
            this.elements.deleteButton.addEventListener("click", () => {
                if (!this.selectedId) {
                    return;
                }
                this.commitHistory();
                const removed = this.steps.find((step) => step.id === this.selectedId);
                this.steps = this.steps.filter((step) => step.id !== this.selectedId);
                this.selectedId = this.steps[0]?.id ?? null;
                if (removed) {
                    this.log(`Removed step "${removed.title}".`);
                }
                this.persist();
                this.render();
            });
            this.elements.undo.addEventListener("click", () => this.undo());
            this.elements.redo.addEventListener("click", () => this.redo());
            this.elements.simulateRun.addEventListener("click", () => this.simulateRun());
            this.elements.exportJson.addEventListener("click", () => this.exportJson());
            this.elements.importJson.addEventListener("click", () => this.elements.importDialog.showModal());
            this.elements.applyImport.addEventListener("click", () => this.importJson());
        }
        createStep(title, owner, status, eta) {
            return {
                id: crypto.randomUUID(),
                title,
                owner,
                status,
                eta
            };
        }
        applyTemplate(name) {
            const templates = {
                release: [
                    this.createStep("Code freeze", "Release Manager", "queued", "1h"),
                    this.createStep("Run regression suite", "QA Lead", "queued", "3h"),
                    this.createStep("Approve deploy window", "Platform Team", "queued", "30m"),
                    this.createStep("Production verification", "SRE", "queued", "2h")
                ],
                content: [
                    this.createStep("Draft content", "Content Strategist", "queued", "4h"),
                    this.createStep("Design review", "Brand Designer", "queued", "2h"),
                    this.createStep("Legal approval", "Legal Ops", "queued", "1d"),
                    this.createStep("Publish campaign", "Marketing Ops", "queued", "30m")
                ],
                incident: [
                    this.createStep("Triage alert", "Incident Commander", "running", "15m"),
                    this.createStep("Mitigation rollout", "Platform SRE", "queued", "45m"),
                    this.createStep("Customer communication", "Support Lead", "queued", "30m"),
                    this.createStep("Postmortem draft", "Engineering Manager", "queued", "1d")
                ]
            };
            this.commitHistory();
            this.steps = templates[name];
            this.selectedId = this.steps[0]?.id ?? null;
            this.log(`Loaded ${name} workflow template.`);
            this.persist();
            this.render();
        }
        render() {
            this.elements.workflowList.innerHTML = "";
            this.elements.workflowSummary.textContent = `${this.steps.length} steps`;
            this.elements.selectedLabel.textContent = this.selectedId ?? "none selected";
            this.steps.forEach((step, index) => {
                const item = document.createElement("li");
                item.className = `workflow-card${step.id === this.selectedId ? " selected" : ""}`;
                item.innerHTML = `
        <div class="workflow-row">
          <div>
            <strong>${index + 1}. ${step.title}</strong>
            <p>${step.owner} · ${step.eta}</p>
          </div>
          <span class="status ${step.status}">${step.status}</span>
        </div>
        <div class="workflow-actions">
          <button class="ghost select-step" data-id="${step.id}" type="button">Inspect</button>
          <button class="ghost move-up" data-id="${step.id}" type="button">Move Up</button>
          <button class="ghost move-down" data-id="${step.id}" type="button">Move Down</button>
        </div>
      `;
                this.elements.workflowList.appendChild(item);
            });
            this.getMany(".select-step").forEach((button) => {
                button.addEventListener("click", () => {
                    const id = button.dataset.id;
                    if (id) {
                        this.selectStep(id);
                    }
                });
            });
            this.getMany(".move-up").forEach((button) => {
                button.addEventListener("click", () => {
                    const id = button.dataset.id;
                    if (id) {
                        this.moveStep(id, -1);
                    }
                });
            });
            this.getMany(".move-down").forEach((button) => {
                button.addEventListener("click", () => {
                    const id = button.dataset.id;
                    if (id) {
                        this.moveStep(id, 1);
                    }
                });
            });
            this.renderInspector();
            this.renderLogs();
            this.elements.undo.disabled = this.history.length === 0;
            this.elements.redo.disabled = this.future.length === 0;
        }
        renderInspector() {
            const current = this.steps.find((step) => step.id === this.selectedId);
            this.elements.title.value = current?.title ?? "";
            this.elements.owner.value = current?.owner ?? "";
            this.elements.status.value = current?.status ?? "queued";
            this.elements.eta.value = current?.eta ?? "";
            this.elements.deleteButton.disabled = !current;
        }
        renderLogs() {
            this.elements.logList.innerHTML = "";
            this.logs.slice(0, 8).forEach((entry) => {
                const item = document.createElement("li");
                item.innerHTML = `<strong>${entry.message}</strong><small class="mono">${entry.time}</small>`;
                this.elements.logList.appendChild(item);
            });
        }
        selectStep(id) {
            this.selectedId = id;
            this.render();
        }
        moveStep(id, direction) {
            const index = this.steps.findIndex((step) => step.id === id);
            const next = index + direction;
            if (index < 0 || next < 0 || next >= this.steps.length) {
                return;
            }
            this.commitHistory();
            const clone = [...this.steps];
            [clone[index], clone[next]] = [clone[next], clone[index]];
            this.steps = clone;
            this.persist();
            this.render();
        }
        simulateRun() {
            if (this.running || this.steps.length === 0) {
                return;
            }
            this.running = true;
            this.commitHistory();
            let pointer = 0;
            this.steps = this.steps.map((step) => ({ ...step, status: "queued" }));
            this.log("Execution simulation started.");
            this.render();
            const tick = () => {
                if (pointer > 0) {
                    this.steps[pointer - 1].status = "done";
                }
                if (pointer < this.steps.length) {
                    this.steps[pointer].status = "running";
                    this.log(`Running "${this.steps[pointer].title}".`);
                    pointer += 1;
                    this.persist();
                    this.render();
                    window.setTimeout(tick, 700);
                    return;
                }
                this.running = false;
                this.persist();
                this.log("Execution simulation completed.");
                this.render();
            };
            tick();
        }
        exportJson() {
            const payload = JSON.stringify({ steps: this.steps }, null, 2);
            const blob = new Blob([payload], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "workflow-orchestrator.json";
            link.click();
            URL.revokeObjectURL(url);
            this.log("Exported workflow JSON.");
        }
        importJson() {
            try {
                const payload = JSON.parse(this.elements.importText.value);
                if (!Array.isArray(payload.steps)) {
                    throw new Error("Invalid import payload.");
                }
                this.commitHistory();
                this.steps = payload.steps.map((step) => this.createStep(step.title || "Imported step", step.owner || "Unknown", step.status || "queued", step.eta || "n/a"));
                this.selectedId = this.steps[0]?.id ?? null;
                this.persist();
                this.log("Imported workflow JSON.");
                this.elements.importDialog.close();
                this.render();
            }
            catch {
                this.log("Import failed. JSON structure was invalid.");
                this.renderLogs();
            }
        }
        commitHistory() {
            this.history.push(JSON.stringify({ steps: this.steps, selectedId: this.selectedId, logs: this.logs }));
            this.future = [];
        }
        undo() {
            if (this.history.length === 0) {
                return;
            }
            this.future.push(JSON.stringify({ steps: this.steps, selectedId: this.selectedId, logs: this.logs }));
            const snapshot = JSON.parse(this.history.pop() ?? "{}");
            this.steps = Array.isArray(snapshot.steps) ? snapshot.steps : [];
            this.selectedId = snapshot.selectedId ?? null;
            this.logs = Array.isArray(snapshot.logs) ? snapshot.logs : [];
            this.persist();
            this.render();
        }
        redo() {
            if (this.future.length === 0) {
                return;
            }
            this.history.push(JSON.stringify({ steps: this.steps, selectedId: this.selectedId, logs: this.logs }));
            const snapshot = JSON.parse(this.future.pop() ?? "{}");
            this.steps = Array.isArray(snapshot.steps) ? snapshot.steps : [];
            this.selectedId = snapshot.selectedId ?? null;
            this.logs = Array.isArray(snapshot.logs) ? snapshot.logs : [];
            this.persist();
            this.render();
        }
        log(message) {
            this.logs.unshift({
                message,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            });
        }
        persist() {
            localStorage.setItem(this.storageKey, JSON.stringify({ steps: this.steps, selectedId: this.selectedId, logs: this.logs }));
        }
        restore() {
            try {
                const parsed = JSON.parse(localStorage.getItem(this.storageKey) ?? "{}");
                this.steps = Array.isArray(parsed.steps) ? parsed.steps : [];
                this.selectedId = parsed.selectedId ?? this.steps[0]?.id ?? null;
                this.logs = Array.isArray(parsed.logs) ? parsed.logs : [{ message: "Workspace ready.", time: "now" }];
            }
            catch {
                this.logs = [{ message: "Workspace ready.", time: "now" }];
            }
        }
    }
    new WorkflowOrchestrator();
})();
