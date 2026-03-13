const toggle = document.getElementById("billing-toggle");
const prices = [...document.querySelectorAll(".price")];
const suffixes = [...document.querySelectorAll(".plans small")];

function render() {
  const yearly = toggle.checked;
  prices.forEach((node) => {
    const value = yearly ? node.dataset.year : node.dataset.month;
    node.textContent = `$${value}`;
  });
  suffixes.forEach((node) => node.textContent = yearly ? "/month billed yearly" : "/month");
}

toggle.addEventListener("change", render);
render();