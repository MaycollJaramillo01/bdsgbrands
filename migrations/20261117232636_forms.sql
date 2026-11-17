-- Waitlist consent trail + contact messages. Additive only: no rows are deleted or rewritten.
alter table public.waitlist
  add column if not exists first_name text check (length(first_name) <= 80),
  add column if not exists source text check (length(source) <= 120),
  add column if not exists consent_timestamp timestamptz,
  add column if not exists consent_version text check (length(consent_version) <= 40),
  add column if not exists status text not null default 'subscribed' check (status in ('subscribed','unsubscribed'));

alter table public.waitlist drop constraint if exists waitlist_topic_check;
alter table public.waitlist add constraint waitlist_topic_check
  check (topic in ('barrier','renewal','calm','recovery','greatness-program','launch'));

grant insert (email, topic, first_name, source, consent_timestamp, consent_version) on public.waitlist to anon, authenticated;

create table if not exists public.contact_messages (
  id uuid primary key,
  name text not null check (length(name) between 1 and 120),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  topic text not null check (topic in ('product','order','membership','wholesale','press','reaction','other')),
  order_number text check (length(order_number) <= 40),
  product text check (length(product) <= 40),
  reaction_date date,
  message text not null check (length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new','handled')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from anon, authenticated;
grant insert (id, name, email, topic, order_number, product, reaction_date, message) on public.contact_messages to anon, authenticated;
create policy contact_insert on public.contact_messages for insert to anon, authenticated with check (status = 'new');
