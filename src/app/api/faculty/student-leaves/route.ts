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
  // Class incharge sees leave requests for students in classes assigned to them (via timetable)
  // We'll fetch all student leave requests assigned to this faculty as classInchargeId,
  // plus PENDING ones not yet assigned (so incharge can claim them)
  const leaves = await (db as any).studentLeaveRequest.findMany({
    where: {
      OR: [
        { classInchargeId: session.user.id },
        { classInchargeId: null, status: "PENDING" },
      ]
    },
    include: {
      student: { select: { id: true, name: true, email: true, studentProfile: { select: { rollNumber: true, batch: true, semester: true } } } },
    },
    orderBy: { appliedAt: "desc" },
  })
  return NextResponse.json(leaves)
}
