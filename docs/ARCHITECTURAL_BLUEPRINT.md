# Architectural Blueprint: World-Class Integrated Enterprise System
## Project: Qatar Laundry & Dry Cleaning Excellence (Top 0.01% Standard)

## 1. Executive Summary
This document outlines the architectural vision for a unified, high-performance ecosystem serving as the digital backbone for a premier laundry and dry cleaning enterprise in Qatar. The system integrates a high-conversion public-facing portal with a comprehensive 15+ department ERP, all powered by a single centralized database and a 100% Free and Open Source Software (FOSS) tech stack.

---

## 2. Core Architectural Pillars
To achieve the **top 0.01% global standard**, the system is built on four pillars:
1.  **Extreme Performance:** <100ms Time-to-Interactive (TTI) via Next.js App Router and optimized server-side rendering.
2.  **Uncompromising Security:** Multi-Factor Authentication (MFA), Field-Level Encryption (AES-256), and Qatar Personal Data Privacy Protection Law compliance.
3.  **Seamless Integration:** A "Federated Monorepo" allowing shared logic while maintaining department-specific isolation and distinct visual identities.
4.  **Operational Resilience:** Offline-first PWA capabilities for logistics and production, ensuring continuity during connectivity drops.

---

## 3. Technology Stack (100% FOSS)
| Layer | Technology | Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 15 (MIT) | React Server Components (RSC) for performance; partial prerendering. |
| **State Management** | Zustand (MIT) | Lightweight, high-performance client state. |
| **Data Fetching** | TanStack Query (MIT) | Efficient server-state synchronization and caching. |
| **Styling & UI** | Tailwind CSS (MIT) | Utility-first for rapid development and consistent design. |
| **Backend/ORM** | Prisma (Apache 2.0) | Type-safe database access with PostgreSQL. |
| **Primary Database** | PostgreSQL | Robust, scalable, and open-source relational database. |
| **Message Broker** | Valkey / KeyDB (FOSS) | High-performance FOSS alternatives to Redis for caching. |
| **AI/Vision** | YOLOv8 (AGPL) | Open-source item counting and quality control. |
| **Deployment** | Docker + Linux (Ubuntu/Debian) | 100% FOSS hosting environment on standard VPS. |

---

## 4. Three-Tier Login System
To maintain strict security and visual separation, the system utilizes three distinct login stages:

### 4.1 Stage 1: Public E-Commerce Login
- **URL:** `auth.pristinelaundry.qa/login`
- **Visuals:** Soft gradients, lifestyle photography, friendly typography (Inter/Lexend).
- **Features:** OTP mobile login, Social Auth (Google/Apple), guest checkout.
- **Context:** Optimized for speed and low friction to maximize conversion.

### 4.2 Stage 2: Internal Department Portal Login
- **URL:** `internal.pristinelaundry.qa/login`
- **Visuals:** Structured, corporate, high-contrast, professional (Roboto/Work Sans).
- **Features:** Corporate SSO, TOTP Multi-Factor Authentication, Role-based landing.
- **Context:** Focuses on security and operational readiness.

### 4.3 Stage 3: Super Admin Command Center Login
- **URL:** `admin.pristinelaundry.qa/login`
- **Visuals:** Dark mode by default, high-density, terminal-like precision (JetBrains Mono).
- **Features:** Hardware Security Key (WebAuthn), IP Whitelisting, Emergency Access protocols.
- **Context:** Highest security tier for full system orchestration.

---

## 5. Departmental Workflow Specifications (15+ Departments)
(Refer to `docs/DEPARTMENTAL_MODULES.md` for full module breakdown)

---

## 6. Database & Data Architecture
- **Centralized PostgreSQL:** Single source of truth with strict schema versioning.
- **Row-Level Security (RLS):** Implemented via Prisma middleware or DB policies to ensure department-level data isolation.
- **Audit Logging:** Immutable logs capturing every data mutation (Who, When, What, Old Value, New Value).
- **Localization:** Native RTL support for Arabic; Dual-calendar support (Gregorian/Hijri).

---

## 7. Quality Assurance & Performance
- **Lighthouse Goals:** 100/100/100/100 for all public pages.
- **Security:** OWASP Top 10 compliance; regular automated penetration testing.
- **Scalability:** Horizontal scaling via Docker Swarm or Kubernetes (FOSS orchestration).
