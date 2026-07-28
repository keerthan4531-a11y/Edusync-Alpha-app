import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { searchParams } = new URL(req.url)
  const studentId = searchParams.get("studentId")
  const sessions = await (db as any).counselingSession.findMany({
    where: { facultyId: session.user.id, ...(studentId ? { studentId } : {}) },
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { studentId, summary, sessionType, nextAction } = await req.json()
  if (!studentId || !summary) {
    return NextResponse.json({ error: "studentId and summary are required" }, { status: 400 })
  }
  const entry = await (db as any).counselingSession.create({
    data: {
      facultyId: session.user.id,
      studentId,
      summary,
      sessionType: sessionType || "GENERAL",
      nextAction: nextAction || null,
    },
    include: { student: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(entry)
}
