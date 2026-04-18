# B2B CORPORATE DASHBOARD SPECIFICATION
# Focus: White-Labeled Experience for High-Volume Clients (Hotels, Hospitals)

The B2B Dashboard is a dedicated web application designed to give corporate clients total transparency into their contracts, garment status, and billing.

---

## 1. VISUAL IDENTITY: "WHITE-LABEL" MODE
The B2B portal uses a **Neutral / Professional** theme (Slate & White) but dynamically injects the Client's Brand Color.
- **Client Logo:** Displayed in the Top-Left.
- **Brand Colors:** The primary buttons and chart accents match the client's corporate identity.

---

## 2. KEY MODULES & FEATURES

### A. Real-Time Order Tracking (Volume Focus)
- **Status Breakdown:** "120 Units in Wash", "45 Units Ready", "Out for Delivery".
- **Batch History:** View history of every bulk pickup and delivery.

### B. Contract & Pricing Hub
- **Tier Tracking:** Shows current volume vs. contract tier (e.g., "Silver Tier: 500kg/month reached").
- **Special Pricing:** Direct view of the agreed-upon price list for different items (Linen, Uniforms, Towels).

### C. Financials & Invoicing
- **Statement of Account (SOA):** Real-time balance view.
- **Invoice Archive:** Downloadable PDF invoices for the finance department.
- **Payment Link:** Integration for direct bank transfer or QPay.

### D. Request Center (High-Priority Support)
- **Schedule Urgent Pickup:** Special "Express" button for hotel emergencies.
- **Report Discrepancy:** Direct link to Customer Service for missing items or quality issues.

---

## 3. DATA SECURITY & ISOLATION
- **Multitenancy:** Clients can ONLY see data associated with their `B2B_ID`.
- **User Roles:** The client's "Admin" can create sub-accounts for their own Housekeeping or Finance staff.
