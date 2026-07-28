import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

function generateCode(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len).toUpperCase()
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    let facultyId = session?.user?.id

    if (!facultyId) {
      const faculty = await db.user.findFirst({ where: { role: "FACULTY" } })
      facultyId = faculty?.id
    }

    if (!facultyId) {
      return NextResponse.json([])
    }

    const classrooms = await db.classroom.findMany({
      where: { facultyId },
      include: {
        _count: {
          select: { students: true, assignments: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(classrooms)
  } catch (e) {
    console.error("GET /api/classrooms error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    let facultyId = session?.user?.id

    if (!facultyId) {
      const faculty = await db.user.findFirst({ where: { role: "FACULTY" } })
      facultyId = faculty?.id
    }

    if (!facultyId) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 })
    }

    const { name, section } = await req.json()
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })

    // Ensure unique 6-char code
    let code = generateCode()
    let existing = await db.classroom.findUnique({ where: { code } })
    while (existing) {
      code = generateCode()
      existing = await db.classroom.findUnique({ where: { code } })
    }

    const classroom = await db.classroom.create({
      data: {
        name: section ? `${name} — ${section}` : name,
        code,
        facultyId,
      }
    })

    return NextResponse.json(classroom)
  } catch (e) {
    console.error("POST /api/classrooms error:", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
