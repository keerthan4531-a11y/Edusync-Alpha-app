import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { action, inchargeRemark } = await req.json()
  if (!["APPROVED", "REJECTED", "FORWARDED_TO_HOD"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const leave = await (db as any).studentLeaveRequest.update({
    where: { id },
    data: {
      status: action,
      classInchargeId: session.user.id,
      inchargeRemark: inchargeRemark || null,
      reviewedAt: new Date(),
    },
    include: { student: { select: { id: true, name: true } } },
  })

  // Notify student
  await (db as any).notification.create({
    data: {
      userId: leave.student.id,
      type: "STUDENT_LEAVE",
      title: `Leave ${action === "APPROVED" ? "Approved" : action === "REJECTED" ? "Rejected" : "Forwarded to HOD"}`,
      message: inchargeRemark
        ? `Your leave request has been ${action.toLowerCase().replace("_", " ")} by your class incharge. Remark: ${inchargeRemark}`
        : `Your leave request has been ${action.toLowerCase().replace("_", " ")} by your class incharge.`,
      refId: leave.id,
    },
  })

  // If forwarded to HOD, notify HOD
  if (action === "FORWARDED_TO_HOD") {
    const hod = await db.user.findFirst({ where: { role: "HOD" } })
    if (hod) {
      await (db as any).notification.create({
        data: {
          userId: hod.id,
          type: "STUDENT_LEAVE",
          title: "Student Leave Forwarded for Approval",
          message: `Class incharge has forwarded ${leave.student.name}'s leave request for your approval.`,
          refId: leave.id,
        },
      })
    }
  }

  return NextResponse.json({ success: true, status: action })
}
