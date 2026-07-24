import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string, subId: string }> }) {
  const { subId } = await params
  try {
    const { grade, feedback } = await req.json()
    
    if (grade === undefined) {
      return NextResponse.json({ error: "Grade is required" }, { status: 400 })
    }

    const submission = await db.assignmentSubmission.update({
      where: { id: subId },
      data: {
        grade: parseInt(grade),
        feedback: feedback?.trim() || null,
        status: "GRADED"
      }
    })
    
    return NextResponse.json(submission)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
