import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 })

    const student = await db.user.findUnique({ where: { email } })
    if (!student) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Check if already in classroom or already invited
    const existingInvite = await db.classroomInvitation.findUnique({
      where: {
        classroomId_studentId: {
          classroomId: id,
          studentId: student.id
        }
      }
    })

    if (existingInvite) {
      return NextResponse.json({ error: "Already invited or enrolled" }, { status: 400 })
    }

    const invite = await db.classroomInvitation.create({
      data: {
        classroomId: id,
        studentId: student.id,
        status: "PENDING"
      }
    })
    
    return NextResponse.json(invite)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
