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
  if (!slotId) return NextResponse.json({ error: "slotId is required" }, { status: 400 })

  const slot = await (db as any).timetableSlot.findFirst({ where: { id: slotId, facultyId: session.user.id } })
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 })

  // Get students from classrooms of this faculty that match the slot's class group
  const classrooms = await db.classroom.findMany({
    where: { facultyId: session.user.id },
    include: { students: { select: { id: true, name: true, email: true } } },
  })

  const studentMap: Record<string, { id: string; name: string; email: string }> = {}
  classrooms.forEach(c => c.students.forEach(s => { studentMap[s.id] = s }))

  // Also fetch students who have attended this slot before
  const prevAttendance = await (db as any).attendanceRecord.findMany({
    where: { slotId },
    include: { student: { select: { id: true, name: true, email: true } } },
    distinct: ["studentId"],
  })
  prevAttendance.forEach((r: any) => { if (r.student) studentMap[r.student.id] = r.student })

  return NextResponse.json(Object.values(studentMap))
}
