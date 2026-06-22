import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const submissions = await db.assignmentSubmission.findMany({
      where: {
        assignment: {
          classroom: {
            facultyId: session.user.id,
          },
        },
      },
      include: {
        assignment: {
          select: {
            id: true,
            title: true,
            xpReward: true,
            coinReward: true,
            classroom: {
              select: { id: true, name: true },
            },
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Failed to fetch submissions:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { submissionId, grade, feedback, status } = await req.json()

    if (!submissionId) {
      return NextResponse.json({ error: "Submission ID is required." }, { status: 400 })
    }
    if (grade === undefined || grade === null) {
      return NextResponse.json({ error: "Grade is required." }, { status: 400 })
    }

    // Find submission
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: true,
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found." }, { status: 404 })
    }

    // Verify ownership of the classroom containing this assignment
    const classroom = await db.classroom.findFirst({
      where: {
        id: submission.assignment.classroomId,
        facultyId: session.user.id,
      },
    })

    if (!classroom) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 })
    }

    const previousStatus = submission.status
    const targetStatus = status || "GRADED"

    // Update submission
    const updatedSubmission = await db.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        grade: Number(grade),
        feedback: feedback || "",
        status: targetStatus,
      },
    })

    // Award rewards if not already graded
    if (targetStatus === "GRADED" && previousStatus !== "GRADED") {
      await db.user.update({
        where: { id: submission.studentId },
        data: {
          xp: { increment: submission.assignment.xpReward },
          coins: { increment: submission.assignment.coinReward },
        },
      })
    }

    return NextResponse.json({ success: true, submission: updatedSubmission })
  } catch (error) {
    console.error("Failed to grade submission:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
