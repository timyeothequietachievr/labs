# Set up Client Outreach Bot (people / ICP only)

Creates **one** Grok Bot that finds **potential clients** on LinkedIn (esp. 2nd degree) and stack-ranks them.  
Do **not** put TrueUp job-crawling on this bot.

## 1. Create

1. Grok Bot → **New Bot** → name: **Client Outreach Bot**
2. Paste all of [`client-outreach-bot-brief.md`](./client-outreach-bot-brief.md) (below the horizontal rule)
3. Say: “Remember this. You only find and rank people, never job vacancies. Default is research + rank — no auto-connect.”

## 2. LinkedIn (this bot only)

This bot **may** use Tim’s LinkedIn (required for 2nd-degree search).

1. First run: take over Bot computer → sign into **linkedin.com/in/timyeo** → hand back  
2. Confirm: research + ranked list only until you approve specific connects  
3. If LinkedIn rate-limits or warns: stop  

Job Discovery Bot must **never** share this LinkedIn session for crawling jobs.

## 3. ICP

Brief is aligned to Notion **ICP (Ideal Customer Profile)**  
https://app.notion.com/p/6df41716da288304ac4881992c6d1e14  

If ICP changes, update the brief and tell the Bot to remember the update.

## 4. First run prompt

> Find 2nd-degree LinkedIn people who match the Quiet Achiever ICP and who I’m not already connected to. Stack-rank by ICP fit and connection likelihood. Return JSON only using your schema. Do not send any connection requests.

## 5. Land results in Notion

1. Copy the Bot’s JSON  
2. Open Web Job Search → **ICP** → paste → **Write prospects to Notion**  
3. Review rows in [Prospects](https://app.notion.com/p/40141716da288058a328fd115350eddd) (Status starts as **New**)

## 6. Sister bot

Job roles / TrueUp / Web Job Search → **Job Discovery Bot**  
[`job-discovery-bot-brief.md`](./job-discovery-bot-brief.md) · [`job-discovery-bot-setup.md`](./job-discovery-bot-setup.md)
