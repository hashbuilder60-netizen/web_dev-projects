(() => {
const posts = [
  { title: "Building Better Layout Systems", category: "css", min: 6, summary: "Use spatial tokens and grid heuristics for stable design systems.", views: 12000, date: "2026-03-05" },
  { title: "State Management Without Frameworks", category: "javascript", min: 8, summary: "A practical pattern for medium-size vanilla apps.", views: 18500, date: "2026-03-08" },
  { title: "Freelancer Workflow That Scales", category: "career", min: 5, summary: "Templates and rituals that reduce delivery chaos.", views: 9500, date: "2026-03-02" },
  { title: "Feature Prioritization in Startups", category: "product", min: 7, summary: "A matrix for impact, effort, and timing decisions.", views: 14100, date: "2026-03-09" },
  { title: "Animation Principles for UI", category: "css", min: 4, summary: "Motion choices that increase clarity without distraction.", views: 11100, date: "2026-03-01" },
  { title: "Reducing Churn with Better Empty States", category: "product", min: 6, summary: "Small messaging tweaks that improve first-session retention.", views: 16000, date: "2026-03-10" }
] as const;

type Post = (typeof posts)[number];

type Prefs = { search: string; category: string; sort: string };

const PREF_KEY = "dev_journal_filters_v1";

const el = {
  search: document.getElementById("search") as HTMLInputElement | null,
  category: document.getElementById("category") as HTMLSelectElement | null,
  sort: document.getElementById("sort") as HTMLSelectElement | null,
  posts: document.getElementById("posts") as HTMLElement | null,
  empty: document.getElementById("empty") as HTMLElement | null,
  featuredTitle: document.getElementById("featured-title") as HTMLElement | null,
  featuredSummary: document.getElementById("featured-summary") as HTMLElement | null
};

restorePrefs();
updateFeatured();
render();

[el.search, el.category, el.sort].forEach((n) => n?.addEventListener("input", () => {
  savePrefs();
  render();
}));

document.getElementById("news-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = (document.getElementById("news-email") as HTMLInputElement | null)?.value.trim() ?? "";
  const msg = document.getElementById("news-msg") as HTMLElement | null;
  if (msg) msg.textContent = email ? `Subscribed: ${email}` : "Please enter an email.";
  (e.target as HTMLFormElement).reset();
});

function render() {
  const q = el.search?.value.trim().toLowerCase() ?? "";
  const category = el.category?.value ?? "all";
  const sort = el.sort?.value ?? "new";

  let rows = posts.filter((p) => {
    const byQuery = p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    const byCat = category === "all" || p.category === category;
    return byQuery && byCat;
  });

  rows = [...rows].sort((a, b) => (sort === "popular" ? b.views - a.views : new Date(b.date).getTime() - new Date(a.date).getTime()));

  if (el.posts) el.posts.innerHTML = "";
  if (el.empty) el.empty.style.display = rows.length ? "none" : "block";

  rows.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";
    article.innerHTML = `<div class="meta"><span class="tag">${post.category.toUpperCase()}</span><span>${post.min} min read</span></div><h3>${post.title}</h3><p>${post.summary}</p><div class="meta"><span>${post.views.toLocaleString()} views</span><a href="#">Read article</a></div>`;
    el.posts?.appendChild(article);
  });
}

function updateFeatured() {
  const featured = [...posts].sort((a, b) => b.views - a.views)[0];
  if (!featured) return;
  if (el.featuredTitle) el.featuredTitle.textContent = featured.title;
  if (el.featuredSummary) el.featuredSummary.textContent = featured.summary;
}

function savePrefs() {
  const prefs: Prefs = {
    search: el.search?.value ?? "",
    category: el.category?.value ?? "all",
    sort: el.sort?.value ?? "new"
  };
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function restorePrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}") as Partial<Prefs>;
    if (typeof prefs.search === "string" && el.search) el.search.value = prefs.search;
    if (typeof prefs.category === "string" && el.category) el.category.value = prefs.category;
    if (typeof prefs.sort === "string" && el.sort) el.sort.value = prefs.sort;
  } catch {
    // no-op
  }
}

})();

