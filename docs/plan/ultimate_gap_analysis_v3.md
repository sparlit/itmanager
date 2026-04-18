# ULTIMATE GAP ANALYSIS & MITIGATION STRATEGY (V3)
# Project: Luxury Laundry ERP (Qatar)

Following the identification of critical gaps (Disaster Recovery, WhatsApp, Claims, MFA, Hijri, CI/CD), we must now audit for the "Final Frontier" of project risks.

---

## 1. THE MISSING PIECES (Final Frontier)

### A. Staff Biometric Sync (The Attendance Gap)
- **The Gap:** We have an HR Portal, but manual attendance is prone to "buddy punching."
- **The Loophole:** If staff are not physically present, factory throughput drops.
- **The Patch:** Integrate FOSS biometric API (Fingerprint/Face) abstraction to sync with the HR Shift Planner.

### B. Dynamic Utility Pricing (The Margin Gap)
- **The Gap:** Electricity and Water costs in Qatar are high. If prices rise, static laundry prices eat the margin.
- **The Patch:** Integrate a "Utility Cost Tracker" in the Finance portal that recommends price adjustments based on factory consumption data.

---

## 2. REFINED LOOP-HOLES & BOTTLENECKS

### A. WhatsApp API "Message Template" Bottleneck
- **The Loophole:** Meta/WhatsApp requires pre-approval for templates. If an order status changes to a state without an approved template, notification fails.
- **The Patch:** Implement a "Template Fallback" system that defaults to SMS if the WhatsApp message is rejected by the provider.

### B. Hijri Sync Bottleneck
- **The Loophole:** Hijri dates can vary by 1 day depending on moon sighting.
- **The Patch:** Use an API-fed "Qatari Official Hijri Calendar" rather than just a static mathematical conversion to ensure alignment with local holidays.

---

## 3. UPDATED ARCHITECTURAL IMPROVEMENTS

1.  **Disaster Recovery:** Use **WAL-G** to push continuous PostgreSQL WAL segments to a self-hosted **MinIO** cluster. This allows "Point-In-Time Recovery" to the exact second of a crash.
2.  **TOTP MFA:** Enforce mandatory Google Authenticator/Authy setup for any user with `ADMIN`, `FINANCE`, or `HR` roles.
3.  **Proof of Attempt:** Drivers must upload a photo + GPS coordinate to "close" a failed delivery task. This becomes non-refutable evidence for Customer Service.
4.  **Claims Ledger:** A "Dispute Model" where every claim is linked to the `OrderItem` ID, ensuring we know exactly which washer or dryer was used for that item.
5.  **CI/CD Pipeline:** Standardized GitHub Action:
    - `Lint & Typecheck` -> `Vitest` -> `Build Docker Image` -> `Push to Private Registry` -> `Auto-Deploy to Ubuntu VPS`.
