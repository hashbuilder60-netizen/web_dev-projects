const toggle = document.getElementById("billing-toggle");
const prices = [...document.querySelectorAll(".price")];
const suffixes = [...document.querySelectorAll(".plans small")];

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
  { q: '"We shipped a premium site in 3 days and it outperformed our previous one immediately."', a: "- Head of Growth, PulsePay" },
  { q: '"The social-proof sections alone improved trial starts by 29% in our first month."', a: "- Marketing Lead, CloudDesk" },
  { q: '"Our team finally has a landing page foundation we can scale without redesigning every sprint."', a: "- Product Marketing, Mosaic AI" }
];
let t = 0;
setInterval(() => {
  t = (t + 1) % testimonials.length;
  document.getElementById("quote").textContent = testimonials[t].q;
  document.getElementById("quote-author").textContent = testimonials[t].a;
}, 5000);
