-- Run once in the Supabase SQL editor. No anonymous table access is granted.
-- The server uses a service-role key; never put that key in a VITE_ variable.
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  email text not null check (char_length(email) between 3 and 254),
  company_name text not null check (char_length(company_name) between 2 and 160),
  country text not null check (char_length(country) between 2 and 80),
  website text not null default '' check (char_length(website) <= 500),
  service text not null check (char_length(service) between 1 and 120),
  project_description text not null check (char_length(project_description) between 20 and 5000),
  budget text not null check (char_length(budget) between 1 and 120),
  timeline text not null check (char_length(timeline) between 1 and 120),
  contact_preference text not null check (char_length(contact_preference) between 1 and 100),
  consent boolean not null check (consent = true),
  created_at timestamptz not null default now(),
  client_hash text not null check (char_length(client_hash) = 64),
  payload_hash text not null check (char_length(payload_hash) = 64)
);
create index if not exists inquiries_client_time_idx on public.inquiries (client_hash, created_at);
alter table public.inquiries enable row level security;
revoke all on public.inquiries from anon, authenticated;
grant select, insert, delete on public.inquiries to service_role;

create or replace function public.submit_inquiry(p_payload jsonb, p_client_hash text, p_payload_hash text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.inquiries%rowtype;
  inquiry_id uuid;
begin
  -- Serialize retries of the same id, even if requests arrive from different IPs.
  perform pg_advisory_xact_lock(hashtextextended(p_payload->>'submission_id', 0));
  select * into existing from public.inquiries where submission_id = (p_payload->>'submission_id')::uuid;
  if found then
    if existing.payload_hash <> p_payload_hash then
      raise exception 'INQUIRY_IDEMPOTENCY_CONFLICT' using errcode = 'P0001';
    end if;
    return existing.id;
  end if;
  -- The client identifier is a keyed hash, not a stored IP address. This limit is
  -- shared across Vercel instances, rather than depending on process memory.
  perform pg_advisory_xact_lock(hashtextextended(p_client_hash, 1));
  if (select count(*) from public.inquiries where client_hash = p_client_hash and created_at > now() - interval '15 minutes') >= 5 then
    raise exception 'INQUIRY_RATE_LIMIT' using errcode = 'P0001';
  end if;
  insert into public.inquiries (
    submission_id, full_name, email, company_name, country, website,
    service, project_description, budget, timeline, contact_preference,
    consent, client_hash, payload_hash
  ) values (
    (p_payload->>'submission_id')::uuid, p_payload->>'full_name', p_payload->>'email',
    p_payload->>'company_name', p_payload->>'country', coalesce(p_payload->>'website', ''),
    p_payload->>'service', p_payload->>'project_description', p_payload->>'budget',
    p_payload->>'timeline', p_payload->>'contact_preference', (p_payload->>'consent')::boolean,
    p_client_hash, p_payload_hash
  ) returning id into inquiry_id;
  return inquiry_id;
end;
$$;
revoke all on function public.submit_inquiry(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.submit_inquiry(jsonb, text, text) to service_role;

-- Review inquiries in the authenticated Supabase dashboard. No public admin UI.
-- Suggested operator cleanup, after agreeing a retention policy:
-- delete from public.inquiries where created_at < now() - interval '12 months';
