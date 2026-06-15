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
    const invitationId = params.id;

    const invitation = await db.classroomInvitation.findUnique({
      where: { id: invitationId },
      include: { classroom: true }
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.studentId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action } = await req.json();
    if (action !== "accept" && action !== "reject") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "accept") {
      // Update invitation status
      await db.classroomInvitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" }
      });

      // Enroll student in classroom
      await db.classroom.update({
        where: { id: invitation.classroomId },
        data: {
          students: {
            connect: { id: userId }
          }
        }
      });

      return NextResponse.json({ success: true, message: "Invitation accepted" });
    } else {
      // Update invitation status to REJECTED
      await db.classroomInvitation.update({
        where: { id: invitationId },
        data: { status: "REJECTED" }
      });

      return NextResponse.json({ success: true, message: "Invitation rejected" });
    }
  } catch (error) {
    console.error("Failed to respond to invitation:", error);
    return NextResponse.json({ error: "Failed to respond to invitation" }, { status: 500 });
  }
}
