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
  // Get all other faculty members who can act as substitutes
  const colleagues = await db.user.findMany({
    where: { role: "FACULTY", id: { not: session.user.id } },
    select: { id: true, name: true, email: true },
  })
  return NextResponse.json(colleagues)
}
