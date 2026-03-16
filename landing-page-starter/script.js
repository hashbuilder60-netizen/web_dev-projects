const toggle = document.getElementById("billing-toggle");
const prices = [...document.querySelectorAll(".price")];
const suffixes = [...document.querySelectorAll(".plans small")];
const openDemoBtn = document.getElementById("open-demo");
const closeDemoBtn = document.getElementById("close-demo");
const demoDialog = document.getElementById("demo-dialog");
const demoForm = document.getElementById("demo-form");
const demoMsg = document.getElementById("demo-msg");

function renderPricing() {
  const yearly = toggle.checked;
  prices.forEach((node) => {
    node.textContent = `$${yearly ? node.dataset.year : node.dataset.month}`;
  });
  suffixes.forEach((node) => {
    node.textContent = yearly ? "/month billed yearly" : "/month";
  });
}

toggle.addEventListener("change", renderPricing);
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
let quoteTimer = setInterval(cycleQuote, 5000);

openDemoBtn.addEventListener("click", () => {
  demoMsg.textContent = "";
  demoDialog.showModal();
});

closeDemoBtn.addEventListener("click", () => {
  demoDialog.close();
});

demoForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("demo-name").value.trim();
  const email = document.getElementById("demo-email").value.trim();
  if (!name || !email) {
    demoMsg.textContent = "Please complete all fields.";
    return;
  }
  demoMsg.textContent = `Thanks ${name}. Demo request received for ${email}.`;
  demoForm.reset();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    clearInterval(quoteTimer);
    quoteTimer = null;
    return;
  }
  if (!quoteTimer) quoteTimer = setInterval(cycleQuote, 5000);
});

function cycleQuote() {
  t = (t + 1) % testimonials.length;
  document.getElementById("quote").textContent = testimonials[t].q;
  document.getElementById("quote-author").textContent = testimonials[t].a;
}
