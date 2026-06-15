import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const params = await context.params;
    const classroomId = params.id;

    // Verify student is enrolled
    const isEnrolled = await db.classroom.findFirst({
      where: {
        id: classroomId,
        students: {
          some: { id: userId }
        }
      }
    });

    if (!isEnrolled) {
      return NextResponse.json({ error: "Classroom not found or access denied" }, { status: 403 });
    }

    const assignments = await db.assignment.findMany({
      where: { classroomId },
      include: {
        submissions: {
          where: { studentId: userId }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const formatted = assignments.map(a => {
      const sub = a.submissions[0] || null;
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        due_date: a.dueDate,
        xp_reward: a.xpReward,
        coin_reward: a.coinReward,
        submission: sub ? {
          id: sub.id,
          code: sub.code,
          grade: sub.grade,
          feedback: sub.feedback,
          status: sub.status,
          created_at: sub.createdAt
        } : null
      };
    });

    return NextResponse.json({ assignments: formatted });
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 });
  }
}
