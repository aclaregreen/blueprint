# Blueprint

Macro tracking app built from reusable pieces — meals made of components you check off daily. May expand into workout scheduling later.

## How to help me

I'm building this myself to learn. Guide me, don't build it for me.

- Explain the concept, show a small example, let me write the real code.
- Don't write full features/files unless I explicitly say "just write it" or "build this for me."
- If I hit an error, help me debug it — ask questions, point me at the likely cause, don't just hand me the fix.
- Small steps. Confirm each piece works before we move to the next.
- When you do show example code, keep it minimal and clearly labeled as illustrative, not something to paste in wholesale.

## Stack (decided — don't suggest alternatives)

- **Frontend:** React + Vite
- **UI components:** shadcn/ui (Tailwind + Radix under the hood) for interactive/hard components (dialogs, dropdowns, comboboxes). Everything else (lists, cards, buttons, the macro-total display) is hand-written plain CSS. shadcn components live in `src/components/ui/` — treat that folder as generated/vendored, not hand-edited by convention.
- **Data fetching:** TanStack Query (`@tanstack/react-query`), provider set up in `src/main.tsx`, client in `src/queryClient.ts`
- **DB:** Supabase (Postgres) — one hosted project, local dev via Supabase CLI (`supabase start`), schema changes as migrations, `supabase db push` to go live
- **Later:** PWA setup so it installs on iPhone via Safari (no App Store)
- **Dev environment:** WSL2, project lives inside the WSL filesystem (not `/mnt/c/...`), VS Code + WSL extension
- **Testing:** Chrome DevTools device mode on monitor + real iPhone over `vite --host`, mobile-first CSS

## Core domain concepts

- **Component** — a reusable food item with macro data (e.g. "grilled chicken breast, 150g").
- **Meal** — a named combination of components (e.g. "post-workout breakfast").
- **Daily log** — which components/meals were checked off on a given day, driving macro totals.

(Update this section as the schema solidifies — it's the source of truth for how the app's data model is meant to work.)

## Conventions

- Migrations live in `supabase/migrations/`, one file per schema change, never edit an already-applied migration.
- Env vars for Supabase URL/anon key go in `.env.local`, never committed.
- CSS: shadcn components use Tailwind utility classes (don't fight that). My own components use plain CSS classes in `src/index.css` (or a colocated stylesheet) — no Tailwind utilities in hand-written components.
- The `@/` import alias points at `src/` (e.g. `@/components/ui/button`). Enforced by eslint — `../` parent imports are a lint error; same-folder `./` imports are still fine.

## Current status

Tooling only, no app logic yet: Vite/React/TS scaffolded, Supabase client stubbed (`src/supabaseClient.ts`, not yet connected to a real schema), Tailwind + shadcn/ui installed and wired up, TanStack Query provider wired up. No migrations, no schema, no CRUD, no UI beyond the default page. Next real step: draft the schema (components/meals/daily log) and start on migrations, or start on the components list UI — pick one to start small.

_(Keep this section updated as we go — e.g. "schema drafted, not yet migrated" / "components CRUD working, meals next")_
