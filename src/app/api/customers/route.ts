import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      firstName, lastName, email, mobile, landline, whatsapp,
      fullAddress, area, building, villaNo, landmark, latitude, longitude, notes
    } = body;

    if (!firstName || !lastName || !mobile || !fullAddress || !area) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingCustomer = await db.customer.findFirst({
      where: {
        OR: [
          { mobile },
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: "Customer already exists", customerId: existingCustomer.id },
        { status: 409 }
      );
    }

    const customer = await db.customer.create({
      data: {
        firstName,
        lastName,
        email,
        mobile,
        landline,
        whatsapp,
        fullAddress,
        area,
        building,
        villaNo,
        landmark,
        latitude,
        longitude,
        notes,
      },
    });

    return NextResponse.json({ 
      success: true, 
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        mobile: customer.mobile,
        email: customer.email,
      }
    });
  } catch (err) {
    console.error("Customer registration error:", err);
    return NextResponse.json(
      { error: "Failed to register customer" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mobile = searchParams.get("mobile");
    const email = searchParams.get("email");

    if (!mobile && !email) {
      return NextResponse.json({ error: "Provide mobile or email" }, { status: 400 });
    }

    const customer = await db.customer.findFirst({
      where: {
        OR: [
          ...(mobile ? [{ mobile }] : []),
          ...(email ? [{ email }] : [])
        ]
      }
    });

    if (!customer) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({
      exists: true,
      customer: {
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        mobile: customer.mobile,
        email: customer.email,
        area: customer.area,
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to check customer" }, { status: 500 });
  }
}