import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const params = await context.params;
    const identifier = params.id; // Could be submissionId or assignmentId

    // 1. Try treating it as a submission ID
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: identifier }
    });

    if (submission) {
      if (submission.studentId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      await db.assignmentSubmission.delete({
        where: { id: identifier }
      });
      return NextResponse.json({ success: true, message: "Submission retracted" });
    }

    // 2. Fallback: Treat as assignment ID and delete by assignmentId + studentId
    const subByAssignment = await db.assignmentSubmission.findFirst({
      where: {
        assignmentId: identifier,
        studentId: userId
      }
    });

    if (subByAssignment) {
      await db.assignmentSubmission.delete({
        where: { id: subByAssignment.id }
      });
      return NextResponse.json({ success: true, message: "Submission retracted" });
    }

    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to unsubmit assignment:", error);
    return NextResponse.json({ error: "Failed to retract submission" }, { status: 500 });
  }
}
