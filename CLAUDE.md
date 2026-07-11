# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

PrepFridge (repo `re-up`) — a hackathon app on reducing food waste. A user gives the ingredients they have (from a fridge photo or manual entry) and gets recipes ranked to use those ingredients, **prioritizing ones about to expire**. The recipe matching is a deliberate DB + algorithm design, **not** an LLM call — the AI (Gemini) is intended only as a vision adapter (photo → ingredient names).

## Commands

```bash
npm run dev      # Next.js dev server (Turbopack) on :3000
npm run build    # production build
npm run lint     # eslint
# no test framework is set up

# Re-seed the database from data/recipes.json (needs SUPABASE_SERVICE_ROLE_KEY in .env.local):
node --env-file=.env.local scripts/seed.mjs
```

Schema/DDL changes: apply via the Supabase MCP (`apply_migration`) or the Supabase SQL editor — there is no local migrations folder or Supabase CLI setup.

## Architecture: the matching pipeline

The whole feature is one vertical slice; understanding it requires reading `app/page.tsx`, `app/api/recipes/route.ts`, `lib/matching.ts`, and the DB together:

```
app/page.tsx (client, fridge held in React STATE — not persisted)
   │  POST { ingredients:[{name,urgency}], filters } 
   ▼
app/api/recipes/route.ts  ── on any error, returns a hardcoded 3-recipe FALLBACK (demo insurance)
   ▼
lib/matching.ts
   ├─ resolve_ingredients (RPC)  free-text name → canonical id (exact → alias → pg_trgm fuzzy)
   ├─ candidate_recipes  (RPC)   recipes sharing ≥1 ingredient, after HARD filters (diet/allergen/cuisine/category/time)
   └─ scoreCandidates (JS)       rank by 0.55*coverage + 0.45*urgency; drop if missing > MAX_MISSING
```

**Filter-then-rank is the core principle**: hard filters (SQL `WHERE`) decide *eligibility*; scoring (JS, tunable) decides *order*. If the strict pass returns nothing, a **relaxed fallback** keeps diet/allergen filters hard but drops cuisine/category/time and tolerates more missing, returning `relaxed: true` so the UI can say "closest matches".

**Urgency** (`Urgent|Soon|Fresh`, weights 3/2/1) is what makes it a waste-reduction tool: recipes that consume the user's most-urgent ingredients score higher.

### Data model (Supabase Postgres)

- `ingredients` — **canonical reference**: `name`, `aliases[]`, `attributes[]` (e.g. `{meat}`,`{dairy}`,`{gluten}`,`{nuts}`).
- `recipes` + `recipe_ingredients` — **normalized**, joined on canonical ids. This normalization is what enables fuzzy matching and coverage counting; do not denormalize recipe ingredients into a text array.
- Recipe diet flags (`is_vegetarian/is_vegan/is_gluten_free`) are **derived from ingredient attributes at seed time**, never trusted as input labels. `data/recipes.json` is the seed source of truth; the derivation logic lives in both `scripts/seed.mjs` (JS) and the seed SQL — keep them in sync.
- Tables are RLS public-read; writes require the service-role key (or the MCP, which bypasses RLS).

`lib/types.ts` holds the shapes shared across the route, matching logic, and page (`Urgency`, `UserIngredient`, `Filters`, `RecipeMatch`, request/response).

## Branches — important

`matchmaking` is the working branch and carries the matching backend. It **adopted the `FrontEnd` branch's UI** (`app/page.tsx` + `app/globals.css` + `app/layout.tsx` are the polished client design system). Do not modify the `FrontEnd` branch — it belongs to a teammate.

Consequence: **switching branches swaps tracked files like `page.tsx`/`globals.css`**, but the matching backend (`lib/`, `app/api/`, `data/`, `scripts/seed.mjs`) is untracked and survives switches. After a branch switch or a `git checkout <branch> -- <file>`, the running dev server can serve a **stale Turbopack compile** (notably CSS) — if styles or code look wrong, `rm -rf .next` and restart `npm run dev`.

## Environment

`.env.local` (gitignored) needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; seeding also needs `SUPABASE_SERVICE_ROLE_KEY`. The Supabase MCP is configured in `.mcp.json` (project ref `bpymnyobtsdamgwrufve`) — prefer it for inspecting/altering the DB.

## Not yet wired (known follow-ups)

- **Gemini vision** (`scripts/test-fridge.mjs`) is standalone and not integrated; `@google/genai` is **not installed** and the script uses an unverified API shape. Its urgency vocab (`fresh|mid|close_to_expired`) must be mapped to `Urgent|Soon|Fresh` at the boundary.
- Fridge inventory is React state only; a per-user `fridge_items` table (FK → `ingredients`) is the agreed future persistence model.
- No allergen-exclusion UI yet (the backend `exclude` param supports it). High-protein/Low-carb are soft score nudges, not filters.
