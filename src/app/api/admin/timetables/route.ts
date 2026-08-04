import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const facultyId = searchParams.get("facultyId");
    const day = searchParams.get("day");
    const classGroup = searchParams.get("classGroup");

    const where: any = {};
    if (facultyId) where.facultyId = facultyId;
    if (day) where.dayOfWeek = day;
    if (classGroup) where.classGroup = classGroup;

    const slots = await (db as any).timetableSlot.findMany({
      where,
      include: { faculty: { select: { name: true, email: true } } },
      orderBy: [
        { dayOfWeek: "asc" },
        { periodNo: "asc" }
      ]
    });

    return NextResponse.json(slots);
  } catch (error: any) {
    console.error("Timetables GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { facultyId, dayOfWeek, periodNo, subject, classGroup, room, startTime, endTime } = body;

    const slot = await (db as any).timetableSlot.create({
      data: {
        facultyId,
        dayOfWeek,
        periodNo,
        subject,
        classGroup,
        room,
        startTime,
        endTime
      }
    });

    return NextResponse.json(slot);
  } catch (error: any) {
    console.error("Timetables POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, subject, classGroup, room, startTime, endTime } = body;

    const updateData: any = {};
    if (subject !== undefined) updateData.subject = subject;
    if (classGroup !== undefined) updateData.classGroup = classGroup;
    if (room !== undefined) updateData.room = room;
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;

    const slot = await (db as any).timetableSlot.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(slot);
  } catch (error: any) {
    console.error("Timetables PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await (db as any).timetableSlot.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Timetables DELETE Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
