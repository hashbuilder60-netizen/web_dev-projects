const qty = document.getElementById("qty");
const hero = document.getElementById("hero");
const msg = document.getElementById("msg");
const shipMsg = document.getElementById("ship-msg");
const colorSelect = document.getElementById("color-select");
const cartCount = document.getElementById("cart-count");
const priceEl = document.getElementById("price");
const thumbs = [...document.querySelectorAll(".thumb")];
const tabs = [...document.querySelectorAll(".tab")];
const tabContent = document.getElementById("tab-content");

const KEY = "nova_cart_count";
let q = 1;
let cart = Number(localStorage.getItem(KEY) || "0");
cartCount.textContent = String(cart);

const palettes = {
  forest: "linear-gradient(120deg,#d5f4eb,#a3d8c8)",
  midnight: "linear-gradient(120deg,#dbe6fb,#9bb5e6)",
  sand: "linear-gradient(120deg,#f8eedf,#e4cda8)"
};
const pricing = { Forest: 129, Midnight: 139, Sand: 134 };
const tabData = {
  specs: "Bluetooth 5.3, active noise canceling, 40-hour battery, USB-C fast charge, and multipoint pairing.",
  box: "Headphones, carrying case, USB-C cable, 3.5mm audio cable, and quick start guide.",
  warranty: "One-year limited warranty with optional two-year protection plan at checkout."
};

document.getElementById("plus").onclick = () => { q++; qty.textContent = q; };
document.getElementById("minus").onclick = () => { if (q > 1) { q--; qty.textContent = q; } };

document.getElementById("add").onclick = () => {
  cart += q;
  localStorage.setItem(KEY, String(cart));
  cartCount.textContent = String(cart);
  msg.textContent = `Added ${q} item(s) to cart.`;
};

document.getElementById("check-ship").onclick = () => {
  const zip = document.getElementById("zip").value.trim();
  if (!zip) { shipMsg.textContent = "Enter a ZIP code first."; return; }
  const fast = zip.endsWith("1") || zip.endsWith("3") || zip.endsWith("7");
  shipMsg.textContent = fast ? "Express shipping available: 1-2 business days." : "Standard shipping: 3-5 business days.";
};

colorSelect.addEventListener("change", () => {
  const color = colorSelect.value;
  hero.style.background = palettes[color.toLowerCase()];
  priceEl.textContent = `$${pricing[color]}.00`;
  thumbs.forEach((t) => t.classList.toggle("active", t.dataset.view.toLowerCase() === color.toLowerCase()));
});
thumbs.forEach((btn) => btn.addEventListener("click", () => {
  colorSelect.value = btn.textContent;
  colorSelect.dispatchEvent(new Event("change"));
}));

tabs.forEach((tab) => tab.addEventListener("click", () => {
  tabs.forEach((t) => t.classList.remove("active"));
  tab.classList.add("active");
  tabContent.textContent = tabData[tab.dataset.tab];
}));
tabContent.textContent = tabData.specs;
