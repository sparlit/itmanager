import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerName, mobile, rating, comment } = body;

    const feedback = await db.feedback.create({
      data: {
        customerId,
        customerName,
        mobile,
        rating,
        comment,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (err) {
    console.error("Feedback error:", err);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rating = searchParams.get("rating");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = rating ? { rating: parseInt(rating) } : {};

    const feedbacks = await db.feedback.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ feedbacks });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
  }
}