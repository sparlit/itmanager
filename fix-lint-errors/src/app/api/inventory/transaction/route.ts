// POST /api/inventory/transaction - Create an inventory transaction
// Supports: CheckIn, CheckOut, Adjustment, Receipt, Issue, Transfer
// Updates the inventory item quantity and creates a transaction record
// Auto-generates sequential transaction numbers

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const itemId = searchParams.get("itemId");
    const limit = parseInt(searchParams.get("limit") || "100");

    const where: Record<string, unknown> = {};
    if (itemId) where.itemId = itemId;

    const transactions = await db.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ transactions });
  } catch {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

const VALID_TYPES = ["CheckIn", "CheckOut", "Adjustment", "Receipt", "Issue", "Transfer"];

const TYPE_PREFIXES: Record<string, string> = {
  Receipt: "RCV",
  Issue: "ISS",
  Transfer: "TRF",
  CheckIn: "CIN",
  CheckOut: "COT",
  Adjustment: "ADJ",
};

async function generateTransactionNumber(type: string): Promise<string> {
  const prefix = TYPE_PREFIXES[type] || "TXN";
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  // Find the last transaction with this prefix for today
  const lastTxn = await db.inventoryTransaction.findFirst({
    where: {
      transactionNumber: { startsWith: `${prefix}-${dateStr}` },
    },
    orderBy: { createdAt: "desc" },
  });

  let seq = 1;
  if (lastTxn && lastTxn.transactionNumber) {
    const parts = lastTxn.transactionNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `${prefix}-${dateStr}-${String(seq).padStart(4, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      itemId,
      type,
      quantity,
      performedBy,
      notes,
      referenceNo,
      fromLocation,
      toLocation,
      issuedTo,
      issuedToDepartment,
      supplierRef,
      deliveryNote,
      purpose,
      transactionNumber: providedTxnNumber,
      transactionDate,
      transactionTime,
      requestedBy,
      authorisedBy,
      itemCode,
      itemDescription,
      unitPrice,
      totalValue,
    } = body;

    if (!itemId || !type || quantity == null || !performedBy) {
      return NextResponse.json(
        { error: "itemId, type, quantity, and performedBy are required" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // Get current item
    const item = await db.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
      );
    }

    // Calculate new quantity based on transaction type
    let newQuantity = item.quantity;
    let newLocation = item.location || "";

    if (type === "CheckIn" || type === "Receipt") {
      newQuantity += quantity;
      if (type === "Receipt" && toLocation) {
        newLocation = toLocation;
      }
    } else if (type === "CheckOut" || type === "Issue") {
      if (newQuantity < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock. Current: ${item.quantity}, Requested: ${quantity}`,
          },
          { status: 400 }
        );
      }
      newQuantity -= quantity;
    } else if (type === "Adjustment") {
      newQuantity = quantity;
    } else if (type === "Transfer") {
      if (toLocation) {
        newLocation = toLocation;
      }
      if (newQuantity < quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for transfer. Current: ${item.quantity}, Requested: ${quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Auto-generate transaction number if not provided
    const txnNumber = providedTxnNumber || await generateTransactionNumber(type);

    // Auto-set date/time if not provided
    const now = new Date();
    const txnDate = transactionDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const txnTime = transactionTime || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Auto-fill item code/description if not provided
    const code = itemCode || item.sku || "";
    const desc = itemDescription || item.name || "";
    const price = unitPrice ?? item.unitPrice ?? 0;
    const total = totalValue ?? (price * quantity);

    // Update item and create transaction in a single database transaction
    const [updatedItem, transaction] = await db.$transaction([
      db.inventoryItem.update({
        where: { id: itemId },
        data: {
          quantity: newQuantity,
          location: newLocation,
          lastRestocked:
            type === "CheckIn" || type === "Receipt" ? new Date() : item.lastRestocked,
        },
      }),
      db.inventoryTransaction.create({
        data: {
          itemId,
          type,
          quantity,
          performedBy,
          notes: notes || null,
          referenceNo: referenceNo || "",
          fromLocation: fromLocation || item.location || "",
          toLocation: toLocation || "",
          issuedTo: issuedTo || "",
          issuedToDepartment: issuedToDepartment || "",
          supplierRef: supplierRef || "",
          deliveryNote: deliveryNote || "",
          purpose: purpose || "",
          transactionNumber: txnNumber,
          transactionDate: txnDate,
          transactionTime: txnTime,
          requestedBy: requestedBy || "",
          authorisedBy: authorisedBy || "",
          itemCode: code,
          itemDescription: desc,
          unitPrice: price,
          totalValue: total,
        },
      }),
    ]);

    return NextResponse.json({ transaction, updatedItem }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create transaction", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
