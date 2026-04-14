// POST /api/inventory/batch - Create a batch transaction with multiple line items
// Supports: Receipt, Issue, Transfer, CheckIn, CheckOut, Adjustment
// Creates a TransactionBatch header + multiple InventoryTransaction records
// All line items share the same batch number, date, time, requested by, etc.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = ["CheckIn", "CheckOut", "Adjustment", "Receipt", "Issue", "Transfer"];

const TYPE_PREFIXES: Record<string, string> = {
  Receipt: "RCV",
  Issue: "ISS",
  Transfer: "TRF",
  CheckIn: "CIN",
  CheckOut: "COT",
  Adjustment: "ADJ",
};

async function generateBatchNumber(type: string): Promise<string> {
  const prefix = TYPE_PREFIXES[type] || "TXN";
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const lastBatch = await db.transactionBatch.findFirst({
    where: {
      batchNumber: { startsWith: `${prefix}-${dateStr}` },
    },
    orderBy: { createdAt: "desc" },
  });

  let seq = 1;
  if (lastBatch && lastBatch.batchNumber) {
    const parts = lastBatch.batchNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      seq = lastSeq + 1;
    }
  }

  return `${prefix}-${dateStr}-${String(seq).padStart(4, "0")}`;
}

async function generateLineNumber(batchNumber: string, lineIndex: number): Promise<string> {
  // Generate individual line transaction number: BATCH-0001, BATCH-0002, etc.
  return `${batchNumber}-L${String(lineIndex + 1).padStart(3, "0")}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      transactionDate,
      transactionTime,
      requestedBy,
      department,
      authorisedBy,
      fromLocation,
      toLocation,
      supplierRef,
      deliveryNote,
      purpose,
      notes,
      lineItems,
      performedBy,
    } = body;

    // Validate
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    if (!lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required" },
        { status: 400 }
      );
    }

    if (lineItems.length > 50) {
      return NextResponse.json(
        { error: "Maximum 50 line items per batch" },
        { status: 400 }
      );
    }

    // Validate each line item
    for (let i = 0; i < lineItems.length; i++) {
      const line = lineItems[i];
      if (!line.itemId) {
        return NextResponse.json(
          { error: `Line ${i + 1}: itemId is required` },
          { status: 400 }
        );
      }
      if (!line.quantity || line.quantity < 1) {
        return NextResponse.json(
          { error: `Line ${i + 1}: quantity must be at least 1` },
          { status: 400 }
        );
      }
    }

    // Generate batch number
    const batchNumber = await generateBatchNumber(type);

    // Auto-set date/time if not provided
    const now = new Date();
    const txnDate = transactionDate || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const txnTime = transactionTime || `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Calculate totals
    const totalItems = lineItems.length;
    let totalValue = 0;

    // Fetch all items for validation
    const itemIds = lineItems.map((l: { itemId: string }) => l.itemId);
    const items = await db.inventoryItem.findMany({
      where: { id: { in: itemIds } },
    });

    const itemMap = new Map(items.map((i) => [i.id, i]));

    // Validate stock for issue/checkout types
    for (let i = 0; i < lineItems.length; i++) {
      const line = lineItems[i];
      const item = itemMap.get(line.itemId);
      if (!item) {
        return NextResponse.json(
          { error: `Line ${i + 1}: Inventory item not found` },
          { status: 404 }
        );
      }
      if ((type === "Issue" || type === "CheckOut" || type === "Transfer") && item.quantity < line.quantity) {
        return NextResponse.json(
          { error: `Line ${i + 1} (${item.name}): Insufficient stock. Current: ${item.quantity}, Requested: ${line.quantity}` },
          { status: 400 }
        );
      }
      const price = (type === "Receipt" || type === "CheckIn")
        ? (line.unitPrice ?? item.unitPrice ?? 0)
        : 0;
      totalValue += price * line.quantity;
    }

    // Perform database transaction
    const results = await db.$transaction(async (tx) => {
      // Create batch header
      const batch = await tx.transactionBatch.create({
        data: {
          batchNumber,
          type,
          transactionDate: txnDate,
          transactionTime: txnTime,
          requestedBy: requestedBy || "",
          department: department || "",
          authorisedBy: authorisedBy || "",
          fromLocation: fromLocation || "",
          toLocation: toLocation || "",
          supplierRef: supplierRef || "",
          deliveryNote: deliveryNote || "",
          purpose: purpose || "",
          notes: notes || "",
          totalItems,
          totalValue,
          status: "Completed",
        },
      });

      // Process each line item
      const transactions: Awaited<ReturnType<typeof tx.inventoryTransaction.create>>[] = [];
      for (let i = 0; i < lineItems.length; i++) {
        const line = lineItems[i];
        const item = itemMap.get(line.itemId)!;
        const price = (type === "Receipt" || type === "CheckIn")
          ? (line.unitPrice ?? item.unitPrice ?? 0)
          : 0;
        const lineTotal = price * line.quantity;
        const lineTxnNumber = await generateLineNumber(batchNumber, i);

        // Calculate new quantity
        let newQuantity = item.quantity;
        let newLocation = item.location || "";

        if (type === "CheckIn" || type === "Receipt") {
          newQuantity += line.quantity;
          if (type === "Receipt" && toLocation) newLocation = toLocation;
        } else if (type === "CheckOut" || type === "Issue") {
          newQuantity -= line.quantity;
        } else if (type === "Adjustment") {
          newQuantity = line.quantity;
        } else if (type === "Transfer") {
          if (toLocation) newLocation = toLocation;
        }

        // Update item quantity
        await tx.inventoryItem.update({
          where: { id: line.itemId },
          data: {
            quantity: newQuantity,
            location: newLocation,
            lastRestocked:
              type === "CheckIn" || type === "Receipt" ? new Date() : item.lastRestocked,
          },
        });

        // Create transaction record
        const transaction = await tx.inventoryTransaction.create({
          data: {
            itemId: line.itemId,
            batchId: batch.id,
            type,
            quantity: line.quantity,
            performedBy: performedBy || authorisedBy || requestedBy || "IT Staff",
            notes: line.notes || notes || null,
            transactionNumber: lineTxnNumber,
            transactionDate: txnDate,
            transactionTime: txnTime,
            requestedBy: requestedBy || "",
            authorisedBy: authorisedBy || "",
            itemCode: item.sku || "",
            itemDescription: item.name || "",
            unitPrice: price,
            totalValue: lineTotal,
            fromLocation: fromLocation || item.location || "",
            toLocation: toLocation || "",
            supplierRef: supplierRef || "",
            deliveryNote: deliveryNote || "",
            purpose: purpose || "",
            issuedTo: type === "Issue" ? requestedBy || "" : "",
            issuedToDepartment: type === "Issue" ? department || "" : "",
          },
        });

        transactions.push(transaction);
      }

      return { batch, transactions };
    });

    return NextResponse.json(results, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create batch transaction", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}

// GET /api/inventory/batch - List all batch transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { batchNumber: { contains: search } },
        { requestedBy: { contains: search } },
        { department: { contains: search } },
        { authorisedBy: { contains: search } },
      ];
    }

    const batches = await db.transactionBatch.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        transactions: {
          include: {
            item: {
              select: { name: true, sku: true, category: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ batches });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch batch transactions", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
