# UX GRAMMAR SPECIFICATION (UNIFIED UX ACROSS 15 THEMES)
# Project: Luxury Laundry ERP (Qatar)
# Purpose: Standardizing functional positions to reduce staff training friction.

To ensure that a staff member moving between the "Production" (Industrial) and "IT" (Sci-Fi) portals feels immediately familiar, we enforce a strict "UX Grammar."

---

## 1. GLOBAL LAYOUT GRID (The "Anchor" Points)

| Position | Element Name | Functional Rule |
| :--- | :--- | :--- |
| **Top-Left** | Portal Identity | Displays the Department Name (e.g., [DEPT_IT]) and current Version. |
| **Top-Center** | Global Search / Alerts | A unified search bar or critical system-wide notifications. |
| **Top-Right** | User Profile & 2FA | Quick access to profile, settings, and logout. |
| **Center-Stage** | Workhorse Area | The primary tool/table/dashboard for that specific department. |
| **Bottom-Left** | System Health | Real-time connectivity status and last database sync timestamp. |
| **Bottom-Right** | Primary Action Button | The most important button for the current view (e.g., "Confirm Scan", "Save Invoice"). |

---

## 2. COMPONENT SEMANTICS (Consistent Visual Language)

Even if the color changes (Green for IT, Orange for Sales), the **Icons** and **Behaviors** remain identical:

- **Primary Action Icon:** `Lucide: ChevronRight` or `Lucide: CheckCircle`.
- **Destructive Action Icon:** `Lucide: Trash2` or `Lucide: AlertTriangle`. Always triggers a confirmation modal.
- **Help/Docs Icon:** `Lucide: Info` or `Lucide: LifeBuoy`. Always opens a sidebar with FOSS documentation.
- **Loading State:** A consistent "Pulse" animation rather than a spinning wheel to feel more "Modern/Luxury."

---

## 3. FEEDBACK & ALERT SYSTEM

- **Success Notifications:** Slide in from the **Top-Center**. Sound: "Soft chime."
- **Critical Errors:** Modal overlay in the center of the screen. Sound: "Deep buzz."
- **Status Updates:** Subtle change in the "System Health" indicator (Bottom-Left).

---

## 4. MOBILE & PWA ADAPTATION (Production/Transport)

- **Thumb Zone:** Primary actions shift to a large, center-bottom "Action Bar" for one-handed operation by drivers and factory workers.
- **Offline Indicator:** When internet is lost, the "System Health" (Bottom-Left) turns Grey with a "Sync Pending" count.
