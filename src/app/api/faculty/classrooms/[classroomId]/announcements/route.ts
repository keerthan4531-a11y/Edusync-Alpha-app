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
    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: "Announcement content is required." }, { status: 400 })
    }

    // Verify ownership
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    const announcement = await db.announcement.create({
      data: {
        classroomId,
        content,
      },
    })

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error("Failed to create announcement:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
