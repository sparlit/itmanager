# RAMADAN LOAD SIMULATION & CHAOS ENGINEERING
# Project: Luxury Laundry ERP (Qatar)
# Strategy: Simulate 3x Traffic Spikes during Iftar/Suhoor

## 1. LOAD INJECTION (The "Iftar Rush")
- **Scenario:** 500 orders placed simultaneously at 19:00 (Sunset).
- **Target:** Verify Redis Write-Buffer performance and Rate Limiting.
- **Script (FOSS: k6):**
  ```javascript
  import http from 'k6/http';
  export let options = { vus: 100, duration: '1m' };
  export default function() {
    http.post('https://api.laundry.qa/v1/order/schedule', {
      branch_id: 'WEST_BAY_01',
      pickup_zone: '66'
    });
  }
  ```

## 2. INFRASTRUCTURE CHAOS (High-Rise Sync Failures)
- **Scenario:** Database latency increased to 5s to simulate poor cellular in West Bay towers.
- **Target:** Verify IndexedDB 'Offline-First' retry logic and CRDT consistency.

## 3. STAFF SANDBOX PROTOCOL
- **Rule:** Every new hire must complete 5 simulated orders in 'Sandbox Mode' before the Production Portal authorizes their staff ID for the live DB.
