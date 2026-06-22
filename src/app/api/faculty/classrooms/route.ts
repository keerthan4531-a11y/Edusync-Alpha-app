import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const classrooms = await db.classroom.findMany({
      where: { facultyId: session.user.id },
      include: {
        students: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { students: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ classrooms })
  } catch (error) {
    console.error("Failed to fetch classrooms:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || session.user.role !== "FACULTY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name } = await req.json()
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Classroom name is required." }, { status: 400 })
    }

    // Generate unique 6-character uppercase code
    let code = ""
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const existing = await db.classroom.findUnique({ where: { code } })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Failed to generate unique classroom code." }, { status: 500 })
    }

    const classroom = await db.classroom.create({
      data: {
        name,
        code,
        facultyId: session.user.id,
      },
    })

    return NextResponse.json({ classroom })
  } catch (error) {
    console.error("Failed to create classroom:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
