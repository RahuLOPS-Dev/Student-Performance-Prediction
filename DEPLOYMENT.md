# Deployment Guide

This project is **fully self-contained** — the trained ML model (300 Gradient Boosting trees)
is bundled into the frontend and runs entirely in the browser. No backend, no server, no
database needed at runtime. The static export is ~4 MB and deploys to any free static host.

## Quick Deploy Options (free, no PC resources)

### Option 1: Vercel (recommended — native Next.js support)

1. Push this repo to GitHub/GitLab/Bitbucket
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo
3. Vercel auto-detects the config from `vercel.json`:
   - Build command: `bun run build:static`
   - Output dir: `frontend/out`
4. Click **Deploy** → live in ~60 seconds at `your-project.vercel.app`

```bash
# Or deploy via CLI:
npm i -g vercel
vercel
```

### Option 2: Netlify

1. Push to GitHub
2. [netlify.com](https://app.netlify.com/start) → connect repo
3. `netlify.toml` is pre-configured:
   - Build command: `bun run build:static`
   - Publish dir: `frontend/out`
4. Deploy → live at `your-project.netlify.app`

```bash
# Or via CLI:
npm i -g netlify-cli
netlify deploy --prod
```

### Option 3: Cloudflare Pages

1. Push to GitHub
2. [pages.cloudflare.com](https://pages.cloudflare.com) → connect repo
3. `wrangler.toml` is pre-configured:
   - Build command: `bun run build:static`
   - Output dir: `frontend/out`
4. Deploy → live at `your-project.pages.dev`

### Option 4: GitHub Pages (free, static)

1. Push to a GitHub repo named `your-username.github.io` (or any repo with Pages enabled)
2. Run the build locally:
   ```bash
   bun run build:static
   ```
3. Push the `frontend/out/` folder to the `gh-pages` branch:
   ```bash
   npx gh-pages -d frontend/out
   ```
4. Enable GitHub Pages in repo Settings → Pages → Source: `gh-pages` branch
5. Live at `https://your-username.github.io/your-repo/`

> **Note**: If deploying to a subpath (like GitHub Pages `/your-repo/`), the app
> already uses relative paths with `trailingSlash: true`, so it works out of the box.

## What Gets Deployed

The static export (`frontend/out/`) contains:
- `index.html` — the full app (565 KB, prerendered)
- `_next/static/` — JS chunks, CSS, fonts (the model + EDA data are bundled here)
- `model.json` — the 300-tree Gradient Boosting model (206 KB)
- `eda-data.json` — EDA charts data, diagnostics, PDP, SHAP (117 KB)
- `eda-plots/` — 5 EDA PNG images
- `encoders.json` — label encoders

**Total: ~4 MB** — loads fast on any connection, runs fully client-side.

## Why No Backend Is Needed

The ML model was exported from Python (scikit-learn) to JSON, and its inference
was reimplemented in pure TypeScript (`frontend/src/lib/model.ts`). Predictions
run in the browser with zero server round-trips — verified to match the Python
model exactly (73.5, 100.0, 25.7 all matched).

The `backend/` (FastAPI) and `ai-ml/` (Python pipeline) folders are for
development/training only — they're not needed for the deployed app.

## Local Production Preview

To preview the production build locally before deploying:

```bash
bun run build:static
cd frontend/out && python3 -m http.server 4000
# → open http://localhost:4000
```

## Custom Domain

After deploying to Vercel/Netlify/Cloudflare, you can add a custom domain
(e.g. `student-performance.example.com`) in the host's dashboard → Domains.
DNS propagation takes a few minutes; SSL is automatic and free.
