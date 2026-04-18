# Laundry & Dry Cleaning Business - Complete Website & ERP Plan (Qatar)

## 1. Executive Summary
This project is a high-performance, modular web application designed for a premier Laundry and Dry Cleaning business in Qatar. It features a sophisticated public-facing E-Commerce portal and 15 distinct, visually isolated internal department portals. Built on 100% Free and Open Source Software (FOSS), the architecture ensures long-term sustainability, zero licensing costs, and a "Plug-and-Play" modular design where features can be added or removed without side effects.

---

## 2. Technical Architecture (The "Plug-and-Play" Engine)

### Core Stack (100% FOSS)
- **Framework:** Next.js 15+ (App Router) - Provides SSR, performance, and scalability.
- **Language:** TypeScript - Ensures type safety and "Zero-Stub" reliability.
- **Database:** PostgreSQL - Robust, relational, and the industry standard for ERP systems.
- **ORM:** Prisma - Clean database abstraction and easy migrations.
- **Styling:** Tailwind CSS + Framer Motion - For the luxury feel and sci-fi animations.
- **State Management:** Zustand - Lightweight and decoupled.
- **Maps:** Leaflet.js + OpenStreetMap - For Qatar-specific location tagging.
- **Auth:** Jose (JWT) + Bcrypt.js - Secure, stateless authentication.

### Modular Isolation Strategy
We will use a **Turborepo (Monorepo)** structure.
- `apps/public-portal`: The customer-facing E-commerce site.
- `apps/internal-portals`: A unified shell hosting the 15 department-specific UIs.
- `packages/database`: Shared Prisma client and schema.
- `packages/ui`: Shared "base" components, while specific portals override styles.
- `packages/logic`: Shared business rules (price calculation, order states).

This allows the **Administration** portal to have a completely different tech-look (e.g., retro-terminal) while the **Marketing** portal looks like a modern luxury magazine, all while talking to the same PostgreSQL database.

---

## 3. Public E-Commerce Portal Structure

### Target Audience: Public (B2C) and Corporate (B2B)
**Primary Goal:** Conversion (Order Booking & Contract Inquiries).

| Page | Content | Conversion Goal |
| :--- | :--- | :--- |
| **Landing (Entry)** | Dual-path selection: "Residential" vs "Internal Login" (Hidden). | Route user to correct experience. |
| **Homepage** | Hero, Trust, Services, Social Proof, FAQ. | Click "Order Now". |
| **Service Catalog** | Washing, Dry Cleaning, Tailoring with pricing. | Add items to cart. |
| **B2B/Corporate** | Bulk service details, Hotel/Hospital specialized flows. | Submit "Request for Quote". |
| **E-Com Auth** | Simple, elegant login/register (Mobile # based). | Complete registration. |
| **Checkout/Scheduler** | Cart summary + Map pin-drop for pickup/delivery. | Confirm Order. |
| **Order Tracking** | Real-time status: "In Factory", "Cleaning", "Out for Delivery". | Reduce support calls. |

---

## 4. Internal Portals (15 Departments)

Each portal will have a unique **Visual Signature** (Theme/Pattern).

| Department | Visual Identity / Theme | Pages Included | Primary Action Goal |
| :--- | :--- | :--- | :--- |
| **Administration** | High-Contrast / Dashboard Focus | System Config, User Roles, Master Data, Global Logs | 100% System Uptime & Security |
| **Operations** | Industrial / High-Density Grid | Workshop Queue, Machine Status, Efficiency Metrics | Optimize Throughput |
| **Production** | Minimalist / Status Tracking | Scanning Station, Quality Control, Packing, Racks | Zero Defects & On-time Ready |
| **Transport** | Dark Mode / Map-Centric | Route Map, Driver Assignment, Vehicle Maintenance | Minimize Fuel & Delivery Time |
| **Customer Service** | Warm / Chat-Centric | Order Support, Complaint Desk, Live Chat, Refunds | <1hr Resolution Time |
| **Finance** | Clean / Spreadsheet-Style | Receivables, Payables, QPay Sync, Tax Reports | Accurate P&L & Cashflow |
| **Sales** | Energetic / Metric-Heavy | Pipeline, B2B Contracts, Quoting Tool, Revenue Heatmap | Maximize New Contracts |
| **Marketing** | Creative / Portfolio-Style | Campaigns, Coupon Engine, Loyalty Dashboard, Analytics | Increase Repeat Orders |
| **Human Resource** | Professional / People-Centric | Employee Records, Attendance, Payroll, Leave Manager | Staff Retention & Efficiency |
| **IT** | **Sci-Fi (Edex-UI style)** | Server Metrics, Security Scanner, API Debugger, Backups | Zero Security Breaches |
| **Maintenance** | Utility / Checklist-Style | Asset Registry, PM Schedule, Repair Log, Parts Inventory | Zero Machine Downtime |
| **Business Dev** | Strategic / Growth-Oriented | Market Trends, Expansion Map, Partnership CRM | Market Share Growth |
| **Communications** | Newsletter / Social Feed | Internal News, Brand Assets, Press Releases | Unified Brand Voice |
| **Security** | Surveillance / Grid Layout | Site Access Logs, Digital Security, Incident Reports | Physical & Digital Safety |
| **Housekeeping** | Task-Based / Simple UI | Cleaning Schedule, Supplies Inventory, Staff Areas | Facility Hygiene Standards |

---

## 5. Visual Separation & "Plug-and-Play" Logic
- **Dynamic Theming:** We use CSS Variables and Data-Attributes (`data-theme='it-portal'`).
- **Registry Pattern:** Portals are registered in a `portal-config.ts`. Removing a portal from the config removes its routes and navigation links instantly.
- **Contract-Based Interfaces:** Modules communicate through events. For example, when "Production" marks an item clean, it emits a `PRODUCTION_STEP_COMPLETED` event. The "Transport" module listens and schedules a pickup. Neither module knows the other's code.

---

## 6. Qatar Context & Compliance
- **Address System:** Native support for "Building - Street - Zone" fields.
- **Language:** English-first codebase with i18next for Arabic (RTL) localization.
- **Payments:** Abstracted Gateway Layer for QPay/Local banks (plug-in ready).
- **Timezone:** Asia/Qatar (UTC+3) default for all scheduling.
