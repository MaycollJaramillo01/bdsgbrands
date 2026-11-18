-- Additive: privacy-request contact topic + privacy policy version on waitlist consent.
alter table public.contact_messages drop constraint if exists contact_messages_topic_check;
alter table public.contact_messages add constraint contact_messages_topic_check
  check (topic in ('product','order','membership','wholesale','press','privacy','reaction','other'));

alter table public.waitlist add column if not exists privacy_version text check (length(privacy_version) <= 40);
grant insert (privacy_version) on public.waitlist to anon, authenticated;
