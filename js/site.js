/* ============================================================
   site.js — public site interactions & dynamic rendering
   ============================================================ */
(function () {
    "use strict";
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    /* ---------- Preloader ---------- */
    const preloader = $("#preloader");
    if (preloader) {
        const tipEl = $(".preload-tip", preloader);
        const tips = [
            "VFX is the art of making the impossible look effortless.",
            "Every texture tells a story — down to the last pore.",
            "Light is the final brushstroke on any surface.",
            "Great creatures are built one detail at a time.",
            "Loading pixels with personality…"
        ];
        if (tipEl) tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
        const hide = () => preloader.classList.add("loaded");
        window.addEventListener("load", () => setTimeout(hide, 600));
        setTimeout(hide, 4000); // safety
    }

    /* ---------- Stars ---------- */
    const starsLayer = $(".stars");
    if (starsLayer) {
        const n = window.innerWidth < 700 ? 30 : 60;
        let html = "";
        for (let i = 0; i < n; i++) {
            html += `<span class="star" style="top:${Math.random() * 100}%;left:${Math.random() * 100}%;animation-delay:${(Math.random() * 3).toFixed(2)}s"></span>`;
        }
        starsLayer.innerHTML = html;
    }

    /* ---------- Navbar ---------- */
    const nav = $(".nav");
    if (nav) {
        const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        const toggle = $(".nav__toggle", nav);
        if (toggle) toggle.addEventListener("click", () => nav.classList.toggle("open"));
        $$(".nav__links a", nav).forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));
    }

    /* ---------- Scroll reveal ---------- */
    const io = ("IntersectionObserver" in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add("in");
                    if (e.target.dataset.skill) animSkill(e.target);
                    if (e.target.dataset.count) animCount(e.target);
                    if (e.target.dataset.ring) animRing(e.target);
                    io.unobserve(e.target);
                }
            });
        }, { threshold: 0.15 })
        : null;
    function observe(el) { if (io) io.observe(el); else el.classList.add("in"); }
    $$(".reveal").forEach(observe);

    /* ---------- Counters ---------- */
    function animCount(el) {
        const target = parseFloat(el.dataset.count) || 0;
        const dur = 1400; const start = performance.now();
        (function step(t) {
            const p = Math.min((t - start) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
        })(start);
    }
    $$("[data-count]").forEach(observe);

    /* ---------- Skill bars ---------- */
    function animSkill(el) { const fill = $("i", el); if (fill) fill.style.width = el.dataset.skill + "%"; }
    $$("[data-skill]").forEach(observe);

    /* ---------- Tool rings ---------- */
    function animRing(el) {
        const pct = parseInt(el.dataset.ring, 10) || 0;
        const circle = $(".ring-fg", el);
        const label = $(".pct", el);
        if (circle) {
            const r = circle.r.baseVal.value;
            const circ = 2 * Math.PI * r;
            circle.style.strokeDasharray = circ;
            circle.style.strokeDashoffset = circ;
            requestAnimationFrame(() => {
                circle.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)";
                circle.style.strokeDashoffset = circ * (1 - pct / 100);
            });
        }
        if (label) animCountTo(label, pct, "%");
    }
    function animCountTo(el, target, suffix) {
        const dur = 1400, start = performance.now();
        (function step(t) {
            const p = Math.min((t - start) / dur, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (suffix || "");
            if (p < 1) requestAnimationFrame(step);
        })(start);
    }
    $$("[data-ring]").forEach(observe);

    /* ---------- Lightbox ---------- */
    let lb, lbImg, lbImages = [], lbIndex = 0;
    function ensureLightbox() {
        if (lb) return;
        lb = document.createElement("div");
        lb.className = "lightbox";
        lb.innerHTML = `
            <button class="lightbox__close" aria-label="Close">✕</button>
            <button class="lightbox__nav prev" aria-label="Previous">‹</button>
            <img alt="">
            <button class="lightbox__nav next" aria-label="Next">›</button>`;
        document.body.appendChild(lb);
        lbImg = $("img", lb);
        $(".lightbox__close", lb).addEventListener("click", closeLB);
        $(".prev", lb).addEventListener("click", (e) => { e.stopPropagation(); step(-1); });
        $(".next", lb).addEventListener("click", (e) => { e.stopPropagation(); step(1); });
        lb.addEventListener("click", (e) => { if (e.target === lb) closeLB(); });
        document.addEventListener("keydown", (e) => {
            if (!lb.classList.contains("open")) return;
            if (e.key === "Escape") closeLB();
            if (e.key === "ArrowLeft") step(-1);
            if (e.key === "ArrowRight") step(1);
        });
    }
    function openLB(images, i) { ensureLightbox(); lbImages = images; lbIndex = i; lbImg.src = images[i]; lb.classList.add("open"); document.body.style.overflow = "hidden"; }
    function closeLB() { lb.classList.remove("open"); document.body.style.overflow = ""; }
    function step(d) { lbIndex = (lbIndex + d + lbImages.length) % lbImages.length; lbImg.src = lbImages[lbIndex]; }
    window.__openLightbox = openLB;

    /* ============================================================
       Dynamic rendering
       ============================================================ */

    /* ----- Home: featured work ----- */
    const featuredEl = $("#featuredWork");
    if (featuredEl) {
        API.listProjects().then((projects) => {
            const top = projects.slice(0, 6);
            if (!top.length) { featuredEl.innerHTML = emptyState("No projects yet", "New work is on the way — check back soon!"); return; }
            featuredEl.innerHTML = top.map(cardHTML).join("");
            wireCards(featuredEl);
            const heroImg = $("#heroArtwork");
            if (heroImg && top[0].cover_image) heroImg.src = top[0].cover_image;
        }).catch((e) => { console.error(e); featuredEl.innerHTML = emptyState("Couldn't load work", "Please refresh in a moment."); });
    }

    /* ----- Portfolio: full grid + filters ----- */
    const gridEl = $("#workGrid");
    if (gridEl) {
        API.listProjects().then((projects) => {
            if (!projects.length) { gridEl.innerHTML = emptyState("Nothing here yet", "The portfolio is being curated — new work coming soon."); return; }
            gridEl.innerHTML = projects.map(cardHTML).join("");
            wireCards(gridEl);
            const filters = $("#filters");
            if (filters) {
                filters.addEventListener("click", (e) => {
                    const btn = e.target.closest("button"); if (!btn) return;
                    $$("button", filters).forEach((b) => b.classList.remove("active"));
                    btn.classList.add("active");
                    const f = btn.dataset.filter;
                    $$(".work-card", gridEl).forEach((c) => {
                        c.classList.toggle("hide", f !== "*" && c.dataset.cat !== f);
                    });
                });
            }
        }).catch((e) => { console.error(e); gridEl.innerHTML = emptyState("Couldn't load portfolio", "Please refresh in a moment."); });
    }

    /* ----- Project detail ----- */
    const detailEl = $("#projectDetail");
    if (detailEl) {
        const id = new URLSearchParams(location.search).get("id");
        if (!id) { detailEl.innerHTML = emptyState("Project not found", "This link looks incomplete."); return; }
        API.getProject(id).then((p) => {
            if (!p) { detailEl.innerHTML = emptyState("Project not found", "It may have been moved or removed."); return; }
            document.title = `${p.title} — Hassam Hussain Jafri`;
            const imgs = Array.isArray(p.images) && p.images.length ? p.images : (p.cover_image ? [p.cover_image] : []);
            const descHTML = String(p.description || p.summary || "")
                .split(/\n{2,}/).map((para) => `<p>${esc(para).replace(/\n/g, "<br>")}</p>`).join("");
            detailEl.innerHTML = `
              <section class="container project-hero">
                <a href="portfolio.html" class="eyebrow" style="cursor:pointer">← Back to portfolio</a>
                <h1 class="reveal">${esc(p.title)}</h1>
                <div class="project-meta reveal d1">
                  ${p.role ? `<div>Role · <b>${esc(p.role)}</b></div>` : ""}
                  ${p.year ? `<div>Year · <b>${esc(p.year)}</b></div>` : ""}
                  ${p.category ? `<div>Type · <b>${esc(cap(p.category))}</b></div>` : ""}
                </div>
              </section>
              ${p.cover_image ? `<section class="container reveal"><img src="${esc(p.cover_image)}" alt="${esc(p.title)}" style="width:100%;border-radius:var(--radius-lg);border:1px solid var(--border-soft)"></section>` : ""}
              <section class="container section--tight">
                <div class="project-body">
                  <div class="project-prose reveal">${descHTML || "<p>No description provided.</p>"}</div>
                  <aside class="project-side reveal d1">
                    <h4>Project details</h4>
                    ${p.software ? `<div class="row"><span>Software</span><b>${esc(p.software)}</b></div>` : ""}
                    ${p.role ? `<div class="row"><span>Role</span><b>${esc(p.role)}</b></div>` : ""}
                    ${p.year ? `<div class="row"><span>Year</span><b>${esc(p.year)}</b></div>` : ""}
                    ${p.category ? `<div class="row"><span>Category</span><b>${esc(cap(p.category))}</b></div>` : ""}
                    <a href="contact.html" class="btn btn--primary btn--block" style="margin-top:18px">Work with me</a>
                  </aside>
                </div>
                ${imgs.length ? `<div class="project-gallery reveal">${imgs.map((u, i) => `<img src="${esc(u)}" data-i="${i}" alt="${esc(p.title)} image ${i + 1}">`).join("")}</div>` : ""}
              </section>`;
            $$(".reveal", detailEl).forEach(observe);
            const galleryImgs = imgs.slice();
            $$(".project-gallery img", detailEl).forEach((img) => {
                img.addEventListener("click", () => openLB(galleryImgs, parseInt(img.dataset.i, 10)));
            });
        }).catch((e) => { console.error(e); detailEl.innerHTML = emptyState("Couldn't load project", "Please refresh in a moment."); });
    }

    /* ----- Contact form ----- */
    const cForm = $("#contactForm");
    if (cForm) {
        cForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const note = $("#contactNote", cForm.parentNode) || $("#contactNote");
            const data = Object.fromEntries(new FormData(cForm));
            if (!data.name || !data.email || !data.message) {
                if (note) { note.className = "form-note err"; note.textContent = "Please fill in your name, email and message."; }
                return;
            }
            // Opens the visitor's email client addressed to Hassam (no backend needed).
            const subject = encodeURIComponent(data.subject || `Portfolio enquiry from ${data.name}`);
            const body = encodeURIComponent(`${data.message}\n\n— ${data.name}\n${data.email}`);
            window.location.href = `mailto:hello@hassamjafri.com?subject=${subject}&body=${body}`;
            if (note) { note.className = "form-note ok"; note.textContent = "Opening your email app… thanks for reaching out!"; }
            cForm.reset();
        });
    }

    /* ---------- shared bits ---------- */
    function cap(s) { return String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1); }
    function cardHTML(p) {
        const cover = p.cover_image || (p.images && p.images[0]) || "ProjectImages/project1.jpg";
        return `
          <a class="work-card reveal" data-cat="${esc(p.category || "")}" href="project.html?id=${encodeURIComponent(p.id)}">
            <img src="${esc(cover)}" alt="${esc(p.title)}" loading="lazy">
            <span class="work-card__view">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M7 17 17 7M17 7H8M17 7v9"/></svg>
            </span>
            <div class="work-card__overlay">
              <span class="work-card__cat">${esc(cap(p.category || "Work"))}</span>
              <h3>${esc(p.title)}</h3>
            </div>
          </a>`;
    }
    function wireCards(container) { $$(".work-card", container).forEach(observe); }
    function emptyState(title, msg) {
        return `<div class="empty-state" style="grid-column:1/-1">${mascotSVG(110)}<h3>${esc(title)}</h3><p>${esc(msg)}</p></div>`;
    }
})();
