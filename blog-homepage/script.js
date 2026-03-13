const posts = [
  { title: "Building Better Layout Systems", category: "css", min: 6, summary: "Use spatial tokens and grids to keep design systems predictable." },
  { title: "State Management Without Frameworks", category: "javascript", min: 8, summary: "A practical pattern for medium-size vanilla apps." },
  { title: "Freelancer Workflow That Scales", category: "career", min: 5, summary: "Templates and rituals that reduce delivery chaos." },
  { title: "Feature Prioritization in Startups", category: "product", min: 7, summary: "A simple matrix to align impact, effort, and urgency." },
  { title: "Animation Principles for UI", category: "css", min: 4, summary: "Micro-motion rules that make interfaces feel intentional." }
];

const el = {
  search: document.getElementById("search"),
  category: document.getElementById("category"),
  posts: document.getElementById("posts"),
  empty: document.getElementById("empty")
};

[el.search, el.category].forEach((n) => n.addEventListener("input", render));
render();

function render() {
  const q = el.search.value.trim().toLowerCase();
  const category = el.category.value;
  const rows = posts.filter((p) => {
    const byQuery = p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q);
    const byCat = category === "all" || p.category === category;
    return byQuery && byCat;
  });

  el.posts.innerHTML = "";
  el.empty.style.display = rows.length ? "none" : "block";

  rows.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";
    article.innerHTML = `
      <div class="meta"><span class="tag">${post.category.toUpperCase()}</span><span>${post.min} min read</span></div>
      <h2>${post.title}</h2>
      <p>${post.summary}</p>
      <a href="#">Read article</a>
    `;
    el.posts.appendChild(article);
  });
}