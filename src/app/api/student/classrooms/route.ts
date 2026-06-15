import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const enrolledClassrooms = await db.classroom.findMany({
      where: {
        students: {
          some: { id: userId }
        }
      },
      include: {
        faculty: {
          select: { name: true, email: true }
        },
        _count: {
          select: { students: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = enrolledClassrooms.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      faculty_name: c.faculty.name,
      faculty_email: c.faculty.email,
      student_count: c._count.students
    }));

    return NextResponse.json({ classrooms: formatted });
  } catch (error) {
    console.error("Failed to fetch classrooms:", error);
    return NextResponse.json({ error: "Failed to fetch classrooms" }, { status: 500 });
  }
}
