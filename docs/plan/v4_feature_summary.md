# FINAL V4.0 FEATURE SUMMARY & DOCUMENTATION
# Luxury Laundry ERP (Qatar)

## 1. SUBSCRIPTION MANAGEMENT
- **Contract:** `packages/logic/subscriptions/subscription-service.ts`
- **Logic:** Handles BASIC, GOLD, and PLATINUM tiers with monthly kg limits. Supports auto-renewal via QPay.
- **Revenue Goal:** 40% recurring revenue by Year 2.

## 2. ESG & SUSTAINABILITY (GREEN METRICS)
- **Contract:** `packages/logic/esg/esg-service.ts`
- **Logic:** Calculates water and energy savings based on luxury industrial standards.
- **Visibility:** Real-time impact shown to customers via the `GreenDashboard`.

## 3. CASH ON DELIVERY (COD) RECONCILIATION
- **Contract:** `packages/logic/payments/cod-service.ts`
- **Workflow:** Closes the gap between physical cash and digital tallies. Mandatory for the Qatar market where COD is prevalent.

## 4. VENDOR PORTAL (SUPPLY CHAIN)
- **App:** `apps/vendor-portal/`
- **Purpose:** Suppliers for detergents and consumables can self-manage POs, reducing manual email overhead for the Operations team.

## 5. ACCESSIBILITY (WCAG 2.1)
- **Compliance:** All UI components follow AA standards for high-contrast and screen-reader accessibility.
- **Rule:** No low-contrast fashion-only colors; luxury must be inclusive.

## 6. VIRTUAL QUEUE
- **App:** `apps/public-portal/components/queue/VirtualQueue.tsx`
- **Purpose:** Manages physical footfall at high-end branches (West Bay, Lusail), allowing customers to wait digitally.
