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
  const groups = await (db as any).mentorGroup.findMany({
    where: { mentorId: session.user.id },
    include: {
      student: {
        select: {
          id: true, name: true, email: true, xp: true, level: true, currentStreak: true,
          studentProfile: { select: { rollNumber: true, semester: true, batch: true, classId: true, status: true } },
          enrolledClassrooms: { select: { id: true, name: true } },
          assignmentSubmissions: { select: { id: true, grade: true, status: true } },
        }
      }
    },
  })

  // Attach attendance % for each mentee
  const mentees = await Promise.all(groups.map(async (g: any) => {
    const attendance = await (db as any).attendanceRecord.findMany({
      where: { studentId: g.student.id },
    })
    const total = attendance.length
    const present = attendance.filter((a: any) => a.isPresent).length
    const attendancePercent = total > 0 ? Math.round((present / total) * 100) : null

    const sessions = await (db as any).counselingSession.findMany({
      where: { facultyId: session.user.id, studentId: g.student.id },
      orderBy: { createdAt: "desc" },
      take: 3,
    })

    return { ...g.student, attendancePercent, counselingSessions: sessions }
  }))

  return NextResponse.json(mentees)
}
