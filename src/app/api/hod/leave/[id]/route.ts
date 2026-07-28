import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await params
  const { action, hodRemark } = await req.json() // action: "APPROVED" | "REJECTED"
  if (!["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "action must be APPROVED or REJECTED" }, { status: 400 })
  }

  const leave = await (db as any).leaveRequest.update({
    where: { id },
    data: { status: action, hodRemark: hodRemark || null, reviewedAt: new Date() },
  })

  // Notify the faculty member
  await (db as any).notification.create({
    data: {
      userId: leave.facultyId,
      type: "HOD_ACTION",
      title: `Leave ${action === "APPROVED" ? "Approved" : "Rejected"} by HOD`,
      message: hodRemark
        ? `Your leave request has been ${action.toLowerCase()} by HOD. Remark: ${hodRemark}`
        : `Your leave request has been ${action.toLowerCase()} by HOD.`,
      refId: leave.id,
    },
  })

  return NextResponse.json({ success: true, status: action })
}
