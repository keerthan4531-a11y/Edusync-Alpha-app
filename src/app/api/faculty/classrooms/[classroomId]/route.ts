import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId } = await params

    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
      include: {
        students: {
          select: { id: true, name: true, email: true, xp: true, level: true },
        },
        announcements: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          include: {
            submissions: {
              select: { id: true, studentId: true, status: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        invitations: {
          where: { status: "PENDING" },
          include: {
            student: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    return NextResponse.json({ classroom })
  } catch (error) {
    console.error("Failed to fetch classroom details:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ classroomId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { classroomId } = await params

    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    await db.classroom.delete({
      where: { id: classroomId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete classroom:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
