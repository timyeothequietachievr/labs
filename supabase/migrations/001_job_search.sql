-- Web Job Search schema (js_* tables)
-- Hosted on Notion 30habits30days Supabase project (free-tier project limit;
-- migrate to a dedicated labs-job-search project when available).
-- Local fallback: .data/job-search.json when SUPABASE_SERVICE_ROLE_KEY is unset.

create extension if not exists "pgcrypto";

create table if not exists js_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active',
  notion_coaching_plan_url text default '',
  notion_ai_client_brief_url text default '',
  ai_client_brief text default '',
  notion_opportunities_database_id text default '',
  notion_opportunities_collection_id text default '',
  portfolio_url text default '',
  cv_summary text default '',
  current_salary_note text default '',
  target_salary_note text default '',
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists js_jobs (
  id uuid primary key default gen_random_uuid(),
  employer text not null,
  title text not null,
  location text default '',
  arrangement text default 'unknown',
  canonical_url text default '',
  external_requisition_id text default '',
  jd_text text not null,
  content_hash text not null,
  sources jsonb not null default '[]'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  last_checked_at timestamptz not null default now(),
  posting_date date,
  availability text not null default 'open',
  advertised_compensation text default '',
  compensation_currency text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists js_jobs_req_uidx
  on js_jobs (lower(external_requisition_id))
  where external_requisition_id <> '';

create unique index if not exists js_jobs_url_uidx
  on js_jobs (lower(regexp_replace(canonical_url, '/$', '')))
  where canonical_url <> '';

create table if not exists js_job_client_matches (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references js_jobs(id) on delete cascade,
  client_id uuid not null references js_clients(id) on delete cascade,
  recommendation text not null,
  rationale text not null default '',
  strongest_evidence text not null default '',
  gaps text not null default '',
  eligibility_concerns text not null default '',
  confidence numeric not null default 0,
  decision text not null default 'unreviewed',
  coach_notes text not null default '',
  applied_at timestamptz,
  notion_page_id text,
  assessed_at timestamptz not null default now(),
  profile_version_note text not null default 'v1',
  unique (job_id, client_id)
);

create table if not exists js_run_logs (
  id uuid primary key default gen_random_uuid(),
  triggered_by text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null default 'running',
  jobs_discovered int not null default 0,
  jobs_new int not null default 0,
  matches_created int not null default 0,
  source_failures jsonb not null default '[]'::jsonb,
  notes text not null default ''
);

-- Service-role only (Next.js server). No anon/authenticated Data API access.
alter table js_clients enable row level security;
alter table js_jobs enable row level security;
alter table js_job_client_matches enable row level security;
alter table js_run_logs enable row level security;
