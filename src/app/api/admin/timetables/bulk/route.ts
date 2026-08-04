import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { slots } = body;

    if (!slots || !Array.isArray(slots)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    let created = 0;
    const errors: string[] = [];

    for (const s of slots) {
      try {
        const faculty = await db.user.findUnique({ where: { email: s.facultyEmail } });
        if (!faculty) {
          errors.push(`Faculty email ${s.facultyEmail} not found`);
          continue;
        }

        await (db as any).timetableSlot.create({
          data: {
            facultyId: faculty.id,
            dayOfWeek: s.dayOfWeek,
            periodNo: s.periodNo,
            subject: s.subject,
            classGroup: s.classGroup,
            room: s.room,
            startTime: s.startTime,
            endTime: s.endTime
          }
        });
        created++;
      } catch (err: any) {
        errors.push(`Failed to create slot for ${s.facultyEmail}: ${err.message}`);
      }
    }

    return NextResponse.json({ created, errors });
  } catch (error: any) {
    console.error("Bulk Timetables Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
