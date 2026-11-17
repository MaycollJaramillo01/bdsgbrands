-- BDSG store: pending orders (filled by Stripe webhook fulfillment) and the launch waitlist.
create table if not exists public.orders (
  id uuid primary key,
  items jsonb not null,
  subtotal numeric(10,2) not null check (subtotal >= 0),
  status text not null default 'pending' check (status in ('pending','paid','fulfilled','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.waitlist (
  id bigint generated always as identity primary key,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254),
  topic text not null check (topic in ('barrier','renewal','calm','recovery','greatness-program')),
  created_at timestamptz not null default now(),
  unique (email, topic)
);

alter table public.orders enable row level security;
alter table public.waitlist enable row level security;

-- Visitors may only create rows. Nobody reads or edits through the public API; status is set server-side.
revoke all on public.orders, public.waitlist from anon, authenticated;
grant insert (id, items, subtotal) on public.orders to anon, authenticated;
grant insert (email, topic) on public.waitlist to anon, authenticated;

create policy orders_insert on public.orders for insert to anon, authenticated with check (status = 'pending');
create policy waitlist_insert on public.waitlist for insert to anon, authenticated with check (true);
