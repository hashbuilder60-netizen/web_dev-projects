const toggle = document.getElementById("billing-toggle") as HTMLInputElement | null;
const prices = [...document.querySelectorAll(".price")] as HTMLElement[];
const suffixes = [...document.querySelectorAll(".plans small")] as HTMLElement[];
const openDemoBtn = document.getElementById("open-demo") as HTMLButtonElement | null;
const closeDemoBtn = document.getElementById("close-demo") as HTMLButtonElement | null;
const demoDialog = document.getElementById("demo-dialog") as HTMLDialogElement | null;
const demoForm = document.getElementById("demo-form") as HTMLFormElement | null;
const demoMsg = document.getElementById("demo-msg") as HTMLElement | null;

function renderPricing() {
  const yearly = Boolean(toggle?.checked);
  prices.forEach((node) => {
    const month = node.dataset.month ?? "0";
    const year = node.dataset.year ?? month;
    node.textContent = `$${yearly ? year : month}`;
  });
  suffixes.forEach((node) => {
    node.textContent = yearly ? "/month billed yearly" : "/month";
  });
}

toggle?.addEventListener("change", renderPricing);
renderPricing();

const testimonials = [
  {
    q: "\"We shipped a premium site in 3 days and it outperformed our previous one immediately.\"",
    a: "- Head of Growth, PulsePay"
  },
  {
    q: "\"The social-proof sections alone improved trial starts by 29% in our first month.\"",
    a: "- Marketing Lead, CloudDesk"
  },
  {
    q: "\"Our team finally has a landing page foundation we can scale without redesigning every sprint.\"",
    a: "- Product Marketing, Mosaic AI"
  }
];

let t = 0;
let quoteTimer: number | null = window.setInterval(cycleQuote, 5000);

openDemoBtn?.addEventListener("click", () => {
  if (demoMsg) demoMsg.textContent = "";
  demoDialog?.showModal();
});

closeDemoBtn?.addEventListener("click", () => {
  demoDialog?.close();
});

demoForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = (document.getElementById("demo-name") as HTMLInputElement | null)?.value.trim() ?? "";
  const email = (document.getElementById("demo-email") as HTMLInputElement | null)?.value.trim() ?? "";
  if (!name || !email) {
    if (demoMsg) demoMsg.textContent = "Please complete all fields.";
    return;
  }
  if (demoMsg) demoMsg.textContent = `Thanks ${name}. Demo request received for ${email}.`;
  demoForm?.reset();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (quoteTimer) clearInterval(quoteTimer);
    quoteTimer = null;
    return;
  }
  if (!quoteTimer) quoteTimer = window.setInterval(cycleQuote, 5000);
});

function cycleQuote() {
  t = (t + 1) % testimonials.length;
  const quote = document.getElementById("quote");
  const author = document.getElementById("quote-author");
  if (quote) quote.textContent = testimonials[t].q;
  if (author) author.textContent = testimonials[t].a;
}
