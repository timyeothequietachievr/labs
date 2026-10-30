# How to run the bots (for real)

Two different bots. Two different outcomes.

| Bot | Finds | Lands in |
|-----|--------|----------|
| **Job Discovery Bot** | Job **roles** | Web Job Search → then Allocate → client **Opportunities** (`Source: AI Agent`) |
| **ICP Bot** | **People** to connect with | Notion **Prospects** via Web Job Search → **ICP** |

---

## A. Job Discovery (autonomous, all clients)

The bot does **not** search “for one client only.” It fetches the **union** of all active clients’ titles/geos from `GET /api/job-search/discovery-criteria`, crawls once, then **POSTs** to production ingest. Web Job Search **scores every active client**. You Allocate winners onto each client’s Opportunities board.

### One-time setup

1. Deploy Web Job Search on Vercel `labs` with Supabase + `JOB_SEARCH_INGEST_TOKEN` set.
2. In **Grok Bot → Job Discovery Bot**, paste [`job-discovery-bot-brief.md`](./job-discovery-bot-brief.md) and store the ingest token in **private bot memory** (not in Notion).
3. Save a **routine** for 1–2× / day.
4. First time only: if TrueUp needs login, take over the computer → sign into **TrueUp** (not LinkedIn as Tim) → hand back.

### Autonomous run (preferred)

Routine / prompt:

> Run shared job discovery. GET `/api/job-search/discovery-criteria` with the ingest Bearer token. Search every source in the response (websites, all Slack job boards, Jonathan Coleman LinkedIn posts). If a Slack workspace needs login, report it and continue with the rest. POST the JSON to `/api/job-search/ingest`. Report new jobs and matches. No applications, no outreach, no Notion Allocate.

### Manual fallback

1. Prompt the bot as above but ask it to return JSON only  
2. Open Web Job Search → **Runs** → paste → **Run ingest now**  
3. Open **Jobs** or **Dashboard** → review match cards  
4. **Allocate to Notion** on the client board — confirm **Source = AI Agent**, **Round = Lead**

### Cadence — Job Discovery

- **1–2× per day** (e.g. morning + late afternoon)
- First week: expect a larger backfill; after that, “new since yesterday” only
- Editing an **AI Client Brief** or client prefs widens the next crawl automatically via discovery-criteria

---

## B. ICP Bot (people) — respect the ~100 connect limit

**Research/rank** can run often. **Sending connection requests** must stay slow on LinkedIn Free.

### Steps (research)

1. Open **Grok Bot → ICP Bot**
2. First time: take over → sign into **your** LinkedIn → hand back  
3. Prompt:

> Find 2nd-degree people matching the Quiet Achiever ICP who I’m not connected to. Stack-rank. Return JSON only. Do not send any connection requests.

4. Web Job Search → **ICP** → paste JSON → **Write prospects to Notion**  
5. Triage in [Prospects](https://app.notion.com/p/40141716da288058a328fd115350eddd) — set Status to **To connect** for ones you approve

### Cadence — connects (important)

Assume ~**100 connection invites** on Free (treat as a **weekly** budget unless LinkedIn shows otherwise):

| Action | How often |
|--------|-----------|
| ICP Bot research + write to Prospects | **2–3× / week** is enough (or daily light refresh) |
| You send connects from the ranked list | **~10–15 / weekday** (~50–75 / week), never dump 100 in one day |
| Messages after they accept | Separate, also paced |

ICP Bot must stay on **research + rank** by default. You click Connect in LinkedIn yourself (or approve one-by-one if you later allow the Bot to send).

---

## C. What “seed clients” meant (clarified)

Notion access ≠ the Web Job Search app knowing the client.

- **Notion connector** = I/the app can read/write Opportunities when shared  
- **Seed clients** = register Alan, Becher, … inside Web Job Search (Supabase `js_clients`) so jobs get **scored against them** and Allocate knows which Opportunities DB to write to  

If a client isn’t in **Clients** in the app, ingest won’t score them and Allocate won’t know their board.
