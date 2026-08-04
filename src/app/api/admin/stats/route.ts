import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalStudents = await db.user.count({ where: { role: "STUDENT" } });
    const totalFaculty = await db.user.count({ where: { role: "FACULTY" } });
    const totalAdmins = await db.user.count({ where: { role: "ADMIN" } });
    
    const totalDepartments = await (db as any).department.count();
    const totalClasses = await (db as any).class.count();
    const totalTimetableSlots = await (db as any).timetableSlot.count({ where: { isActive: true } });
    const totalAttendanceRecords = await (db as any).attendanceRecord.count();
    
    const recentUsers = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    return NextResponse.json({
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalDepartments,
      totalClasses,
      totalTimetableSlots,
      totalAttendanceRecords,
      recentUsers
    });
  } catch (error: any) {
    console.error("Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
