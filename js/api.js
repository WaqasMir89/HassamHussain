/* ============================================================
   api.js — unified data layer
   ------------------------------------------------------------
   Works in two modes:
   • LIVE  : talks to Supabase (when config.js has credentials)
   • DEMO  : localStorage-backed store seeded from DEMO_PROJECTS
             so the whole site + dashboard work with zero setup.
   ============================================================ */

const API = (() => {
    let _client = null;
    const DEMO_KEY = "hhj_demo_projects";

    /* ---- Supabase client (lazy-loaded from CDN) ---- */
    function loadScript(src) {
        return new Promise((res, rej) => {
            const s = document.createElement("script");
            s.src = src; s.onload = res; s.onerror = rej;
            document.head.appendChild(s);
        });
    }
    async function client() {
        if (!IS_CONFIGURED) return null;
        if (_client) return _client;
        if (!window.supabase) {
            await loadScript("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2");
        }
        _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return _client;
    }

    /* ---- helpers ---- */
    const slugify = (s) => (s || "").toLowerCase().trim()
        .replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60) || "untitled";
    const uid = () => "p-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

    /* ---- demo store ---- */
    function demoRead() {
        try {
            const raw = localStorage.getItem(DEMO_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {}
        // seed
        const seed = JSON.parse(JSON.stringify(DEMO_PROJECTS));
        localStorage.setItem(DEMO_KEY, JSON.stringify(seed));
        return seed;
    }
    function demoWrite(list) { localStorage.setItem(DEMO_KEY, JSON.stringify(list)); }
    const fileToDataURL = (file) => new Promise((res, rej) => {
        const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file);
    });

    /* ================= PUBLIC API ================= */
    return {
        configured: IS_CONFIGURED,
        slugify,

        /* ---------- READ ---------- */
        async listProjects() {
            if (!IS_CONFIGURED) {
                return demoRead().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
            const c = await client();
            const { data, error } = await c.from("projects").select("*").order("created_at", { ascending: false });
            if (error) throw error;
            return data || [];
        },

        async getProject(id) {
            if (!IS_CONFIGURED) return demoRead().find((p) => String(p.id) === String(id)) || null;
            const c = await client();
            const { data, error } = await c.from("projects").select("*").eq("id", id).single();
            if (error) throw error;
            return data;
        },

        /* ---------- WRITE (dashboard) ---------- */
        async createProject(payload) {
            const record = { ...payload, slug: slugify(payload.title) };
            if (!IS_CONFIGURED) {
                const list = demoRead();
                record.id = uid();
                record.created_at = new Date().toISOString();
                list.unshift(record);
                demoWrite(list);
                return record;
            }
            const c = await client();
            const { data, error } = await c.from("projects").insert(record).select().single();
            if (error) throw error;
            return data;
        },

        async updateProject(id, payload) {
            const record = { ...payload };
            if (payload.title) record.slug = slugify(payload.title);
            if (!IS_CONFIGURED) {
                const list = demoRead();
                const i = list.findIndex((p) => String(p.id) === String(id));
                if (i > -1) { list[i] = { ...list[i], ...record }; demoWrite(list); return list[i]; }
                throw new Error("Project not found");
            }
            const c = await client();
            const { data, error } = await c.from("projects").update(record).eq("id", id).select().single();
            if (error) throw error;
            return data;
        },

        async deleteProject(id) {
            if (!IS_CONFIGURED) {
                demoWrite(demoRead().filter((p) => String(p.id) !== String(id)));
                return;
            }
            const c = await client();
            const { error } = await c.from("projects").delete().eq("id", id);
            if (error) throw error;
        },

        /* ---------- STORAGE ---------- */
        async uploadImage(file) {
            if (!IS_CONFIGURED) return await fileToDataURL(file); // demo: inline data URL
            const c = await client();
            const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
            const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
            const { error } = await c.storage.from(STORAGE_BUCKET).upload(path, file, {
                cacheControl: "3600", upsert: false, contentType: file.type
            });
            if (error) throw error;
            const { data } = c.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            return data.publicUrl;
        },

        /* ---------- AUTH ---------- */
        async signIn(email, password) {
            if (!IS_CONFIGURED) {
                // demo: accept anything, store a fake session
                localStorage.setItem("hhj_demo_session", email || "demo@local");
                return { user: { email: email || "demo@local" } };
            }
            const c = await client();
            const { data, error } = await c.auth.signInWithPassword({ email, password });
            if (error) throw error;
            return data;
        },

        async signOut() {
            if (!IS_CONFIGURED) { localStorage.removeItem("hhj_demo_session"); return; }
            const c = await client();
            await c.auth.signOut();
        },

        async getUser() {
            if (!IS_CONFIGURED) {
                const e = localStorage.getItem("hhj_demo_session");
                return e ? { email: e } : null;
            }
            const c = await client();
            const { data } = await c.auth.getUser();
            return data?.user || null;
        }
    };
})();
