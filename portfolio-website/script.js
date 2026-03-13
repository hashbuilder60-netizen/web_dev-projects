const cardsEl = document.getElementById("cards");
const filters = [...document.querySelectorAll(".filter")];
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");

const projects = [
  { title: "SaaS Launch Funnel", type: "marketing", summary: "Landing flow that increased trial signup by 34%." },
  { title: "Analytics Control Center", type: "dashboard", summary: "KPI dashboard with role-based panels and alerts." },
  { title: "Checkout Redesign", type: "commerce", summary: "Streamlined purchase flow that reduced cart drop-off." },
  { title: "B2B Product Website", type: "marketing", summary: "Conversion-focused site with modular content blocks." },
  { title: "Operations Board", type: "dashboard", summary: "Internal dashboard with workflows and approval tracking." },
  { title: "Storefront UI Kit", type: "commerce", summary: "Reusable commerce components for rapid storefront builds." }
];

let filter = "all";

function render() {
  cardsEl.innerHTML = "";
  const rows = projects.filter((p) => filter === "all" || p.type === filter);
  rows.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h4>${p.title}</h4><p>${p.summary}</p><button type="button">View Details</button>`;
    card.querySelector("button").addEventListener("click", () => {
      modalTitle.textContent = p.title;
      modalDesc.textContent = p.summary;
      modal.showModal();
    });
    cardsEl.appendChild(card);
  });
}

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    filters.forEach((n) => n.classList.remove("active"));
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  });
});

render();