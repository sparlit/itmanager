# Codebase Audit Report: "World-Class" Gap Analysis

## Current Status
- **Monorepo Structure:** Uses workspaces and Turbo, but lacks strict standardization between `apps/internal-erp` and `apps/internal-portals`.
- **Portal Registry:** `PORTAL_CONFIG` in `apps/internal-portals` is a good start for plug-and-play architecture.
- **Shared Packages:** `packages/ui-core` and `packages/db` exist but need to be enriched with "world-class" primitives (MFA, RLS helpers, etc.).
- **Missing Portals:** Many departments from the blueprint (Marketing, Security, Housekeeping, etc.) are currently just placeholders in `PORTAL_CONFIG` or simple pages.

## Identified Gaps (The "Top 0.01%" Delta)
1. **Next.js Version:** Currently mixed. Need to align all apps to **Next.js 15+** with App Router and Edge Runtime.
2. **Unified Navigation:** Lack of a global, high-performance command palette (e.g., cmd+k) to switch between departments.
3. **Theming Engine:** The current `color` in `PORTAL_CONFIG` is too simplistic. Needs a full Tailwind-based dynamic theme provider for the 15+ "UX Grammars".
4. **Offline Capability:** Logistics and Production lack robust IndexedDB + CRDT synchronization logic for true "Offline-First" status.
5. **Localization:** RTL (Arabic) support is mentioned in memory but not consistently enforced in shared UI components.

## Recommended Action Plan
1. **Unify Portals:** Merge `internal-erp` and `internal-portals` into a single, highly optimized Next.js application with dynamic routing for departments.
2. **Global Command Center:** Implement a "Super Admin" shell that wraps all internal portals.
3. **World-Class Public Portal:** Rebuild `public-portal` into a unified Next.js 15 app with partial prerendering and digital wardrobe features.
4. **Enhanced UI-Core:** Inject Qatar-specific primitives (Address picker, Gregorian/Hijri toggle) into the shared package.
