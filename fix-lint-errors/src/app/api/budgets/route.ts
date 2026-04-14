import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};
    if (department && department !== "All") where.department = department;
    if (status && status !== "All") where.status = status;

    const budgets = await db.budget.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const totalBudget = budgets.reduce((sum, b) => sum + b.totalBudget, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);

    return NextResponse.json({ budgets, totalBudget, totalSpent });
  } catch {
    return NextResponse.json({ error: "Failed to fetch budgets", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const budget = await db.budget.create({
      data: {
        name: body.name,
        department: body.department,
        fiscalYear: body.fiscalYear || new Date().getFullYear(),
        totalBudget: body.totalBudget || 0,
        spent: body.spent || 0,
        category: body.category || "General",
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        status: body.status || "Active",
        notes: body.notes || "",
      },
    });
    return NextResponse.json({ budget }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create budget", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.fiscalYear !== undefined) updateData.fiscalYear = data.fiscalYear;
    if (data.totalBudget !== undefined) updateData.totalBudget = data.totalBudget;
    if (data.spent !== undefined) updateData.spent = data.spent;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const budget = await db.budget.update({ where: { id }, data: updateData });
    return NextResponse.json({ budget });
  } catch {
    return NextResponse.json({ error: "Failed to update budget", details: "An internal error occurred" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    await db.budget.delete({ where: { id: body.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete budget", details: "An internal error occurred" }, { status: 500 });
  }
}
