# Notion Allocate setup

Web Job Search writes a new Opportunities row when you click **Allocate to Notion**.

## 1. Env

In `.env.local`:

```bash
NOTION_INTEGRATION_TOKEN=ntn_...
```

Reuse the Quiet Achiever Notion integration used by newsletter / n8n if you want one connection for all tools.

## 2. Share each Opportunities database

The integration cannot see a database until you share it:

1. Open the client's **Opportunities** database in Notion (e.g. Alan Ong).
2. Click **•••** (top right) → **Connections**.
3. Invite / connect the integration that owns `NOTION_INTEGRATION_TOKEN`  
   (today that is often `n8n-connector-NEWTQA`).
4. Confirm the client record in Web Job Search has the correct **Opportunities database id**  
   (from the DB URL — Alan’s is `bec99289139d450d93cd080d61b47982`).

Repeat for each coaching client's Opportunities board.

## 3. What gets written

| Notion property | Value |
|-----------------|--------|
| Opportunity | `{title} @ {company}` |
| Company / Role | from job |
| Job decription | canonical URL *(keeps existing typo)* |
| Salary range | advertised or client target note |
| Notes | coach notes + match rationale |
| Date | today |
| How keen? | Maybe (default) |
| Round | Lead |
| Type | Full-time |
| Source | **AI Agent** |

## 4. Verify

1. Import a test JD and score clients.
2. Open the job → **Allocate to Notion** for Alan.
3. Confirm a new Lead / AI Agent row on his Opportunities board.
4. Delete any rows titled `TEST — …` left from wiring checks.
