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

    const announcements = await db.announcement.findMany({
      where: { classroomId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}
