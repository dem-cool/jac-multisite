# JAC Multisite — Build Plan

## How to run a module

Say `"do M01"` (or any module number). Claude will:

1. Read the module spec below
2. Spawn AGENT-DB and/or AGENT-APP (see `AGENTS.md` for role definitions)
3. Gate on `npm run build` — must pass
4. Mark the module done here

---

## Domain model — importer vs dealer

**Importer (marka / centrala)** is served on the **apex (root) host** of the brand domain — there is **no** public `importer.example.com` URL in this product.

| Role     | Example URL                          | How proxy picks tenant                                                            |
| -------- | ------------------------------------ | --------------------------------------------------------------------------------- |
| Importer | `https://jacpolska.pl`               | Apex host (`host` has only `brand.tld`); tenant slug defaults to `importer` in DB |
| Dealer   | `https://dealer-krakow.jacpolska.pl` | First DNS label is the dealer `slug`                                              |

The row in `dealers` with `slug = 'importer'` is the **technical tenant id** for the brand site on the apex; marketing URLs stay on the root domain, not on an `importer.*` subdomain.

**DNS / Vercel:** apex + wildcard `*.jacpolska.pl` (or equivalent) so every dealer subdomain hits the same deployment.

---

## Dev Subdomain Workaround

**Localhost** — use `lvh.me` (all subdomains → `127.0.0.1`, zero config). Match production: **apex = importer**, **subdomain = dealer**:

```
http://lvh.me:3000                    → importer (same rule as jacpolska.pl)
http://dealer-krakow.lvh.me:3000      → dealer
```

(Optional: `http://importer.lvh.me:3000` still resolves to the `importer` tenant via subdomain, but production does not use that pattern — prefer apex locally too.)

**Vercel free tier** — no wildcard domains. Proxy falls back to:

1. `__dealer` cookie — set by visiting `/dev/set-dealer/[slug]`
2. `?_dealer=slug` query param
3. Apex / two-label host → importer tenant (`slug` `importer`)

---

## Manual Steps Before Starting

### Supabase dashboard (do before M01)

- [ ] Auth → Site URL → `http://lvh.me:3000` (apex = importer)
- [ ] Auth → Redirect URLs → add `http://*.lvh.me:3000/**` (dealer subdomains + optional `importer.lvh.me` if used)
- [ ] Auth → Email Templates → customize invite email (before M05)
- [ ] Auth → SMTP Settings → set custom SMTP to avoid 3/hr free limit (before M03)

### Vercel dashboard (before M10)

- [ ] Settings → Environment Variables → add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_RECAPTCHA_KEY`
- [ ] Add `NEXT_PUBLIC_DEV_FALLBACK=true` to preview environment
- [ ] Add custom production domain when ready

---

## Module Dependency Order

```
M01 (schema) → M02 (proxy) → M03 (auth) → M04 (layout+seed)
                                                      ↓
                              M05 (superadmin) ←──── M04
                              M06 (dealer admin) ←── M04
                              M07 (public pages) ←── M04
                                    ↓
                              M08 (forms) ← M07
                              M09 (tracking) ← M07
                              M10 (deploy) ← all
```

M05, M06, M07 can be done in parallel after M04 is complete.

---

## Modules

### M01 — DB Schema + RLS + Types

- [x] done

**Agents:** AGENT-DB  
**~3h**

Tables:

- `dealers` (id uuid pk, slug text unique, name text, contact_json jsonb, footer_json jsonb, tracking_json jsonb, created_at timestamptz)
- `posts` (id, dealer_id → dealers, title, slug, body text, cover_url text, status text, published_at)
- `press_notes` (id, title, slug, body, cover_url, published_at) — importer-only, no dealer_id
- `carousel_slides` (id, dealer_id → dealers, image_url, headline, link, sort_order int)
- `promos` (id, dealer_id → dealers, title, slug, hero_url, body, active bool)
- `forms` (id, dealer_id → dealers, name, recipient_email, fields_json jsonb)
- `submissions` (id, form_id → forms, dealer_id → dealers, data_json jsonb, sent_at timestamptz, error text)

RLS policies:

- Dealer-scoped tables: `dealer_id = (auth.jwt() ->> 'dealer_id')::uuid`
- `press_notes`: SELECT for all, INSERT/UPDATE/DELETE for superadmin only
- `submissions`: INSERT for anon, SELECT for matching dealer_admin

Storage: bucket `dealer-media`, policy: path must start with `{dealer_id}/`

End: run `npm run update-types`

---

### M02 — Proxy + Dealer Context

- [x] done

**Agents:** AGENT-APP  
**~2h**

Files to create:

- `proxy.ts` — parse tenant (dealer subdomain if `*.brand.tld` → else cookie → query param → apex defaults to importer slug); inject `x-dealer-slug` header; return 404 for unknown slugs
- `lib/dealer.ts` — `getDealerBySlug(slug)` using service role client
- `lib/dealer-context.ts` — `getDealerFromHeaders()` reads `x-dealer-slug` in server components
- `app/dev/set-dealer/[slug]/route.ts` — sets `__dealer` cookie, redirects to `/`

Proxy config: matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `public/`

---

### M03 — Auth + Roles + JWT Claims

- [x] done

**Agents:** AGENT-DB (DB function), AGENT-APP  
**~2h**

- DB function: `get_my_dealer_id()` reads `dealer_id` from JWT claim
- Supabase hook or trigger: set `app_metadata.dealer_id` + `app_metadata.role` on user creation (via DB webhook or edge function)
- `proxy.ts` additions: protect `/admin/*` (require `role = superadmin`), `/dashboard/*` (require `role = dealer_admin`)
- `lib/auth.ts` — `getSession()`, `requireRole(role)`, `getMyDealerId()`
- `app/login/page.tsx` — minimal email+password form using Supabase Auth

---

### M04 — Shared Layout + Seed

- [x] done

**Agents:** AGENT-DB (seed migration), AGENT-APP  
**~2h**

Seed (new migration file):

- Insert dealer: `importer` (slug: `importer`, name: `JAC Motors Poland`) — tenant for **apex** brand site (e.g. `jacpolska.pl`), not a public `importer.*` hostname
- Insert dealer: `dealer-krakow` (slug: `dealer-krakow`, name: `JAC Kraków`)

Components:

- `components/layout/Header.tsx` — logo left, nav center, dealer name badge if non-importer
- `components/layout/Footer.tsx` — renders from `dealer.footer_json`; importer shows all-dealers link
- Update `app/layout.tsx`: call `getDealerFromHeaders()`, pass to Header + Footer

---

### M05 — Superadmin Panel (Dealer CRUD)

- [x] done

**Agents:** AGENT-APP  
**~2.5h**

Routes under `app/admin/dealers/`:

- `page.tsx` — list all dealers with edit/delete links
- `new/page.tsx` — form: name → auto-slug, contact fields; Server Action creates dealer + invites dealer_admin email
- `[id]/edit/page.tsx` — edit dealer; Server Action updates; separate delete button

Invite: `supabase.auth.admin.inviteUserByEmail(email, { data: { role: 'dealer_admin', dealer_id } })`

---

### M06 — Dealer Admin Panel

- [ ] done

**Agents:** AGENT-APP  
**~3.5h**

Routes under `app/dashboard/` (scoped to logged-in dealer_admin's dealer_id):

- `blog/` — list posts; new/edit with Tiptap rich text editor; image upload to `dealer-media/{dealer_id}/`; draft/publish toggle
- `slider/` — list slides; add/edit/delete; drag-to-reorder (sort_order field)
- `promos/` — list promos; add/edit with hero image + Tiptap body
- `forms/` — list forms; config builder: add fields (label, type, required), set recipient email
- `settings/` — edit `contact_json`, `footer_json` inline forms

---

### M07 — Public Pages

- [ ] done

**Agents:** AGENT-APP  
**~3h**

All pages call `getDealerFromHeaders()` to get current tenant. Importer-only pages redirect dealers to `/`.

- `app/page.tsx` — hero slider + 3 latest promos + 3 latest press notes
- `app/blog/page.tsx` — paginated post list for current dealer
- `app/blog/[slug]/page.tsx` — post detail
- `app/notki-prasowe/page.tsx` — importer-only; list of press_notes
- `app/promocje/page.tsx` — promo grid
- `app/o-nas/page.tsx` — renders `dealer.contact_json`
- `app/dealerzy/page.tsx` — importer-only; list dealers with Google Maps links

---

### M08 — Dynamic Forms + Leads

- [ ] done

**Agents:** AGENT-APP  
**~3h**

- `components/DynamicForm.tsx` — renders fields from `form.fields_json`; client component
- reCAPTCHA v3: `NEXT_PUBLIC_RECAPTCHA_KEY` env var; verify token server-side in route handler
- `app/api/submit/route.ts` — POST: verify recaptcha → insert submission → send email via Resend → if send fails, store error in `submissions.error`
- Retry button in `app/dashboard/forms/submissions/page.tsx` — resends failed emails

Env vars: `RESEND_API_KEY`, `NEXT_PUBLIC_RECAPTCHA_KEY`, `RECAPTCHA_SECRET_KEY`

---

### M09 — Tracking + Consent

- [ ] done

**Agents:** AGENT-APP  
**~3h**

- `components/TrackingScripts.tsx` — reads `dealer.tracking_json` (keys: `gtm_id`, `ga_id`, `meta_pixel_id`); renders script tags conditionally after consent
- Cookie consent: integrate CookieYes (script tag in layout) OR build minimal custom banner with localStorage
- Consent mode v2: call `gtag('consent', 'default', {...})` before GTM loads; update on user choice
- Wrap `<TrackingScripts>` in `<Suspense>` in root layout

---

### M10 — Deploy + QA

- [ ] done

**Agents:** AGENT-APP (test script)  
**~2h**

- `scripts/test-rls.ts` — signs in as dealer A admin, reads posts where dealer_id = dealer B's id, asserts empty result
- Push migrations to prod: `supabase db push --project-ref jvjxgxleyevmudgojziv`
- Smoke checklist:
  - [ ] Apex `https://yourdomain.com` (or `jacpolska.pl`) loads importer footer — not `importer.yourdomain.com`
  - [ ] `https://dealer-krakow.yourdomain.com` loads dealer footer
  - [ ] Login → dealer admin → create post → visible on public blog
  - [ ] Form submit → submission in DB → email delivered
  - [ ] Decline cookies → no GTM/GA scripts load
  - [ ] Dealer A admin cannot see dealer B posts (RLS test script passes)
