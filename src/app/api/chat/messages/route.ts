import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, isFromBot, flow, customerId, customerName, mobile } = body;

    const chatMessage = await db.chatMessage.create({
      data: {
        message,
        isFromBot,
        flow,
        customerId,
        customerName,
        mobile,
        sessionId: request.headers.get("x-session-id") || `session_${Date.now()}`,
      },
    });

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (err) {
    console.error("Chat message error:", err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");
    const sessionId = searchParams.get("sessionId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where = mobile ? { mobile } : sessionId ? { sessionId } : {};

    const messages = await db.chatMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ messages: messages.reverse() });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}