# FINAL TRAINING & OPERATIONAL GUIDE (v5.0)
# Luxury Laundry ERP (Qatar)

## 1. CUSTODY HANDOVER (The Dual-Scan Protocol)
- **When:** Items move between Driver and Factory.
- **How:** Both parties must scan the Bag ID within 10 meters.
- **Incident Reporting:** If GPS drift occurs, use the "Admin Override" button (logged for audit).

## 2. OFFLINE OPERATIONS (PWA)
- **Status:** If the internet fails, the "System Health" bar turns GREY.
- **Action:** Continue scanning normally. The app uses **Encrypted IndexedDB** to store scans.
- **Sync:** Once re-connected, data is automatically buffered through Redis to PostgreSQL.

## 3. INTERNAL COMMUNICATION
- **Tool:** Real-time Inter-Dept Messenger.
- **Use Case:** "Transport <-> Customer Service" for delivery updates.
- **Notification:** Click the Bell Icon to view all alerts across WhatsApp, SMS, and In-App.

## 4. SUBSCRIPTIONS & ESG
- **Customer View:** Check the "Green Dashboard" to see water savings.
- **Staff View:** Subscription FUP limits are automatically enforced during order creation.
