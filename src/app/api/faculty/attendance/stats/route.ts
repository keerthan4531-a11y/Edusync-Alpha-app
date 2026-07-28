import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET: per-student attendance percentage for a slot or all slots of this faculty
export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const slotId = searchParams.get("slotId")

  // Get all slots for this faculty
  const slots = await (db as any).timetableSlot.findMany({
    where: { facultyId: session.user.id, ...(slotId ? { id: slotId } : {}), isActive: true },
    select: { id: true, subject: true, classGroup: true },
  })
  const slotIds = slots.map((s: any) => s.id)

  // Get all attendance records for these slots
  const records = await (db as any).attendanceRecord.findMany({
    where: { slotId: { in: slotIds } },
    include: { student: { select: { id: true, name: true, email: true } } },
  })

  // Group by studentId
  const statsMap: Record<string, { studentId: string; name: string; email: string; total: number; present: number }> = {}
  for (const r of records) {
    if (!statsMap[r.studentId]) {
      statsMap[r.studentId] = { studentId: r.studentId, name: r.student.name, email: r.student.email, total: 0, present: 0 }
    }
    statsMap[r.studentId].total++
    if (r.isPresent) statsMap[r.studentId].present++
  }

  const stats = Object.values(statsMap).map((s) => ({
    ...s,
    percentage: s.total > 0 ? Math.round((s.present / s.total) * 100) : 0,
  }))

  return NextResponse.json(stats)
}
