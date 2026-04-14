# AGENTS.md - IT Manager Project

## Project Context

This is a multi-portal IT Department Management application built with Next.js 16 + PostgreSQL + Prisma. It manages assets, inventory, support tickets, staff, and more across three portals (main, customer-portal, internal-portal).

## Architecture Reminders

- **Main app** runs on port 3003
- **customer-portal** and **internal-portal** are separate Next.js apps
- Database: PostgreSQL via Prisma ORM (schema in `prisma/schema.prisma`)
- Auth: Cookie-based (`it_auth`), replace with JWT for production
- State: Zustand store (`src/store/app-store.ts`) + React Query
- UI: Tailwind CSS v4, Radix UI, shadcn-style components in `src/components/ui/`

## Key Commands

```bash
# Main app
npm run dev          # Start dev server (port 3003)
npm run lint         # ESLint check
npm run build        # Production build

# Database
npm run db:push      # Push schema to DB
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations

# Customer portal
cd customer-portal && npm run dev

# Internal portal
cd internal-portal && npm run dev
```

## File Conventions

- API routes: `src/app/api/[module]/route.ts`
- Components: `[module]-view.tsx` for list, `[module]-detail.tsx` for details
- Toast notifications: Use `sonner` (configured in `src/components/ui/sonner.tsx`)
- Dashboard data: `GET /api/dashboard` returns staff, assets, inventory, tickets metrics

## Development Guidelines

1. After schema changes: `npm run db:push` then `npm run db:generate`
2. After DB changes that need seed data: `npx tsx prisma/seed.ts`
3. Check lint and build before considering a task complete
4. Use ComboboxInput for form dropdowns that need free-type capability
5. All CRUD operations should show toast notifications (sonner)

## Installed Skills

The following skills are available for this project (from `config.json`):

### Development & Code
- `openclaw-code` · `openclaw-debug` · `openclaw-api` · `openclaw-github` · `openclaw-docker` · `openclaw-ci-cd` · `openclaw-testing` · `openclaw-security` · `openclaw-devops` · `openclaw-cloud` · `openclaw-databases` · `openclaw-logging` · `openclaw-monitoring`

### Data & Analytics
- `openclaw-data-viz` · `openclaw-dashboard` · `openclaw-metrics` · `openclaw-visualization` · `openclaw-bigdata` · `openclaw-ai-analytics` · `openclaw-reporting`

### Research & Knowledge
- `openclaw-websearch` · `openclaw-websearch-cited@1.1.1` · `openclaw-academic` · `openclaw-research-tools` · `openclaw-citations` · `openclaw-open-data` · `openclaw-library` · free-skill-wikipedia · free-skill-arxiv · free-skill-huggingface · free-skill-kaggle · free-skill-datahub · free-skill-openscience · free-skill-openml · free-skill-pubmed · free-skill-crossref · free-skill-openai-models · free-skill-commons

### Productivity & Organization
- `openclaw-tasks` · `openclaw-reminders` · `openclaw-calendar` · `openclaw-notes` · `openclaw-docs` · `openclaw-projects` · `openclaw-workflows` · `openclaw-automation` · `openclaw-memory` · `openclaw-supermemory@latest` · `superpowers@git+https://github.com/obra/superpowers.git`

### Communication & Collaboration
- `openclaw-email` · `openclaw-telegram` · `openclaw-slack` · `openclaw-discord` · `openclaw-social`

### Lifestyle & General
- `openclaw-weather` · `openclaw-maps` · `openclaw-places` · `openclaw-itineraries` · `openclaw-local-guides` · `openclaw-transport` · `openclaw-travel-booking` · `openclaw-food` · `openclaw-recipes` · `openclaw-wellness` · `openclaw-fitness` · `openclaw-fashion` · `openclaw-gifts` · `openclaw-home-decor` · `openclaw-shopping`

### Creative & Media
- `openclaw-images` · `openclaw-videos` · `openclaw-audio` · `openclaw-templates` · `openclaw-creative-writing` · `openclaw-design` · `openclaw-art` · `openclaw-photography` · `openclaw-music` · `openclaw-animation` · `openclaw-storytelling`

### Education
- `openclaw-flashcards` · `openclaw-quiz` · `openclaw-studying` · `openclaw-language-tools` · `openclaw-math` · `openclaw-science` · `openclaw-history` · `openclaw-literature` · `openclaw-education` · `openclaw-exams`

### Free Skills
- `free-skill-wikipedia` · `free-skill-openweather` · `free-skill-duckduckgo-search` · `free-skill-unsplash-images` · `free-skill-youtube` · `free-skill-reddit` · `free-skill-stackoverflow` · `free-skill-archive` · `free-skill-openstreetmap` · `free-skill-gutenberg` · `free-skill-spotify` · `free-skill-twitch` · `free-skill-medium` · `free-skill-devto` · `free-skill-github-trending` · `free-skill-nasa` · `free-skill-openaq` · `free-skill-wikidata` · `free-skill-archiveofourown`

### Special
- `@ramtinj95/openclaw-tokenscope` · `openclaw-skills` · `@tarquinen/openclaw-dcp@latest` · `micode` · `jj-openclaw` · `openclaw-healthcare` · `openclaw-finance` · `openclaw-textdoc` · `openclaw-backstory` · `openclaw-green-tech` · `openclaw-climate` · `openclaw-community` · `openclaw-social-impact` · `openclaw-volunteering` · `openclaw-nonprofit` · `openclaw-human-rights` · `openclaw-diversity`

---

## Memory

- **Daily notes:** `memory/YYYY-MM-DD.md` — raw logs of what happened
- **Long-term:** `MEMORY.md` — curated memories, decisions, and project state

## Red Lines

- Don't exfiltrate private data
- Don't run destructive DB commands without confirming
- `npm run db:push` > direct schema edits in production
- When in doubt, check the worklog.md first

## Group Chats

Not applicable to this project — it's an internal tool, not a messaging platform.

## Continuity

Each session, you wake up fresh. Read `MEMORY.md` and recent `memory/` files to resume context. Update `memory/YYYY-MM-DD.md` as you work.

Write it down. No mental notes.

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **itmanager** (1814 symbols, 4085 relationships, 67 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/itmanager/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/itmanager/context` | Codebase overview, check index freshness |
| `gitnexus://repo/itmanager/clusters` | All functional areas |
| `gitnexus://repo/itmanager/processes` | All execution flows |
| `gitnexus://repo/itmanager/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
