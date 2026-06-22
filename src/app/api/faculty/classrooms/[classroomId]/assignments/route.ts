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
    const { title, description, dueDate, xpReward, coinReward } = await req.json()

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Assignment title is required." }, { status: 400 })
    }
    if (!dueDate) {
      return NextResponse.json({ error: "Due date is required." }, { status: 400 })
    }

    // Verify ownership
    const classroom = await db.classroom.findFirst({
      where: { id: classroomId, facultyId: session.user.id },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found" }, { status: 404 })
    }

    const assignment = await db.assignment.create({
      data: {
        classroomId,
        title,
        description: description || "",
        dueDate: new Date(dueDate),
        xpReward: Number(xpReward) || 75,
        coinReward: Number(coinReward) || 50,
      },
    })

    return NextResponse.json({ assignment })
  } catch (error) {
    console.error("Failed to create assignment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
