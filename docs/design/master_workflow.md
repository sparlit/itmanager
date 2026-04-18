# MASTER DEPARTMENTAL WORKFLOW & DATA ORCHESTRATION
# Project: Luxury Laundry ERP (Qatar)
# Focus: How the 15 "Standalone-Style" Applications Communicate

While each portal has a unique visual shell, the underlying data must flow seamlessly to ensure 100% operational efficiency. This document defines the "Data Life-Cycle" of a single garment as it moves through the Qatari ecosystem.

---

## 1. THE TRANSACTIONAL CORE (The Order Lifecycle)

### Stage 1: Acquisition (Sales & Marketing -> Public Portal)
- **Marketing Portal:** Launches a "Luxury Winter Care" campaign with a 15% discount code.
- **Sales Portal:** Onboards a new B2B contract for "The Pearl Ritz-Carlton".
- **Public Portal:** A customer uses the discount code and pins their location in West Bay.
- **DATA ACTION:** A new `Order` is created in the PostgreSQL database with status `PENDING`.

### Stage 2: Logistics (Transport -> Operations)
- **Transport Portal:** The AI Route Optimizer detects the new order in Zone 66. It assigns "Driver 04" and pushes the task to their mobile view.
- **Driver:** Picks up items, scans them at the doorstep.
- **DATA ACTION:** `Order` status updates to `PICKED_UP`. Timestamp and Driver ID are logged.

### Stage 3: Intake & Sorting (Operations -> Production)
- **Operations Portal:** Receives notification that Batch #2025-A is arriving. Allocates Washer #02.
- **Production Portal:** Staff at the scanning station check items in. They see specific "Sales" notes for the B2B client (e.g., "Use Premium Scent").
- **DATA ACTION:** `Order` status updates to `IN_FACTORY`.

### Stage 4: Processing (Production -> Maintenance)
- **Production Portal:** Staff marks the wash cycle complete.
- **Maintenance Portal:** System tracks "Run-Hours" for Washer #02. If it hits 500 hours, an alert is triggered in the Maintenance portal for a filter change.
- **DATA ACTION:** `Order` status updates to `WASHING` -> `DRYING` -> `IRONING`.

### Stage 5: Quality & Finance (Production -> Finance)
- **Production Portal:** Final QC check is passed. Staff bags the items and places them on "Rack B-12".
- **Finance Portal:** Triggers the final invoice. For QPay orders, it verifies payment. For Cash orders, it sets the `PaymentStatus` to `DUE_ON_DELIVERY`.
- **DATA ACTION:** `Order` status updates to `READY_FOR_DELIVERY`.

### Stage 6: Completion (Transport -> Customer Service)
- **Transport Portal:** Driver 04 picks up the "Ready" batch. Navigator guides them back to West Bay.
- **Customer Service Portal:** If the customer is not home, the agent uses the "Reschedule" tool to move the delivery slot.
- **Public Portal:** Customer receives a WhatsApp/SMS: "Your Pristine Garments have been delivered!"
- **DATA ACTION:** `Order` status updates to `DELIVERED`.

---

## 2. THE SUPPORTING CORE (Infrastructure)

### IT -> Security -> Admin
- **IT Portal:** Monitors for brute-force attempts on the Admin login.
- **Security Portal:** Receives a "Cyber Alert" if the IT system detects suspicious IP activity from outside Qatar.
- **Admin Portal:** CEO reviews the "Daily Audit Log" to see which staff member authorized a 50% refund in the Customer Service portal.

### HR -> Finance -> Communications
- **HR Portal:** Logs "Staff Overtime" for the factory team during a busy Eid holiday.
- **Finance Portal:** Automatically calculates the overtime bonus in the next payroll run.
- **Communications Portal:** Sends a "Job Well Done" announcement to the internal company feed.

---

## 3. PLUG-AND-PLAY INTEGRATION ARCHITECTURE
To maintain the "Zero Effect" rule when adding or removing portals:
1.  **Shared Database Schema:** All portals use the same `schema.prisma` but filtered views.
2.  **Event-Driven Communication:** Portals do not call each other's APIs directly. They update a status in the DB, and the "Target Portal" (which is listening to that status) reacts.
3.  **Visual Sandboxing:** Each portal's CSS is scoped to a specific ID (e.g., `#it-portal-root`) so styles never "leak" between departments.
