<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:orchestration-roles -->
# Agent Roles

This project uses a simple 3-role orchestration. Each module in `PLAN.md` specifies which agent(s) to spawn.

## AGENT-DB
**Scope:** `supabase/migrations/`, `src/types/supabase.ts`  
**Runs:** `supabase db push`, `npm run update-types`  
**Use for:** any module that changes the database schema, RLS policies, or storage buckets  
**Always ends with:** regenerating types and confirming `src/types/supabase.ts` is updated

## AGENT-APP
**Scope:** `app/`, `components/`, `lib/`, `proxy.ts`, `next.config.ts`  
**Runs:** `npm run build` as final gate — must pass before reporting done  
**Use for:** any module that writes Next.js code  
**Reads:** `src/types/supabase.ts` before starting (wait for AGENT-DB if same module)

## Orchestrator (Claude main thread)
Reads `PLAN.md`, extracts module spec, spawns agents with full context, verifies output, marks module done.

## Key rules for all agents
- `proxy.ts` not `middleware.ts` (Next.js 16 rename) — export `function proxy()`
- Hostname via `request.headers.get('host')`, not `request.nextUrl`
- All async APIs: `await cookies()`, `await headers()`, etc.
- Node.js runtime only in proxy — no edge runtime
<!-- END:orchestration-roles -->
