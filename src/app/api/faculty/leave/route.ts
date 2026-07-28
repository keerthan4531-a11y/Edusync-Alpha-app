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
  const leaves = await (db as any).leaveRequest.findMany({
    where: { facultyId: session.user.id },
    include: {
      substitutions: {
        include: {
          slot: true,
          substitute: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  })
  return NextResponse.json(leaves)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { leaveType, fromDate, toDate, reason, substitutions } = await req.json()
  // substitutions: Array<{ slotId, date, substituteId }>
  if (!leaveType || !fromDate || !toDate || !reason) {
    return NextResponse.json({ error: "leaveType, fromDate, toDate and reason are required" }, { status: 400 })
  }

  const leave = await (db as any).leaveRequest.create({
    data: {
      facultyId: session.user.id,
      leaveType,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      status: substitutions?.length > 0 ? "SUB_PENDING" : "PENDING",
      substitutions: substitutions?.length > 0 ? {
        create: substitutions.map((s: any) => ({
          slotId: s.slotId,
          date: s.date,
          substituteId: s.substituteId,
          status: "PENDING",
        })),
      } : undefined,
    },
    include: { substitutions: true },
  })

  // Create notification for each substitute
  if (substitutions?.length > 0) {
    await Promise.all(
      substitutions.map((s: any) =>
        (db as any).notification.create({
          data: {
            userId: s.substituteId,
            type: "SUBSTITUTION_REQUEST",
            title: "Substitution Request",
            message: `${session.user.name} has requested you to substitute their class on ${s.date}.`,
            refId: leave.id,
          },
        })
      )
    )
  }

  return NextResponse.json(leave)
}
