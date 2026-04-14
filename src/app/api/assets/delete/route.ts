import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Asset ID is required" },
        { status: 400 }
      );
    }

    // Delete related records first
    await db.maintenanceRecord.deleteMany({ where: { assetId: id } });
    await db.assetAssignment.deleteMany({ where: { assetId: id } });
    await db.asset.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete asset", details: "An internal error occurred" },
      { status: 500 }
    );
  }
}
