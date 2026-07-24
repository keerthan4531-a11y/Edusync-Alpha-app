import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Invalid class code" }, { status: 400 });
    }

    // Find classroom by code
    const classroom = await db.classroom.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        students: {
          where: { id: userId },
          select: { id: true }
        }
      }
    });

    if (!classroom) {
      return NextResponse.json({ error: "Classroom not found. Please check the code and try again." }, { status: 404 });
    }

    if (classroom.students.length > 0) {
      return NextResponse.json({ error: "You are already enrolled in this classroom." }, { status: 400 });
    }

    // Add student to classroom
    await db.classroom.update({
      where: { id: classroom.id },
      data: {
        students: {
          connect: { id: userId }
        }
      }
    });

    // Optionally update any pending invitations to ACCEPTED
    await db.classroomInvitation.updateMany({
      where: {
        classroomId: classroom.id,
        studentId: userId,
        status: "PENDING"
      },
      data: {
        status: "ACCEPTED"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to join classroom:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
