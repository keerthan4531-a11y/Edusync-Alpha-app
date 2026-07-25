import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    let userId = session.user.id;
    if (userId) {
      const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!userExists && session.user.email) {
        const userByEmail = await db.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
        if (userByEmail) userId = userByEmail.id;
      }
    } else if (session.user.email) {
      const userByEmail = await db.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
      if (userByEmail) userId = userByEmail.id;
    }

    if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

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
