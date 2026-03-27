"use strict";
(() => {
    const cardsEl = document.getElementById("cards");
    const filters = [...document.querySelectorAll(".filter")];
    const modal = document.getElementById("project-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalDesc = document.getElementById("modal-desc");
    const modalResult = document.getElementById("modal-result");
    const leadForm = document.getElementById("lead-form");
    const leadMsg = document.getElementById("lead-msg");
    const themeToggle = document.getElementById("theme-toggle");
    const THEME_KEY = "portfolio_theme_v1";
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const projects = [
        { title: "CloudDesk Onboarding", type: "saas", summary: "Reworked signup and trial setup UX.", result: "+34% trial conversion", tags: ["UX", "Growth"] },
        { title: "VaultPay Dashboard", type: "fintech", summary: "Redesigned account and analytics workflows.", result: "-27% support tickets", tags: ["Fintech", "Data UI"] },
        { title: "Nova Checkout", type: "commerce", summary: "Simplified checkout and delivery steps.", result: "+19% checkout completion", tags: ["Ecommerce", "Conversion"] },
        { title: "Pulse CRM Homepage", type: "saas", summary: "Built modular marketing page system.", result: "+41% qualified leads", tags: ["Marketing", "SaaS"] },
        { title: "Ledger Mobile Flow", type: "fintech", summary: "Streamlined transaction and transfer journeys.", result: "+22 NPS points", tags: ["Mobile", "Finance"] },
        { title: "Atlas Storefront", type: "commerce", summary: "Launched scalable product browsing and PDP system.", result: "+14% AOV", tags: ["Storefront", "Performance"] }
    ];
    const quotes = [
        { q: "\"Ada transformed our dashboard UX and reduced support tickets in under one quarter.\"", a: "- VP Product, CloudDesk" },
        { q: "\"Fast delivery, strong product instincts, and excellent collaboration with engineering.\"", a: "- Head of Design, VaultPay" },
        { q: "\"The new checkout experience paid for itself in weeks.\"", a: "- Growth Lead, Nova Commerce" }
    ];
    let filter = "all";
    let quoteIndex = 0;
    let quoteTimer = null;
    initTheme();
    render();
    startQuoteRotation();
    filters.forEach((btn) => {
        btn.addEventListener("click", () => {
            filters.forEach((n) => n.classList.remove("active"));
            btn.classList.add("active");
            filter = btn.dataset.filter;
            render();
        });
    });
    leadForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("lead-name")?.value.trim() ?? "";
        const email = document.getElementById("lead-email")?.value.trim() ?? "";
        const budget = document.getElementById("lead-budget")?.value ?? "";
        if (!name || !email || !budget) {
            if (leadMsg)
                leadMsg.textContent = "Please complete all inquiry fields.";
            return;
        }
        if (!EMAIL_RE.test(email)) {
            if (leadMsg)
                leadMsg.textContent = "Please provide a valid email address.";
            return;
        }
        if (leadMsg)
            leadMsg.textContent = `Thanks ${name}. Inquiry received for ${budget}. I will reach out at ${email}.`;
        leadForm?.reset();
    });
    themeToggle?.addEventListener("click", () => {
        const isDark = document.body.classList.toggle("dark");
        localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden)
            stopQuoteRotation();
        else
            startQuoteRotation();
    });
    function render() {
        if (!cardsEl)
            return;
        cardsEl.innerHTML = "";
        const rows = projects.filter((p) => filter === "all" || p.type === filter);
        rows.forEach((p) => {
            const card = document.createElement("article");
            card.className = "card";
            card.innerHTML = `<h3>${p.title}</h3><p>${p.summary}</p><div class="chips">${p.tags.map((t) => `<span class="chip">${t}</span>`).join("")}</div><p><strong>${p.result}</strong></p><button type="button">View Case Study</button>`;
            const button = card.querySelector("button");
            button?.addEventListener("click", () => {
                if (modalTitle)
                    modalTitle.textContent = p.title;
                if (modalDesc)
                    modalDesc.textContent = p.summary;
                if (modalResult)
                    modalResult.textContent = p.result;
                modal?.showModal();
            });
            cardsEl.appendChild(card);
        });
    }
    function initTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "dark") {
            document.body.classList.add("dark");
            return;
        }
        if (saved === "light")
            return;
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (prefersDark)
            document.body.classList.add("dark");
    }
    function startQuoteRotation() {
        stopQuoteRotation();
        quoteTimer = window.setInterval(() => {
            quoteIndex = (quoteIndex + 1) % quotes.length;
            const quote = document.getElementById("quote");
            const author = document.getElementById("quote-author");
            if (quote)
                quote.textContent = quotes[quoteIndex].q;
            if (author)
                author.textContent = quotes[quoteIndex].a;
        }, 5000);
    }
    function stopQuoteRotation() {
        if (!quoteTimer)
            return;
        clearInterval(quoteTimer);
        quoteTimer = null;
    }
})();
