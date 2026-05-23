<div align="center">

# pedrolages.dev

**Personal site & portfolio** — SvelteKit 5 · Tailwind v4 · Cloudflare Pages · Workers KV

[Live site](https://pedrolages.dev) · [LinkedIn](https://www.linkedin.com/in/plagesribeiro/) · [GitHub](https://github.com/plagesribeiro)

</div>

---

A bilingual (PT/EN) portfolio that doubles as a playground. The boring half is a résumé and a contact card. The other half is mini-games with a global leaderboard, a fake terminal, a Konami easter egg, hidden routes, a glitch overlay, and a Google-Drive-backed CMS for markdown/HTML/PDF drops.

It runs entirely on Cloudflare's edge — a small SvelteKit Worker plus two KV namespaces — and is wired up so a `git push` to `production` ships it.

## stack

| | |
|---|---|
| Framework | **SvelteKit 2** + **Svelte 5** runes, **TypeScript** strict |
| Styling | **Tailwind CSS v4** via the Vite plugin (no PostCSS config) |
| Runtime | **Cloudflare Pages** (Workers under the hood) |
| Storage | **Workers KV** — `SCORES` (leaderboard), `CONTENT_CACHE` (Drive cache, 5-min TTL) |
| Content | **Google Drive API** (service-account auth) as a drop-in CMS |
| Markdown | **unified** — remark + rehype, **Shiki** for code, **KaTeX** for math |
| PDF | **jsPDF** + jspdf-autotable, client-side résumé export |
| Build | **Vite 6**, **Wrangler 4**, deployed via **GitHub Actions** |

## architecture notes

A few things worth pointing out if you're skimming the code:

- **Single source of truth for the résumé.** `src/lib/data/resume.json` powers the landing page, the `/resume` route, and the client-side PDF export. The PT/EN switcher just toggles `{ "pt": "...", "en": "..." }` shaped fields throughout the tree.
- **No `PUBLIC_` env vars.** Every secret stays server-side in the Worker; the browser bundle never sees them. See `.env.example` for the contract.
- **Two KV namespaces with graceful degradation.** Both `SCORES` and `CONTENT_CACHE` fall back to in-memory stores when the binding is missing, so `npm run dev` Just Runs without any Cloudflare setup. Production gets persistence; local gets ergonomics.
- **Markdown pipeline is a single unified processor** that lives on the server: `remark-parse → remark-math → remark-gfm → remark-rehype → rehype-katex → @shikijs/rehype → rehype-stringify`. The output is plain HTML, cached in KV by file ID + revision.
- **Drop-file content routes.** Drop `slug.md` into the Drive folder mapped to `/md/public/` and it becomes `/md/<slug>`. Same for `.html` and `.pdf`. The manifest is fetched once per 5 min, the file body is cached on first hit.
- **i18n is two flat JSON files** (`pt.json`, `en.json`) and a small store — no runtime, no framework, no message-extraction step.
- **Prerendered where it makes sense, server-rendered where it doesn't.** The Worker stays small; the games and `/api/scores/*` are the only routes that need a request.

## easter eggs

The bits that make people stay (and recruiters smile):

- `↑ ↑ ↓ ↓ ← → ← → B A` — Konami code unlocks a secret stage
- Click the pixel avatar 7× — glitch animation across the page
- Type `whoami` or `?` anywhere — a fake terminal pops up
- `/coffee` — HTTP 418
- `/admin` — ACCESS DENIED
- DevTools open — ASCII art in the console with a hidden recruiting line
- `/games` — Snake, Pong, WhackBug, TokenCatcher with a global KV-backed leaderboard

## project layout

```
src/
  app.html, app.css         shell + Tailwind import
  routes/
    +page.svelte            landing (Hero / Timeline / Stats / Skills / Education / ...)
    api/scores/[game]/      KV-backed leaderboard endpoints
    md/, html/, pdf/        catch-all routes for Drive content
    games/, hack/, ...      the fun stuff
  lib/
    components/             Hero, Timeline, Terminal, Particles, HackOverlay, ...
    games/                  Snake, Pong, WhackBug, TokenCatcher
    content/                manifest + markdown pipeline
    drive/                  Drive client, auth, cache
    data/resume.json        single source of truth
    i18n/                   PT/EN JSON + tiny store
    leaderboard/            KV client + store with in-memory fallback
    terminal/               fake terminal store
    utils/                  pdf, dates, console-art, reveal
static/                     favicon, public assets
```

## local development

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # bundles into .svelte-kit/cloudflare
npm run preview      # serves the production bundle locally
npm run check        # svelte-check + tsc
```

KV-backed features (`SCORES`, `CONTENT_CACHE`) automatically fall back to in-memory stores in dev. To test against real KV locally:

```bash
npx wrangler pages dev .svelte-kit/cloudflare --kv SCORES --kv CONTENT_CACHE
```

## environment

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY` | Full service-account JSON, base64-encoded — used by the Drive-backed CMS for `/md`, `/html`, `/pdf`. |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | The Drive folder ID the content manifest is built from. |

In production, set the same names in **Cloudflare Pages → Settings → Variables and Secrets** (mark them as **Secret** so they're encrypted at rest).

## deploy

The deploy pipeline lives in `.github/workflows/deploy.yml`. Any push to the `production` branch triggers:

1. `npm ci` → `npm run build`
2. `wrangler pages deploy .svelte-kit/cloudflare --branch=production`

Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. All runtime secrets live in Cloudflare Pages — the GitHub Actions runner never sees them.

For a manual deploy from your laptop:

```bash
npm run deploy
```

## security & what's safe in this repo

This is a public repo, so a quick contract:

- **`.env` is gitignored.** Only `.env.example` (the schema, no values) is committed.
- **No secrets in code.** Every server-side value is read from `platform.env` at runtime.
- **KV namespace IDs in `wrangler.toml` are not secrets** — they're public identifiers, useless without account-level credentials. Committed on purpose so deploys are reproducible.
- **Cloudflare API tokens never enter the repo.** They live in GitHub Actions secrets and in your local Wrangler config.

## contact

- email · `plagesribeiro@gmail.com`
- github · [@plagesribeiro](https://github.com/plagesribeiro)
- linkedin · [in/plagesribeiro](https://www.linkedin.com/in/plagesribeiro/)
- lattes · [2018474359242894](http://lattes.cnpq.br/2018474359242894)

If you scrolled this far you're already 7% more curious than the average visitor. Drop a line.
