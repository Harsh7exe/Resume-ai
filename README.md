# RésuméAI — Deployment Guide

## Project Structure

```
resume-ai/
├── api/
│   └── chat.js          ← Secure backend proxy (hides your API key)
├── public/
│   └── index.html       ← Full frontend app
├── vercel.json          ← Routing config
└── README.md
```

---

## Deploy to Vercel (recommended — free, ~2 min)

### Step 1 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2 — Deploy
```bash
cd resume-ai
vercel
```
Follow the prompts: create a new project, accept defaults.

### Step 3 — Add your API key (critical!)
```bash
vercel env add ANTHROPIC_API_KEY
```
Paste your key from https://console.anthropic.com → API Keys.
Then redeploy to apply:
```bash
vercel --prod
```

Your app is live at `https://your-project.vercel.app` 🎉

---

## Deploy to Netlify (alternative)

### Option A — Drag & Drop
1. Go to https://netlify.com → "Add new site" → "Deploy manually"
2. Drag the `resume-ai` folder onto the page
3. Done! But you'll need Netlify Functions for the API proxy (see Option B).

### Option B — With API proxy (recommended)
1. Rename `api/chat.js` to `netlify/functions/chat.js`
2. Update the fetch URL in `index.html` from `/api/chat` to `/.netlify/functions/chat`
3. Push to GitHub, connect repo in Netlify dashboard
4. Add `ANTHROPIC_API_KEY` under Site Settings → Environment Variables

---

## Local Development

```bash
npm install -g vercel
cd resume-ai
vercel dev
```
Set your API key in a `.env.local` file:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Open http://localhost:3000

---

## How the API proxy works

All AI calls go through `/api/chat.js` (a serverless function).
Your API key lives in an environment variable — **never in the frontend code**.

```
Browser → POST /api/chat → Vercel Function → Anthropic API
                                ↑
                    API key injected here (server-side only)
```

---

## Customisation

| What | Where |
|------|-------|
| Colours / fonts | CSS variables at top of `index.html` |
| AI model | `api/chat.js` → change `model:` field |
| Add sections (Education, Projects) | `updatePreview()` function in `index.html` |
| Rate limiting | Add a check in `api/chat.js` before the fetch |
| Auth / login | Add middleware in `api/chat.js` |
