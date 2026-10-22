# Quiet Achiever Labs

Landing page for Tim Yeo’s AI / vibe-coded tools.

- **Site:** [labs.thequietachievr.com](https://labs.thequietachievr.com)
- **Design system:** The Quiet Achiever tokens (Literata, Basier Circle, paper / ember / ink)

## Local

```bash
npm install
cp .env.example .env.local   # set coach password + ingest token
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Web Job Search

Coach-only multi-client job radar at [`/job-search`](http://localhost:3000/job-search).

```bash
node scripts/seed-alan-ong.mjs   # optional sample client
```

- Sign in with `JOB_SEARCH_COACH_EMAIL` / `JOB_SEARCH_COACH_PASSWORD`
- Job Discovery Bot brief: `docs/job-discovery-bot-brief.md`
- Ingest API: `POST /api/job-search/ingest` with `Authorization: Bearer $JOB_SEARCH_INGEST_TOKEN`
- Production: [labs.thequietachievr.com/job-search](https://labs.thequietachievr.com/job-search) (Supabase when `SUPABASE_SERVICE_ROLE_KEY` is set; else local `.data/job-search.json`)
- Discovery Bot: `GET /api/job-search/discovery-criteria` then `POST /api/job-search/ingest` (Bearer `JOB_SEARCH_INGEST_TOKEN`)
- **Allocate → Notion:** set `NOTION_INTEGRATION_TOKEN`, then open each client's Opportunities database in Notion → **••• → Connections** → invite the same integration. Without that share, Allocate returns a clear 404/share error.
- **ICP prospects:** paste ICP Bot JSON at `/job-search/icp` → writes to Notion [Prospects](https://app.notion.com/p/40141716da288058a328fd115350eddd). Seed clients: `node scripts/seed-clients.mjs`

## Stack

Next.js · Tailwind CSS v4 · Vercel
