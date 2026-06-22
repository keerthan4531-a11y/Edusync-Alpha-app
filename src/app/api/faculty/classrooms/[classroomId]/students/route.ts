import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId } = await params
    const { email } = await req.json()

    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Student email is required." }, { status: 400 })
    }

    // Verify ownership
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    // Find student
    const student = await db.user.findFirst({
      where: { email: email.trim(), role: "STUDENT" },
    })

    if (!student) {
      return NextResponse.json({ error: "Student with this email address was not found." }, { status: 404 })
    }

    // Add student to classroom
    await db.classroom.update({
      where: { id: classroomId },
      data: {
        students: {
          connect: { id: student.id },
        },
      },
    })

    return NextResponse.json({ success: true, student: { name: student.name, email: student.email } })
  } catch (error) {
    console.error("Failed to add student:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
