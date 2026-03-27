(() => {
type OpsRegion = "global" | "emea" | "amer" | "apac";
type OpsRange = "24h" | "7d" | "30d";
type OpsFocus = "overview" | "incidents" | "releases";
type ThemeMode = "light" | "dark";
type Severity = "high" | "medium" | "low";

interface MetricWindow {
  mrr: number;
  mrrDelta: string;
  incidents: number;
  escalations: number;
  deploys: number;
  nps: number;
  npsDelta: string;
}

interface Incident {
  title: string;
  severity: Severity;
  region: OpsRegion;
  owner: string;
}

interface ReleaseItem {
  name: string;
  window: string;
  squad: string;
}

interface NotificationItem {
  text: string;
  stamp: string;
}

interface DashboardState {
  region: OpsRegion;
  range: OpsRange;
  focus: OpsFocus;
  theme: ThemeMode;
}

interface DashboardDataset {
  metrics: Record<OpsRegion, Record<OpsRange, MetricWindow>>;
  trajectory: Record<OpsRegion, number[]>;
  incidents: Incident[];
  releases: ReleaseItem[];
  notifications: NotificationItem[];
}

interface OpsElements {
  regionSelect: HTMLSelectElement;
  rangeSelect: HTMLSelectElement;
  mrrValue: HTMLElement;
  mrrDelta: HTMLElement;
  incidentCount: HTMLElement;
  incidentDelta: HTMLElement;
  deployRate: HTMLElement;
  deployDelta: HTMLElement;
  npsValue: HTMLElement;
  npsDelta: HTMLElement;
  trajectoryLabel: HTMLElement;
  sparkline: HTMLElement;
  incidentList: HTMLElement;
  releaseList: HTMLElement;
  notificationList: HTMLElement;
  focusLabel: HTMLElement;
  navLinks: HTMLButtonElement[];
  themeToggle: HTMLButtonElement;
  saveView: HTMLButtonElement;
  exportView: HTMLButtonElement;
  paletteOpen: HTMLButtonElement;
  paletteDialog: HTMLDialogElement;
  paletteActions: HTMLButtonElement[];
}

class OpsCommandCenter {
  private readonly stateKey = "ops_command_center_v1";
  private readonly data: DashboardDataset;
  private state: DashboardState;
  private readonly elements: OpsElements;

  constructor() {
    this.data = this.createDataset();
    this.state = this.loadState();
    this.elements = {
      regionSelect: this.getById<HTMLSelectElement>("region-select"),
      rangeSelect: this.getById<HTMLSelectElement>("range-select"),
      mrrValue: this.getById("mrr-value"),
      mrrDelta: this.getById("mrr-delta"),
      incidentCount: this.getById("incident-count"),
      incidentDelta: this.getById("incident-delta"),
      deployRate: this.getById("deploy-rate"),
      deployDelta: this.getById("deploy-delta"),
      npsValue: this.getById("nps-value"),
      npsDelta: this.getById("nps-delta"),
      trajectoryLabel: this.getById("trajectory-label"),
      sparkline: this.getById("sparkline"),
      incidentList: this.getById("incident-list"),
      releaseList: this.getById("release-list"),
      notificationList: this.getById("notification-list"),
      focusLabel: this.getById("focus-label"),
      navLinks: this.getMany<HTMLButtonElement>(".nav-link"),
      themeToggle: this.getById<HTMLButtonElement>("theme-toggle"),
      saveView: this.getById<HTMLButtonElement>("save-view"),
      exportView: this.getById<HTMLButtonElement>("export-view"),
      paletteOpen: this.getById<HTMLButtonElement>("palette-open"),
      paletteDialog: this.getById<HTMLDialogElement>("palette-dialog"),
      paletteActions: this.getMany<HTMLButtonElement>(".palette-action")
    };

    this.bind();
    this.applyTheme();
    this.render();
  }

  private getById<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!(element instanceof HTMLElement)) {
      throw new Error(`Missing required element: ${id}`);
    }
    return element as T;
  }

  private getMany<T extends Element>(selector: string): T[] {
    return Array.from(document.querySelectorAll<T>(selector));
  }

  private createDataset(): DashboardDataset {
    return {
      metrics: {
        global: {
          "24h": { mrr: 184200, mrrDelta: "+4.8%", incidents: 6, escalations: 2, deploys: 17, nps: 58, npsDelta: "+2" },
          "7d": { mrr: 192400, mrrDelta: "+6.2%", incidents: 11, escalations: 3, deploys: 42, nps: 60, npsDelta: "+4" },
          "30d": { mrr: 206800, mrrDelta: "+9.1%", incidents: 17, escalations: 4, deploys: 126, nps: 63, npsDelta: "+6" }
        },
        emea: {
          "24h": { mrr: 62300, mrrDelta: "+3.7%", incidents: 2, escalations: 1, deploys: 5, nps: 54, npsDelta: "+1" },
          "7d": { mrr: 65500, mrrDelta: "+5.0%", incidents: 4, escalations: 1, deploys: 13, nps: 55, npsDelta: "+2" },
          "30d": { mrr: 68900, mrrDelta: "+7.2%", incidents: 6, escalations: 1, deploys: 38, nps: 57, npsDelta: "+3" }
        },
        amer: {
          "24h": { mrr: 78100, mrrDelta: "+5.1%", incidents: 3, escalations: 1, deploys: 8, nps: 61, npsDelta: "+2" },
          "7d": { mrr: 81200, mrrDelta: "+6.8%", incidents: 5, escalations: 2, deploys: 19, nps: 63, npsDelta: "+3" },
          "30d": { mrr: 85900, mrrDelta: "+9.4%", incidents: 8, escalations: 2, deploys: 55, nps: 66, npsDelta: "+5" }
        },
        apac: {
          "24h": { mrr: 43800, mrrDelta: "+4.1%", incidents: 1, escalations: 0, deploys: 4, nps: 57, npsDelta: "+1" },
          "7d": { mrr: 45700, mrrDelta: "+5.6%", incidents: 2, escalations: 0, deploys: 10, nps: 58, npsDelta: "+2" },
          "30d": { mrr: 48900, mrrDelta: "+8.0%", incidents: 3, escalations: 1, deploys: 33, nps: 60, npsDelta: "+4" }
        }
      },
      trajectory: {
        global: [72, 76, 81, 79, 88, 90, 97, 101],
        emea: [24, 29, 31, 33, 35, 38, 39, 42],
        amer: [28, 33, 36, 34, 39, 44, 47, 49],
        apac: [18, 19, 22, 21, 24, 26, 29, 31]
      },
      incidents: [
        { title: "Checkout latency spike", severity: "high", region: "global", owner: "Payments SRE" },
        { title: "CRM sync delay", severity: "medium", region: "emea", owner: "Data Platform" },
        { title: "Stale dashboard widgets", severity: "low", region: "amer", owner: "Growth Platform" },
        { title: "Webhook retries climbing", severity: "medium", region: "apac", owner: "Core API" }
      ],
      releases: [
        { name: "Billing workflow hardening", window: "Tue 09:30", squad: "Revenue Systems" },
        { name: "New onboarding assistant", window: "Wed 14:00", squad: "Growth Experience" },
        { name: "Warehouse schema update", window: "Thu 18:00", squad: "Data Platform" },
        { name: "Mobile checkout refresh", window: "Fri 11:00", squad: "Commerce UI" }
      ],
      notifications: [
        { text: "Synthetic checks stable in all regions", stamp: "2 min ago" },
        { text: "EMEA billing queue drained successfully", stamp: "9 min ago" },
        { text: "Release freeze begins in 4 hours", stamp: "17 min ago" },
        { text: "NPS pulse survey refreshed", stamp: "31 min ago" }
      ]
    };
  }

  private bind(): void {
    this.elements.regionSelect.addEventListener("change", (event) => {
      this.state.region = (event.target as HTMLSelectElement).value as OpsRegion;
      this.persist();
      this.render();
    });

    this.elements.rangeSelect.addEventListener("change", (event) => {
      this.state.range = (event.target as HTMLSelectElement).value as OpsRange;
      this.persist();
      this.render();
    });

    this.elements.navLinks.forEach((button) => {
      button.addEventListener("click", () => {
        this.state.focus = (button.dataset.focus as OpsFocus | undefined) ?? "overview";
        this.persist();
        this.renderFocus();
      });
    });

    this.elements.themeToggle.addEventListener("click", () => {
      this.state.theme = this.state.theme === "dark" ? "light" : "dark";
      this.persist();
      this.applyTheme();
    });

    this.elements.saveView.addEventListener("click", () => {
      this.persist();
      this.pushNotification("Current view saved to local workspace.");
    });

    this.elements.exportView.addEventListener("click", () => this.exportSnapshot());
    this.elements.paletteOpen.addEventListener("click", () => this.elements.paletteDialog.showModal());

    this.elements.paletteActions.forEach((button) => {
      button.addEventListener("click", () => {
        this.runCommand(button.dataset.command ?? "");
        this.elements.paletteDialog.close();
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault();
        this.elements.paletteDialog.showModal();
      }
    });
  }

  private render(): void {
    const metric = this.data.metrics[this.state.region][this.state.range];
    this.elements.regionSelect.value = this.state.region;
    this.elements.rangeSelect.value = this.state.range;
    this.elements.mrrValue.textContent = `$${metric.mrr.toLocaleString()}`;
    this.elements.mrrDelta.textContent = `${metric.mrrDelta} vs prior window`;
    this.elements.incidentCount.textContent = String(metric.incidents);
    this.elements.incidentDelta.textContent = `${metric.escalations} escalations`;
    this.elements.deployRate.textContent = String(metric.deploys);
    this.elements.deployDelta.textContent = "per engineering squad";
    this.elements.npsValue.textContent = String(metric.nps);
    this.elements.npsDelta.textContent = `${metric.npsDelta} point movement`;
    this.elements.trajectoryLabel.textContent = `${this.state.region} / ${this.state.range}`;
    this.renderTrajectory();
    this.renderIncidents();
    this.renderReleases();
    this.renderNotifications();
    this.renderFocus();
  }

  private renderTrajectory(): void {
    const values = this.data.trajectory[this.state.region];
    const max = Math.max(...values);
    this.elements.sparkline.innerHTML = "";
    values.forEach((value) => {
      const bar = document.createElement("div");
      bar.className = "sparkline-bar";
      bar.style.height = `${Math.round((value / max) * 100)}%`;
      bar.title = `${value}k`;
      this.elements.sparkline.appendChild(bar);
    });
  }

  private renderIncidents(): void {
    const rows = this.data.incidents.filter((item) => {
      return item.region === this.state.region || item.region === "global" || this.state.region === "global";
    });

    this.elements.incidentList.innerHTML = "";
    rows.forEach((incident) => {
      const item = document.createElement("li");
      item.innerHTML = `
        <strong>${incident.title}</strong>
        <p>${incident.owner}</p>
        <span class="status sev-${incident.severity}">${incident.severity}</span>
      `;
      this.elements.incidentList.appendChild(item);
    });
  }

  private renderReleases(): void {
    this.elements.releaseList.innerHTML = "";
    this.data.releases.forEach((release) => {
      const item = document.createElement("li");
      item.innerHTML = `<div><strong>${release.name}</strong><p>${release.squad}</p></div><span class="mono">${release.window}</span>`;
      this.elements.releaseList.appendChild(item);
    });
  }

  private renderNotifications(): void {
    this.elements.notificationList.innerHTML = "";
    this.data.notifications.slice(0, 4).forEach((note) => {
      const item = document.createElement("li");
      item.innerHTML = `<div><strong>${note.text}</strong></div><span class="mono">${note.stamp}</span>`;
      this.elements.notificationList.appendChild(item);
    });
  }

  private renderFocus(): void {
    this.elements.focusLabel.textContent = this.state.focus;
    this.elements.navLinks.forEach((button) => {
      button.classList.toggle("active", button.dataset.focus === this.state.focus);
    });
  }

  private runCommand(command: string): void {
    if (command === "toggle-theme") {
      this.state.theme = this.state.theme === "dark" ? "light" : "dark";
      this.applyTheme();
      this.persist();
      return;
    }
    if (command === "focus-incidents") {
      this.state.focus = "incidents";
      this.renderFocus();
      this.persist();
      return;
    }
    if (command === "focus-releases") {
      this.state.focus = "releases";
      this.renderFocus();
      this.persist();
      return;
    }
    if (command === "save-view") {
      this.persist();
      this.pushNotification("Saved current dashboard view.");
      return;
    }
    if (command === "export") {
      this.exportSnapshot();
    }
  }

  private applyTheme(): void {
    document.body.classList.toggle("dark", this.state.theme === "dark");
  }

  private pushNotification(text: string): void {
    this.data.notifications.unshift({ text, stamp: "just now" });
    this.renderNotifications();
  }

  private exportSnapshot(): void {
    const payload = {
      exportedAt: new Date().toISOString(),
      state: this.state,
      metrics: this.data.metrics[this.state.region][this.state.range]
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ops-command-center-snapshot.json";
    link.click();
    URL.revokeObjectURL(url);
    this.pushNotification("Exported dashboard snapshot.");
  }

  private loadState(): DashboardState {
    try {
      const parsed = JSON.parse(localStorage.getItem(this.stateKey) ?? "{}") as Partial<DashboardState>;
      return {
        region: parsed.region ?? "global",
        range: parsed.range ?? "24h",
        focus: parsed.focus ?? "overview",
        theme: parsed.theme ?? "light"
      };
    } catch {
      return { region: "global", range: "24h", focus: "overview", theme: "light" };
    }
  }

  private persist(): void {
    localStorage.setItem(this.stateKey, JSON.stringify(this.state));
  }
}

new OpsCommandCenter();

})();

