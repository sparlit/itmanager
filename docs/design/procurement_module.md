# PROCUREMENT & CONSUMABLES MODULE DESIGN
# Purpose: Closing the "Inventory Loop-Hole"

This module manages the industrial supplies required to keep the laundry factory running. It integrates directly with the Operations and Maintenance portals.

---

## 1. DATA MODEL (Prisma Enhancement)

```prisma
model Consumable {
  id          String   @id @default(uuid())
  name        String   // e.g., "Industrial Detergent Alpha"
  category    String   // e.g., "Chemicals", "Packaging", "Tools"
  currentStock Float   // in kg, liters, or units
  minStockLevel Float  // The "Low Stock" trigger point
  unit        String   // e.g., "Liters"
  lastRestock  DateTime
  supplierId  String
  logs        InventoryLog[]
}

model InventoryLog {
  id          String   @id @default(uuid())
  consumableId String
  action      String   // "USE", "RESTOCK", "WASTE"
  quantity    Float
  performedBy String   // Staff ID
  createdAt   DateTime @default(now())
}
```

---

## 2. PORTAL INTEGRATIONS

### Operations Integration
- When a Wash Cycle is completed in the Operations portal, the system automatically decrements the estimated chemical usage (e.g., 500ml of Detergent) from the `currentStock`.

### Maintenance Integration
- The Maintenance portal displays a "Supply Status" widget.
- **Red Alert:** Triggered if `currentStock < minStockLevel`.

### Finance Integration
- Generates a "Purchase Requisition" automatically when stock is low, which appears in the Finance portal for approval.

---

## 3. INVENTORY AI AGENT (FOSS)
- **Predictive Restock Agent:** Analyzes the last 3 months of order volume to predict exactly when a chemical will run out, adjusting for seasonal peaks in Qatar (e.g., Eid holidays).
