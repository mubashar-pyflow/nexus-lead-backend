# Nexus Lead Backend

Backend API for the Nexus Lead application. This service handles scraping, website scanning, contacts/history persistence with Supabase, and AI outreach generation.

## Stack

- Node.js + Express
- Puppeteer (Google Maps + website scraping)
- Supabase (`@supabase/supabase-js`)
- Google Generative AI (`@google/generative-ai`)
- Zod validation

## Prerequisites

- Node.js 18+
- npm
- Supabase project (URL + anon key)
- Gemini API key

## 1) Installation

```bash
npm install
```

## 2) Environment Variables

Create a `.env` file in the `backend` folder:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

Optional for production:

```env
NODE_ENV=production
```

The app uses `process.env.PORT` in production and defaults to `3001` locally.

## 3) Run Locally

Development mode (nodemon):

```bash
npm run dev
```

Production mode locally:

```bash
npm start
```

Server URL:

```text
http://localhost:3001
```

API base URL:

```text
http://localhost:3001/api
```

## Available Scripts

- `npm run dev` - run with nodemon
- `npm start` - run with node

## API Endpoints

- `POST /api/scrape` - scrape Google Maps leads
- `POST /api/scrape/website` - deep-scan website for emails/phones/socials
- `GET /api/contacts` - list saved contacts
- `POST /api/contacts` - save a contact
- `DELETE /api/contacts/:id` - delete a contact
- `GET /api/history/search` - get search history
- `POST /api/history/search` - add search history
- `DELETE /api/history/search` - clear all search history
- `DELETE /api/history/search/:id` - delete one search history entry
- `GET /api/history/export` - get export history
- `POST /api/history/export` - add export history
- `DELETE /api/history/export` - clear export history
- `POST /api/ai/generate` - generate outreach content

## Deployment (Fly.io)

From the `backend` directory:

```bash
fly auth login
fly launch
```

When asked:

- App platform: Node.js
- Internal port: `3001`
- Managed Postgres: No (this project uses Supabase)

Set secrets:

```bash
fly secrets set SUPABASE_URL="your_supabase_project_url"
fly secrets set SUPABASE_ANON_KEY="your_supabase_anon_key"
fly secrets set GEMINI_API_KEY="your_gemini_api_key"
fly secrets set NODE_ENV="production"
```

Deploy:

```bash
fly deploy
```

Check logs:

```bash
fly logs
```

Your API URL will be:

```text
https://<your-fly-app>.fly.dev/api
```

Use that value in frontend as `VITE_API_URL`.

## Security Notes

- Never commit `.env` files.
- Keep API keys only in local `.env` and platform secrets.
- Rotate keys immediately if leaked.

## Troubleshooting

- If Puppeteer fails in cloud runtime, check Fly logs and ensure Chromium dependencies are available.
- If auth requests fail, verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` values.
- If AI endpoint fails, confirm a valid `GEMINI_API_KEY` is set.
