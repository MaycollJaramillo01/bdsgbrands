-- Admin suite: catalog, settings, policies, discounts, richer orders, admin-only reads.
-- Additive only. Admin = verified InsForge user whose email is in public.admin_emails.

create table if not exists public.admin_emails (
  email text primary key check (email = lower(email)),
  added_at timestamptz not null default now()
);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u join public.admin_emails a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_verified
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Catalog ------------------------------------------------------------------
create table if not exists public.products (
  id text primary key check (id ~ '^[a-z0-9-]{1,40}$'),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,40}$'),
  name text not null check (length(name) between 1 and 80),
  sequence text not null default '' check (length(sequence) <= 4),
  role text not null default '' check (length(role) <= 80),
  headline text not null default '' check (length(headline) <= 160),
  status text not null default 'draft' check (status in ('draft','coming_soon','waitlist','available','sold_out','discontinued')),
  retail_price numeric(10,2) check (retail_price >= 0),
  member_price numeric(10,2) check (member_price >= 0),
  currency text not null default 'USD' check (currency = 'USD'),
  availability_date date,
  waitlist_enabled boolean not null default true,
  purchase_enabled boolean not null default false,
  inventory integer check (inventory >= 0),
  featured_ingredients text[] not null default '{}',
  inci text, size text, directions text, warnings text,
  short_description text not null default '',
  long_description text not null default '',
  when_to_use text not null default '',
  seo_title text not null default '' check (length(seo_title) <= 120),
  seo_description text not null default '' check (length(seo_description) <= 300),
  images jsonb not null default '[]',
  image_alt text not null default '',
  related_products text[] not null default '{}',
  provider_price_id text,
  sort integer not null default 100,
  updated_at timestamptz not null default now(),
  -- Same hard rules as validateCatalog(): the database refuses a sellable draft.
  constraint purchase_requires_available check (not purchase_enabled or (status = 'available' and retail_price is not null)),
  constraint member_not_above_retail check (member_price is null or retail_price is null or member_price <= retail_price)
);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

-- Single-row site settings (SiteSetting + MembershipConfig)
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  catalog_live boolean not null default true,
  checkout_live boolean not null default false,
  membership_enrollment_live boolean not null default false,
  standard_free_shipping_threshold numeric(10,2) not null default 70,
  member_free_shipping_threshold numeric(10,2) not null default 50,
  support_email text not null default '' check (support_email = '' or support_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  privacy_policy_version text not null default '2026-08-21',
  social jsonb not null default '[]',
  membership_initial_price numeric(10,2) not null default 55,
  membership_renewal_price numeric(10,2) not null default 35,
  membership_discount_max numeric(5,2) not null default 10,
  membership_effective_date date,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict do nothing;
create trigger settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- Legal / policy texts. Blocks keep the existing {t,text,label} shape.
create table if not exists public.policies (
  slug text primary key check (slug ~ '^[a-z0-9-]{1,40}$'),
  title text not null,
  summary text not null default '',
  effective text not null default '',
  draft boolean not null default true,
  blocks jsonb not null default '[]',
  sort integer not null default 100,
  updated_at timestamptz not null default now()
);
create trigger policies_touch before update on public.policies for each row execute function public.touch_updated_at();

-- Discounts
create table if not exists public.discounts (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]{3,32}$'),
  kind text not null check (kind in ('percent','fixed')),
  value numeric(10,2) not null check (value > 0),
  min_subtotal numeric(10,2) not null default 0 check (min_subtotal >= 0),
  starts_at timestamptz, ends_at timestamptz,
  max_uses integer check (max_uses > 0),
  uses integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint percent_max check (kind <> 'percent' or value <= 100)
);

-- Server checkout asks "is this code valid for this subtotal?" without being able to list codes.
create or replace function public.check_discount(p_code text, p_subtotal numeric)
returns table (code text, kind text, value numeric) language sql stable security definer set search_path = '' as $$
  select d.code, d.kind, d.value from public.discounts d
  where d.code = upper(p_code) and d.active and p_subtotal >= d.min_subtotal
    and (d.starts_at is null or d.starts_at <= now()) and (d.ends_at is null or d.ends_at > now())
    and (d.max_uses is null or d.uses < d.max_uses);
$$;
revoke all on function public.check_discount(text, numeric) from public;
grant execute on function public.check_discount(text, numeric) to anon, authenticated;

-- Orders: richer fields for the admin (filled by the checkout adapter once a provider exists)
alter table public.orders
  add column if not exists customer_email text,
  add column if not exists customer_name text,
  add column if not exists shipping_address jsonb,
  add column if not exists discount_code text,
  add column if not exists discount_amount numeric(10,2) not null default 0,
  add column if not exists shipping_amount numeric(10,2) not null default 0,
  add column if not exists tax_amount numeric(10,2) not null default 0,
  add column if not exists total numeric(10,2),
  add column if not exists fulfillment_status text not null default 'unfulfilled',
  add column if not exists tracking_number text,
  add column if not exists carrier text,
  add column if not exists provider text,
  add column if not exists provider_ref text,
  add column if not exists notes text,
  add column if not exists updated_at timestamptz not null default now();
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (status in ('pending','paid','fulfilled','cancelled','refunded'));
alter table public.orders drop constraint if exists orders_fulfillment_check;
alter table public.orders add constraint orders_fulfillment_check check (fulfillment_status in ('unfulfilled','shipped','delivered','returned'));
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- Waitlist topic is any catalog slug or a program list (validated by the API against the catalog).
alter table public.waitlist drop constraint if exists waitlist_topic_check;
alter table public.waitlist add constraint waitlist_topic_check check (topic ~ '^[a-z0-9-]{1,40}$');

-- Customers = everyone who ordered, aggregated. Admin only.
create or replace function public.admin_customers()
returns table (email text, name text, orders bigint, spent numeric, last_order timestamptz, on_waitlist boolean)
language sql stable security definer set search_path = '' as $$
  select o.customer_email, max(o.customer_name), count(*), coalesce(sum(o.total) filter (where o.status in ('paid','fulfilled')), 0),
         max(o.created_at), exists (select 1 from public.waitlist w where lower(w.email) = lower(o.customer_email))
  from public.orders o where public.is_admin() and o.customer_email is not null
  group by o.customer_email order by max(o.created_at) desc;
$$;
revoke all on function public.admin_customers() from public;
grant execute on function public.admin_customers() to authenticated;

-- RLS ----------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.site_settings enable row level security;
alter table public.policies enable row level security;
alter table public.discounts enable row level security;

-- Public reads what the storefront build needs; drafts stay admin-only.
grant select on public.products, public.site_settings, public.policies to anon, authenticated;
create policy products_public_read on public.products for select to anon, authenticated using (status <> 'draft' or public.is_admin());
create policy settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy policies_public_read on public.policies for select to anon, authenticated using (true);

-- Admin writes
grant insert, update, delete on public.products, public.policies, public.discounts to authenticated;
grant update on public.site_settings to authenticated;
grant select on public.discounts to authenticated;
create policy products_admin on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_admin on public.site_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy policies_admin on public.policies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy discounts_admin on public.discounts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Admin reads/edits on existing visitor tables (visitors stay insert-only)
grant select, update, delete on public.orders, public.waitlist, public.contact_messages to authenticated;
create policy orders_admin_read on public.orders for select to authenticated using (public.is_admin());
create policy orders_admin_update on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy waitlist_admin_read on public.waitlist for select to authenticated using (public.is_admin());
create policy waitlist_admin_update on public.waitlist for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy waitlist_admin_delete on public.waitlist for delete to authenticated using (public.is_admin());
create policy contact_admin_read on public.contact_messages for select to authenticated using (public.is_admin());
create policy contact_admin_update on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy contact_admin_delete on public.contact_messages for delete to authenticated using (public.is_admin());

-- Product images: public bucket "products"; only admins write.
alter table storage.objects enable row level security;
create policy products_img_insert on storage.objects for insert to authenticated with check (bucket = 'products' and public.is_admin());
create policy products_img_update on storage.objects for update to authenticated using (bucket = 'products' and public.is_admin()) with check (bucket = 'products' and public.is_admin());
create policy products_img_delete on storage.objects for delete to authenticated using (bucket = 'products' and public.is_admin());
create policy products_img_select on storage.objects for select to anon, authenticated using (bucket = 'products');
