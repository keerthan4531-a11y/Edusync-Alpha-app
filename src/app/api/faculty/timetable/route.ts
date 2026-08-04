import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const slots = await (db as any).timetableSlot.findMany({
    where: { facultyId: session.user.id, isActive: true },
    orderBy: [{ dayOfWeek: "asc" }, { periodNo: "asc" }],
  })
  return NextResponse.json(slots)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  const { dayOfWeek, periodNo, subject, classGroup, room, startTime, endTime } = body
  if (!dayOfWeek || !periodNo || !subject || !classGroup) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const slot = await (db as any).timetableSlot.upsert({
    where: {
      // no compound unique — just create or find by these fields
      id: body.id || "new",
    },
    create: {
      facultyId: session.user.id,
      dayOfWeek: Number(dayOfWeek),
      periodNo: Number(periodNo),
      subject,
      classGroup,
      room: room || "",
      startTime: startTime || "09:00",
      endTime: endTime || "09:50",
    },
    update: {
      subject,
      classGroup,
      room: room || "",
      startTime: startTime || "09:00",
      endTime: endTime || "09:50",
    },
  })
  return NextResponse.json(slot)
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const body = await req.json()
  const { id, subject, classGroup, room, startTime, endTime } = body
  if (!id) {
    return NextResponse.json({ error: "Missing slot id" }, { status: 400 })
  }
  const slot = await (db as any).timetableSlot.update({
    where: { id, facultyId: session.user.id },
    data: {
      ...(subject && { subject }),
      ...(classGroup && { classGroup }),
      room: room ?? "",
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
    },
  })
  return NextResponse.json(slot)
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "Missing slot id" }, { status: 400 })
  }
  await (db as any).timetableSlot.update({
    where: { id, facultyId: session.user.id },
    data: { isActive: false },
  })
  return NextResponse.json({ success: true })
}
