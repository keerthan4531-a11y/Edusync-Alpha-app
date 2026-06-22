import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classroomId: string; announcementId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId, announcementId } = await params

    // Verify ownership of the classroom containing this announcement
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found or unauthorized" }, { status: 404 })
    }

    const announcement = await db.announcement.findFirst({
      where: { id: announcementId, classroomId },
    })

    if (!announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    await db.announcement.delete({
      where: { id: announcementId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete announcement:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
