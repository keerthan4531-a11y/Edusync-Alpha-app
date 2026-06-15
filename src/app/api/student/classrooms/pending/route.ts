import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const pendingInvitations = await db.classroomInvitation.findMany({
      where: {
        studentId: userId,
        status: "PENDING"
      },
      include: {
        classroom: {
          include: {
            faculty: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = pendingInvitations.map(inv => ({
      request_id: inv.id,
      classroom_id: inv.classroomId,
      classroom_name: inv.classroom.name,
      classroom_code: inv.classroom.code,
      faculty_name: inv.classroom.faculty.name,
      faculty_email: inv.classroom.faculty.email,
      created_at: inv.createdAt
    }));

    return NextResponse.json({ pending_requests: formatted });
  } catch (error) {
    console.error("Failed to fetch pending invitations:", error);
    return NextResponse.json({ error: "Failed to fetch invitations" }, { status: 500 });
  }
}
