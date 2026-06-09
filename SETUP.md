# Hassam Hussain Jafri — Portfolio + Dashboard

A redesigned VFX portfolio with a simple, no-code dashboard for adding new work.
Built as a **static site** (plain HTML/CSS/JS) that talks to **Supabase** for the
database, image storage and login.

> **It works right now, with zero setup.** Open the site and it runs in **Demo Mode**
> using sample projects. The dashboard is fully usable too — but in demo mode your
> changes are saved only in your own browser. Follow the steps below to make it real
> and shared with the world.

---

## What's where

| File | Purpose |
|------|---------|
| `index.html` | Home page (animated hero + latest work) |
| `portfolio.html` | Full gallery with category filters |
| `project.html` | Individual project page (`project.html?id=…`) |
| `about-me.html` / `contact.html` | About & contact |
| `dashboard.html` | **The dashboard** — log in to add/edit/delete projects |
| `js/config.js` | ⚙️ Where you paste your Supabase keys |
| `js/api.js` | Talks to Supabase (or the demo store) |
| `js/site.js` / `js/dashboard.js` | Public site / dashboard behaviour |
| `css/main.css` | The whole design system + animations |
| `supabase/schema.sql` | Database setup — run once in Supabase |

The old template files (`style.css`, `core-style.css`, `js/active.js`, etc.) are no
longer used and can be deleted whenever you like.

---

## Go live in 5 steps (~10 minutes)

### 1. Create a free Supabase project
1. Go to **https://supabase.com** → sign up → **New project**.
2. Give it a name and a database password (save it somewhere).
3. Wait ~1 minute for it to finish setting up.

### 2. Create the database + image storage
1. In your project, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` from this project, copy **all** of it, paste it in, and
   click **Run**. You should see "Success".

### 3. Create the login account (for Hassam)
1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter the email + password he'll use to log into the dashboard.
3. ✅ Tick **"Auto Confirm User"** so he can log in immediately.

### 4. Connect the website to Supabase
1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL** and the **anon / public** key.
3. Open `js/config.js` and paste them in:
   ```js
   const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co";
   const SUPABASE_ANON_KEY = "your-anon-public-key";
   ```
   (The anon key is safe to put in the website — the database rules keep it secure.)

That's it — the site is now live-backed. The yellow "Demo mode" banner disappears
once the keys are filled in.

### 5. Publish the website
The site is just static files, so it hosts anywhere for free. Easiest options:

- **Netlify / Vercel:** drag-and-drop this folder, or connect the GitHub repo.
- **GitHub Pages:** push the repo and enable Pages on the `main` branch.
- **Cloudflare Pages:** connect the repo.

---

## How Hassam uses the dashboard (the non-technical bit)

1. Go to **`yoursite.com/dashboard.html`** and log in with the email/password from step 3.
2. Click **"Add new project"**.
3. Type a **title**, pick a **category**, and write as much as you want in the
   **description** (leave a blank line between paragraphs to make new paragraphs).
4. **Drag in images** or click to choose them. Hover an image and click **"Set as cover"**
   to pick the thumbnail. The ★ marks the cover.
5. Click **Save project**. It appears on the site instantly. 🎉
6. To change or remove something later, use **Edit** / **Delete** on any project.

No code, no file uploads to a server, no FTP — just type and drop images.

---

## Notes & tips

- **Images** are stored in Supabase Storage (free tier = 1 GB, plenty for a portfolio).
  They're auto-compressed by the browser only if you add that later; for now upload
  reasonably sized exports (a few MB each is ideal).
- **The contact form** opens the visitor's own email app addressed to
  `hello@hassamjafri.com` — no backend needed. To use a real form service later,
  swap the handler in `js/site.js`. Update the email/phone in the page footers and
  `js/site.js` to Hassam's real details.
- **Free tier sleeping:** Supabase free projects pause after ~1 week of zero activity.
  Just open the dashboard once to wake it, or upgrade if it becomes an issue.
- **Security:** only logged-in users can add/edit/delete. The public can only view.
  This is enforced by the database rules in `schema.sql`, not by the website.
