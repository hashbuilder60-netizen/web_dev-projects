const cardsEl = document.getElementById("cards");
const filters = [...document.querySelectorAll(".filter")];
const modal = document.getElementById("project-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalResult = document.getElementById("modal-result");

const projects = [
  { title: "CloudDesk Onboarding", type: "saas", summary: "Reworked signup and trial setup UX.", result: "+34% trial conversion", tags: ["UX", "Growth"] },
  { title: "VaultPay Dashboard", type: "fintech", summary: "Redesigned account and analytics workflows.", result: "-27% support tickets", tags: ["Fintech", "Data UI"] },
  { title: "Nova Checkout", type: "commerce", summary: "Simplified checkout and delivery steps.", result: "+19% checkout completion", tags: ["Ecommerce", "Conversion"] },
  { title: "Pulse CRM Homepage", type: "saas", summary: "Built modular marketing page system.", result: "+41% qualified leads", tags: ["Marketing", "SaaS"] },
  { title: "Ledger Mobile Flow", type: "fintech", summary: "Streamlined transaction and transfer journeys.", result: "+22 NPS points", tags: ["Mobile", "Finance"] },
  { title: "Atlas Storefront", type: "commerce", summary: "Launched scalable product browsing and PDP system.", result: "+14% AOV", tags: ["Storefront", "Performance"] }
];

let filter = "all";

function render() {
  cardsEl.innerHTML = "";
  const rows = projects.filter((p) => filter === "all" || p.type === filter);
  rows.forEach((p) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `<h3>${p.title}</h3><p>${p.summary}</p><div class="chips">${p.tags.map((t)=>`<span class="chip">${t}</span>`).join("")}</div><p><strong>${p.result}</strong></p><button type="button">View Case Study</button>`;
    card.querySelector("button").addEventListener("click", () => {
      modalTitle.textContent = p.title;
      modalDesc.textContent = p.summary;
      modalResult.textContent = p.result;
      modal.showModal();
    });
    cardsEl.appendChild(card);
  });
}

filters.forEach((btn) => btn.addEventListener("click", () => {
  filters.forEach((n) => n.classList.remove("active"));
  btn.classList.add("active");
  filter = btn.dataset.filter;
  render();
}));

const quotes = [
  { q: '"Ada transformed our dashboard UX and reduced support tickets in under one quarter."', a: "- VP Product, CloudDesk" },
  { q: '"Fast delivery, strong product instincts, and excellent collaboration with engineering."', a: "- Head of Design, VaultPay" },
  { q: '"The new checkout experience paid for itself in weeks."', a: "- Growth Lead, Nova Commerce" }
];
let q = 0;
setInterval(() => {
  q = (q + 1) % quotes.length;
  document.getElementById("quote").textContent = quotes[q].q;
  document.getElementById("quote-author").textContent = quotes[q].a;
}, 5000);

document.getElementById("lead-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("lead-name").value.trim();
  const email = document.getElementById("lead-email").value.trim();
  const budget = document.getElementById("lead-budget").value;
  const msg = document.getElementById("lead-msg");
  if (!name || !email || !budget) {
    msg.textContent = "Please complete all inquiry fields.";
    return;
  }
  msg.textContent = `Thanks ${name}. Inquiry received for ${budget}. I will reach out at ${email}.`;
  e.target.reset();
});

document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

render();
