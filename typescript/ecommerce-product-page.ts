const qty = document.getElementById("qty") as HTMLElement | null;
const hero = document.getElementById("hero") as HTMLElement | null;
const msg = document.getElementById("msg") as HTMLElement | null;
const shipMsg = document.getElementById("ship-msg") as HTMLElement | null;
const colorSelect = document.getElementById("color-select") as HTMLSelectElement | null;
const cartCount = document.getElementById("cart-count") as HTMLElement | null;
const priceEl = document.getElementById("price") as HTMLElement | null;
const thumbs = [...document.querySelectorAll(".thumb")] as HTMLButtonElement[];
const tabs = [...document.querySelectorAll(".tab")] as HTMLButtonElement[];
const tabContent = document.getElementById("tab-content") as HTMLElement | null;

const KEY = "nova_cart_count";
let q = 1;
let cart = Number(localStorage.getItem(KEY) || "0");
if (cartCount) cartCount.textContent = String(cart);

const palettes: Record<string, string> = {
  forest: "linear-gradient(120deg,#d5f4eb,#a3d8c8)",
  midnight: "linear-gradient(120deg,#dbe6fb,#9bb5e6)",
  sand: "linear-gradient(120deg,#f8eedf,#e4cda8)"
};
const pricing: Record<string, number> = { Forest: 129, Midnight: 139, Sand: 134 };
const tabData: Record<string, string> = {
  specs: "Bluetooth 5.3, active noise canceling, 40-hour battery, USB-C fast charge, and multipoint pairing.",
  box: "Headphones, carrying case, USB-C cable, 3.5mm audio cable, and quick start guide.",
  warranty: "One-year limited warranty with optional two-year protection plan at checkout."
};

document.getElementById("plus")?.addEventListener("click", () => {
  q += 1;
  if (qty) qty.textContent = String(q);
});

document.getElementById("minus")?.addEventListener("click", () => {
  if (q > 1) q -= 1;
  if (qty) qty.textContent = String(q);
});

document.getElementById("add")?.addEventListener("click", () => {
  cart += q;
  localStorage.setItem(KEY, String(cart));
  if (cartCount) cartCount.textContent = String(cart);
  if (msg) msg.textContent = `Added ${q} item(s) to cart.`;
});

document.getElementById("check-ship")?.addEventListener("click", () => {
  const zip = (document.getElementById("zip") as HTMLInputElement | null)?.value.trim() ?? "";
  if (!zip) {
    if (shipMsg) shipMsg.textContent = "Enter a ZIP code first.";
    return;
  }
  const fast = zip.endsWith("1") || zip.endsWith("3") || zip.endsWith("7");
  if (shipMsg) shipMsg.textContent = fast ? "Express shipping available: 1-2 business days." : "Standard shipping: 3-5 business days.";
});

colorSelect?.addEventListener("change", () => {
  const color = colorSelect.value;
  if (hero) hero.style.background = palettes[color.toLowerCase()];
  if (priceEl) priceEl.textContent = `$${pricing[color]}.00`;
  thumbs.forEach((t) => t.classList.toggle("active", t.dataset.view?.toLowerCase() === color.toLowerCase()));
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    if (tabContent) tabContent.textContent = tabData[tab.dataset.tab ?? "specs"];
  });
});
if (tabContent) tabContent.textContent = tabData.specs;
