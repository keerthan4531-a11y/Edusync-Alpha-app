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
  const subject = searchParams.get("subject")
  const classGroup = searchParams.get("classGroup")
  const marks = await (db as any).internalMark.findMany({
    where: {
      facultyId: session.user.id,
      ...(subject ? { subject } : {}),
      ...(classGroup ? { classGroup } : {}),
    },
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(marks)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { studentId, subject, classGroup, examType, maxMark, scoredMark, remarks } = await req.json()
  if (!studentId || !subject || !classGroup || !examType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }
  const mark = await (db as any).internalMark.upsert({
    where: {
      facultyId_studentId_subject_examType: {
        facultyId: session.user.id,
        studentId,
        subject,
        examType,
      },
    },
    create: {
      facultyId: session.user.id,
      studentId,
      subject,
      classGroup,
      examType,
      maxMark: Number(maxMark || 100),
      scoredMark: Number(scoredMark || 0),
      remarks: remarks || null,
    },
    update: {
      scoredMark: Number(scoredMark || 0),
      maxMark: Number(maxMark || 100),
      remarks: remarks || null,
    },
  })
  return NextResponse.json(mark)
}
