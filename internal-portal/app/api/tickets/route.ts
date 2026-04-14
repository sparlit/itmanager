import { NextResponse } from 'next/server'
import { prisma } from '../../../prisma/client'

export async function GET() {
  // DB-backed tickets; seeds will populate
  const tickets = await prisma.ticket.findMany()
  return NextResponse.json(tickets)
}
