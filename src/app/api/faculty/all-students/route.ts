import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // Get all enrolled students across all classrooms owned by this faculty
  const classrooms = await db.classroom.findMany({
    where: { facultyId: session.user.id },
    include: { students: { select: { id: true, name: true, email: true } } },
  })
  const studentMap: Record<string, { id: string; name: string; email: string }> = {}
  classrooms.forEach(c => c.students.forEach(s => { studentMap[s.id] = s }))

  // Also include all students in DB if no classrooms yet
  if (Object.keys(studentMap).length === 0) {
    const all = await db.user.findMany({ where: { role: "STUDENT" }, select: { id: true, name: true, email: true }, take: 60 })
    all.forEach(s => { studentMap[s.id] = s })
  }

  return NextResponse.json(Object.values(studentMap))
}
