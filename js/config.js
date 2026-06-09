/* ============================================================
   config.js — Supabase connection + demo fallback + shared SVG
   ------------------------------------------------------------
   👉 To go live, paste your Supabase values below (see SETUP.md).
      Until then the site runs in DEMO MODE with sample projects.
   ============================================================ */

const SUPABASE_URL = "";       // e.g. "https://xxxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = "";  // your project's anon/public key

const STORAGE_BUCKET = "project-images";

/* Are credentials filled in? */
const IS_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/* Shared cartoon mascot ("Pixel" the paint-blob). Pass a size in px. */
function mascotSVG(size = 90) {
    return `
    <svg class="mascot mascot--float" width="${size}" height="${size}" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#8b5cff"/><stop offset="0.6" stop-color="#6a3df0"/><stop offset="1" stop-color="#ff5e8f"/>
        </linearGradient>
      </defs>
      <!-- blobby body -->
      <path fill="url(#mg)" d="M60 14c24 0 40 16 40 42 0 22-10 44-40 44S20 78 20 56 36 14 60 14Z"/>
      <!-- shine -->
      <ellipse cx="44" cy="42" rx="10" ry="13" fill="#ffffff" opacity="0.25"/>
      <!-- eyes -->
      <g fill="#0c0c14">
        <circle class="m-eye" cx="48" cy="58" r="7"/>
        <circle class="m-eye" cx="74" cy="58" r="7"/>
      </g>
      <circle cx="50" cy="56" r="2.4" fill="#fff"/><circle cx="76" cy="56" r="2.4" fill="#fff"/>
      <!-- smile -->
      <path d="M50 74c4 6 16 6 20 0" stroke="#0c0c14" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- cheeks -->
      <circle cx="40" cy="70" r="4" fill="#ff5e8f" opacity="0.5"/>
      <circle cx="84" cy="70" r="4" fill="#ff5e8f" opacity="0.5"/>
      <!-- paintbrush -->
      <g class="m-brush">
        <rect x="92" y="30" width="6" height="30" rx="3" fill="#ffb347" transform="rotate(35 95 45)"/>
        <path d="M104 26l8 4-6 7Z" fill="#1fe0c4"/>
      </g>
    </svg>`;
}

/* Sample projects shown in DEMO MODE (built from existing ProjectImages). */
const DEMO_PROJECTS = [
    {
        id: "demo-1", title: "Aether — Hero Creature", category: "creatures",
        cover_image: "ProjectImages/project2.jpg",
        summary: "Full look-development pass for a hero creature: skin shading, subsurface scattering and hand-painted displacement.",
        description: "Aether was a six-week look-dev sprint for a feature pitch. The brief asked for a creature that felt ancient and weathered but still readable in close-up hero shots.\n\nI started from a mid-res sculpt and built the texture set entirely in Mari — base albedo, layered grime, and a custom displacement stack driven by curvature masks. Subsurface scattering was tuned to read warm in the thin membranes around the face.\n\nThe biggest challenge was keeping micro-detail crisp at 4K while the silhouette still held up in wide shots. Final renders were lit in Maya / Arnold.",
        software: "Mari, ZBrush, Maya, Arnold", role: "Senior Texture Painter", year: "2025",
        images: ["ProjectImages/project2.jpg", "ProjectImages/project4-1.jpg", "ProjectImages/project9.jpg", "ProjectImages/project13.jpg"],
        created_at: "2025-11-02"
    },
    {
        id: "demo-2", title: "Stonewalker — Character Study", category: "characters",
        cover_image: "ProjectImages/project3.jpg",
        summary: "A stylised-realistic hero character exploring weathered armour and aged skin textures.",
        description: "A personal character study pushing the line between stylised and photoreal. I wanted the armour to tell a story — every scratch and dent placed deliberately rather than proceduralised.\n\nSkin was painted in Substance Painter with a hand-authored pore layer, then refined in Mari for the hero face. Metal used a triplanar base with painted edge wear on top.\n\nThe goal was a character that holds up both as a turntable and in a dramatic key-lit close-up.",
        software: "Substance Painter, Mari, ZBrush", role: "Character & Texture Artist", year: "2025",
        images: ["ProjectImages/project3.jpg", "ProjectImages/project5.jpg", "ProjectImages/project12.jpg"],
        created_at: "2025-09-18"
    },
    {
        id: "demo-3", title: "Vault — Environment Surfacing", category: "environments",
        cover_image: "ProjectImages/project4.jpg",
        summary: "Modular environment texture set with layered dust, decals and procedural wear.",
        description: "Surfacing pass for an underground vault environment. The set needed to tile seamlessly across modular pieces while still feeling unique up close.\n\nI built a library of smart materials in Substance Designer, then dressed each hero piece by hand with decals and a custom dust system that responded to ambient occlusion. Lighting and final comp brought the mood together.",
        software: "Substance Designer, Substance Painter, Nuke", role: "Texture / Surfacing Artist", year: "2024",
        images: ["ProjectImages/project4.jpg", "ProjectImages/project8.jpg", "ProjectImages/project11.jpg", "ProjectImages/project7.jpg"],
        created_at: "2024-12-05"
    },
    {
        id: "demo-4", title: "Surface Library Vol. 1", category: "textures",
        cover_image: "ProjectImages/project10.jpg",
        summary: "A curated collection of high-frequency surface studies and material experiments.",
        description: "An ongoing personal library of surface studies — skin, stone, organic membranes and metals. Each entry is a self-contained material built to production spec (4K, PBR, with displacement).\n\nThese double as both portfolio pieces and a reusable toolkit I pull from on live shows.",
        software: "Substance Designer, Mari", role: "Texture Artist", year: "2024",
        images: ["ProjectImages/project10.jpg", "ProjectImages/project1.jpg"],
        created_at: "2024-07-22"
    }
];
