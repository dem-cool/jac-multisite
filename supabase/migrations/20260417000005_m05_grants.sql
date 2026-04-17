-- Grant table privileges so RLS policies can actually be evaluated
-- anon: read-only on public-facing tables, insert on submissions
grant select on public.dealers to anon;
grant select on public.posts to anon;
grant select on public.press_notes to anon;
grant select on public.carousel_slides to anon;
grant select on public.promos to anon;
grant insert on public.submissions to anon;

-- authenticated: full CRUD on all tables (rows still gated by RLS policies)
grant select, insert, update, delete on public.dealers to authenticated;
grant select, insert, update, delete on public.posts to authenticated;
grant select, insert, update, delete on public.press_notes to authenticated;
grant select, insert, update, delete on public.carousel_slides to authenticated;
grant select, insert, update, delete on public.promos to authenticated;
grant select, insert, update, delete on public.forms to authenticated;
grant select, insert, update, delete on public.submissions to authenticated;
