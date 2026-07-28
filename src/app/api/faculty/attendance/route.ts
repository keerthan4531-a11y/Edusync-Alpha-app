import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET: fetch attendance for a slot+date
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const slotId = searchParams.get("slotId")
  const date = searchParams.get("date")
  if (!slotId || !date) {
    return NextResponse.json({ error: "slotId and date are required" }, { status: 400 })
  }
  // Verify slot belongs to this faculty
  const slot = await (db as any).timetableSlot.findFirst({ where: { id: slotId, facultyId: session.user.id } })
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 })

  const records = await (db as any).attendanceRecord.findMany({
    where: { slotId, date },
    include: { student: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(records)
}

// POST: batch save attendance records
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { slotId, date, attendance } = await req.json()
  // attendance: Array<{ studentId: string, isPresent: boolean }>
  if (!slotId || !date || !Array.isArray(attendance)) {
    return NextResponse.json({ error: "slotId, date and attendance[] are required" }, { status: 400 })
  }
  const slot = await (db as any).timetableSlot.findFirst({ where: { id: slotId, facultyId: session.user.id } })
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 })

  // Batch upsert
  const results = await Promise.all(
    attendance.map(({ studentId, isPresent }: { studentId: string; isPresent: boolean }) =>
      (db as any).attendanceRecord.upsert({
        where: { slotId_studentId_date: { slotId, studentId, date } },
        create: { slotId, studentId, date, isPresent },
        update: { isPresent },
      })
    )
  )
  return NextResponse.json({ saved: results.length })
}
