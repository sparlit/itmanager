import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerId, serviceType, totalAmount, pickupDate, pickupTime, 
      pickupAddress, notes, items, customerName, customerMobile
    } = body;

    let finalCustomerId = customerId;

    if (!customerId && customerMobile) {
      const existingCustomer = await db.customer.findUnique({
        where: { mobile: customerMobile }
      });

      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        const newCustomer = await db.customer.create({
          data: {
            firstName: customerName?.split(" ")[0] || "Customer",
            lastName: customerName?.split(" ").slice(1).join(" ") || "",
            mobile: customerMobile,
            fullAddress: pickupAddress,
            area: "Unknown",
          }
        });
        finalCustomerId = newCustomer.id;
      }
    }

    if (!finalCustomerId) {
      return NextResponse.json(
        { error: "Customer required" },
        { status: 400 }
      );
    }

    const order = await db.laundryOrder.create({
      data: {
        customerId: finalCustomerId,
        serviceType,
        totalAmount,
        pickupDate,
        pickupTime,
        pickupAddress,
        notes,
        items: items || [],
        status: "Pending",
      },
      include: {
        customer: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      }
    });
  } catch (err) {
    console.error("Order save error:", err);
    return NextResponse.json(
      { error: "Failed to save order" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const mobile = searchParams.get("mobile");
    const orderId = searchParams.get("orderId");

    const where = orderId
      ? { id: orderId }
      : customerId
        ? { customerId }
        : mobile
          ? { customer: { mobile } }
          : {};

    const orders = await db.laundryOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        customer: true
      }
    });

    return NextResponse.json({ orders });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
