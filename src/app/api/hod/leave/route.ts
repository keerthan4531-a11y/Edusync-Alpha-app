import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "HOD") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const leaves = await (db as any).leaveRequest.findMany({
    where: { status: "PENDING" },
    include: {
      faculty: { select: { id: true, name: true, email: true } },
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
