import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { status } = await req.json() // "ACCEPTED" or "REJECTED"
  if (!["ACCEPTED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "status must be ACCEPTED or REJECTED" }, { status: 400 })
  }

  // Find the substitution request assigned to this faculty
  const sub = await (db as any).substitutionRequest.findFirst({
    where: { id, substituteId: session.user.id },
    include: { leave: true },
  })
  if (!sub) return NextResponse.json({ error: "Substitution not found" }, { status: 404 })

  await (db as any).substitutionRequest.update({
    where: { id },
    data: { status, respondedAt: new Date() },
  })

  // Notify the leave requester
  await (db as any).notification.create({
    data: {
      userId: sub.leave.facultyId,
      type: "LEAVE_STATUS",
      title: `Substitution ${status === "ACCEPTED" ? "Accepted" : "Rejected"}`,
      message: `${session.user.name} has ${status === "ACCEPTED" ? "accepted" : "rejected"} the substitution for ${sub.date}.`,
      refId: sub.leaveId,
    },
  })

  // Check if all substitutions are accepted → notify HOD
  const allSubs = await (db as any).substitutionRequest.findMany({ where: { leaveId: sub.leaveId } })
  const allAccepted = allSubs.every((s: any) => s.status === "ACCEPTED")
  if (allAccepted) {
    // Update leave status to PENDING (awaiting HOD)
    await (db as any).leaveRequest.update({
      where: { id: sub.leaveId },
      data: { status: "PENDING" },
    })
    // Notify HOD
    const hod = await db.user.findFirst({ where: { role: "HOD" } })
    if (hod) {
      await (db as any).notification.create({
        data: {
          userId: hod.id,
          type: "HOD_ACTION",
          title: "Leave Request Pending Approval",
          message: `All substitutes have accepted. Faculty leave request from ${sub.leave.facultyId} awaits your approval.`,
          refId: sub.leaveId,
        },
      })
    }
  }

  return NextResponse.json({ success: true, status })
}
