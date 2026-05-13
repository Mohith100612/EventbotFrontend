# EventBot Frontend — Setup & Run

How to get the frontend running locally and deployed.

## Prerequisites

- **Node.js** 18 or newer (`node --version`)
- **npm** 9 or newer (`npm --version`)
- **Git**

## 1. Clone

```bash
git clone https://github.com/Mohith100612/EventbotFrontend.git
cd EventbotFrontend
```

## 2. Install dependencies

```bash
npm install
```

Takes ~30 seconds on a fresh machine. Installs React, Vite, Tailwind, React Router.

## 3. Configure environment

Copy the example file:

```bash
cp .env.example .env
```

Open `.env` and replace the placeholders with real URLs:

| Variable | What it is | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Guest API (MongoDB-backed Express service) | `https://eventbotbackend.onrender.com` |
| `VITE_SEARCH_BASE_URL` | Natural-language search service | `http://13.126.130.56:8003` |

Both variables are required. Vite only reads `.env` at startup, so restart the dev server after any change.

## 4. Run the dev server

```bash
npm run dev
```

Vite serves on `http://localhost:5173`.

Open `http://localhost:5173/eventbot/<your-shortcode>` — for example `http://localhost:5173/eventbot/jJVy2N3`. The landing page at `/` is just an explainer; all real functionality lives under `/eventbot/:shortcode`.

## 5. Build for production

```bash
npm run build
```

Outputs static files to `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## Deploy

The repo is configured for **Vercel** (see `vercel.json` for the SPA fallback rewrite). To deploy:

1. Sign in to https://vercel.com with your GitHub account.
2. Add New → Project → Import this repo.
3. Vercel auto-detects Vite. Leave the build settings as-is.
4. Add the two environment variables from step 3 above (Production + Preview + Development).
5. Click Deploy.

Any push to `main` triggers an automatic redeploy.

> **Note about HTTPS:** Vercel serves over HTTPS. If `VITE_SEARCH_BASE_URL` points to a plain `http://` endpoint, browsers will block the call as mixed content. The search service must be reachable over HTTPS in production (Cloudflare Tunnel, Caddy + Let's Encrypt, or a managed HTTPS host).

## Project layout

```
src/
  api/
    guests.js          # Guest API client (/api/guests/*)
    search.js          # Search service client (/search)
  components/
    SearchBar.jsx
    GuestList.jsx
    GuestCard.jsx
    GuestDetailModal.jsx
    ProfileEditModal.jsx
    Spinner.jsx
  lib/
    mergeGuest.js      # Merges data from both APIs by LinkedIn URL
  pages/
    LandingPage.jsx    # /
    EventBotPage.jsx   # /eventbot/:shortcode
    NotFoundPage.jsx   # 404
  main.jsx             # Router setup
  App.jsx              # Route definitions
  index.css            # Tailwind directives
```

## Routes

| Path | Purpose |
|---|---|
| `/` | Static landing page |
| `/eventbot/:shortcode` | Main app — directory + own-profile edit |
| `*` | 404 |

## Troubleshooting

**"Failed to fetch" when searching, after deploy**
The search service URL is HTTP and the deploy is HTTPS. Browsers block this. See the HTTPS note in the Deploy section.

**`Unexpected token '<', "<!doctype "...` when searching**
Vite couldn't find `VITE_SEARCH_BASE_URL` at build time, so `fetch` is calling a relative URL and hitting the SPA fallback. Set the env var in Vercel (or `.env`), then redeploy.

**404 NOT_FOUND on `/eventbot/<shortcode>` after a hard refresh**
The SPA rewrite is missing. Confirm `vercel.json` exists and contains the rewrite rule that sends every path to `/index.html`.

**Backend cold start takes ~30 seconds**
Render's free tier sleeps services after inactivity. The frontend shows a "Waking up the server" message after 3 seconds of loading — that's expected on first hit.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and produce a production bundle in `dist/` |
| `npm run preview` | Serve the production bundle locally for verification |
