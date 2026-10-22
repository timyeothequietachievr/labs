# Set up Job Discovery Bot (roles only)

Creates **one** Grok Bot that finds **job openings**.  
Do **not** put ICP / LinkedIn prospecting instructions on this bot.

## 1. Create

1. Grok Bot → **New Bot** → name: **Job Discovery Bot**
2. Paste all of [`job-discovery-bot-brief.md`](./job-discovery-bot-brief.md) (below the horizontal rule)
3. Store `JOB_SEARCH_INGEST_TOKEN` from labs `.env.local` / Vercel env in the Bot’s **private memory only**
4. Say: “Remember this. You only find roles, never coaching leads. POST ingest yourself after each crawl.”

## 2. Hard rule

> Never use Tim Yeo’s LinkedIn login. TrueUp + public/alert job sources only.

## 3. TrueUp

First run: take over Bot computer → sign into **TrueUp** → hand back.

## 4. Autonomous deliver into Web Job Search

Production base: `https://labs.thequietachievr.com`

1. `GET /api/job-search/discovery-criteria` (Bearer ingest token)  
2. Crawl the **union** (one shared run for all clients)  
3. `POST /api/job-search/ingest` with the JSON body  

Save as a **routine 1–2× / day**.

Manual fallback: paste JSON into Web Job Search → **Runs → Run ingest now**.

## 5. Sister bot

People / ICP / 2nd-degree outreach → **Client Outreach Bot**  
[`client-outreach-bot-brief.md`](./client-outreach-bot-brief.md) · [`client-outreach-bot-setup.md`](./client-outreach-bot-setup.md)
