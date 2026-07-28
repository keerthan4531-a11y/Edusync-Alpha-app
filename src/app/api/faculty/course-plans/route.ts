import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const plans = await (db as any).coursePlan.findMany({
    where: { facultyId: session.user.id },
    orderBy: { uploadedAt: "desc" },
  })
  return NextResponse.json(plans)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "FACULTY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const subject = formData.get("subject") as string
  const classGroup = formData.get("classGroup") as string
  const semester = Number(formData.get("semester") || 1)
  const academicYear = formData.get("academicYear") as string || "2025-2026"

  if (!file || !subject || !classGroup) {
    return NextResponse.json({ error: "file, subject and classGroup are required" }, { status: 400 })
  }
  if (!file.name.endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
  }

  const uploadDir = join(process.cwd(), "public", "uploads", "faculty-plans")
  await mkdir(uploadDir, { recursive: true })

  const safeName = `${session.user.id}_${Date.now()}_${file.name.replace(/\s/g, "_")}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadDir, safeName), buffer)

  const plan = await (db as any).coursePlan.create({
    data: {
      facultyId: session.user.id,
      subject,
      classGroup,
      semester,
      academicYear,
      fileName: file.name,
      fileUrl: `/uploads/faculty-plans/${safeName}`,
    },
  })
  return NextResponse.json(plan)
}
