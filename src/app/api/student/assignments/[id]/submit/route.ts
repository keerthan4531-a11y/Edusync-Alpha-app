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
    const assignmentId = params.id;

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Code content is required" }, { status: 400 });
    }

    const assignment = await db.assignment.findUnique({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Upsert the submission (create if not exists, update if exists)
    const submission = await db.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: userId
        }
      },
      update: {
        code,
        status: "SUBMITTED",
        createdAt: new Date() // reset submission date
      },
      create: {
        assignmentId,
        studentId: userId,
        code,
        status: "SUBMITTED"
      }
    });

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Failed to submit assignment:", error);
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 });
  }
}
