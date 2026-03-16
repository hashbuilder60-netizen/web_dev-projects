const STORAGE_KEY = "phone-privacy-audit:v1";

const platformCatalog = [
  { key: "instagram", label: "Instagram", cue: "Check privacy, discoverability, and uploaded contacts in the account settings flow." },
  { key: "facebook", label: "Facebook", cue: "Review who can find you with your number, contact uploads, and audience defaults." },
  { key: "whatsapp", label: "WhatsApp", cue: "Audit profile visibility, linked devices, and backups that may still expose your number." },
  { key: "snapchat", label: "Snapchat", cue: "Check whether your number helps people find you and whether contact syncing is active." },
  { key: "tiktok", label: "TikTok", cue: "Review discoverability, contact sync, and whether your phone is still a login factor." },
  { key: "linkedin", label: "LinkedIn", cue: "Confirm profile visibility, contact sync imports, and account recovery methods." },
  { key: "x", label: "X", cue: "Review discoverability, imported contacts, and login verification methods." },
  { key: "telegram", label: "Telegram", cue: "Check who can see your number and whether synced contacts still have access." },
  { key: "discord", label: "Discord", cue: "Review phone verification usage, recovery options, and connected contact features." },
  { key: "youtube", label: "YouTube / Google", cue: "Audit recovery numbers, 2-step verification, and profile visibility across the account." },
  { key: "reddit", label: "Reddit", cue: "Review recovery methods and any imported contact or login data tied to the account." },
  { key: "custom", label: "Custom platform", cue: "Review privacy, contact sync, discoverability, and recovery settings for this account." }
];

const starterPlatforms = ["instagram", "facebook", "whatsapp", "snapchat", "tiktok", "linkedin", "telegram", "discord"];

const state = loadState();
const ui = { filter: "all", query: "" };

const refs = {
  profileForm: document.querySelector("#profile-form"),
  ownerName: document.querySelector("#owner-name"),
  phoneLabel: document.querySelector("#phone-label"),
  reviewWindow: document.querySelector("#review-window"),
  profileSummary: document.querySelector("#profile-summary"),
  accountForm: document.querySelector("#account-form"),
  accountId: document.querySelector("#account-id"),
  platform: document.querySelector("#platform"),
  customPlatformWrap: document.querySelector("#custom-platform-wrap"),
  customPlatform: document.querySelector("#custom-platform"),
  handle: document.querySelector("#handle"),
  phoneLinked: document.querySelector("#phone-linked"),
  discoverability: document.querySelector("#discoverability"),
  contactSync: document.querySelector("#contact-sync"),
  smsSecurity: document.querySelector("#sms-security"),
  lastReviewed: document.querySelector("#last-reviewed"),
  notes: document.querySelector("#notes"),
  saveAccountBtn: document.querySelector("#save-account-btn"),
  cancelEditBtn: document.querySelector("#cancel-edit-btn"),
  accountList: document.querySelector("#account-list"),
  emptyState: document.querySelector("#empty-state"),
  filterGroup: document.querySelector("#filter-group"),
  searchInput: document.querySelector("#search-input"),
  statTotal: document.querySelector("#stat-total"),
  statLinked: document.querySelector("#stat-linked"),
  statDiscoverable: document.querySelector("#stat-discoverable"),
  statHigh: document.querySelector("#stat-high"),
  actionQueue: document.querySelector("#action-queue"),
  exportBtn: document.querySelector("#export-btn"),
  importBtn: document.querySelector("#import-btn"),
  importInput: document.querySelector("#import-input"),
  starterBtn: document.querySelector("#starter-btn"),
  clearBtn: document.querySelector("#clear-btn")
};

initialize();

function initialize() {
  populatePlatformOptions();
  wireEvents();
  fillProfileForm();
  resetAccountForm();
  render();
}

function wireEvents() {
  refs.profileForm.addEventListener("submit", handleProfileSave);
  refs.accountForm.addEventListener("submit", handleAccountSave);
  refs.platform.addEventListener("change", toggleCustomPlatformVisibility);
  refs.cancelEditBtn.addEventListener("click", resetAccountForm);
  refs.filterGroup.addEventListener("click", handleFilterChange);
  refs.searchInput.addEventListener("input", (event) => {
    ui.query = event.target.value.trim().toLowerCase();
    renderAccounts();
  });
  refs.exportBtn.addEventListener("click", exportAudit);
  refs.importBtn.addEventListener("click", () => refs.importInput.click());
  refs.importInput.addEventListener("change", importAudit);
  refs.starterBtn.addEventListener("click", loadStarterEntries);
  refs.clearBtn.addEventListener("click", clearAudit);
}

function loadState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return defaultState();
    }

    const parsed = JSON.parse(saved);
    return {
      profile: {
        ownerName: parsed.profile?.ownerName ?? "",
        phoneLabel: parsed.profile?.phoneLabel ?? "",
        reviewWindow: String(parsed.profile?.reviewWindow ?? "90")
      },
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : []
    };
  } catch (error) {
    console.error("Unable to load saved audit data.", error);
    return defaultState();
  }
}

function defaultState() {
  return {
    profile: { ownerName: "", phoneLabel: "", reviewWindow: "90" },
    accounts: []
  };
}

function saveState() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function populatePlatformOptions() {
  refs.platform.innerHTML = platformCatalog
    .map((platform) => `<option value="${platform.key}">${platform.label}</option>`)
    .join("");
}

function fillProfileForm() {
  refs.ownerName.value = state.profile.ownerName;
  refs.phoneLabel.value = state.profile.phoneLabel;
  refs.reviewWindow.value = state.profile.reviewWindow;
}

function handleProfileSave(event) {
  event.preventDefault();
  state.profile.ownerName = refs.ownerName.value.trim();
  state.profile.phoneLabel = refs.phoneLabel.value.trim();
  state.profile.reviewWindow = refs.reviewWindow.value;
  saveState();
  render();
}

function handleAccountSave(event) {
  event.preventDefault();

  const platformKey = refs.platform.value;
  const customPlatform = refs.customPlatform.value.trim();
  const existingAccount = refs.accountId.value ? findAccount(refs.accountId.value) : null;
  const platformName = platformKey === "custom" ? customPlatform || "Custom platform" : getPlatform(platformKey).label;

  if (platformKey === "custom" && !customPlatform) {
    refs.customPlatform.focus();
    return;
  }

  const account = {
    id: refs.accountId.value || makeId(),
    platformKey,
    platformName,
    handle: refs.handle.value.trim(),
    phoneLinked: refs.phoneLinked.value,
    discoverability: refs.discoverability.value,
    contactSync: refs.contactSync.value,
    smsSecurity: refs.smsSecurity.value,
    lastReviewed: refs.lastReviewed.value,
    notes: refs.notes.value.trim(),
    createdAt: existingAccount?.createdAt || new Date().toISOString()
  };

  const existingIndex = state.accounts.findIndex((entry) => entry.id === account.id);
  if (existingIndex >= 0) {
    state.accounts[existingIndex] = account;
  } else {
    state.accounts.push(account);
  }

  saveState();
  resetAccountForm();
  render();
}

function resetAccountForm() {
  refs.accountForm.reset();
  refs.accountId.value = "";
  refs.platform.value = platformCatalog[0].key;
  refs.phoneLinked.value = "review";
  refs.discoverability.value = "review";
  refs.contactSync.value = "review";
  refs.smsSecurity.value = "review";
  refs.lastReviewed.value = "";
  refs.notes.value = "";
  refs.customPlatform.value = "";
  refs.saveAccountBtn.textContent = "Save Account";
  toggleCustomPlatformVisibility();
}

function render() {
  renderProfileSummary();
  renderStats();
  renderActionQueue();
  renderAccounts();
}

function renderProfileSummary() {
  const label = state.profile.phoneLabel || "Unnamed line";
  const owner = state.profile.ownerName || "Personal profile";
  const windowDays = Number(state.profile.reviewWindow);
  refs.profileSummary.innerHTML = `
    <strong>${escapeHtml(label)}</strong>
    <div>${escapeHtml(owner)}</div>
    <div>Review rhythm: every ${windowDays} days</div>
    <div>${state.accounts.length ? `${state.accounts.length} account${state.accounts.length === 1 ? "" : "s"} tracked so far.` : "No accounts tracked yet."}</div>
  `;
}

function renderStats() {
  const total = state.accounts.length;
  const linked = state.accounts.filter((account) => account.phoneLinked === "yes").length;
  const discoverable = state.accounts.filter((account) => account.discoverability === "on").length;
  const highPriority = state.accounts.filter((account) => getRiskTier(account).tier === "high").length;
  refs.statTotal.textContent = String(total);
  refs.statLinked.textContent = String(linked);
  refs.statDiscoverable.textContent = String(discoverable);
  refs.statHigh.textContent = String(highPriority);
}

function renderActionQueue() {
  const queue = buildActionQueue();
  if (!queue.length) {
    refs.actionQueue.innerHTML = `
      <article class="queue-item">
        <strong>Audit queue is clear</strong>
        <p>Add an account or mark a setting for review to build your next-action list.</p>
      </article>
    `;
    return;
  }

  refs.actionQueue.innerHTML = queue
    .map((item) => `
      <article class="queue-item">
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.body)}</p>
      </article>
    `)
    .join("");
}

function buildActionQueue() {
  const linkedUnknown = state.accounts.filter((account) => account.phoneLinked === "review");
  const discoverable = state.accounts.filter((account) => account.discoverability === "on");
  const synced = state.accounts.filter((account) => account.contactSync === "on");
  const sms = state.accounts.filter((account) => account.smsSecurity === "on");
  const stale = state.accounts.filter(isReviewStale);
  const reviewFlags = state.accounts.filter((account) =>
    account.discoverability === "review" ||
    account.contactSync === "review" ||
    account.smsSecurity === "review"
  );

  const items = [];
  if (linkedUnknown.length) {
    items.push({
      title: "Confirm where your phone number is still attached",
      body: `${joinAccountNames(linkedUnknown)} ${linkedUnknown.length === 1 ? "still needs" : "still need"} a quick phone-link audit.`
    });
  }
  if (discoverable.length) {
    items.push({
      title: "Turn off phone discoverability where it is still enabled",
      body: `${joinAccountNames(discoverable)} ${discoverable.length === 1 ? "still allows" : "still allow"} people to find the account through your phone number.`
    });
  }
  if (synced.length) {
    items.push({
      title: "Review imported contacts",
      body: `${joinAccountNames(synced)} ${synced.length === 1 ? "has" : "have"} contact syncing enabled, which can widen who sees your account.`
    });
  }
  if (sms.length) {
    items.push({
      title: "Move security away from SMS where possible",
      body: `${joinAccountNames(sms)} ${sms.length === 1 ? "still uses" : "still use"} SMS for recovery or verification.`
    });
  }
  if (stale.length) {
    items.push({
      title: "Refresh stale privacy reviews",
      body: `${joinAccountNames(stale)} ${stale.length === 1 ? "has not been reviewed" : "have not been reviewed"} inside your chosen review window.`
    });
  }
  if (reviewFlags.length) {
    items.push({
      title: "Resolve settings marked 'Needs review'",
      body: `${joinAccountNames(reviewFlags)} ${reviewFlags.length === 1 ? "still has" : "still have"} at least one unknown privacy setting.`
    });
  }

  return items.slice(0, 5);
}

function renderAccounts() {
  const filtered = state.accounts.filter(matchesSearch).filter(matchesFilter).sort(sortByRiskThenName);
  refs.emptyState.textContent = filtered.length
    ? ""
    : state.accounts.length
      ? "No accounts match this filter yet. Try another view or clear the search."
      : "Start by adding one of your own accounts, or use 'Add Common Platforms' to create a review checklist.";

  refs.accountList.innerHTML = filtered.map(renderAccountCard).join("");
  refs.accountList.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", handleCardAction);
  });
}

function renderAccountCard(account) {
  const risk = getRiskTier(account);
  const platformCue = getPlatform(account.platformKey)?.cue || "Review privacy and discoverability settings for this account.";
  const accountActions = buildAccountActions(account, platformCue);
  const badges = buildBadges(account);

  return `
    <article class="account-card">
      <div class="account-top">
        <div class="account-title">
          <strong>${escapeHtml(account.platformName)}</strong>
          <span>${escapeHtml(account.handle || "No handle added yet")}</span>
        </div>
        <span class="score-pill score-${risk.tier}">${risk.label}</span>
      </div>
      <div class="badge-row">
        ${badges.map((badge) => `<span class="badge ${badge.className}">${escapeHtml(badge.label)}</span>`).join("")}
      </div>
      <ul class="action-list">
        ${accountActions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
      ${account.notes ? `<div class="notes">${escapeHtml(account.notes)}</div>` : ""}
      <div class="account-footer">
        <div class="subtle">${renderReviewCopy(account)}</div>
        <div class="inline-actions">
          <button type="button" class="button" data-action="edit" data-id="${account.id}">Edit</button>
          <button type="button" class="button" data-action="delete" data-id="${account.id}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

function matchesSearch(account) {
  if (!ui.query) {
    return true;
  }
  const haystack = `${account.platformName} ${account.handle} ${account.notes}`.toLowerCase();
  return haystack.includes(ui.query);
}

function matchesFilter(account) {
  switch (ui.filter) {
    case "high":
      return getRiskTier(account).tier === "high";
    case "discoverable":
      return account.discoverability === "on";
    case "linked":
      return account.phoneLinked === "yes";
    case "stale":
      return isReviewStale(account);
    default:
      return true;
  }
}

function handleFilterChange(event) {
  const filterButton = event.target.closest("[data-filter]");
  if (!filterButton) {
    return;
  }

  ui.filter = filterButton.dataset.filter;
  refs.filterGroup.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button === filterButton);
  });
  renderAccounts();
}

function handleCardAction(event) {
  const button = event.currentTarget;
  const accountId = button.dataset.id;
  if (button.dataset.action === "edit") {
    populateEditForm(accountId);
    return;
  }
  if (button.dataset.action === "delete") {
    deleteAccount(accountId);
  }
}

function populateEditForm(accountId) {
  const account = findAccount(accountId);
  if (!account) {
    return;
  }

  refs.accountId.value = account.id;
  refs.platform.value = account.platformKey;
  refs.customPlatform.value = account.platformKey === "custom" ? account.platformName : "";
  refs.handle.value = account.handle;
  refs.phoneLinked.value = account.phoneLinked;
  refs.discoverability.value = account.discoverability;
  refs.contactSync.value = account.contactSync;
  refs.smsSecurity.value = account.smsSecurity;
  refs.lastReviewed.value = account.lastReviewed || "";
  refs.notes.value = account.notes || "";
  refs.saveAccountBtn.textContent = "Update Account";
  toggleCustomPlatformVisibility();
  refs.accountForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteAccount(accountId) {
  const account = findAccount(accountId);
  if (!account) {
    return;
  }
  if (!window.confirm(`Delete ${account.platformName}${account.handle ? ` (${account.handle})` : ""}?`)) {
    return;
  }

  state.accounts = state.accounts.filter((entry) => entry.id !== accountId);
  saveState();
  render();
}

function toggleCustomPlatformVisibility() {
  const isCustom = refs.platform.value === "custom";
  refs.customPlatformWrap.classList.toggle("hidden", !isCustom);
  if (isCustom) {
    refs.customPlatform.setAttribute("required", "required");
  } else {
    refs.customPlatform.removeAttribute("required");
  }
}

function exportAudit() {
  const payload = {
    exportedAt: new Date().toISOString(),
    profile: state.profile,
    accounts: state.accounts
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `phone-privacy-audit-${todayStamp()}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importAudit(event) {
  const [file] = event.target.files || [];
  if (!file) {
    return;
  }

  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    state.profile = {
      ownerName: parsed.profile?.ownerName ?? "",
      phoneLabel: parsed.profile?.phoneLabel ?? "",
      reviewWindow: String(parsed.profile?.reviewWindow ?? "90")
    };
    state.accounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    saveState();
    fillProfileForm();
    resetAccountForm();
    render();
  } catch (error) {
    window.alert("That file could not be imported. Please choose a valid audit JSON export.");
    console.error("Import failed.", error);
  } finally {
    refs.importInput.value = "";
  }
}

function loadStarterEntries() {
  const existing = new Set(state.accounts.map((account) => account.platformKey));
  const additions = starterPlatforms.filter((key) => !existing.has(key)).map((key) => {
    const platform = getPlatform(key);
    return {
      id: makeId(),
      platformKey: key,
      platformName: platform.label,
      handle: "",
      phoneLinked: "review",
      discoverability: "review",
      contactSync: "review",
      smsSecurity: "review",
      lastReviewed: "",
      notes: "",
      createdAt: new Date().toISOString()
    };
  });

  if (!additions.length) {
    window.alert("Those common platforms are already in your audit.");
    return;
  }

  state.accounts.push(...additions);
  saveState();
  render();
}

function clearAudit() {
  if (!window.confirm("Clear the entire local audit from this browser?")) {
    return;
  }

  state.profile = defaultState().profile;
  state.accounts = [];
  saveState();
  fillProfileForm();
  resetAccountForm();
  ui.filter = "all";
  ui.query = "";
  refs.searchInput.value = "";
  refs.filterGroup.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });
  render();
}

function findAccount(accountId) {
  return state.accounts.find((account) => account.id === accountId);
}

function getPlatform(platformKey) {
  return platformCatalog.find((platform) => platform.key === platformKey) || platformCatalog[platformCatalog.length - 1];
}

function buildAccountActions(account, platformCue) {
  const actions = [platformCue];
  if (account.phoneLinked === "yes") {
    actions.push("Decide whether this account truly needs your phone number attached.");
  } else if (account.phoneLinked === "review") {
    actions.push("Confirm whether this account still has your phone number attached.");
  }
  if (account.discoverability === "on") {
    actions.push("Turn off phone-based discoverability if you want this account harder to find.");
  } else if (account.discoverability === "review") {
    actions.push("Confirm whether phone-based account discovery is enabled or disabled.");
  }
  if (account.contactSync === "on") {
    actions.push("Review uploaded contacts and remove synced address-book data if it is no longer needed.");
  } else if (account.contactSync === "review") {
    actions.push("Check whether contact syncing was ever enabled on this account.");
  }
  if (account.smsSecurity === "on") {
    actions.push("Consider switching recovery or verification from SMS to an authenticator app or stronger method.");
  } else if (account.smsSecurity === "review") {
    actions.push("Confirm whether SMS is still used for recovery, sign-in, or verification prompts.");
  }
  if (isReviewStale(account)) {
    actions.push(`Review this account again. It is outside your ${state.profile.reviewWindow}-day review window.`);
  }
  return actions.slice(0, 5);
}

function buildBadges(account) {
  return [
    badgeForPhoneLink(account.phoneLinked),
    badgeForTriState(account.discoverability, "Discoverable", "Discovery off", "Discovery unknown"),
    badgeForTriState(account.contactSync, "Contacts synced", "Contacts off", "Contacts unknown"),
    badgeForTriState(account.smsSecurity, "SMS in use", "SMS not used", "SMS unknown")
  ];
}

function badgeForPhoneLink(value) {
  if (value === "yes") {
    return { label: "Phone linked", className: "badge-warn" };
  }
  if (value === "no") {
    return { label: "Phone removed", className: "badge-good" };
  }
  return { label: "Phone status unknown", className: "" };
}

function badgeForTriState(value, onLabel, offLabel, reviewLabel) {
  if (value === "on") {
    return { label: onLabel, className: "badge-danger" };
  }
  if (value === "off") {
    return { label: offLabel, className: "badge-good" };
  }
  return { label: reviewLabel, className: "" };
}

function getRiskTier(account) {
  let score = 0;
  if (account.phoneLinked === "yes") {
    score += 2;
  } else if (account.phoneLinked === "review") {
    score += 1;
  }
  score += riskPoints(account.discoverability, 4, 1);
  score += riskPoints(account.contactSync, 3, 1);
  score += riskPoints(account.smsSecurity, 2, 1);
  if (isReviewStale(account)) {
    score += 2;
  } else if (!account.lastReviewed) {
    score += 1;
  }

  if (score >= 8) {
    return { tier: "high", label: "High priority" };
  }
  if (score >= 4) {
    return { tier: "medium", label: "Medium priority" };
  }
  return { tier: "low", label: "Low priority" };
}

function riskPoints(value, onPoints, reviewPoints) {
  if (value === "on") {
    return onPoints;
  }
  if (value === "review") {
    return reviewPoints;
  }
  return 0;
}

function isReviewStale(account) {
  if (!account.lastReviewed) {
    return false;
  }
  const windowDays = Number(state.profile.reviewWindow || "90");
  const reviewedAt = new Date(account.lastReviewed);
  const ageInDays = Math.floor((Date.now() - reviewedAt.getTime()) / 86400000);
  return ageInDays > windowDays;
}

function renderReviewCopy(account) {
  if (!account.lastReviewed) {
    return "Last reviewed: not recorded yet";
  }
  const ageInDays = Math.floor((Date.now() - new Date(account.lastReviewed).getTime()) / 86400000);
  return `Last reviewed ${ageInDays} day${ageInDays === 1 ? "" : "s"} ago`;
}

function sortByRiskThenName(left, right) {
  const riskDelta = scoreValue(right) - scoreValue(left);
  if (riskDelta !== 0) {
    return riskDelta;
  }
  return left.platformName.localeCompare(right.platformName);
}

function scoreValue(account) {
  const tier = getRiskTier(account).tier;
  if (tier === "high") {
    return 3;
  }
  if (tier === "medium") {
    return 2;
  }
  return 1;
}

function joinAccountNames(accounts) {
  const names = accounts.slice(0, 3).map((account) => account.platformName);
  if (accounts.length <= 3) {
    return names.join(", ");
  }
  return `${names.join(", ")}, and ${accounts.length - 3} more`;
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function makeId() {
  return `acct-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
