import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, mobile, inquiry } = body;

    if (!name || !email || !inquiry) {
      return NextResponse.json({ error: "Name, email and inquiry are required" }, { status: 400 });
    }

    const businessInquiry = await db.businessInquiry.create({
      data: {
        name,
        company,
        email,
        mobile,
        inquiry,
        status: "New",
      },
    });

    return NextResponse.json({ success: true, inquiry: businessInquiry });
  } catch (err) {
    console.error("Business inquiry error:", err);
    return NextResponse.json({ error: "Failed to save inquiry" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = status ? { status } : {};

    const inquiries = await db.businessInquiry.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ inquiries });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}