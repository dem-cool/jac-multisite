-- M04 Seed: insert two initial dealers (idempotent)

insert into public.dealers (slug, name)
values
  ('importer',      'JAC Motors Poland'),
  ('dealer-krakow', 'JAC Kraków')
on conflict (slug) do nothing;
