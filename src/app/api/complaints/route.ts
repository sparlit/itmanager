import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerName, mobile, complaintType, details } = body;

    const referenceNo = `COMP-${Date.now().toString().slice(-6)}`;

    const complaint = await db.complaint.create({
      data: {
        customerId,
        customerName,
        mobile,
        complaintType,
        details,
        referenceNo,
        status: "Open",
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (err) {
    console.error("Complaint error:", err);
    return NextResponse.json({ error: "Failed to register complaint" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");
    const referenceNo = searchParams.get("referenceNo");

    const where = mobile ? { mobile } : referenceNo ? { referenceNo } : {};

    const complaints = await db.complaint.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ complaints });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}