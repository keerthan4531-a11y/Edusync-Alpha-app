import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classroomId: string; assignmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId, assignmentId } = await params

    // Verify ownership of the classroom containing this assignment
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found or unauthorized" }, { status: 404 })
    }

    const assignment = await db.assignment.findFirst({
      where: { id: assignmentId, classroomId },
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    await db.assignment.delete({
      where: { id: assignmentId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete assignment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
