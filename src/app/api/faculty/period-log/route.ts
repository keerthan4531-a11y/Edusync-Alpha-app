import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const slotId = searchParams.get("slotId")
  const logs = await (db as any).periodTopicLog.findMany({
    where: { facultyId: session.user.id, ...(slotId ? { slotId } : {}) },
    include: { slot: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { slotId, date, topicCovered, notes } = await req.json()
  if (!slotId || !date || !topicCovered) {
    return NextResponse.json({ error: "slotId, date and topicCovered are required" }, { status: 400 })
  }
  // Verify slot belongs to this faculty
  const slot = await (db as any).timetableSlot.findFirst({ where: { id: slotId, facultyId: session.user.id } })
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 })

  const log = await (db as any).periodTopicLog.create({
    data: { slotId, facultyId: session.user.id, date, topicCovered, notes: notes || null },
  })
  return NextResponse.json(log)
}
