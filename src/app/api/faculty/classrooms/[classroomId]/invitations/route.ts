import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId } = await params
    const { invitationId, action } = await req.json()

    if (!invitationId || !action) {
      return NextResponse.json({ error: "Invitation ID and Action are required." }, { status: 400 })
    }

    // Verify ownership
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    const invitation = await db.classroomInvitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation || invitation.classroomId !== classroomId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 })
    }

    if (action === "ACCEPT") {
      // Begin database transaction or sequential operations
      await db.classroomInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      })

      // Add student to classroom
      await db.classroom.update({
        where: { id: classroomId },
        data: {
          students: {
            connect: { id: invitation.studentId },
          },
        },
      })
    } else if (action === "REJECT") {
      await db.classroomInvitation.update({
        where: { id: invitationId },
        data: { status: "REJECTED" },
      })
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to update invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
