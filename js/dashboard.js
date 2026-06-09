/* ============================================================
   dashboard.js — simple CMS for managing portfolio projects
   ============================================================ */
(function () {
    "use strict";
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

    const CATS = ["characters", "creatures", "environments", "textures", "other"];

    /* ---------- toasts ---------- */
    let toastWrap;
    function toast(msg, isErr) {
        if (!toastWrap) { toastWrap = document.createElement("div"); toastWrap.className = "toast-wrap"; document.body.appendChild(toastWrap); }
        const t = document.createElement("div");
        t.className = "toast" + (isErr ? " err" : "");
        t.textContent = msg;
        toastWrap.appendChild(t);
        setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(30px)"; t.style.transition = "0.3s"; setTimeout(() => t.remove(), 320); }, 3200);
    }

    /* ---------- auth gate ---------- */
    const loginScreen = $("#dashLogin");
    const app = $("#dashApp");
    const loginForm = $("#loginForm");

    async function boot() {
        const user = await API.getUser().catch(() => null);
        if (user) showApp(user); else showLogin();
    }
    function showLogin() { loginScreen.style.display = "grid"; app.style.display = "none"; }
    function showApp(user) {
        loginScreen.style.display = "none";
        app.style.display = "grid";
        const u = $("#dashUserEmail"); if (u) u.textContent = user?.email || "Signed in";
        loadProjects();
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = $("button[type=submit]", loginForm);
        const note = $("#loginNote");
        const email = $("#loginEmail").value.trim();
        const pass = $("#loginPass").value;
        btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Signing in…';
        try {
            await API.signIn(email, pass);
            const user = await API.getUser();
            showApp(user);
        } catch (err) {
            note.className = "form-note err";
            note.textContent = err.message || "Couldn't sign in. Check your email and password.";
        } finally {
            btn.disabled = false; btn.innerHTML = "Sign in";
        }
    });

    $$("[data-logout]").forEach((b) => b.addEventListener("click", async () => {
        await API.signOut(); showLogin();
    }));

    /* ---------- project list ---------- */
    let projects = [];
    async function loadProjects() {
        const list = $("#projectList");
        list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted)"><span class="spinner" style="display:inline-block"></span> Loading…</div>';
        try {
            projects = await API.listProjects();
            renderList();
            renderStats();
        } catch (err) {
            list.innerHTML = `<div class="empty-state"><h3>Couldn't load projects</h3><p>${esc(err.message)}</p></div>`;
        }
    }
    function renderStats() {
        $("#statTotal").textContent = projects.length;
        const imgs = projects.reduce((n, p) => n + (Array.isArray(p.images) ? p.images.length : 0), 0);
        $("#statImages").textContent = imgs;
        const cats = new Set(projects.map((p) => p.category).filter(Boolean));
        $("#statCats").textContent = cats.size;
    }
    function renderList() {
        const list = $("#projectList");
        if (!projects.length) {
            list.innerHTML = `<div class="empty-state">${mascotSVG(110)}<h3>No projects yet</h3><p>Click “Add new project” to upload your first piece.</p></div>`;
            return;
        }
        list.innerHTML = projects.map((p) => {
            const cover = p.cover_image || (p.images && p.images[0]) || "";
            const count = Array.isArray(p.images) ? p.images.length : 0;
            return `
              <div class="dash-row" data-id="${esc(p.id)}">
                ${cover ? `<img class="dash-row__thumb" src="${esc(cover)}" alt="">` : `<div class="dash-row__thumb"></div>`}
                <div class="dash-row__info">
                  <span class="dash-row__cat">${esc(p.category || "uncategorised")}</span>
                  <h4>${esc(p.title)}</h4>
                  <p>${esc(p.summary || "No summary")} · ${count} image${count === 1 ? "" : "s"}</p>
                </div>
                <div class="dash-row__actions">
                  <a class="btn btn--ghost btn--sm" href="project.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener">View</a>
                  <button class="btn btn--ghost btn--sm" data-edit="${esc(p.id)}">Edit</button>
                  <button class="btn btn--danger btn--sm" data-del="${esc(p.id)}">Delete</button>
                </div>
              </div>`;
        }).join("");

        $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openModal(b.dataset.edit)));
        $$("[data-del]").forEach((b) => b.addEventListener("click", () => removeProject(b.dataset.del)));
    }

    async function removeProject(id) {
        const p = projects.find((x) => String(x.id) === String(id));
        if (!confirm(`Delete “${p ? p.title : "this project"}”? This can't be undone.`)) return;
        try { await API.deleteProject(id); toast("Project deleted"); loadProjects(); }
        catch (err) { toast(err.message || "Delete failed", true); }
    }

    /* ---------- modal / editor ---------- */
    const modal = $("#projectModal");
    let editingId = null;
    let pendingImages = []; // [{url, cover:bool}]

    $("#addBtn").addEventListener("click", () => openModal(null));
    $("#emptyAddBtn") && $("#emptyAddBtn").addEventListener("click", () => openModal(null));
    $("#modalClose").addEventListener("click", closeModal);
    $("#modalCancel").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

    function openModal(id) {
        editingId = id;
        const f = $("#projectForm");
        f.reset();
        pendingImages = [];
        $("#modalTitle").textContent = id ? "Edit project" : "Add new project";
        if (id) {
            const p = projects.find((x) => String(x.id) === String(id));
            if (p) {
                f.title.value = p.title || "";
                f.category.value = p.category || "other";
                f.summary.value = p.summary || "";
                f.description.value = p.description || "";
                f.software.value = p.software || "";
                f.role.value = p.role || "";
                f.year.value = p.year || "";
                const imgs = Array.isArray(p.images) ? p.images : [];
                pendingImages = imgs.map((u) => ({ url: u, cover: u === p.cover_image }));
                if (!pendingImages.some((i) => i.cover) && pendingImages[0]) pendingImages[0].cover = true;
            }
        }
        renderUploads();
        modal.classList.add("open");
        document.body.style.overflow = "hidden";
    }
    function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }

    /* uploader */
    const dropzone = $("#dropzone");
    const fileInput = $("#fileInput");
    dropzone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => handleFiles(fileInput.files));
    ["dragover", "dragenter"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, (e) => { e.preventDefault(); dropzone.classList.remove("drag"); }));
    dropzone.addEventListener("drop", (e) => handleFiles(e.dataTransfer.files));

    async function handleFiles(fileList) {
        const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
        if (!files.length) return;
        for (const file of files) {
            if (file.size > 12 * 1024 * 1024) { toast(`${file.name} is over 12MB — skipped`, true); continue; }
            const item = { url: "", cover: pendingImages.length === 0, uploading: true };
            pendingImages.push(item);
            renderUploads();
            try {
                item.url = await API.uploadImage(file);
                item.uploading = false;
            } catch (err) {
                pendingImages = pendingImages.filter((i) => i !== item);
                toast(`Upload failed: ${err.message || file.name}`, true);
            }
            renderUploads();
        }
        fileInput.value = "";
    }

    function renderUploads() {
        const grid = $("#uploadGrid");
        if (!pendingImages.length) { grid.innerHTML = ""; return; }
        grid.innerHTML = pendingImages.map((img, i) => `
          <div class="upload-thumb ${img.cover ? "cover" : ""}">
            ${img.uploading ? `<div style="display:grid;place-items:center;height:100%"><span class="spinner"></span></div>`
                : `<img src="${esc(img.url)}" alt="">`}
            <button type="button" class="rm" data-rm="${i}" aria-label="Remove">✕</button>
            ${!img.cover && !img.uploading ? `<button type="button" class="setcover" data-cover="${i}">Set as cover</button>` : ""}
          </div>`).join("");
        $$("[data-rm]", grid).forEach((b) => b.addEventListener("click", () => {
            const i = +b.dataset.rm; const wasCover = pendingImages[i].cover;
            pendingImages.splice(i, 1);
            if (wasCover && pendingImages[0]) pendingImages[0].cover = true;
            renderUploads();
        }));
        $$("[data-cover]", grid).forEach((b) => b.addEventListener("click", () => {
            pendingImages.forEach((im, j) => im.cover = j === +b.dataset.cover);
            renderUploads();
        }));
    }

    /* save */
    $("#projectForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const f = e.target;
        const saveBtn = $("#saveBtn");
        if (!f.title.value.trim()) { toast("Please add a title", true); return; }
        if (pendingImages.some((i) => i.uploading)) { toast("Please wait for uploads to finish", true); return; }
        const ready = pendingImages.filter((i) => i.url);
        const cover = (ready.find((i) => i.cover) || ready[0] || {}).url || "";
        const payload = {
            title: f.title.value.trim(),
            category: f.category.value,
            summary: f.summary.value.trim(),
            description: f.description.value.trim(),
            software: f.software.value.trim(),
            role: f.role.value.trim(),
            year: f.year.value.trim(),
            cover_image: cover,
            images: ready.map((i) => i.url)
        };
        saveBtn.disabled = true; saveBtn.innerHTML = '<span class="spinner"></span> Saving…';
        try {
            if (editingId) { await API.updateProject(editingId, payload); toast("Project updated"); }
            else { await API.createProject(payload); toast("Project published 🎉"); }
            closeModal();
            loadProjects();
        } catch (err) {
            toast(err.message || "Save failed", true);
        } finally {
            saveBtn.disabled = false; saveBtn.innerHTML = "Save project";
        }
    });

    /* ---------- config banner ---------- */
    if (!API.configured) {
        $$("[data-demo-banner]").forEach((el) => el.style.display = "block");
    }

    boot();
})();
