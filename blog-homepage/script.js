const posts = [
  {
    title: "Building Better Layout Systems",
    category: "css",
    min: 6,
    summary: "Use spatial tokens and grid heuristics for stable design systems.",
    views: 12000,
    date: "2026-03-05"
  },
  {
    title: "State Management Without Frameworks",
    category: "javascript",
    min: 8,
    summary: "A practical pattern for medium-size vanilla apps.",
    views: 18500,
    date: "2026-03-08"
  },
  {
    title: "Freelancer Workflow That Scales",
    category: "career",
    min: 5,
    summary: "Templates and rituals that reduce delivery chaos.",
    views: 9500,
    date: "2026-03-02"
  },
  {
    title: "Feature Prioritization in Startups",
    category: "product",
    min: 7,
    summary: "A matrix for impact, effort, and timing decisions.",
    views: 14100,
    date: "2026-03-09"
  },
  {
    title: "Animation Principles for UI",
    category: "css",
    min: 4,
    summary: "Motion choices that increase clarity without distraction.",
    views: 11100,
    date: "2026-03-01"
  },
  {
    title: "Reducing Churn with Better Empty States",
    category: "product",
    min: 6,
    summary: "Small messaging tweaks that improve first-session retention.",
    views: 16000,
    date: "2026-03-10"
  }
];

const PREF_KEY = "dev_journal_filters_v1";

const el = {
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  sort: document.getElementById("sort"),
  posts: document.getElementById("posts"),
  empty: document.getElementById("empty"),
  featuredTitle: document.getElementById("featured-title"),
  featuredSummary: document.getElementById("featured-summary")
};

restorePrefs();
updateFeatured();
render();

[el.search, el.category, el.sort].forEach((n) => {
  n.addEventListener("input", () => {
    savePrefs();
    render();
  });
});

document.getElementById("news-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("news-email").value.trim();
  const msg = document.getElementById("news-msg");
  msg.textContent = email ? `Subscribed: ${email}` : "Please enter an email.";
  e.target.reset();
});

function render() {
  const q = el.search.value.trim().toLowerCase();
  const category = el.category.value;
  const sort = el.sort.value;

  let rows = posts.filter((p) => {
    const byQuery = p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    const byCat = category === "all" || p.category === category;
    return byQuery && byCat;
  });

  rows.sort((a, b) => (sort === "popular" ? b.views - a.views : new Date(b.date) - new Date(a.date)));

  el.posts.innerHTML = "";
  el.empty.style.display = rows.length ? "none" : "block";

  rows.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";
    article.innerHTML = `
      <div class="meta"><span class="tag">${post.category.toUpperCase()}</span><span>${post.min} min read</span></div>
      <h3>${post.title}</h3>
      <p>${post.summary}</p>
      <div class="meta"><span>${post.views.toLocaleString()} views</span><a href="#">Read article</a></div>
    `;
    el.posts.appendChild(article);
  });
}

function updateFeatured() {
  const featured = [...posts].sort((a, b) => b.views - a.views)[0];
  if (!featured) return;
  el.featuredTitle.textContent = featured.title;
  el.featuredSummary.textContent = featured.summary;
}

function savePrefs() {
  const prefs = {
    search: el.search.value,
    category: el.category.value,
    sort: el.sort.value
  };
  localStorage.setItem(PREF_KEY, JSON.stringify(prefs));
}

function restorePrefs() {
  try {
    const prefs = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
    if (typeof prefs.search === "string") el.search.value = prefs.search;
    if (typeof prefs.category === "string") el.category.value = prefs.category;
    if (typeof prefs.sort === "string") el.sort.value = prefs.sort;
  } catch {
    // fall through to defaults
  }
}
